import { router } from '../lib/trpc.js'
import { userRouter } from './user.router.js'
import { healthRouter } from './health.router.js'
import { authRouter } from './auth.router.js'
import { projectRouter } from './project.router.js'
import { aiRouter } from './ai.router.js'
import { workflowRouter } from './workflow.router.js'
import { templateRouter } from './template.router.js'
import { showcaseRouter } from './showcase.router.js'
import { collaborationRouter } from './collaboration.router.js'
import { notificationRouter } from './notification.router.js'

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
  auth: authRouter,
  project: projectRouter,
  ai: aiRouter,
  workflow: workflowRouter,
  template: templateRouter,
  showcase: showcaseRouter,
  collaboration: collaborationRouter,
  notification: notificationRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter