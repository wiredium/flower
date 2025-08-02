import { TRPCError } from '@trpc/server'
import { middleware } from '../lib/trpc.js'
import { authService } from '../services/auth.service.js'

/**
 * Authentication middleware
 * Checks if the user is authenticated and adds user to context
 */
export const isAuthenticated = middleware(async ({ ctx, next }) => {
  // Get token from header
  const authHeader = ctx.req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'No authentication token provided',
    })
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    // Verify token and get user
    const user = await authService.getUserFromToken(token)

    // Add user to context
    return next({
      ctx: {
        ...ctx,
        user,
      },
    })
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    })
  }
})

/**
 * Admin-only middleware
 * Checks if the authenticated user has admin role
 */
export const isAdmin = middleware(async ({ ctx, next }) => {
  // First check if user is authenticated
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    })
  }

  // Check if user is admin
  if (ctx.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    })
  }

  return next()
})

/**
 * Optional authentication middleware
 * Adds user to context if authenticated, but doesn't require it
 */
export const optionalAuth = middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token, continue without user
    return next()
  }

  const token = authHeader.substring(7)

  try {
    const user = await authService.getUserFromToken(token)
    return next({
      ctx: {
        ...ctx,
        user,
      },
    })
  } catch {
    // Invalid token, continue without user
    return next()
  }
})