import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";

// const navigate = useRouter() cannot use hook in a non hook component
interface PeopleColumnsProps {
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}
export const peopleColumns = ({
  onDelete,
  onView,
}: PeopleColumnsProps): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "roleId",
    header: "Role",
    cell: ({ row }) => {
      return <div>{row.original?.role?.name}</div>;
    },
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "employeeId",
    header: "Employee ID",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const value = new Date(row.getValue("createdAt"));
      const formattedDate = value.toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",

    cell: ({ row }) => {
      const value = new Date(row.getValue("updatedAt"));
      const formattedDate = value.toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions row={row} onDelete={onDelete} onView={onView} />
      );
    },
  },
];
