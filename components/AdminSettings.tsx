"use client";
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useContext,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Sparkles,
  ChevronRight,
  Search,
  Target,
  Users,
  ShoppingCart,
  UserCheck,
  Mail,
  UserX,
} from "lucide-react";
import {
  useDepartmentQuery,
  useInventoryQuery,
  useLocationQuery,
  useManufacturerQuery,
  useModelsQuery,
  useStatusLabelsQuery,
} from "@/hooks/queries";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import { User } from "@prisma/client";
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
import {
  useDepartmentUIStore,
  useFormTemplateUIStore,
  useInventoryUIStore,
  useLocationUIStore,
  useManufacturerUIStore,
  useModelUIStore,
  useStatusLabelUIStore,
  useUserUIStore,
  useSupplierUIStore,
} from "@/lib/stores";
import FormTemplateCreator from "@/components/forms/FormTemplateCreator";
import { useFormTemplatesQuery } from "@/hooks/queries/useFormTemplatesQuery";
import { FormTemplate } from "@/types/form";
import { ModelWithRelations } from "@/types/model";
import { aiService } from "@/lib/services/ai-multi-provider.service";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReportStorageSettings from "@/components/settings/ReportStorageSettings";
import SustainabilityTargets from "@/components/settings/SustainabilityTargets";
import { DataTable } from "@/components/tables/DataTable/data-table";
import SettingsHeader from "@/components/settings/SettingsHeader";
import { peopleColumns } from "@/components/tables/PeopleColumns";
import UserForm from "@/components/forms/UserForm";
import UserEditModalForm from "@/components/forms/UserEditModalForm";
import BulkImportDialog from "@/components/forms/BulkImportDialog";
import { loneeUserImportConfig } from "@/config/loneeUserImportConfig";
import { BulkImportConfig } from "@/types/importConfig";
import { UserContext } from "@/components/providers/UserContext";
import { modelImportConfig } from "@/importConfigs/modelImportConfig";
import { locationImportConfig } from "@/importConfigs/locationImportConfig";
import { manufacturerImportConfig } from "@/importConfigs/manufacturerImportConfig";
import { departmentImportConfig } from "@/importConfigs/departmentImportConfig";
import { statusLabelImportConfig } from "@/importConfigs/statusLabelImportConfig";
import { inventoryImportConfig } from "@/importConfigs/inventoryImportConfig";
import { assetCategoryImportConfig } from "@/importConfigs/assetCategoryImportConfig";
import CompanySettings from "@/components/settings/CompanySettings";
import { useSupplierQuery } from "@/hooks/queries/useSupplierQuery";
import { Supplier } from "@prisma/client";
import { supplierColumns } from "@/components/tables/SupplierColumns";
import SupplierForm from "@/components/forms/SupplierForm";
import { toast } from "sonner";

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
  | "report-storage"
  | "company-settings"
  | "suppliers"
  | "people";

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
    id: "asset-categories",
    label: "Asset Categories",
    icon: Tags,
    description: "Classification system for asset organization",
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    description: "Organizational units and teams managing assets",
  },
  {
    id: "inventories",
    label: "Inventories",
    icon: Warehouse,
    description: "Stock levels and inventory management zones",
  },
  {
    id: "suppliers",
    label: "Suppliers",
    icon: ShoppingCart,
    description: "Companies and brands that produce your assets",
  },
  {
    id: "locations",
    label: "Locations",
    icon: MapPin,
    description: "Physical and virtual locations for asset placement",
  },
  {
    id: "manufacturers",
    label: "Manufacturers",
    icon: Factory,
    description: "Companies and brands that produce your assets",
  },
  {
    id: "models",
    label: "Models",
    icon: Boxes,
    description: "Device and equipment models in your inventory",
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    description: "Manage team members, roles, and user permissions",
  },
  {
    id: "status-label",
    label: "Status Labels",
    icon: BadgeCheck,
    description: "Asset lifecycle states and condition tracking",
  },
  // Special tabs at the end
  {
    id: "company-settings",
    label: "Company Settings",
    icon: Building2,
    description: "Manage company-specific settings",
  },
  // {
  //   id: "sustainability-targets",
  //   label: "Sustainability Targets",
  //   icon: Target,
  //   description: "Energy efficiency and carbon reduction goals",
  // },
  {
    id: "report-storage",
    label: "Report Storage",
    icon: HardDrive,
    description: "Intelligent storage policies and cleanup automation",
  },
];

