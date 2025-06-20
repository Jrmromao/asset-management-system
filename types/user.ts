import { UserStatus } from "@prisma/client";

export type User = {
  name: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string | null;
  employeeId: string | null;
  images: string | null;
  phoneNum: string | null;
  emailVerified: Date | null;
  status: UserStatus;
  companyId: string;
  roleId: string;
  departmentId?: string | null;
  locationId?: string | null;
};
