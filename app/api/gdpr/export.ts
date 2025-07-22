import { prisma } from "@/app/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log("\n\n\n\n[GDPR Export] GET request received");

  const authInfo = getAuth(request);
  console.log("[GDPR Export] getAuth:", authInfo);
  const { orgId, userId, sessionId } = authInfo;

  // Log all companies for debugging
  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true, clerkOrgId: true },
  });
  console.log("[GDPR Export] All companies:", allCompanies);

  if (!orgId) {
    console.log(
      "[GDPR Export] No orgId found. userId:",
      userId,
      "sessionId:",
      sessionId,
    );
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  console.log("[GDPR Export] Looking for company with clerkOrgId:", orgId);

  const company = await prisma.company.findFirst({
    where: { clerkOrgId: orgId },
  });

  if (!company) {
    // Try to suggest the closest match
    const similar = allCompanies.find(
      (c) => c.clerkOrgId && c.clerkOrgId.includes(orgId.slice(0, 8)),
    );
    return new Response(
      JSON.stringify({
        error: "Company not found for this orgId",
        orgId,
        suggestion: similar
          ? `Closest match: ${similar.clerkOrgId} (${similar.name})`
          : "No similar orgId found",
        allClerkOrgIds: allCompanies.map((c) => c.clerkOrgId),
      }),
      { status: 404 },
    );
  }

  const exportData = { company };
  return new Response(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=company-export.json",
    },
  });
}

export const POST = GET;
