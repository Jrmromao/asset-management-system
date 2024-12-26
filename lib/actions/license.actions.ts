'use server';
import {parseStringify} from "@/lib/utils";
import {PrismaClient} from "@prisma/client";
import {z} from "zod";
import {licenseSchema} from "@/lib/schemas";
import {auth} from "@/auth";

const prisma = new PrismaClient()

type ApiResponse<T> = {
    data?: T;
    error?: boolean;
    message?: string;
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
            return {message: "Not authenticated"};
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
                licenseKey: '', // this needs to be removed
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
export const findById = async (id: string): Promise<ApiResponse<License>> => {
    try {
        const license = await prisma.license.findFirst({
            where: { id },
            include: {
                company: true,
                assets: true,
                statusLabel: true,
                supplier: true,
                department: true,
                departmentLocation: true,
                inventory: true,
            }
        });

        if (!license) {
            return {
                error: true,
                data: undefined
            };
        }

        // Transform the Prisma result to match the License type
        const transformedLicense: License = {
            id: license.id,
            name: license.name,
            licensedEmail: license.licensedEmail,
            poNumber: license.poNumber,
            // licenseKey: license.licenseKey,
            companyId: license.companyId,
            statusLabelId: license.statusLabelId ?? undefined,  // Convert null to undefined
            supplierId: license.supplierId ?? undefined,
            departmentId: license.departmentId ?? undefined,
            locationId: license.locationId ?? undefined,
            inventoryId: license.inventoryId ?? undefined,
            renewalDate: license.renewalDate,
            purchaseDate: license.purchaseDate,
            purchaseNotes: license.purchaseNotes ?? undefined,
            licenseUrl: license.licenseUrl ?? undefined,
            minCopiesAlert: license.minCopiesAlert,
            alertRenewalDays: license.alertRenewalDays,
            licenseCopiesCount: license.licenseCopiesCount,
            purchasePrice: Number(license.purchasePrice),
            createdAt: license.createdAt,
            updatedAt: license.updatedAt,

            // Relations - convert nulls to undefined and ensure proper type conversion
            company: license.company ?? undefined,
            statusLabel: license.statusLabel ?? undefined,
            supplier: license.supplier,
            department: license.department ?? undefined,
            departmentLocation: license.departmentLocation ? {
                ...license.departmentLocation,
                addressLine2: license.departmentLocation.addressLine2 ?? undefined,
                companyId: license.departmentLocation.companyId ?? undefined
            } : undefined,
            inventory: license.inventory ?? undefined,
        };

        console.log(transformedLicense)

        return {
            error: false,
            data: transformedLicense
        };

    } catch (error) {
        console.error('Error finding license:', error);
        return {
            error: true,
            data: undefined
        };
    } finally {
        await prisma.$disconnect();
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




