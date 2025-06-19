import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { filterColumns, formatDateTime, renameColumns } from "@/lib/utils";
import React from "react";
import { useRouter } from "next/navigation";

const CustomAssetTable = ({
  licenses,
  deleteCategory,
  setRefresh,
}: CategoryTableProps) => {
  const columnMappings: Record<keyof Category, string> = {
    note: "Note",
    name: "Name",
    id: "id",
    createdAt: "Created At",
    updatedAt: "updatedAt",
    active: "Active",
  };
  const navigate = useRouter();
  const filteredData = filterColumns(licenses, ["id", "updatedAt"]);
  const renamedData = renameColumns(filteredData, columnMappings);
  if (renamedData.length === 0) return <p>No assets found</p>;
  const headers = Object.keys(renamedData[0]);
  return (
    <Table>
      <TableHeader className="bg-[#f9fafb]">
        <TableRow>
          {headers.map((name) => {
            return (
              <TableHead key={name} className="px-2">
                {name}
              </TableHead>
            );
          })}
          <TableHead className="px-2"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {licenses?.map((category: Category) => {
          const createdAt = formatDateTime(category.createdAt!);
          return (
            <TableRow
              key={category.id}
              className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT`}
            >
              <TableCell className="pl-2 pr-10">{category.name}</TableCell>

              <TableCell className="pl-2 pr-10 capitalize min-w-24">
                {createdAt.dateTime}
              </TableCell>

              <TableCell className="pl-2 pr-10 capitalize min-w-24">
                <button
                  className="mr-2 text-blue-600 hover:underline"
                  onClick={() => navigate.push(`/assets/view/${category.id}`)}
                >
                  View
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => deleteCategory(category.id)}
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default CustomAssetTable;
