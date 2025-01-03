import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

interface TableHeaderProps {
  onSearch: (value: string) => void;
  onFilter: () => void;
  onImport: () => void;
  onCreateNew: () => void;
}

export function TableHeader({
  onSearch,
  onFilter,
  onImport,
  onCreateNew,
}: TableHeaderProps) {
  return (
    <div className="space-y-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search..."
            className="h-10 w-full rounded-md border border-gray-200 pl-10 pr-4 text-sm shadow-sm focus:border-gray-300 focus:ring-0"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onFilter}
            className="h-10 px-4 shadow-sm border-gray-200 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            onClick={onImport}
            className="h-10 px-4 shadow-sm border-gray-200 hover:bg-gray-50"
          >
            Import
          </Button>
          <Button
            onClick={onCreateNew}
            className="h-10 px-4 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Create New
          </Button>
        </div>
      </div>
    </div>
  );
}
