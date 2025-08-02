import { router } from '../lib/trpc'
import { userRouter } from './user.router'
import { healthRouter } from './health.router'
import { authRouter } from './auth.router'
import { projectRouter } from './project.router'
import { aiRouter } from './ai.router'
import { workflowRouter } from './workflow.router'
import { templateRouter } from './template.router'
import { showcaseRouter } from './showcase.router'
import { collaborationRouter } from './collaboration.router'
import { notificationRouter } from './notification.router'

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