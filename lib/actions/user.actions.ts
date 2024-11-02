'use server';

import { PrismaClient, Prisma } from "@prisma/client";
import { parseStringify, validateEmail } from "@/lib/utils";
import {
    signUp,
    verifyCognitoAccount,
    forgetPasswordConfirm,
    forgetPasswordRequestCode
} from "@/services/aws/Cognito";
import {
    loginSchema,
    accountVerificationSchema,
    forgotPasswordSchema,
    forgotPasswordConfirmSchema
} from "@/lib/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { auth, signIn } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AuthError } from "next-auth";

const prisma = new PrismaClient();

type ActionResponse<T> = {
    data?: T;
    error?: string;
    success?: boolean;
};

// Authentication Actions
export async function login(
    values: z.infer<typeof loginSchema>
): Promise<ActionResponse<void>> {
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
        return { error: 'Invalid email or password' };
    }

    const { email, password } = validation.data;

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        });
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: 'Invalid email or password' };
                default:
                    return { error: 'Something went wrong. Please try again later!' };
            }
        }
        throw error;
    }
}

export async function registerUser(data: RegUser): Promise<ActionResponse<any>> {
    try {
        // Register in Cognito
        const cognitoRegisterResult = await signUp({
            email: data.email,
            password: data.password,
            companyId: data.companyId
        });

        // Find admin role
        const role = await prisma.role.findUnique({
            where: { name: 'Admin' }
        });

        if (!role) {
            return { error: 'Role not found' };
        }

        // Create user in database
        await prisma.user.create({
            data: {
                name: `${data.firstName} ${data.lastName}`,
                oauthId: cognitoRegisterResult.UserSub,
                email: data.email,
                firstName: data.firstName!,
                lastName: data.lastName!,
                companyId: data.companyId,
                roleId: role.id
            }
        });

        return { data: parseStringify(cognitoRegisterResult) };
    } catch (error) {
        console.error("Error registering user:", error);
        return { error: 'Registration failed' };
    }
}

// Password Recovery Actions
export async function resendCode(email: string): Promise<ActionResponse<any>> {
    try {
        if (!validateEmail(email)) {
            return { error: 'Invalid email address' };
        }

        const user = await findByEmail(email);
        if (!user) {
            return { error: 'Your account does not exist' };
        }

        const result = await forgetPasswordRequestCode(email);
        return { data: result };
    } catch (error) {
        console.error('Resend code error:', error);
        return { error: 'Failed to resend code' };
    }
}

export async function forgotPassword(
    values: z.infer<typeof forgotPasswordSchema>
): Promise<ActionResponse<void>> {
    try {
        const validation = forgotPasswordSchema.safeParse(values);
        if (!validation.success) {
            return { error: 'Invalid email address' };
        }

        await forgetPasswordRequestCode(validation.data.email);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to process forgot password request' };
    }
}

export async function forgetPasswordConfirmDetails(
    values: z.infer<typeof forgotPasswordConfirmSchema>
): Promise<ActionResponse<any>> {
    try {
        const validation = forgotPasswordConfirmSchema.safeParse(values);
        if (!validation.success) {
            return { error: 'Invalid email, password or confirmation code' };
        }

        const { email, newPassword, code } = validation.data;
        const result = await forgetPasswordConfirm(
            String(email),
            newPassword,
            code
        );

        return { data: parseStringify(result) };
    } catch (error) {
        return { error: 'Failed to confirm password reset' };
    }
}

// Account Verification
export async function verifyAccount(values: z.infer<typeof accountVerificationSchema>): Promise<ActionResponse<void>> {
    try {
        const validation = accountVerificationSchema.safeParse(values);
        if (!validation.success) {
            return { error: 'Invalid email or code' };
        }

        const { email, code } = validation.data;

        await Promise.all([
            prisma.user.update({
                where: { email },
                data: { emailVerified: new Date() }
            }),
            verifyCognitoAccount(email, code)
        ]);

        return { success: true };
    } catch (error) {
        return { error: 'Account could not be verified' };
    }
}
// TODO check if this is needed
// // CRUD Operations
// export async function insert(userData: User): Promise<ActionResponse<User>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return { error: "Not authenticated" };
//         }
//
//         const user = await prisma.user.create({
//             data: {
//                 name: `${userData.firstName} ${userData.lastName}`,
//                 email: userData.email,
//                 firstName: userData.firstName!,
//                 lastName: userData.lastName!,
//                 employeeId: userData.employeeId,
//                 title: userData.title,
//                 companyId: session.user.companyId,
//                 roleId: userData.roleId!
//             }
//         });
//
//         revalidatePath('/users');
//         return { data: parseStringify(user) };
//     } catch (error) {
//         if (error instanceof Prisma.PrismaClientKnownRequestError) {
//             if (error.code === 'P2002') {
//                 return { error: 'Email already exists' };
//             }
//         }
//         return { error: 'Failed to create user' };
//     }
// }

