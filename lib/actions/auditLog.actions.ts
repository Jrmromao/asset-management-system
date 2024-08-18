'use server';
import {PrismaClient} from '@prisma/client'
import {parseStringify} from "@/lib/utils";

const prisma = new PrismaClient()

export const create = async (data: {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    userId: string;
    organizationId: string;

}) => {
    try {
        await prisma.auditLog.create({
            data: {
                id: data.id,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                userId: data.userId,
                companyId: data.organizationId,
                createdAt: new Date(),
            }
        })
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}


export const findAllByOrganization = async (organizationId: string) => {
    try {

        const auditLog = await prisma.auditLog.findMany({
            where: {
                companyId: organizationId
            }, include: {
                user: true,
            }
        });
        return parseStringify(auditLog);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}



