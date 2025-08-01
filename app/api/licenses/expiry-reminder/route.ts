import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { EmailService } from "@/services/email";

const DAYS_BEFORE_EXPIRY = 7;

// curl -X POST https://your-vercel-domain/api/licenses/expiry-reminder \
//   -H "x-cron-token: your-strong-secret"
export const POST = async (req: NextRequest) => {
  // Token check
  const token = req.headers.get("x-cron-token");
  if (!token || token !== process.env.LICENSE_REMINDER_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const soon = new Date(
    now.getTime() + DAYS_BEFORE_EXPIRY * 24 * 60 * 60 * 1000,
  );

  // Find licenses expiring soon
  const expiringLicenses = await prisma.license.findMany({
    where: {
      renewalDate: {
        gte: now,
        lte: soon,
      },
    },
    include: {
      company: true,
    },
  });

  let sent = 0;
  for (const license of expiringLicenses) {
    // Find admin users for the company
    const admins = await prisma.user.findMany({
      where: {
        companyId: license.companyId,
        role: { isAdmin: true },
        active: true,
      },
    });
    if (!admins.length) continue;

    for (const admin of admins) {
      await EmailService.sendEmail({
        to: admin.email,
        subject: `License Expiry Reminder: ${license.name}`,
        templateName: "licenseExpiryReminder",
        templateData: {
          licenseName: license.name,
          renewalDate: license.renewalDate.toLocaleDateString(),
          companyName: license.company.name,
        },
      });
      sent++;
    }
  }
  await prisma.$disconnect();
  return NextResponse.json({ success: true, sent });
};
