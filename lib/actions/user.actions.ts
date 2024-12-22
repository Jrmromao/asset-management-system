'use server';

import {Prisma} from "@prisma/client";
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
    forgotPasswordConfirmSchema,
    userSchema,
    registerSchema
} from "@/lib/schemas";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {auth, signIn} from "@/auth";
import {revalidatePath} from "next/cache";
import {AuthError} from "next-auth";
import {getRoleById} from "@/lib/actions/role.actions";
import {z} from 'zod';
import {prisma} from "@/app/db";
import logger from "@/lib/logger";


export async function login(
    values: z.infer<typeof loginSchema>
): Promise<ActionResponse<void>> {
    const validation = loginSchema.safeParse(values);
    if (!validation.success) {
        logger.warn('Login validation failed', {
            issues: validation.error.issues
        });
        return {error: 'Invalid email or password'};
    }

    const {email, password} = validation.data;

    try {
        await signIn('credentials', {
            email,
            password,
            redirect: false
        });
        logger.info('User logged in successfully', {email});
        return {success: true};
    } catch (error) {
        if (error instanceof AuthError) {
            logger.error('Authentication error', {
                type: error.type,
                email
            });
            switch (error.type) {
                case "CredentialsSignin":
                    return {error: 'Invalid email or password'};
                default:
                    return {error: 'Something went wrong. Please try again later!'};
            }
        }
        logger.error('Unexpected login error', {
            error: error instanceof Error ? error.stack : String(error),
            email
        });
        throw error;
    }
}

async function insertUser(data: RegUser, oauthId?: string) {
    if (!data.roleId) {
        logger.error('Role ID missing in user creation');
        throw new Error('Role ID is required');
    }

    try {
        const user = await prisma.user.create({
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
        logger.info('User inserted successfully', {
            userId: user.id,
            email: data.email
        });
        return user;
    } catch (error) {
        logger.error('Error inserting user', {
            error: error instanceof Error ? error.stack : String(error),
            email: data.email
        });
        throw error;
    }
}

async function findByEmployeeId(employeeId: string) {
    const session = await auth();
    if (!session) {
        logger.warn('Unauthorized attempt to find user by employee ID');
        return null;
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                employeeId,
                companyId: session?.user.companyId
            }
        });
        logger.debug('User search by employee ID completed', {
            found: !!user,
            employeeId
        });
        return user;
    } catch (error) {
        logger.error('Error finding user by employee ID', {
            error: error instanceof Error ? error.stack : String(error),
            employeeId
        });
        return null;
    }
}

// export async function createUser(values: z.infer<typeof userSchema>): Promise<ActionResponse<any>> {
//     try {
//         const validation = userSchema.safeParse(values);
//         if (!validation.success) {
//             logger.warn('User creation validation failed', {
//                 issues: validation.error.issues
//             });
//             return {error: validation.error.message};
//         }
//
//         const session = await auth();
//         if (!session) {
//             logger.warn('Unauthorized attempt to create user');
//             return {error: 'Not authenticated'};
//         }
//
//         const role = await getRoleById(values.roleId);
//         if (!role?.data) {
//             logger.error('Role not found during user creation', {
//                 roleId: values.roleId
//             });
//             return {error: 'Role not found'};
//         }
//
//         const roleName = role.data.name;
//
//
//         const user = {
//             roleId: values.roleId,
//             email: values.email!,
//             password: process.env.DEFAULT_PASSWORD!,
//             firstName: values.firstName,
//             lastName: values.lastName,
//             title: values.title,
//             employeeId: values.employeeId,
//             companyId: session.user.companyId,
//         };
//
//         let returnUser;
//         if (roleName === 'Lonee') {
//             returnUser = await insertUser(user);
//         } else {
//             returnUser = await registerUser(user);
//         }
//
//         logger.info('User created successfully', {
//             email: values.email,
//             role: roleName
//         });
//
//         return {data: parseStringify(returnUser)};
//     } catch (error) {
//         logger.error('Error creating user', {
//             error: error instanceof Error ? error.stack : String(error),
//             email: values.email
//         });
//         return {error: 'User creation failed'};
//     }
// }


