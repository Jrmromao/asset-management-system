import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ClockIcon, UserIcon } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable/data-table";

interface ItemDetailsTabsProps {
  itemId: string;
  itemType: "asset" | "accessory" | "license" | "component";
  auditLogs: AuditLog[];
  usedBy?: UserAccessory[];
  onViewAuditLog: (id: string) => void;
  onViewUsedBy?: (id: string) => void;
  customTabs?: {
    [key: string]: {
      label: string;
      icon?: React.ReactNode;
      content: React.ReactNode;
    };
  };
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper to get action badge style
const getActionStyle = (action: string) => {
  const actionLower = action.toLowerCase();

  if (actionLower.includes("created")) {
    return "bg-green-100 text-green-800";
  }
  if (actionLower.includes("checkin")) {
    return "bg-blue-100 text-blue-800";
  }
  if (actionLower.includes("checkout")) {
    return "bg-purple-100 text-purple-800";
  }
  if (actionLower.includes("updated")) {
    return "bg-yellow-100 text-yellow-800";
  }
  if (actionLower.includes("deleted")) {
    return "bg-red-100 text-red-800";
  }
  return "bg-gray-100 text-gray-800";
};

const auditLogColumns = ({ onView }: { onView: (id: string) => void }) => [
  {
    accessorKey: "date",
    header: () => <div className="font-semibold">Date</div>,
  },
  {
    accessorKey: "action",
    header: () => <div className="font-semibold">Action</div>,
    cell: ({ row }: any) => {
      const action = row.getValue("action") as string;
      return (
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold inline-block",
            getActionStyle(action),
          )}
        >
          {action}
        </div>
      );
    },
  },
  {
    accessorKey: "details",
    header: () => <div className="font-semibold">Details</div>,
  },
];

const ItemDetailsTabs: React.FC<ItemDetailsTabsProps> = ({
  itemType,
  auditLogs,
  onViewAuditLog,
  usedBy = [],
  onViewUsedBy = () => {},
  customTabs = {},
}) => {
  const transformedAuditLogs = useMemo(
    () =>
      auditLogs?.map((log) => ({
        id: log.id,
        action: log.action,
        date: formatDate(log.createdAt.toString()),
        user: log.userId,
        details: log.details,
      })),
    [auditLogs],
  );

  const columns = useMemo(
    () => auditLogColumns({ onView: onViewAuditLog }),
    [onViewAuditLog],
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
          {transformedAuditLogs?.length > 0 ? (
            <div className="rounded-lg border bg-white mr-3 ml-3 mb-6">
              <DataTable columns={columns} data={transformedAuditLogs} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Activity Log</p>
              <p className="text-sm">No activities have been recorded yet.</p>
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
