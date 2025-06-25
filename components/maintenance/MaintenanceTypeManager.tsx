"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Zap,
  Shield,
  Hammer,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useMaintenanceCategories,
  useCreateMaintenanceCategory,
  useUpdateMaintenanceCategory,
  useDeleteMaintenanceCategory,
  useMaintenanceTypes,
  useCreateMaintenanceType,
  useUpdateMaintenanceType,
  useDeleteMaintenanceType,
} from "@/hooks/queries/useMaintenanceTypeQuery";
import {
  type MaintenanceType,
  type MaintenanceCategory,
  type CreateMaintenanceTypeParams,
  type CreateMaintenanceCategoryParams,
} from "@/lib/actions/maintenanceType.actions";
import ConfirmationDialog from "@/components/ConfirmationDialog";

// Types for maintenance management (keeping local types for compatibility)
interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  order: number;
}

interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "boolean" | "select" | "date";
  isRequired: boolean;
  options?: string[];
  defaultValue?: any;
  order: number;
}

// Available icons
const ICONS = [
  { value: "wrench", label: "Wrench", icon: Wrench },
  { value: "tool", label: "Tool", icon: Hammer },
  { value: "shield", label: "Shield", icon: Shield },
  { value: "zap", label: "Zap", icon: Zap },
  { value: "clock", label: "Clock", icon: Clock },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "alert", label: "Alert", icon: AlertTriangle },
  { value: "check", label: "Check", icon: CheckCircle },
];

