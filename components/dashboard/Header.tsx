import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const DashboardHeader = () => {
  const navigate = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">
          Asset Management
        </h1>
        {/*<Badge*/}
        {/*  variant="secondary"*/}
        {/*  className="bg-emerald-50 text-emerald-600 border-0"*/}
        {/*>*/}
        {/*  Environment Tracking Active*/}
        {/*</Badge>*/}
      </div>
      <div className="flex gap-2">
        {/*<Button variant="outline" size="sm">*/}
        {/*  <FileText className="h-4 w-4 mr-2" />*/}
        {/*  Export*/}
        {/*</Button>*/}
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => navigate.push("/assets/create")}
        >
          <PlusCircle className="h-4 w-4 mr-2 text-white" />
          Add Asset
        </Button>
      </div>
    </div>
  );
};