interface AdminSettingsProps {
  activeTab?: string;
}

const AdminSettings = ({ activeTab: initialActiveTab }: AdminSettingsProps) => {
  const { user } = useContext(UserContext);
  const companyId = user?.companyId || "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab') as TabId;
  const validTabs = TABS.map(tab => tab.id);
  const defaultTab: TabId = "asset-categories";
  
  // Validate the tab from URL
  const validatedUrlTab = urlTab && validTabs.includes(urlTab) ? urlTab : null;
  const [activeTab, setActiveTab] = useState<TabId>(validatedUrlTab || (initialActiveTab as TabId) || defaultTab);

  // Handle initial load and URL validation
  useEffect(() => {
    if (!urlTab) {
      // No tab in URL, redirect to default
      router.push(`/settings?tab=${defaultTab}`);
    } else if (!validTabs.includes(urlTab)) {
      // Invalid tab in URL, redirect to default
      router.push(`/settings?tab=${defaultTab}`);
    }
  }, [urlTab, router, validTabs, defaultTab]);

  // Update activeTab when URL changes
  useEffect(() => {
    if (validatedUrlTab && validatedUrlTab !== activeTab) {
      setActiveTab(validatedUrlTab);
    }
  }, [validatedUrlTab, activeTab]);

  // Function to handle tab changes
  const handleTabChange = (tabId: TabId) => {
    if (validTabs.includes(tabId)) {
      setActiveTab(tabId);
      router.push(`/settings?tab=${tabId}`, { scroll: false });
    }
  };

  // Helper function to get tab display name
  const getTabDisplayName = (tabId: TabId) => {
    const tab = TABS.find(t => t.id === tabId);
    return tab ? tab.label : tabId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [configAreasCollapsed, setConfigAreasCollapsed] = useState(false);
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
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
    isOpen: isUserOpen,
    onClose: closeUser,
    onOpen: onUserOpen,
  } = useUserUIStore();

  const {
    isOpen: isSupplierOpen,
    onClose: closeSupplier,
    onOpen: onSupplierOpen,
  } = useSupplierUIStore();

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
    suppliers,
    isLoading: suppliersLoading,
    deleteItem: deleteSupplier,
    createSupplier,
    isCreating: isSupplierCreating,
    refresh: refreshSuppliers,
  } = useSupplierQuery();

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
  const {
    users,
    isLoading: usersLoading,
    deleteItem: deleteUser,
  } = useUserQuery();

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importConfig, setImportConfig] = useState<BulkImportConfig | null>(
    null,
  );

  // Example onImport handler (replace with real API call as needed)
  const handleBulkImport = async (data: any[]) => {
    console.log("Imported data:", data);
    setImportDialogOpen(false);
  };

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
        case "people":
          await deleteUser(item.id);
          break;
        case "suppliers":
          await deleteSupplier(item.id);
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
      deleteUser,
      deleteSupplier,
    ],
  );

  const MODAL_CONFIGS = useMemo(() => [
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
      onClose: () => {
        closeModel();
        setEditingModel(null);
      },
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
      onClose: () => {
        closeManufacturer();
        setEditingManufacturer(null);
      },
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
      onClose: () => {
        closeLocation();
        setEditingLocation(null);
      },
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
      onClose: () => {
        closeDepartment();
        setEditingDepartment(null);
      },
    },
    {
      id: "status-label",
      title: editingStatusLabel ? "Update Status Label" : "Add Status Label",
      description: editingStatusLabel
        ? "Update existing status label"
        : "Add a new status label",
      FormComponent: () => (
        <StatusLabelForm
          initialData={editingStatusLabel as any}
          onSubmitSuccess={() => {
            closeStatusLabel();
            setEditingStatusLabel(null);
          }}
        />
      ),
      isOpen: isStatusLabelOpen,
      onClose: () => {
        closeStatusLabel();
        setEditingStatusLabel(null);
      },
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
      onClose: () => {
        closeFormTemplate();
        setEditingFormTemplate(null);
      },
    },
    {
      id: "people",
      title: editingUser ? "Update User" : "Add User",
      description: editingUser ? "Update existing user" : "Add a new user",
      FormComponent: () => editingUser ? (
        <UserEditModalForm 
          user={editingUser}
          onSubmitSuccess={() => {
            closeUser();
            setEditingUser(null);
          }}
        />
      ) : (
        <UserForm />
      ),
      isOpen: isUserOpen,
      onClose: () => {
        closeUser();
        setEditingUser(null);
      },
    },
    {
      id: "suppliers",
      title: editingSupplier ? "Update Supplier" : "Add Supplier",
      description: editingSupplier ? "Update existing supplier" : "Add a new supplier",
      FormComponent: () => (
        <SupplierForm
          initialData={editingSupplier || undefined}
          onSubmitSuccess={() => {
            closeSupplier();
            setEditingSupplier(null);
            refreshSuppliers();
          }}
        />
      ),
      isOpen: isSupplierOpen,
      onClose: () => {
        closeSupplier();
        setEditingSupplier(null);
      },
    },
  ], [
    editingModel,
    closeModel,
    setEditingModel,
    isModelOpen,
    editingManufacturer,
    closeManufacturer,
    setEditingManufacturer,
    isManufacturerOpen,
    editingLocation,
    closeLocation,
    setEditingLocation,
    isLocationOpen,
    editingDepartment,
    closeDepartment,
    setEditingDepartment,
    isDepartmentOpen,
    editingStatusLabel,
    closeStatusLabel,
    setEditingStatusLabel,
    isStatusLabelOpen,
    editingInventory,
    closeInventory,
    setEditingInventory,
    isInventoryOpen,
    editingFormTemplate,
    closeFormTemplate,
    setEditingFormTemplate,
    isFormTemplateOpen,
    editingUser,
    closeUser,
    setEditingUser,
    isUserOpen,
    editingSupplier,
    closeSupplier,
    setEditingSupplier,
    isSupplierOpen,
    refreshSuppliers,
  ]);

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
      suppliers: supplierColumns({
        onDelete: (supplier: any) => deleteSupplier(supplier.id),
        onUpdate: (supplier: any) => {
          setEditingSupplier(supplier);
          onSupplierOpen();
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
        onDelete: (formTemplate) => deleteFormTemplate(formTemplate.id),
        onUpdate: (formTemplate) => {
          setEditingFormTemplate(formTemplate);
          onFormTemplateOpen();
        },
      }),
      people: peopleColumns({
        onDelete: (user: User) => deleteUser(user.id),
        onUpdate: (user: User) => {
          setEditingUser(user);
          onUserOpen();
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
      deleteSupplier,
      onSupplierOpen,
      deleteFormTemplate,
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
    "company-settings": false,
    people: usersLoading,
    suppliers: suppliersLoading,
  };

  const activeTabConfig = TABS.find((tab) => tab.id === activeTab);
  const isLoadingData = loadingMap[activeTab];

  const renderDataTable = () => {
    if (activeTab === "models") {
      // Filter models by searchQuery (case-insensitive, on name or modelNo)
      const filteredModels = (models || []).filter((model) => {
        const query = searchQuery.toLowerCase();
        return (
          model.name.toLowerCase().includes(query) ||
          (model.modelNo && model.modelNo.toLowerCase().includes(query))
        );
      });
      return (
        <DataTable
          columns={columns.models}
          data={filteredModels}
          isLoading={isLoadingData}
        />
      );
    }
    if (activeTab === "manufacturers") {
      // Filter manufacturers by searchQuery (case-insensitive, on name)
      const filteredManufacturers = (manufacturers || []).filter(
        (manufacturer) => {
          const query = searchQuery.toLowerCase();
          return manufacturer.name.toLowerCase().includes(query);
        },
      );
      return (
        <DataTable
          columns={columns.manufacturers}
          data={filteredManufacturers}
          isLoading={isLoadingData}
        />
      );
    }

    if (activeTab === "locations") {
      // Filter locations by searchQuery (case-insensitive, on name)
      const filteredLocations = (locations || []).filter((location) => {
        const query = searchQuery.toLowerCase();
        return location.name.toLowerCase().includes(query);
      });
      return (
        <DataTable
          columns={columns.locations}
          data={filteredLocations}
          isLoading={isLoadingData}
        />
      );
    }
    if (activeTab === "departments") {
      // Filter departments by searchQuery (case-insensitive, on name)
      const filteredDepartments = (departments || []).filter((department) => {
        const query = searchQuery.toLowerCase();
        return department.name.toLowerCase().includes(query);
      });
      return (
        <DataTable
          columns={columns.departments}
          data={filteredDepartments}
          isLoading={isLoadingData}
        />
      );
    }
    if (activeTab === "status-label") {
      // Filter status labels by searchQuery (case-insensitive, on name)
      const filteredStatusLabels = (statusLabels || []).filter(
        (statusLabel) => {
          const query = searchQuery.toLowerCase();
          return statusLabel.name.toLowerCase().includes(query);
        },
      );
      return (
        <DataTable
          columns={columns["status-label"]}
          data={filteredStatusLabels}
          isLoading={isLoadingData}
        />
      );
    }
    if (activeTab === "inventories") {
      // Filter inventories by searchQuery (case-insensitive, on name)
      const filteredInventories = (inventories || []).filter((inventory) => {
        const query = searchQuery.toLowerCase();
        return inventory.name.toLowerCase().includes(query);
      });
      return (
        <DataTable
          columns={columns.inventories}
          data={filteredInventories}
          isLoading={isLoadingData}
        />
      );
    }
    if (activeTab === "asset-categories") {
      const filteredCategories = (formTemplates || []).filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return (
        <DataTable
          columns={columns["asset-categories"]}
          data={filteredCategories}
          isLoading={formTemplatesLoading}
        />
      );
    }
    if (activeTab === "people") {
      const filteredUsers = (users || []).filter((user: any) => {
        const query = searchQuery.toLowerCase();
        return (
          (user.name && user.name.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.employeeId && user.employeeId.toLowerCase().includes(query)) ||
          (user.title && user.title.toLowerCase().includes(query)) ||
          (user.role?.name && user.role.name.toLowerCase().includes(query)) ||
          (user.department?.name && user.department.name.toLowerCase().includes(query))
        );
      });

      return (
        <div className="overflow-x-auto">
          <DataTable
            columns={columns.people}
            data={filteredUsers as any}
            isLoading={isLoadingData}
          />
        </div>
      );
    }
    if (activeTab === "suppliers") {
      const filteredSuppliers = (suppliers || []).filter((supplier) => {
        const query = searchQuery.toLowerCase();
        return supplier.name.toLowerCase().includes(query);
      });
      return (
        <DataTable
          columns={columns.suppliers}
          data={filteredSuppliers}
          isLoading={suppliersLoading}
        />
      );
    }
    if (activeTab === "company-settings") {
      return <CompanySettings />;
    }
    return null;
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // Example user permissions (replace with real logic)
  const userPermissions: Record<string, boolean> = {
    canManageModels: true,
    canManageManufacturers: true,
    canManageLocations: true,
    canManageDepartments: true,
    canManageStatusLabels: true,
    canManageInventories: true,
    canManageAssetCategories: true,
    canManageUsers: true,
    canManageSuppliers: true,
  };

  // Tab metadata for dynamic UI
  const TAB_META: Record<
    string,
    {
      addNewLabel: string;
      importTemplateUrl: string;
      onAddNew: () => void;
      onImport: () => void;
      permission: keyof typeof userPermissions;
    }
  > = {
    models: {
      addNewLabel: "Add New Model",
      importTemplateUrl: "/models-template.csv",
      onAddNew: onModelOpen,
      onImport: () => {
        setImportConfig({ ...modelImportConfig, companyId: companyId || "" });
        setImportDialogOpen(true);
      },
      permission: "canManageModels",
    },
    manufacturers: {
      addNewLabel: "Add New Manufacturer",
      importTemplateUrl: "/manufacturers-template.csv",
      onAddNew: onManufacturerOpen,
      onImport: () => {
        setImportConfig({
          ...manufacturerImportConfig,
          companyId: companyId || "",
        });
        setImportDialogOpen(true);
      },
      permission: "canManageManufacturers",
    },
    locations: {
      addNewLabel: "Add New Location",
      importTemplateUrl: "/locations-template.csv",
      onAddNew: onLocationOpen,
      onImport: () => {
        setImportConfig({
          ...locationImportConfig,
          companyId: companyId || "",
        });
        setImportDialogOpen(true);
      },
      permission: "canManageLocations",
    },
    departments: {
      addNewLabel: "Add New Department",
      importTemplateUrl: "/departments-template.csv",
      onAddNew: onDepartmentOpen,
      onImport: () => {
        setImportConfig({
          ...departmentImportConfig,
          companyId: companyId || "",
        });
        setImportDialogOpen(true);
      },
      permission: "canManageDepartments",
    },
    "status-label": {
      addNewLabel: "Add New Status Label",
      importTemplateUrl: "/status-labels-template.csv",
      onAddNew: onStatusLabelOpen,
      onImport: () => {
        setImportConfig({
          ...statusLabelImportConfig,
          companyId: companyId || "",
        });
        setImportDialogOpen(true);
      },
      permission: "canManageStatusLabels",
    },
    inventories: {
      addNewLabel: "Add New Inventory",
      importTemplateUrl: "/inventories-template.csv",
      onAddNew: onInventoryOpen,
      onImport: () => {
        setImportConfig({
          ...inventoryImportConfig,
          companyId: companyId || "",
        });
        setImportDialogOpen(true);
      },
      permission: "canManageInventories",
    },
    "asset-categories": {
      addNewLabel: "Add New Asset Category",
      importTemplateUrl: "/asset-categories-template.csv",
      onAddNew: onFormTemplateOpen,
      onImport: () => {
        setImportConfig({ ...assetCategoryImportConfig, companyId });
        setImportDialogOpen(true);
      },
      permission: "canManageAssetCategories",
    },
    people: {
      addNewLabel: "Add New User",
      importTemplateUrl: "/users-template.csv",
      onAddNew: () => {
        setEditingUser(null);
        onUserOpen();
      },
      onImport: () => {
        setImportConfig({
          ...loneeUserImportConfig,
          companyId: companyId || "",
        });
        setImportDialogOpen(true);
      },
      permission: "canManageUsers",
    },
    suppliers: {
      addNewLabel: "Add New Supplier",
      importTemplateUrl: "/suppliers-template.csv",
      onAddNew: onSupplierOpen,
      onImport: () => {
        setImportConfig({
          ...loneeUserImportConfig, // Assuming a similar import config for suppliers
          companyId: companyId || "",
        });
        setImportDialogOpen(true);
      },
      permission: "canManageSuppliers",
    },
  };

  // Helper type guard for supported tabs
  const isMetaTab = (tab: string): tab is keyof typeof TAB_META =>
    Object.prototype.hasOwnProperty.call(TAB_META, tab);

  useEffect(() => {
    if (importConfig) {
      console.log("AdminSettings: importConfig", importConfig);
    }
  }, [importConfig]);

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Modals */}
      {MODAL_CONFIGS.map((config) => {
        if (!config.isOpen) return null;
        const { id, title, description, FormComponent, isOpen, onClose } =
          config;
        return (
          <DialogContainer
            key={id}
            open={isOpen}
            onOpenChange={onClose}
            title={title}
            description={description}
            body={<FormComponent />}
            form={null}
          />
        );
      })}

      {/* Bulk Import Dialog */}
      {importConfig && (
        <BulkImportDialog
          isOpen={importDialogOpen}
          onClose={() => {
            setImportDialogOpen(false);
            setImportConfig(null);
          }}
          config={importConfig}
          onImport={handleBulkImport}
          importType={
            importConfig.entityType as
              | "user"
              | "asset"
              | "accessory"
              | "license"
              | "loneeUser"
              | "department"
              | "location"
              | "manufacturer"
              | "model"
              | "inventory"
              | "statusLabel"
              | "assetCategory"
              | "supplier"
          }
        />
      )}

      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="px-6 py-8">
          {/* SettingsHeader replaces old header/buttons, only for supported tabs */}
          {isMetaTab(activeTab) && (
            <SettingsHeader
              title={activeTabConfig?.label || ""}
              addNewLabel={TAB_META[activeTab].addNewLabel}
              onAddNew={TAB_META[activeTab].onAddNew}
              onImport={TAB_META[activeTab].onImport}
              importTemplateUrl={TAB_META[activeTab].importTemplateUrl}
              showAddNew={userPermissions[TAB_META[activeTab].permission]}
              showImport={
                activeTab !== "asset-categories" &&
                userPermissions[TAB_META[activeTab].permission]
              }
              isLoading={isLoadingData}
            />
          )}
        </div>

        <div className="px-6 pb-8">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Navigation Sidebar */}
            <div className="xl:w-80 space-y-2">
              <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden sticky top-6">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-600" />
                    <span className="text-gray-900 font-medium">
                      Configuration Areas
                    </span>
                  </h3>
                </div>
                <div className="p-2">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-white/20"
                              : "bg-gray-100 group-hover:bg-gray-200"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-600"}`}
                          />
                        </div>
                        {!sidebarCollapsed && (
                          <>
                            <div className="flex-1 text-left">
                              <div
                                className={`font-medium text-sm ${isActive ? "text-white" : "text-gray-900"}`}
                              >
                                {tab.label}
                              </div>
                              <div
                                className={`text-xs leading-tight ${
                                  isActive ? "text-white/70" : "text-gray-500"
                                }`}
                              >
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
                        {activeTabConfig && (
                          <activeTabConfig.icon className="w-6 h-6 text-gray-700" />
                        )}
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
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6">
                  {modelsError && (
                    <Alert
                      variant="destructive"
                      className="mb-6 border-red-200 bg-red-50"
                    >
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
                              <div
                                key={i}
                                className="h-4 bg-gray-200 rounded w-20 animate-pulse"
                              ></div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-4">
                              {Array.from({ length: 4 }).map((_, j) => (
                                <div
                                  key={j}
                                  className="h-4 bg-gray-200 rounded flex-1 animate-pulse"
                                ></div>
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
                        <div className="flex items-center gap-4">
                          {activeTab !== "company-settings" && (
                            <div className="relative">
                              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                              <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm w-80 bg-white shadow-sm"
                              />
                            </div>
                          )}
                          {/* <button
                            onClick={handleFilter}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                          >
                            <Filter className="w-4 h-4" />
                            Filter
                          </button> */}
                        </div>
                      </div>

                      {/* Enhanced Data Table */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
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
