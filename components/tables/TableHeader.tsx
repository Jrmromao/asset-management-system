import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cross2Icon, PlusCircledIcon, ReloadIcon, DownloadIcon, UploadIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
}

export function DataTableHeader<TData>({
  table,
  title,
  addNewText = "Add New",
  onAddNew,
  onRefresh,
  onImport,
  onExport,
  isLoading,
  filterPlaceholder = "Filter...",
  className,
  hideAddButton = false,
}: DataTableHeaderProps<TData>) {
  const globalFilter = table.getColumn("globalFilter")?.getFilterValue() as string;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-col space-y-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0", 
        className
      )}
    >
      <div className="flex items-center space-x-2">
        {title && (
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        )}
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <ReloadIcon className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder={filterPlaceholder ?? "Filter..."}
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-9 w-[150px] lg:w-[250px] dark:bg-gray-800 dark:border-gray-700 dark:placeholder-gray-400"
          />
          {Boolean(table.getColumn("name")?.getFilterValue()) && (
            <Button
              variant="ghost"
              onClick={() => table.getColumn("name")?.setFilterValue("")}
              className="h-9 px-2 lg:px-3 dark:hover:bg-gray-800"
            >
              <Cross2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!hideAddButton && (
            <Button
              variant="outline"
              className="h-9 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              onClick={onAddNew}
              disabled={isLoading}
            >
              <PlusCircledIcon className="mr-2 h-4 w-4" />
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
          {onRefresh && (
            <Button
              variant="outline"
              className="h-9 px-2 lg:px-3 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <ReloadIcon className={cn("h-4 w-4", { "animate-spin": isLoading })} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
