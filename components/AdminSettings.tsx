"use client";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  BadgeCheck,
  Boxes,
  Building2,
  Factory,
  LucideIcon,
  MapPin,
  Tags,
  Warehouse,
  HardDrive,
  Settings,
  Sparkles,
  ChevronRight,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Target,
  Brain,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TableHeader from "@/components/tables/TableHeader";
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
  useStatusLabelUIStore,
} from "@/lib/stores";
import FormTemplateCreator from "@/components/forms/FormTemplateCreator";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";
import { FormTemplate } from "@/types/form";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { ModelWithRelations } from "@/types/model";
import {
  Model,
  StatusLabel,
  Department,
  DepartmentLocation,
  Inventory,
  Manufacturer,
} from "@prisma/client";
import ReportStorageSettings from "@/components/settings/ReportStorageSettings";
import SustainabilityTargets from "@/components/settings/SustainabilityTargets";
import { aiService } from "@/lib/services/ai-multi-provider.service";

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
  | "asset-categories"
  | "sustainability-targets"
  | "report-storage";

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
    description: "Device and equipment models in your inventory",
  },
  {
    id: "manufacturers",
    label: "Manufacturers",
    icon: Factory,
    description: "Companies and brands that produce your assets",
  },
  {
    id: "locations",
    label: "Locations",
    icon: MapPin,
    description: "Physical and virtual locations for asset placement",
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    description: "Organizational units and teams managing assets",
  },
  {
    id: "status-label",
    label: "Status Labels",
    icon: BadgeCheck,
    description: "Asset lifecycle states and condition tracking",
  },
  {
    id: "inventories",
    label: "Inventories",
    icon: Warehouse,
    description: "Stock levels and inventory management zones",
  },
  {
    id: "asset-categories",
    label: "Asset Categories",
    icon: Tags,
    description: "Classification system for asset organization",
  },
  {
    id: "sustainability-targets",
    label: "Sustainability Targets",
    icon: Target,
    description: "Energy efficiency and carbon reduction goals",
  },
  {
    id: "report-storage",
    label: "Report Storage",
    icon: HardDrive,
    description: "Intelligent storage policies and cleanup automation",
  },
];

