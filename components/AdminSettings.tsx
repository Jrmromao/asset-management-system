import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Boxes,
  Building2,
  Factory,
  LucideIcon,
  MapPin,
  Tags,
  Warehouse,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableHeader } from "@/components/tables/TableHeader";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import {
  useDepartmentQuery,
  useInventoryQuery,
  useLocationQuery,
  useManufacturerQuery,
  useModelsQuery,
  useStatusLabelsQuery,
} from "@/hooks/queries";
import {
  assetCategoriesColumns,
  departmentColumns,
  inventoryColumns,
  locationColumns,
  manufacturerColumns,
  modelColumns,
  statusLabelColumns,
} from "@/components/tables";
import {
  DepartmentForm,
  InventoryForm,
  LocationForm,
  ManufacturerForm,
  ModelForm,
  StatusLabelForm,
} from "@/components/forms";
import { DataTable } from "@/components/tables/DataTable/data-table";
import TableSkeleton from "@/components/tables/TableSkeleton";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import {
  useDepartmentUIStore,
  useFormTemplateUIStore,
  useInventoryUIStore,
  useLocationUIStore,
  useManufacturerUIStore,
  useModelUIStore,
} from "@/lib/stores";
import FormTemplateCreator from "@/components/forms/FormTemplateCreator";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
  description: string;
}

type TabId =
  | "models"
  | "manufacturers"
  | "locations"
  | "departments"
  | "status-label"
  | "inventories"
  | "asset-categories";

interface ModalConfig {
  id: TabId;
  title: string;
  description: string;
  FormComponent: React.ComponentType;
  isOpen: boolean;
  onClose: () => void;
}

const TABS: Tab[] = [
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
  {
    id: "asset-categories",
    label: "Asset Categories",
    icon: Tags,
    description: "Manage and configure your asset categories",
  },
];

