'use server';

import {PrismaClient, Prisma} from "@prisma/client";
import {parseStringify, validateEmail} from "@/lib/utils";
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
    forgotPasswordConfirmSchema, userSchema, registerSchema
} from "@/lib/schemas";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {auth, signIn} from "@/auth";
import {revalidatePath} from "next/cache";
import {AuthError} from "next-auth";
import locationForm from "@/components/forms/LocationForm";
import {getRoleById} from "@/lib/actions/role.actions";
import {z} from 'zod';

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
        return {error: 'Invalid email or password'};
    }

    const {email, password} = values;

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        });
        return {success: true};
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {error: 'Invalid email or password'};
                default:
                    return {error: 'Something went wrong. Please try again later!'};
            }
        }
        throw error;
    }
}

async function insertUser(data: RegUser, oauthId?: string) {
    return prisma.user.create({
        data: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            firstName: data.firstName!,
            lastName: data.lastName!,
            employeeId: data.employeeId,
            title: data.title,
            companyId: data.companyId,
            roleId: data.roleId!,
            oauthId: oauthId
        }
    });
}

async function findByEmployeeId(employeeId: string) {

    // const session = await auth();

    return prisma.user.findFirst({
        where: {
            employeeId,
            companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04' //session?.user.companyId
        }
    });
}

export async function createUser(values: z.infer<typeof userSchema>): Promise<ActionResponse<any>> {
    try {
        // const validation = userSchema.safeParse(values);
        // if (!validation.success) {
        //     return {error: validation.error.message};
        // }

        const role = await getRoleById(values.roleId);
        const roleName = role?.data?.name;
        const user = {
            roleId: values.roleId,
            email: values.email,
            password: 'MyP@ssw0rd123!',
            firstName: values.firstName,
            lastName: values.lastName,
            title: values.title,
            employeeId: values.employeeId,
            companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04',
        };

        let returnUser = {}
        if (roleName === 'Lonee') {
            returnUser = await insertUser(user);
        } else {
            returnUser = await registerUser(user);
        }
        console.log(returnUser)

        return {data: parseStringify(returnUser)};
    } catch (error) {
        console.error("Error creating user:", error);
        return {error: 'User creation failed'};
    }
}

export async function registerUser(data: RegUser): Promise<ActionResponse<any>> {
    try {

        const cognitoRegisterResult = await signUp({
            email: data.email,
            password: data.password,
            companyId: data.companyId
        });

        const role = await prisma.role.findUnique({
            where: {name: 'Admin'}
        });

        if (!role) {
            return {error: 'Role not found'};
        }
        await insertUser(data, cognitoRegisterResult.UserSub);
        return {data: parseStringify(cognitoRegisterResult)};
    } catch (error) {
        console.error("Error registering user:", error);
        return {error: 'Registration failed'};
    }
}

export async function resendCode(email: string): Promise<ActionResponse<any>> {
    try {
        if (!validateEmail(email)) {
            return {error: 'Invalid email address'};
        }

        const user = await findByEmail(email);
        if (!user) {
            return {error: 'Your account does not exist'};
        }

        const result = await forgetPasswordRequestCode(email);
        return {data: result};
    } catch (error) {
        console.error('Resend code error:', error);
        return {error: 'Failed to resend code'};
    }
}

export async function forgotPassword(
    values: z.infer<typeof forgotPasswordSchema>
): Promise<ActionResponse<void>> {
    try {
        const validation = forgotPasswordSchema.safeParse(values);
        if (!validation.success) {
            return {error: 'Invalid email address'};
        }

        await forgetPasswordRequestCode(validation.data.email);
        return {success: true};
    } catch (error) {
        return {error: 'Failed to process forgot password request'};
    }
}

export async function forgetPasswordConfirmDetails(
    values: z.infer<typeof forgotPasswordConfirmSchema>
): Promise<ActionResponse<any>> {
    try {
        const validation = forgotPasswordConfirmSchema.safeParse(values);
        if (!validation.success) {
            return {error: 'Invalid email, password or confirmation code'};
        }

        const {email, newPassword, code} = validation.data;
        const result = await forgetPasswordConfirm(
            String(email),
            newPassword,
            code
        );

        return {data: parseStringify(result)};
    } catch (error) {
        return {error: 'Failed to confirm password reset'};
    }
}


export async function verifyAccount(values: z.infer<typeof accountVerificationSchema>): Promise<ActionResponse<void>> {
    try {
        const validation = accountVerificationSchema.safeParse(values);
        if (!validation.success) {
            return {error: 'Invalid email or code'};
        }

        const {email, code} = validation.data;

        await Promise.all([
            prisma.user.update({
                where: {email},
                data: {emailVerified: new Date()}
            }),
            verifyCognitoAccount(email, code)
        ]);

        return {success: true};
    } catch (error) {
        return {error: 'Account could not be verified'};
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
            return {error: "Not authenticated"};
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

        return {data: parseStringify(users)};
    } catch (error) {
        return {error: 'Failed to fetch users'};
    }
}

export async function findById(id: string): Promise<ActionResponse<User>> {
    try {
        const session = await auth();
        if (!session) {
            return {error: "Not authenticated"};
        }

        const user = await prisma.user.findFirst({
            where: {
                id,
                companyId: session.user.companyId
            }
        });

        if (!user) {
            return {error: 'User not found'};
        }

        return {data: parseStringify(user)};
    } catch (error) {
        return {error: 'Failed to fetch user'};
    }
}

export async function findByEmail(email: string): Promise<ActionResponse<User>> {
    try {
        const user = await prisma.user.findFirst({
            where: {email}
        });

        return {data: parseStringify(user)};
    } catch (error) {
        return {error: 'Failed to fetch user'};
    }
}

export async function findByOAuth(oauthId: string): Promise<ActionResponse<User>> {
    try {
        const user = await prisma.user.findFirst({
            where: {oauthId},
            include: {
                role: true,
                company: true
            }
        });

        return {data: parseStringify(user)};
    } catch (error) {
        return {error: 'Failed to fetch user'};
    }
}

export async function update(
    id: string,
    data: User
): Promise<ActionResponse<User>> {
    try {
        const session = await auth();
        if (!session) {
            return {error: "Not authenticated"};
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
        return {data: parseStringify(user)};
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return {error: 'Email already exists'};
            }
        }
        return {error: 'Failed to update user'};
    }
}

export async function remove(id: string): Promise<ActionResponse<User>> {
    try {
        const session = await auth();
        if (!session) {
            return {error: "Not authenticated"};
        }

        const user = await prisma.user.delete({
            where: {
                id,
                companyId: session.user.companyId
            }
        });

        revalidatePath('/users');
        return {data: parseStringify(user)};
    } catch (error) {
        return {error: 'Failed to delete user'};
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