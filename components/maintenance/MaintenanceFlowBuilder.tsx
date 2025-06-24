"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  Trash2,
  Settings,
  Play,
  AlertTriangle,
  CheckCircle,
  Mail,
  Calendar,
  Users,
  DollarSign,
  Workflow,
  ArrowRight,
  Edit,
  Copy,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

// Types for flow building
interface FlowCondition {
  id: string;
  field: string;
  operator: string;
  value: any;
  logicalOperator: "AND" | "OR";
}

interface FlowAction {
  id: string;
  type: string;
  parameters: Record<string, any>;
  name: string;
}

interface MaintenanceFlow {
  id?: string;
  name: string;
  description: string;
  trigger: string;
  priority: number;
  isActive: boolean;
  conditions: FlowCondition[];
  actions: FlowAction[];
}

// Predefined field options for conditions
const CONDITION_FIELDS = [
  { value: "maintenance.priority", label: "Maintenance Priority" },
  { value: "maintenance.cost", label: "Maintenance Cost" },
  { value: "maintenance.type", label: "Maintenance Type" },
  { value: "asset.category.name", label: "Asset Category" },
  { value: "asset.value", label: "Asset Value" },
  { value: "asset.age", label: "Asset Age (years)" },
  { value: "user.role", label: "User Role" },
  { value: "maintenance.duration", label: "Estimated Duration" },
  { value: "maintenance.supplier", label: "Supplier" },
];

// Operators for conditions
const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "contains", label: "Contains" },
  { value: "in", label: "In List" },
  { value: "not_in", label: "Not In List" },
];

// Action types available
const ACTION_TYPES = [
  {
    value: "update_status",
    label: "Update Status",
    icon: CheckCircle,
    parameters: [
      { name: "status", type: "select", options: ["Scheduled", "In Progress", "Completed", "On Hold"] }
    ]
  },
  {
    value: "send_notification",
    label: "Send Notification",
    icon: Mail,
    parameters: [
      { name: "recipient", type: "select", options: ["Asset Owner", "Maintenance Team", "Manager"] },
      { name: "message", type: "textarea" }
    ]
  },
  {
    value: "assign_technician",
    label: "Assign Technician",
    icon: Users,
    parameters: [
      { name: "technicianId", type: "user_select" },
      { name: "autoAssign", type: "boolean" }
    ]
  },
  {
    value: "schedule_followup",
    label: "Schedule Follow-up",
    icon: Calendar,
    parameters: [
      { name: "daysOffset", type: "number" },
      { name: "followupType", type: "select", options: ["Inspection", "Maintenance", "Review"] }
    ]
  },
  {
    value: "update_cost",
    label: "Update Cost",
    icon: DollarSign,
    parameters: [
      { name: "costType", type: "select", options: ["Labor", "Parts", "External"] },
      { name: "amount", type: "number" }
    ]
  },
  {
    value: "require_approval",
    label: "Require Approval",
    icon: AlertTriangle,
    parameters: [
      { name: "approverRole", type: "select", options: ["Manager", "Senior Technician", "Admin"] },
      { name: "reason", type: "text" }
    ]
  }
];

