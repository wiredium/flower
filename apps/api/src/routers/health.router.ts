import { router, publicProcedure } from '../lib/trpc'
import { z } from 'zod'

export const healthRouter = router({
  check: publicProcedure.query(async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }),

  db: publicProcedure.query(async ({ ctx }) => {
    try {
      // Test database connection
      await ctx.prisma.$queryRaw`SELECT 1`
      return {
        status: 'connected',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: 'disconnected',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }),
})