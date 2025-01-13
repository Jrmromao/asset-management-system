// hooks/useFormModals.ts
import { useMemo } from "react";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { ModalConfig } from "@/types/modals";
import ModelForm from "@/components/forms/ModelForm";
import StatusLabelForm from "@/components/forms/StatusLabelForm";
import LocationForm from "@/components/forms/LocationForm";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import { useManufacturerStore } from "@/lib/stores/manufacturerStore";
import { useFormTemplateStore } from "@/lib/stores/formTemplateStore";
import DepartmentForm from "@/components/forms/DepartmentForm";
import SupplierForm from "@/components/forms/SupplierForm";
import InventoryForm from "@/components/forms/InventoryForm";
import CategoryForm from "@/components/forms/CategoryForm";
import ManufacturerForm from "@/components/forms/ManufacturerForm";
import FormTemplateCreator from "@/components/forms/FormTemplateCreator";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";
import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { useCategoryUIStore } from "@/lib/stores/useCategoryUIStore";

export function useFormModals(form: any) {
  const { isOpen: isStatusOpen, onClose: closeStatus } =
    useStatusLabelUIStore();

  const { isOpen: isModelOpen, onClose: closeModel } = useModelUIStore();

  const { isOpen: isDepartmentOpen, onClose: closeDepartment } =
    useDepartmentUIStore();

  const { isOpen: isLocationOpen, onClose: closeLocation } =
    useLocationUIStore();
  const { isOpen: isInventoryOpen, onClose: closeInventory } =
    useInventoryUIStore();
  const { isOpen: isSupplierOpen, onClose: closeSupplier } =
    useSupplierUIStore();

  const { isOpen: isCategoryOpen, onClose: closeCategory } =
    useCategoryUIStore();

  const { isOpen: isManufacturerOpen, onClose: closeManufacturer } =
    useManufacturerStore();

  const { isOpen: isTemplateOpen, onClose: closeTemplate } =
    useFormTemplateStore();

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
