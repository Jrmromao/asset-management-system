// components/AssetFilters.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { AssetFilter } from "@/utils/utils";

interface AssetFiltersProps {
  onFilterChange: (filters: AssetFilter) => void;
}

export const AssetFilters = ({
  onFilterChange,
}: AssetFiltersProps): JSX.Element => {
  const [filters, setFilters] = useState<AssetFilter>({
    search: "",
    type: [],
    status: [],
    lifecycle: [],
  });

  const handleFilterChange = (newFilters: Partial<AssetFilter>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search assets..."
          className="w-full"
          // prefix={<Search className="h-4 w-4 text-gray-400" />}
          value={filters.search}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* Type filters */}
          {["Laptop", "Monitor", "Mobile"].map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={filters.type.includes(type)}
              onCheckedChange={(checked) => {
                handleFilterChange({
                  type: checked
                    ? [...filters.type, type]
                    : filters.type.filter((t) => t !== type),
                });
              }}
            >
              {type}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
