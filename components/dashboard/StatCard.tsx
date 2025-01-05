import { StatCardProps } from "@/components/dashboard/types/dashboard";

export const StatCard = ({
  title,
  mainValue,
  subValue,
  subtitle,
  icon,
}: StatCardProps): JSX.Element => {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{mainValue}</span>
        {subValue && <span className="text-gray-400">{subValue}</span>}
      </div>
      <span className="text-xs text-emerald-600 mt-1 block">{subtitle}</span>
    </div>
  );
};
