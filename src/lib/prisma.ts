import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('[PRISMA] ERROR: DATABASE_URL environment variable is not set')
  throw new Error('DATABASE_URL environment variable is not set')
}

let prismaInstance: PrismaClient;

try {
  console.log('[PRISMA] Initializing Prisma Client...')
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
  console.log('[PRISMA] Prisma Client initialized successfully')
} catch (error) {
  console.error('[PRISMA] ERROR initializing Prisma Client:', error)
  if (error instanceof Error) {
    console.error('[PRISMA] Error name:', error.name)
    console.error('[PRISMA] Error message:', error.message)
    console.error('[PRISMA] Error stack:', error.stack)
  }
  throw error
}

export const prisma = prismaInstance!

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
