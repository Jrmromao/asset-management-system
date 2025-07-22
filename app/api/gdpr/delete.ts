import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/app/db";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { orgId } = getAuth(req);
    if (!orgId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const company = await prisma.company.findFirst({
      where: { clerkOrgId: orgId },
    });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    // For demo: just log the request. In production, notify admins and start deletion workflow.
    console.log(
      `[GDPR Delete Request] Company: ${company.id} (${company.name}) requested deletion.`,
    );
    // Optionally, mark company as "pending_deletion" in DB
    // await prisma.company.update({ where: { id: company.id }, data: { status: "PENDING_DELETION" } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[GDPR Delete API]", error);
    res.status(500).json({ error: "Failed to request company deletion" });
  }
}
