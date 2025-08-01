import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import CustomSwitch from "@/components/CustomSwitch";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormContainer } from "@/components/forms/FormContainer";
import FormSection from "@/components/forms/FormSection";
import { Card, CardContent } from "@/components/ui/card";

const userEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  title: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  role: z.string().min(1, "Role is required"),
  accountType: z.string().min(1, "Account type is required"),
  isActive: z.boolean().optional(),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

const roleOptions = [
  { id: "admin", name: "Admin" },
  { id: "manager", name: "Manager" },
  { id: "user", name: "User" },
  { id: "lonee", name: "Lonee" }, // Added lonee as a valid role
];
const accountTypeOptions = [
  { id: "employee", name: "Employee" },
  { id: "contractor", name: "Contractor" },
  { id: "guest", name: "Guest" },
];

// Helper to robustly extract a string value from possible string/object/null
function getStringValue(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.name) return val.name;
  if (typeof val === "object" && val.id) return val.id;
  return "";
}

function mapDepartmentNameToId(name: any): string {
  const str = getStringValue(name).toLowerCase();
  switch (str) {
    case "engineering":
      return "engineering";
    case "hr":
      return "hr";
    case "finance":
      return "finance";
    case "it department":
    case "it":
      return "it";
    default:
      return "";
  }
}

function mapRoleNameToId(name: any): string {
  const str = getStringValue(name).toLowerCase();
  switch (str) {
    case "admin":
      return "admin";
    case "manager":
      return "manager";
    case "user":
      return "user";
    case "lonee":
      return "lonee"; // Map lonee to lonee
    default:
      return "user";
  }
}

function mapAccountTypeNameToId(name: any): string {
  const str = getStringValue(name).toLowerCase();
  switch (str) {
    case "employee":
    case "internal user":
      return "employee";
    case "contractor":
      return "contractor";
    case "guest":
      return "guest";
    default:
      return "";
  }
}

const UserEditForm: React.FC<{
  user: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ user, onSave, onCancel }) => {
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);

  useEffect(() => {
    setDepartmentsLoading(true);
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.departments)) {
          setDepartments(
            data.departments.map((d: any) => ({ id: d.id, name: d.name })),
          );
        } else {
          setDepartments([]);
        }
      })
      .catch(() => setDepartments([]))
      .finally(() => setDepartmentsLoading(false));
  }, []);

  const defaultValues = React.useMemo(
    () => ({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      title: user.title || "",
      employeeId: user.employeeId || "",
      department: user.department?.id || "",
      role: mapRoleNameToId(user.role),
      accountType: mapAccountTypeNameToId(user.accountType),
      isActive: user.isActive ?? true,
    }),
    [user],
  );

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { handleSubmit, control, formState } = form;

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  // Wrap onSave to include departmentId and map isActive to active
  const handleSave = (data: any) => {
    const departmentId = data.department;
    onSave({ ...data, departmentId, active: data.isActive });
  };

  return (
    <FormContainer
      form={form}
      requiredFields={[]}
      requiredFieldsCount={0}
      hideProgress
    >
      <Form {...form}>
        <form
          id="user-edit-form"
          onSubmit={handleSubmit(handleSave)}
          className="space-y-6"
        >
          <Card className="bg-white border-gray-200">
            <CardContent className="divide-y divide-slate-100">
              <FormSection title="Profile Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInput
                    name="firstName"
                    label="First Name"
                    control={control}
                    required
                  />
                  <CustomInput
                    name="lastName"
                    label="Last Name"
                    control={control}
                    required
                  />
                </div>
                <CustomInput name="title" label="Title" control={control} />
                <CustomInput
                  name="employeeId"
                  label="Employee ID"
                  control={control}
                  readonly
                />
              </FormSection>
              <FormSection title="Organization">
                <CustomSelect
                  name="department"
                  label="Department"
                  control={control}
                  data={departments}
                  required
                  placeholder={
                    departmentsLoading ? "Loading..." : "Select department"
                  }
                  disabled={departmentsLoading}
                />
                <CustomSelect
                  name="role"
                  label="Role"
                  control={control}
                  data={roleOptions}
                  required
                  placeholder="Select role"
                />
              </FormSection>
              <FormSection title="Account">
                <CustomInput
                  name="email"
                  label="Email"
                  control={control}
                  required
                  type="email"
                />
                <CustomSelect
                  name="accountType"
                  label="Account Type"
                  control={control}
                  data={accountTypeOptions}
                  required
                  placeholder="Select account type"
                />
              </FormSection>
              <FormSection title="Status">
                <CustomSwitch
                  name="isActive"
                  label="Active"
                  control={control}
                />
              </FormSection>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormContainer>
  );
};

export default UserEditForm;
