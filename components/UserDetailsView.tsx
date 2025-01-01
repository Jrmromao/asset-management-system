"use client";

import React from "react";
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
  user: User;
}

export default function UserDetailsView({ user }: UserDetailsViewProps) {
  const fields: DetailFieldType[] = [
    { label: "Email Address", value: user.email, type: "text" },
    { label: "Account Type", value: user.accountType || "-", type: "text" },
    { label: "Department", value: user.department?.name || "-", type: "text" },
    { label: "Role", value: user.role?.name || "-", type: "text" },
    { label: "Title", value: user.title || "-", type: "text" },
    // { label: 'Account Status', value: user.active ? 'Active' : 'Inactive', type: 'text' },
    { label: "Employee ID", value: user.employeeId || "-", type: "text" },
  ];

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
                <Link href={`/users/${user.id}`}>View</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="px-4 py-1 sm:px-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap mb-3">
          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
            {user.accountType}
          </span>

          <span
            className={`px-3 py-1 text-sm rounded-full ${
              user.active
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {user.active ? "Active" : "Inactive"}
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
              Export
            </Button>
            <Button>Check-in All</Button>
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
              {user?.assets?.length || ""}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="accessories"
            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Monitor className="h-4 w-4" />
            Accessories
            <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {user?.accessories?.length || ""}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="licenses"
            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Key className="h-4 w-4" />
            Licenses
            <span className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
              {user?.licenses?.length || ""}
            </span>
          </TabsTrigger>
          {/*<TabsTrigger*/}
          {/*    value="consumables"*/}
          {/*    className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"*/}
          {/*>*/}
          {/*    <Package className="h-4 w-4"/>*/}
          {/*    Consumables*/}
          {/*    <span*/}
          {/*        className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">*/}
          {/*        {user?.licenses?.length || ''}*/}
          {/*    </span>*/}
          {/*</TabsTrigger>*/}
          <TabsTrigger
            value="history"
            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger
            value="booking-history"
            className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <CalendarDays className="h-4 w-4" />
            Booking History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-6">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              {JSON.stringify(user?.assets, null, 2)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="accessories" className="mt-6">
          <div className="space-y-4">
            <div className="text-muted-foreground">
              {JSON.stringify(user?.accessories, null, 2)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="mt-6">
          <div className="space-y-4">
            <div className="text-muted-foreground">No licenses assigned</div>
          </div>
        </TabsContent>

        {/*<TabsContent value="consumables" className="mt-6">*/}
        {/*    <div className="space-y-4">*/}
        {/*        <div className="text-muted-foreground">No consumables assigned</div>*/}
        {/*    </div>*/}
        {/*</TabsContent>*/}

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            <ActivityLog sourceType="user" sourceId={user?.id!} />
          </div>
        </TabsContent>

        <TabsContent value="booking-history" className="mt-6">
          <div className="space-y-4">
            <div className="text-muted-foreground">No booking history</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
