import { PrismaClient } from '@prisma/client'

declare global {
  // biome-ignore lint/style/noVar: Global singleton pattern
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma