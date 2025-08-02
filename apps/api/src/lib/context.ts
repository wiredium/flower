import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { prisma } from '@repo/database'

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  // Get the session from the request if you have authentication
  // const session = await getSession({ req })

  return {
    req,
    res,
    prisma,
    // session, // Include session if you have authentication
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>