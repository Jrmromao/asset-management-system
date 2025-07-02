import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import {
  getPurchaseOrders,
  // Add other actions if they exist
} from "@/lib/actions/purchaseOrder.actions";
import type { PurchaseOrder } from "@prisma/client";
import { useUser } from "@clerk/nextjs";

export const PO_KEY = ["purchaseOrders"] as const;

export function usePurchaseOrderQuery() {
  const { user } = useUser();
  const companyId = user?.publicMetadata?.companyId as string | undefined;

  const genericQuery = createGenericQuery<any, any, any>(PO_KEY, {
    getAll: async () => {
      if (!companyId) {
        return { success: true, data: [] };
      }
      try {
        const data = await getPurchaseOrders(companyId);
        return { success: true, data };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: errorMessage, data: [] };
      }
    },
    // Dummy implementations for insert, update, delete if not needed
    insert: async (data) =>
      Promise.resolve({
        success: false,
        data: undefined,
        error: "Not implemented",
      }),
    update: async (id, data) =>
      Promise.resolve({
        success: false,
        data: undefined,
        error: "Not implemented",
      }),
    delete: async (id) =>
      Promise.resolve({
        success: false,
        data: undefined,
        error: "Not implemented",
      }),
  });
  return genericQuery;
}
