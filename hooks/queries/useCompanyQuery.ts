import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import {
  getAllCompanies,
  createCompany,
  deleteCompany,
  updateCompany,
} from "@/lib/actions/company.actions";
import { RegistrationData } from "@/components/providers/UserContext";

export const MODEL_KEY = ["companies"] as const;

type CreateRoleInput = RegistrationData;
type UpdateCompanyInput = { name: string };
type GenericQueryType = ReturnType<typeof createGenericQuery<Company, CreateRoleInput, UpdateCompanyInput>>;

export function useCompanyQuery() {
  const genericQuery: GenericQueryType = createGenericQuery<Company, CreateRoleInput, UpdateCompanyInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllCompanies();
      },
      insert: async (data: CreateRoleInput) => {
        return await createCompany(data);
      },
      delete: async (id: string) => {
        return await deleteCompany(id);
      },
      update: async (id: string, data: UpdateCompanyInput) => {
        return await updateCompany(id, data.name);
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
    isCreating,
    refresh,
  };
}
