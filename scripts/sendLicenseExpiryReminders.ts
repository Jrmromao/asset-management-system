import { prisma } from "@/app/db";
import { EmailService } from "@/services/email";

const DAYS_BEFORE_EXPIRY = 7;

async function main() {
  const now = new Date();
  const soon = new Date(now.getTime() + DAYS_BEFORE_EXPIRY * 24 * 60 * 60 * 1000);

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
        templateName: "licenseAssignment",
        templateData: {
          licenseName: license.name,
          renewalDate: license.renewalDate.toLocaleDateString(),
          companyName: license.company.name,
        },
      });
      console.log(`Sent expiry reminder for license ${license.name} to ${admin.email}`);
    }
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error sending license expiry reminders:", err);
  prisma.$disconnect();
  process.exit(1);
}); 