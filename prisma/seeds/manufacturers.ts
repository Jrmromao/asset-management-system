import { PrismaClient } from "@prisma/client";

export async function seedManufacturers(prisma: PrismaClient) {
  console.log("🏭 Seeding manufacturers...");

  const manufacturers = [
    {
      name: "Apple",
      url: "https://www.apple.com",
      supportUrl: "https://support.apple.com",
      supportPhone: "+1-800-275-2273",
    },
    {
      name: "Dell",
      url: "https://www.dell.com",
      supportUrl: "https://www.dell.com/support",
      supportPhone: "+1-800-999-3355",
    },
    {
      name: "HP",
      url: "https://www.hp.com",
      supportUrl: "https://support.hp.com",
      supportPhone: "+1-800-474-6836",
    },
    {
      name: "Lenovo",
      url: "https://www.lenovo.com",
      supportUrl: "https://support.lenovo.com",
      supportPhone: "+1-855-253-6686",
    },
    {
      name: "Cisco",
      url: "https://www.cisco.com",
      supportUrl: "https://www.cisco.com/support",
      supportPhone: "+1-800-553-6387",
    },
    {
      name: "Samsung",
      url: "https://www.samsung.com",
      supportUrl: "https://www.samsung.com/us/support",
      supportPhone: "+1-800-726-7864",
    },
  ];

  const createdManufacturers = [];
  for (const manufacturer of manufacturers) {
    const created = await prisma.manufacturer.upsert({
      where: { name: manufacturer.name },
      update: {},
      create: { ...manufacturer, companyId: "cmcavp31o000x8ozo07zcd7mu" },
    });
    createdManufacturers.push(created);
    console.log(`✅ Created manufacturer: ${created.name}`);
  }

  return createdManufacturers;
}
