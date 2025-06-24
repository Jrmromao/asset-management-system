import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing invitation token" 
      });
    }

    // Find invitation by secure token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        company: { select: { name: true } },
        role: { select: { name: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid invitation link" 
      });
    }

    // Check if expired
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: "Invitation has expired" 
      });
    }

    // Check if already used
    if (invitation.status !== "PENDING") {
      return NextResponse.json({ 
        success: false, 
        error: "Invitation has already been used" 
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        email: invitation.email,
        companyId: invitation.companyId,
        roleId: invitation.roleId,
        companyName: invitation.company?.name,
        roleName: invitation.role?.name,
        invitationId: invitation.id,
      },
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to validate invitation" 
    });
  }
} 