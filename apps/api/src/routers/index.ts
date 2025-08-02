import { router } from '../lib/trpc.js'
import { userRouter } from './user.router.js'
import { healthRouter } from './health.router.js'
import { authRouter } from './auth.router.js'
import { projectRouter } from './project.router.js'
import { aiRouter } from './ai.router.js'

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
  auth: authRouter,
  project: projectRouter,
  ai: aiRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter