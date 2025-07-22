import { prisma } from "@/app/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authInfo = getAuth(request);
  const { orgId, userId } = authInfo;

  if (!userId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  const companyInclude = {
    users: true,
    roles: true,
    invitations: true,
    departments: true,
    locations: true,
    inventories: true,
    statusLabels: true,
    suppliers: true,
    assets: true,
    categories: true,
    manufacturers: true,
    models: true,
    formTemplates: true,
    auditLogs: true,
    accessories: true,
    License: true,
    AccessoryStock: true,
    LicenseSeat: true,
    AssetHistory: true,
    Kit: true,
    ReportConfiguration: true,
    GeneratedReport: true,
    Subscription: true,
    flowRules: true,
    userItems: true,
    purchaseOrders: true,
    costOptimizationAnalyses: true,
    costBudgets: true,
    reportDownloads: true,
    reportCleanupLogs: true,
    fileProtectionRules: true,
    cleanupPolicies: true,
    storageAnalytics: true,
    settings: true,
  };

  let company = null;

  if (orgId) {
    company = await prisma.company.findFirst({
      where: { clerkOrgId: orgId },
      include: companyInclude,
    });
  }

  if (!company) {
    company = await prisma.company.findFirst({
      include: companyInclude,
    });
  }

  if (!company) {
    return new Response(JSON.stringify({ error: "Company not found" }), {
      status: 404,
    });
  }

  // Check if the user is an admin in this company
  const user = await prisma.user.findFirst({
    where: { id: userId, companyId: company.id },
    include: { role: true },
  });
  if (!user || !user.role?.isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden: Admins only" }), {
      status: 403,
    });
  }

  // Log the export event in auditLogs
  await prisma.auditLog.create({
    data: {
      action: "EXPORT_COMPANY_DATA",
      entity: "COMPANY",
      entityId: company.id,
      userId: userId,
      companyId: company.id,
      details: `Company data exported by user ${userId}`,
    },
  });

  return new Response(JSON.stringify(company, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=company-export.json",
    },
  });
}

export const POST = GET;
