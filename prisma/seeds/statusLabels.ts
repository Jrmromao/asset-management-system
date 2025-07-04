import { PrismaClient } from "@prisma/client";

export async function seedStatusLabels(prisma: PrismaClient, companyId: string) {
  console.log("🏷️ Seeding status labels...");

  const statusLabels = [
    // { name: "Active", colorCode: "#22C55E", description: "Asset is in use and operational", allowLoan: true },
    // { name: "Inactive", colorCode: "#6B7280", description: "Asset is not currently in use", allowLoan: true },
    // { name: "Maintenance", colorCode: "#F59E0B", description: "Asset is under maintenance", allowLoan: false },
    // { name: "Retired", colorCode: "#EF4444", description: "Asset has been retired", allowLoan: false },
    // { name: "Lost", colorCode: "#8B5CF6", description: "Asset location is unknown", allowLoan: false },
    // { name: "Damaged", colorCode: "#DC2626", description: "Asset is damaged and needs repair", allowLoan: false },
    { name: "Awaiting Return", colorCode: "#FBBF24", description: "Item is awaiting physical return from user", allowLoan: false },  ];

  // const maintenanceStatusLabels = [
  //   { name: "Scheduled", colorCode: "#3B82F6", description: "Maintenance is scheduled", allowLoan: false },
  //   { name: "In Progress", colorCode: "#F59E0B", description: "Maintenance is actively being performed", allowLoan: false },
  //   { name: "On Hold", colorCode: "#F97316", description: "Maintenance is temporarily paused", allowLoan: true },
  //   { name: "Completed", colorCode: "#22C55E", description: "Maintenance has been successfully completed", allowLoan: true },
  //   { name: "Canceled", colorCode: "#EF4444", description: "Maintenance has been canceled", allowLoan: true },
  //   { name: "Requires Parts", colorCode: "#A855F7", description: "Maintenance is on hold pending parts", allowLoan: false },
  // ];

  const allLabels = [...statusLabels];
  const createdLabels = [];

  for (const label of allLabels) {
    const created = await prisma.statusLabel.upsert({
      where: { name_companyId: { name: label.name, companyId } },
      update: {},
      create: { ...label, companyId },
    });
    createdLabels.push(created);
    console.log(`✅ Created status label: ${created.name}`);
  }

  return createdLabels;
} 