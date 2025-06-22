import { PrismaClient } from "@prisma/client";

export async function seedRoles(prisma: PrismaClient, companyId: string) {
  console.log("👥 Seeding roles...");

  const roles = [
    {
      name: "Admin",
      isAdmin: true,
      companyId,
    },
    {
      name: "Manager",
      isAdmin: false,
      companyId,
    },
    {
      name: "User",
      isAdmin: false,
      companyId,
    },
  ];

  const createdRoles = [];
  for (const role of roles) {
    const created = await prisma.role.upsert({
      where: { name_companyId: { name: role.name, companyId: role.companyId } },
      update: {},
      create: role,
    });
    createdRoles.push(created);
    console.log(`✅ Created role: ${created.name}`);
  }

  return createdRoles;
} 