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
import { seedLicenses } from "./seeds/licenses";
import { seedAccessories } from "./seeds/accessories";
import { seedUserItems } from "./seeds/userItems";


const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database seeding...");

  try {
    const company1 = { id: "cmc80pcez00048oa5v3px063c" };

    // Seed foundational data first
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

    // Seed main entities
    await seedAssets(prisma, company1.id);
    await seedLicenses(prisma, company1.id);
    await seedAccessories(prisma, company1.id);
    
    // Seed user assignments
    await seedUserItems(prisma, company1.id);
    
    // Seed pricing plans
    await seedPricingPlans(prisma);

    console.log("🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log("  - Enhanced assets with realistic data and assignments");
    console.log("  - Added comprehensive software licenses with cost optimization data");
    console.log("  - Added IT accessories with inventory management data");
    console.log("  - Created user-item assignments linking everything together");
    console.log(`  - All data linked to company: ${company1.id}`);
    console.log("  - All data linked to primary user: cmc80pcfb00088oa52sxacapd");
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
