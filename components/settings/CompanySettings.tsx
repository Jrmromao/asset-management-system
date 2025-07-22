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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  User,
  CreditCard,
  FileText,
  Plug,
  Shield,
  UploadCloud,
  CheckCircle,
  Calendar,
  Receipt,
  Download,
  Trash2,
  Leaf,
} from "lucide-react";
import { useCompanyQuery } from "@/hooks/queries/useCompanyQuery";
import { useBillingOverviewQuery } from "@/hooks/queries/useBillingOverviewQuery";
import { toast } from "sonner";
import { hasPermission, Permission } from "@/lib/utils/permissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SustainabilityTargets from "@/components/settings/SustainabilityTargets";

function ProfileTab({ userRole }: { userRole?: string }) {
  const canEdit = hasPermission(userRole, "company.settings");
  const [isEditing, setIsEditing] = useState(false);
  const { companies, isLoading, error, refresh, updateCompany, isCreating } = useCompanyQuery();
  const [form, setForm] = useState({
    name: "",
    industry: "Technology",
    website: "",
    primaryContactEmail: "",
    logoUrl: "/logo-placeholder.png",
    employeeCount: 0,
    updatedBy: "",
    updatedAt: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (companies && companies.length > 0) {
      const company = companies[0];
      setForm({
        name: company.name || "",
        industry: company.industry || "Technology",
        website: company.website || "",
        primaryContactEmail: company.primaryContactEmail || "",
        logoUrl: company.logoUrl || "/logo-placeholder.png",
        employeeCount: company.employeeCount ?? 0,
        updatedBy: company.updatedBy || "",
        updatedAt: company.updatedAt ? new Date(company.updatedAt).toLocaleString() : "",
      });
    }
  }, [companies]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleIndustryChange = (value: string) => {
    setForm((prev) => ({ ...prev, industry: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (companies && companies.length > 0) {
        const company = companies[0];
        const updateData: any = {};
        if (form.name !== company.name) updateData.name = form.name;
        if (form.industry !== company.industry) updateData.industry = form.industry;
        if (form.website !== company.website) updateData.website = form.website;
        if (form.primaryContactEmail !== company.primaryContactEmail) updateData.primaryContactEmail = form.primaryContactEmail;
        if (form.logoUrl !== company.logoUrl) updateData.logoUrl = form.logoUrl;
        if (form.employeeCount !== company.employeeCount) updateData.employeeCount = form.employeeCount;
        if (Object.keys(updateData).length > 0) {
          await updateCompany(company.id, updateData);
          toast.success("Profile updated successfully");
          setIsEditing(false);
          refresh();
        } else {
          setIsEditing(false);
        }
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form>
      {isEditing && (
        <div className="mb-6 inline-block px-3 py-1 bg-slate-100 text-slate-900 rounded-full text-xs font-semibold animate-fade-in">
          Edit Mode
        </div>
      )}
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label htmlFor="name">Company Name</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={!canEdit || !isEditing}
                    aria-label="Company Name"
                    className={`bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 transition-all duration-150 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 ${isEditing && canEdit ? "shadow-md" : ""}`}
                  />
                </TooltipTrigger>
                <TooltipContent>Legal name of your company</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={form.industry}
                    onValueChange={handleIndustryChange}
                    disabled={!canEdit || !isEditing}
                    aria-label="Industry"
                  >
                    <SelectTrigger className={`bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 transition-all duration-150 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 ${isEditing && canEdit ? "shadow-md" : ""}`}>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>Industry sector your company operates in</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    disabled={!canEdit || !isEditing}
                    aria-label="Website"
                    className={`bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 transition-all duration-150 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 ${isEditing && canEdit ? "shadow-md" : ""}`}
                  />
                </TooltipTrigger>
                <TooltipContent>Public website URL</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <Label htmlFor="primaryContactEmail">Contact Email</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="primaryContactEmail"
                    name="primaryContactEmail"
                    value={form.primaryContactEmail}
                    onChange={handleChange}
                    disabled={!canEdit || !isEditing}
                    aria-label="Contact Email"
                    className={`bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 transition-all duration-150 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 ${isEditing && canEdit ? "shadow-md" : ""}`}
                  />
                </TooltipTrigger>
                <TooltipContent>Primary contact for company communications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <Label htmlFor="employeeCount">Employee Count</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="employeeCount"
                    name="employeeCount"
                    type="number"
                    value={form.employeeCount}
                    onChange={handleChange}
                    disabled={!canEdit || !isEditing}
                    aria-label="Employee Count"
                    className={`bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 transition-all duration-150 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 ${isEditing && canEdit ? "shadow-md" : ""}`}
                  />
                </TooltipTrigger>
                <TooltipContent>Approximate number of employees</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {canEdit && (
        <div className="flex justify-end w-full mt-12 gap-3">
          {isEditing ? (
            <>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isLoading || isCreating || saving}
                aria-busy={saving}
                aria-label="Save Profile"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition-transform duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {saving ? <span className="animate-spin mr-2">⏳</span> : null}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                aria-label="Cancel Edit"
                variant="outline"
                className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-semibold px-6 py-2 rounded-lg transition-transform duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
              aria-label="Edit Profile"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition-transform duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Edit Profile
            </Button>
          )}
        </div>
      )}
      {/* Audit trail */}
      {form.updatedBy && (
        <div className="text-xs text-gray-400 mt-4">
          Last updated by {form.updatedBy} on {form.updatedAt}
        </div>
      )}
    </form>
  );
}

function BillingTab() {
  const { data, isLoading, error } = useBillingOverviewQuery();
  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading billing info...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load billing info.
      </div>
    );
  const { subscription, pricingPlan, paymentMethod, invoices } = data || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Subscription</CardTitle>
        <CardDescription>
          Manage your subscription, payment methods, and view billing history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Plan & Status */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-base px-3 py-1">
                {pricingPlan?.name || "-"}
              </Badge>
              <span className={"text-green-600 flex items-center gap-1"}>
                <CheckCircle className="w-4 h-4" />
                {subscription?.status || "-"}
              </span>
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {" "}
              <span className="font-medium">
                {subscription?.trialEndsAt
                  ? new Date(subscription.trialEndsAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>
          <Button variant="outline" className="ml-4" disabled>
            Manage Subscription
          </Button>
        </div>
        {/* Payment Method */}
        <div className="flex items-center gap-4">
          <CreditCard className="w-6 h-6 text-slate-400" />
          <div>
            <div className="font-medium">
              {paymentMethod?.card?.brand?.toUpperCase() || "-"} ••••{" "}
              {paymentMethod?.card?.last4 || "----"}
            </div>
            <div className="text-xs text-slate-500">
              {" "}
              Expires {paymentMethod?.card?.exp_month}/
              {paymentMethod?.card?.exp_year}
            </div>
          </div>
          <Button variant="outline" className="ml-auto" disabled>
            Update Payment Method
          </Button>
        </div>
        {/* Next Invoice */}
        <div className="flex items-center gap-3 text-slate-600">
          <Calendar className="w-5 h-5" />{" "}
          <span className="font-medium">
            {invoices?.[0]?.dueDate
              ? new Date(invoices[0].dueDate).toLocaleDateString()
              : "-"}
          </span>
          <span className="ml-2">
            {invoices?.[0]?.amount
              ? `$${Number(invoices[0].amount).toFixed(2)}`
              : "-"}
          </span>
        </div>
        {/* Billing History */}
        <div>
          <div className="font-semibold mb-2 flex items-center gap-2">
            <Receipt className="w-5 h-5" /> Billing History
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left py-2 pr-4">Invoice</th>
                  <th className="text-left py-2 pr-4">Date</th>
                  <th className="text-left py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.length ? (
                  invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-t">
                      <td className="py-2 pr-4">
                        {inv.stripeInvoiceId || inv.id}
                      </td>
                      <td className="py-2 pr-4">
                        {inv.invoiceDate
                          ? new Date(inv.invoiceDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-2 pr-4">
                        ${Number(inv.amount).toFixed(2)}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{inv.status}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations & API</CardTitle>
        <CardDescription>
          Manage API keys, webhooks, and third-party integrations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 flex items-center gap-2">
          <span className="font-semibold">Coming Soon:</span> Integrations and
          API management will be available in the next version.
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 px-6 py-4 flex justify-end"></CardFooter>
    </Card>
  );
}

function SecurityTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Manage 2FA, password policy, and session management.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 flex items-center gap-2">
          <span className="font-semibold">Coming Soon:</span> Security
          management will be available in the next version.
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 px-6 py-4 flex justify-end"></CardFooter>
    </Card>
  );
}

function GDPRTab({ userRole }: { userRole?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GDPR & Privacy</CardTitle>
        <CardDescription>
          Manage your company's GDPR compliance and privacy settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 flex items-center gap-2">
          <span className="font-semibold">Coming Soon:</span> GDPR and
          privacy management will be available in the next version.
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 px-6 py-4 flex justify-end"></CardFooter>
    </Card>
  );
}

const ALL_TABS = [
  { id: "profile", label: "Profile", icon: User, permission: undefined },
  { id: "billing", label: "Billing", icon: CreditCard, permission: "company.billing" as Permission },
  { id: "gdpr", label: "GDPR & Privacy", icon: FileText, permission: "company.settings" as Permission },
  { id: "sustainability", label: "Sustainability", icon: Leaf, permission: "company.settings" as Permission },
  { id: "integrations", label: "Integrations", icon: Plug, permission: "company.settings" as Permission },
  { id: "security", label: "Security", icon: Shield, permission: "company.settings" as Permission },
];

const TAB_COMPONENTS: Record<string, React.FC> = {
  profile: ProfileTab,
  billing: BillingTab,
  gdpr: GDPRTab,
  integrations: IntegrationsTab,
  security: SecurityTab,
};

const CompanySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { companies, isLoading } = useCompanyQuery();
  const company = companies && companies.length > 0 ? companies[0] : null;
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
      setActiveTab(TABS[0]?.id || "profile");
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
            You do not have permission to view any company settings.
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row">
          {/* Sidebar for desktop */}
          <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col py-12 px-8 sticky top-16 z-20 rounded-xl shadow-sm gap-3">
            <div className="flex items-center gap-3 mb-10">
              {company?.logoUrl ? (
                <Avatar>
                  <AvatarImage src={company.logoUrl} alt={company.name} />
                  <AvatarFallback>{company.name?.[0]}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarFallback>{company?.name?.[0]}</AvatarFallback>
                </Avatar>
              )}
              <span className="font-bold text-lg">{company?.name || "Company"}</span>
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
            <div className="max-w-full md:max-w-3xl mx-auto space-y-8 md:space-y-12">
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Company Settings</h1>
                <p className="text-slate-500 mb-6 md:mb-8">
                  Manage your company’s settings and preferences.
                </p>
                <hr className="my-6 md:my-8" />
                {activeTab === "profile" ? (
                  <ProfileTab userRole={userRole} />
                ) : activeTab === "gdpr" ? (
                  <GDPRTab userRole={userRole} />
                ) : activeTab === "sustainability" ? (
                  <div className="space-y-8 md:space-y-12">
                    <section>
                      <h2 className="text-lg md:text-xl font-semibold mb-4">Sustainability Targets</h2>
                      <SustainabilityTargets />
                    </section>
                  </div>
                ) : (
                  <ActiveComponent />
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;
