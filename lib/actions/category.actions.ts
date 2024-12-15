'use server';

import { prisma } from "@/app/db";
import { auth } from "@/auth";
import { revalidatePath } from 'next/cache';
import {z} from "zod";
import {categorySchema} from "@/lib/schemas";
import {Prisma} from "@prisma/client";


/**
 * Creates a new category for the authenticated user's company
 */
export async function insert(values: z.infer<typeof categorySchema>): Promise<ActionResponse<void>> {
    try {
        // Validate input against schema
        const validation = categorySchema.safeParse(values);

        if (!validation.success) {
            return {
                success: false,
                error: 'Invalid input data'
            };
        }

        // Validate session
        // const session = await auth();
        // if (!session?.user?.companyId) {
        //     return {
        //         success: false,
        //         error: 'Unauthorized: No valid session found'
        //     };
        // }

        const {name} = validation.data;

        await prisma.category.create({
            data: {
                name: name,
                type: '',
                company: {
                    connect: {
                        id: 'bf40528b-ae07-4531-a801-ede53fb31f04'
                    },
                },
            },
        });


        // revalidatePath('/assets/create');

        return {
            success: true
        };

    } catch (error) {
        console.error('Error creating category:', error);

        // Handle specific database errors
        if (error instanceof Error) {
            if (error.message.includes('Unique constraint')) {
                return {
                    success: false,
                    error: 'A category with this name already exists'
                };
            }
        }

        return {
            success: false,
            error: 'Failed to create category'
        };
    }
}



/**
 * Fetches all categories for a given company with optional filtering and sorting
 */
export async function findAll(options?: {
    orderBy?: 'name' | 'createdAt';
    order?: 'asc' | 'desc';
    search?: string;
}): Promise<ActionResponse<Category[]>> {
    try {
        // Validate session
        const session = await auth();
        if (!session?.user?.companyId) {
            return {
                success: false,
                error: 'Unauthorized: No valid session found'
            };
        }

        // Build the where clause with proper Prisma types
        const where: Prisma.CategoryWhereInput = {
            companyId: session.user.companyId,
            ...(options?.search ? {
                OR: [
                    {
                        name: {
                            contains: options.search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        type: {
                            contains: options.search,
                            mode: 'insensitive'
                        }
                    }
                ]
            } : {})
        };

        // Build the orderBy with proper Prisma types
        const orderBy: Prisma.CategoryOrderByWithRelationInput = options?.orderBy
            ? { [options.orderBy]: options.order || 'asc' }
            : { name: 'asc' };

        // Get the categories
        const categories = await prisma.category.findMany({
            where,
            orderBy,
            select: {
                id: true,
                name: true,
                type: true,
                companyId: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return {
            success: true,
            data: categories
        };

    } catch (error) {
        console.error('Error fetching categories:', error);
        return {
            success: false,
            error: 'Failed to fetch categories'
        };
    }
}

/**
 * Example usage with form:
 *
 * const form = useForm<z.infer<typeof categorySchema>>({
 *   resolver: zodResolver(categorySchema),
 *   defaultValues: {
 *     name: '',
 *     type: ''
 *   }
 * });
 *
 * async function onSubmit(values: z.infer<typeof categorySchema>) {
 *   const result = await insert(values);
 *   if (result.success) {
 *     // Handle success
 *   } else {
 *     // Handle error
 *   }
 * }
 */