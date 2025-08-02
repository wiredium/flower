import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import type { Context } from './context.js'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

// Example of a protected procedure (uncomment when you have authentication)
// const isAuthed = middleware(async ({ ctx, next }) => {
//   if (!ctx.session?.user) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' })
//   }
//   return next({
//     ctx: {
//       ...ctx,
//       // infers the `session` as non-nullable
//       session: { ...ctx.session, user: ctx.session.user },
//     },
//   })
// })
// export const protectedProcedure = t.procedure.use(isAuthed)