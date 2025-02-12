import { CircleDot, Fuel, Hash } from "lucide-react";

export interface FormValue {
  vin?: string;
  fuel?: string;

  [key: string]: string | undefined;
}

const fieldIcons: Record<string, React.ComponentType<any>> = {
  vin: Hash,
  fuel: Fuel,
};

interface CustomFormGridProps {
  formValues?: FormValue[] | null;
  title?: string;
}

const CustomFormGrid = ({
  formValues,
  title = "Custom Form Fields",
}: CustomFormGridProps) => {
  if (!Array.isArray(formValues) || formValues.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 px-4">{title}</h2>
        <div className="px-4 text-sm text-gray-500">
          {formValues.length} {formValues.length === 1 ? "entry" : "entries"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
        {formValues.map((formValue, index) => {
          if (!formValue || typeof formValue !== "object") {
            return null;
          }

          return Object.entries(formValue)
            .filter(([key, value]) => {
              return (
                key && value !== null && value !== undefined && value !== ""
              );
            })
            .map(([key, value]) => {
              if (!key) return null;

              const IconComponent = fieldIcons[key.toLowerCase()] || CircleDot;
              const displayValue = value ?? "—"; // Using em dash for empty values
              const displayKey = key.charAt(0).toUpperCase() + key.slice(1);

              return (
                <div
                  key={`${index}-${key}`}
                  className="group relative flex items-start gap-4 rounded-xl bg-white p-6
                           shadow-sm ring-1 ring-gray-200 transition-all duration-200
                           hover:shadow-md hover:ring-gray-300"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg
                                bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200"
                    >
                      <IconComponent
                        className="h-5 w-5 text-gray-600 group-hover:text-gray-700"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {displayKey}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 break-words">
                      {displayValue}
                    </p>
                  </div>
                </div>
              );
            })
            .filter(Boolean);
        })}
      </div>
    </div>
  );
};

export default CustomFormGrid;
