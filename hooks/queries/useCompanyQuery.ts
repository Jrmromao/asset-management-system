import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import {
  getAllCompanies,
  deleteCompany,
  updateCompany,
} from "@/lib/actions/company.actions";
import { RegistrationData } from "@/components/providers/UserContext";

export const MODEL_KEY = ["companies"] as const;

type CreateRoleInput = RegistrationData;
type UpdateCompanyInput = {
  name?: string;
  industry?: string;
  website?: string;
  contactEmail?: string;
  logoUrl?: string;
  employeeCount?: number;
  // Add more fields as needed
};
type GenericQueryType = ReturnType<
  typeof createGenericQuery<Company, CreateRoleInput, UpdateCompanyInput>
>;

// Helper to serialize Decimal fields
function serializeCompany(company: any) {
  return {
    id: company.id,
    name: company.name,
    clerkOrgId: company.clerkOrgId ?? null,
    address: company.address ?? null,
    country: company.country ?? null,
    industry: company.industry ?? null,
    subdomain: company.subdomain ?? null,
    logoUrl: company.logoUrl ?? null,
    website: company.website ?? null,
    notes: company.notes ?? null,
    supportContact: company.supportContact ?? null,
    gdprCompliant: company.gdprCompliant ?? null,
    dataRetentionPolicy: company.dataRetentionPolicy ?? null,
    disasterRecoveryPlan: company.disasterRecoveryPlan ?? null,
    securityContact: company.securityContact ?? null,
    primaryContactEmail: company.primaryContactEmail ?? null,
    primaryContactName: company.primaryContactName ?? null,
    primaryContactPhone: company.primaryContactPhone ?? null,
    billingContactEmail: company.billingContactEmail ?? null,
    billingContactName: company.billingContactName ?? null,
    billingContactPhone: company.billingContactPhone ?? null,
    technicalContactEmail: company.technicalContactEmail ?? null,
    technicalContactName: company.technicalContactName ?? null,
    technicalContactPhone: company.technicalContactPhone ?? null,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
    status: company.status ?? null,
    active: company.active ?? null,
    targetEnergy: company.targetEnergy ? company.targetEnergy.toString() : null,
    targetCarbonReduction: company.targetCarbonReduction
      ? company.targetCarbonReduction.toString()
      : null,
    employeeCount: company.employeeCount ?? undefined,
  };
}

export function useCompanyQuery() {
  const genericQuery: GenericQueryType = createGenericQuery<
    Company,
    CreateRoleInput,
    UpdateCompanyInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        const result = await getAllCompanies();
        if (result.success && Array.isArray(result.data)) {
          result.data = result.data.map(serializeCompany);
        }
        return result;
      },
      insert: async (data: CreateRoleInput) => {
        return await createCompany(data);
      },
      delete: async (id: string) => {
        return await deleteCompany(id);
      },
      update: async (id: string, data: UpdateCompanyInput) => {
        return await updateCompany(id, data);
      },
    },
    {
      successMessage: "",
      errorMessage: "",
    },
  );

  const {
    items: companies,
    isLoading,
    error,
    createItem: createCompany,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    companies,
    isLoading,
    error,
    createCompany,
    updateCompany,
    isCreating,
    refresh,
  };
}
