"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";

export async function insert(
  data: Pick<Department, "name">,
): Promise<ActionResponse<Department>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const department = await prisma.department.create({
      data: {
        ...data,
        companyId: session.user.companyId,
      },
    });

    console.log(department);
    revalidatePath("/assets/create");
    return { data: parseStringify(department) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is Prisma's error code for unique constraint violations
      if (error.code === "P2002") {
        return { error: "Department name already exists in your company" };
      }
    }
    console.error("Create department error:", error);
    return { error: "Failed to create department" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAll(params?: {
  search?: string;
}): Promise<ActionResponse<Department[]>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const where: Prisma.DepartmentWhereInput = {
      companyId: session.user.companyId,
      ...(params?.search && {
        name: {
          contains: params.search,
          mode: "insensitive",
        },
      }),
    };

    const departments = await prisma.department.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(departments);

    return {
      success: true,
      data: parseStringify(departments),
    };
  } catch (error) {
    console.error("Get departments error:", error);
    return { error: "Failed to fetch departments" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function findById(
  id: string,
): Promise<ActionResponse<Department>> {
  try {
    if (!session) {
      return { error: "Not authenticated" };
    }

    const department = await prisma.department.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!department) {
      return { error: "Department not found" };
    }

    return { data: parseStringify(department) };
  } catch (error) {
    console.error("Find department error:", error);
    return { error: "Failed to fetch department" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function update(
  id: string,
  data: Partial<Department>,
): Promise<ActionResponse<Department>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const department = await prisma.department.update({
      where: {
        id,
        companyId: session.user.companyId,
      },
      data: {
        name: data.name,
      },
    });

    revalidatePath("/departments");
    revalidatePath(`/departments/${id}`);
    return { data: parseStringify(department) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "Department name already exists in your company" };
      }
      if (error.code === "P2025") {
        return { error: "Department not found" };
      }
    }
    console.error("Update department error:", error);
    return { error: "Failed to update department" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function remove(id: string): Promise<ActionResponse<Department>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const department = await prisma.department.delete({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    revalidatePath("/departments");
    return { data: parseStringify(department) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { error: "Department not found" };
      }
    }
    console.error("Delete department error:", error);
    return { error: "Failed to delete department" };
  } finally {
    await prisma.$disconnect();
  }
}
