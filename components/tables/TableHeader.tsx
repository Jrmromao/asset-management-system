import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Import, Plus, Search, Download } from "lucide-react";
import React from "react";

interface TableHeaderProps {
  onSearch?: (value: string) => void;
  onFilter?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onCreateNew?: () => void;
}

export const TableHeader = ({
  onSearch,
  onFilter,
  onImport,
  onExport,
  onCreateNew,
}: TableHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {onSearch && (
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        {onFilter && (
          <Button
            variant="outline"
            size="icon"
            onClick={onFilter}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onExport && (
          <Button
            variant="outline"
            onClick={onExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
        {onImport && (
          <Button
            variant="outline"
            onClick={onImport}
            className="flex items-center gap-2"
          >
            <Import className="h-4 w-4" />
            Import
          </Button>
        )}
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        )}
      </div>
    </div>
  );
};
