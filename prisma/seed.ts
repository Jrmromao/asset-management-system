import { PrismaClient } from "@prisma/client";
import { seedGlobalRoles } from "./seeds/roles";
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
    // Seed global roles first (no company required)
    // await seedGlobalRoles(prisma);

    // Seed pricing plans (also global/system-wide)
    // await seedPricingPlans(prisma);

    // Uncomment these when you need to seed company-specific data
    // You'll need to create companies first, then seed their data

    // const company = await prisma.company.create({
    //   data: {
    //     name: "Example Company",
    //     primaryContactEmail: "admin@example.com",
    //     status: "ACTIVE",
    //   },
    // });
    const company = {
      id: "cmcavp31o000x8ozo07zcd7mu",
    };

    // await seedStatusLabels(prisma, company.id);
    // const categories = await seedCategories(prisma, company.id);
    // await seedFormTemplates(prisma, company.id, categories);
    // await seedDepartments(prisma, company.id);
    // await seedLocations(prisma, company.id);
    // await seedInventories(prisma, company.id);
    // await seedSuppliers(prisma, company.id);
    // await seedManufacturers(prisma);
    // await seedModels(prisma, company.id);
    // await seedAssets(prisma, company.id);
    // await seedLicenses(prisma, company.id);
    // await seedAccessories(prisma, company.id);
    // await seedUserItems(prisma, company.id);

    console.log("🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log("  - Created 3 global roles that can be used by any company");
    console.log("  - Super Admin: Full system access");
    console.log("  - Admin: Company management access");
    console.log("  - User: Basic user access (default)");
    console.log("  - Created pricing plans for subscriptions");
    console.log("  - Free: Up to 10 assets");
    console.log("  - Pro: Up to 100,000 assets");
    console.log("  - Enterprise: Unlimited assets");
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
