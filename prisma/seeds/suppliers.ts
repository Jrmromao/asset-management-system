import { PrismaClient } from "@prisma/client";

export async function seedSuppliers(prisma: PrismaClient, companyId: string) {
  console.log("🏪 Seeding suppliers...");

  const suppliers = [
    { 
      name: "Apple Inc.", 
      contactName: "John Smith", 
      email: "procurement@apple.com", 
      phoneNum: "+1-800-275-2273",
      addressLine1: "1 Apple Park Way",
      city: "Cupertino",
      state: "CA",
      zip: "95014",
      country: "USA"
    },
    { name: "Apple Inc.", contactName: "John Smith", email: "procurement@apple.com", phoneNum: "+1-800-275-2273" },
    { name: "Dell Technologies", contactName: "Sarah Johnson", email: "sales@dell.com", phoneNum: "+1-800-999-3355" },
    { name: "HP Inc.", contactName: "Mike Davis", email: "business@hp.com", phoneNum: "+1-800-474-6836" },
    { name: "Cisco Systems", contactName: "Lisa Wilson", email: "sales@cisco.com", phoneNum: "+1-800-553-6387" },
    { name: "Microsoft", contactName: "David Brown", email: "licensing@microsoft.com", phoneNum: "+1-800-642-7676" },
    { name: "Amazon Business", contactName: "Emma Taylor", email: "business@amazon.com", phoneNum: "+1-800-201-7575" },
  ];

  const createdSuppliers = [];
  for (const supplier of suppliers) {
    const created = await prisma.supplier.upsert({
      where: { email_companyId: { email: supplier.email, companyId } },
      update: {},
      create: { ...supplier, companyId, addressLine1: supplier.addressLine1 || "", city: supplier.city || "", state: supplier.state || "", zip: supplier.zip || "", country: supplier.country || "USA" },
    });
    createdSuppliers.push(created);
    console.log(`✅ Created supplier: ${created.name}`);
  }

  return createdSuppliers;
} 