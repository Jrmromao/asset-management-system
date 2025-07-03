import { PrismaClient } from "@prisma/client";

export async function seedGlobalRoles(prisma: PrismaClient) {
  console.log("👥 Seeding global roles...");

  const globalRoles = [
    {
      name: "Super Admin",
      isAdmin: true,
      isDefault: false,
      isGlobal: true,
      permissions: {
        canManageUsers: true,
        canManageAssets: true,
        canManageLicenses: true,
        canManageAccessories: true,
        canManageReports: true,
        canManageSettings: true,
        canViewAuditLogs: true,
        canManageCompany: true,
      },
    },
    {
      name: "Admin",
      isAdmin: true,
      isDefault: false,
      isGlobal: true,
      permissions: {
        canManageUsers: true,
        canManageAssets: true,
        canManageLicenses: true,
        canManageAccessories: true,
        canManageReports: true,
        canManageSettings: false,
        canViewAuditLogs: true,
        canManageCompany: false,
      },
    },
    {
      name: "User",
      isAdmin: false,
      isDefault: true,
      isGlobal: true,
      permissions: {
        canManageUsers: false,
        canManageAssets: false,
        canManageLicenses: false,
        canManageAccessories: false,
        canManageReports: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canManageCompany: false,
      },
    },
    {
      name: "Lonee",
      isAdmin: false,
      isDefault: false,
      isGlobal: true,
      permissions: {
        canManageUsers: false,
        canManageAssets: false,
        canManageLicenses: false,
        canManageAccessories: false,
        canManageReports: false,
        canManageSettings: false,
        canViewAuditLogs: false,
        canManageCompany: false,
      },
    },
  ];

  const createdRoles = [];
  for (const role of globalRoles) {
    // For global roles, check by name and isGlobal flag
    const existingRole = await prisma.role.findFirst({
      where: {
        name: role.name,
        isGlobal: true,
      },
    });

    let created;
    if (existingRole) {
      created = existingRole;
      console.log(`✅ Found existing global role: ${created.name}`);
    } else {
      created = await prisma.role.create({
        data: role,
      });
      console.log(
        `✅ Created global role: ${created.name} (Admin: ${created.isAdmin})`,
      );
    }
    createdRoles.push(created);
  }

  console.log(`👥 Successfully processed ${createdRoles.length} global roles`);
  return createdRoles;
}
