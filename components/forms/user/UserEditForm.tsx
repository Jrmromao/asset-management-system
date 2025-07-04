import React, { useEffect } from "react";
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

const departmentOptions = [
  { id: "engineering", name: "Engineering" },
  { id: "hr", name: "HR" },
  { id: "finance", name: "Finance" },
  { id: "it", name: "IT" },
];
const roleOptions = [
  { id: "admin", name: "Admin" },
  { id: "manager", name: "Manager" },
  { id: "user", name: "User" },
];
const accountTypeOptions = [
  { id: "employee", name: "Employee" },
  { id: "contractor", name: "Contractor" },
  { id: "guest", name: "Guest" },
];

const UserEditForm: React.FC<{ user: any; onSave: (data: any) => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
  const defaultValues = React.useMemo(() => ({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    title: user.title || "",
    employeeId: user.employeeId || "",
    department: user.department || "",
    role: user.role || "",
    accountType: user.accountType || "",
    isActive: user.isActive ?? true,
  }), [user]);

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const { handleSubmit, control, formState } = form;

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <FormContainer form={form} requiredFields={[]} requiredFieldsCount={0} hideProgress>
      <Form {...form}>
        <form id="user-edit-form" onSubmit={handleSubmit(onSave)} className="space-y-6">
          <Card><CardContent><FormSection title="Profile Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput name="firstName" label="First Name" control={control} required />
              <CustomInput name="lastName" label="Last Name" control={control} required />
            </div>
            <CustomInput name="title" label="Title" control={control} />
            <CustomInput name="employeeId" label="Employee ID" control={control} />
          </FormSection></CardContent></Card>
          <Card><CardContent><FormSection title="Organization">
            <CustomSelect name="department" label="Department" control={control} data={departmentOptions} required placeholder="Select department" />
            <CustomSelect name="role" label="Role" control={control} data={roleOptions} required placeholder="Select role" />
          </FormSection></CardContent></Card>
          <Card><CardContent><FormSection title="Account">
            <CustomInput name="email" label="Email" control={control} required type="email" />
            <CustomSelect name="accountType" label="Account Type" control={control} data={accountTypeOptions} required placeholder="Select account type" />
          </FormSection></CardContent></Card>
          <Card><CardContent><FormSection title="Status">
            <CustomSwitch name="isActive" label="Active" control={control} />
          </FormSection></CardContent></Card>
        </form>
      </Form>
    </FormContainer>
  );
};

export default UserEditForm; 