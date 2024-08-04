import { PrismaClient } from "@prisma/client";

// Extend the global namespace to include the PrismaClient instance
declare global {
    var prisma: PrismaClient | undefined;
}

// Create a PrismaClient instance
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
    // In production, create a new PrismaClient instance
    prisma = new PrismaClient();
} else {
    // In development, use a global PrismaClient instance to avoid multiple instances
    if (!globalThis.prisma) {
        globalThis.prisma = new PrismaClient();
    }
    prisma = globalThis.prisma;
}

export default prisma;
