"use client";

import React, { useMemo, useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QRCode from "react-qr-code";
import {
  BadgeCheck,
  Ban,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  Fingerprint,
  History,
  Key,
  Laptop,
  Loader2,
  Mail,
  Mail as MailIcon,
  Monitor,
  MoreVertical,
  Pencil,
  RefreshCcw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { DetailField } from "@/components/shared/DetailView/DetailField";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ActivityLog from "@/components/shared/ActivityLog/ActivityLog";
import { userAssetColumns } from "@/components/tables/UserAssetColumns";
import EmptyState from "@/components/EmptyState";
import UserProfileSkeleton from "@/components/UserProfileSkeleton";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomButton from "@/components/CustomButton";
import { FaTools, FaChevronRight, FaPen } from "react-icons/fa";
import { licenseColumns } from "@/components/tables/LicensesColumns";
import EntityEditDrawer from "@/components/shared/EntityEditDrawer";
import { useForm } from "react-hook-form";
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import CustomSwitch from "@/components/CustomSwitch";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import EditUserDrawer from "@/components/forms/user/EditUserDrawer";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { UserContext } from "@/components/providers/UserContext";
import { useUserQuery } from "@/hooks/queries/useUserQuery";

// Improved user edit form with all main fields
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

// DetailItem for user fields
const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string | number | null | React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-muted-foreground mt-1">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value || "—"}</div>
    </div>
  </div>
);

// Notes section for user
const NotesSection: React.FC<{
  userId: string;
  currentNotes?: string;
  onNotesUpdate?: (notes: string, newAuditLog?: any) => void;
}> = ({ userId, currentNotes, onNotesUpdate }) => {
  const [notes, setNotes] = React.useState(currentNotes || "");
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const { user: currentUser } = useContext(UserContext);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Call API to update user notes
      const res = await fetch(`/api/users/${userId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, actorId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User notes have been updated successfully.");
        setIsEditing(false);
        // Pass the new audit log entry to the parent
        onNotesUpdate?.(notes, data.data?.lastAuditLog);
      } else {
        toast.error(data.error || "Failed to update notes.");
      }
    } catch (error) {
      toast.error("An error occurred while saving notes.");
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    setNotes(currentNotes || "");
  }, [currentNotes]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>User Notes</CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNotes(currentNotes || "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {notes ? "Edit" : "Add"} Notes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={"Enter notes about this user..."}
            className="min-h-[120px]"
          />
        ) : (
          <div className="min-h-[120px] p-4 border rounded-lg bg-muted/50">
            {notes ? (
              <p className="whitespace-pre-wrap text-sm">{notes}</p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No notes added yet. Click &quot;Add Notes&quot; to add
                information about this user.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface UserDetailsViewProps {
  user: {
    id: string;
    name?: string;
    email: string;
    firstName: string;
    lastName: string;
    title?: string | null;
    employeeId?: string | null;
    accountType?: string;
    active?: boolean;
    role?: { name: string };
    company?: { name: string };
    department?: { name: string };
    userItem?: UserItems[];
    assets?: Asset[];
    licenses?: License[];
  };
  isLoading: boolean;
}

// Local type to reflect backend response
type UserItemWithLicense = UserItems & { license?: License };

export default function UserDetailsView({
  user: initialUser,
  isLoading,
}: UserDetailsViewProps) {
  const router = useRouter();
  const [user, setUser] = React.useState(initialUser);
  React.useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);
  const { findById } = useUserQuery();
  const isLonee =
    user.active === false && ((user as any).status ?? "-") === "REGISTERED";
  const fieldsProfile = [
    {
      label: "Title",
      value: user.title || "-",
      type: "text",
      icon: <BadgeCheck className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Employee ID",
      value: user.employeeId || "-",
      type: "text",
      icon: <Fingerprint className="w-4 h-4 text-gray-400" />,
    },
  ];
  const fieldsOrg = [
    {
      label: "Company",
      value: user.company?.name || "-",
      type: "text",
      icon: <Building2 className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Department",
      value: user.department?.name || "-",
      type: "text",
      icon: <Building2 className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Role",
      value: user.role?.name || "-",
      type: "text",
      icon: <ShieldCheck className="w-4 h-4 text-gray-400" />,
    },
  ];
  const fieldsAccount = [
    {
      label: "Email Address",
      value: user.email || "-",
      type: "text",
      icon: <Mail className="w-4 h-4 text-gray-400" />,
    },
    {
      label: "Account Type",
      value: user.accountType || "-",
      type: "text",
      icon: <Users className="w-4 h-4 text-gray-400" />,
    },
  ];
  const columns = React.useMemo(
    () =>
      userAssetColumns({
        onDelete: () => {},
        onView: (asset) => router.push(`/assets/view/${asset.id}`),
      }),
    [router],
  );

  // Accessories DataTable columns
  const accessoryColumns = React.useMemo(
    () => [
      {
        accessorKey: "accessory.name",
        header: "Accessory Name",
        cell: ({ row }: { row: any }) =>
          row.original.accessory?.name || "Accessory",
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
      },
      {
        accessorKey: "assignedAt",
        header: "Assigned At",
        cell: ({ row }: { row: any }) =>
          new Date(row.original.assignedAt).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: any }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              /* TODO: View accessory details */
            }}
          >
            View
          </Button>
        ),
      },
    ],
    [],
  );
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const { deactivateUser, isDeactivating, activateUser, isActivating } =
    useUserQuery();
  const { user: currentUser } = useContext(UserContext);
  if (isLoading) return <UserProfileSkeleton />;
  const userStatus = user.active ? "Active" : "Inactive";
  const statusColor = user.active
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
  // Memoized formatted dates
  const [createdAtString, setCreatedAtString] = React.useState("");
  const [updatedAtString, setUpdatedAtString] = React.useState("");
  React.useEffect(() => {
    if ((user as any).createdAt)
      setCreatedAtString(new Date((user as any).createdAt).toLocaleString());
    if ((user as any).updatedAt)
      setUpdatedAtString(new Date((user as any).updatedAt).toLocaleString());
  }, [user]);
  return (
    <section aria-label="User Details" className="bg-white shadow rounded-lg">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2 sm:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/people">People</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/people/view/${user.id}`}>View</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between px-4 py-6 border-b">
        <div className="flex items-center gap-4 w-full">
          <Avatar>
            {(user as any).images ? (
              <AvatarImage
                src={(user as any).images ?? undefined}
                alt={user.name || user.email}
              />
            ) : (
              <AvatarFallback>
                {user.firstName?.[0] ||
                  user.name?.[0] ||
                  user.email?.[0] ||
                  "?"}
                {user.lastName?.[0] || ""}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {`${user.firstName} ${user.lastName}`.trim()}
              {isLonee && (
                <span
                  className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold"
                  title="Assignment-only user"
                >
                  Lonee
                </span>
              )}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-3 py-1 text-xs rounded-full ${statusColor}`}>
                {userStatus}
              </span>
              {user.role?.name && (
                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {user.role.name}
                </span>
              )}
              {user.accountType && (
                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                  {user.accountType}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <CustomButton
            value="Edit"
            disabled={!user.active}
            Icon={Pencil}
            action={() => setEditDrawerOpen(true)}
            className="w-full sm:w-auto"
          />
          <CustomButton
            value="Send Message"
            Icon={Mail}
            action={() => {
              /* TODO: Implement send message */
            }}
            className="w-full sm:w-auto"
          />
          {user.active ? (
            <>
              <CustomButton
                value="Deactivate"
                Icon={Ban}
                action={() => setShowDeactivateDialog(true)}
                className="w-full sm:w-auto border border-red-500 text-red-600 bg-white hover:bg-red-50"
              />
              <ConfirmationDialog
                open={showDeactivateDialog}
                onOpenChange={setShowDeactivateDialog}
                title="Deactivate User"
                description="Are you sure you want to deactivate this user? They will not be able to log in until reactivated."
                confirmText={isDeactivating ? "Deactivating..." : "Deactivate"}
                cancelText="Cancel"
                variant="warning"
                onConfirm={async () => {
                  if (!currentUser?.id || !currentUser?.companyName) {
                    toast.error(
                      "Current user context is missing. Please refresh and try again.",
                    );
                    setShowDeactivateDialog(false);
                    return;
                  }
                  try {
                    await deactivateUser({
                      userId: user.id,
                      actorId: currentUser.id,
                      companyId: currentUser.companyName, // Replace with companyId if available
                    });
                    // Fetch the latest user details (with relations)
                    const freshUser = await findById(user.id);
                    if (freshUser) setUser(freshUser);
                    else setUser({ ...user, active: false });
                  } catch (e: any) {
                    // Error toast handled in hook
                  } finally {
                    setShowDeactivateDialog(false);
                  }
                }}
              />
            </>
          ) : (
            <CustomButton
              value={isActivating ? "Activating..." : "Activate"}
              Icon={CheckCircle}
              action={async () => {
                if (!currentUser?.id || !currentUser?.companyName) {
                  toast.error(
                    "Current user context is missing. Please refresh and try again.",
                  );
                  return;
                }
                try {
                  await activateUser({
                    userId: user.id,
                    actorId: currentUser.id,
                    companyId: currentUser.companyName, // Replace with companyId if available
                  });
                  // Fetch the latest user details (with relations)
                  const freshUser = await findById(user.id);
                  if (freshUser) setUser(freshUser);
                  else setUser({ ...user, active: true });
                } catch (e: any) {
                  // Error toast handled in hook
                }
              }}
              className="w-full sm:w-auto border border-green-500 text-green-600 bg-white hover:bg-green-50"
              disabled={isActivating}
            />
          )}
          {/* Dropdown for less common actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  let auditLogs = (user as any).auditLogs;
                  // If auditLogs are not present, fetch from backend
                  if (!auditLogs) {
                    try {
                      const res = await fetch(
                        `/api/audit-logs?userId=${user.id}`,
                      );
                      if (res.ok) {
                        const data = await res.json();
                        auditLogs = data.auditLogs || [];
                      } else {
                        auditLogs = [];
                      }
                    } catch {
                      auditLogs = [];
                    }
                  }
                  const exportData = { user, auditLogs };
                  const dataStr = JSON.stringify(exportData, null, 2);
                  const blob = new Blob([dataStr], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `user-${user.id}-with-logs.json`;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }, 100);
                }}
              >
                <Download className="h-4 w-4 mr-2" /> Export Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fieldsProfile.map((field, i) => (
                <DetailItem
                  key={i}
                  icon={field.icon}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fieldsOrg.map((field, i) => (
                <DetailItem
                  key={i}
                  icon={field.icon}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fieldsAccount.map((field, i) => (
                <DetailItem
                  key={i}
                  icon={field.icon}
                  label={field.label}
                  value={field.value}
                />
              ))}
            </CardContent>
          </Card>
          <NotesSection
            userId={user.id}
            currentNotes={(user as any).notes}
            onNotesUpdate={(notes, newAuditLog) => {
              setUser((prev) => {
                const prevLogs = (prev as any).auditLogs || [];
                return {
                  ...prev,
                  notes,
                  auditLogs: newAuditLog
                    ? [newAuditLog, ...prevLogs]
                    : prevLogs,
                };
              });
            }}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem
                icon={<Calendar className="h-4 w-4" />}
                label="Created At"
                value={createdAtString}
              />
              <DetailItem
                icon={<RefreshCcw className="h-4 w-4" />}
                label="Last Updated"
                value={updatedAtString}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <React.Suspense fallback={<UserProfileSkeleton />}>
        <Tabs defaultValue="assets" className="w-full mt-6">
          <TabsList className="inline-flex h-auto p-0 bg-transparent gap-1">
            <TabsTrigger
              value="assets"
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Laptop className="h-4 w-4" /> Assets
              <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {user?.assets?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="accessories"
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Monitor className="h-4 w-4" /> Accessories
              <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {user?.userItem?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="licenses"
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Key className="h-4 w-4" /> Licenses
              <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {user?.userItem
                  ? (user.userItem as UserItemWithLicense[]).filter(
                      (item) => item.license,
                    ).length
                  : 0}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <History className="h-4 w-4" /> Activity Log
            </TabsTrigger>
          </TabsList>
          <TabsContent value="assets" className="mt-6">
            <div className="space-y-4">
              {user?.assets && user.assets.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={user.assets}
                  isLoading={isLoading}
                />
              ) : (
                <div className="text-center py-12">
                  <Laptop className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Assets
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This user hasn't been assigned any assets yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Tip:</strong> Assign assets to this user from the
                    asset management page.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="accessories" className="mt-6">
            <div className="space-y-4">
              {user?.userItem && user.userItem.length > 0 ? (
                <DataTable
                  columns={accessoryColumns}
                  data={user.userItem}
                  isLoading={isLoading}
                />
              ) : (
                <div className="text-center py-12">
                  <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Accessories
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This user hasn't been assigned any accessories yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Tip:</strong> Accessory management is coming soon!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="licenses" className="mt-6">
            <div className="space-y-4">
              {user?.userItem &&
              (user.userItem as UserItemWithLicense[]).filter(
                (item) => item.license,
              ).length > 0 ? (
                <DataTable
                  columns={licenseColumns({
                    onDelete: () => {},
                    onView: () => {},
                  })}
                  data={(user.userItem as UserItemWithLicense[])
                    .filter((item) => item.license)
                    .map((item) => item.license!)}
                  isLoading={isLoading}
                />
              ) : (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Licenses
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This user hasn't been assigned any software licenses yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Tip:</strong> License management is coming soon!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            {user?.id ? (
              <ActivityLog
                sourceType="user"
                sourceId={user.id}
                auditLogs={((user as any).auditLogs || [])
                  .slice()
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )}
              />
            ) : (
              <EmptyState type={"history"} />
            )}
          </TabsContent>
        </Tabs>
      </React.Suspense>
      {/* User Edit Side Drawer */}
      {user.id && (
        <EditUserDrawer
          userId={user.id}
          open={editDrawerOpen}
          onClose={async (updatedUser) => {
            setEditDrawerOpen(false);
            if (updatedUser) {
              // Fetch the latest user details (with relations)
              const freshUser = await findById(user.id);
              if (freshUser) setUser(freshUser);
              else setUser(updatedUser); // fallback
            }
          }}
        />
      )}
    </section>
  );
}
