import {ColumnDef} from "@tanstack/react-table"
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";


// const navigate = useRouter() ncannot use hook in a non hook component
interface AssetColumnsProps {
    onDelete: (value: Asset) => void
    onView: (value: Asset) => void
}
export const assetColumns = ({onDelete, onView}: AssetColumnsProps): ColumnDef<Asset>[] => [
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
        accessorKey: "brand",
        header: "Brand",
    },
    {
        accessorKey: "model",
        header: "Model",
        cell: ({row}) => {
            const value = row.getValue('model')
            const asset = row.original
            return <LinkTableCell value={value as string} navigateTo={`/assets/view/?id=${asset.id}`}/>
        }
    },
    {
        accessorKey: "datePurchased",
        header: "Date Purchased",
        cell: ({row}) => {
            const asset = row.original
            return (<div className={'cursor-pointer'}><LinkTableCell value={''}
                                                                     navigateTo={`/assets/view/?id=${asset.id}`}/>
            </div>)
        }
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({row}) => {
            const value = row.getValue('price')
            const asset = row.original
            return <LinkTableCell value={value as string} navigateTo={`/assets/view/?id=${asset.id}`}/>
        }

    },
    {
        accessorKey: "serialNumber",
        header: "Serial Number",
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({row}) => {
            const value = row.getValue('category') as Category
            return <div>{value?.name}</div>
        }
    },
    {
        accessorKey: "statusLabel",
        header: "Status",
        cell: ({row}) => {
            const value = row.getValue('statusLabel') as StatusLabel
            return <LinkTableCell value={value?.name} label={value} navigateTo={`#`}/>
        }
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({row}) => {
            const value = new Date(row.getValue('updatedAt'))
            const formattedDate = value.toLocaleDateString()
            return <div>{formattedDate}</div>
        }
    },
    {
        accessorKey: "updatedAt",
        header: "Last Updated",

        cell: ({row}) => {
            const value = new Date(row.getValue('updatedAt'))
            const formattedDate = value.toLocaleDateString()
            return <div>{formattedDate}</div>
        }
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