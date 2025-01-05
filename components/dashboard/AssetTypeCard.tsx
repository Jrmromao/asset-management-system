import { Badge } from "@/components/ui/badge";
import { AssetTypeCardProps } from "@/components/dashboard/types/dashboard";

export const AssetTypeCard = ({
  icon,
  name,
  devices,
  usage,
  status,
}: AssetTypeCardProps): JSX.Element => {
  const statusColors: Record<AssetTypeCardProps["status"], string> = {
    Healthy: "text-emerald-600 bg-emerald-50",
    Warning: "text-amber-600 bg-amber-50",
    Critical: "text-red-600 bg-red-50",
  };

  const getProgressColor = (status: AssetTypeCardProps["status"]) => {
    switch (status) {
      case "Healthy":
        return "bg-emerald-600";
      case "Warning":
        return "bg-amber-600";
      case "Critical":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-gray-50 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-gray-500">{devices} devices</p>
          </div>
        </div>
        <Badge className={statusColors[status]}>{status}</Badge>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Usage</span>
          <span className="font-medium">{usage}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(status)} transition-all`}
            style={{ width: `${usage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
