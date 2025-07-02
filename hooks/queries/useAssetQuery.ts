import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import {
  getAllAssets,
  createAsset,
  removeAsset,
  updateAsset,
  findAssetById,
  type CreateAssetInput,
} from "@/lib/actions/assets.actions";
import { useAssetUIStore } from "@/lib/stores";
import { EnhancedAssetType } from "@/lib/services/asset.service";
import { useUser } from "@clerk/nextjs";

export const MODEL_KEY = ["assets"] as const;

export function useAssetQuery(options?: {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  status?: string;
  department?: string;
  model?: string;
}) {
  const { onClose } = useAssetUIStore();
  const { user } = useUser();

  return createGenericQuery<
    EnhancedAssetType,
    CreateAssetInput,
    CreateAssetInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        if (!user) {
          return {
            success: false,
            data: [] as EnhancedAssetType[],
            error: "User not authenticated",
          };
        }
        const response = await getAllAssets({
          page: options?.pageIndex ? options.pageIndex + 1 : 1,
          pageSize: options?.pageSize ?? 10,
          search: options?.search,
          sort: options?.sort,
          status: options?.status,
          department: options?.department,
          model: options?.model,
        });
        (response.data as any)._pagination = {
          total: 'total' in response ? (response as any).total ?? 0 : 0,
          page: 'page' in response ? (response as any).page ?? 1 : 1,
          pageSize: 'pageSize' in response ? (response as any).pageSize ?? 10 : 10,
        };
        return {
          success: response.success,
          data: response.data as EnhancedAssetType[],
          error: response.error,
        };
      },
      insert: async (data) => {
        if (!user) {
          return {
            success: false,
            data: undefined,
            error: "User not authenticated",
          };
        }
        const response = await createAsset(data);
        return {
          success: response.success,
          data: Array.isArray(response.data) ? response.data[0] : undefined,
          error: response.error,
        };
      },
      delete: async (id) => {
        if (!user) {
          return {
            success: false,
            data: undefined,
            error: "User not authenticated",
          };
        }
        const response = await removeAsset(id);
        return {
          success: response.success,
          data: Array.isArray(response.data) ? response.data[0] : undefined,
          error: response.error,
        };
      },
      update: async (id, data) => {
        if (!user) {
          return {
            success: false,
            data: undefined,
            error: "User not authenticated",
          };
        }
        const response = await updateAsset(id, data);
        return {
          success: response.success,
          data: Array.isArray(response.data) ? response.data[0] : undefined,
          error: response.error,
        };
      },
      findById: async (id) => {
        if (!user) {
          return {
            success: false,
            data: undefined,
            error: "User not authenticated",
          };
        }
        const response = await findAssetById(id);
        return {
          success: response.success,
          data: Array.isArray(response.data) ? response.data[0] : undefined,
          error: response.error,
        };
      },
    },
    {
      onClose,
    },
  );
}
