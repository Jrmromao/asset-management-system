// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // --- Seed Companies ---
  const company1 = await prisma.company.upsert({
    where: { name: "Innovate Inc." },
    update: {},
    create: {
      name: "Innovate Inc.",
      primaryContactEmail: "contact@innovate.com",
    },
  });

  const company2 = await prisma.company.upsert({
    where: { name: "Global Tech" },
    update: {},
    create: {
      name: "Global Tech",
      primaryContactEmail: "contact@globaltech.com",
    },
  });

  console.log(`Created companies: ${company1.name}, ${company2.name}`);

  // --- Seed Roles ---
  const adminRole = await prisma.role.upsert({
    where: { name_companyId: { name: "Admin", companyId: company1.id } },
    update: {},
    create: {
      name: "Admin",
      isAdmin: true,
      companyId: company1.id,
    },
  });

  console.log(`Created role: ${adminRole.name}`);

  // --- Seed Maintenance Status Labels ---
  const MAINTENANCE_STATUS_LABELS = [
    {
      name: "Scheduled",
      colorCode: "#3B82F6",
      description: "Maintenance is scheduled.",
      allowLoan: false,
    },
    {
      name: "In Progress",
      colorCode: "#F59E0B",
      description: "Maintenance is actively being performed.",
      allowLoan: false,
    },
    {
      name: "On Hold",
      colorCode: "#F97316",
      description: "Maintenance is temporarily paused.",
      allowLoan: true,
    },
    {
      name: "Completed",
      colorCode: "#22C55E",
      description: "Maintenance has been successfully completed.",
      allowLoan: true,
    },
    {
      name: "Canceled",
      colorCode: "#EF4444",
      description: "Maintenance has been canceled.",
      allowLoan: true,
    },
    {
      name: "Requires Parts",
      colorCode: "#A855F7",
      description: "Maintenance is on hold pending parts.",
      allowLoan: false,
    },
  ];

  for (const label of MAINTENANCE_STATUS_LABELS) {
    await prisma.statusLabel.upsert({
      where: { name_companyId: { name: label.name, companyId: company1.id } },
      update: {},
      create: { ...label, companyId: company1.id },
    });
  }

  console.log("Seeded maintenance status labels.");

  // --- Seed Flow Rules ---
  const flowRule1 = await prisma.flowRule.create({
    data: {
      name: "Auto-notify on maintenance creation",
      description:
        "Notifies the asset admin when a new maintenance event is created.",
      trigger: "creation",
      priority: 100,
      isActive: true,
      companyId: company1.id,
      actions: {
        create: [
          {
            type: "send_notification",
            parameters: {
              channel: "email",
              template: "new-maintenance-notification",
              recipient: "asset_admin",
            },
            order: 1,
          },
        ],
      },
      conditions: {
        create: [
          {
            field: "asset.isCritical",
            operator: "equals",
            value: "true",
            order: 1,
          },
        ],
      },
    },
  });

  console.log(`Created flow rule: ${flowRule1.name}`);

  // --- Seed Pricing Plan ---
  await prisma.pricingPlan.upsert({
    where: { name: "Pro" },
    update: {},
    create: {
      name: "Pro",
      planType: "PRO",
      assetQuota: 100, // A high number to accommodate any request
      pricePerAsset: 0.39,
      billingCycle: "monthly",
      stripePriceId: "price_1QlZyQ2N5SBY44N5l2hElB14", // Replace with your actual Stripe Price ID
      features: JSON.stringify([
        "Up to 100,000 assets",
        "Advanced reporting",
        "Email support",
      ]),
    },
  });

  console.log("Seeded pricing plan.");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
