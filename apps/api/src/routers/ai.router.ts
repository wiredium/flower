import { router, publicProcedure, protectedProcedure } from '../lib/trpc.js'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { OpenRouterService } from '../services/openrouter.service.js'
import { prisma } from '@repo/database'
import type { AITaskType, AIUsageStats, CostEstimate } from '@repo/types'
import {
  generateSchema,
  estimateCostSchema,
  rateGenerationSchema,
  generateWorkflowSchema,
  paginationSchema
} from '@repo/types'

const openRouterService = new OpenRouterService()

export const aiRouter = router({
  // Generate content using AI
  generate: protectedProcedure
    .input(generateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user!.id },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Check if user has enough credits
      if (user.credits <= 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Insufficient credits',
        })
      }

      try {
        const response = await openRouterService.generate(
          input.taskType,
          input.prompt,
          {
            ...input.options,
            userId: ctx.user!.id,
          }
        )

        return {
          success: true,
          content: response,
          remainingCredits: user.credits,
        }
      } catch (error) {
        console.error('AI generation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate content',
        })
      }
    }),

  // Get cost estimate for generation
  estimateCost: protectedProcedure
    .input(estimateCostSchema)
    .query(async ({ input }): Promise<CostEstimate> => {
      try {
        const estimate = await openRouterService.estimateCost(
          input.taskType,
          input.prompt,
          input.maxTokens
        )

        return estimate
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to estimate cost',
        })
      }
    }),

  // Get available models
  getModels: publicProcedure.query(async () => {
    return openRouterService.getAvailableModels()
  }),

  // Get user's AI usage statistics
  getUsageStats: protectedProcedure.query(async ({ ctx }): Promise<AIUsageStats> => {
    const [user, generations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: ctx.user!.id },
      }),
      prisma.aIGeneration.findMany({
        where: { userId: ctx.user!.id },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Calculate statistics
    const totalGenerations = generations.length
    const totalCost = generations.reduce((sum, gen) => sum + gen.cost.toNumber(), 0)
    const totalTokens = generations.reduce(
      (sum, gen) => sum + gen.inputTokens + gen.outputTokens,
      0
    )
    const averageLatency =
      generations.length > 0
        ? generations.reduce((sum, gen) => sum + gen.latency, 0) / generations.length
        : 0

    // Get most used models
    const modelUsage = generations.reduce((acc, gen) => {
      if (!acc[gen.model]) {
        acc[gen.model] = { count: 0, totalCost: 0 }
      }
      acc[gen.model]!.count++
      acc[gen.model]!.totalCost += gen.cost.toNumber()
      return acc
    }, {} as Record<string, { count: number; totalCost: number }>)

    const mostUsedModels = Object.entries(modelUsage)
      .map(([model, data]) => ({
        model,
        count: data.count,
        totalCost: data.totalCost,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalGenerations,
      totalCost,
      totalTokens,
      averageLatency,
      creditBalance: user.credits,
      mostUsedModels,
    }
  }),

  // Get generation history
  getHistory: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        taskType: z
          .enum([
            'code-generation',
            'documentation',
            'simple-tasks',
            'analysis',
            'creative'
          ] as const)
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { userId: ctx.user!.id }

      if (input.projectId) {
        where.projectId = input.projectId
      }

      if (input.taskType) {
        where.taskType = input.taskType
      }

      const [generations, total] = await Promise.all([
        prisma.aIGeneration.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: input.offset,
          take: input.limit,
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.aIGeneration.count({ where }),
      ])

      return {
        generations,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Rate generation quality (for model performance tracking)
  rateGeneration: protectedProcedure
    .input(rateGenerationSchema)
    .mutation(async ({ ctx, input }) => {
      const generation = await prisma.aIGeneration.findFirst({
        where: {
          id: input.generationId,
          userId: ctx.user!.id,
        },
      })

      if (!generation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Generation not found',
        })
      }

      const updated = await prisma.aIGeneration.update({
        where: { id: input.generationId },
        data: { quality: input.quality },
      })

      // Update model performance statistics
      await openRouterService.updateModelPerformance(
        generation.model,
        generation.taskType,
        {
          quality: input.quality,
          latency: generation.latency,
          cost: generation.cost.toNumber(),
        }
      )

      return updated
    }),

  // Generate workflow from natural language
  generateWorkflow: protectedProcedure
    .input(generateWorkflowSchema)
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

      // Create specialized prompt for workflow generation
      const prompt = `Generate a ReactFlow workflow based on the following description:

Description: ${input.description}
Complexity Level: ${input.complexity}

Requirements:
1. Create appropriate nodes (start, task, decision, integration, ai, loop, parallel, end)
2. Define logical connections between nodes
3. Include clear labels and descriptions
4. Add configuration data where needed
5. Ensure the workflow is executable and makes sense

Return a valid JSON structure with:
- nodes: Array of workflow nodes with id, type, position, and data
- edges: Array of connections between nodes
- metadata: Object with title, description, and estimated execution time`

      try {
        const response = await openRouterService.generate(
          'code-generation' as AITaskType,
          prompt,
          {
            temperature: 0.7,
            maxTokens: 2000,
            userId: ctx.user!.id,
            projectId: input.projectId,
          }
        )

        // Parse and validate the generated workflow
        let workflowData
        try {
          workflowData = JSON.parse(response)
        } catch {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to parse generated workflow',
          })
        }

        // Update project with generated workflow
        const updatedProject = await prisma.project.update({
          where: { id: input.projectId },
          data: {
            workflowData,
            updatedAt: new Date(),
          },
        })

        return {
          success: true,
          workflow: workflowData,
          project: updatedProject,
        }
      } catch (error) {
        console.error('Workflow generation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate workflow',
        })
      }
    }),

  // Purchase credits
  purchaseCredits: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(100).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, integrate with payment provider (Stripe, etc.)
      // For now, just add credits directly
      const user = await prisma.user.update({
        where: { id: ctx.user!.id },
        data: {
          credits: {
            increment: input.amount,
          },
        },
      })

      return {
        success: true,
        newBalance: user.credits,
      }
    }),
})