function handleFilter() {
  console.log("filter");
}

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<TabId>("models");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<TabId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    onClose: closeModel,
    isOpen: isModelOpen,
    onOpen: onModelOpen,
  } = useModelUIStore();
  const {
    onClose: closeInventory,
    isOpen: isInventoryOpen,
    onOpen: onInventoryOpen,
  } = useInventoryUIStore();

  const {
    isOpen: isLocationOpen,
    onClose: closeLocation,
    onOpen: onLocationOpen,
  } = useLocationUIStore();

  const {
    isOpen: isManufacturerOpen,
    onClose: closeManufacturer,
    onOpen: onManufacturerOpen,
  } = useManufacturerUIStore();

  const {
    isOpen: isDepartmentOpen,
    onClose: closeDepartment,
    onOpen: onDepartmentOpen,
  } = useDepartmentUIStore();
  const {
    isOpen: isFormTemplateOpen,
    onClose: closeFormTemplate,
    onOpen: onFormTemplateOpen,
  } = useFormTemplateUIStore();

  const {
    isOpen: isStatusLabelOpen,
    onClose: closeStatusLabel,
    onOpen: onStatusLabelOpen,
  } = useFormTemplateUIStore();

  const MODAL_CONFIGS: ModalConfig[] = [
    {
      id: "models",
      title: "Add Model",
      description: "Add a new model",
      FormComponent: ModelForm,
      isOpen: isModelOpen,
      onClose: closeModel,
    },
    {
      id: "manufacturers",
      title: "Add Manufacturer",
      description: "Add a new manufacturer",
      FormComponent: ManufacturerForm,
      isOpen: isManufacturerOpen,
      onClose: closeManufacturer,
    },
    {
      id: "locations",
      title: "Add Location",
      description: "Add a new location",
      FormComponent: LocationForm,
      isOpen: isLocationOpen,
      onClose: closeLocation,
    },
    {
      id: "departments",
      title: "Add Department",
      description: "Add a new department",
      FormComponent: DepartmentForm,
      isOpen: isDepartmentOpen,
      onClose: closeDepartment,
    },
    {
      id: "status-label",
      title: "Add Status Label",
      description: "Add a new status label",
      FormComponent: StatusLabelForm,
      isOpen: isStatusLabelOpen,
      onClose: closeStatusLabel,
    },
    {
      id: "inventories",
      title: "Add Inventory",
      description: "Add a new inventory",
      FormComponent: InventoryForm,
      isOpen: isInventoryOpen,
      onClose: closeInventory,
    },
    {
      id: "asset-categories",
      title: "Add Custom Fields",
      description: "Add a new custom form fields",
      FormComponent: FormTemplateCreator,
      isOpen: isFormTemplateOpen,
      onClose: closeFormTemplate,
    },
  ];
  const {
    models,
    isLoading: modelsLoading,
    error: modelsError,
  } = useModelsQuery();
  const { manufacturers, isLoading: manufacturersLoading } =
    useManufacturerQuery();
  const { locations, isLoading: locationsLoading } = useLocationQuery();
  const { departments, isLoading: departmentsLoading } = useDepartmentQuery();
  const { statusLabels, isLoading: labelsLoading } = useStatusLabelsQuery();
  const { inventories, isLoading: inventoriesLoading } = useInventoryQuery();
  const { formTemplates, isLoading: formTemplatesLoading } =
    useFormTemplatesQuery();

  const columns = useMemo(
    () => ({
      models: modelColumns({
        onDelete: () => {},
        onUpdate: () => {},
      }),
      manufacturers: manufacturerColumns({
        onDelete: () => {},
        onUpdate: () => {},
      }),
      locations: locationColumns({
        onDelete: () => {},
        onUpdate: () => {},
      }),
      departments: departmentColumns({
        onDelete: () => {},
        onUpdate: () => {},
      }),
      "status-label": statusLabelColumns({
        onDelete: () => {},
        onUpdate: () => {},
      }),
      inventories: inventoryColumns({
        onDelete: () => {},
        onUpdate: () => {},
      }),
      "asset-categories": assetCategoriesColumns({
        onDelete: () => {},
        onUpdate: () => {},
      }),
    }),
    [],
  );

  const loadingMap = {
    models: modelsLoading,
    manufacturers: manufacturersLoading,
    locations: locationsLoading,
    departments: departmentsLoading,
    "status-label": labelsLoading,
    inventories: inventoriesLoading,
    "asset-categories": formTemplatesLoading,
  };

  const handleCreateNew = (activeTab: string) => {
    switch (activeTab) {
      case "models":
        onModelOpen();
        break;
      case "manufacturers":
        onManufacturerOpen();
        break;
      case "locations":
        onLocationOpen();
        break;
      case "departments":
        onDepartmentOpen();
        break;
      case "status-label":
        onStatusLabelOpen();
        break;
      case "inventories":
        onInventoryOpen();
        break;
      case "asset-categories":
        onFormTemplateOpen();
        break;
      default:
        return null;
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Implement search logic
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <DataTable
            columns={columns["status-label"]}
            data={statusLabels || []}
          />
        );
      case "inventories":
        return (
          <DataTable columns={columns.inventories} data={inventories || []} />
        );

      case "asset-categories":
        return (
          <DataTable
            columns={columns["asset-categories"]}
            data={formTemplates || []}
          />
        );

      default:
        return null;
    }
  };

  const activeTabConfig = TABS.find((tab) => tab.id === activeTab);
  const isLoadingData = loadingMap[activeTab];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Modals */}
      {MODAL_CONFIGS.map((config) => {
        const { id, title, description, FormComponent, isOpen, onClose } =
          config;
        return (
          <DialogContainer
            key={id}
            open={isOpen}
            onOpenChange={onClose}
            title={title}
            description={description}
            form={<FormComponent />}
          />
        );
      })}

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
            {TABS.map((tab) => {
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
                      {activeTabConfig?.label}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {activeTabConfig?.description}
                    </p>
                  </div>
                </div>
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
                  <>
                    <TableHeaderSkeleton />
                    <TableSkeleton columns={4} rows={5} />
                  </>
                ) : (
                  <>
                    <TableHeader
                      onSearch={handleSearch}
                      onFilter={handleFilter}
                      onImport={handleImport}
                      onCreateNew={() => handleCreateNew(activeTab)}
                    />
                    {renderDataTable()}
                  </>
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
