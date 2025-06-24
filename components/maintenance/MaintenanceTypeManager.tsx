"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

// Types for maintenance management
interface MaintenanceType {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  estimatedDuration: number; // in hours
  requiredSkills: string[];
  defaultCost: number;
  isActive: boolean;
  color: string;
  icon: string;
  checklist: ChecklistItem[];
  customFields: CustomField[];
}

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  order: number;
}

interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  required: boolean;
  options?: string[]; // for select type
  defaultValue?: any;
}

interface MaintenanceCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
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
  const [categories, setCategories] = useState<MaintenanceCategory[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>(
    [],
  );
  const [isEditingType, setIsEditingType] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentType, setCurrentType] = useState<Partial<MaintenanceType>>({});
  const [currentCategory, setCurrentCategory] = useState<
    Partial<MaintenanceCategory>
  >({});

  useEffect(() => {
    // Load initial data - this would come from your API
    const defaultCategories = [
      {
        id: "1",
        name: "Preventive",
        description: "Scheduled maintenance to prevent issues",
        color: "#22C55E",
        isActive: true,
      },
      {
        id: "2",
        name: "Corrective",
        description: "Maintenance to fix existing problems",
        color: "#F59E0B",
        isActive: true,
      },
      {
        id: "3",
        name: "Emergency",
        description: "Urgent maintenance to restore operations",
        color: "#EF4444",
        isActive: true,
      },
    ];
    setCategories(defaultCategories);
  }, []);

  const saveType = async () => {
    if (!currentType.name || !currentType.category) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const newType: MaintenanceType = {
        id: currentType.id || Date.now().toString(),
        name: currentType.name!,
        description: currentType.description || "",
        category: currentType.category!,
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

      if (currentType.id) {
        setMaintenanceTypes((prev) =>
          prev.map((t) => (t.id === currentType.id ? newType : t)),
        );
      } else {
        setMaintenanceTypes((prev) => [...prev, newType]);
      }

      setIsEditingType(false);
      setCurrentType({});
      toast.success("Maintenance type saved successfully!");
    } catch (error) {
      toast.error("Failed to save maintenance type");
    }
  };

  const saveCategory = async () => {
    if (!currentCategory.name) {
      toast.error("Please provide a category name");
      return;
    }

    try {
      const newCategory: MaintenanceCategory = {
        id: currentCategory.id || Date.now().toString(),
        name: currentCategory.name!,
        description: currentCategory.description || "",
        color: currentCategory.color || "#3B82F6",
        isActive: currentCategory.isActive ?? true,
      };

      if (currentCategory.id) {
        setCategories((prev) =>
          prev.map((c) => (c.id === currentCategory.id ? newCategory : c)),
        );
      } else {
        setCategories((prev) => [...prev, newCategory]);
      }

      setIsEditingCategory(false);
      setCurrentCategory({});
      toast.success("Category saved successfully!");
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  const editType = (type: MaintenanceType) => {
    setCurrentType(type);
    setIsEditingType(true);
  };

  const editCategory = (category: MaintenanceCategory) => {
    setCurrentCategory(category);
    setIsEditingCategory(true);
  };

  const getIconComponent = (iconName: string) => {
    const iconData = ICONS.find((i) => i.value === iconName);
    return iconData?.icon || Wrench;
  };

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
              setIsEditingCategory(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
          <Button
            onClick={() => {
              setCurrentType({});
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
            {categories.map((category) => (
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
            {maintenanceTypes.map((type) => {
              const IconComponent = getIconComponent(type.icon);
              return (
                <div
                  key={type.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: `${type.color}20`,
                          color: type.color,
                        }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{type.name}</h4>
                          <Badge variant="outline">{type.category}</Badge>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editType(type)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {maintenanceTypes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No maintenance types created yet. Create your first type to get
                started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Type Dialog */}
      <Dialog open={isEditingType} onOpenChange={setIsEditingType}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentType.id
                ? "Edit Maintenance Type"
                : "Create Maintenance Type"}
            </DialogTitle>
            <DialogDescription>
              Define the properties and workflow for this maintenance type
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
                  value={currentType.category || ""}
                  onValueChange={(value) =>
                    setCurrentType((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.isActive)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={currentType.priority || "Medium"}
                  onValueChange={(value: any) =>
                    setCurrentType((prev) => ({ ...prev, priority: value }))
                  }
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
                <Label>Duration (hours)</Label>
                <Input
                  type="number"
                  value={currentType.estimatedDuration || ""}
                  onChange={(e) =>
                    setCurrentType((prev) => ({
                      ...prev,
                      estimatedDuration: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Default Cost ($)</Label>
                <Input
                  type="number"
                  value={currentType.defaultCost || ""}
                  onChange={(e) =>
                    setCurrentType((prev) => ({
                      ...prev,
                      defaultCost: Number(e.target.value),
                    }))
                  }
                />
              </div>
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
              <Button onClick={saveType}>
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
              {currentCategory.id ? "Edit Category" : "Create Category"}
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
              <Button onClick={saveCategory}>
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
    </div>
  );
};
