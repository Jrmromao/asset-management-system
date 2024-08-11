import {ColumnDef} from "@tanstack/react-table"
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";


// const navigate = useRouter() ncannot use hook in a non hook component
// export const assetColumns= ({}): ColumnDef<Assets>[] = [
interface AssetColumnsProps {
    onDelete: (value: Kit) => void
    onView: (value: Kit) => void
}
export const kitColumns = ({onDelete, onView}: AssetColumnsProps): ColumnDef<Kit>[] => [
    {
        accessorKey: "name",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        }
    },
    {
        accessorKey: "description",
        header: "Description",
    },

    {
        id: "actions",
        cell: ({row}) => {
            return (
                <DataTableRowActions row={row} onDelete={onDelete} onView={onView}/>
            )
        },
    },
]