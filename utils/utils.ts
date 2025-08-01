export const getActionColor = (action: string) => {
  if (!action) return "text-gray-600"; // Safe fallback

  switch (action.trim().toUpperCase()) {
    // Asset actions
    case "ASSET_CHECKIN":
      return "text-green-600";
    case "ASSET_CHECKOUT":
      return "text-blue-600";
    case "ASSET_CREATED":
      return "text-purple-600";
    case "ASSET_UPDATED":
      return "text-amber-600";
    case "ASSET_DELETED":
      return "text-red-600";
    case "ASSET_ARCHIVED":
      return "text-gray-600";

    // Accessory actions
    case "ACCESSORY_CREATED":
      return "text-purple-600";
    case "ACCESSORY_UPDATED":
      return "text-amber-600";
    case "ACCESSORY_DELETED":
      return "text-red-600";
    case "ACCESSORY_CHECKOUT":
      return "text-blue-600";
    case "ACCESSORY_CHECKIN":
      return "text-green-600";
    case "ACCESSORY_ARCHIVED":
      return "text-gray-600";

    // License actions
    case "LICENSE_CREATED":
      return "text-purple-600";
    case "LICENSE_UPDATED":
      return "text-amber-600";
    case "LICENSE_DELETED":
      return "text-red-600";
    case "LICENSE_CHECKOUT":
      return "text-blue-600";
    case "LICENSE_CHECKIN":
      return "text-green-600";
    case "LICENSE_ARCHIVED":
      return "text-gray-600";

    // Default for any other actions
    default:
      return "text-gray-600";
  }
};

export interface AssetFilter {
  search: string;
  type: string[];
  status: string[];
  lifecycle: string[];
}

export function handleError(
  error: unknown,
  defaultMessage: string,
): ActionResponse<never> {
  console.error(defaultMessage, error);
  return {
    error: error instanceof Error ? error.message : defaultMessage,
  };
}

export interface APIResponse<T> {
  data?: T[];
  success?: boolean;
  message?: string;
  error?: string;
  redirectUrl?: string;
}
