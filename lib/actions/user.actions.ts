'use server';
import {parseStringify, validateEmail} from "@/lib/utils";
import {forgetPasswordConfirm, forgetPasswordRequestCode, signUp, verifyCognitoAccount} from "@/services/aws/Cognito";
import {prisma} from "@/app/db";
import {
    accountVerificationSchema,
    forgotPasswordConfirmSchema,
    forgotPasswordSchema,
    loginSchema, waitlistSchema,
} from "@/lib/schemas";
import {z} from "zod";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {AuthError} from "next-auth";
import {auth, signIn} from "@/auth";

export const waitlist = async (values: z.infer<typeof waitlistSchema>) => {
    const validation = waitlistSchema.safeParse(values)
    if (!validation.success) return {error: 'Invalid email '}
    const {email} = validation.data
    try {

          await prisma.waitlist.create({
            data: {
                email: email
            }
        })

    } catch (error) {
        throw error;
    }
}
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
export const resendCode = async (email: string) => {
    try {
        const isValid = validateEmail(email)

        if (!isValid) return {error: 'Invalid email address'}

        const user = await findByEmail(email)

        if (!user) return {error: 'Your account does not exist'}

        return await forgetPasswordRequestCode(email)
    } catch (error) {
        console.log('Caught error in USER.acyion: ',error)

        // return {success: false, message: 'Invalid email or password'};
    }
}
export const forgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    try {
        const validation = forgotPasswordSchema.safeParse(values)
        if (!validation.success) return {error: 'Invalid email address'}
        const {email} = validation.data

        await forgetPasswordRequestCode(email)


        return {success: true};
    } catch (error) {
        return {error: 'Invalid email or password'};
    }
}
export const forgetPasswordConfirmDetails = async (values: z.infer<typeof forgotPasswordConfirmSchema>) => {
    const validation = forgotPasswordConfirmSchema.safeParse(values)
    if (!validation.success) return {error: 'Invalid email, password or confirmation code'}
    const {email, newPassword, code} = validation.data

    console.log(validation.data)

    const result = await forgetPasswordConfirm(String(email), newPassword, code)

    return parseStringify(result);
}
export const registerUser = async (data: RegUser) => {

    let cognitoRegisterResult: any;
    try {
        cognitoRegisterResult = await signUp({
            email: data.email,
            password: data.password,
            companyId: data.companyId
        })

        //Every company has an admin role
        const role = await prisma.role.findUnique({
            where: {
                name: 'Admin'
            }
        });
        if (!role) {
            return {error: 'Role not found'};
        }
        await prisma.user.create({
            data: {
                name: `${data.firstName} ${data.lastName}`,
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
        console.error("Error registering user:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}
export const verifyAccount = async (values: z.infer<typeof accountVerificationSchema>) => {
    const validation = accountVerificationSchema.safeParse(values)
    if (!validation.success) return {error: 'Invalid email or password'}
    const {email, code} = validation.data
    try {
        prisma.user.update({
            where: {
                email
            },
            data: {
                emailVerified: new Date()
            }
        })
        await verifyCognitoAccount(email, code);
        return {success: true};
    } catch (e) {
        return {error: 'Account count not be verified'}
    } finally {
        await prisma.$disconnect();
    }
}
export const insert = async (userData: User) => {
    try {
        const session = await auth()
        await prisma.user.create({
            data: {
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email,
                firstName: userData.firstName!,
                lastName: userData.lastName!,
                employeeId: userData.employeeId,
                title: userData.title,
                company: {
                    connect: {
                        id: session?.user?.companyId
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

        const session = await auth()
        const users = await prisma.user.findMany({
            include: {
                role: true,
                company: true,
            },
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                companyId: session?.user?.companyId
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




