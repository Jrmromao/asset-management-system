import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ClockIcon } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { assetHistoryColumns } from "@/components/tables/AsetHistoryColumns";

interface ItemDetailsTabsProps {
  itemId: string;
  itemType: "asset";
  assetHistory: AssetHistory[];
  // usedBy?: UserItems[];
  // isCheckingIn: Set<string>;
  // isRefreshing: boolean;
  // handleCheckIn: (id: string) => Promise<void>;
  // onViewUsedBy?: (id: string) => void;
}

const AssetDetailTab: React.FC<ItemDetailsTabsProps> = ({
  itemType,
  assetHistory,
  // usedBy = [],
  // handleCheckIn,
  // isCheckingIn,
}) => {
  const assetHistoryColumnsMeno = useMemo(() => assetHistoryColumns(), []);

  // const usedByAccessoryColumnsMemo = useMemo(
  //   () =>
  //     usedByAccColumns({
  //       onCheckIn: handleCheckIn,
  //       checkingInIds: isCheckingIn,
  //     }),
  //   [handleCheckIn, isCheckingIn],
  // );

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
          </TabsList>
        </div>

        <TabsContent value="history" className="pt-4">
          {assetHistory?.length > 0 ? (
            <div className="rounded-lg border bg-white mr-3 ml-3 mb-6">
              <DataTable
                pageIndex={0}
                pageSize={10}
                total={assetHistory.length}
                onPaginationChange={() => {}}
                columns={assetHistoryColumnsMeno}
                data={assetHistory}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Activity Log</p>
              <p className="text-sm">No activities have been recorded yet.</p>
            </div>
          )}
        </TabsContent>

        {/*<TabsContent value="used-by" className="pt-4">*/}
        {/*  {*/}
        {/*    */}
        {/*    (usedBy?.length | usedBy.length) > 0 ? (*/}
        {/*    <div className="rounded-lg border bg-white mx-3 mb-6">*/}
        {/*      <DataTable columns={usedByAccessoryColumnsMemo} data={usedBy} />*/}
        {/*    </div>*/}
        {/*  ) : (*/}
        {/*  <div className="text-center py-12 text-gray-500">*/}
        {/*    <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />*/}
        {/*    <p className="text-lg font-medium">{`No checkout history for this ${itemType}`}</p>*/}
        {/*    <p className="text-sm">No activity has been recorded yet</p>*/}
        {/*  </div>*/}
        {/*  /!*)}*!/*/}
        {/*</TabsContent>*/}
      </Tabs>
    </div>
  );
};

export default AssetDetailTab;
