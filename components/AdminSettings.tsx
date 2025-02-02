import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Boxes,
  Building2,
  Factory,
  Loader2,
  LucideIcon,
  MapPin,
  Tags,
  Warehouse,
} from "lucide-react";
import { useModelsQuery } from "@/hooks/queries/useModelsQuery";
import { modelColumns } from "@/components/tables/ModelColumns";
import { useManufacturerQuery } from "@/hooks/queries/useManufacturerQuery";
import { useLocationQuery } from "@/hooks/queries/useLocationQuery";
import { useDepartmentQuery } from "@/hooks/queries/useDepartmentQuery";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { useInventoryQuery } from "@/hooks/queries/useInventoryQuery";
import { manufacturerColumns } from "@/components/tables/ManufacturerColumns";
import { locationColumns } from "@/components/tables/LocationColumns";
import { departmentColumns } from "@/components/tables/DepartmentColumns";
import { supplierColumns } from "@/components/tables/SupplierColumns";
import { statusLabelColumns } from "@/components/tables/StatusLabelColumns";
import { inventoryColumns } from "@/components/tables/InventoryColumns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableHeader } from "@/components/tables/TableHeader";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";
import { assetCategoriesColumns } from "@/components/tables/assetCategoriesColumns";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<string>("models");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const {
    models,
    isLoading: modelsLoading,
    error: modelsError,
  } = useModelsQuery();
  const { manufacturers, isLoading: manufacturersLoading } =
    useManufacturerQuery();
  const { locations, isLoading: locationsLoading } = useLocationQuery();
  const { departments, isLoading: departmentsLoading } = useDepartmentQuery();
  const { suppliers, isLoading: suppliersLoading } = useSupplierQuery();
  const { statusLabels, isLoading: labelsLoading } = useStatusLabelsQuery();
  const { inventories, isLoading: inventoriesLoading } = useInventoryQuery();
  const { formTemplates, isLoading: formTemplatesLoading } =
    useFormTemplatesQuery();

  const columns = useMemo(
    () => ({
      models: modelColumns(),
      manufacturers: manufacturerColumns(),
      locations: locationColumns(),
      departments: departmentColumns(),
      suppliers: supplierColumns(),
      statusLabels: statusLabelColumns(),
      inventories: inventoryColumns(),
      assetCategories: assetCategoriesColumns(),
    }),
    [],
  );

  const tabs: Tab[] = [
    {
      id: "models",
      label: "Models",
      icon: Boxes,
      description: "Manage and configure your models",
    },
    {
      id: "manufacturers",
      label: "Manufacturers",
      icon: Factory,
      description: "Manage and configure your manufacturers",
    },
    {
      id: "locations",
      label: "Locations",
      icon: MapPin,
      description: "Manage and configure your locations",
    },
    {
      id: "asset-categories",
      label: "Asset Categories",
      icon: Tags,
      description: "Manage and configure your asset categories",
    },
    {
      id: "departments",
      label: "Departments",
      icon: Building2,
      description: "Manage and configure your departments",
    },
    {
      id: "status-label",
      label: "Status Labels",
      icon: BadgeCheck,
      description: "Manage and configure your status labels",
    },
    {
      id: "inventories",
      label: "Inventories",
      icon: Warehouse,
      description: "Manage and configure your inventories",
    },
  ];

  const renderDataTable = () => {
    switch (activeTab) {
      case "models":
        return <DataTable columns={columns.models} data={models || []} />;
      case "manufacturers":
        return (
          <DataTable
            columns={columns.manufacturers}
            data={manufacturers || []}
          />
        );
      case "locations":
        return <DataTable columns={columns.locations} data={locations || []} />;
      case "departments":
        return (
          <DataTable columns={columns.departments} data={departments || []} />
        );
      case "status-label":
        return (
          <DataTable columns={columns.statusLabels} data={statusLabels || []} />
        );
      case "inventories":
        return (
          <DataTable columns={columns.inventories} data={inventories || []} />
        );

      case "asset-categories":
        return <DataTable columns={columns.assetCategories} data={[]} />;

      default:
        return null;
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Implement search logic here
  };

  const handleFilter = (value: string) => {
    setSelectedFilter(value);
    // Implement filter logic here
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      // Implement import logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveData = () => {
    const dataMap = {
      models,
      manufacturers,
      locations,
      departments,
      suppliers,
      "status-label": statusLabels,
      inventories,
    };
    return dataMap[activeTab as keyof typeof dataMap] || [];
  };

  const isLoadingData = {
    models: modelsLoading,
    manufacturers: manufacturersLoading,
    locations: locationsLoading,
    departments: departmentsLoading,
    suppliers: suppliersLoading,
    "status-label": labelsLoading,
    inventories: inventoriesLoading,
    formTemplates: formTemplatesLoading,
  }[activeTab];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">
            Configure your application settings and manage master data
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-1 bg-white p-3 rounded-lg border border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <span className="block font-medium">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {tabs.find((tab) => tab.id === activeTab)?.label}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {tabs.find((tab) => tab.id === activeTab)?.description}
                    </p>
                  </div>
                </div>

                <TableHeader
                  onSearch={handleSearch}
                  onFilter={() => {}}
                  onImport={handleImport}
                  onCreateNew={() => {}}
                />
              </div>

              <div className="p-6">
                {modelsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      Failed to load data. Please try again later.
                    </AlertDescription>
                  </Alert>
                )}
                {isLoadingData ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  renderDataTable()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