function handleFilter() {
  console.log("filter");
}

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<TabId>("models");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [llmStatus, setLlmStatus] = useState<{
    available: number;
    total: number;
    providers: string[];
  } | null>(null);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(
    null,
  );
  const [editingModel, setEditingModel] = useState<ModelWithRelations | null>(
    null,
  );
  const [editingManufacturer, setEditingManufacturer] =
    useState<Manufacturer | null>();
  const [editingLocation, setEditingLocation] =
    useState<DepartmentLocation | null>();
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>();
  const [editingStatusLabel, setEditingStatusLabel] =
    useState<StatusLabel | null>();
  const [editingFormTemplate, setEditingFormTemplate] =
    useState<FormTemplate | null>();
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
  } = useStatusLabelUIStore();

  const {
    models,
    isLoading: modelsLoading,
    error: modelsError,
    deleteModel,
  } = useModelsQuery();

  const {
    manufacturers,
    isLoading: manufacturersLoading,
    deleteManufacturer,
    isDeleting,
  } = useManufacturerQuery();
  const {
    locations,
    isLoading: locationsLoading,
    deleteLocation,
  } = useLocationQuery();
  const {
    departments,
    isLoading: departmentsLoading,
    deleteDepartment,
  } = useDepartmentQuery();
  const {
    statusLabels,
    isLoading: labelsLoading,
    deleteStatusLabel,
  } = useStatusLabelsQuery();
  const {
    inventories,
    isLoading: inventoriesLoading,
    deleteInventory,
  } = useInventoryQuery();
  const {
    formTemplates,
    isLoading: formTemplatesLoading,
    deleteFormTemplate,
  } = useFormTemplatesQuery();

  // Load LLM status on component mount
  useEffect(() => {
    try {
      const status = aiService.getProviderStatus();
      const availableProviders = aiService.getAvailableProviders();
      setLlmStatus({
        available: availableProviders.length,
        total: Object.keys(status).length,
        providers: availableProviders,
      });
    } catch (error) {
      console.warn("Failed to check LLM status:", error);
      setLlmStatus({
        available: 0,
        total: 3,
        providers: [],
      });
    }
  }, []);

  const handleDelete = async (id: string) => {
    switch (activeTab) {
      case "models":
        await deleteModel(id);
        break;
      case "manufacturers":
        await deleteManufacturer(id);
        break;
      case "locations":
        await deleteLocation(id);
        break;
      case "departments":
        await deleteDepartment(id);
        break;
      case "status-label":
        await deleteStatusLabel(id);
        break;
      case "inventories":
        await deleteInventory(id);
        break;
      case "asset-categories":
        await deleteFormTemplate(id);
        break;
      case "report-storage":
        // No delete action needed for report storage settings
        break;
      default:
        return null;
    }
  };

  // Move handleDelete inside useCallback to ensure it has access to the current activeTab value
  const onDelete = useCallback(
    async (item: any) => {
      switch (activeTab) {
        case "models":
          await deleteModel(item.id);
          break;
        case "manufacturers":
          await deleteManufacturer(item.id);
          break;
        case "locations":
          await deleteLocation(item.id);
          break;
        case "departments":
          await deleteDepartment(item.id);
          break;
        case "status-label":
          await deleteStatusLabel(item.id);
          break;
        case "inventories":
          await deleteInventory(item.id);
          break;
        case "asset-categories":
          await deleteFormTemplate(item.id);
          break;
        default:
          return null;
      }
    },
    [
      activeTab,
      deleteModel,
      deleteManufacturer,
      deleteLocation,
      deleteDepartment,
      deleteStatusLabel,
      deleteInventory,
      deleteFormTemplate,
    ],
  );
  const MODAL_CONFIGS: ModalConfig[] = [
    {
      id: "models",
      title: editingModel ? "Update Model" : "Add Model",
      description: editingModel ? "Update existing model" : "Add a new model",
      FormComponent: () => (
        <ModelForm
          initialData={editingModel as any}
          onSubmitSuccess={() => {
            closeModel();
            setEditingModel(null);
          }}
        />
      ),
      isOpen: isModelOpen,
      onClose: closeModel,
    },
    {
      id: "manufacturers",
      title: editingManufacturer ? "Update Manufacturer" : "Add Manufacturer",
      description: editingManufacturer
        ? "Update existing manufacturer"
        : "Add a new manufacturer",
      FormComponent: () => (
        <ManufacturerForm
          initialData={editingManufacturer as any}
          onSubmitSuccess={() => {
            closeManufacturer();
            setEditingManufacturer(null);
          }}
        />
      ),
      isOpen: isManufacturerOpen,
      onClose: closeManufacturer,
    },
    {
      id: "locations",
      title: editingLocation ? "Update Location" : "Add Location",
      description: editingLocation
        ? "Update existing location"
        : "Add a new location",
      FormComponent: () => (
        <LocationForm
          initialData={editingLocation || undefined}
          onSubmitSuccess={() => {
            closeLocation();
            setEditingLocation(null);
          }}
        />
      ),
      isOpen: isLocationOpen,
      onClose: closeLocation,
    },
    {
      id: "departments",
      title: editingDepartment ? "Update Department" : "Add Department",
      description: editingDepartment
        ? "Update existing department"
        : "Add a new department",
      FormComponent: () => (
        <DepartmentForm
          initialData={editingDepartment || undefined}
          onSubmitSuccess={() => {
            closeDepartment();
            setEditingDepartment(null);
          }}
        />
      ),
      isOpen: isDepartmentOpen,
      onClose: closeDepartment,
    },
    {
      id: "status-label",
      title: editingStatusLabel ? "Update Status Label" : "Add Status Label",
      description: editingStatusLabel
        ? "Update existing status label"
        : "Add a new status label",
      FormComponent: () => (
        <StatusLabelForm
          initialData={editingStatusLabel || undefined}
          onSubmitSuccess={() => {
            closeStatusLabel();
            setEditingStatusLabel(null);
          }}
        />
      ),
      isOpen: isStatusLabelOpen,
      onClose: closeStatusLabel,
    },
    {
      id: "inventories",
      title: editingInventory ? "Update Inventory" : "Add Inventory",
      description: editingInventory
        ? "Update existing inventory"
        : "Add a new inventory",
      FormComponent: () => (
        <InventoryForm
          initialData={editingInventory || undefined}
          onSubmitSuccess={() => {
            closeInventory();
            setEditingInventory(null);
          }}
        />
      ),
      isOpen: isInventoryOpen,
      onClose: () => {
        closeInventory();
        setEditingInventory(null);
      },
    },
    {
      id: "asset-categories",
      title: editingFormTemplate ? "Update Custom Fields" : "Add Custom Fields",
      description: editingFormTemplate
        ? "Update existing custom fields"
        : "Add a new custom form fields",
      FormComponent: () => (
        <FormTemplateCreator
          initialData={editingFormTemplate || undefined}
          onSubmitSuccess={() => {
            closeFormTemplate();
            setEditingFormTemplate(null);
          }}
        />
      ),
      isOpen: isFormTemplateOpen,
      onClose: closeFormTemplate,
    },
  ];

  const columns = useMemo(
    () => ({
      models: modelColumns({
        onDelete,
        onUpdate: (model: any) => {
          setEditingModel(model);
          onModelOpen();
        },
      }),
      manufacturers: manufacturerColumns({
        onDelete,
        onUpdate: (manufacturer: any) => {
          setEditingManufacturer(manufacturer);
          onManufacturerOpen();
        },
      }),
      locations: locationColumns({
        onDelete,
        onUpdate: (departmentLocation: any) => {
          setEditingLocation(departmentLocation);
          onLocationOpen();
        },
      }),
      departments: departmentColumns({
        onDelete,
        onUpdate: (department: any) => {
          setEditingDepartment(department);
          onDepartmentOpen();
        },
      }),
      "status-label": statusLabelColumns({
        onDelete,
        onUpdate: (statusLabel: any) => {
          setEditingStatusLabel(statusLabel);
          onStatusLabelOpen();
        },
      }),
      inventories: inventoryColumns({
        onDelete,
        onUpdate: (inventory: any) => {
          setEditingInventory(inventory);
          onInventoryOpen();
        },
      }),
      "asset-categories": assetCategoriesColumns({
        onDelete,
        onUpdate: (formTemplate: FormTemplate) => {
          setEditingFormTemplate(formTemplate);
          onFormTemplateOpen();
        },
      }),
    }),
    [
      onDelete,
      onModelOpen,
      onManufacturerOpen,
      onLocationOpen,
      onDepartmentOpen,
      onStatusLabelOpen,
      onInventoryOpen,
      onFormTemplateOpen,
    ],
  );

  const loadingMap = {
    models: modelsLoading,
    manufacturers: manufacturersLoading,
    locations: locationsLoading,
    departments: departmentsLoading,
    "status-label": labelsLoading,
    inventories: inventoriesLoading,
    "asset-categories": formTemplatesLoading,
    "sustainability-targets": false,
    "report-storage": false,
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
      case "report-storage":
        // No modal needed for report storage settings
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
        return <DataTable columns={columns.models} data={models as any} />;
      case "manufacturers":
        return (
          <DataTable
            columns={columns.manufacturers}
            data={manufacturers || []}
          />
        );
      case "locations":
        return (
          <DataTable columns={columns.locations} data={locations as any} />
        );
      case "departments":
        return (
          <DataTable columns={columns.departments} data={departments as any} />
        );
      case "status-label":
        return (
          <DataTable
            columns={columns["status-label"]}
            data={statusLabels as any}
          />
        );
      case "inventories":
        return (
          <DataTable columns={columns.inventories} data={inventories as any} />
        );

      case "asset-categories":
        return (
          <DataTable
            columns={columns["asset-categories"]}
            data={formTemplates || []}
          />
        );

      case "report-storage":
        return <ReportStorageSettings />;

      default:
        return null;
    }
  };

  const activeTabConfig = TABS.find((tab) => tab.id === activeTab);
  const isLoadingData = loadingMap[activeTab];

  const table = useReactTable({
    data: models as any,
    columns: columns.models,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-50/30">
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

      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">System Configuration</h1>
                <p className="text-sm text-gray-600">Manage your application settings and master data</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-medium text-emerald-700">System Healthy</span>
              </div>
              {llmStatus && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border cursor-help ${
                        llmStatus.available > 0 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-amber-50 border-amber-200'
                      }`}>
                        <Brain className={`w-3 h-3 ${
                          llmStatus.available > 0 ? 'text-blue-600' : 'text-amber-600'
                        }`} />
                        <span className={`text-xs font-medium ${
                          llmStatus.available > 0 ? 'text-blue-700' : 'text-amber-700'
                        }`}>
                          AI: {llmStatus.available}/{llmStatus.total}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="font-medium">AI Provider Status</div>
                        <div className="text-sm text-gray-600">
                          {llmStatus.available > 0 
                            ? `${llmStatus.available} of ${llmStatus.total} AI providers are available`
                            : `No AI providers are configured`
                          }
                        </div>
                        {llmStatus.providers.length > 0 && (
                          <div className="text-xs">
                            <div className="font-medium mb-1">Active providers:</div>
                            <div className="space-y-0.5">
                              {llmStatus.providers.map((provider) => (
                                <div key={provider} className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="capitalize">{provider}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {llmStatus.available === 0 && (
                          <div className="text-xs text-amber-600">
                            Configure API keys in .env.local to enable AI features
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-8">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Navigation Sidebar */}
            <div className="xl:w-80 space-y-2">
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden sticky top-6">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-600" />
                    <span className="text-gray-900 font-medium">Configuration Areas</span>
                  </h3>
                </div>
                <div className="p-2">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isActive 
                            ? "bg-white/20" 
                            : "bg-gray-100 group-hover:bg-gray-200"
                        }`}>
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-600"}`} />
                        </div>
                        {!sidebarCollapsed && (
                          <>
                            <div className="flex-1 text-left">
                              <div className={`font-medium text-sm ${isActive ? "text-white" : "text-gray-900"}`}>
                                {tab.label}
                              </div>
                              <div className={`text-xs leading-tight ${
                                isActive ? "text-white/70" : "text-gray-500"
                              }`}>
                                {tab.description}
                              </div>
                            </div>
                            {isActive && (
                              <ChevronRight className="w-4 h-4 text-white/70" />
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                {/* Content Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
                        {activeTabConfig && <activeTabConfig.icon className="w-6 h-6 text-gray-700" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {activeTabConfig?.label}
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {activeTabConfig?.description}
                        </p>
                      </div>
                    </div>
                    {activeTab !== "report-storage" && activeTab !== "sustainability-targets" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCreateNew(activeTab)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add New
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6">
                  {modelsError && (
                    <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        Failed to load data. Please try again later.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isLoadingData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-10 bg-gray-200 rounded-lg w-80 animate-pulse"></div>
                        <div className="flex gap-2">
                          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-200">
                          <div className="flex gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-4">
                              {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : activeTab === "report-storage" ? (
                    <ReportStorageSettings />
                  ) : activeTab === "sustainability-targets" ? (
                    <SustainabilityTargets />
                  ) : (
                    <div className="space-y-6">
                      {/* Enhanced Table Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all text-sm w-64"
                            />
                          </div>
                          <button
                            onClick={handleFilter}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                          >
                            <Filter className="w-4 h-4" />
                            Filter
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleImport}
                            disabled={isLoading}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium border border-gray-200"
                          >
                            Import
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Data Table */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                        {renderDataTable()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
