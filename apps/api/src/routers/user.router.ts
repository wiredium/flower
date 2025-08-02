import { router, publicProcedure } from '../lib/trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

// Define user input/output schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
})

const userIdSchema = z.object({
  id: z.string().cuid(),
})

export const userRouter = router({
  // Get all users
  getAll: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return users
  }),

  // Get user by ID
  getById: publicProcedure
    .input(userIdSchema)
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      return user
    }),

  // Create new user
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.create({
          data: input,
        })
        return user
      } catch (error) {
        // Handle unique constraint violation
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
          })
        }
        throw error
      }
    }),

  // Update user
  update: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        data: z.object({
          email: z.string().email().optional(),
          name: z.string().min(1).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.update({
        where: { id: input.id },
        data: input.data,
      })
      return user
    }),

  // Delete user
  delete: publicProcedure
    .input(userIdSchema)
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.user.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
})