'use server';
import {parseStringify} from "@/lib/utils";
import {signUp} from "@/services/aws/Cognito";
import {prisma} from "@/app/db";
import {loginSchema} from "@/lib/schemas";
import {z} from "zod";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {AuthError} from "next-auth";
import {signIn} from "@/auth";


export const login = async (values: z.infer<typeof loginSchema>) => {
    const validation = loginSchema.safeParse(values)
    if (!validation.success) return {error: 'Invalid email or password'}
    const {email, password} = validation.data
    try {
        await signIn('credentials', {
            email: email,
            password: password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {error: 'Invalid email or password'}
                default:
                    return {error: 'Something went wrong. Please try again later!'}
            }
        }
        throw error;
    }
}

export const registerUser = async (data: RegUser) => {
    let cognitoRegisterResult: any;
    try {
        cognitoRegisterResult = await signUp({
             email: data.email,
            password: data.password,
            companyId: data.companyId
        })

        const role = await prisma.role.findUnique({
            where: {
                name: 'Admin'
            }
        });

        if (!role) {
            return {error: 'Role not found'};
        }
        console.log(JSON.stringify(cognitoRegisterResult, null, 2));


        await prisma.user.create({
            data: {
                name: 'Joao',
                oauthId: cognitoRegisterResult.UserSub,
                email: data.email,
                firstName: data.firstName!,
                lastName: data.lastName!,
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
// export const insert = async (userData: User) => {
//     try {
//         await prisma.user.create({
//             data: {
//                 name: 'Joao',
//                 email: userData.email,
//                 firstName: userData.firstName!,
//                 lastName: userData.lastName!,
//                 employeeId: userData.employeeId,
//                 title: userData.title,
//                 company: {
//                     connect: {
//                         id: String(2)
//                     }
//                 },
//                 role: {
//                     connect: {
//                         id: userData.roleId
//                     }
//                 }
//             }
//         })
//     } catch (error) {
//         console.error(error)
//     } finally {
//         await prisma.$disconnect()
//     }
// }
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
            }
        });
        return parseStringify(user);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
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
export const update = async (data: User, id: string) => {
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
export const remove = async (id: string) => {
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