export async function createUser(values: z.infer<typeof userSchema>): Promise<ActionResponse<any>> {
    try {
        const validation = await userSchema.parseAsync(values);

        console.log("------------------>>>>",values)

        const session = await auth();
        if (!session) {
            logger.warn('Unauthorized attempt to create user');
            return { error: 'Not authenticated' };
        }

        const role = await getRoleById(validation.roleId);
        if (!role?.data) {
            logger.error('Role not found during user creation', {
                roleId: validation.roleId
            });
            return { error: 'Role not found' };
        }

        const roleName = role.data.name;

        const user = {
            roleId: validation.roleId,
            email: validation.email!,
            password: process.env.DEFAULT_PASSWORD!,
            firstName: validation.firstName,
            lastName: validation.lastName,
            title: validation.title,
            employeeId: validation.employeeId,
            companyId: session.user.companyId,
        };

        let returnUser;
        if (roleName === 'Lonee') {
            returnUser = await insertUser(user);
        } else {
            returnUser = await registerUser(user);
        }

        logger.info('User created successfully', {
            email: validation.email,
            role: roleName
        });

        return { data: parseStringify(returnUser) };
    } catch (error) {
        // Enhanced error handling
        if (error instanceof z.ZodError) {
            logger.warn('User creation validation failed', {
                issues: error.issues
            });
            return { error: error.message };
        }

        logger.error('Error creating user', {
            error: error instanceof Error ? error.stack : String(error),
            email: values.email
        });
        return { error: 'User creation failed' };
    }
}

export async function registerUser(data: RegUser): Promise<ActionResponse<any>> {
    try {
        // First try the Cognito signup
        logger.info('Starting Cognito user registration', {
            email: data.email,
            companyId: data.companyId
        });

        const cognitoRegisterResult = await signUp({
            email: data.email,
            password: data.password,
            companyId: data.companyId
        });

        if (!cognitoRegisterResult || !cognitoRegisterResult.UserSub) {
            logger.error('Cognito registration failed - no UserSub returned', {
                email: data.email
            });
            return { error: 'Cognito registration failed' };
        }

        // Then verify role exists
        logger.debug('Verifying admin role exists');
        const role = await prisma.role.findUnique({
            where: { name: 'Admin' }
        });

        if (!role) {
            logger.error('Admin role not found during user registration');
            // TODO: Should clean up Cognito user here
            return { error: 'Role not found' };
        }

        // Finally create the user in the database
        logger.debug('Creating user in database', {
            email: data.email,
            cognitoId: cognitoRegisterResult.UserSub
        });

        const user = await insertUser(data, cognitoRegisterResult.UserSub);

        if (!user) {
            logger.error('Failed to insert user in database', {
                email: data.email,
                cognitoId: cognitoRegisterResult.UserSub
            });
            // TODO: Should clean up Cognito user here
            return { error: 'Failed to create user in database' };
        }

        logger.info('User registered successfully', {
            email: data.email,
            userId: user.id,
            cognitoId: cognitoRegisterResult.UserSub
        });

        return {
            success: true,
            data: parseStringify(cognitoRegisterResult)
        };

    } catch (error) {
        logger.error('Error registering user', {
            error: error instanceof Error ? error.stack : String(error),
            email: data.email,
            errorCode: error instanceof Prisma.PrismaClientKnownRequestError
                ? error.code
                : undefined
        });

        // Handle specific error cases
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    return { error: 'A user with this email already exists' };
                case 'P2003':
                    return { error: 'Invalid company or role reference' };
                default:
                    return { error: 'Database error during registration' };
            }
        }

        return {
            error: error instanceof Error
                ? error.message
                : 'Registration failed'
        };
    }
}

