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

  const assets = [
    {
      name: "MacBook Pro - John Smith",
      serialNumber: "MBP001",
      modelName: "MacBook Pro 16-inch",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Apple Inc.",
      templateValues: { processor: "M2 Pro", ram: 16, storage: 512, os: "macOS Sonoma" },
    },
    {
      name: "Dell Latitude - Sarah Johnson",
      serialNumber: "DL002",
      modelName: "Dell Latitude 5520",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "Marketing",
      locationName: "Main Office - Floor 2",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Dell Technologies",
      templateValues: { processor: "Intel i7", ram: 32, storage: 1000, os: "Windows 11" },
    },
    {
      name: "iPhone 15 Pro - Emma Taylor",
      serialNumber: "IP001",
      modelName: "iPhone 15 Pro",
      statusName: "Active",
      categoryName: "Mobile Devices",
      departmentName: "Sales",
      locationName: "Main Office - Floor 1",
      inventoryName: "Mobile Devices",
      formTemplateName: "Mobile Device",
      supplierName: "Apple Inc.",
      templateValues: { screenSize: 6.1, storage: 256, carrier: "Verizon" },
    },
    // Add more assets as needed...
  ];

  const createdAssets = [];
  for (const assetData of assets) {
    try {
      const asset = await prisma.asset.create({
        data: {
          name: assetData.name,
          serialNumber: assetData.serialNumber,
          purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          modelId: models.find(m => m.name === assetData.modelName)?.id || "",
          statusLabelId: statusLabels.find(s => s.name === assetData.statusName)?.id || "",
          categoryId: categories.find(c => c.name === assetData.categoryName)?.id || "",
          departmentId: departments.find(d => d.name === assetData.departmentName)?.id || "",
          locationId: locations.find(l => l.name === assetData.locationName)?.id || "",
          inventoryId: inventories.find(i => i.name === assetData.inventoryName)?.id || "",
          formTemplateId: formTemplates.find(f => f.name === assetData.formTemplateName)?.id || "",
          supplierId: suppliers.find(s => s.name === assetData.supplierName)?.id || "",
          companyId,
          active: assetData.statusName === "Active",
          values: assetData.templateValues ? {
            create: [{
              values: assetData.templateValues,
              formTemplate: { connect: { id: formTemplates.find(f => f.name === assetData.formTemplateName)?.id || "" } },
            }],
          } : undefined,
        },
      });
      createdAssets.push(asset);
      console.log(`✅ Created asset: ${asset.name}`);
    } catch (error) {
      console.error(`❌ Failed to create asset ${assetData.name}:`, error);
    }
  }

  return createdAssets;
} 