import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { getAll, insert, remove } from "@/lib/actions/company.actions";
import { RegistrationData } from "@/components/providers/UserContext";

export const MODEL_KEY = ["companies"] as const;

type CreateRoleInput = RegistrationData;

export function useCompanyQuery() {
  const genericQuery = createGenericQuery<Company, CreateRoleInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateRoleInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return remove(id);
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
