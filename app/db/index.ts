            import {PrismaClient} from '@prisma/client'

const globalPrimaClient = global as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalPrimaClient.prisma ?? new PrismaClient({log: ['query']})

if (process.env.NODE_ENV !== 'production') globalPrimaClient.prisma = prisma
