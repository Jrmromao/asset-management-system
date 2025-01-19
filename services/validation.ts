import { getBaseUrl } from "@/utils/api";

export async function validateEmail(email: string): Promise<boolean> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/validate/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) return false;
    const data = await response.json();
    return !data.exists;
  } catch (error) {
    console.error("Email validation error:", error);
    return false;
  }
}

export async function validateEmployeeId(employeeId: string): Promise<boolean> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/validate/employeeId`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });

    if (!response.ok) return false;
    const data = await response.json();
    return !data.exists;
  } catch (error) {
    console.error("EmployeeId validation error:", error);
    return false;
  }
}
