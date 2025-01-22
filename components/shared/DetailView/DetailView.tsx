import React from "react";
import { DetailViewProps } from "./types";
import { DetailField } from "./DetailField";
import { ActionButtons } from "./ActionButtons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Building2,
  Calendar,
  ClipboardCopy,
  Coins,
  Hash,
  Laptop,
  Laptop2,
  Mail,
  MapPin,
  Monitor,
  RefreshCcw,
  Store,
  Tag,
  User,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import CustomFormGrid, {
  FormValue,
} from "@/components/shared/DetailView/CustomFormGrid";
import AvailabilityChecker from "@/components/AvailabilityChecker";
import CarbonScoreTooltip from "@/components/CarbonScoreTooltip";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const fieldIcons = {
  Name: Monitor,
  Location: MapPin,
  "Tag Number": Tag,
  "Last Updated": RefreshCcw,
  Category: Laptop,
  "Assigned To": User,
  "Created At": Calendar,
  Price: Coins,
  "Model Number": Laptop2,
  Department: Building2,
  "Reorder Point": Bell,
  "Alert Email": Mail,
  Quantity: Hash,
  Supplier: Store,
} as const;

export const DetailView: React.FC<DetailViewProps> = ({
  title,
  isAssigned,
  fields,
  actions,
  qrCode,
  breadcrumbs,
  sourceData = "",
  customFormFields,
  checkoutDisabled = false,
}) => {
  const getField = (label: string) => fields.find((f) => f.label === label);
  const tagNumber = getField("Tag Number")?.value;

  return (
    <Card className="h-full mx-2">
      <CardHeader className="space-y-0">
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                {title}
                {tagNumber && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            navigator.clipboard.writeText(String(tagNumber))
                          }
                        >
                          <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Tag Number</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardTitle>
              {tagNumber && (
                <p className="text-sm text-muted-foreground">
                  Tag: {tagNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              {!(getField("Seats") || getField("Units")) && (
                <AvailabilityChecker
                  status={String(getField("Status")?.value)}
                />
              )}
              <CarbonScoreTooltip co2Score={1} />
            </div>
            <div className="flex flex-wrap gap-2">
              {["Seats", "Units"].map(
                (field) =>
                  getField(field)?.value && (
                    <span
                      key={field}
                      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                    >
                      {String(getField(`${field} Allocated`)?.value || 0)} /{" "}
                      {String(getField(field)?.value)} {field}
                    </span>
                  ),
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-5">
            <ScrollArea className="h-full rounded-md border">
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fields
                    .filter((field) => {
                      const allowedFields = [
                        "Name",
                        "Location",
                        "Tag Number",
                        "Last Updated",
                        "Category",
                        "Assigned To",
                        "Created At",
                        "Price",
                        "Model Number",
                        "Department",
                        "Reorder Point",
                        "Alert Email",
                        "Quantity",
                        "Supplier",
                      ];
                      return (
                        allowedFields.includes(field.label) &&
                        !(sourceData === "accessory" && field.label === "Price")
                      );
                    })
                    .map((field, index) => {
                      const IconComponent =
                        fieldIcons[field.label as keyof typeof fieldIcons];
                      return (
                        <DetailField
                          key={index}
                          label={field.label}
                          field={field}
                          icon={
                            IconComponent && (
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                            )
                          }
                        />
                      );
                    })}
                </div>
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-center p-4 lg:border-l">
            {qrCode}
          </div>
        </div>

        {customFormFields && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <CustomFormGrid formValues={customFormFields as FormValue[]} />
            </div>
          </>
        )}
      </CardContent>

      {actions && (
        <CardFooter className="bg-muted/50">
          <div className="w-full flex flex-col sm:flex-row lg:justify-end gap-2">
            <ActionButtons
              actions={actions}
              isAssigned={isAssigned}
              isActive={checkoutDisabled}
            />
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
