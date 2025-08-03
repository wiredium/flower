import { PrismaClient } from '@prisma/client'

declare global {
  // biome-ignore lint/style/noVar: Global singleton pattern
  var prisma: PrismaClient | undefined
}

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query' as const, 'error' as const, 'warn' as const] 
    : ['error' as const],
}

export const prisma = globalThis.prisma || new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma