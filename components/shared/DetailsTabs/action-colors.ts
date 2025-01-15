"use client";

export const ACTION_COLORS: Record<string, string> = {
  // Asset actions
  ASSET_CHECKIN: "text-green-600",
  ASSET_CHECKOUT: "text-blue-600",
  ASSET_CREATED: "text-purple-600",
  ASSET_UPDATED: "text-amber-600",
  ASSET_DELETED: "text-red-600",
  ASSET_ARCHIVED: "text-gray-600",

  // Accessory actions
  ACCESSORY_CREATED: "text-purple-600",
  ACCESSORY_UPDATED: "text-amber-600",
  ACCESSORY_DELETED: "text-red-600",
  ACCESSORY_CHECKOUT: "text-blue-600",
  ACCESSORY_CHECKIN: "text-green-600",
  ACCESSORY_ARCHIVED: "text-gray-600",

  // License actions
  LICENSE_CREATED: "text-purple-600",
  LICENSE_UPDATED: "text-amber-600",
  LICENSE_DELETED: "text-red-600",
  LICENSE_CHECKOUT: "text-blue-600",
  LICENSE_CHECKIN: "text-green-600",
  LICENSE_ARCHIVED: "text-gray-600",
} as const;

export const getActionColor = (action: string): string => {
  return ACTION_COLORS[action] || "text-gray-600";
};
