'use server';
import {parseStringify} from "@/lib/utils";
import {PrismaClient, UserLicense} from "@prisma/client";
import {z} from "zod";
import {assignmentSchema, licenseSchema} from "@/lib/schemas";
import {auth} from "@/auth";

const prisma = new PrismaClient()

type ApiResponse<T> = {
    data?: T;
    error?: string;
};

export const create = async (values: z.infer<typeof licenseSchema>): Promise<ApiResponse<License>> => {
    try {
        const validation = licenseSchema.safeParse(values);
        if (!validation.success) {
            throw new Error(validation.error.errors[0].message);
        }

        const session = await auth()
        if (!session) {
            return {error: "Not authenticated"};
        }

        return await prisma.$transaction(async (tx) => {
            // Create license
            const license = await tx.license.create({
                data: {
                    name: values.licenseName,
                    seats: Number(values.seats),
                    minSeatsAlert: Number(values.minSeatsAlert),
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
                    purchasePrice: values.purchasePrice,
                    companyId: session.user.companyId
                },
            });

            // Record initial seat allocation
            await tx.licenseSeat.create({
                data: {
                    licenseId: license.id,
                    quantity: Number(values.seats),
                    type: 'purchase',
                    companyId: session.user.companyId,
                    notes: `Initial purchase of ${values.seats} seats`
                }
            });

            // Create audit log
            await tx.auditLog.create({
                data: {
                    action: 'LICENSE_CREATED',
                    entity: 'LICENSE',
                    entityId: license.id,
                    userId: session.user.id!,
                    companyId: session.user.companyId,
                    details: `Created license ${values.licenseName} with ${values.seats} seats`
                }
            });

            return {
                data: parseStringify(license)
            };
        });

    } catch (error) {
        console.error(error);
        return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
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
                users: true,
            }
        });

        if (!license) {
            return {
                error: 'License not found',
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
            minSeatsAlert: license.minSeatsAlert,
            alertRenewalDays: license.alertRenewalDays,
            seats: license.seats,
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
            users: license?.users ?? [],
        };

        return {
            data: transformedLicense
        };

    } catch (error) {
        console.error('Error finding license:', error);
        return {
            error: 'Failed to find license',
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
    const licenseTool = await prisma.license.delete({
        where: {
            id: id
        }
    })
    return parseStringify(licenseTool);

}


export async function assignLicense(values: z.infer<typeof assignmentSchema>): Promise<ApiResponse<UserLicense>> {
    try {
        const validation = assignmentSchema.safeParse(values);
        if (!validation.success) {
            return { error: validation.error.errors[0].message };
        }

        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const userLicense = await prisma.$transaction(async (tx) => {
            const license = await tx.license.findUnique({
                where: { id: values.itemId },
                include: { users: true }
            });

            if (!license) {
                throw new Error("License not found");
            }

            const usedSeats = license.users.reduce((sum, user) => sum + user.seatsAssigned, 0);
            const availableSeats = license.seats - usedSeats;
            const seatsRequested = values.seatsRequested || 1;

            if (availableSeats < seatsRequested) {
                throw new Error(`Not enough seats available. Requested: ${seatsRequested}, Available: ${availableSeats}`);
            }

            const assignment = await tx.userLicense.create({
                data: {
                    userId: values.userId,
                    licenseId: values.itemId,
                    seatsAssigned: seatsRequested
                },
                include: {
                    user: true,
                    license: true
                }
            });

            await tx.licenseSeat.create({
                data: {
                    licenseId: values.itemId,
                    quantity: seatsRequested,
                    type: "allocation",
                    companyId: session.user.companyId,
                    notes: `Assigned ${seatsRequested} seat(s) to user ${values.userId}`
                }
            });

            await tx.auditLog.create({
                data: {
                    action: "LICENSE_ASSIGNED",
                    entity: "LICENSE",
                    entityId: values.itemId,
                    userId: values.userId,
                    companyId: session.user.companyId,
                    details: `Assigned ${seatsRequested} seat(s) of license ${license.name}`
                }
            });

            return assignment;
        });

        return { data: parseStringify(userLicense) };
    } catch (error) {
        console.error('Error assigning license:', error);
        return { error: error instanceof Error ? error.message : String(error) };
    }
}