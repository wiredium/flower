import { router } from '../lib/trpc.js'
import { userRouter } from './user.router.js'
import { healthRouter } from './health.router.js'

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter