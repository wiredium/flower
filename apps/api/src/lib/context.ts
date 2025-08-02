import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { prisma } from '@repo/database'
import type { User } from '@prisma/client'

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  return {
    req,
    res,
    prisma,
    user: null as User | null, // Will be populated by auth middleware
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>