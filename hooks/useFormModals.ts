// hooks/useFormModals.ts
import { useMemo } from "react";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useModelStore } from "@/lib/stores/modelStore";
import { ModalConfig } from "@/types/modals";
import ModelForm from "@/components/forms/ModelForm";
import StatusLabelForm from "@/components/forms/StatusLabelForm";
import LocationForm from "@/components/forms/LocationForm";
import { useLocationStore } from "@/lib/stores/locationStore";
import { useDepartmentStore } from "@/lib/stores/departmentStore";
import { useInventoryStore } from "@/lib/stores/inventoryStore";
import { useSupplierStore } from "@/lib/stores/SupplierStore";
import { useCategoryStore } from "@/lib/stores/categoryStore";
import { useManufacturerStore } from "@/lib/stores/manufacturerStore";
import { useFormTemplateStore } from "@/lib/stores/formTemplateStore";
import DepartmentForm from "@/components/forms/DepartmentForm";
import SupplierForm from "@/components/forms/SupplierForm";
import InventoryForm from "@/components/forms/InventoryForm";
import CategoryForm from "@/components/forms/CategoryForm";
import ManufacturerForm from "@/components/forms/ManufacturerForm";
import FormTemplateCreator from "@/components/forms/FormTemplateCreator";

export function useFormModals(form: any) {
  const {
    statusLabels,
    getAll: fetchStatusLabels,
    isOpen: isStatusOpen,
    onOpen: openStatus,
    onClose: closeStatus,
  } = useStatusLabelUIStore();

  const {
    models,
    fetchModels,
    isOpen: isModelOpen,
    onOpen: openModel,
    onClose: closeModel,
  } = useModelStore();
  const {
    locations,
    fetchLocations,
    isOpen: isLocationOpen,
    onOpen: openLocation,
    onClose: closeLocation,
  } = useLocationStore();
  const {
    departments,
    getAll: fetchDepartments,
    isOpen: isDepartmentOpen,
    onOpen: openDepartment,
    onClose: closeDepartment,
  } = useDepartmentStore();
  const {
    inventories,
    getAll: fetchInventories,
    isOpen: isInventoryOpen,
    onOpen: openInventory,
    onClose: closeInventory,
  } = useInventoryStore();
  const {
    suppliers,
    getAll: fetchSuppliers,
    isOpen: isSupplierOpen,
    onOpen: openSupplier,
    onClose: closeSupplier,
  } = useSupplierStore();

  const {
    categories,
    getAll: fetchCategories,
    isOpen: isCategoryOpen,
    onOpen: openCategory,
    onClose: closeCategory,
  } = useCategoryStore();

  const {
    manufacturers,
    isOpen: isManufacturerOpen,
    onOpen: openManufacturer,
    onClose: closeManufacturer,
    getAll: fetchManufacturers,
  } = useManufacturerStore();

  const {
    isOpen: isTemplateOpen,
    templates,
    fetchTemplates: fetchFormTemplates,
    onOpen: openTemplate,
    onClose: closeTemplate,
  } = useFormTemplateStore();

  const modals = useMemo<ModalConfig[]>(
    () => [
      {
        id: "model",
        title: "Add Model",
        description: "",
        Component: ModelForm,
        isOpen: isModelOpen,
        onClose: closeModel,
      },
      {
        id: "status",
        title: "Add Status",
        description: "",
        Component: StatusLabelForm,
        isOpen: isStatusOpen,
        onClose: closeStatus,
        onSuccess: (id: string) => form.setValue("statusLabelId", id),
      },
      {
        id: "location",
        title: "Add Location",
        description: "",
        Component: LocationForm,
        isOpen: isLocationOpen,
        onClose: closeLocation,
      },
      {
        id: "department",
        title: "Add Department",
        description: "",
        Component: DepartmentForm,
        isOpen: isDepartmentOpen,
        onClose: closeDepartment,
      },
      {
        id: "supplier",
        title: "Add Supplier",
        description: "",
        Component: SupplierForm,
        isOpen: isSupplierOpen,
        onClose: closeSupplier,
      },
      {
        id: "inventory",
        title: "Add Inventory",
        description: "",
        Component: InventoryForm,
        isOpen: isInventoryOpen,
        onClose: closeInventory,
      },
      {
        id: "category",
        title: "Add Category",
        description: "",
        Component: CategoryForm,
        isOpen: isCategoryOpen,
        onClose: closeCategory,
      },
      {
        id: "manufacturer",
        title: "Add Manufacturer",
        description: "",
        Component: ManufacturerForm,
        isOpen: isManufacturerOpen,
        onClose: closeManufacturer,
      },
      {
        id: "customFields",
        title: "Add Custom Category fields",
        description: "",
        Component: FormTemplateCreator,
        isOpen: isTemplateOpen,
        onClose: closeTemplate,
      },
    ],
    [
      // Modal open states
      isModelOpen,
      isStatusOpen,
      isLocationOpen,
      isDepartmentOpen,
      isSupplierOpen,
      isInventoryOpen,
      isCategoryOpen,
      isManufacturerOpen,
      isTemplateOpen,

      // Modal close functions
      closeModel,
      closeStatus,
      closeLocation,
      closeDepartment,
      closeSupplier,
      closeInventory,
      closeCategory,
      closeManufacturer,
      closeTemplate,

      // Form reference for callbacks
      form,
    ],
  );

  return modals;
}
