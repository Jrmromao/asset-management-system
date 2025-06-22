import { CO2FootprintDashboard } from "@/components/dashboard/CO2FootprintDashboard";
import { withAuth } from "@/lib/middleware/withAuth";

export default function CO2FootprintPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">CO2 Footprint Dashboard</h1>
        <p className="text-muted-foreground">
          Track and analyze the environmental impact of your assets
        </p>
      </div>
      
      <CO2FootprintDashboard companyId="cmc80pcez00048oa5v3px063c" />
    </div>
  );
} 