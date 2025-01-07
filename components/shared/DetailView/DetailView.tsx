import React from "react";
import { DetailViewProps } from "./types";
import { DetailField } from "./DetailField";
import { ActionButtons } from "./ActionButtons";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Bell,
  Building2,
  Calendar,
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
import CustomFormGrid, {
  FormValue,
} from "@/components/shared/DetailView/CustomFormGrid";
import AvailabilityChecker from "@/components/AvailabilityChecker";
import CarbonScoreTooltip from "@/components/CarbonScoreTooltip";

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

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        {breadcrumbs}
      </div>
      <div className="px-4 py-1 sm:px-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {getField("Tag Number") && (
            <p className="text-sm text-gray-500 mt-1">
              {getField("Tag Number")?.value}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap mb-3">
          {!(getField("Seats") || getField("Units")) && (
            <AvailabilityChecker status={String(getField("Status")?.value)} />
          )}

          {["Seats", "Units"].map(
            (field) =>
              getField(field)?.value && (
                <span
                  key={field}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                >
                  {String(getField(`${field} Allocated`)?.value || 0)} /{" "}
                  {String(getField(field)?.value)} {field} Available
                </span>
              ),
          )}
          <CarbonScoreTooltip co2Score={1} />
        </div>
      </div>

      <Card className="w-full">
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
            {/* Fields */}
            <div className="lg:col-span-5 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fields
                  .filter((field) => {
                    // Define allowed fields
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

                    // Check if the field is allowed and skip "Price" for accessories
                    return (
                      allowedFields.includes(field.label) &&
                      !(sourceData === "accessory" && field.label === "Price")
                    );
                  })
                  .map((field, index) => {
                    // Dynamically get the corresponding icon component
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

            {/* QR Code */}
            <div className="p-4 flex items-center justify-center">{qrCode}</div>
          </div>
          <CustomFormGrid formValues={customFormFields as FormValue[]} />
        </CardContent>
        {/* Action Buttons */}
        <CardFooter className="bg-white">
          <div className="w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
            {actions && (
              <ActionButtons
                actions={actions}
                isAssigned={isAssigned}
                isActive={checkoutDisabled}
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
