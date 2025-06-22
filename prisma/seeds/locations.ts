import { PrismaClient } from "@prisma/client";

export async function seedLocations(prisma: PrismaClient, companyId: string) {
  console.log("📍 Seeding locations...");

  const locations = [
    { 
      name: "Main Office - Floor 1", 
      addressLine1: "123 Main St, Floor 1", 
      city: "San Francisco", 
      state: "CA", 
      zip: "94105",
      country: "USA"
    },
    { 
      name: "Main Office - Floor 2", 
      addressLine1: "123 Main St, Floor 2", 
      city: "San Francisco", 
      state: "CA", 
      zip: "94105",
      country: "USA"
    },
    { 
      name: "Remote Office - NYC", 
      addressLine1: "456 Broadway", 
      city: "New York", 
      state: "NY", 
      zip: "10013",
      country: "USA"
    },
    { 
      name: "Warehouse", 
      addressLine1: "789 Industrial Ave", 
      city: "Oakland", 
      state: "CA", 
      zip: "94601",
      country: "USA"
    },
    { 
      name: "Data Center", 
      addressLine1: "321 Tech Blvd", 
      city: "San Jose", 
      state: "CA", 
      zip: "95112",
      country: "USA"
    },
  ];

  const createdLocations = [];
  for (const location of locations) {
    const created = await prisma.departmentLocation.upsert({
      where: { name_companyId: { name: location.name, companyId } },
      update: {},
      create: { ...location, companyId },
    });
    createdLocations.push(created);
    console.log(`✅ Created location: ${created.name}`);
  }

  return createdLocations;
} 