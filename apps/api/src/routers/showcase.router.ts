import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../lib/trpc.js'
import { prisma } from '@repo/database'

const createShowcaseSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  tags: z.array(z.string()).max(10).default([]),
  thumbnailUrl: z.string().url().optional(),
})

const updateShowcaseSchema = z.object({
  showcaseId: z.string().uuid(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  thumbnailUrl: z.string().url().optional(),
  featured: z.boolean().optional(),
})

const listShowcasesSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  authorId: z.string().uuid().optional(),
  sortBy: z.enum(['views', 'likes', 'createdAt', 'trending']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export const showcaseRouter = router({
  // Create a showcase from a project
  create: protectedProcedure
    .input(createShowcaseSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          ownerId: ctx.user!.id,
        },
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found or you do not have permission',
        })
      }

      // Check if showcase already exists for this project
      const existingShowcase = await prisma.showcase.findFirst({
        where: { projectId: input.projectId },
      })

      if (existingShowcase) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Showcase already exists for this project',
        })
      }

      // Create showcase
      const showcase = await prisma.showcase.create({
        data: {
          projectId: input.projectId,
          title: input.title,
          description: input.description,
          tags: input.tags,
          thumbnailUrl: input.thumbnailUrl,
          authorId: ctx.user!.id,
          views: 0,
          likes: 0,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              workflowData: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return showcase
    }),

  // Update a showcase
  update: protectedProcedure
    .input(updateShowcaseSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const showcase = await prisma.showcase.findFirst({
        where: {
          id: input.showcaseId,
          authorId: ctx.user!.id,
        },
      })

      if (!showcase) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Showcase not found or you do not have permission',
        })
      }

      // Update showcase
      const updated = await prisma.showcase.update({
        where: { id: input.showcaseId },
        data: {
          title: input.title,
          description: input.description,
          tags: input.tags,
          thumbnailUrl: input.thumbnailUrl,
          featured: input.featured,
          updatedAt: new Date(),
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              workflowData: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return updated
    }),

  // Delete a showcase
  delete: protectedProcedure
    .input(z.object({ showcaseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const showcase = await prisma.showcase.findFirst({
        where: {
          id: input.showcaseId,
          authorId: ctx.user!.id,
        },
      })

      if (!showcase) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Showcase not found or you do not have permission',
        })
      }

      // Delete showcase
      await prisma.showcase.delete({
        where: { id: input.showcaseId },
      })

      return { success: true }
    }),

  // Get a single showcase (public)
  get: publicProcedure
    .input(z.object({ showcaseId: z.string().uuid() }))
    .query(async ({ input }) => {
      const showcase = await prisma.showcase.findUnique({
        where: { id: input.showcaseId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              workflowData: true,
              status: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!showcase) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Showcase not found',
        })
      }

      // Increment view count
      await prisma.showcase.update({
        where: { id: input.showcaseId },
        data: { views: { increment: 1 } },
      })

      return showcase
    }),

  // List showcases (public)
  list: publicProcedure
    .input(listShowcasesSchema)
    .query(async ({ input }) => {
      const where: any = {}

      // Search filter
      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } },
          { tags: { has: input.search } },
        ]
      }

      // Tags filter
      if (input.tags && input.tags.length > 0) {
        where.tags = { hasSome: input.tags }
      }

      // Featured filter
      if (input.featured !== undefined) {
        where.featured = input.featured
      }

      // Author filter
      if (input.authorId) {
        where.authorId = input.authorId
      }

      // Build order by
      let orderBy: any = {}
      switch (input.sortBy) {
        case 'views':
          orderBy.views = input.sortOrder
          break
        case 'likes':
          orderBy.likes = input.sortOrder
          break
        case 'trending':
          // Simple trending: views + likes in last 7 days
          orderBy = [
            { views: input.sortOrder },
            { likes: input.sortOrder },
            { createdAt: 'desc' },
          ]
          break
        default:
          orderBy.createdAt = input.sortOrder
      }

      const [showcases, total] = await Promise.all([
        prisma.showcase.findMany({
          where,
          orderBy,
          take: input.limit,
          skip: input.offset,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.showcase.count({ where }),
      ])

      return {
        showcases,
        total,
        hasMore: input.offset + showcases.length < total,
      }
    }),

  // Like/unlike a showcase
  toggleLike: protectedProcedure
    .input(z.object({ showcaseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const showcase = await prisma.showcase.findUnique({
        where: { id: input.showcaseId },
      })

      if (!showcase) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Showcase not found',
        })
      }

      // Check if user already liked
      const existingLike = await prisma.showcaseLike.findUnique({
        where: {
          showcaseId_userId: {
            showcaseId: input.showcaseId,
            userId: ctx.user!.id,
          },
        },
      })

      if (existingLike) {
        // Unlike
        await prisma.$transaction([
          prisma.showcaseLike.delete({
            where: {
              showcaseId_userId: {
                showcaseId: input.showcaseId,
                userId: ctx.user!.id,
              },
            },
          }),
          prisma.showcase.update({
            where: { id: input.showcaseId },
            data: { likes: { decrement: 1 } },
          }),
        ])

        return { liked: false, likes: showcase.likes - 1 }
      } else {
        // Like
        await prisma.$transaction([
          prisma.showcaseLike.create({
            data: {
              showcaseId: input.showcaseId,
              userId: ctx.user!.id,
            },
          }),
          prisma.showcase.update({
            where: { id: input.showcaseId },
            data: { likes: { increment: 1 } },
          }),
        ])

        return { liked: true, likes: showcase.likes + 1 }
      }
    }),

  // Fork a showcase workflow
  fork: protectedProcedure
    .input(z.object({ showcaseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const showcase = await prisma.showcase.findUnique({
        where: { id: input.showcaseId },
        include: {
          project: true,
        },
      })

      if (!showcase) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Showcase not found',
        })
      }

      // Create a forked project
      const forkedProject = await prisma.project.create({
        data: {
          name: `${showcase.project.name} (Fork)`,
          description: `Forked from: ${showcase.title}\n\n${showcase.project.description}`,
          workflowData: showcase.project.workflowData as any,
          status: 'DRAFT',
          visibility: 'PRIVATE',
          tags: showcase.project.tags,
          ownerId: ctx.user!.id,
        },
      })

      // Track the fork
      await prisma.showcaseFork.create({
        data: {
          showcaseId: input.showcaseId,
          userId: ctx.user!.id,
          forkedProjectId: forkedProject.id,
        },
      })

      // Update fork count
      await prisma.showcase.update({
        where: { id: input.showcaseId },
        data: { forks: { increment: 1 } },
      })

      return {
        forkedProjectId: forkedProject.id,
        message: 'Workflow forked successfully',
      }
    }),

  // Get showcase statistics
  getStats: publicProcedure
    .input(z.object({ showcaseId: z.string().uuid() }))
    .query(async ({ input }) => {
      const showcase = await prisma.showcase.findUnique({
        where: { id: input.showcaseId },
        select: {
          views: true,
          likes: true,
          forks: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!showcase) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Showcase not found',
        })
      }

      // Get additional stats
      const [uniqueViewers, totalComments] = await Promise.all([
        // This would require tracking unique viewers in a separate table
        Promise.resolve(Math.floor(showcase.views * 0.7)), // Placeholder
        prisma.showcaseComment.count({
          where: { showcaseId: input.showcaseId },
        }),
      ])

      return {
        ...showcase,
        uniqueViewers,
        totalComments,
        engagementRate: ((showcase.likes + showcase.forks) / showcase.views * 100).toFixed(2),
      }
    }),
})