// export async function registerUser(data: RegUser): Promise<ActionResponse<any>> {
//     try {
//         const cognitoRegisterResult = await signUp({
//             email: data.email,
//             password: data.password,
//             companyId: data.companyId
//         });
//
//         const role = await prisma.role.findUnique({
//             where: {name: 'Admin'}
//         });
//
//         if (!role) {
//             logger.error('Admin role not found during user registration');
//             return {error: 'Role not found'};
//         }
//
//         const user = await insertUser(data, cognitoRegisterResult.UserSub);
//         logger.info('User registered successfully', {
//             email: data.email,
//             userId: user.id
//         });
//
//         return {data: parseStringify(cognitoRegisterResult)};
//     } catch (error) {
//         logger.error('Error registering user', {
//             error: error instanceof Error ? error.stack : String(error),
//             email: data.email
//         });
//         return {error: 'Registration failed'};
//     }
// }

export async function resendCode(email: string): Promise<ActionResponse<any>> {
    try {
        if (!validateEmail(email)) {
            logger.warn('Invalid email format for code resend', {email});
            return {error: 'Invalid email address'};
        }

        const user = await findByEmail(email);
        if (!user) {
            logger.warn('Account not found for code resend', {email});
            return {error: 'Your account does not exist'};
        }

        const result = await forgetPasswordRequestCode(email);
        logger.info('Verification code resent successfully', {email});
        return {data: result};
    } catch (error) {
        logger.error('Error resending code', {
            error: error instanceof Error ? error.stack : String(error),
            email
        });
        return {success: false, error: 'Failed to resend code'};
    }
}

export async function forgotPassword(
    values: z.infer<typeof forgotPasswordSchema>
): Promise<ActionResponse<void>> {
    try {
        const validation = forgotPasswordSchema.safeParse(values);
        if (!validation.success) {
            logger.warn('Forgot password validation failed', {
                issues: validation.error.issues
            });
            return {error: 'Invalid email address'};
        }

        await forgetPasswordRequestCode(validation.data.email);
        logger.info('Password reset code sent successfully', {
            email: validation.data.email
        });
        return {success: true};
    } catch (error) {
        logger.error('Error in forgot password process', {
            error: error instanceof Error ? error.stack : String(error)
        });
        return {error: 'Failed to process forgot password request'};
    }
}

export async function forgetPasswordConfirmDetails(
    values: z.infer<typeof forgotPasswordConfirmSchema>
): Promise<ActionResponse<any>> {
    try {
        const validation = forgotPasswordConfirmSchema.safeParse(values);
        if (!validation.success) {
            logger.warn('Password reset confirmation validation failed', {
                issues: validation.error.issues
            });
            return {error: 'Invalid email, password or confirmation code'};
        }

        const {email, newPassword, code} = validation.data;
        const result = await forgetPasswordConfirm(
            String(email),
            newPassword,
            code
        );

        logger.info('Password reset confirmed successfully', {email});
        return {data: parseStringify(result)};
    } catch (error) {
        logger.error('Error confirming password reset', {
            error: error instanceof Error ? error.stack : String(error)
        });
        return {error: 'Failed to confirm password reset'};
    }
}

