import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TableSkeleton = ({ columns = 4, rows = 5 }) => {
  return (
    <div>
      <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {[...Array(columns)].map((_, i) => (
                <TableHead
                  key={`header-${i}`}
                  className="h-11 px-6 text-xs font-medium text-slate-600 bg-slate-100 border-b border-slate-200"
                >
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {[...Array(rows)].map((_, rowIndex) => (
              <TableRow
                key={`row-${rowIndex}`}
                className="hover:bg-slate-50/80 border-b border-slate-100 last:border-none"
              >
                {[...Array(columns)].map((_, colIndex) => (
                  <TableCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="px-6 py-3 text-sm text-slate-700"
                  >
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4 px-2">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
