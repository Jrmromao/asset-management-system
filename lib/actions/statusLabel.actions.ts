"use server";
import { parseStringify } from "@/lib/utils";
import { prisma } from "@/app/db";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// lib/actions/statusLabel.actions.ts
export const insert = async (
  values: z.infer<typeof statusLabelSchema>,
): Promise<ActionResponse<StatusLabel>> => {
  try {
    const validation = await statusLabelSchema.safeParseAsync(values);

    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
      };
    }

    const data = validation.data;
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      },
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const result = await prisma.statusLabel.create({
      data: {
        name: data.name,
        colorCode: data.colorCode || "#000000",
        isArchived: data.isArchived,
        allowLoan: data.allowLoan,
        description: data.description,
        companyId: session?.user?.user_metadata?.companyId,
      },
    });

    return { data: parseStringify(result) };
  } catch (error) {
    console.error("Error creating status label:", error);
    throw error;
  }
};

export const getAll = async (): Promise<ActionResponse<StatusLabel[]>> => {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      },
    );
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const labels = await prisma.statusLabel.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        companyId: session?.user?.user_metadata?.companyId,
      },
    });

    return { data: parseStringify(labels) };
  } catch (error) {
    console.error("Error in getAll:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export const findById = async (id: string) => {
  try {
    const labels = await prisma.statusLabel.findFirst({
      where: {
        id: id,
      },
    });
    return parseStringify(labels);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

export const remove = async (id: string) => {
  try {
    const labels = await prisma.statusLabel.delete({
      where: {
        id: id,
      },
    });
    return parseStringify(labels);
  } catch (error) {
    console.log(error);
  }
};

export const update = async (id: string, data: Partial<StatusLabel>) => {
  try {
    const labels = await prisma.statusLabel.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        colorCode: data.colorCode,
        isArchived: data.isArchived,
        allowLoan: data.allowLoan,
        description: data.description,
      },
    });
    return parseStringify(labels);
  } catch (error) {
    console.log(error);
  }
};
