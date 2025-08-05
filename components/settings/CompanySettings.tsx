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
  Package,
  Users,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { useCompanyQuery } from "@/hooks/queries/useCompanyQuery";
import { useBillingOverviewQuery } from "@/hooks/queries/useBillingOverviewQuery";
import { toast } from "sonner";
import { hasPermission, Permission } from "@/lib/utils/permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SustainabilityTargets from "@/components/settings/SustainabilityTargets";
import { PurchaseAdditionalItems } from "@/components/billing/PurchaseAdditionalItems";

function ProfileTab({ userRole }: { userRole?: string }) {
  const canEdit = hasPermission(userRole, "company.settings");
  const [isEditing, setIsEditing] = useState(false);
  const { companies, isLoading, error, refresh, updateCompany, isCreating } =
    useCompanyQuery();
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
        updatedAt: company.updatedAt
          ? new Date(company.updatedAt).toLocaleString()
          : "",
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
        if (form.industry !== company.industry)
          updateData.industry = form.industry;
        if (form.website !== company.website) updateData.website = form.website;
        if (form.primaryContactEmail !== company.primaryContactEmail)
          updateData.primaryContactEmail = form.primaryContactEmail;
        if (form.logoUrl !== company.logoUrl) updateData.logoUrl = form.logoUrl;
        if (form.employeeCount !== company.employeeCount)
          updateData.employeeCount = form.employeeCount;
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
                    <SelectTrigger
                      className={`bg-white border border-slate-300 rounded-lg px-3 py-2 mt-1 transition-all duration-150 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100 ${isEditing && canEdit ? "shadow-md" : ""}`}
                    >
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
                <TooltipContent>
                  Industry sector your company operates in
                </TooltipContent>
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
                <TooltipContent>
                  Primary contact for company communications
                </TooltipContent>
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
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading billing information...</p>
        </div>
      </div>
    );

  if (error) {
    console.error("Billing error:", error);
    return (
      <div className="space-y-6">
        <Card className="border-red-100 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              Unable to Load Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              {error.message ||
                "Unable to load your billing information. Please try again later."}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    subscription,
    pricingPlan,
    paymentMethod,
    invoices,
    usage,
    userCount,
    userLimit,
  } = data || {};

  // If no subscription found, show setup message
  if (!subscription) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-100 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <CreditCard className="w-5 h-5" />
              No Active Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-600 mb-4">
              You don&apos;t have an active subscription. Contact your
              administrator to set up billing.
            </p>
            <Button
              variant="outline"
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Contact Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate usage percentages
  const assetUsagePercentage =
    usage?.total && subscription?.assetQuota
      ? (usage.total / subscription.assetQuota) * 100
      : 0;
  const userUsagePercentage =
    userCount && userLimit ? (userCount / userLimit) * 100 : 0;

  // Get user pricing based on plan type
  const getUserPricing = (planType: string): number => {
    switch (planType?.toLowerCase()) {
      case "pro":
        return 10;
      case "enterprise":
        return 8;
      default:
        return 12;
    }
  };

  const pricePerUser = getUserPricing(pricingPlan?.planType);

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Billing
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Manage your subscription and usage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 border-green-200 text-green-700 bg-green-50"
          >
            {subscription?.status || "Active"}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        {/* Main Content - Full Width */}
        <div className="space-y-6">
          {/* Enhanced Current Plan Card */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl text-slate-900">
                    {pricingPlan?.name || "Professional Plan"}
                  </h3>
                  <p className="text-slate-600 text-sm mt-1">
                    {subscription?.billingCycle === "monthly"
                      ? "Monthly billing"
                      : "Annual billing"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={async () => {
                    try {
                      console.log("[Manage Plan] Opening customer portal...");
                      const response = await fetch("/api/billing/manage-plan", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      });

                      console.log(
                        "[Manage Plan] Response status:",
                        response.status,
                      );

                      if (!response.ok) {
                        const errorData = await response.json();
                        console.error("[Manage Plan] API Error:", errorData);

                        // Fallback: Open Stripe Dashboard
                        if (
                          confirm(
                            "Unable to open plan management. Would you like to open Stripe Dashboard instead?",
                          )
                        ) {
                          window.open(
                            "https://dashboard.stripe.com/customers",
                            "_blank",
                          );
                        }
                        return;
                      }

                      const { url } = await response.json();
                      console.log("[Manage Plan] Portal URL:", url);

                      if (url) {
                        window.location.href = url;
                      } else {
                        throw new Error("No portal URL received");
                      }
                    } catch (error) {
                      console.error("Error opening customer portal:", error);

                      // Fallback: Open Stripe Dashboard
                      if (
                        confirm(
                          "Unable to open plan management. Would you like to open Stripe Dashboard instead?",
                        )
                      ) {
                        window.open(
                          "https://dashboard.stripe.com/customers",
                          "_blank",
                        );
                      }
                    }
                  }}
                >
                  Manage Plan
                </Button>
              </div>

              {subscription?.trialEndsAt && (
                <div className="flex items-center gap-3 text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-sm">Trial Period</p>
                    <p className="text-xs text-amber-600">
                      Ends{" "}
                      {new Date(subscription.trialEndsAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Usage Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                Usage Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Assets */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">
                        Assets
                      </span>
                      <p className="text-xs text-slate-500">
                        Tracked in your system
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-900">
                      {usage?.total || 0}
                    </div>
                    <div className="text-xs text-slate-500">
                      of {subscription?.assetQuota || 0} limit
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      assetUsagePercentage > 90
                        ? "bg-red-500"
                        : assetUsagePercentage > 75
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(assetUsagePercentage, 100)}%` }}
                  />
                </div>
                {assetUsagePercentage > 75 && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {assetUsagePercentage > 100
                      ? "Over limit"
                      : "Approaching limit"}
                  </p>
                )}
              </div>

              {/* Users */}
              {userCount !== undefined && userLimit && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          Users
                        </span>
                        <p className="text-xs text-slate-500">
                          Active team members
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-slate-900">
                        {userCount}
                      </div>
                      <div className="text-xs text-slate-500">
                        of {userLimit} limit
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        userUsagePercentage > 90
                          ? "bg-red-500"
                          : userUsagePercentage > 75
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(userUsagePercentage, 100)}%`,
                      }}
                    />
                  </div>
                  {userUsagePercentage > 75 && (
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {userUsagePercentage > 100
                        ? "Over limit"
                        : "Approaching limit"}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Purchase Card */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                Purchase Additional Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showPurchaseForm ? (
                <div className="space-y-4">
                  <PurchaseAdditionalItems
                    currentAssetQuota={subscription.assetQuota}
                    currentUserLimit={userLimit || 0}
                    pricePerAsset={Number(pricingPlan?.pricePerAsset || 0)}
                    pricePerUser={pricePerUser}
                    onSuccess={() => {
                      setShowPurchaseForm(false);
                      window.location.reload();
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowPurchaseForm(false)}
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-6 border border-purple-200 rounded-xl bg-white hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Additional Assets
                        </h4>
                        <p className="text-sm text-slate-600">
                          Expand your capacity
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      ${Number(pricingPlan?.pricePerAsset || 0).toFixed(2)} per
                      asset
                    </p>
                    <Button
                      onClick={() => setShowPurchaseForm(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Purchase Assets
                    </Button>
                  </div>

                  <div className="p-6 border border-purple-200 rounded-xl bg-white hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          Additional Users
                        </h4>
                        <p className="text-sm text-slate-600">Grow your team</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      ${pricePerUser.toFixed(2)} per user
                    </p>
                    <Button
                      onClick={() => setShowPurchaseForm(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Purchase Users
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment & Invoice Section - Full Width Below */}
        <div className="grid gap-6 md:grid-cols-1">
          {/* Next Invoice Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                Next Invoice
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices?.[0] ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div>
                      <p className="text-sm text-amber-700 font-medium">
                        Due Date
                      </p>
                      <p className="text-lg font-semibold text-amber-900">
                        {new Date(invoices[0].dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-amber-700 font-medium">
                        Amount
                      </p>
                      <p className="text-2xl font-bold text-amber-900">
                        ${Number(invoices[0].amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge
                      variant="outline"
                      className="text-xs border-amber-200 text-amber-700"
                    >
                      {invoices[0].status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600">No upcoming invoices</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Billing History */}
      {invoices && invoices.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-900">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-slate-600" />
              </div>
              Billing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 pr-6 font-semibold text-slate-900">
                      Invoice
                    </th>
                    <th className="text-left py-4 pr-6 font-semibold text-slate-900">
                      Date
                    </th>
                    <th className="text-left py-4 pr-6 font-semibold text-slate-900">
                      Amount
                    </th>
                    <th className="text-left py-4 pr-6 font-semibold text-slate-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: any) => (
                    <tr
                      key={inv.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-4 pr-6 font-mono text-xs text-slate-600">
                        {inv.stripeInvoiceId || inv.id}
                      </td>
                      <td className="py-4 pr-6 text-slate-700">
                        {inv.invoiceDate
                          ? new Date(inv.invoiceDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-4 pr-6 font-semibold text-slate-900">
                        ${Number(inv.amount).toFixed(2)}
                      </td>
                      <td className="py-4 pr-6">
                        <Badge
                          variant={
                            inv.status === "paid" ? "default" : "outline"
                          }
                          className={`text-xs ${
                            inv.status === "paid"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "border-slate-200 text-slate-700"
                          }`}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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
          Manage your company&apos;s GDPR compliance and privacy settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 flex items-center gap-2">
          <span className="font-semibold">Coming Soon:</span> GDPR and privacy
          management will be available in the next version.
        </div>
      </CardContent>
      <CardFooter className="border-t bg-slate-50 px-6 py-4 flex justify-end"></CardFooter>
    </Card>
  );
}

const ALL_TABS = [
  { id: "profile", label: "Profile", icon: User, permission: undefined },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    permission: "company.billing" as Permission,
  },
  {
    id: "gdpr",
    label: "GDPR & Privacy",
    icon: FileText,
    permission: "company.settings" as Permission,
  },
  {
    id: "sustainability",
    label: "Sustainability",
    icon: Leaf,
    permission: "company.settings" as Permission,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    permission: "company.settings" as Permission,
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    permission: "company.settings" as Permission,
  },
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
  const TABS = ALL_TABS.filter(
    (tab) => !tab.permission || hasPermission(userRole, tab.permission),
  );

  // If the current activeTab is not allowed, reset to first allowed tab
  useEffect(() => {
    if (!TABS.find((tab) => tab.id === activeTab)) {
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
              <span className="font-bold text-lg">
                {company?.name || "Company"}
              </span>
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
          <main className="flex-1 px-4 py-4 md:px-8 md:py-8">
            <div className="max-w-full mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    Company Settings
                  </h1>
                  <p className="text-slate-600 text-base">
                    Manage your company&apos;s settings and preferences.
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-8">
                  {activeTab === "profile" ? (
                    <ProfileTab userRole={userRole} />
                  ) : activeTab === "gdpr" ? (
                    <GDPRTab userRole={userRole} />
                  ) : activeTab === "sustainability" ? (
                    <div className="space-y-8">
                      <section>
                        <h2 className="text-xl font-semibold text-slate-900 mb-6">
                          Sustainability Targets
                        </h2>
                        <SustainabilityTargets />
                      </section>
                    </div>
                  ) : (
                    <ActiveComponent />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;
