import { headers } from "next/headers";

export function getIpAddress(): string {
  const headersList = headers();

  // Try different header variations that might contain the IP
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "unknown";

  return ip;
}
