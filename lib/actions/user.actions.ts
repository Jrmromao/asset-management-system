'use server';
import {parseStringify} from "@/lib/utils";
import {signUp as CognitoSignUp} from "@/services/aws/Cognito";
import {prisma} from "@/app/db";

export const registerUser = async (data: RegUser) => {
    let cognitoRegisterResult: any;
    try {
        cognitoRegisterResult = await CognitoSignUp({
            clientId: process.env.COGNITO_CLIENT_ID!,
            username: data.email.split('@')[0],
            email: data.email,
            password: data.password,
            companyId: data.companyId
        });

        const role = await prisma.role.findUnique({
            where: {
                name: 'Admin'
            }
        });

        if (!role) {
            throw new Error('Role not found');
        }

        await prisma.user.create({
            data: {
                oauthId: cognitoRegisterResult.UserSub,
                email: data.email,
                firstName: data.firstName!,
                lastName: data.lastName!,
                createdAt: new Date(),
                updatedAt: new Date(),
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                role: {
                    connect: {
                        id: role.id
                    }
                }
            }
        });

        return parseStringify(cognitoRegisterResult);

    } catch (error) {
        // Handle errors and log them
        console.error("Error registering user:", error);
        throw error;  // Optionally rethrow the error
    } finally {
        // Ensure that the Prisma client disconnects properly
        await prisma.$disconnect();
    }
}
export const insert = async (userData: User) => {
    try {
        await prisma.user.create({
            data: {
                email: userData.email,
                firstName: userData.firstName!,
                lastName: userData.lastName!,
                createdAt: new Date(),
                updatedAt: new Date(),
                employeeId: userData.employeeId,
                title: userData.title,
                company: {
                    connect: {
                        id: 1
                    }
                },
                role: {
                    connect: {
                        id: userData.roleId
                    }
                }
            }
        })
    } catch (error) {
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const getAll = async () => {
    try {
        const users = await prisma.user.findMany({
            include: {
                role: true,
                company: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(users)

        return parseStringify(users);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: number) => {
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
export const update = async (data: User, id: number) => {
    try {
        const licenseTool = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                roleId: data.roleId,
                companyId: data.companyId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
            }
        });
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const remove = async (id: number) => {
    try {
        const asset = await prisma.user.delete({
            where: {
                id: id
            }
        })
        return parseStringify(asset);
    } catch (error) {
        console.log(error)
    }
}




