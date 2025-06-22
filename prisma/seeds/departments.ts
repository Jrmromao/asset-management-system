import { PrismaClient } from "@prisma/client";

export async function seedDepartments(prisma: PrismaClient, companyId: string) {
  console.log("🏢 Seeding departments...");

  const departments = [
    { name: "IT Department" },
    { name: "Marketing" },
    { name: "Sales" },
    { name: "Human Resources" },
    { name: "Finance" },
    { name: "Operations" },
    { name: "Engineering" },
    { name: "Customer Support" },
  ];

  const createdDepartments = [];
  for (const dept of departments) {
    const created = await prisma.department.upsert({
      where: { name_companyId: { name: dept.name, companyId } },
      update: {},
      create: { ...dept, companyId },
    });
    createdDepartments.push(created);
    console.log(`✅ Created department: ${created.name}`);
  }

  return createdDepartments;
} 