// Condition Builder Component
const ConditionBuilder: React.FC<{
  condition: FlowCondition;
  onUpdate: (condition: FlowCondition) => void;
  onDelete: () => void;
  showLogicalOperator: boolean;
}> = ({ condition, onUpdate, onDelete, showLogicalOperator }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Condition</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label>Field</Label>
          <Select
            value={condition.field}
            onValueChange={(value) => onUpdate({ ...condition, field: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_FIELDS.map((field) => (
                <SelectItem key={field.value} value={field.value}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Operator</Label>
          <Select
            value={condition.operator}
            onValueChange={(value) => onUpdate({ ...condition, operator: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Value</Label>
          <Input
            value={condition.value}
            onChange={(e) => onUpdate({ ...condition, value: e.target.value })}
            placeholder="Enter value"
          />
        </div>
      </div>

      {showLogicalOperator && (
        <div>
          <Label>Logical Operator</Label>
          <Select
            value={condition.logicalOperator}
            onValueChange={(value: "AND" | "OR") => 
              onUpdate({ ...condition, logicalOperator: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

// Action Builder Component
const ActionBuilder: React.FC<{
  action: FlowAction;
  onUpdate: (action: FlowAction) => void;
  onDelete: () => void;
}> = ({ action, onUpdate, onDelete }) => {
  const actionType = ACTION_TYPES.find(t => t.value === action.type);
  const Icon = actionType?.icon || Settings;

  return (
    <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium">{action.name || actionType?.label}</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label>Action Type</Label>
        <Select
          value={action.type}
          onValueChange={(value) => {
            const newActionType = ACTION_TYPES.find(t => t.value === value);
            onUpdate({ 
              ...action, 
              type: value,
              name: newActionType?.label || value,
              parameters: {}
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Action Name</Label>
        <Input
          value={action.name}
          onChange={(e) => onUpdate({ ...action, name: e.target.value })}
          placeholder="Give this action a name"
        />
      </div>

      {actionType?.parameters.map((param) => (
        <div key={param.name}>
          <Label>{param.name.charAt(0).toUpperCase() + param.name.slice(1)}</Label>
          {param.type === "select" ? (
            <Select
              value={action.parameters[param.name] || ""}
              onValueChange={(value) => 
                onUpdate({
                  ...action,
                  parameters: { ...action.parameters, [param.name]: value }
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${param.name}`} />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : param.type === "textarea" ? (
            <Textarea
              value={action.parameters[param.name] || ""}
              onChange={(e) =>
                onUpdate({
                  ...action,
                  parameters: { ...action.parameters, [param.name]: e.target.value }
                })
              }
              placeholder={`Enter ${param.name}`}
            />
          ) : param.type === "boolean" ? (
            <div className="flex items-center space-x-2">
              <Switch
                checked={action.parameters[param.name] || false}
                onCheckedChange={(checked) =>
                  onUpdate({
                    ...action,
                    parameters: { ...action.parameters, [param.name]: checked }
                  })
                }
              />
              <span className="text-sm text-gray-600">
                {action.parameters[param.name] ? "Yes" : "No"}
              </span>
            </div>
          ) : (
            <Input
              type={param.type === "number" ? "number" : "text"}
              value={action.parameters[param.name] || ""}
              onChange={(e) =>
                onUpdate({
                  ...action,
                  parameters: { 
                    ...action.parameters, 
                    [param.name]: param.type === "number" ? Number(e.target.value) : e.target.value 
                  }
                })
              }
              placeholder={`Enter ${param.name}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Main Flow Builder Component
export const MaintenanceFlowBuilder: React.FC = () => {
  const [flows, setFlows] = useState<MaintenanceFlow[]>([]);
  const [currentFlow, setCurrentFlow] = useState<MaintenanceFlow>({
    name: "",
    description: "",
    trigger: "creation",
    priority: 100,
    isActive: true,
    conditions: [],
    actions: []
  });
  const [isEditing, setIsEditing] = useState(false);

  const addCondition = useCallback(() => {
    const newCondition: FlowCondition = {
      id: Date.now().toString(),
      field: "",
      operator: "equals",
      value: "",
      logicalOperator: "AND"
    };
    setCurrentFlow(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  }, []);

  const updateCondition = useCallback((index: number, condition: FlowCondition) => {
    setCurrentFlow(prev => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => i === index ? condition : c)
    }));
  }, []);

  const deleteCondition = useCallback((index: number) => {
    setCurrentFlow(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  }, []);

  const addAction = useCallback(() => {
    const newAction: FlowAction = {
      id: Date.now().toString(),
      type: "",
      name: "",
      parameters: {}
    };
    setCurrentFlow(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));
  }, []);

  const updateAction = useCallback((index: number, action: FlowAction) => {
    setCurrentFlow(prev => ({
      ...prev,
      actions: prev.actions.map((a, i) => i === index ? action : a)
    }));
  }, []);

  const deleteAction = useCallback((index: number) => {
    setCurrentFlow(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  }, []);

  const saveFlow = useCallback(async () => {
    if (!currentFlow.name.trim()) {
      toast.error("Please provide a flow name");
      return;
    }

    try {
      // This would call your API to save the flow
      // await saveMaintenanceFlow(currentFlow);
      
      toast.success("Maintenance flow saved successfully!");
      setIsEditing(false);
      setCurrentFlow({
        name: "",
        description: "",
        trigger: "creation",
        priority: 100,
        isActive: true,
        conditions: [],
        actions: []
      });
    } catch (error) {
      toast.error("Failed to save maintenance flow");
    }
  }, [currentFlow]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Flow Builder</h2>
          <p className="text-gray-600">Create custom workflows for your maintenance processes</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Flow
          </Button>
        </div>
      </div>

      {/* Flow Builder */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              {currentFlow.id ? "Edit Flow" : "Create New Flow"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Flow Name *</Label>
                <Input
                  id="name"
                  value={currentFlow.name}
                  onChange={(e) => setCurrentFlow(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., High-Priority Asset Workflow"
                />
              </div>
              <div>
                <Label htmlFor="trigger">Trigger</Label>
                <Select
                  value={currentFlow.trigger}
                  onValueChange={(value) => setCurrentFlow(prev => ({ ...prev, trigger: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creation">On Creation</SelectItem>
                    <SelectItem value="status_change">On Status Change</SelectItem>
                    <SelectItem value="completion">On Completion</SelectItem>
                    <SelectItem value="approval">On Approval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentFlow.description}
                onChange={(e) => setCurrentFlow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this flow does..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority (higher runs first)</Label>
                <Input
                  id="priority"
                  type="number"
                  value={currentFlow.priority}
                  onChange={(e) => setCurrentFlow(prev => ({ ...prev, priority: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentFlow.isActive}
                  onCheckedChange={(checked) => setCurrentFlow(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Active</Label>
              </div>
            </div>

            <Separator />

            {/* Conditions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Conditions</h3>
                <Button onClick={addCondition} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
              
              {currentFlow.conditions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No conditions set. This flow will run for all maintenance events.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentFlow.conditions.map((condition, index) => (
                    <div key={condition.id}>
                      <ConditionBuilder
                        condition={condition}
                        onUpdate={(updated) => updateCondition(index, updated)}
                        onDelete={() => deleteCondition(index)}
                        showLogicalOperator={index < currentFlow.conditions.length - 1}
                      />
                      {index < currentFlow.conditions.length - 1 && (
                        <div className="flex justify-center py-2">
                          <Badge variant="outline" className="bg-gray-100">
                            {condition.logicalOperator}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Actions</h3>
                <Button onClick={addAction} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>
              
              {currentFlow.actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No actions defined. Add actions to specify what happens when conditions are met.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentFlow.actions.map((action, index) => (
                    <div key={action.id}>
                      <ActionBuilder
                        action={action}
                        onUpdate={(updated) => updateAction(index, updated)}
                        onDelete={() => deleteAction(index)}
                      />
                      {index < currentFlow.actions.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button onClick={saveFlow} disabled={!currentFlow.name}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Flow
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Flows List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Flows</CardTitle>
        </CardHeader>
        <CardContent>
          {flows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No custom flows created yet. Create your first flow to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {flows.map((flow) => (
                <div key={flow.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{flow.name}</h4>
                    <p className="text-sm text-gray-600">{flow.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {flow.trigger}
                      </Badge>
                      <Badge variant={flow.isActive ? "default" : "secondary"}>
                        {flow.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentFlow(flow);
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 