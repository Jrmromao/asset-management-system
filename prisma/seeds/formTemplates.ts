import { PrismaClient } from "@prisma/client";

export async function seedFormTemplates(
  prisma: PrismaClient,
  companyId: string,
  categories: any[],
) {
  console.log("📋 Seeding form templates...");

  const formTemplates = [
    {
      name: "Computer Equipment",
      categoryName: "Computers & Laptops",
      fields: [
        { name: "processor", label: "Processor", type: "text", required: true },
        { name: "ram", label: "RAM (GB)", type: "number", required: true },
        {
          name: "storage",
          label: "Storage (GB)",
          type: "number",
          required: true,
        },
        { name: "os", label: "Operating System", type: "text", required: true },
      ],
    },
    {
      name: "Mobile Device",
      categoryName: "Mobile Devices",
      fields: [
        {
          name: "screenSize",
          label: "Screen Size (inches)",
          type: "number",
          required: true,
        },
        {
          name: "storage",
          label: "Storage (GB)",
          type: "number",
          required: true,
        },
        { name: "carrier", label: "Carrier", type: "text", required: false },
      ],
    },
    {
      name: "Network Equipment",
      categoryName: "Networking Equipment",
      fields: [
        {
          name: "ports",
          label: "Number of Ports",
          type: "number",
          required: true,
        },
        {
          name: "speed",
          label: "Speed (Gbps)",
          type: "number",
          required: true,
        },
        {
          name: "poe",
          label: "Power over Ethernet",
          type: "checkbox",
          required: false,
        },
      ],
    },
  ];

  const createdTemplates = [];
  for (const template of formTemplates) {
    const category = categories.find(
      (cat) => cat.name === template.categoryName,
    );
    if (!category) {
      console.warn(`⚠️ No category found for template: ${template.name}`);
      continue;
    }
    const created = await prisma.formTemplate.upsert({
      where: { name_companyId: { name: template.name, companyId } },
      update: {},
      create: {
        name: template.name,
        fields: template.fields,
        companyId,
        categoryId: category.id,
      },
    });
    createdTemplates.push(created);
    console.log(`✅ Created form template: ${created.name}`);
  }

  return createdTemplates;
}
