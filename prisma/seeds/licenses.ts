import { PrismaClient } from "@prisma/client";

export async function seedLicenses(prisma: PrismaClient, companyId: string) {
  console.log("📄 Seeding licenses...");

  // Get required data for license creation
  const statusLabels = await prisma.statusLabel.findMany({ where: { companyId } });
  const departments = await prisma.department.findMany({ where: { companyId } });
  const locations = await prisma.departmentLocation.findMany({ where: { companyId } });
  const inventories = await prisma.inventory.findMany({ where: { companyId } });
  const suppliers = await prisma.supplier.findMany({ where: { companyId } });
  const manufacturers = await prisma.manufacturer.findMany({ where: { companyId } });

  const licenses = [
    {
      name: "Adobe Creative Cloud for Teams",
      licensedEmail: "admin@techcorp.com",
      poNumber: "PO-2024-001",
      statusName: "Active",
      supplierName: "Apple Inc.",
      departmentName: "Marketing",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      manufacturerName: "Apple",
      renewalDate: new Date("2024-12-31"),
      purchaseDate: new Date("2024-01-01"),
      purchaseNotes: "Annual subscription for marketing team",
      licenseUrl: "https://admin.adobe.com",
      minSeatsAlert: 2,
      alertRenewalDays: 30,
      seats: 15,
      purchasePrice: 7200.00,
      renewalPrice: 7560.00,
      monthlyPrice: 630.00,
      annualPrice: 7200.00,
      pricePerSeat: 48.00,
      billingCycle: "annual",
      currency: "USD",
      discountPercent: 5.00,
      utilizationRate: 0.80,
      costCenter: "MARKETING",
      budgetCode: "MKT-2024-001",
    },
    {
      name: "Microsoft 365 Business Premium",
      licensedEmail: "admin@techcorp.com",
      poNumber: "PO-2024-002",
      statusName: "Active",
      supplierName: "Microsoft",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      manufacturerName: "Microsoft",
      renewalDate: new Date("2024-08-15"),
      purchaseDate: new Date("2023-08-15"),
      purchaseNotes: "Company-wide productivity suite",
      licenseUrl: "https://admin.microsoft.com",
      minSeatsAlert: 5,
      alertRenewalDays: 60,
      seats: 50,
      purchasePrice: 10500.00,
      renewalPrice: 11025.00,
      monthlyPrice: 900.00,
      annualPrice: 10500.00,
      pricePerSeat: 21.00,
      billingCycle: "annual",
      currency: "USD",
      discountPercent: 0.00,
      utilizationRate: 0.94,
      costCenter: "IT",
      budgetCode: "IT-2024-001",
    },
    {
      name: "Slack Pro",
      licensedEmail: "admin@techcorp.com",
      poNumber: "PO-2024-003",
      statusName: "Active",
      supplierName: "Amazon Business",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      manufacturerName: "Apple",
      renewalDate: new Date("2024-03-15"),
      purchaseDate: new Date("2023-03-15"),
      purchaseNotes: "Team communication platform",
      licenseUrl: "https://techcorp.slack.com/admin",
      minSeatsAlert: 10,
      alertRenewalDays: 30,
      seats: 75,
      purchasePrice: 5400.00,
      renewalPrice: 5670.00,
      monthlyPrice: 450.00,
      annualPrice: 5400.00,
      pricePerSeat: 7.25,
      billingCycle: "annual",
      currency: "USD",
      discountPercent: 0.00,
      utilizationRate: 0.96,
      costCenter: "IT",
      budgetCode: "IT-2024-002",
    },
  ];

  const createdLicenses = [];
  for (const licenseData of licenses) {
    try {
      const license = await prisma.license.create({
        data: {
          name: licenseData.name,
          licensedEmail: licenseData.licensedEmail,
          poNumber: licenseData.poNumber,
          companyId, // ✅ Linked to company: cmc80pcez00048oa5v3px063c
          statusLabelId: statusLabels.find(s => s.name === licenseData.statusName)?.id,
          supplierId: suppliers.find(s => s.name === licenseData.supplierName)?.id,
          departmentId: departments.find(d => d.name === licenseData.departmentName)?.id,
          locationId: locations.find(l => l.name === licenseData.locationName)?.id,
          inventoryId: inventories.find(i => i.name === licenseData.inventoryName)?.id,
          manufacturerId: manufacturers.find(m => m.name === licenseData.manufacturerName)?.id,
          renewalDate: licenseData.renewalDate,
          purchaseDate: licenseData.purchaseDate,
          purchaseNotes: licenseData.purchaseNotes,
          licenseUrl: licenseData.licenseUrl,
          minSeatsAlert: licenseData.minSeatsAlert,
          alertRenewalDays: licenseData.alertRenewalDays,
          seats: licenseData.seats,
          purchasePrice: licenseData.purchasePrice,
          renewalPrice: licenseData.renewalPrice,
          monthlyPrice: licenseData.monthlyPrice,
          annualPrice: licenseData.annualPrice,
          pricePerSeat: licenseData.pricePerSeat,
          billingCycle: licenseData.billingCycle,
          currency: licenseData.currency,
          discountPercent: licenseData.discountPercent,
          utilizationRate: licenseData.utilizationRate,
          costCenter: licenseData.costCenter,
          budgetCode: licenseData.budgetCode,
          lastUsageAudit: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        },
      });
      createdLicenses.push(license);
      console.log(`✅ Created license: ${license.name} (Company: ${companyId})`);
    } catch (error) {
      console.error(`❌ Failed to create license ${licenseData.name}:`, error);
    }
  }

  return createdLicenses;
} 