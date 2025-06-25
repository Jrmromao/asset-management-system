import { prisma } from "@/app/db";

export async function getUserCompanyId(
  clerkUserId: string,
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { oauthId: clerkUserId },
      select: { companyId: true },
    });

    return user?.companyId || null;
  } catch (error) {
    console.error("Error getting user company ID:", error);
    return null;
  }
}

export async function validateUserCompany(clerkUserId: string): Promise<{
  success: boolean;
  companyId?: string;
  error?: string;
}> {
  try {
    const companyId = await getUserCompanyId(clerkUserId);

    if (!companyId) {
      return {
        success: false,
        error: "User is not associated with a company",
      };
    }

    return {
      success: true,
      companyId,
    };
  } catch (error) {
    console.error("Error validating user company:", error);
    return {
      success: false,
      error: "Failed to validate user company",
    };
  }
}
