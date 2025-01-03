import React from "react";
import { Card } from "@/components/ui/card";
import { History, Laptop, Package } from "lucide-react";

const EmptyState = ({ icon: Icon, title, description }: any) => (
  <Card className="p-8">
    <div className="flex flex-col items-center justify-center text-center space-y-3">
      <div className="bg-secondary p-3 rounded-full">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
    </div>
  </Card>
);

export const AssetsPlaceholder = () => (
  <EmptyState
    icon={Laptop}
    title="No Assets Assigned"
    description="This user currently has no assets assigned to them. Assets will appear here once they're checked out to this user."
  />
);

export const ConsumablesPlaceholder = () => (
  <EmptyState
    icon={Package}
    title="No Consumables"
    description="No consumables have been assigned to this user yet. Assigned consumables will be listed here."
  />
);

export const HistoryPlaceholder = () => (
  <EmptyState
    icon={History}
    title="No Activity Yet"
    description="There's no activity history for this user yet. Actions like checkouts and updates will appear here."
  />
);
