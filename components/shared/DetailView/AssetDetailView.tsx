"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardCopy,
  Calendar,
  Monitor,
  Tag,
  RefreshCcw,
  Laptop,
  User,
  MapPin,
  Building2,
  Coins,
} from "lucide-react";
import QRCode from "react-qr-code";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EnhancedAssetType } from "@/types/asset";
import { DetailField } from "./DetailField";
import { ActionButtons } from "./ActionButtons";

interface AssetDetailViewProps {
  asset: EnhancedAssetType;
  actions: {
    onAssign?: () => void;
    onUnassign?: () => void;
    onSetMaintenance?: () => void;
    menu?: {
      label: string;
      onClick: () => void;
      icon?: React.ReactNode;
      isDestructive?: boolean;
    }[];
    main?: React.ReactNode;
  };
  breadcrumbs?: React.ReactNode;
}

const fieldIcons = {
  Name: Monitor,
  Location: MapPin,
  "Tag Number": Tag,
  "Last Updated": RefreshCcw,
  Category: Laptop,
  "Assigned To": User,
  "Created At": Calendar,
  Price: Coins,
  Department: Building2,
};

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
  actions,
  breadcrumbs,
}) => {
  const fields = [
    { label: "Name", value: asset.name },
    { label: "Category", value: asset.category?.name },
    { label: "Location", value: asset.location?.name },
    { label: "Model Number", value: asset.model?.name },
    { label: "Price", value: asset.price, format: "currency" },
    { label: "Created At", value: asset.createdAt, format: "date" },
    { label: "Last Updated", value: asset.updatedAt, format: "date" },
    { label: "Assigned To", value: asset.assignee?.name },
  ].filter((field) => field.value != null);

  return (
    <Card className="h-full mx-2">
      <CardHeader>
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl font-semibold">
                {asset.name}
              </CardTitle>
              {asset.statusLabel && (
                <Badge
                  style={{
                    backgroundColor: asset.statusLabel.colorCode,
                  }}
                  className="text-white"
                >
                  {asset.statusLabel.name}
                </Badge>
              )}
            </div>
            {asset.serialNumber && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Tag: {asset.serialNumber}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            String(asset.serialNumber),
                          )
                        }
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy Tag Number</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <ActionButtons
              actions={actions}
              isAssigned={!!asset.assignee}
              isActive={
                !["maintenance", "archived"].includes(
                  asset.status.toLowerCase(),
                )
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border rounded-md p-4">
            {fields.map((field, index) => {
              const IconComponent =
                fieldIcons[field.label as keyof typeof fieldIcons];
              return (
                <DetailField
                  key={index}
                  label={field.label}
                  value={field.value}
                  format={field.format}
                  icon={
                    IconComponent && (
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                    )
                  }
                />
              );
            })}
          </div>
          <div className="flex items-center justify-center p-4 lg:border-l">
            <QRCode value={window.location.href} size={128} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
