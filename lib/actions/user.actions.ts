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

    if (!data.roleId) {
        throw new Error('Role ID is required');
    }

    return prisma.user.create({
        data: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            firstName: String(data.firstName),
            lastName: String(data.lastName),
            employeeId: data.employeeId,
            title: data.title,
            oauthId: oauthId,
            roleId: data.roleId,
            companyId: data.companyId
        }
    });
}

async function findByEmployeeId(employeeId: string) {

    const session = await auth();

    if (!session) {
        return null;
    }
    return prisma.user.findFirst({
        where: {
            employeeId,
            companyId: session?.user.companyId
        }
    });
}

export async function createUser(values: z.infer<typeof userSchema>): Promise<ActionResponse<any>> {
    try {
        const validation = userSchema.safeParse(values);
        if (!validation.success) {
            return {error: validation.error.message};
        }
        const session = await auth();

        if (!session) {
            return {error: 'Not authenticated'};
        }

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
            companyId: session.user.companyId,
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
        }  // Added this missing closing brace

        const result = await forgetPasswordRequestCode(email);
        return {data: result};
    } catch (error) {
        console.error('Resend code error:', error);
        return {success: false, error: 'Failed to resend code'};
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