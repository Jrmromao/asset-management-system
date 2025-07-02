import {
  getDepreciationPercentage,
  getValueRetentionPercentage,
} from "./depreciation";

describe("Depreciation Utilities", () => {
  describe("getDepreciationPercentage", () => {
    it("calculates correct percentage for normal values", () => {
      expect(getDepreciationPercentage(200, 1000)).toBeCloseTo(20);
      expect(getDepreciationPercentage(0, 1000)).toBe(0);
      expect(getDepreciationPercentage(1000, 1000)).toBe(100);
    });

    it("returns 0 if totalPurchaseValue is 0", () => {
      expect(getDepreciationPercentage(100, 0)).toBe(0);
    });

    it("handles negative values", () => {
      expect(getDepreciationPercentage(-100, 1000)).toBeCloseTo(-10);
      expect(getDepreciationPercentage(100, -1000)).toBeCloseTo(-10);
    });
  });

  describe("getValueRetentionPercentage", () => {
    it("calculates correct percentage for normal values", () => {
      expect(getValueRetentionPercentage(800, 1000)).toBeCloseTo(80);
      expect(getValueRetentionPercentage(0, 1000)).toBe(0);
      expect(getValueRetentionPercentage(1000, 1000)).toBe(100);
    });

    it("returns 0 if totalPurchaseValue is 0", () => {
      expect(getValueRetentionPercentage(100, 0)).toBe(0);
    });

    it("handles negative values", () => {
      expect(getValueRetentionPercentage(-100, 1000)).toBeCloseTo(-10);
      expect(getValueRetentionPercentage(100, -1000)).toBeCloseTo(-10);
    });
  });
});
