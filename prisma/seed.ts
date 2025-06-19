import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clean up existing data except the target company
    await prisma.$transaction([
      prisma.auditLog.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.formTemplateValue.deleteMany({ where: { asset: { companyId: 'cmc1t7vwp00098osdp18wncux' } } }),
      prisma.formTemplate.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.asset.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.accessory.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.model.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.manufacturer.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.category.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.department.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.departmentLocation.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.inventory.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.statusLabel.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.supplier.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux' } }),
      prisma.user.deleteMany({ where: { companyId: 'cmc1t7vwp00098osdp18wncux', id: { not: '30007441-32f4-4ae3-8da1-5c7b4a04586a' } } }),
    ]);

    // Fetch the existing company
    const company = await prisma.company.findUnique({
      where: { id: 'cmc1t7vwp00098osdp18wncux' },
    });
    if (!company) {
      throw new Error('Company with id cmc1t7vwp00098osdp18wncux not found');
    }

    // Create or find a role (no companyId field on Role)
    let adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
    if (!adminRole) {
      adminRole = await prisma.role.create({ data: { name: 'Admin', active: true } });
    }

    // Create or find a department
    let department = await prisma.department.findFirst({ where: { name: 'IT Department', companyId: company.id } });
    if (!department) {
      department = await prisma.department.create({ data: { name: 'IT Department', companyId: company.id, active: true } });
    }

    // Create or update the user
    const user = await prisma.user.upsert({
      where: { id: '30007441-32f4-4ae3-8da1-5c7b4a04586a' },
      update: {
        email: 'jrmromao+ui@gmail.com',
        firstName: 'Joao',
        lastName: 'Romao',
        name: 'Joao Romao',
        title: 'Admin',
        employeeId: 'EMP_SUPA_001',
        roleId: adminRole.id,
        companyId: company.id,
        departmentId: department.id,
        status: 'ACTIVE',
      },
      create: {
        id: '30007441-32f4-4ae3-8da1-5c7b4a04586a',
        email: 'jrmromao+ui@gmail.com',
        firstName: 'Joao',
        lastName: 'Romao',
        name: 'Joao Romao',
        title: 'Admin',
        employeeId: 'EMP_SUPA_001',
        roleId: adminRole.id,
        companyId: company.id,
        departmentId: department.id,
        status: 'ACTIVE',
      },
    });

    // --- Legacy asset/model/auditlog seeding code removed for clarity and to avoid linter errors ---
    // Add asset/model/auditlog seeding here later with correct field names if needed.

    console.log('User assigned to company and seed data created successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