export async function verifyAccount(
    values: z.infer<typeof accountVerificationSchema>
): Promise<ActionResponse<void>> {
    try {
        const validation = accountVerificationSchema.safeParse(values);
        if (!validation.success) {
            logger.warn('Account verification validation failed', {
                issues: validation.error.issues
            });
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

        logger.info('Account verified successfully', {email});
        return {success: true};
    } catch (error) {
        logger.error('Error verifying account', {
            error: error instanceof Error ? error.stack : String(error)
        });
        return {error: 'Account could not be verified'};
    }
}

export async function getAll(): Promise<ActionResponse<User[]>> {
    try {
        const session = await auth();
        if (!session) {
            logger.warn('Unauthorized attempt to fetch all users');
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

        logger.debug('Users fetched successfully', {
            count: users.length,
            companyId: session.user.companyId
        });
        return {data: parseStringify(users)};
    } catch (error) {
        logger.error('Error fetching users', {
            error: error instanceof Error ? error.stack : String(error)
        });
        return {error: 'Failed to fetch users'};
    }
}

export async function findById(id: string): Promise<ActionResponse<User>> {
    try {
        const session = await auth();
        if (!session) {
            logger.warn('Unauthorized attempt to find user by ID', {id});
            return {error: "Not authenticated"};
        }

        const user = await prisma.user.findFirst({
            where: {
                id,
                companyId: session.user.companyId
            }
        });

        if (!user) {
            logger.warn('User not found', {id});
            return {error: 'User not found'};
        }

        logger.debug('User found successfully', {id});
        return {data: parseStringify(user)};
    } catch (error) {
        logger.error('Error finding user by ID', {
            error: error instanceof Error ? error.stack : String(error),
            id
        });
        return {error: 'Failed to fetch user'};
    }
}

export async function findByEmail(email: string): Promise<ActionResponse<User>> {
    try {
        const user = await prisma.user.findFirst({
            where: {email}
        });

        logger.debug('User search by email completed', {
            found: !!user,
            email
        });
        return {data: parseStringify(user)};
    } catch (error) {
        logger.error('Error finding user by email', {
            error: error instanceof Error ? error.stack : String(error),
            email
        });
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

        logger.debug('User search by OAuth ID completed', {
            found: !!user,
            oauthId
        });
        return {data: parseStringify(user)};
    } catch (error) {
        logger.error('Error finding user by OAuth ID', {
            error: error instanceof Error ? error.stack : String(error),
            oauthId
        });
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
            logger.warn('Unauthorized attempt to update user', {id});
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

        logger.info('User updated successfully', {
            id,
            email: data.email
        });

        revalidatePath('/users');
        revalidatePath(`/users/${id}`);
        return {data: parseStringify(user)};
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                logger.warn('Duplicate email during user update', {
                    id,
                    email: data.email
                });
                return {error: 'Email already exists'};
            }
        }
        logger.error('Error updating user', {
            error: error instanceof Error ? error.stack : String(error),
            id
        });
        return {error: 'Failed to update user'};
    }
}

export async function remove(id: string): Promise<ActionResponse<User>> {
    try {
        const session = await auth();
        if (!session) {
            logger.warn('Unauthorized attempt to delete user', {id});
            return {error: "Not authenticated"};
        }

        const user = await prisma.user.delete({
            where: {
                id,
                companyId: session.user.companyId
            }
        });

        logger.info('User deleted successfully', {id});
        revalidatePath('/users');
        return {data: parseStringify(user)};
    } catch (error) {
        logger.error('Error deleting user', {
            error: error instanceof Error ? error.stack : String(error),
            id
        });
        return {error: 'Failed to delete user'};
    }
}

// Helper function to handle transaction errors
async function handleTransaction<T>(
    operation: () => Promise<T>,
    errorMessage: string,
    context: Record<string, any> = {}
): Promise<ActionResponse<T>> {
    try {
        const result = await operation();
        return {data: parseStringify(result)};
    } catch (error) {
        logger.error(errorMessage, {
            error: error instanceof Error ? error.stack : String(error),
            ...context
        });
        return {error: errorMessage};
    }
}

// Helper function to validate session
async function validateSession(
    operation: string
): Promise<{ session: any; error?: string }> {
    const session = await auth();
    if (!session) {
        logger.warn(`Unauthorized attempt: ${operation}`);
        return {session: null, error: 'Not authenticated'};
    }
    return {session};
}

// Helper function for error handling
function handlePrismaError(error: unknown, defaultMessage: string): ActionResponse<any> {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return {error: 'This record already exists'};
            case 'P2025':
                return {error: 'Record not found'};
            case 'P2003':
                return {error: 'Invalid relationship reference'};
            default:
                return {error: defaultMessage};
        }
    }
    return {error: defaultMessage};
}