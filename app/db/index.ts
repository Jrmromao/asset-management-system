import {PrismaClient} from '@prisma/client'


declare global {
    var prisma: PrismaClient | undefined
}


const globalPrimaClient = global as unknown as {
    prisma: PrismaClient | undefined
}

// export const db = globalThis.process || new PrismaClient()

export const prisma =
    globalPrimaClient.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalPrimaClient.prisma = prisma
