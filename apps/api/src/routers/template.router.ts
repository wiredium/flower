import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../lib/trpc'
import { TRPCError } from '@trpc/server'
import { prisma } from '@repo/database'
import {
  createTemplateSchema,
  updateTemplateSchema,
  templateSearchSchema,
} from '@repo/types'

export const templateRouter = router({
  // Create a new template
  create: protectedProcedure
    .input(createTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin for official templates
      if (input.isPublic) {
        const user = await prisma.user.findUnique({
          where: { id: ctx.user!.id },
        })

        if (user?.role !== 'ADMIN') {
          // Non-admin users can only create private templates
          input.isPublic = false
        }
      }

      const template = await prisma.template.create({
        data: {
          ...input,
          authorId: ctx.user!.id,
          isOfficial: false, // Only system can create official templates
          workflowData: input.workflowData as any,
          prefillData: input.prefillData || {},
        },
      })

      return template
    }),

  // Update a template
  update: protectedProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const existing = await prisma.template.findFirst({
        where: {
          id: input.id,
          authorId: ctx.user!.id,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found or access denied',
        })
      }

      const { id, ...data } = input
      const updated = await prisma.template.update({
        where: { id },
        data: {
          ...data,
          workflowData: data.workflowData ? data.workflowData as any : undefined,
        },
      })

      return updated
    }),

  // Delete a template
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const template = await prisma.template.findFirst({
        where: {
          id: input.id,
          authorId: ctx.user!.id,
        },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found or access denied',
        })
      }

      await prisma.template.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get a single template
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const template = await prisma.template.findFirst({
        where: {
          id: input.id,
          OR: [
            { isPublic: true },
            { isOfficial: true },
            { authorId: ctx.user?.id },
          ],
        },
        include: {
          _count: {
            select: {
              projects: true,
            },
          },
        },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        })
      }

      return template
    }),

  // Search templates
  search: publicProcedure
    .input(templateSearchSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {
        OR: [
          { isPublic: true },
          { isOfficial: true },
          { authorId: ctx.user?.id },
        ],
      }

      if (input.query) {
        where.AND = [
          {
            OR: [
              { name: { contains: input.query, mode: 'insensitive' } },
              { description: { contains: input.query, mode: 'insensitive' } },
              { tags: { has: input.query } },
            ],
          },
        ]
      }

      if (input.category) {
        where.category = input.category
      }

      if (input.tags && input.tags.length > 0) {
        where.tags = { hasEvery: input.tags }
      }

      if (input.isOfficial !== undefined) {
        where.isOfficial = input.isOfficial
      }

      const orderBy: any = {}
      switch (input.sortBy) {
        case 'popular':
          orderBy.usageCount = 'desc'
          break
        case 'recent':
          orderBy.createdAt = 'desc'
          break
        case 'name':
          orderBy.name = 'asc'
          break
        default:
          orderBy.createdAt = 'desc'
      }

      const [templates, total] = await Promise.all([
        prisma.template.findMany({
          where,
          orderBy,
          skip: input.offset,
          take: input.limit,
          include: {
            _count: {
              select: {
                projects: true,
              },
            },
          },
        }),
        prisma.template.count({ where }),
      ])

      return {
        templates,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Get user's templates
  myTemplates: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const [templates, total] = await Promise.all([
        prisma.template.findMany({
          where: { authorId: ctx.user!.id },
          orderBy: { updatedAt: 'desc' },
          skip: input.offset,
          take: input.limit,
          include: {
            _count: {
              select: {
                projects: true,
              },
            },
          },
        }),
        prisma.template.count({
          where: { authorId: ctx.user!.id },
        }),
      ])

      return {
        templates,
        total,
        hasMore: input.offset + input.limit < total,
      }
    }),

  // Use a template (increment usage count)
  use: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.template.findFirst({
        where: {
          id: input.id,
          OR: [
            { isPublic: true },
            { isOfficial: true },
            { authorId: ctx.user!.id },
          ],
        },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        })
      }

      // Increment usage count
      await prisma.template.update({
        where: { id: input.id },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      })

      return template
    }),

  // Get official templates (curated by admins)
  getOfficial: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const where: any = { isOfficial: true }
      
      if (input.category) {
        where.category = input.category
      }

      const templates = await prisma.template.findMany({
        where,
        orderBy: { usageCount: 'desc' },
        take: input.limit,
        include: {
        },
      })

      return templates
    }),

  // Get popular templates
  getPopular: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const templates = await prisma.template.findMany({
        where: {
          OR: [
            { isPublic: true },
            { isOfficial: true },
          ],
        },
        orderBy: { usageCount: 'desc' },
        take: input.limit,
        include: {
        },
      })

      return templates
    }),

  // Clone a template
  clone: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const template = await prisma.template.findFirst({
        where: {
          id: input.templateId,
          OR: [
            { isPublic: true },
            { isOfficial: true },
            { authorId: ctx.user!.id },
          ],
        },
      })

      if (!template) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        })
      }

      // Create a copy
      const cloned = await prisma.template.create({
        data: {
          name: input.name || `${template.name} (Copy)`,
          description: template.description,
          category: template.category,
          icon: template.icon,
          tags: template.tags,
          workflowData: template.workflowData as any,
          prefillData: template.prefillData as any,
          isOfficial: false,
          isPublic: false,
          authorId: ctx.user!.id,
        },
      })

      return cloned
    }),
})