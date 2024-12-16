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

        console.log(values)

        const validation = licenseSchema.safeParse(values);
        if (!validation.success) {
            console.log('Validation errors:', validation.error.errors);
            throw new Error(validation.error.errors[0].message);
        }


        const session = await auth()
        if (!session) {
            return {error: "Not authenticated"};
        }

        await prisma.license.create({
            data: {
                name: values.licenseName,
                licenseCopiesCount: Number(values.licenseCopiesCount),
                minCopiesAlert: Number(values.minCopiesAlert),
                licensedEmail: values.licensedEmail,
                renewalDate: values.renewalDate,
                purchaseDate: values.purchaseDate,
                alertRenewalDays: Number(values.alertRenewalDays),
                supplierId: values.supplierId,
                poNumber: values.poNumber,
                locationId: values.locationId,
                departmentId: values.departmentId,
                inventoryId: values.inventoryId,
                statusLabelId: values.statusLabelId,
                purchaseNotes: values.notes,
                licenseKey: values.licenseKey,
                purchasePrice: values.purchasePrice,
                companyId: session.user.companyId
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




