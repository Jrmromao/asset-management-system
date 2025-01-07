// 'use server';
//
// import {Prisma} from "@prisma/client";
// import {parseStringify} from "@/lib/utils";
// import {auth} from "@/auth";
// import {revalidatePath} from "next/cache";
// import {z} from "zod";
// import {modelSchema} from "@/lib/schemas";
// import {prisma} from "@/app/db";
//
// export async function insert(
//     values: z.infer<typeof modelSchema>
// ): Promise<ActionResponse<Model>> {  // Changed return type to Model
//     try {
//         const session = await auth();
//         if (!session?.user?.companyId) {
//             return { error: "Not authenticated" };
//         }
//
//         const validation = modelSchema.safeParse(values);
//         if (!validation.success) {
//             return { error: validation.error.errors[0].message };
//         }
//
//         const model = await prisma.model.create({
//             data: {
//                 ...validation.data,
//                 companyId: session.user.companyId
//             }
//         });
//
//         if (model) {
//             revalidatePath('/assets/create');
//             return {
//                 success: true,
//                 data: parseStringify(model)
//             };
//         }
//
//         return { error: "Failed to create model" };
//
//     } catch (error) {
//         if (error instanceof Prisma.PrismaClientKnownRequestError) {
//             if (error.code === 'P2002') {
//                 return { error: "A model with this number already exists" };
//             }
//         }
//         console.error('Insert model error:', error);
//         return { error: "Failed to create model" };
//     } finally {
//         await prisma.$disconnect();
//     }
// }
//
// export async function getAll(params?: {
//     search?: string;
//     categoryId?: string;
// }): Promise<ActionResponse<Model[]>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return {error: "Not authenticated"};
//         }
//         const where: Prisma.ModelWhereInput = {
//             companyId: session.user.companyId,
//             ...(params?.categoryId && {categoryId: params.categoryId}),
//             ...(params?.search && {
//                 OR: [
//                     {name: {contains: params.search, mode: 'insensitive' as Prisma.QueryMode}},
//                     {modelNo: {contains: params.search, mode: 'insensitive' as Prisma.QueryMode}}
//                 ]
//             })
//         };
//
//         const models = await prisma.model.findMany({
//             where,
//             include: {
//                 category: {
//                     select: {name: true}
//                 },
//                 manufacturer: {
//                     select: {name: true}
//                 }
//             },
//             orderBy: {createdAt: 'desc'}
//         });
//
//         console.log('MODELS:', JSON.stringify(models, null, 2));
//
//         return {data: parseStringify(models)};
//     } catch (error) {
//         console.error('Get all models error:', error);
//         return {error: "Failed to fetch models"};
//     } finally {
//         await prisma.$disconnect();
//     }
// }
//
// // For a simpler version without insensitive search:
// export async function getAllSimple(params?: {
//     search?: string;
//     categoryId?: string;
// }): Promise<ActionResponse<Model[]>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return {error: "Not authenticated"};
//         }
//         const where: Prisma.ModelWhereInput = {
//             companyId: session.user.companyId,
//             ...(params?.categoryId && {categoryId: params.categoryId}),
//             ...(params?.search && {
//                 OR: [
//                     {name: {contains: params.search}},
//                     {modelNo: {contains: params.search}}
//                 ]
//             })
//         };
//
//         const models = await prisma.model.findMany({
//             where,
//             include: {
//                 category: {
//                     select: {name: true}
//                 },
//                 manufacturer: {
//                     select: {name: true}
//                 }
//             },
//             orderBy: {createdAt: 'desc'}
//         });
//
//         return {data: parseStringify(models)};
//     } catch (error) {
//         console.error('Get all models error:', error);
//         return {error: "Failed to fetch models"};
//     } finally {
//         await prisma.$disconnect();
//     }
// }
//
//
// export async function findById(id: string): Promise<ActionResponse<Model>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return {error: "Not authenticated"};
//         }
//
//         const model = await prisma.model.findFirst({
//             where: {
//                 id,
//                 companyId: session.user.companyId
//             },
//             include: {
//                 category: true,
//                 manufacturer: true,
//                 assets: {
//                     select: {
//                         id: true,
//                         name: true,
//                         serialNumber: true,
//                         statusLabel: {
//                             select: {
//                                 name: true,
//                                 colorCode: true
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//
//         if (!model) {
//             return {error: "Model not found"};
//         }
//
//         return {data: parseStringify(model)};
//     } catch (error) {
//         console.error('Find model by id error:', error);
//         return {error: "Failed to fetch model"};
//     } finally {
//         await prisma.$disconnect();
//     }
// }
//
//
//
//
// export async function getAllWithLowerCase(params?: {
//     search?: string;
//     categoryId?: string;
// }): Promise<ActionResponse<Model[]>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return {error: "Not authenticated"};
//         }
//
//         const searchLower = params?.search?.toLowerCase();
//
//         const where: Prisma.ModelWhereInput = {
//             companyId: session.user.companyId,
//             ...(params?.categoryId && {categoryId: params.categoryId}),
//             ...(searchLower && {
//                 OR: [
//                     {name: {contains: searchLower}},
//                     {modelNo: {contains: searchLower}}
//                 ]
//             })
//         };
//
//         const models = await prisma.model.findMany({
//             where,
//             include: {
//                 category: {
//                     select: {name: true}
//                 },
//                 manufacturer: {
//                     select: {name: true}
//                 }
//             },
//             orderBy: {createdAt: 'desc'}
//         });
//
//         return {data: parseStringify(models)};
//     } catch (error) {
//         console.error('Get all models error:', error);
//         return {error: "Failed to fetch models"};
//     } finally {
//         await prisma.$disconnect();
//     }
// }
// export async function update(data: Model, id: string): Promise<ActionResponse<Model>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return {error: "Not authenticated"};
//         }
//
//         // Check if model exists and belongs to company
//         const existingModel = await prisma.model.findFirst({
//             where: {
//                 id,
//                 companyId: session.user.companyId
//             }
//         });
//
//         if (!existingModel) {
//             return {error: "Model not found"};
//         }
//
//         const model = await prisma.model.update({
//             where: {id},
//             data: {
//                 name: data.name,
//                 modelNo: data.modelNo,
//                 categoryId: data.categoryId,
//                 manufacturerId: data.manufacturerId,
//                 companyId: session.user.companyId
//             }
//         });
//
//         revalidatePath('/models');
//         revalidatePath(`/models/${id}`);
//         return {data: parseStringify(model)};
//     } catch (error) {
//         console.error('Update model error:', error);
//         return {error: "Failed to update model"};
//     } finally {
//         await prisma.$disconnect();
//     }
// }
//
// export async function remove(id: string): Promise<ActionResponse<Model>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return {error: "Not authenticated"};
//         }
//
//         // Check if model exists and belongs to company
//         const existingModel = await prisma.model.findFirst({
//             where: {
//                 id,
//                 companyId: session.user.companyId
//             },
//             include: {
//                 assets: {
//                     select: {id: true},
//                     take: 1
//                 }
//             }
//         });
//
//         if (!existingModel) {
//             return {error: "Model not found"};
//         }
//
//         if (existingModel.assets.length > 0) {
//             return {error: "Cannot delete model with associated assets"};
//         }
//
//         const model = await prisma.model.delete({
//             where: {id}
//         });
//
//         revalidatePath('/models');
//         return {data: parseStringify(model)};
//     } catch (error) {
//         console.error('Delete model error:', error);
//         return {error: "Failed to delete model"};
//     } finally {
//         await prisma.$disconnect();
//     }
// }
//
// export async function isModelNumberUnique(
//     modelNo: string,
//     excludeId?: string
// ): Promise<boolean> {
//     try {
//         const session = await auth();
//         if (!session) return false;
//
//         const existingModel = await prisma.model.findFirst({
//             where: {
//                 modelNo,
//                 companyId: session.user.companyId,
//                 id: excludeId ? {not: excludeId} : undefined
//             }
//         });
//
//         return !existingModel;
//     } catch (error) {
//         console.error('Check model number error:', error);
//         return false;
//     } finally {
//         await prisma.$disconnect();
//     }
// }