export async function getAll(): Promise<ActionResponse<User[]>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const users = await prisma.user.findMany({
            where: {
                companyId: session.user.companyId
            },
            include: {
                role: true,
                company: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { data: parseStringify(users) };
    } catch (error) {
        return { error: 'Failed to fetch users' };
    }
}

export async function findById(id: string): Promise<ActionResponse<User>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const user = await prisma.user.findFirst({
            where: {
                id,
                companyId: session.user.companyId
            }
        });

        if (!user) {
            return { error: 'User not found' };
        }

        return { data: parseStringify(user) };
    } catch (error) {
        return { error: 'Failed to fetch user' };
    }
}

export async function findByEmail(email: string): Promise<ActionResponse<User>> {
    try {
        const user = await prisma.user.findFirst({
            where: { email }
        });

        return { data: parseStringify(user) };
    } catch (error) {
        return { error: 'Failed to fetch user' };
    }
}

export async function findByAuthId(oauthId: string): Promise<ActionResponse<User>> {
    try {
        const user = await prisma.user.findFirst({
            where: { oauthId },
            include: {
                role: true,
                company: true
            }
        });

        return { data: parseStringify(user) };
    } catch (error) {
        return { error: 'Failed to fetch user' };
    }
}

export async function update(
    id: string,
    data: User
): Promise<ActionResponse<User>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const user = await prisma.user.update({
            where: {
                id,
                companyId: session.user.companyId
            },
            data: {
                roleId: data.roleId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
            }
        });

        revalidatePath('/users');
        revalidatePath(`/users/${id}`);
        return { data: parseStringify(user) };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: 'Email already exists' };
            }
        }
        return { error: 'Failed to update user' };
    }
}

export async function remove(id: string): Promise<ActionResponse<User>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const user = await prisma.user.delete({
            where: {
                id,
                companyId: session.user.companyId
            }
        });

        revalidatePath('/users');
        return { data: parseStringify(user) };
    } catch (error) {
        return { error: 'Failed to delete user' };
    }
}


//TODO soft delete

// export async function softDelete(id: string): Promise<ActionResponse<User>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return { error: "Not authenticated" };
//         }
//
//         const user = await prisma.user.update({
//             where: {
//                 id,
//                 companyId: session.user.companyId
//             },
//             data: {
//                 isActive: false
//             }
//         });
//
//         revalidatePath('/users');
//         return { data: parseStringify(user) };
//     } catch (error) {
//         console.error('Soft delete user error:', error);
//         return { error: 'Failed to deactivate user' };
//     }
// }
//
// export async function reactivateUser(id: string): Promise<ActionResponse<User>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return { error: "Not authenticated" };
//         }
//
//         const user = await prisma.user.update({
//             where: {
//                 id,
//                 companyId: session.user.companyId
//             },
//             data: {
//                 isActive: true
//             }
//         });
//
//         revalidatePath('/users');
//         return { data: parseStringify(user) };
//     } catch (error) {
//         console.error('Reactivate user error:', error);
//         return { error: 'Failed to reactivate user' };
//     }
// }
//
// // Modify existing getAll to include active status filter
// export async function getAll(params?: {
//     includeInactive?: boolean;
//     search?: string;
// }): Promise<ActionResponse<User[]>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return { error: "Not authenticated" };
//         }
//
//         const where: Prisma.UserWhereInput = {
//             companyId: session.user.companyId,
//             // Only include active users by default
//             ...(params?.includeInactive ? {} : { isActive: true }),
//             ...(params?.search && {
//                 OR: [
//                     { email: { contains: params.search, mode: 'insensitive' } },
//                     { firstName: { contains: params.search, mode: 'insensitive' } },
//                     { lastName: { contains: params.search, mode: 'insensitive' } },
//                 ],
//             }),
//         };
//
//         const users = await prisma.user.findMany({
//             where,
//             include: {
//                 role: true,
//                 company: true,
//             },
//             orderBy: {
//                 createdAt: 'desc'
//             }
//         });
//
//         return { data: parseStringify(users) };
//     } catch (error) {
//         console.error('Get users error:', error);
//         return { error: 'Failed to fetch users' };
//     }
// }
//
// // Utility function to get inactive users
// export async function getInactiveUsers(): Promise<ActionResponse<User[]>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return { error: "Not authenticated" };
//         }
//
//         const users = await prisma.user.findMany({
//             where: {
//                 companyId: session.user.companyId,
//                 isActive: false
//             },
//             include: {
//                 role: true,
//                 company: true,
//             },
//             orderBy: {
//                 updatedAt: 'desc'
//             }
//         });
//
//         return { data: parseStringify(users) };
//     } catch (error) {
//         console.error('Get inactive users error:', error);
//         return { error: 'Failed to fetch inactive users' };
//     }
// }
//
// // Add method to get user status
// export async function getUserStatus(id: string): Promise<ActionResponse<{ isActive: boolean }>> {
//     try {
//         const session = await auth();
//         if (!session) {
//             return { error: "Not authenticated" };
//         }
//
//         const user = await prisma.user.findFirst({
//             where: {
//                 id,
//                 companyId: session.user.companyId
//             },
//             select: {
//                 isActive: true
//             }
//         });
//
//         if (!user) {
//             return { error: 'User not found' };
//         }
//
//         return { data: { isActive: user.isActive } };
//     } catch (error) {
//         console.error('Get user status error:', error);
//         return { error: 'Failed to fetch user status' };
//     }
// }