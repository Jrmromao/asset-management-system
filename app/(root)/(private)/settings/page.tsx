"use client";
import React from "react";
import AdminSettings from "@/components/AdminSettings";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Settings } from "lucide-react";

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

const SettingsPage = ({ searchParams }: SettingsPageProps): JSX.Element => {
  const resolvedSearchParams = React.use(searchParams);
  const activeTab = resolvedSearchParams.tab || "asset-categories";

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
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/settings?tab=${activeTab}`}>
                {activeTab === "asset-categories"
                  ? "Asset Categories"
                  : activeTab === "status-label"
                    ? "Status Labels"
                    : activeTab === "company-settings"
                      ? "Company Settings"
                      : activeTab === "report-storage"
                        ? "Report Storage"
                        : activeTab
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AdminSettings activeTab={activeTab} />
    </div>
  );
};

export default SettingsPage;
