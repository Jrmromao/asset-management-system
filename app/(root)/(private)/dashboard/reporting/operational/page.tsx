import { DashboardHeader } from "@/components/dashboard/Header";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";

export default function OperationalReportsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Operational Reports</h1>
      </div>
      <p className="text-gray-600">
        Analyze maintenance history, asset utilization, and check-in/out audits.
      </p>

      <div className="space-y-8">
        {/* Section for Maintenance Reports */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Log a New Maintenance Event
          </h2>
          <div className="p-8 border rounded-lg">
            <MaintenanceForm />
          </div>
        </section>

        {/* Section for Utilization Reports */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Asset Utilization</h2>
          <div className="p-8 border-dashed border-2 border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">
              Utilization reporting components will be here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
