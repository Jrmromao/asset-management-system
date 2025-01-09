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
}

const CustomFormGrid = ({ formValues }: CustomFormGridProps) => {
  if (!Array.isArray(formValues) || formValues.length === 0) {
    return null;
  }

  return (
    <div className="lg:col-span-5">
      <div className="text-sm font-medium text-gray-500 px-4 mb-4">
        Custom Form Fields
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {formValues.map((formValue, index) => {
          // Ensure formValue is an object
          if (!formValue || typeof formValue !== "object") {
            return null;
          }

          return Object.entries(formValue)
            .map(([key, value], colIndex) => {
              // Skip if key or value is invalid
              if (!key) return null;

              const IconComponent = fieldIcons[key.toLowerCase()] || CircleDot;
              const displayValue = value ?? "-";
              const displayKey = key.charAt(0).toUpperCase() + key.slice(1);

              return (
                <div
                  key={`${index}-${key}`}
                  className="flex items-center gap-3 px-4"
                  style={{
                    gridColumn: `${colIndex + 1} / span 1`,
                  }}
                >
                  <div className="flex-shrink-0 w-4">
                    <IconComponent
                      className="w-4 h-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                      {displayKey}
                    </p>
                    <p className="mt-1 text-sm text-gray-900 truncate">
                      {displayValue}
                    </p>
                  </div>
                </div>
              );
            })
            .filter(Boolean); // Remove any null elements
        })}
      </div>
    </div>
  );
};

export default CustomFormGrid;
