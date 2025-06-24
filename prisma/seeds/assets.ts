import { PrismaClient } from "@prisma/client";

export async function seedAssets(prisma: PrismaClient, companyId: string) {
  console.log("💻 Seeding assets...");

  // Get all the required data for asset creation
  const statusLabels = await prisma.statusLabel.findMany({ where: { companyId } });
  const categories = await prisma.category.findMany({ where: { companyId } });
  const departments = await prisma.department.findMany({ where: { companyId } });
  const locations = await prisma.departmentLocation.findMany({ where: { companyId } });
  const inventories = await prisma.inventory.findMany({ where: { companyId } });
  const suppliers = await prisma.supplier.findMany({ where: { companyId } });
  const models = await prisma.model.findMany({ include: { manufacturer: true } });
  const formTemplates = await prisma.formTemplate.findMany({ where: { companyId } });

  // Specific user ID to assign assets to
  const primaryUserId = "cmc80pcfb00088oa52sxacapd";

  const assets = [
    {
      name: "MacBook Pro - Development Machine",
      assetTag: "MBP-DEV-001",
      modelName: "MacBook Pro 16-inch",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "Engineering",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Apple Inc.",
      assignedTo: primaryUserId, // ✅ Assigned to user: cmc80pcfb00088oa52sxacapd
      notes: "High-performance development machine with M2 Pro chip",
      purchasePrice: 2499.00,
      currentValue: 2000.00,
      warrantyEndDate: new Date("2026-01-15"),
      templateValues: { 
        processor: "M2 Pro 12-core", 
        ram: "32GB", 
        storage: "1TB SSD", 
        os: "macOS Sonoma",
        graphics: "M2 Pro 19-core GPU"
      },
    },
    {
      name: "iPhone 15 Pro - Executive Device",
      assetTag: "IPH-EXEC-001",
      modelName: "iPhone 15 Pro",
      statusName: "Active",
      categoryName: "Mobile Devices",
      departmentName: "Sales",
      locationName: "Main Office - Floor 1",
      inventoryName: "Mobile Devices",
      formTemplateName: "Mobile Device",
      supplierName: "Apple Inc.",
      assignedTo: primaryUserId, // ✅ Assigned to user: cmc80pcfb00088oa52sxacapd
      notes: "Executive mobile device with premium features",
      purchasePrice: 999.00,
      currentValue: 750.00,
      warrantyEndDate: new Date("2025-09-15"),
      templateValues: { 
        screenSize: "6.1 inches", 
        storage: "256GB", 
        carrier: "Verizon",
        color: "Natural Titanium",
        batteryHealth: "100%"
      },
    },
    {
      name: "Dell Latitude - Marketing Laptop",
      assetTag: "DELL-MKT-001", 
      modelName: "Dell Latitude 5520",
      statusName: "Available",
      categoryName: "Computers & Laptops",
      departmentName: "Marketing",
      locationName: "Main Office - Floor 2",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Dell Technologies",
      assignedTo: null, // Available for assignment
      notes: "Standard business laptop for marketing team",
      purchasePrice: 1299.00,
      currentValue: 950.00,
      warrantyEndDate: new Date("2025-03-20"),
      templateValues: { 
        processor: "Intel i7-1265U", 
        ram: "16GB", 
        storage: "512GB SSD", 
        os: "Windows 11 Pro",
        graphics: "Intel Iris Xe"
      },
    },
    {
      name: "Dell OptiPlex - Engineering Workstation",
      assetTag: "DELL-ENG-WS-001",
      modelName: "Dell OptiPlex 7090", 
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "Engineering",
      locationName: "Main Office - Floor 3",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Dell Technologies",
      assignedTo: null,
      notes: "High-performance workstation for CAD work",
      purchasePrice: 1899.00,
      currentValue: 1400.00,
      warrantyEndDate: new Date("2026-02-01"),
      templateValues: { 
        processor: "Intel i7-11700", 
        ram: "32GB", 
        storage: "1TB NVMe SSD", 
        os: "Windows 11 Pro",
        graphics: "NVIDIA RTX 3060"
      },
    },
    {
      name: "HP EliteBook 840 - Sales Laptop",
      assetTag: "HP-SAL-001",
      modelName: "HP EliteBook 840",
      statusName: "Under Maintenance",
      categoryName: "Computers & Laptops",
      departmentName: "Sales",
      locationName: "Service Center",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "HP Inc.",
      assignedTo: null,
      notes: "In for keyboard replacement - expected back next week",
      purchasePrice: 1399.00,
      currentValue: 980.00,
      warrantyEndDate: new Date("2025-07-15"),
      templateValues: { 
        processor: "Intel i5-1235U", 
        ram: "16GB", 
        storage: "512GB SSD", 
        os: "Windows 11 Pro",
        graphics: "Intel Iris Xe"
      },
    },
  ];

  const createdAssets = [];
  for (const assetData of assets) {
    try {
      const asset = await prisma.asset.create({
        data: {
          name: assetData.name,
          assetTag: assetData.assetTag,
          purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          modelId: models.find(m => m.name === assetData.modelName)?.id || models[0]?.id || "",
          statusLabelId: statusLabels.find(s => s.name === assetData.statusName)?.id || statusLabels[0]?.id,
          categoryId: categories.find(c => c.name === assetData.categoryName)?.id || categories[0]?.id,
          departmentId: departments.find(d => d.name === assetData.departmentName)?.id || departments[0]?.id,
          locationId: locations.find(l => l.name === assetData.locationName)?.id || locations[0]?.id,
          inventoryId: inventories.find(i => i.name === assetData.inventoryName)?.id || inventories[0]?.id,
          formTemplateId: formTemplates.find(f => f.name === assetData.formTemplateName)?.id || formTemplates[0]?.id,
          supplierId: suppliers.find(s => s.name === assetData.supplierName)?.id || suppliers[0]?.id,
          userId: assetData.assignedTo, // ✅ Some assets assigned to user: cmc80pcfb00088oa52sxacapd
          companyId, // ✅ All assets linked to company: cmc80pcez00048oa5v3px063c
          notes: assetData.notes,
          purchasePrice: assetData.purchasePrice,
          currentValue: assetData.currentValue,
          warrantyEndDate: assetData.warrantyEndDate,
          active: assetData.statusName !== "Retired",
          depreciationRate: 0.15, // 15% annual depreciation
          // Create form template values if provided
          values: assetData.templateValues && formTemplates.find(f => f.name === assetData.formTemplateName) ? {
            create: [{
              values: assetData.templateValues,
              templateId: formTemplates.find(f => f.name === assetData.formTemplateName)!.id,
            }],
          } : undefined,
        },
      });
      createdAssets.push(asset);
      console.log(`✅ Created asset: ${asset.name} (Company: ${companyId}${assetData.assignedTo ? `, User: ${assetData.assignedTo}` : ', Unassigned'})`);
    } catch (error) {
      console.error(`❌ Failed to create asset ${assetData.name}:`, error);
    }
  }

  return createdAssets;
} 