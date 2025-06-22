"use server";

import { clerkClient, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/PrismaClient";

interface InviteUserParams {
  email: string;
  roleId: string;
}

export async function inviteUser({ email, roleId }: InviteUserParams) {
  try {
    const { orgId, userId } = await auth();

    if (!orgId || !userId) {
      return { success: false, error: "User is not part of an organization." };
    }

    const currentUser = await prisma.user.findFirst({
      where: { oauthId: userId },
      select: { companyId: true },
    });

    if (!currentUser || !currentUser.companyId) {
      return {
        success: false,
        error: "Could not find the associated company.",
      };
    }

    const { companyId } = currentUser;
    const clerk = await clerkClient();

    const invitation = await clerk.organizations.createOrganizationInvitation({
      organizationId: orgId,
      inviterUserId: userId,
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      publicMetadata: {
        companyId: companyId,
        roleId: roleId,
      },
      role: "org:member",
    });

    revalidatePath("/admin/users");

    return { success: true, invitation };
  } catch (error) {
    console.error("Failed to invite user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}
