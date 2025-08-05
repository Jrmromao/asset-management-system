// Helper function to parse onboarding data from company notes
export const parseOnboardingData = (notes: string | null) => {
  if (!notes) return null;

  try {
    const data = JSON.parse(notes);
    return {
      assetCount: data.assetCount,
      useCases: data.useCases,
      painPoints: data.painPoints,
      phoneNumber: data.phoneNumber,
      onboardingCompletedAt: data.onboardingCompletedAt,
    };
  } catch (error) {
    console.error("Failed to parse onboarding data:", error);
    return null;
  }
};

// Helper function to convert company size string to number
export const parseCompanySize = (companySize: string): number | null => {
  if (!companySize) return null;

  // Handle "500+" format
  if (companySize.includes("+")) {
    return parseInt(companySize.replace("+", ""));
  }

  // Handle "1-10", "11-50", etc. format - take the lower bound
  if (companySize.includes("-")) {
    return parseInt(companySize.split("-")[0]);
  }

  // Handle plain numbers
  const parsed = parseInt(companySize);
  return isNaN(parsed) ? null : parsed;
};
