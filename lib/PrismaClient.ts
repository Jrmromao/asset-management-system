import { PrismaClient } from "@prisma/client";

// Extend the global namespace to include the PrismaClient instance
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  var prisma: PrismaClient | undefined;
}

// Create a PrismaClient instance if needed
const prismaGlobal = global as { prisma: PrismaClient | undefined };

if (!prismaGlobal.prisma) {
  if (process.env.NODE_ENV === "production") {
    // In production, create a new PrismaClient instance
    prismaGlobal.prisma = new PrismaClient();
  } else {
    // In development, use a global PrismaClient instance to avoid multiple instances
    prismaGlobal.prisma = new PrismaClient();
  }
}

export default prismaGlobal.prisma as PrismaClient;
