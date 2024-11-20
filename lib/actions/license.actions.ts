'use server';
import {parseStringify} from "@/lib/utils";
import {PrismaClient} from "@prisma/client";
import {z} from "zod";
import {accessorySchema, licenseSchema} from "@/lib/schemas";
import {auth} from "@/auth";

const prisma = new PrismaClient()

// Type for the API response
type ApiResponse<T> = {
    data?: T;
    error?: string;
};

export const create = async (values: z.infer<typeof licenseSchema>): Promise<ApiResponse<License>> => {

    try {
        // const validation = accessorySchema.safeParse(values);
        // if (!validation.success) {
        //     return {error: 'Invalid assignment data'};
        // }
        //
        const session = await auth()

        await prisma.license.create({
            data: {
                name: values.licenseName,
                licenseCopiesCount: Number(values.licenseCopiesCount),
                minCopiesAlert: Number(values.minCopiesAlert),
                licensedEmail: values.licensedEmail,
                renewalDate: values.renewalDate,
                purchaseDate: values.purchaseDate,
                alertRenewalDays: Number(values.alertRenewalDays),
                poNumber: values.poNumber,
                licenseKey: values.licenseKey,
                purchasePrice: Number(values.purchasePrice),
                companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04' //session.user.companyId
            },
        })


    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
    return {
        data: parseStringify(values)
    };
}
export const getAll = async () => {
    try {


        const licenses = await prisma.license.findMany();


        return parseStringify(licenses);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: string) => {
    try {
        const licenseTool = await prisma.license.findFirst({
            where: {
                id: id
            }
        });
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const update = async (data: License, id: string) => {
    try {
        // const licenseTool = await prisma.license.update({
        //     where: {
        //         id: id
        //     },
        //     ...data
        // });
        return parseStringify('');
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const remove = async (id: string) => {

    console.log(id)

    const licenseTool = await prisma.license.delete({
        where: {
            id: id
        }
    })
    return parseStringify(licenseTool);

}




