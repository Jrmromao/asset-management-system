"use client";

import { useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDialogStore } from "@/lib/stores/store";
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import { useRoleQuery } from "@/hooks/queries/useRoleQuery";
import { inviteUserSecure } from "@/lib/actions/invitation.actions";

// Simplified schema for invitation
const userInviteSchema = z.object({
  email: z.string().email("A valid email is required"),
  roleId: z.string().min(1, "Please select a role"),
});

type UserFormValues = z.infer<typeof userInviteSchema>;

const UserForm = () => {
  const [isPending, startTransition] = useTransition();
  const { roles, isLoading: rolesLoading, error: rolesError } = useRoleQuery();
  const [closeDialog] = useDialogStore((state) => [state.onClose]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userInviteSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: UserFormValues) {
    startTransition(async () => {
      try {
        const result = await inviteUserSecure(data);
        if (result.success) {
          form.reset();
          if (result.invitationUrl) {
            toast.success(
              `Invitation created! Share this link: ${result.invitationUrl}`,
              { duration: 10000 }
            );
          } else {
            toast.success(result.message || "Invitation sent successfully!");
          }
          closeDialog();
        } else {
          toast.error(result.error || "Failed to send invitation.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred.");
        console.error(error);
      }
    });
  }

  // Show loading state
  if (rolesLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="w-full bg-white">
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="font-medium">Invite New User</h3>
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if roles failed to load
  if (rolesError) {
    return (
      <div className="flex flex-col h-full">
        <div className="w-full bg-white">
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="font-medium">Invite New User</h3>
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                  Failed to load roles. Please try again.
                </div>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={closeDialog}
                    className="px-4 py-2 h-9"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 h-9"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="w-full bg-white">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Invite New User</h3>
                <CustomInput
                  required
                  name="email"
                  label="Email Address"
                  control={form.control}
                  type="email"
                  placeholder="Enter email address"
                  disabled={isPending}
                />
                <CustomSelect
                  label="Role"
                  value={form.watch("roleId")}
                  name="roleId"
                  required
                  control={form.control}
                  data={roles || []}
                  placeholder="Select role"
                  disabled={isPending}
                />
                <p className="mt-2 text-sm text-gray-500">
                  The user will receive an email to set up their account and
                  password.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  className="px-4 py-2 h-9"
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !roles || roles.length === 0}
                  className="px-4 py-2 h-9"
                >
                  {isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
