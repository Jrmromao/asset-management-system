import { headers } from "next/headers";
import { getIpAddress } from "./getIpAddress";

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

describe("getIpAddress", () => {
  const mockHeaders = (headerValues: Record<string, string | null>) => {
    (headers as jest.Mock).mockReturnValue({
      get: (key: string) => headerValues[key] || null,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return IP from x-forwarded-for header", () => {
    mockHeaders({
      "x-forwarded-for": "123.45.67.89",
    });

    expect(getIpAddress()).toBe("123.45.67.89");
  });

  test("should return first IP from multiple x-forwarded-for IPs", () => {
    mockHeaders({
      "x-forwarded-for": "123.45.67.89, 98.76.54.32",
    });

    expect(getIpAddress()).toBe("123.45.67.89");
  });

  test("should return IP from x-real-ip when x-forwarded-for is missing", () => {
    mockHeaders({
      "x-forwarded-for": null,
      "x-real-ip": "98.76.54.32",
    });

    expect(getIpAddress()).toBe("98.76.54.32");
  });

  test("should return IP from cf-connecting-ip when other headers are missing", () => {
    mockHeaders({
      "x-forwarded-for": null,
      "x-real-ip": null,
      "cf-connecting-ip": "11.22.33.44",
    });

    expect(getIpAddress()).toBe("11.22.33.44");
  });

  test('should return "unknown" when no IP headers are present', () => {
    mockHeaders({
      "x-forwarded-for": null,
      "x-real-ip": null,
      "cf-connecting-ip": null,
    });

    expect(getIpAddress()).toBe("unknown");
  });

  test("should handle empty string in headers", () => {
    mockHeaders({
      "x-forwarded-for": "",
    });

    expect(getIpAddress()).toBe("unknown");
  });

  test("should handle malformed IP addresses", () => {
    mockHeaders({
      "x-forwarded-for": "invalid.ip.address",
    });

    expect(getIpAddress()).toBe("invalid.ip.address");
  });
});
