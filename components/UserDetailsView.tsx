"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CircleCheck,
  Download,
  Fingerprint,
  History,
  Key,
  Laptop,
  Mail,
  Monitor,
  ShieldCheck,
  Users,
} from "lucide-react";
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

const fieldIcons = {
  "Email Address": Mail,
  "Account Type": Users,
  Department: Building2,
  Role: ShieldCheck, // Shield icon for role/permissions
  Title: BadgeCheck, // Badge icon for job title
  "Employee ID": Fingerprint, // Fingerprint icon for unique ID
  "Account Status": CircleCheck,
} as const;

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

export default function UserDetailsView({
  user,
  isLoading,
}: UserDetailsViewProps) {
  const fields: DetailFieldType[] = [
    { label: "Email Address", value: user.email || "-", type: "text" },
    { label: "Account Type", value: user.accountType || "-", type: "text" },
    { label: "Department", value: user.department?.name || "-", type: "text" },
    { label: "Role", value: user.role?.name || "-", type: "text" },
    { label: "Title", value: user.title || "-", type: "text" },
    { label: "Employee ID", value: user.employeeId || "-", type: "text" },
  ];

  const columns = useMemo(
    () =>
      userAssetColumns({
        onDelete: () => {},
        onView: () => {},
      }),
    [],
  );

  if (isLoading) {
    return <UserProfileSkeleton />;
  }

  // Determine user status based on active field or other status indicators
  const userStatus = user.active ? "Active" : "Inactive";
  const statusColor = user.active 
    ? "bg-green-100 text-green-800" 
    : "bg-red-100 text-red-800";

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
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
      <div className="px-4 py-1 sm:px-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {user.name || `${user.firstName} ${user.lastName}`.trim()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap mb-3">
          {user.accountType && (
            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
              {user.accountType}
            </span>
          )}

          <span className={`px-3 py-1 text-sm rounded-full ${statusColor}`}>
            {userStatus}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <Card className="w-full">
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
            {/* Fields */}
            <div className="lg:col-span-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fields.map((field, index) => {
                  const IconComponent =
                    fieldIcons[field.label as keyof typeof fieldIcons];
                  return (
                    <DetailField
                      key={index}
                      label={field.label}
                      field={field}
                      icon={
                        IconComponent && (
                          <IconComponent className="w-4 h-4 text-gray-400" />
                        )
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>

        {/* Action Buttons */}
        <CardFooter className="bg-white">
          <div className="w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            {user?.assets && user.assets.length > 0 && (
              <Button>
                <Laptop className="h-4 w-4 mr-2" />
                Manage Assets
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="assets" className="w-full mt-6">
        <TabsList className="inline-flex h-auto p-0 bg-transparent gap-1">
          <TabsTrigger
            value="assets"
            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Laptop className="h-4 w-4" />
            Assets
            <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {user?.assets?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="accessories"
            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Monitor className="h-4 w-4" />
            Accessories
            <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {user?.userItem?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="licenses"
            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Key className="h-4 w-4" />
            Licenses
            <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {user?.licenses?.length || 0}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <History className="h-4 w-4" />
            Activity Log
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
              <EmptyState type={"assets"} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="accessories" className="mt-6">
          <div className="space-y-4">
            {user?.userItem && user.userItem.length > 0 ? (
              <div className="space-y-3">
                {user.userItem.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{item.accessory?.name || "Accessory"}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Accessories</h3>
                <p className="text-gray-600 mb-4">This user hasn't been assigned any accessories yet.</p>
                <p className="text-sm text-gray-500">
                  <strong>Coming Soon:</strong> Full accessory management with tracking, requests, and more.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="mt-6">
          <div className="space-y-4">
            {user?.licenses && user.licenses.length > 0 ? (
              <div className="space-y-3">
                {user.licenses.map((license, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{license.name}</p>
                        <p className="text-sm text-gray-600">Seats: {license.seats}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Expires: {new Date(license.renewalDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Licenses</h3>
                <p className="text-gray-600 mb-4">This user hasn't been assigned any software licenses yet.</p>
                <p className="text-sm text-gray-500">
                  <strong>Coming Soon:</strong> Complete license management with renewals, compliance tracking, and cost optimization.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {user?.id ? (
            <ActivityLog sourceType="user" sourceId={user.id} />
          ) : (
            <EmptyState type={"history"} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