"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { modelSchema } from "@/lib/schemas";
import { prisma } from "@/app/db";

type ModelSearchParams = {
  search?: string;
  categoryId?: string;
};

export async function insert(
  values: z.infer<typeof modelSchema>,
): Promise<ActionResponse<Model>> {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Not authenticated" };
    }

    const validation = modelSchema.safeParse(values);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const model = await prisma.model.create({
      data: {
        ...validation.data,
        companyId: session.user.companyId,
      },
    });

    if (!model) {
      return { error: "Failed to create model" };
    }

    revalidatePath("/assets/create");
    return {
      success: true,
      data: parseStringify(model),
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "A model with this number already exists" };
      }
    }
    return { error: "Failed to create model" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAll(
  params?: ModelSearchParams,
): Promise<ActionResponse<Model[]>> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Not authenticated" };
    }

    const where: Prisma.ModelWhereInput = {
      companyId: session.user.companyId,
      ...(params?.categoryId && { categoryId: params.categoryId }),
      ...(params?.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { modelNo: { contains: params.search, mode: "insensitive" } },
        ],
      }),
    };

    const models = await prisma.model.findMany({
      where,
      include: {
        manufacturer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: parseStringify(models),
    };
  } catch (error) {
    return { error: "Failed to fetch models" };
  } finally {
    await prisma.$disconnect();
    revalidatePath("/accessories/create");
  }
}

export async function getAllSimple(
  params?: ModelSearchParams,
): Promise<ActionResponse<Model[]>> {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Not authenticated" };
    }

    // Build query
    const where: Prisma.ModelWhereInput = {
      companyId: session.user.companyId,
      ...(params?.categoryId && { categoryId: params.categoryId }),
      ...(params?.search && {
        OR: [
          { name: { contains: params.search } },
          { modelNo: { contains: params.search } },
        ],
      }),
    };

    // Fetch models
    const models = await prisma.model.findMany({
      where,
      include: {
        manufacturer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Success response
    return {
      success: true,
      data: parseStringify(models),
    };
  } catch (error) {
    return { error: "Failed to fetch models" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function findById(id: string): Promise<ActionResponse<Model>> {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Not authenticated" };
    }

    // Fetch model
    const model = await prisma.model.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
      include: {
        manufacturer: true,
        assets: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            statusLabel: {
              select: {
                name: true,
                colorCode: true,
              },
            },
          },
        },
      },
    });

    // Not found check
    if (!model) {
      return { error: "Model not found" };
    }

    // Success response
    return {
      success: true,
      data: parseStringify(model),
    };
  } catch (error) {
    return { error: "Failed to fetch model" };
  } finally {
    await prisma.$disconnect();
  }
}
