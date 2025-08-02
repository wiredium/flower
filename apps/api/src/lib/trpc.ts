// Re-export base exports
export { router, publicProcedure, middleware, t } from './trpc-base'
import { t } from './trpc-base'
import { isAuthenticated, isAdmin, optionalAuth } from '../middleware/auth.middleware'

// Protected procedures
export const protectedProcedure = t.procedure.use(isAuthenticated)
export const adminProcedure = t.procedure.use(isAuthenticated).use(isAdmin)
export const optionalAuthProcedure = t.procedure.use(optionalAuth)