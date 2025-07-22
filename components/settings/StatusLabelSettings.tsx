import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tags,
  Plus,
  Edit,
  Trash2,
  Settings,
  Palette,
  Info,
  AlertCircle,
} from "lucide-react";
import { useStatusLabelsQuery } from "@/hooks/queries/useStatusLabelsQuery";
import { toast } from "sonner";
import { hasPermission, Permission } from "@/lib/utils/permissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStatusLabelUIStore } from "@/lib/stores";
import StatusLabelForm from "@/components/forms/StatusLabelForm";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { statusLabelColumns } from "@/components/tables/StatusLabelColumns";
import { StatusLabel } from "@prisma/client";

function StatusLabelsTab({ userRole }: { userRole?: string }) {
  const canEdit = hasPermission(userRole, "statusLabels.manage" as any);
  const {
    statusLabels,
    isLoading,
    error,
    deleteStatusLabel,
  } = useStatusLabelsQuery();
  
  const {
    isOpen: isStatusLabelOpen,
    onClose: closeStatusLabel,
    onOpen: onStatusLabelOpen,
  } = useStatusLabelUIStore();

  const [editingStatusLabel, setEditingStatusLabel] = useState<StatusLabel | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (statusLabel: StatusLabel) => {
    try {
      await deleteStatusLabel(statusLabel.id);
      toast.success("Status label deleted successfully");
    } catch (err) {
      toast.error("Failed to delete status label");
    }
  };

  const handleEdit = (statusLabel: StatusLabel) => {
    setEditingStatusLabel(statusLabel);
    onStatusLabelOpen();
  };

  const handleAddNew = () => {
    setEditingStatusLabel(null);
    onStatusLabelOpen();
  };

  const filteredStatusLabels = (statusLabels || []).filter((statusLabel) => {
    const query = searchQuery.toLowerCase();
    return statusLabel.name.toLowerCase().includes(query);
  });

  const columns = statusLabelColumns({
    onDelete: handleDelete as any,
    onUpdate: handleEdit as any,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Status Labels</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage asset status labels and their properties
          </p>
        </div>
        {canEdit && (
          <Button
            onClick={handleAddNew}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Status Label
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to load status labels. Please try again.</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Status Labels
          </CardTitle>
          <CardDescription>
            Configure status labels to track asset conditions and lifecycle states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="Search status labels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <Info className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            
            <DataTable
              columns={columns}
              data={filteredStatusLabels}
              isLoading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Label Form Modal */}
      <DialogContainer
        open={isStatusLabelOpen}
        onOpenChange={closeStatusLabel}
        title={editingStatusLabel ? "Edit Status Label" : "Add Status Label"}
        description={
          editingStatusLabel
            ? "Update the status label properties"
            : "Create a new status label for asset tracking"
        }
        body={
          <StatusLabelForm
            initialData={editingStatusLabel || undefined}
            onSubmitSuccess={() => {
              closeStatusLabel();
              setEditingStatusLabel(null);
            }}
          />
        }
        form={null}
      />
    </div>
  );
}

function ConfigurationTab({ userRole }: { userRole?: string }) {
  const canEdit = hasPermission(userRole, "statusLabels.manage" as any);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuration
        </CardTitle>
        <CardDescription>
          Configure default settings and behavior for status labels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium">Default Status</Label>
            <p className="text-sm text-gray-600 mt-1">
              Set the default status for new assets
            </p>
            <Select disabled={!canEdit} defaultValue="available">
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select default status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Color Scheme</Label>
            <p className="text-sm text-gray-600 mt-1">
              Choose the color scheme for status labels
            </p>
            <Select disabled={!canEdit} defaultValue="default">
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select color scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="colorful">Colorful</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Status Label Categories</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Active Statuses</span>
              </div>
              <Badge variant="outline">3 labels</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Maintenance Statuses</span>
              </div>
              <Badge variant="outline">2 labels</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">Retired Statuses</span>
              </div>
              <Badge variant="outline">1 label</Badge>
            </div>
          </div>
        </div>
      </CardContent>
      {canEdit && (
        <CardFooter className="border-t bg-gray-50 px-6 py-4 flex justify-end">
          <Button variant="outline" disabled>
            Save Configuration
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function AnalyticsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Analytics & Usage
        </CardTitle>
        <CardDescription>
          View usage statistics and analytics for status labels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-blue-600">Total Status Labels</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">1,247</div>
            <div className="text-sm text-green-600">Assets Using Labels</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">89%</div>
            <div className="text-sm text-purple-600">Label Coverage</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 flex items-center gap-2">
          <span className="font-semibold">Coming Soon:</span> Detailed analytics and usage reports will be available in the next version.
        </div>
      </CardContent>
    </Card>
  );
}

const ALL_TABS = [
  { id: "status-labels", label: "Status Labels", icon: Tags, permission: "statusLabels.view" as any },
  { id: "configuration", label: "Configuration", icon: Settings, permission: "statusLabels.manage" as any },
  { id: "analytics", label: "Analytics", icon: Palette, permission: "statusLabels.view" as any },
];

const TAB_COMPONENTS: Record<string, React.FC<{ userRole?: string }>> = {
  "status-labels": StatusLabelsTab,
  "configuration": ConfigurationTab,
  "analytics": AnalyticsTab,
};

const StatusLabelSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("status-labels");
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [checkingPerms, setCheckingPerms] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setUserRole(data.role);
        setCheckingPerms(false);
      })
      .catch(() => {
        setUserRole(undefined);
        setCheckingPerms(false);
      });
  }, []);

  // Filter tabs based on permission
  const TABS = ALL_TABS.filter(tab =>
    !tab.permission || hasPermission(userRole, tab.permission)
  );

  // If the current activeTab is not allowed, reset to first allowed tab
  useEffect(() => {
    if (!TABS.find(tab => tab.id === activeTab)) {
      setActiveTab(TABS[0]?.id || "status-labels");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen bg-slate-50">
      {checkingPerms ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-lg text-slate-500">Checking permissions...</div>
        </div>
      ) : TABS.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-lg text-yellow-700">
            You do not have permission to view any status label settings.
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row">
          {/* Sidebar for desktop */}
          <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col py-12 px-8 sticky top-16 z-20 rounded-xl shadow-sm gap-3">
            <div className="flex items-center gap-3 mb-10">
              <Avatar>
                <AvatarFallback>
                  <Tags className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <span className="font-bold text-lg">Status Labels</span>
            </div>
            <nav className="flex flex-col gap-3">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition relative
                      ${isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}
                      focus:outline-none focus:ring-2 focus:ring-slate-500`}
                    onClick={() => setActiveTab(tab.id)}
                    aria-label={tab.label}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {tab.label}
                    {isActive && (
                      <span className="absolute left-0 bottom-0 w-full h-1 bg-slate-900 rounded-b transition-all duration-300" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>
          
          {/* Top tab bar for mobile */}
          <nav className="flex md:hidden w-full bg-white border-b border-slate-100 px-2 py-2 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 px-3 py-2 rounded-lg mx-1 text-sm whitespace-nowrap transition
                  ${activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          
          {/* Main Content */}
          <main className="flex-1 px-2 py-4 md:px-12 md:py-16">
            <div className="max-w-full md:max-w-4xl mx-auto space-y-8 md:space-y-12">
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Status Label Settings</h1>
                <p className="text-slate-500 mb-6 md:mb-8">
                  Manage asset status labels and their configuration.
                </p>
                <hr className="my-6 md:my-8" />
                <ActiveComponent userRole={userRole} />
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default StatusLabelSettings;
