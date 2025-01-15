import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ClockIcon, UserIcon } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { auditLogColumns } from "@/components/tables/AuditLogColumns";
import { usedByColumns } from "@/components/tables/usedByColumns";

interface ItemDetailsTabsProps {
  itemId: string;
  itemType: "asset" | "accessory" | "license" | "component";
  auditLogs: AuditLog[];
  usedBy?: UserAccessory[];
  isCheckingIn: Set<string>;
  isRefreshing: boolean;
  handleCheckIn: (id: string) => Promise<void>;
  onViewUsedBy?: (id: string) => void;
  customTabs?: {
    [key: string]: {
      label: string;
      icon?: React.ReactNode;
      content: React.ReactNode;
    };
  };
}

const ItemDetailsTabs: React.FC<ItemDetailsTabsProps> = ({
  itemType,
  auditLogs,
  usedBy = [],
  handleCheckIn,
  customTabs = {},
  isCheckingIn,
}) => {
  const auditLogColumnsMemo = useMemo(() => auditLogColumns(), []);
  const usedByColumnsMemo = useMemo(
    () =>
      usedByColumns({
        onCheckIn: handleCheckIn,
        checkingInIds: isCheckingIn,
      }),
    [handleCheckIn, isCheckingIn],
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

            {itemType !== "asset" && (
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
                {usedBy.length > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {usedBy.length}
                  </span>
                )}
              </TabsTrigger>
            )}

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
              <DataTable columns={auditLogColumnsMemo} data={auditLogs} />
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
          {usedBy?.length > 0 ? (
            <div className="rounded-lg border bg-white mx-3 mb-6">
              <DataTable columns={usedByColumnsMemo} data={usedBy} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">{`No checkout history for this ${itemType}`}</p>
              <p className="text-sm">No activity has been recorded yet</p>
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