// Main Maintenance Type Manager Component
export const MaintenanceTypeManager: React.FC = () => {
  // Queries
  const { data: categories = [], isLoading: categoriesLoading } =
    useMaintenanceCategories();
  const { data: maintenanceTypes = [], isLoading: typesLoading } =
    useMaintenanceTypes();

  // Mutations
  const createCategoryMutation = useCreateMaintenanceCategory();
  const updateCategoryMutation = useUpdateMaintenanceCategory();
  const deleteCategoryMutation = useDeleteMaintenanceCategory();
  const createTypeMutation = useCreateMaintenanceType();
  const updateTypeMutation = useUpdateMaintenanceType();
  const deleteTypeMutation = useDeleteMaintenanceType();

  // State
  const [isEditingType, setIsEditingType] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentType, setCurrentType] = useState<
    Partial<CreateMaintenanceTypeParams>
  >({});
  const [currentCategory, setCurrentCategory] = useState<
    Partial<CreateMaintenanceCategoryParams>
  >({});
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const saveType = async () => {
    if (!currentType.name || !currentType.categoryId) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const typeData: CreateMaintenanceTypeParams = {
        name: currentType.name!,
        description: currentType.description || "",
        categoryId: currentType.categoryId!,
        priority: currentType.priority || "Medium",
        estimatedDuration: currentType.estimatedDuration || 1,
        requiredSkills: currentType.requiredSkills || [],
        defaultCost: currentType.defaultCost || 0,
        isActive: currentType.isActive ?? true,
        color: currentType.color || "#3B82F6",
        icon: currentType.icon || "wrench",
        checklist: currentType.checklist || [],
        customFields: currentType.customFields || [],
      };

      if (editingTypeId) {
        await updateTypeMutation.mutateAsync({
          id: editingTypeId,
          data: typeData,
        });
      } else {
        await createTypeMutation.mutateAsync(typeData);
      }

      setIsEditingType(false);
      setCurrentType({});
      setEditingTypeId(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const saveCategory = async () => {
    if (!currentCategory.name) {
      toast.error("Please provide a category name");
      return;
    }

    try {
      const categoryData: CreateMaintenanceCategoryParams = {
        name: currentCategory.name!,
        description: currentCategory.description || "",
        color: currentCategory.color || "#3B82F6",
        isActive: currentCategory.isActive ?? true,
      };

      if (editingCategoryId) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategoryId,
          data: categoryData,
        });
      } else {
        await createCategoryMutation.mutateAsync(categoryData);
      }

      setIsEditingCategory(false);
      setCurrentCategory({});
      setEditingCategoryId(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const editType = (type: MaintenanceType) => {
    setCurrentType({
      name: type.name,
      description: type.description,
      categoryId: type.categoryId,
      priority: type.priority,
      estimatedDuration: type.estimatedDuration,
      requiredSkills: type.requiredSkills,
      defaultCost: type.defaultCost,
      isActive: type.isActive,
      color: type.color,
      icon: type.icon,
      checklist: type.checklist,
      customFields: type.customFields,
    });
    setEditingTypeId(type.id);
    setIsEditingType(true);
  };

  const editCategory = (category: MaintenanceCategory) => {
    setCurrentCategory({
      name: category.name,
      description: category.description,
      color: category.color,
      isActive: category.isActive,
    });
    setEditingCategoryId(category.id);
    setIsEditingCategory(true);
  };

  const handleDeleteType = async () => {
    if (deleteTypeId) {
      try {
        await deleteTypeMutation.mutateAsync(deleteTypeId);
      } catch (error) {
        // Error is handled by the mutation
      } finally {
        setDeleteTypeId(null);
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (deleteCategoryId) {
      try {
        await deleteCategoryMutation.mutateAsync(deleteCategoryId);
      } catch (error) {
        // Error is handled by the mutation
      } finally {
        setDeleteCategoryId(null);
      }
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = ICONS.find((i) => i.value === iconName);
    return iconData?.icon || Wrench;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(
      (c: MaintenanceCategory) => c.id === categoryId,
    );
    return category?.name || "Unknown Category";
  };

  if (categoriesLoading || typesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">
          Loading maintenance types and categories...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Types & Categories</h2>
          <p className="text-gray-600">
            Manage custom maintenance types and workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentCategory({});
              setEditingCategoryId(null);
              setIsEditingCategory(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
          <Button
            onClick={() => {
              setCurrentType({});
              setEditingTypeId(null);
              setIsEditingType(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Type
          </Button>
        </div>
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category: MaintenanceCategory) => (
              <div
                key={category.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h4 className="font-medium">{category.name}</h4>
                  </div>
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {category.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteCategoryId(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Types Section */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceTypes.map((type: MaintenanceType) => {
              const IconComponent = getIconComponent(type.icon);
              return (
                <div
                  key={type.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: type.color + "20" }}
                    >
                      <IconComponent
                        className="h-6 w-6"
                        style={{ color: type.color }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{type.name}</h4>
                        <Badge variant="outline">
                          {getCategoryName(type.categoryId)}
                        </Badge>
                        <Badge
                          variant={
                            type.priority === "Critical"
                              ? "destructive"
                              : type.priority === "High"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {type.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {type.description}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Duration: {type.estimatedDuration}h</span>
                        <span>Cost: ${type.defaultCost}</span>
                        <span>Skills: {type.requiredSkills.length}</span>
                        <span>Checklist: {type.checklist.length} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editType(type)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteTypeId(type.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Type Dialog */}
      <Dialog open={isEditingType} onOpenChange={setIsEditingType}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTypeId
                ? "Edit Maintenance Type"
                : "Create Maintenance Type"}
            </DialogTitle>
            <DialogDescription>
              Configure the maintenance type settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={currentType.name || ""}
                  onChange={(e) =>
                    setCurrentType((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Oil Change"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select
                  value={currentType.categoryId || ""}
                  onValueChange={(value) =>
                    setCurrentType((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c: MaintenanceCategory) => c.isActive)
                      .map((cat: MaintenanceCategory) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={currentType.description || ""}
                onChange={(e) =>
                  setCurrentType((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this maintenance type..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={currentType.priority || "Medium"}
                  onValueChange={(
                    value: "Low" | "Medium" | "High" | "Critical",
                  ) => setCurrentType((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estimated Duration (hours)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={currentType.estimatedDuration || 1}
                  onChange={(e) =>
                    setCurrentType((prev) => ({
                      ...prev,
                      estimatedDuration: parseFloat(e.target.value) || 1,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default Cost ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentType.defaultCost || 0}
                  onChange={(e) =>
                    setCurrentType((prev) => ({
                      ...prev,
                      defaultCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={currentType.color || "#3B82F6"}
                  onChange={(e) =>
                    setCurrentType((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <Select
                  value={currentType.icon || "wrench"}
                  onValueChange={(value) =>
                    setCurrentType((prev) => ({ ...prev, icon: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <icon.icon className="h-4 w-4" />
                          {icon.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={currentType.isActive ?? true}
                  onCheckedChange={(checked) =>
                    setCurrentType((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label>Active</Label>
              </div>
            </div>

            <div>
              <Label>Required Skills (comma-separated)</Label>
              <Input
                value={currentType.requiredSkills?.join(", ") || ""}
                onChange={(e) =>
                  setCurrentType((prev) => ({
                    ...prev,
                    requiredSkills: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="Basic Mechanical, Electrical, Safety Certification"
              />
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <Button
                onClick={saveType}
                disabled={
                  createTypeMutation.isPending || updateTypeMutation.isPending
                }
              >
                {(createTypeMutation.isPending ||
                  updateTypeMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Type
              </Button>
              <Button variant="outline" onClick={() => setIsEditingType(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              Configure the category settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={currentCategory.name || ""}
                onChange={(e) =>
                  setCurrentCategory((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g., Preventive"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={currentCategory.description || ""}
                onChange={(e) =>
                  setCurrentCategory((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this category..."
              />
            </div>

            <div>
              <Label>Color</Label>
              <Input
                type="color"
                value={currentCategory.color || "#3B82F6"}
                onChange={(e) =>
                  setCurrentCategory((prev) => ({
                    ...prev,
                    color: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={currentCategory.isActive ?? true}
                onCheckedChange={(checked) =>
                  setCurrentCategory((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label>Active</Label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={saveCategory}
                disabled={
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
              >
                {(createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Category
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingCategory(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for deleting a category */}
      <ConfirmationDialog
        title="Delete Category"
        description="Are you sure you want to delete this maintenance category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCategoryId(null)}
        open={!!deleteCategoryId}
        onOpenChange={(open) => {
          if (!open) setDeleteCategoryId(null);
        }}
      />

      {/* Confirmation Dialog for deleting a type */}
      <ConfirmationDialog
        title="Delete Maintenance Type"
        description="Are you sure you want to delete this maintenance type? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteType}
        onCancel={() => setDeleteTypeId(null)}
        open={!!deleteTypeId}
        onOpenChange={(open) => {
          if (!open) setDeleteTypeId(null);
        }}
      />
    </div>
  );
};
