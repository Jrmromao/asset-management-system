import { PrismaClient } from "@prisma/client";

export async function seedUserItems(prisma: PrismaClient, companyId: string) {
  console.log("👤 Seeding user item assignments...");

  // Use the specific user ID you provided
  const primaryUserId = "cmc80pcfb00088oa52sxacapd";
  
  // Verify the user exists
  const primaryUser = await prisma.user.findFirst({ 
    where: { 
      companyId,
      id: primaryUserId
    } 
  });
  
  if (!primaryUser) {
    console.log(`⚠️ Primary user ${primaryUserId} not found, skipping user item assignments`);
    return [];
  }

  // Get some licenses and accessories to assign
  const licenses = await prisma.license.findMany({ 
    where: { companyId },
    take: 3 // Assign first 3 licenses
  });
  
  const accessories = await prisma.accessory.findMany({ 
    where: { companyId },
    take: 2 // Assign first 2 accessories
  });

  const userItemAssignments = [];

  // Assign licenses to user
  for (const license of licenses) {
    try {
      const userItem = await prisma.userItem.create({
        data: {
          userId: primaryUserId, // ✅ Linked to user: cmc80pcfb00088oa52sxacapd
          itemId: license.id,
          itemType: "LICENSE",
          companyId, // ✅ Linked to company: cmc80pcez00048oa5v3px063c
        },
      });
      userItemAssignments.push(userItem);
      console.log(`✅ Assigned license ${license.name} to user ${primaryUser.firstName} ${primaryUser.lastName} (${primaryUserId})`);
    } catch (error) {
      console.error(`❌ Failed to assign license ${license.name}:`, error);
    }
  }

  // Assign accessories to user
  for (const accessory of accessories) {
    try {
      const userItem = await prisma.userItem.create({
        data: {
          userId: primaryUserId, // ✅ Linked to user: cmc80pcfb00088oa52sxacapd
          itemId: accessory.id,
          itemType: "ACCESSORY",
          companyId, // ✅ Linked to company: cmc80pcez00048oa5v3px063c
        },
      });
      userItemAssignments.push(userItem);
      console.log(`✅ Assigned accessory ${accessory.name} to user ${primaryUser.firstName} ${primaryUser.lastName} (${primaryUserId})`);
    } catch (error) {
      console.error(`❌ Failed to assign accessory ${accessory.name}:`, error);
    }
  }

  return userItemAssignments;
} 