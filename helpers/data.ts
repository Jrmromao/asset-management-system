import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";

export const findByAuthId = async (oauthId: string) => {
    try {
        const licenseTool = await prisma.user.findFirst({
            where: {
                oauthId: oauthId
            },
            include: {
                role: true,
                company: true
            }
        });
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: string) => {
    try {
        const licenseTool = await prisma.user.findFirst({
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
export const findByEmail = async (email: string) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
            include: {
                role: true,
                company: true
            }

        });
        return parseStringify(user);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}