import { PrismaClient } from "@prisma/client";

export async function seedAccessories(prisma: PrismaClient, companyId: string) {
  console.log("🔌 Seeding accessories...");

  // Get required data for accessory creation
  const statusLabels = await prisma.statusLabel.findMany({ where: { companyId } });
  const categories = await prisma.category.findMany({ where: { companyId } });
  const departments = await prisma.department.findMany({ where: { companyId } });
  const locations = await prisma.departmentLocation.findMany({ where: { companyId } });
  const inventories = await prisma.inventory.findMany({ where: { companyId } });
  const suppliers = await prisma.supplier.findMany({ where: { companyId } });

  const accessories = [
    {
      name: "Logitech MX Master 3 Wireless Mouse",
      alertEmail: "procurement@techcorp.com",
      serialNumber: "LG-MX3-001",
      reorderPoint: 5,
      totalQuantityCount: 25,
      purchaseDate: new Date("2023-01-15"),
      notes: "Premium wireless mouse for productivity",
      material: "Plastic and Metal",
      endOfLife: new Date("2028-01-15"),
      modelNumber: "MX-MASTER-3",
      statusName: "Active",
      supplierName: "Amazon Business",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      categoryName: "Office Equipment",
      poNumber: "PO-ACC-2023-001",
      weight: 0.14,
      price: 99.99,
      unitCost: 85.00,
      totalValue: 2125.00,
      currency: "USD",
      replacementCost: 110.00,
      averageCostPerUnit: 85.00,
      lastPurchasePrice: 99.99,
      costCenter: "IT",
      budgetCode: "IT-ACC-2023-001",
    },
    {
      name: "USB-C to HDMI Adapter",
      alertEmail: "procurement@techcorp.com",
      serialNumber: "USB-HDMI-001",
      reorderPoint: 10,
      totalQuantityCount: 50,
      purchaseDate: new Date("2023-02-20"),
      notes: "4K HDMI adapter for laptops - high demand item",
      material: "Aluminum and Plastic",
      endOfLife: new Date("2026-02-20"),
      modelNumber: "UC-HDMI-4K",
      statusName: "Active",
      supplierName: "Dell Technologies",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      categoryName: "Networking Equipment",
      poNumber: "PO-ACC-2023-002",
      weight: 0.05,
      price: 29.99,
      unitCost: 22.50,
      totalValue: 1125.00,
      currency: "USD",
      replacementCost: 35.00,
      averageCostPerUnit: 22.50,
      lastPurchasePrice: 29.99,
      costCenter: "IT",
      budgetCode: "IT-ACC-2023-002",
    },
    {
      name: "USB-C Charging Cable - 2M",
      alertEmail: "procurement@techcorp.com",
      serialNumber: "CABLE-USBC-001",
      reorderPoint: 20,
      totalQuantityCount: 100,
      purchaseDate: new Date("2023-05-15"),
      notes: "High-speed charging cables - consumable item",
      material: "Braided Nylon with Metal Connectors",
      endOfLife: new Date("2025-05-15"),
      modelNumber: "UC-CBL-2M",
      statusName: "Active",
      supplierName: "Amazon Business",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      categoryName: "Office Equipment",
      poNumber: "PO-ACC-2023-003",
      weight: 0.1,
      price: 19.99,
      unitCost: 12.50,
      totalValue: 1250.00,
      currency: "USD",
      replacementCost: 22.00,
      averageCostPerUnit: 12.50,
      lastPurchasePrice: 19.99,
      costCenter: "IT",
      budgetCode: "IT-ACC-2023-003",
    },
  ];

  const createdAccessories = [];
  for (const accessoryData of accessories) {
    try {
      const accessory = await prisma.accessory.create({
        data: {
          name: accessoryData.name,
          alertEmail: accessoryData.alertEmail,
          serialNumber: accessoryData.serialNumber,
          reorderPoint: accessoryData.reorderPoint,
          totalQuantityCount: accessoryData.totalQuantityCount,
          purchaseDate: accessoryData.purchaseDate,
          notes: accessoryData.notes,
          material: accessoryData.material,
          endOfLife: accessoryData.endOfLife,
          companyId, // ✅ Linked to company: cmc80pcez00048oa5v3px063c
          modelNumber: accessoryData.modelNumber,
          statusLabelId: statusLabels.find(s => s.name === accessoryData.statusName)?.id,
          supplierId: suppliers.find(s => s.name === accessoryData.supplierName)?.id,
          departmentId: departments.find(d => d.name === accessoryData.departmentName)?.id,
          locationId: locations.find(l => l.name === accessoryData.locationName)?.id,
          inventoryId: inventories.find(i => i.name === accessoryData.inventoryName)?.id,
          categoryId: categories.find(c => c.name === accessoryData.categoryName)?.id,
          poNumber: accessoryData.poNumber,
          weight: accessoryData.weight,
          price: accessoryData.price,
          unitCost: accessoryData.unitCost,
          totalValue: accessoryData.totalValue,
          currency: accessoryData.currency,
          replacementCost: accessoryData.replacementCost,
          averageCostPerUnit: accessoryData.averageCostPerUnit,
          lastPurchasePrice: accessoryData.lastPurchasePrice,
          costCenter: accessoryData.costCenter,
          budgetCode: accessoryData.budgetCode,
        },
      });
      createdAccessories.push(accessory);
      console.log(`✅ Created accessory: ${accessory.name} (Company: ${companyId})`);
    } catch (error) {
      console.error(`❌ Failed to create accessory ${accessoryData.name}:`, error);
    }
  }

  return createdAccessories;
} 