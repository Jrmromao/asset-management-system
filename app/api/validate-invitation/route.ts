import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";

export async function POST(request: Request) {
  try {
    const { ticket, invitationId } = await request.json();

    if (!ticket && !invitationId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing invitation parameters" 
      });
    }

    // If we have a ticket, decode it to get invitation info
    if (ticket) {
      try {
        // Decode JWT ticket to get invitation data
        const base64Payload = ticket.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        
        const clerk = await clerkClient();
        const invitation = await clerk.organizations.getOrganizationInvitation({
          organizationId: payload.oid,
          invitationId: payload.sid,
        });

        if (invitation.status !== "pending") {
          return NextResponse.json({ 
            success: false, 
            error: "Invitation has already been used or expired" 
          });
        }

        // Get invitation from our database
        const dbInvitation = await prisma.invitation.findUnique({
          where: { clerkInvitationId: invitation.id },
          include: {
            company: { select: { name: true } },
            role: { select: { name: true } },
          },
        });

        return NextResponse.json({
          success: true,
          data: {
            email: invitation.emailAddress,
            companyId: dbInvitation?.companyId,
            roleId: dbInvitation?.roleId,
            companyName: dbInvitation?.company?.name,
            roleName: dbInvitation?.role?.name,
            invitationId: invitation.id,
          },
        });
      } catch (error) {
        console.error("Error validating invitation:", error);
        return NextResponse.json({ 
          success: false, 
          error: "Invalid invitation link" 
        });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: "Invalid invitation format" 
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to validate invitation" 
    });
  }
} 