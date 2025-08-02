import { z } from 'zod'
import { router, protectedProcedure } from '../lib/trpc'
import { TRPCError } from '@trpc/server'
import { 
  createProjectSchema,
  updateProjectSchema,
  addCollaboratorSchema,
  paginationSchema 
} from '@repo/types'

export const projectRouter = router({
  // Create a new project
  create: protectedProcedure
    .input(createProjectSchema)
    .mutation(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.create({
        data: {
          ...input,
          ownerId: ctx.user!.id,
          workflowData: {}, // Empty workflow initially
        },
        include: {
          owner: true,
          template: true,
        },
      })

      return project
    }),

  // Get all user's projects
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'ALL']).default('ALL'),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where = {
        OR: [
          { ownerId: ctx.user!.id },
          {
            collaborators: {
              some: { userId: ctx.user!.id },
            },
          },
        ],
        ...(input.status !== 'ALL' && { status: input.status }),
      }

      const [projects, total] = await Promise.all([
        ctx.prisma.project.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { updatedAt: 'desc' },
          include: {
            owner: true,
            collaborators: {
              include: { user: true },
            },
            _count: {
              select: {
                executions: true,
                aiGenerations: true,
              },
            },
          },
        }),
        ctx.prisma.project.count({ where }),
      ])

      return {
        projects,
        total,
        hasMore: input.offset + projects.length < total,
      }
    }),

  // Get a single project
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          OR: [
            { ownerId: ctx.user!.id },
            {
              collaborators: {
                some: { userId: ctx.user!.id },
              },
            },
          ],
        },
        include: {
          owner: true,
          collaborators: {
            include: { user: true },
          },
          template: true,
          onboardingSession: true,
          executions: {
            take: 5,
            orderBy: { startedAt: 'desc' },
          },
          aiGenerations: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found',
        })
      }

      return project
    }),

  // Update a project
  update: protectedProcedure
    .input(updateProjectSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission
      const existing = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
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

      if (!existing) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this project',
        })
      }

      const { id, ...data } = input
      const updated = await ctx.prisma.project.update({
        where: { id },
        data,
        include: {
          owner: true,
          collaborators: {
            include: { user: true },
          },
        },
      })

      return updated
    }),

  // Delete a project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Only owner can delete
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.user!.id,
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this project',
        })
      }

      await ctx.prisma.project.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Add collaborator
  addCollaborator: protectedProcedure
    .input(addCollaboratorSchema)
    .mutation(async ({ input, ctx }) => {
      // Check if user is owner
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          ownerId: ctx.user!.id,
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project owner can add collaborators',
        })
      }

      // Find user by email
      const userToAdd = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!userToAdd) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Check if already collaborator
      const existing = await ctx.prisma.projectCollaborator.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: userToAdd.id,
          },
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a collaborator',
        })
      }

      // Add collaborator
      const collaborator = await ctx.prisma.projectCollaborator.create({
        data: {
          projectId: input.projectId,
          userId: userToAdd.id,
          role: input.role,
        },
        include: {
          user: true,
        },
      })

      return collaborator
    }),

  // Remove collaborator
  removeCollaborator: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is owner
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          ownerId: ctx.user!.id,
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only project owner can remove collaborators',
        })
      }

      await ctx.prisma.projectCollaborator.delete({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
      })

      return { success: true }
    }),
})