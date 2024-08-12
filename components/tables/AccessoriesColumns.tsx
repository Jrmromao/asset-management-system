"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";
import CustomTableCell from "@/components/tables/CustomTableCell";
import {TableCell} from "@/components/ui/table";

import {useAssetStore} from "@/lib/stores/assetStore";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";

interface AccessoriesColumnsProps {
    onDelete: (value: Accessory) => void
    onView: (value: Accessory) => void
}

export interface Accessory {
    id: number,
    title: string,
    createdAt: Date,
    updatedAt: Date,
    datePurchased: Date,
    vendor: string,
    description: string
    alertEmail: string
    totalQuantityCount: number
    minQuantityAlert: number
}

// const navigate = useRouter() ncannot use hook in a non hook component
export const accessoriesColumns = ({onDelete, onView}: AccessoriesColumnsProps): ColumnDef<Accessory>[] => [
    {
        accessorKey: "title",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        }
    },
    // createdAt, updatedAt
    {
        accessorKey: "createdAt",
        header: "Created At",
    },
    {
        accessorKey: "updatedAt",
        header: "Updated At",
    },
    {
        accessorKey: "datePurchased",
        header: "Date Purchased",
        cell: ({row}) => {
            const accessory = row.original
            return (<div className={'cursor-pointer'}><LinkTableCell value={'Now'}
                                                                     navigateTo={`/accessories/view/?id=${accessory.id}`}/>
            </div>)
        }
    },
    {
        accessorKey: "vendor",
        header: "Vendor",
        cell: ({row}) => {
            const accessory = row.original
            return <LinkTableCell value={accessory.vendor} navigateTo={`/accessories/view/?id=${accessory.id}`}/>
        }
    },
    {
        accessorKey: "alertEmail",
        header: "Alert Email",
        cell: ({row}) => {
            const accessory = row.original
            return <LinkTableCell value={accessory.alertEmail} navigateTo={`/accessories/view/?id=${accessory.id}`}/>
        }
    },
    {
        accessorKey: "minQuantityAlert",
        header: "Min Quantity Alert",
        cell: ({row}) => {
            const accessory = row.original
            return <LinkTableCell value={accessory.minQuantityAlert}
                                  navigateTo={`/accessories/view/?id=${accessory.id}`}/>
        }
    },
    {
        accessorKey: "totalQuantityCount",
        header: "Total Quantity Count",
        cell: ({row}) => {
            const accessory = row.original
            return <LinkTableCell value={accessory.totalQuantityCount}
                                  navigateTo={`/accessories/view/?id=${accessory.id}`}/>
        }
    },
    {
        accessorKey: "description",
        header: "Note",
        cell: ({row}) => {
            const value = row.getValue('price')
            const accessory = row.original
            return <LinkTableCell value={value as string} navigateTo={`/accessories/view/?id=${accessory.id}`}/>
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



