import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  mainValue: string | number;
  subValue?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

export const StatCard = ({ 
  title, 
  mainValue, 
  subValue, 
  subtitle, 
  icon,
  tooltip 
}: StatCardProps) => {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold">{mainValue}</div>
          {subValue && (
            <div className="text-sm text-muted-foreground">{subValue}</div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
