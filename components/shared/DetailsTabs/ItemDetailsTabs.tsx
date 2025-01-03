import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BoxIcon,
  ClockIcon,
  CpuIcon,
  KeyIcon,
  PackageIcon,
  UserIcon,
} from "lucide-react";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { auditLogColumns } from "@/components/tables/AuditLogColumns";
import { cn } from "@/lib/utils";
import { itemUseByColumns } from "@/components/tables/itemUseByColumns";

// Types for different relationships
type RelationshipType =
  | "assigned_to"
  | "assigned_to_asset"
  | "checked_out_to"
  | "licensed_to";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

interface Relationship {
  id: string;
  name: string;
  type: string;
  relationshipType: RelationshipType;
  date: string;
  notes?: string;
  status?: string;
}

interface ItemDetailsTabsProps {
  itemId: string;
  itemType: "asset" | "accessory" | "license" | "component";
  relationships?: Relationship[];
  attachments?: Attachment[];
  auditLogs?: AuditLog[];
  usedBy?: UserAccessory[];
  customTabs?: {
    [key: string]: {
      label: string;
      icon?: React.ReactNode;
      content: React.ReactNode;
    };
  };
}

const ItemDetailsTabs = ({
  itemId,
  itemType,
  relationships = [],
  attachments = [],
  customTabs = {},
  auditLogs = [],
  usedBy = [],
}: ItemDetailsTabsProps) => {
  // Helper function to get the appropriate icon based on item type
  const getItemTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "asset":
        return <BoxIcon className="h-4 w-4" />;
      case "license":
        return <KeyIcon className="h-4 w-4" />;
      case "component":
        return <CpuIcon className="h-4 w-4" />;
      case "accessory":
        return <PackageIcon className="h-4 w-4" />;
      default:
        return <BoxIcon className="h-4 w-4" />;
    }
  };

  // Helper function to format relationship type for display
  const formatRelationshipType = (type: RelationshipType): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const columns = useMemo(
    () =>
      auditLogColumns({
        onView: () => {},
      }),
    [],
  );
  const usedByColumns = useMemo(
    () =>
      itemUseByColumns({
        onView: () => {},
      }),
    [],
  );
  return (
    <div className="w-full">
      <Tabs defaultValue="history" className="w-full space-y-6">
        <div className="border-b">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger
              value="history"
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                "hover:text-blue-600 transition-colors",
              )}
            >
              <ClockIcon className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="used-by"
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                "hover:text-blue-600 transition-colors",
              )}
            >
              <UserIcon className="h-4 w-4" />
              <span>Used By</span>
              {relationships.length > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {relationships.length}
                </span>
              )}
            </TabsTrigger>
            {Object.entries(customTabs).map(([key, tab]) => (
              <TabsTrigger
                key={key}
                value={key}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                  "hover:text-blue-600 transition-colors",
                )}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="history" className="pt-4">
          {auditLogs?.length > 0 ? (
            <div className="rounded-lg border bg-white mr-3 ml-3 mb-6">
              <DataTable columns={columns} data={auditLogs} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Activity Log</p>
              <p className="text-sm">No activities have been recorded yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="used-by" className="pt-4">
          {usedBy.length > 0 ? (
            <div className="rounded-lg border bg-white mr-3 ml-3 mb-6">
              <DataTable columns={usedByColumns} data={usedBy} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Assignments</p>
              <p className="text-sm">
                This item hasn&apos;t been assigned to anyone yet.
              </p>
            </div>
          )}
        </TabsContent>
        {Object.entries(customTabs).map(([key, tab]) => (
          <TabsContent key={key} value={key} className="pt-4">
            <div className="rounded-lg border bg-white p-6">{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ItemDetailsTabs;
