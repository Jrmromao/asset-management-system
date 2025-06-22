import { prisma } from "@/app/db";
import { Prisma, User as PrismaUser } from "@prisma/client";

interface CreateUserParams {
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  employeeId?: string;
  roleId: string;
  companyId: string;
  role: {
    name: string;
  };
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private async validateCompany(companyId: string): Promise<boolean> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    return !!company;
  }

  private async createPrismaUser(
    data: CreateUserParams,
    oauthId?: string,
    tx?: Prisma.TransactionClient,
  ): Promise<PrismaUser> {
    const prismaClient = tx || prisma;

    return await prismaClient.user.create({
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
        emailVerified: oauthId ? null : new Date(),
      },
    });
  }

  async createUser(
    data: CreateUserParams,
  ): Promise<ServiceResponse<PrismaUser>> {
    try {
      // Validate company exists
      if (!data.companyId) {
        return {
          success: false,
          error: "Company ID is required",
        };
      }

      const companyExists = await this.validateCompany(data.companyId);
      if (!companyExists) {
        return {
          success: false,
          error: "Invalid company ID or company not found",
        };
      }

      // The logic for creating an auth user (previously with Supabase)
      // will now be handled by Clerk's sign-up flow.
      // This service will now only handle creating the user in the local database.
      const createdPrismaUser = await this.createPrismaUser(data);

      return {
        success: true,
        data: createdPrismaUser,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  }

  async findById(id: string): Promise<ServiceResponse<PrismaUser>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          role: true,
          company: true,
          department: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to find user",
      };
    }
  }

  async updateUser(
    id: string,
    data: Partial<CreateUserParams>,
  ): Promise<ServiceResponse<PrismaUser>> {
    try {
      // If company ID is being updated, validate it exists
      if (data.companyId) {
        const companyExists = await this.validateCompany(data.companyId);
        if (!companyExists) {
          return {
            success: false,
            error: "Invalid company ID or company not found",
          };
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.title && { title: data.title }),
          ...(data.employeeId && { employeeId: data.employeeId }),
          ...(data.roleId && { roleId: data.roleId }),
          ...(data.companyId && { companyId: data.companyId }),
          ...(data.firstName &&
            data.lastName && {
              name: `${data.firstName} ${data.lastName}`,
            }),
        },
      });

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update user",
      };
    }
  }

  async deleteUser(id: string): Promise<ServiceResponse<void>> {
    try {
      const user = await prisma.user.delete({
        where: { id },
      });

      // If the user has an auth account, we should delete it too
      if (user.oauthId) {
        // This will need to be implemented using the Clerk Admin SDK
        // For example: await clerkClient.users.deleteUser(user.oauthId);
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  }
}
