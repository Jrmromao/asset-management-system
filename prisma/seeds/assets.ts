import { PrismaClient } from "@prisma/client";

export async function seedAssets(prisma: PrismaClient, companyId: string) {
  console.log("💻 Seeding assets...");

  // Get all the required data for asset creation
  const statusLabels = await prisma.statusLabel.findMany({
    where: { companyId },
  });
  const categories = await prisma.category.findMany({ where: { companyId } });
  const departments = await prisma.department.findMany({
    where: { companyId },
  });
  const locations = await prisma.departmentLocation.findMany({
    where: { companyId },
  });
  const inventories = await prisma.inventory.findMany({ where: { companyId } });
  const suppliers = await prisma.supplier.findMany({ where: { companyId } });
  const models = await prisma.model.findMany({
    include: { manufacturer: true },
  });
  const formTemplates = await prisma.formTemplate.findMany({
    where: { companyId },
  });

  // Specific user ID to assign assets to
  const primaryUserId = "cmcavp32m001318ozo6gowy820";

  const assets = [
    // ===== COMPUTERS & LAPTOPS (40% of total) =====
    {
      name: "MacBook Pro - Development Machine",
      serialNumber: `${companyId}-MBP-DEV-00131`,
      modelName: "MacBook Pro 16-inch",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "Engineering",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Apple Inc.",
      assignedTo: primaryUserId,
      notes: "High-performance development machine with M2 Pro chip",
      purchasePrice: 2499.0,
      currentValue: 2000.0,
      warrantyEndDate: new Date("2026-01-15"),
      templateValues: {
        processor: "M2 Pro 12-core",
        ram: "32GB",
        storage: "1TB SSD",
        os: "macOS Sonoma",
        graphics: "M2 Pro 19-core GPU",
      },
    },
    {
      name: "MacBook Pro - Design Team",
      serialNumber: `${companyId}-MBP-DESIGN-00131`,
      modelName: "MacBook Pro 16-inch",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "Design",
      locationName: "Main Office - Floor 2",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Apple Inc.",
      assignedTo: null,
      notes: "Design and creative work machine",
      purchasePrice: 2499.0,
      currentValue: 2000.0,
      warrantyEndDate: new Date("2026-02-15"),
      templateValues: {
        processor: "M2 Pro 12-core",
        ram: "32GB",
        storage: "1TB SSD",
        os: "macOS Sonoma",
        graphics: "M2 Pro 19-core GPU",
      },
    },
    {
      name: "MacBook Air - Sales Team",
      serialNumber: `${companyId}-MBA-SALES-00131`,
      modelName: "MacBook Air 13-inch",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "Sales",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Apple Inc.",
      assignedTo: null,
      notes: "Lightweight laptop for sales team",
      purchasePrice: 1199.0,
      currentValue: 900.0,
      warrantyEndDate: new Date("2025-12-15"),
      templateValues: {
        processor: "M2 8-core",
        ram: "16GB",
        storage: "512GB SSD",
        os: "macOS Sonoma",
        graphics: "M2 10-core GPU",
      },
    },
    {
      name: "Dell Latitude - Marketing Laptop",
      serialNumber: `${companyId}-DELL-MKT-0013`,
      modelName: "Dell Latitude 5520",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "Marketing",
      locationName: "Main Office - Floor 2",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Dell Technologies",
      assignedTo: null,
      notes: "Standard business laptop for marketing team",
      purchasePrice: 1299.0,
      currentValue: 950.0,
      warrantyEndDate: new Date("2025-03-20"),
      templateValues: {
        processor: "Intel i7-1265U",
        ram: "16GB",
        storage: "512GB SSD",
        os: "Windows 11 Pro",
        graphics: "Intel Iris Xe",
      },
    },
    {
      name: "Dell Latitude - Available",
      serialNumber: `${companyId}-DELL-AVAIL-0013`,
      modelName: "Dell Latitude 5520",
      statusName: "Inactive",
      categoryName: "Computers & Laptops",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Dell Technologies",
      assignedTo: null,
      notes: "Spare laptop for new hires",
      purchasePrice: 1299.0,
      currentValue: 950.0,
      warrantyEndDate: new Date("2025-06-20"),
      templateValues: {
        processor: "Intel i7-1265U",
        ram: "16GB",
        storage: "512GB SSD",
        os: "Windows 11 Pro",
        graphics: "Intel Iris Xe",
      },
    },
    {
      name: "Dell OptiPlex - Engineering Workstation",
      serialNumber: `${companyId}-DELL-ENG-WS-0013`,
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
      purchasePrice: 1899.0,
      currentValue: 1400.0,
      warrantyEndDate: new Date("2026-02-01"),
      templateValues: {
        processor: "Intel i7-11700",
        ram: "32GB",
        storage: "1TB NVMe SSD",
        os: "Windows 11 Pro",
        graphics: "NVIDIA RTX 3060",
      },
    },
    {
      name: "HP EliteBook - Sales Manager",
      serialNumber: `${companyId}-HP-SALES-MGR-0013`,
      modelName: "HP EliteBook 840",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "Sales",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "HP Inc.",
      assignedTo: null,
      notes: "Sales manager laptop",
      purchasePrice: 1399.0,
      currentValue: 980.0,
      warrantyEndDate: new Date("2025-07-15"),
      templateValues: {
        processor: "Intel i5-1235U",
        ram: "16GB",
        storage: "512GB SSD",
        os: "Windows 11 Pro",
        graphics: "Intel Iris Xe",
      },
    },
    {
      name: "HP EliteBook - Under Maintenance",
      serialNumber: `${companyId}-HP-MAINT-0013`,
      modelName: "HP EliteBook 840",
      statusName: "Maintenance",
      categoryName: "Computers & Laptops",
      departmentName: "Sales",
      locationName: "Service Center",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "HP Inc.",
      assignedTo: null,
      notes: "In for keyboard replacement - expected back next week",
      purchasePrice: 1399.0,
      currentValue: 980.0,
      warrantyEndDate: new Date("2025-07-15"),
      templateValues: {
        processor: "Intel i5-1235U",
        ram: "16GB",
        storage: "512GB SSD",
        os: "Windows 11 Pro",
        graphics: "Intel Iris Xe",
      },
    },
    {
      name: "Lenovo ThinkPad - IT Admin",
      serialNumber: `${companyId}-LENOVO-IT-0013`,
      modelName: "Lenovo ThinkPad X1",
      statusName: "Active",
      categoryName: "Computers & Laptops",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Main IT Inventory",
      formTemplateName: "Computer Equipment",
      supplierName: "Lenovo",
      assignedTo: null,
      notes: "IT administrator laptop",
      purchasePrice: 1599.0,
      currentValue: 1200.0,
      warrantyEndDate: new Date("2026-03-15"),
      templateValues: {
        processor: "Intel i7-1355U",
        ram: "16GB",
        storage: "1TB SSD",
        os: "Windows 11 Pro",
        graphics: "Intel Iris Xe",
      },
    },

    // ===== MOBILE DEVICES (25% of total) =====
    {
      name: "iPhone 15 Pro - Executive",
      serialNumber: `${companyId}-IPH-EXEC-0013`,
      modelName: "iPhone 15 Pro",
      statusName: "Active",
      categoryName: "Mobile Devices",
      departmentName: "Executive",
      locationName: "Main Office - Floor 1",
      inventoryName: "Mobile Devices",
      formTemplateName: "Mobile Device",
      supplierName: "Apple Inc.",
      assignedTo: primaryUserId,
      notes: "Executive mobile device with premium features",
      purchasePrice: 999.0,
      currentValue: 750.0,
      warrantyEndDate: new Date("2025-09-15"),
      templateValues: {
        screenSize: "6.1 inches",
        storage: "256GB",
        carrier: "Verizon",
        color: "Natural Titanium",
        batteryHealth: "100%",
      },
    },
    {
      name: "iPhone 15 Pro - Sales Manager",
      serialNumber: `${companyId}-IPH-SALES-0013`,
      modelName: "iPhone 15 Pro",
      statusName: "Active",
      categoryName: "Mobile Devices",
      departmentName: "Sales",
      locationName: "Main Office - Floor 1",
      inventoryName: "Mobile Devices",
      formTemplateName: "Mobile Device",
      supplierName: "Apple Inc.",
      assignedTo: null,
      notes: "Sales manager mobile device",
      purchasePrice: 999.0,
      currentValue: 750.0,
      warrantyEndDate: new Date("2025-09-15"),
      templateValues: {
        screenSize: "6.1 inches",
        storage: "256GB",
        carrier: "AT&T",
        color: "Natural Titanium",
        batteryHealth: "95%",
      },
    },
    {
      name: "iPad Pro - Design Team",
      serialNumber: `${companyId}-IPAD-DESIGN-0013`,
      modelName: "iPad Pro 12.9",
      statusName: "Active",
      categoryName: "Mobile Devices",
      departmentName: "Design",
      locationName: "Main Office - Floor 2",
      inventoryName: "Mobile Devices",
      formTemplateName: "Mobile Device",
      supplierName: "Apple Inc.",
      assignedTo: null,
      notes: "Design team tablet for creative work",
      purchasePrice: 1099.0,
      currentValue: 825.0,
      warrantyEndDate: new Date("2026-01-20"),
      templateValues: {
        screenSize: "12.9 inches",
        storage: "256GB",
        carrier: "WiFi Only",
        color: "Space Gray",
        batteryHealth: "98%",
      },
    },
    {
      name: "Samsung Galaxy S24 - IT Team",
      serialNumber: `${companyId}-SAMS-IT-0013`,
      modelName: "Samsung Galaxy S24",
      statusName: "Active",
      categoryName: "Mobile Devices",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Mobile Devices",
      formTemplateName: "Mobile Device",
      supplierName: "Samsung",
      assignedTo: null,
      notes: "IT team testing device",
      purchasePrice: 899.0,
      currentValue: 675.0,
      warrantyEndDate: new Date("2026-02-15"),
      templateValues: {
        screenSize: "6.2 inches",
        storage: "128GB",
        carrier: "T-Mobile",
        color: "Onyx Black",
        batteryHealth: "100%",
      },
    },
    {
      name: "Samsung Galaxy S24 - Available",
      serialNumber: `${companyId}-SAMS-AVAIL-0013`,
      modelName: "Samsung Galaxy S24",
      statusName: "Inactive",
      categoryName: "Mobile Devices",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Mobile Devices",
      formTemplateName: "Mobile Device",
      supplierName: "Samsung",
      assignedTo: null,
      notes: "Spare mobile device",
      purchasePrice: 899.0,
      currentValue: 675.0,
      warrantyEndDate: new Date("2026-02-15"),
      templateValues: {
        screenSize: "6.2 inches",
        storage: "128GB",
        carrier: "Unlocked",
        color: "Onyx Black",
        batteryHealth: "100%",
      },
    },

    // ===== NETWORKING EQUIPMENT (15% of total) =====
    {
      name: "Cisco Switch - Main Office",
      serialNumber: `${companyId}-CISCO-SW-0013`,
      modelName: "Cisco Catalyst 2960",
      statusName: "Active",
      categoryName: "Networking Equipment",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Network Equipment",
      formTemplateName: "Network Equipment",
      supplierName: "Cisco",
      assignedTo: null,
      notes: "Main office network switch",
      purchasePrice: 2500.0,
      currentValue: 1800.0,
      warrantyEndDate: new Date("2027-01-15"),
      templateValues: {
        ports: "48",
        speed: "1Gbps",
        powerConsumption: "150W",
        rackUnits: "1U",
        management: "Web-based",
      },
    },
    {
      name: "Cisco Switch - Branch Office",
      serialNumber: `${companyId}-CISCO-SW-002`,
      modelName: "Cisco Catalyst 2960",
      statusName: "Active",
      categoryName: "Networking Equipment",
      departmentName: "IT Department",
      locationName: "Branch Office",
      inventoryName: "Network Equipment",
      formTemplateName: "Network Equipment",
      supplierName: "Cisco",
      assignedTo: null,
      notes: "Branch office network switch",
      purchasePrice: 2500.0,
      currentValue: 1800.0,
      warrantyEndDate: new Date("2027-01-15"),
      templateValues: {
        ports: "48",
        speed: "1Gbps",
        powerConsumption: "150W",
        rackUnits: "1U",
        management: "Web-based",
      },
    },
    {
      name: "Cisco Router - Internet Gateway",
      serialNumber: `${companyId}-CISCO-RT-0013`,
      modelName: "Cisco Catalyst 2960",
      statusName: "Active",
      categoryName: "Networking Equipment",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Network Equipment",
      formTemplateName: "Network Equipment",
      supplierName: "Cisco",
      assignedTo: null,
      notes: "Internet gateway router",
      purchasePrice: 1500.0,
      currentValue: 1200.0,
      warrantyEndDate: new Date("2026-08-20"),
      templateValues: {
        ports: "8",
        speed: "10Gbps",
        powerConsumption: "100W",
        rackUnits: "1U",
        management: "CLI",
      },
    },

    // ===== OFFICE EQUIPMENT (10% of total) =====
    {
      name: "HP LaserJet - HR Department",
      serialNumber: `${companyId}-HP-PRINT-HR-0013`,
      modelName: "HP ProBook 450",
      statusName: "Active",
      categoryName: "Office Equipment",
      departmentName: "HR Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "Office Equipment",
      formTemplateName: "Office Equipment",
      supplierName: "HP Inc.",
      assignedTo: null,
      notes: "HR department printer",
      purchasePrice: 399.0,
      currentValue: 250.0,
      warrantyEndDate: new Date("2025-12-10"),
      templateValues: {
        type: "Laser Printer",
        speed: "30 ppm",
        resolution: "600x600 dpi",
        connectivity: "WiFi, USB, Ethernet",
        monthlyVolume: "5000 pages",
      },
    },
    {
      name: "HP LaserJet - Finance Department",
      serialNumber: `${companyId}-HP-PRINT-FIN-0013`,
      modelName: "HP ProBook 450",
      statusName: "Active",
      categoryName: "Office Equipment",
      departmentName: "Finance",
      locationName: "Main Office - Floor 2",
      inventoryName: "Office Equipment",
      formTemplateName: "Office Equipment",
      supplierName: "HP Inc.",
      assignedTo: null,
      notes: "Finance department printer",
      purchasePrice: 399.0,
      currentValue: 250.0,
      warrantyEndDate: new Date("2025-12-10"),
      templateValues: {
        type: "Laser Printer",
        speed: "30 ppm",
        resolution: "600x600 dpi",
        connectivity: "WiFi, USB, Ethernet",
        monthlyVolume: "3000 pages",
      },
    },

    // ===== AUDIO/VIDEO EQUIPMENT (5% of total) =====
    {
      name: "Logitech Webcam - Conference Room A",
      serialNumber: `${companyId}-LOG-CAM-A-0013`,
      modelName: "Lenovo ThinkPad X1",
      statusName: "Active",
      categoryName: "Audio/Video Equipment",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "AV Equipment",
      formTemplateName: "Audio/Video Equipment",
      supplierName: "Lenovo",
      assignedTo: null,
      notes: "Conference room A webcam",
      purchasePrice: 79.99,
      currentValue: 50.0,
      warrantyEndDate: new Date("2025-06-15"),
      templateValues: {
        type: "USB Webcam",
        resolution: "1080p",
        microphone: "Built-in",
        connectivity: "USB 2.0",
        mountType: "Clip-on",
      },
    },
    {
      name: "Logitech Webcam - Conference Room B",
      serialNumber: `${companyId}-LOG-CAM-B-0013`,
      modelName: "Lenovo ThinkPad X1",
      statusName: "Active",
      categoryName: "Audio/Video Equipment",
      departmentName: "IT Department",
      locationName: "Main Office - Floor 1",
      inventoryName: "AV Equipment",
      formTemplateName: "Audio/Video Equipment",
      supplierName: "Lenovo",
      assignedTo: null,
      notes: "Conference room B webcam",
      purchasePrice: 79.99,
      currentValue: 50.0,
      warrantyEndDate: new Date("2025-06-15"),
      templateValues: {
        type: "USB Webcam",
        resolution: "1080p",
        microphone: "Built-in",
        connectivity: "USB 2.0",
        mountType: "Clip-on",
      },
    },

    // ===== FURNITURE (3% of total) =====
    {
      name: "Ergonomic Chair - CEO Office",
      serialNumber: `${companyId}-CHAIR-CEO-0013`,
      modelName: "MacBook Pro 16-inch",
      statusName: "Active",
      categoryName: "Furniture",
      departmentName: "Executive",
      locationName: "Main Office - Floor 1",
      inventoryName: "Furniture",
      formTemplateName: "Furniture",
      supplierName: "Apple Inc.",
      assignedTo: null,
      notes: "CEO ergonomic office chair",
      purchasePrice: 599.0,
      currentValue: 400.0,
      warrantyEndDate: new Date("2026-03-20"),
      templateValues: {
        type: "Ergonomic Office Chair",
        material: "Mesh and Aluminum",
        weightCapacity: "300 lbs",
        adjustability: "Height, Armrests, Lumbar",
        warranty: "5 years",
      },
    },

    // ===== SOFTWARE LICENSES (2% of total) =====
    {
      name: "Adobe Creative Suite License",
      serialNumber: `${companyId}-ADOBE-LIC-0013`,
      modelName: "MacBook Pro 16-inch",
      statusName: "Active",
      categoryName: "Software Licenses",
      departmentName: "Design",
      locationName: "Main Office - Floor 2",
      inventoryName: "Software Licenses",
      formTemplateName: "Software License",
      supplierName: "Apple Inc.",
      assignedTo: null,
      notes: "Adobe Creative Suite annual license",
      purchasePrice: 600.0,
      currentValue: 600.0,
      warrantyEndDate: new Date("2025-12-31"),
      templateValues: {
        type: "Software License",
        seats: "10",
        licenseType: "Annual Subscription",
        vendor: "Adobe",
        renewalDate: "2025-12-31",
      },
    },
  ];

  const createdAssets = [];
  for (const assetData of assets) {
    try {
      // Check if asset with this serial number already exists
      const existingAsset = await prisma.asset.findUnique({
        where: { assetTag: assetData.serialNumber },
      });

      if (existingAsset) {
        console.log(
          `⚠️  Asset with serial number ${assetData.serialNumber} already exists, skipping...`,
        );
        continue;
      }

      const asset = await prisma.asset.create({
        data: {
          name: assetData.name,
          assetTag: assetData.serialNumber,
          purchaseDate: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          ),
          modelId:
            models.find((m) => m.name === assetData.modelName)?.id ||
            models[0]?.id ||
            "",
          statusLabelId:
            statusLabels.find((s) => s.name === assetData.statusName)?.id ||
            statusLabels[0]?.id,
          categoryId:
            categories.find((c) => c.name === assetData.categoryName)?.id ||
            categories[0]?.id,
          departmentId:
            departments.find((d) => d.name === assetData.departmentName)?.id ||
            departments[0]?.id,
          locationId:
            locations.find((l) => l.name === assetData.locationName)?.id ||
            locations[0]?.id,
          inventoryId:
            inventories.find((i) => i.name === assetData.inventoryName)?.id ||
            inventories[0]?.id,
          formTemplateId:
            formTemplates.find((f) => f.name === assetData.formTemplateName)
              ?.id || formTemplates[0]?.id,
          supplierId:
            suppliers.find((s) => s.name === assetData.supplierName)?.id ||
            suppliers[0]?.id,
          userId: assetData.assignedTo,
          companyId,
          notes: assetData.notes,
          purchasePrice: assetData.purchasePrice,
          currentValue: assetData.currentValue,
          warrantyEndDate: assetData.warrantyEndDate,
          active: assetData.statusName !== "Retired",
          depreciationRate: 0.15, // 15% annual depreciation
          // Create form template values if provided
          formValues:
            assetData.templateValues &&
            formTemplates.find((f) => f.name === assetData.formTemplateName)
              ? {
                  create: [
                    {
                      values: assetData.templateValues,
                      templateId: formTemplates.find(
                        (f) => f.name === assetData.formTemplateName,
                      )!.id,
                    },
                  ],
                }
              : undefined,
        },
      });
      createdAssets.push(asset);
      console.log(
        `✅ Created asset: ${asset.name} (${assetData.categoryName} - ${assetData.statusName})`,
      );
    } catch (error) {
      console.error(`❌ Failed to create asset ${assetData.name}:`, error);
    }
  }

  // Log distribution summary
  console.log("\nAsset Distribution Summary:");
  const distribution = await prisma.asset.groupBy({
    by: ['categoryId'],
    where: { companyId },
    _count: { id: true },
  });

  for (const item of distribution) {
    const category = categories.find(c => c.id === item.categoryId);
    const percentage = ((item._count.id / createdAssets.length) * 100).toFixed(1);
    console.log(`  - ${category?.name || 'Unknown'}: ${item._count.id} assets (${percentage}%)`);
  }

  return createdAssets;
}
