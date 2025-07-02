/**
 * Calculates the depreciation percentage given total depreciation and total purchase value.
 * @param totalDepreciation - The total depreciation amount.
 * @param totalPurchaseValue - The total purchase value of the assets.
 * @returns Depreciation percentage (0-100).
 */
export function getDepreciationPercentage(
  totalDepreciation: number,
  totalPurchaseValue: number,
): number {
  if (!totalPurchaseValue || totalPurchaseValue === 0) return 0;
  return (totalDepreciation / totalPurchaseValue) * 100;
}

/**
 * Calculates the value retention percentage given current and purchase values.
 * @param totalCurrentValue - The current total value of the assets.
 * @param totalPurchaseValue - The total purchase value of the assets.
 * @returns Value retention percentage (0-100).
 */
export function getValueRetentionPercentage(
  totalCurrentValue: number,
  totalPurchaseValue: number,
): number {
  if (!totalPurchaseValue || totalPurchaseValue === 0) return 0;
  return (totalCurrentValue / totalPurchaseValue) * 100;
}
