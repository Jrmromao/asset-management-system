import { PrismaClient } from "@prisma/client";

export async function seedModels(prisma: PrismaClient, companyId: string) {
  console.log("📱 Seeding models...");

  const models = [
    { name: "MacBook Pro 16-inch", modelNo: "MBP16", manufacturerName: "Apple", active: true },
    { name: "MacBook Air 13-inch", modelNo: "MBA13", manufacturerName: "Apple", active: true },
    { name: "Dell Latitude 5520", modelNo: "LAT5520", manufacturerName: "Dell", active: true },
    { name: "Dell OptiPlex 7090", modelNo: "OPT7090", manufacturerName: "Dell", active: true },
    { name: "HP EliteBook 840", modelNo: "ELB840", manufacturerName: "HP", active: true },
    { name: "HP ProBook 450", modelNo: "PRB450", manufacturerName: "HP", active: true },
    { name: "Lenovo ThinkPad X1", modelNo: "TPX1", manufacturerName: "Lenovo", active: true },
    { name: "iPhone 15 Pro", modelNo: "IP15P", manufacturerName: "Apple", active: true },
    { name: "iPad Pro 12.9", modelNo: "IP12P", manufacturerName: "Apple", active: true },
    { name: "Samsung Galaxy S24", modelNo: "SGS24", manufacturerName: "Samsung", active: true },
  ];

  const createdModels = [];
  for (const model of models) {
    const manufacturer = await prisma.manufacturer.findFirst({ where: { name: model.manufacturerName } });
    if (manufacturer) {
      const created = await prisma.model.upsert({
        where: { id: `model_${model.name}_${manufacturer.id}` },
        update: {},
        create: {
          name: model.name,
          modelNo: model.modelNo,
          manufacturerId: manufacturer.id,
          companyId: companyId,
          active: model.active,
        },
      });
      createdModels.push(created);
      console.log(`✅ Created model: ${created.name}`);
    }
  }

  return createdModels;
} 