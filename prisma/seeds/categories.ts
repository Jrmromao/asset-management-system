import { PrismaClient } from "@prisma/client";

export async function seedCategories(prisma: PrismaClient, companyId: string) {
  console.log("🏷️ Seeding categories...");

  const categories = [
    { name: "Computers & Laptops", description: "Desktop computers, laptops, and workstations" },
    { name: "Mobile Devices", description: "Smartphones, tablets, and mobile accessories" },
    { name: "Networking Equipment", description: "Routers, switches, and network infrastructure" },
    { name: "Office Equipment", description: "Printers, scanners, and office supplies" },
    { name: "Audio/Video Equipment", description: "Speakers, microphones, cameras, and displays" },
    { name: "Furniture", description: "Desks, chairs, and office furniture" },
    { name: "Software Licenses", description: "Software licenses and subscriptions" },
    { name: "Vehicles", description: "Company vehicles and transportation equipment" },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name_companyId: { name: category.name, companyId } },
      update: {},
      create: { ...category, companyId },
    });
    createdCategories.push(created);
    console.log(`✅ Created category: ${created.name}`);
  }

  return createdCategories;
} 