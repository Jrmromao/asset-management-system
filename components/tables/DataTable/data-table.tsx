"use client";
import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import TableSkeleton from "@/components/tables/TableSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pageIndex?: number;
  pageSize?: number;
  total?: number;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pageIndex = 0,
  pageSize = 10,
  total = 0,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize });
        onPaginationChange?.(next);
      } else {
        onPaginationChange?.(updater);
      }
    },
    autoResetPageIndex: false,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;

  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 px-6 text-xs font-medium text-slate-600 dark:text-gray-300 bg-slate-100 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700"
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-900">
            {hasRows ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800 last:border-none"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-3 text-sm text-slate-700 dark:text-gray-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-slate-600 dark:text-gray-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {hasRows ? (
          rows.map((row) => (
            <Card
              key={row.id}
              className="p-4 bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className="space-y-3">
                {row.getVisibleCells().map((cell) => {
                  const header = cell.column.columnDef.header;
                  const headerText =
                    typeof header === "function"
                      ? String(cell.column.id)
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())
                      : header;
                  return (
                    <div
                      key={cell.id}
                      className="flex justify-between items-center gap-2"
                    >
                      <span className="text-xs font-medium text-slate-600 dark:text-gray-400">
                        {headerText}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-gray-300 text-right">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center text-sm text-slate-600 dark:text-gray-400 py-8">
            No results.
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between py-4 px-2 gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-slate-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPaginationChange?.({ pageIndex, pageSize: Number(value) })}
            >
              <SelectTrigger className="h-8 w-16 border-slate-200 dark:border-gray-700 dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            Page {pageIndex + 1} of {Math.max(1, Math.ceil(total / pageSize))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange?.({ pageIndex: Math.max(0, pageIndex - 1), pageSize })}
            disabled={pageIndex === 0}
            className="h-8 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Go to previous page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange?.({ pageIndex: pageIndex + 1, pageSize })}
            disabled={pageIndex + 1 >= Math.ceil(total / pageSize)}
            className="h-8 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Go to next page</span>
          </Button>
        </div>
      </div>

      {total > 0 && onPaginationChange && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
                          <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPaginationChange?.({ pageIndex, pageSize: Number(value) })}
            >
                <SelectTrigger className="h-8 w-16 border-slate-200 dark:border-gray-700 dark:bg-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
