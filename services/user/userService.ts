import { prisma } from "@/app/db";
import { Prisma, User as PrismaUser } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

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

interface InvitationParams {
  email: string;
  roleId: string;
  companyId: string;
  invitedBy: string;
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

  private async validateRole(roleId: string, companyId: string): Promise<boolean> {
    const role = await prisma.role.findFirst({
      where: { 
        id: roleId,
        companyId: companyId 
      },
    });
    return !!role;
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

      // Validate role exists for this company
      const roleExists = await this.validateRole(data.roleId, data.companyId);
      if (!roleExists) {
        return {
          success: false,
          error: "Invalid role ID or role not found for this company",
        };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: "User with this email already exists",
        };
      }

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

  async inviteUser(
    params: InvitationParams
  ): Promise<ServiceResponse<{ invitationId: string }>> {
    try {
      // Validate company exists
      const companyExists = await this.validateCompany(params.companyId);
      if (!companyExists) {
        return {
          success: false,
          error: "Invalid company ID or company not found",
        };
      }

      // Validate role exists for this company
      const roleExists = await this.validateRole(params.roleId, params.companyId);
      if (!roleExists) {
        return {
          success: false,
          error: "Invalid role ID or role not found for this company",
        };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: params.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: "User with this email already exists",
        };
      }

      // Get company details for the invitation
      const company = await prisma.company.findUnique({
        where: { id: params.companyId },
        select: { clerkOrgId: true, name: true },
      });

      if (!company?.clerkOrgId) {
        return {
          success: false,
          error: "Company organization not found",
        };
      }

      // Send Clerk invitation
      const clerk = await clerkClient();
      const invitation = await clerk.organizations.createOrganizationInvitation({
        organizationId: company.clerkOrgId,
        inviterUserId: params.invitedBy,
        emailAddress: params.email,
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/sign-in`,
        publicMetadata: {
          companyId: params.companyId,
          roleId: params.roleId,
        },
        role: "org:member",
      });

      return {
        success: true,
        data: { invitationId: invitation.id },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send invitation",
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

      // If role ID is being updated, validate it exists for the company
      if (data.roleId && data.companyId) {
        const roleExists = await this.validateRole(data.roleId, data.companyId);
        if (!roleExists) {
          return {
            success: false,
            error: "Invalid role ID or role not found for this company",
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
        try {
          const clerk = await clerkClient();
          await clerk.users.deleteUser(user.oauthId);
        } catch (clerkError) {
          console.warn("Failed to delete user from Clerk:", clerkError);
          // Don't fail the entire operation if Clerk deletion fails
        }
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

  async getAllUsers(companyId: string): Promise<ServiceResponse<PrismaUser[]>> {
    try {
      const users = await prisma.user.findMany({
        where: { companyId },
        include: {
          role: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users",
      };
    }
  }
}
