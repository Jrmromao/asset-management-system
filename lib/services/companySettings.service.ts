import { prisma } from "@/app/db"; // Adjust path if needed

export async function getCompanySettings(companyId: string) {
  return prisma.companySettings.findUnique({
    where: { companyId },
  });
}

export async function updateCompanySettings(
  companyId: string,
  data: Partial<{ assetTagFormat: string }>,
) {
  return prisma.companySettings.upsert({
    where: { companyId },
    update: data,
    create: { companyId, ...data },
  });
}
