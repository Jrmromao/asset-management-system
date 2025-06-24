import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cross2Icon,
  PlusCircledIcon,
  ReloadIcon,
  DownloadIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BsPlus } from "react-icons/bs";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  title?: string;
  addNewText?: string;
  onAddNew?: () => void;
  onRefresh?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  filterPlaceholder?: string;
  className?: string;
  hideAddButton?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: { value: string; label: string }[];
  showSearch?: boolean;
  showFilter?: boolean;
  showAddNew?: boolean;
  children?: React.ReactNode;
}

export function DataTableHeader<TData>({
  table,
  title,
  addNewText = "Add New",
  onAddNew,
  onImport,
  onExport,
  isLoading,
  filterPlaceholder = "Filter...",
  className,
  hideAddButton = false,
  onSearch,
  onFilter,
  searchPlaceholder = "Search...",
  filterOptions = [],
  showSearch = true,
  showFilter = true,
  showAddNew = true,
  children,
}: DataTableHeaderProps<TData>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("mb-4", className)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-3">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {showSearch && (() => {
            const nameColumn = table.getColumn("name");
            const titleColumn = table.getColumn("title");
            const searchColumn = nameColumn || titleColumn;
            
            if (!searchColumn) return null;
            
            return (
              <Input
                placeholder={searchPlaceholder}
                value={(searchColumn.getFilterValue() as string) ?? ""}
                onChange={(event) => searchColumn.setFilterValue(event.target.value)}
                className="h-9 w-[150px] lg:w-[250px] dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400"
              />
            );
          })()}
          {(() => {
            const nameColumn = table.getColumn("name");
            const titleColumn = table.getColumn("title");
            const searchColumn = nameColumn || titleColumn;
            const hasFilterValue = searchColumn && Boolean(searchColumn.getFilterValue());
            
            if (!hasFilterValue) return null;
            
            return (
              <Button
                variant="ghost"
                onClick={() => searchColumn?.setFilterValue("")}
                className="h-8 px-2 lg:px-3"
              >
                Reset
                <Cross2Icon className="ml-2 h-4 w-4" />
              </Button>
            );
          })()}
        </div>
        <div className="flex items-center space-x-3">
          {showAddNew && (
            <Button
              variant="outline"
              className="h-9 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              onClick={onAddNew}
              disabled={isLoading}
            >
              <BsPlus className="mr-2 h-4 w-4" />
              {addNewText}
            </Button>
          )}
          {onImport && (
            <Button
              variant="outline"
              className="h-9 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              onClick={onImport}
              disabled={isLoading}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Import
            </Button>
          )}
          {onExport && (
            <Button
              variant="outline"
              className="h-9 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              onClick={onExport}
              disabled={isLoading}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {showFilter && (
        <div className="flex items-center space-x-3 mt-4">
          <Select onValueChange={onFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {children}
    </motion.div>
  );
}

export default DataTableHeader;
