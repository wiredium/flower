import { PrismaClient } from '@prisma/client'

declare global {
  // biome-ignore lint/style/noVar: Global singleton pattern
  var prisma: PrismaClient | undefined
}

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

export const prisma = global.prisma || new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma