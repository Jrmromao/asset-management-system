"use client";
import React, { useState } from "react";
import AdminSettings from "@/components/AdminSettings";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import HeaderBox from "@/components/HeaderBox";
import { Settings } from "lucide-react";

const SettingsPage = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/settings">Settings</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      {/*/!* Header Section *!/*/}
      <HeaderBox
        title="Settings"
        subtext="Configure your application settings and manage master data"
        icon={<Settings className="w-4 h-4" />}
      />

      <AdminSettings />
    </div>
  );
};

export default SettingsPage;
