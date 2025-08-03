import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../lib/trpc'
import { authService } from '../services/auth.service'
import { 
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema 
} from '@repo/types'

const refreshSchema = z.object({
  refreshToken: z.string(),
})

export const authRouter = router({
  // Register a new user
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      return authService.register(input.email, input.password, input.name, input.username)
    }),

  // Login
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }) => {
      return authService.login(input.email, input.password)
    }),

  // Refresh tokens
  refresh: publicProcedure
    .input(refreshSchema)
    .mutation(async ({ input }) => {
      return authService.refreshTokens(input.refreshToken)
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user!.id,
      email: ctx.user!.email,
      name: ctx.user!.name,
      role: ctx.user!.role,
      credits: ctx.user!.credits,
      avatarUrl: ctx.user!.avatarUrl,
      createdAt: ctx.user!.createdAt,
    }
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const updated = await ctx.prisma.user.update({
        where: { id: ctx.user!.id },
        data: input,
      })

      return {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        credits: updated.credits,
        avatarUrl: updated.avatarUrl,
      }
    }),

  // Change password
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user!.id },
      })

      if (!user?.hashedPassword) {
        throw new Error('User not found')
      }

      // Verify current password
      const isValid = await authService.verifyPassword(
        input.currentPassword,
        user.hashedPassword
      )

      if (!isValid) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedPassword = await authService.hashPassword(input.newPassword)

      // Update password
      await ctx.prisma.user.update({
        where: { id: ctx.user!.id },
        data: { hashedPassword },
      })

      return { success: true }
    }),

  // Delete account
  deleteAccount: protectedProcedure
    .input(
      z.object({
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user!.id },
      })

      if (!user?.hashedPassword) {
        throw new Error('User not found')
      }

      // Verify password
      const isValid = await authService.verifyPassword(
        input.password,
        user.hashedPassword
      )

      if (!isValid) {
        throw new Error('Password is incorrect')
      }

      // Delete user (cascade will handle related records)
      await ctx.prisma.user.delete({
        where: { id: ctx.user!.id },
      })

      return { success: true }
    }),
})