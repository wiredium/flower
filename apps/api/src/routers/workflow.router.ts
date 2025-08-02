import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { TRPCError } from '@trpc/server'
import { workflowService } from '../services/workflow.service'
import { prisma } from '@repo/database'
import type { WorkflowExecutionContext } from '@repo/types'
import {
  workflowDataSchema,
  executeWorkflowSchema,
  cancelExecutionSchema,
} from '@repo/types'

export const workflowRouter = router({
  // Execute a workflow
  execute: protectedProcedure
    .input(executeWorkflowSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            { ownerId: ctx.user!.id },
            {
              collaborators: {
                some: {
                  userId: ctx.user!.id,
                  role: { in: ['owner', 'editor'] },
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found or access denied',
        })
      }

      // Parse workflow data
      let workflowData
      try {
        workflowData = typeof project.workflowData === 'string' 
          ? JSON.parse(project.workflowData)
          : project.workflowData
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid workflow data in project',
        })
      }

      // Create execution context
      const context: WorkflowExecutionContext = {
        projectId: input.projectId,
        userId: ctx.user!.id,
        variables: input.variables || {},
        results: {},
        executionPath: [],
      }

      try {
        // Execute workflow
        const result = await workflowService.executeWorkflow(workflowData, context)

        return {
          success: true,
          result,
        }
      } catch (error) {
        console.error('Workflow execution error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Workflow execution failed',
        })
      }
    }),

  // Get execution status
  getExecutionStatus: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const execution = await prisma.workflowExecution.findFirst({
        where: {
          id: input.executionId,
          project: {
            OR: [
              { ownerId: ctx.user!.id },
              {
                collaborators: {
                  some: {
                    userId: ctx.user!.id,
                  },
                },
              },
            ],
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!execution) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Execution not found',
        })
      }

      return execution
    }),

  // List executions for a project
  listExecutions: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        status: z
          .enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'ALL'])
          .optional()
          .default('ALL'),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify project access
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            { ownerId: ctx.user!.id },
            {
              collaborators: {
                some: {
                  userId: ctx.user!.id,
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found or access denied',
        })
      }

      const where: any = { projectId: input.projectId }
      if (input.status !== 'ALL') {
        where.status = input.status
      }

      const [executions, total] = await Promise.all([
        prisma.workflowExecution.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          skip: input.offset,
          take: input.limit,
        }),
        prisma.workflowExecution.count({ where }),
      ])

      return {
        executions,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Cancel an execution
  cancel: protectedProcedure
    .input(cancelExecutionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const execution = await prisma.workflowExecution.findFirst({
        where: {
          id: input.executionId,
          project: {
            OR: [
              { ownerId: ctx.user!.id },
              {
                collaborators: {
                  some: {
                    userId: ctx.user!.id,
                    role: { in: ['owner', 'editor'] },
                  },
                },
              },
            ],
          },
        },
      })

      if (!execution) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Execution not found or access denied',
        })
      }

      if (execution.status !== 'RUNNING' && execution.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only cancel running or pending executions',
        })
      }

      const cancelled = await workflowService.cancelExecution(input.executionId)

      return {
        success: true,
        execution: cancelled,
      }
    }),

  // Validate workflow
  validate: protectedProcedure
    .input(
      z.object({
        workflowData: workflowDataSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use the workflow service's validation
        const service = workflowService as any
        service.validateWorkflow(input.workflowData)

        return {
          valid: true,
          errors: [],
        }
      } catch (error) {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : 'Invalid workflow'],
        }
      }
    }),

  // Get workflow statistics
  getStatistics: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify project access
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            { ownerId: ctx.user!.id },
            {
              collaborators: {
                some: {
                  userId: ctx.user!.id,
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found or access denied',
        })
      }

      // Get execution statistics
      const [totalExecutions, successfulExecutions, failedExecutions, avgDuration] = await Promise.all([
        prisma.workflowExecution.count({
          where: { projectId: input.projectId },
        }),
        prisma.workflowExecution.count({
          where: { projectId: input.projectId, status: 'COMPLETED' },
        }),
        prisma.workflowExecution.count({
          where: { projectId: input.projectId, status: 'FAILED' },
        }),
        prisma.$queryRaw<Array<{ avg: number }>>`
          SELECT AVG(EXTRACT(EPOCH FROM ("completedAt" - "startedAt"))) as avg
          FROM "WorkflowExecution"
          WHERE "projectId" = ${input.projectId}
          AND "completedAt" IS NOT NULL
        `,
      ])

      const successRate = totalExecutions > 0 
        ? (successfulExecutions / totalExecutions) * 100 
        : 0

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate,
        averageDuration: avgDuration[0]?.avg || 0,
      }
    }),

  // Get execution logs
  getExecutionLogs: protectedProcedure
    .input(z.object({ executionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const execution = await prisma.workflowExecution.findFirst({
        where: {
          id: input.executionId,
          project: {
            OR: [
              { ownerId: ctx.user!.id },
              {
                collaborators: {
                  some: {
                    userId: ctx.user!.id,
                  },
                },
              },
            ],
          },
        },
        select: {
          id: true,
          logs: true,
          status: true,
          startedAt: true,
          completedAt: true,
        },
      })

      if (!execution) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Execution not found',
        })
      }

      return execution
    }),

  // Update workflow data
  updateWorkflow: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        workflowData: workflowDataSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            { ownerId: ctx.user!.id },
            {
              collaborators: {
                some: {
                  userId: ctx.user!.id,
                  role: { in: ['owner', 'editor'] },
                },
              },
            },
          ],
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found or access denied',
        })
      }

      // Validate workflow before saving
      try {
        const service = workflowService as any
        service.validateWorkflow(input.workflowData)
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Invalid workflow',
        })
      }

      // Update project with new workflow
      const updated = await prisma.project.update({
        where: { id: input.projectId },
        data: {
          workflowData: input.workflowData as any,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        project: updated,
      }
    }),
})