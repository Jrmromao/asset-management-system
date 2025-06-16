import { prisma } from "@/app/db";
import { parseStringify } from "@/lib/utils";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.NEXT_PUBLIC_APP_URL)
    return `https://${process.env.NEXT_PUBLIC_APP_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const findByAuthId = async (oauthId: string) => {
  try {
    const licenseTool = await prisma.user.findFirst({
      where: {
        oauthId: oauthId,
      },
      include: {
        role: true,
        company: true,
      },
    });
    return parseStringify(licenseTool);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const findById = async (id: string) => {
  try {
    const licenseTool = await prisma.user.findFirst({
      where: {
        id: id,
      },
      include: {
        role: true,
        company: true,
      },
    });
    return parseStringify(licenseTool);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const findByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      include: {
        role: true,
        company: true,
      },
    });
    return parseStringify(user);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

// findUserBySupabaseId
// crate a funtion called findUserBySupabaseId

export const findUserBySupabaseId = async (supabaseId: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        oauthId: supabaseId,
      },
      include: {
        role: true,
        company: true,
      },
    });
    return parseStringify(user);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

// crate a method called PrismaUserWithRelations
export const PrismaUserWithRelations = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: true,
        company: true,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
};
