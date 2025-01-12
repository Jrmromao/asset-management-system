import { getAll as getAllManufacturers } from "@/lib/actions/manufacturer.actions";
import { getAllSimple as getAllSuppliers } from "@/lib/actions/supplier.actions";
import { findAll as getAllCategories } from "@/lib/actions/category.actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accessorySchema } from "@/lib/schemas";
import { useFormData } from "@/hooks/useFormData";

export function useAccessoryForm() {
  const { data: manufacturers, isLoading: isLoadingManufacturers } =
    useFormData({
      fetchFn: getAllManufacturers,
      onError: (error) =>
        console.error("Failed to fetch manufacturers:", error),
    });

  const { data: suppliers, isLoading: isLoadingSuppliers } = useFormData({
    fetchFn: getAllSuppliers,
  });

  const { data: categories, isLoading: isLoadingCategories } = useFormData({
    fetchFn: getAllCategories,
  });

  const form = useForm({
    resolver: zodResolver(accessorySchema),
    defaultValues: {
      name: "",
      serialNumber: "",
      supplierId: "",
      manufacturerId: "",
      // ... other default values
    },
  });

  const isLoading =
    isLoadingManufacturers || isLoadingSuppliers || isLoadingCategories;

  return {
    form,
    manufacturers,
    suppliers,
    categories,
    isLoading,
  };
}
