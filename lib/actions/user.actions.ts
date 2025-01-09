"use server";

import { Prisma } from "@prisma/client";
import { parseStringify, validateEmail } from "@/lib/utils";
import {
  forgetPasswordConfirm,
  forgetPasswordRequestCode,
  signUpUser,
  verifyCognitoAccount,
} from "@/services/aws/Cognito";
import {
  accountVerificationSchema,
  forgotPasswordConfirmSchema,
  forgotPasswordSchema,
  loginSchema,
  userSchema,
} from "@/lib/schemas";
import { auth, signIn } from "@/auth";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { getRoleById } from "@/lib/actions/role.actions";
import { z } from "zod";
import { prisma } from "@/app/db";

export async function login(
  values: z.infer<typeof loginSchema>,
): Promise<ActionResponse<void>> {
  const validation = loginSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid email or password" };
  }

  const { email, password } = validation.data;
  console.log("USER.LOGIN::34 ", email);

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    }).catch((error) => {
      console.error(error);
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again later!" };
      }
    }
    throw error;
  }
}

async function insertUser(data: RegUser, oauthId?: string) {
  if (!data.roleId) {
    throw new Error("Role ID is required");
  }
  console.log("USER.LOGIN::62 ", data);

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
        companyId: data.companyId,
      },
    });
    return user;
  } catch (error) {
    console.error("USER.LOGIN::80 ", error);
    throw error;
  }
}

export async function createUser(
  values: z.infer<typeof userSchema>,
): Promise<ActionResponse<any>> {
  try {
    const validation = await userSchema.parseAsync(values);

    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const role = await getRoleById(validation.roleId);
    if (!role?.data) {
      return { error: "Role not found" };
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
    if (roleName === "Lonee") {
      returnUser = await insertUser(user);
    } else {
      returnUser = await registerUser(user);
    }

    return { data: parseStringify(returnUser) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.message };
    }
    return { error: "User creation failed" };
  }
}

export async function registerUser(
  data: RegUser,
): Promise<ActionResponse<any>> {
  try {
    const cognitoRegisterResult = await signUpUser({
      email: data.email,
      password: data.password,
      companyId: data.companyId,
    });

    if (!cognitoRegisterResult || !cognitoRegisterResult.data.userId) {
      return { error: "Cognito registration failed" };
    }

    const role = await prisma.role.findUnique({
      where: { name: "Admin" },
    });

    if (!role) {
      return { error: "Role not found" };
    }

    const user = await insertUser(data, cognitoRegisterResult.data.userId);

    if (!user) {
      return { error: "Failed to create user in database" };
    }

    return {
      success: true,
      data: parseStringify(cognitoRegisterResult),
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          return { error: "A user with this email already exists" };
        case "P2003":
          return { error: "Invalid company or role reference" };
        default:
          return { error: "Database error during registration" };
      }
    }

    return {
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function resendCode(email: string): Promise<ActionResponse<any>> {
  try {
    if (!validateEmail(email)) {
      return { error: "Invalid email address" };
    }

    const user = await findByEmail(email);
    if (!user) {
      return { error: "Your account does not exist" };
    }

    const result = await forgetPasswordRequestCode(email);
    return { data: result };
  } catch (error) {
    return { success: false, error: "Failed to resend code" };
  }
}

export async function forgotPassword(
  values: z.infer<typeof forgotPasswordSchema>,
): Promise<ActionResponse<void>> {
  try {
    const validation = forgotPasswordSchema.safeParse(values);
    if (!validation.success) {
      return { error: "Invalid email address" };
    }

    await forgetPasswordRequestCode(validation.data.email);
    return { success: true };
  } catch (error) {
    return { error: "Failed to process forgot password request" };
  }
}

export async function forgetPasswordConfirmDetails(
  values: z.infer<typeof forgotPasswordConfirmSchema>,
): Promise<ActionResponse<any>> {
  try {
    const validation = forgotPasswordConfirmSchema.safeParse(values);
    if (!validation.success) {
      return { error: "Invalid email, password or confirmation code" };
    }

    const { email, newPassword, code } = validation.data;
    const result = await forgetPasswordConfirm(
      String(email),
      newPassword,
      code,
    );

    return { data: parseStringify(result) };
  } catch (error) {
    return { error: "Failed to confirm password reset" };
  }
}

export async function verifyAccount(
  values: z.infer<typeof accountVerificationSchema>,
): Promise<ActionResponse<void>> {
  try {
    const validation = accountVerificationSchema.safeParse(values);
    if (!validation.success) {
      return { error: "Invalid email or code" };
    }

    const { email, code } = validation.data;

    await Promise.all([
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      verifyCognitoAccount(email, code),
    ]);

    return { success: true };
  } catch (error) {
    return { error: "Account could not be verified" };
  }
}

export async function getAll(): Promise<ActionResponse<User[]>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const users = await prisma.user.findMany({
      where: {
        companyId: session.user.companyId,
      },
      include: {
        role: true,
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { data: parseStringify(users) };
  } catch (error) {
    return { error: "Failed to fetch users" };
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
        companyId: session.user.companyId,
      },
      include: {
        role: true,
        company: true,
        assets: {
          include: {
            model: true,
            statusLabel: true,
          },
        },
        licenses: true,
        department: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    return { data: parseStringify(user) };
  } catch (error) {
    return { error: "Failed to fetch user" };
  }
}

export async function findByEmail(
  email: string,
): Promise<ActionResponse<User>> {
  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    return { data: parseStringify(user) };
  } catch (error) {
    return { error: "Failed to fetch user" };
  }
}

export async function update(
  id: string,
  data: User,
): Promise<ActionResponse<User>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const user = await prisma.user.update({
      where: {
        id,
        companyId: session.user.companyId,
      },
      data: {
        roleId: data.roleId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { data: parseStringify(user) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "Email already exists" };
      }
    }
    return { error: "Failed to update user" };
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
        companyId: session.user.companyId,
      },
    });

    revalidatePath("/users");
    return { data: parseStringify(user) };
  } catch (error) {
    return { error: "Failed to delete user" };
  }
}
