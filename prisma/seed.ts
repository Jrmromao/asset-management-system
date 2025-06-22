import { PrismaClient } from "@prisma/client";
import { seedRoles } from "./seeds/roles";
import { seedStatusLabels } from "./seeds/statusLabels";
import { seedCategories } from "./seeds/categories";
import { seedDepartments } from "./seeds/departments";
import { seedLocations } from "./seeds/locations";
import { seedInventories } from "./seeds/inventories";
import { seedPricingPlans } from "./seeds/pricingPlans";
import { seedManufacturers } from "./seeds/manufacturers";
import { seedFormTemplates } from "./seeds/formTemplates";
import { seedAssets } from "./seeds/assets";
import { seedSuppliers } from "./seeds/suppliers";
import { seedModels } from "./seeds/models";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...");

  try {
 
    const company1 = { id: "cmc80pcez00048oa5v3px063c" };

    await seedRoles(prisma, company1.id);
    await seedStatusLabels(prisma, company1.id);
    await seedCategories(prisma, company1.id);
    await seedDepartments(prisma, company1.id);
    await seedLocations(prisma, company1.id);
    await seedInventories(prisma, company1.id);
    await seedSuppliers(prisma, company1.id);
    await seedManufacturers(prisma);
    await seedModels(prisma, company1.id);
    await seedFormTemplates(prisma, company1.id);
    await seedAssets(prisma, company1.id);
    await seedPricingPlans(prisma);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
