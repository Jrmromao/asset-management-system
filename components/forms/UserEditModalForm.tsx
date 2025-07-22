"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import CustomSwitch from "@/components/CustomSwitch";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import { useRoleQuery } from "@/hooks/queries/useRoleQuery";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";

const userEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  title: z.string().optional(),
  employeeId: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  roleId: z.string().min(1, "Role is required"),
  accountType: z.string().min(1, "Account type is required"),
  isActive: z.boolean().optional(),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

const accountTypeOptions = [
  { id: "employee", name: "Employee" },
  { id: "contractor", name: "Contractor" },
  { id: "guest", name: "Guest" },
];

interface UserEditModalFormProps {
  user: any;
  onSubmitSuccess?: () => void;
}

const UserEditModalForm: React.FC<UserEditModalFormProps> = ({ 
  user, 
  onSubmitSuccess 
}) => {
  const [isPending, setIsPending] = useState(false);
  const { updateUser } = useUserQuery();
  const { roles, isLoading: rolesLoading } = useRoleQuery();
  const { departments, isLoading: departmentsLoading } = useDepartmentQuery();
  
  // State for active user usage
  const [activeUserUsage, setActiveUserUsage] = useState<{
    used: number;
    limit: number;
  } | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      title: user?.title || "",
      employeeId: user?.employeeId || "",
      departmentId: user?.department?.id || "",
      roleId: user?.role?.id || "",
      accountType: user?.accountType || "employee",
      isActive: user?.active ?? true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        title: user.title || "",
        employeeId: user.employeeId || "",
        departmentId: user.department?.id || "",
        roleId: user.role?.id || "",
        accountType: user.accountType || "employee",
        isActive: user.active ?? true,
      });
    }
  }, [user, form]);

  // Fetch active user usage on component mount
  useEffect(() => {
    async function fetchUsage() {
      setUsageLoading(true);
      try {
        const res = await fetch("/api/user/can-add-active-user");
        if (res.ok) {
          const data = await res.json();
          setActiveUserUsage({ used: data.used, limit: data.limit });
        }
      } catch (e) {
        // Ignore for now
      } finally {
        setUsageLoading(false);
      }
    }
    fetchUsage();
  }, []);

  const onSubmit = async (data: UserEditFormValues) => {
    setIsPending(true);
    try {
      // Check if we're activating a user and if it would exceed quota
      const isActivatingUser = data.isActive && !user.active;
      
      if (isActivatingUser) {
        // Check current user quota before activating
        const quotaResponse = await fetch("/api/user/can-add-active-user");
        if (quotaResponse.ok) {
          const quotaData = await quotaResponse.json();
          if (!quotaData.allowed) {
            toast.error(
              `Cannot activate user. You've reached your active user limit (${quotaData.used}/${quotaData.limit}). Please upgrade your plan to add more users.`
            );
            setIsPending(false);
            return;
          }
        } else {
          toast.error("Could not verify user quota. Please try again.");
          setIsPending(false);
          return;
        }
      }

      const result = await updateUser({ 
        id: user.id, 
        data: {
          ...data,
          name: `${data.firstName} ${data.lastName}`.trim(),
        }
      });

      if (result?.success) {
        toast.success("User updated successfully!");
        onSubmitSuccess?.();
      } else {
        toast.error(result?.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  if (rolesLoading || departmentsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Show active user usage */}
        <div className="mb-2 text-sm text-gray-600">
          {usageLoading ? (
            <span>Loading user quota...</span>
          ) : activeUserUsage ? (
            <span>
              Active users: <b>{activeUserUsage.used}</b> of{" "}
              <b>{activeUserUsage.limit}</b> used
            </span>
          ) : null}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="firstName"
            label="First Name"
            placeholder="Enter first name"
            required
          />
          <CustomInput
             control={form.control}
            name="lastName"
            label="Last Name"
            placeholder="Enter last name"
            required
          />
        </div>

        <CustomInput
         control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="Enter email address"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            control={form.control}
            name="title"
            label="Job Title"
            placeholder="Enter job title"
          />
          <CustomInput
            control={form.control}
            name="employeeId"
            label="Employee ID"
            placeholder="Enter employee ID"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelect
            control={form.control}
            name="departmentId"
            label="Department"
            placeholder="Select department"
            data={departments?.map(dept => ({
              id: dept.id,
              name: dept.name
            })) || []}
            required
          />
          <CustomSelect
            control={form.control}
            name="roleId"
            label="Role"
            placeholder="Select role"
            data={roles?.map(role => ({
              id: role.id,
              name: role.name
            })) || []}
            required
          />
        </div>

        <CustomSelect
          control={form.control}
          name="accountType"
          label="Account Type"
          placeholder="Select account type"
          data={accountTypeOptions}
          required
        />

        <CustomSwitch
          control={form.control}
          name="isActive"
          label="Is Active"
        />
        
        {/* Show warning if trying to activate user at quota limit */}
        {activeUserUsage && !user.active && activeUserUsage.used >= activeUserUsage.limit && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
            ⚠️ Warning: You've reached your active user limit. You cannot activate this user until you upgrade your plan.
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-[100px]"
          >
            {isPending ? "Updating..." : "Update User"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserEditModalForm; 