const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "Preventive", description: "Scheduled maintenance to prevent issues", color: "#22C55E" },
  { name: "Corrective", description: "Fix existing problems", color: "#F59E0B" },
  { name: "Emergency", description: "Urgent maintenance", color: "#EF4444" },
];
const defaultTypes = [
  { name: "Oil Change", description: "Regular engine oil replacement", categoryName: "Preventive", priority: "Medium", color: "#3B82F6", icon: "wrench" },
  { name: "Filter Replacement", description: "Replace air or oil filters", categoryName: "Preventive", priority: "Low", color: "#22C55E", icon: "tool" },
  { name: "Breakdown Repair", description: "Fix equipment breakdowns", categoryName: "Corrective", priority: "High", color: "#EF4444", icon: "alert" },
];

async function addDefaults(companyId) {
  if (!companyId) {
    console.error('Usage: node scripts/add-default-maintenance.js <companyId>');
    process.exit(1);
  }
  console.log(`Adding default maintenance categories and types to company: ${companyId}`);
  // 1. Create default categories if not exist
  for (const cat of defaultCategories) {
    const exists = await prisma.maintenanceCategory.findFirst({
      where: { name: cat.name, companyId }
    });
    if (!exists) {
      await prisma.maintenanceCategory.create({
        data: { ...cat, companyId }
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
  }
  // 2. Create default types if not exist, linking to the right category
  for (const type of defaultTypes) {
    const category = await prisma.maintenanceCategory.findFirst({
      where: { name: type.categoryName, companyId }
    });
    if (!category) {
      console.warn(`Category not found for type: ${type.name}`);
      continue;
    }
    const exists = await prisma.maintenanceType.findFirst({
      where: { name: type.name, companyId }
    });
    if (!exists) {
      await prisma.maintenanceType.create({
        data: {
          name: type.name,
          description: type.description,
          categoryId: category.id,
          priority: type.priority,
          color: type.color,
          icon: type.icon,
          companyId,
          requiredSkills: [],
          checklist: [],
          customFields: [],
          estimatedDuration: 1,
          defaultCost: 0,
          isActive: true,
        }
      });
      console.log(`Created type: ${type.name}`);
    } else {
      console.log(`Type already exists: ${type.name}`);
    }
  }
  await prisma.$disconnect();
  console.log('Done!');
}

if (require.main === module) {
  addDefaults(process.argv[2]);
}

module.exports = { addDefaults }; 