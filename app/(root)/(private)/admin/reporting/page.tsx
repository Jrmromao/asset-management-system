import { BarChart, DollarSign, Activity, Shield } from "lucide-react";
import { ReportCategoryCard } from "@/components/reports/ReportCategoryCard";

export default function ReportingPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reporting Hub</h1>
      </div>
      <p className="text-gray-600">
        Generate and view detailed reports on your asset portfolio.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCategoryCard
          icon={<BarChart className="h-8 w-8 text-emerald-600" />}
          title="ESG & Environmental Reports"
          description="Track CO₂ emissions, energy consumption, and asset lifecycle sustainability."
          link="/admin/reporting/esg"
        />
        <ReportCategoryCard
          icon={<DollarSign className="h-8 w-8 text-blue-600" />}
          title="Financial Reports"
          description="Analyze depreciation, total cost of ownership (TCO), and asset valuation."
          link="/admin/reporting/financial"
        />
        <ReportCategoryCard
          icon={<Activity className="h-8 w-8 text-amber-600" />}
          title="Operational Reports"
          description="View maintenance history, asset utilization, and check-in/out audits."
          link="/admin/reporting/operational"
        />
        <ReportCategoryCard
          icon={<Shield className="h-8 w-8 text-red-600" />}
          title="Compliance Reports"
          description="Monitor license compliance and warranty expirations."
          link="/admin/reporting/compliance"
        />
      </div>
    </div>
  );
} 