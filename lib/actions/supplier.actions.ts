'use server'

import { prisma } from "@/app/db"
import { auth } from "@/auth"
import { parseStringify } from "@/lib/utils"
import { supplierSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import {Prisma} from "@prisma/client";



export async function insert(values: z.infer<typeof supplierSchema>): Promise<ActionResponse<Supplier>> {
    try {
        // Validate input
        const validation = await supplierSchema.safeParseAsync(values);
        if (!validation.success) {
            return { error: validation.error.errors[0].message };
        }

        // Check authentication
        const session = await auth();
        if (!session?.user?.companyId) {
            return { error: "Unauthorized: Company ID not found" };
        }


        const supplierData: Prisma.SupplierCreateInput = {
            name: validation.data.name,
            contactName: validation.data.contactName,
            email: validation.data.email!,
            addressLine1: validation.data.addressLine1,
            city: validation.data.city,
            state: validation.data.state,
            zip: validation.data.zip,
            country: validation.data.country,
            company: {
                connect: {
                    id: session.user.companyId
                }
            },
            ...(validation.data.phoneNum && { phoneNum: validation.data.phoneNum }),
            ...(validation.data.url && { url: validation.data.url }),
            ...(validation.data.notes && { notes: validation.data.notes }),
            ...(validation.data.addressLine2 && { addressLine2: validation.data.addressLine2 })
        };

        // Create supplier
        const supplier = await prisma.supplier.create({
            data: supplierData
        });

        // Revalidate and return
        revalidatePath('/assets/create');
        return { success: true, data: parseStringify(supplier)};

    } catch (error) {
        console.error('Create supplier error:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: 'A supplier with these details already exists' };
            }
        }

        return { error: "Failed to create supplier" };
    }
}

// export async function getAll(params?: PaginationParams): Promise<ActionResponse<GetAllResponse<Supplier>>> {
//     try {
//         // const session = await auth();
//         // if (!session?.user?.companyId) {
//         //     return { error: "Not authenticated" };
//         // }
//
//         // Default values
//         const page = Math.max(1, params?.page ?? 1);
//         const limit = Math.max(1, params?.limit ?? 10);
//         const search = params?.search?.trim() ?? '';
//         const sortBy = params?.sortBy ?? 'createdAt';
//         const sortOrder = params?.sortOrder ?? 'desc';
//
//         // Calculate skip for pagination
//         const skip = (page - 1) * limit;
//
//         // Base query filter
//         const baseFilter = {
//             companyId: session.user.companyId,
//             ...(search ? {
//                 OR: [
//                     { name: { contains: search, mode: 'insensitive' } },
//                     { email: { contains: search, mode: 'insensitive' } },
//                     { contactName: { contains: search, mode: 'insensitive' } },
//                     { city: { contains: search, mode: 'insensitive' } },
//                     { country: { contains: search, mode: 'insensitive' } },
//                 ]
//             } : {})
//         };
//
//         // Get total count
//         const total = await prisma.supplier.count({
//             where: baseFilter
//         });
//
//         // Get paginated data
//         const items = await prisma.supplier.findMany({
//             where: baseFilter,
//             orderBy: {
//                 [sortBy]: sortOrder
//             },
//             include: {
//                 _count: {
//                     select: { assets: true }
//                 }
//             },
//             skip,
//             take: limit,
//         });
//
//         const totalPages = Math.ceil(total / limit);
//
//         return {
//             data: {
//                 items: parseStringify(items),
//                 metadata: {
//                     total,
//                     page,
//                     limit,
//                     totalPages,
//                     hasMore: page < totalPages
//                 }
//             }
//         };
//
//     } catch (error) {
//         console.error('Failed to fetch suppliers:', error);
//         return { error: 'Failed to fetch suppliers' };
//     } finally {
//         await prisma.$disconnect();
//     }
// }

// Simple version without pagination
export async function getAllSimple(): Promise<ActionResponse<Supplier[]>> {
    try {
        const session = await auth();
        if (!session?.user?.companyId) {
            return { error: "Not authenticated" };
        }

        const suppliers = await prisma.supplier.findMany({
            where: {
                companyId: session.user.companyId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!suppliers) {
            return { error: "No suppliers found" };
        }

        console.log(suppliers)
        return { data: parseStringify(suppliers) };
    } catch (error) {
        console.error('Failed to fetch suppliers:', error);
        return { error: 'Failed to fetch suppliers' };
    } finally {
        await prisma.$disconnect();
    }
}
