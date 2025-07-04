import React, { useState, useEffect } from "react";
import EntityEditDrawer from "@/components/shared/EntityEditDrawer";
import { Pencil } from "lucide-react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import MainFormSkeleton from "@/components/forms/MainFormSkeleton";
import { Button } from "@/components/ui/button";

// Import the improved UserEditForm from UserDetailsView
import UserEditForm from "@/components/forms/user/UserEditForm";
import { inviteUserSecure } from "@/lib/actions/invitation.actions";

interface EditUserDrawerProps {
  userId: string;
  open: boolean;
  onClose: (updatedUser?: any) => void;
}

const EditUserDrawer: React.FC<EditUserDrawerProps> = ({ userId, open, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { findById, updateUser } = useUserQuery();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Only depend on userId and open to avoid infinite loop (findById is stable from hook)
    if (!open) return;
    setLoading(true);
    setError(null);
    findById(userId)
      .then((result: any) => {
        if (result) {
          setUser(result);
        } else {
          setError("Failed to load user");
        }
      })
      .catch((err: any) => {
        setError(err?.message || "Failed to load user");
      })
      .finally(() => setLoading(false));
  }, [userId, open]);

  const handleSuccess = (updatedUser?: any) => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    if (updatedUser) {
      // If parent passed a callback to update user in real time, call it
      if (typeof onClose === "function" && onClose.length > 0) {
        onClose(updatedUser);
        return;
      }
    }
    onClose();
  };

  const handleError = (err: string) => {
    setError(err);
    toast.error("Failed to update user: " + err);
  };

  // Save handler for the form
  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const wasLonee = user?.role === "lonee";
      const isNowLoginEnabled = data.role && data.role !== "lonee";
      let inviteError = null;

      // If switching from lonee to a login-enabled role, send invite
      if (wasLonee && isNowLoginEnabled) {
        // Check quota
        const res = await fetch("/api/user/can-add-active-user");
        const usage = await res.json();
        if (!usage.allowed) {
          toast.error(`User quota reached (${usage.limit}). Upgrade to add more users.`);
          setSaving(false);
          return;
        }
        // Send invite
        const inviteResult = await inviteUserSecure({
          email: data.email,
          roleId: data.role, // or map to roleId as needed
        });
        if (!inviteResult.success) {
          inviteError = inviteResult.error || "Failed to send invitation.";
        }
      }

      // Proceed with user update
      const result = await updateUser({ id: userId, data });
      if (result?.success) {
        handleSuccess(result.data);
        if (inviteError) {
          toast.error(inviteError);
        }
      } else {
        handleError(result?.error || "Unknown error");
      }
    } catch (e: any) {
      handleError(e?.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  console.log("EditUserDrawer render", { userId, user });

  return (
    <EntityEditDrawer
      open={open}
      onClose={onClose}
      title="Edit User"
      description="Make changes to the user details and save when you're done."
      statusLabel={user?.isActive ? "Active" : "Inactive"}
      statusColor={user?.isActive ? "#22C55E" : "#F87171"}
      icon={<Pencil className="h-6 w-6 text-primary" aria-label="User Icon" />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button" disabled={saving}>
            Cancel
          </Button>
          <Button variant="default" form="user-edit-form" type="submit" disabled={saving}>
            Save
          </Button>
        </>
      }
    >
      {loading ? (
        <MainFormSkeleton />
      ) : error ? (
        <div className="text-destructive text-center py-8">
          <p className="font-semibold">Failed to load user.</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <UserEditForm user={user} onSave={handleSave} onCancel={onClose} />
      )}
    </EntityEditDrawer>
  );
};

export default EditUserDrawer; 