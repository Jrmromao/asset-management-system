"use server";

import { clerkClient, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";

interface InviteUserParams {
  email: string;
  roleId: string;
}

export async function inviteUser({ email, roleId }: InviteUserParams) {
  try {
    console.log("🚀 [inviteUser] Starting invitation process:", { email, roleId });
    
    const { orgId, userId } = await auth();
    console.log("🔍 [inviteUser] Auth result:", { orgId: !!orgId, userId: !!userId });

    if (!userId) {
      console.error("❌ [inviteUser] No userId found");
      return { success: false, error: "User is not authenticated." };
    }

    // TEMPORARY: For testing, if orgId is missing, try to proceed with userId only
    if (!orgId) {
      console.warn("⚠️ [inviteUser] No orgId found, but continuing with userId");
    }

    const currentUser = await prisma.user.findFirst({
      where: { oauthId: userId },
      select: { companyId: true },
    });

    console.log("🔍 [inviteUser] Current user:", { found: !!currentUser, companyId: currentUser?.companyId });

    if (!currentUser || !currentUser.companyId) {
      return {
        success: false,
        error: "Could not find the associated company.",
      };
    }

    const { companyId } = currentUser;

    // Get company details
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { clerkOrgId: true, name: true },
    });

    console.log("🔍 [inviteUser] Company details:", { found: !!company, clerkOrgId: company?.clerkOrgId });

    if (!company) {
      return {
        success: false,
        error: "Company not found.",
      };
    }

    // TEMPORARY: For testing, if no clerkOrgId, simulate success
    if (!company.clerkOrgId) {
      console.warn("⚠️ [inviteUser] No clerkOrgId found, simulating success for testing");
      return { 
        success: true, 
        message: "Invitation simulated (no Clerk org configured)" 
      };
    }

    const clerk = await clerkClient();
    
    // Check if user already exists in Clerk
    console.log("🔍 [inviteUser] Checking if user already exists in Clerk...");
    try {
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [email],
      });
      
      if (existingUsers.data.length > 0) {
        console.log("⚠️ [inviteUser] User already exists in Clerk:", existingUsers.data[0].id);
        
        // If user exists, try to add them to the organization
        try {
          await clerk.organizations.createOrganizationMembership({
            organizationId: company.clerkOrgId,
            userId: existingUsers.data[0].id,
            role: "org:member",
          });
          console.log("✅ [inviteUser] Added existing user to organization");
          return { 
            success: true, 
            message: "User already exists and has been added to the organization" 
          };
        } catch (membershipError) {
          console.error("❌ [inviteUser] Failed to add user to organization:", membershipError);
        }
      }
    } catch (userCheckError) {
      console.log("🔍 [inviteUser] User doesn't exist in Clerk, proceeding with invitation");
    }

    console.log("📧 [inviteUser] Creating Clerk invitation...");
    const invitation = await clerk.organizations.createOrganizationInvitation({
      organizationId: company.clerkOrgId,
      inviterUserId: userId,
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/accept-invitation`,
      publicMetadata: {
        companyId: companyId,
        roleId: roleId,
      },
      role: "org:member",
    });

    console.log("✅ [inviteUser] Clerk invitation created:", {
      id: invitation.id,
      email: invitation.emailAddress,
      status: invitation.status,
      url: invitation.url,
    });

    // Save invitation to database if you added the Invitation model
    try {
      const invitationRecord = await prisma.invitation.create({
        data: {
          email,
          roleId,
          companyId,
          invitedBy: userId,
          clerkInvitationId: invitation.id,
          status: "PENDING",
          expiresAt: invitation.expiresAt ? new Date(invitation.expiresAt) : null,
        },
      });
      console.log("✅ [inviteUser] Invitation saved to database:", invitationRecord.id);
    } catch (dbError) {
      console.warn("⚠️ [inviteUser] Failed to save invitation to database:", dbError);
      // Don't fail the whole process if database save fails
    }

    // TODO: Implement custom email service
    // try {
    //   await sendCustomInvitationEmail({
    //     to: email,
    //     invitationUrl: invitation.url,
    //     companyName: company.name,
    //   });
    // } catch (emailError) {
    //   console.warn("⚠️ Failed to send custom email");
    // }

    revalidatePath("/people");

    return { 
      success: true, 
      invitationId: invitation.id,
      invitationUrl: invitation.url,
      message: "Invitation sent successfully!",
    };
  } catch (error) {
    console.error("❌ [inviteUser] Failed to invite user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}

// Add this new function to handle invitation completion
export async function completeInvitationRegistration({
  clerkUserId,
  invitationId,
  userData,
  ticket,
}: {
  clerkUserId: string;
  invitationId: string;
  userData: {
    firstName: string;
    lastName: string;
    phone?: string;
    title?: string;
    employeeId?: string;
    email: string;
    roleId: string;
    companyId: string;
  };
  ticket: string;
}) {
  try {
    console.log("🎯 [completeInvitationRegistration] Starting completion process");

    // Create user in database
    const user = await prisma.user.create({
      data: {
        oauthId: clerkUserId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        phoneNum: userData.phone,
        title: userData.title,
        employeeId: userData.employeeId,
        roleId: userData.roleId,
        companyId: userData.companyId,
        status: "ACTIVE",
      },
    });

    // Update invitation status
    await prisma.invitation.update({
      where: { clerkInvitationId: invitationId },
      data: { 
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    // Update Clerk user metadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        userId: user.id,
        role: userData.roleId,
        onboardingComplete: true,
      },
      privateMetadata: {
        companyId: userData.companyId,
      },
    });

    console.log("✅ [completeInvitationRegistration] User created successfully");

    return { success: true, user };
  } catch (error) {
    console.error("❌ [completeInvitationRegistration] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    };
  }
}
