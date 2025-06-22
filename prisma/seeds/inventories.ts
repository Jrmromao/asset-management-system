import { PrismaClient } from "@prisma/client";

export async function seedInventories(prisma: PrismaClient, companyId: string) {
  console.log("📦 Seeding inventories...");

  const inventories = [
    { name: "Main IT Inventory" },
    { name: "Marketing Equipment" },
    { name: "Office Supplies" },
    { name: "Mobile Devices" },
    { name: "Network Equipment" },
  ];

  const createdInventories = [];
  for (const inventory of inventories) {
    const created = await prisma.inventory.upsert({
      where: { name_companyId: { name: inventory.name, companyId } },
      update: {},
      create: { ...inventory, companyId },
    });
    createdInventories.push(created);
    console.log(`✅ Created inventory: ${created.name}`);
  }

  return createdInventories;
} 