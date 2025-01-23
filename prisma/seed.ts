import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const companies = await createCompanies();
  const roles = await createRoles();
  const suppliers = await createSuppliers(companies);
  const statusLabels = await createStatusLabels(companies);
  const departments = await createDepartments(companies);
  const locations = await createLocations(companies);
  const inventories = await createInventories(companies);
  const manufacturers = await createManufacturers(companies);

  // Create users for each company
  for (const company of companies) {
    await createUsers(company.id, roles[0].id, departments[0].id);
  }

  // Create one asset, accessory, and license for each company
  for (const company of companies) {
    await createAsset(
      company.id,
      statusLabels[0].id,
      suppliers[0].id,
      departments[0].id,
      locations[0].id,
      inventories[0].id,
      manufacturers[0].id,
    );
    await createAccessory(
      company.id,
      statusLabels[0].id,
      suppliers[0].id,
      departments[0].id,
      locations[0].id,
      inventories[0].id,
    );
    await createLicense(
      company.id,
      statusLabels[0].id,
      suppliers[0].id,
      departments[0].id,
      locations[0].id,
      inventories[0].id,
    );
  }
}

async function createCompanies() {
  const companies = [
    { name: "Tech Corp" },
    { name: "Digital Solutions" },
    { name: "Innovation Labs" },
  ];

  return await Promise.all(
    companies.map((company) => prisma.company.create({ data: company })),
  );
}

async function createRoles() {
  return await Promise.all([
    prisma.role.create({
      data: {
        name: "Admin",
        isAdctive: true,
      },
    }),
  ]);
}

async function createSuppliers(companies: any[]) {
  return await Promise.all(
    companies.map((company, index) =>
      prisma.supplier.create({
        data: {
          name: `Supplier ${index + 1}`,
          contactName: `Contact ${index + 1}`,
          email: `supplier${index + 1}@example.com`,
          phoneNum: `+1555000${index}`,
          addressLine1: "123 Main St",
          city: "Springfield",
          state: "IL",
          zip: "62701",
          country: "USA",
          companyId: company.id,
        },
      }),
    ),
  );
}

async function createStatusLabels(companies: any[]) {
  return await Promise.all(
    companies.map((company, index) =>
      prisma.statusLabel.create({
        data: {
          name: "Active",
          colorCode: "#00FF00",
          description: "Item is active and in use",
          companyId: company.id,
        },
      }),
    ),
  );
}

async function createDepartments(companies: any[]) {
  return await Promise.all(
    companies.map((company) =>
      prisma.department.create({
        data: {
          name: "IT",
          companyId: company.id,
        },
      }),
    ),
  );
}

async function createLocations(companies: any[]) {
  return await Promise.all(
    companies.map((company) =>
      prisma.departmentLocation.create({
        data: {
          name: "Main Office",
          addressLine1: "456 Corporate Ave",
          city: "Chicago",
          state: "IL",
          zip: "60601",
          country: "USA",
          companyId: company.id,
        },
      }),
    ),
  );
}

async function createInventories(companies: any[]) {
  return await Promise.all(
    companies.map((company) =>
      prisma.inventory.create({
        data: {
          name: "Main Inventory",
          companyId: company.id,
        },
      }),
    ),
  );
}

async function createManufacturers(companies: any[]) {
  return await Promise.all(
    companies.map((company) =>
      prisma.manufacturer.create({
        data: {
          name: "TechMaker",
          url: "https://techmaker.example.com",
          supportUrl: `https://support.techmaker${company.id}.example.com`,
          supportEmail: "support@techmaker.example.com",
          companyId: company.id,
        },
      }),
    ),
  );
}

async function createUsers(
  companyId: string,
  roleId: string,
  departmentId: string,
) {
  return prisma.user.create({
    data: {
      email: `user.${companyId}@example.com`,
      firstName: "John",
      lastName: "Doe",
      name: "John Doe",
      title: "IT Manager",
      employeeId: `EMP${companyId}`,
      phoneNum: `+1555999${companyId.slice(0, 4)}`,
      roleId,
      companyId,
      departmentId,
      accountType: "Internal User",
    },
  });
}

async function createAsset(
  companyId: string,
  statusLabelId: string,
  supplierId: string,
  departmentId: string,
  locationId: string,
  inventoryId: string,
  manufacturerId: string,
) {
  const model = await prisma.model.create({
    data: {
      name: "Laptop Pro",
      modelNo: `LP${companyId}`,
      manufacturerId,
      companyId,
    },
  });

  return prisma.asset.create({
    data: {
      name: "Corporate Laptop",
      serialNumber: `SN${companyId}`,
      material: "Aluminum",
      endOfLife: new Date("2026-12-31"),
      datePurchased: new Date(),
      statusLabelId,
      locationId,
      inventoryId,
      companyId,
      supplierId,
      departmentId,
      modelId: model.id,
      energyRating: "A+",
      dailyOperatingHours: 8,
      poNumber: `PO${companyId}`,
      weight: 2.5,
      price: 1299.99,
      status: "Available",
    },
  });
}

async function createAccessory(
  companyId: string,
  statusLabelId: string,
  supplierId: string,
  departmentId: string,
  locationId: string,
  inventoryId: string,
) {
  return prisma.accessory.create({
    data: {
      name: "Wireless Mouse",
      alertEmail: "inventory@example.com",
      serialNumber: `ACC${companyId}`,
      reorderPoint: 5,
      totalQuantityCount: 20,
      purchaseDate: new Date(),
      material: "Plastic",
      endOfLife: new Date("2025-12-31"),
      companyId,
      modelNumber: `M${companyId}`,
      statusLabelId,
      supplierId,
      departmentId,
      locationId,
      inventoryId,
      poNumber: `POACC${companyId}`,
      weight: 0.2,
      price: 29.99,
    },
  });
}

async function createLicense(
  companyId: string,
  statusLabelId: string,
  supplierId: string,
  departmentId: string,
  locationId: string,
  inventoryId: string,
) {
  return prisma.license.create({
    data: {
      name: "Office Suite Pro",
      licensedEmail: `license.${companyId}@example.com`,
      poNumber: `POLIC${companyId}`,
      companyId,
      statusLabelId,
      supplierId,
      departmentId,
      locationId,
      inventoryId,
      renewalDate: new Date("2024-12-31"),
      purchaseDate: new Date(),
      purchaseNotes: "Annual subscription",
      licenseUrl: "https://license.example.com",
      minSeatsAlert: 5,
      alertRenewalDays: 30,
      seats: 50,
      purchasePrice: 999.99,
    },
  });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
