"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Button} from "@/components/ui/button";
import {ArrowUpDown} from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React from "react";
import CustomTableCell from "@/components/tables/CustomTableCell";
import {TableCell} from "@/components/ui/table";

import {useAssetStore} from "@/lib/stores/assetStore";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Assets = {
    id?: number;
    title: string;
    purchaseDate: Date;
    vendor: string;
    alertEmail: string
    minQuantityAlert: number
    totalQuantityCount: number
    description: string;
    categoryId: number;
    companyId: number;
}

// const navigate = useRouter() ncannot use hook in a non hook component
export const accessoriesColumns: ColumnDef<Assets>[] = [
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
    {
        accessorKey: "purchaseDate",
        header: "Purchase Date",
    },
    {
        accessorKey: "datePurchased",
        header: "Date Purchased",
        cell: ({row}) => {
            const asset = row.original
            return (<div className={'cursor-pointer'}><LinkTableCell value={''} navigateTo={`/assets/view/?id=${asset.id}`}/></div>)
        }
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({row}) => {
            const value = row.getValue('price')
            const asset = row.original
            return <LinkTableCell value={value as string} navigateTo={`/assets/view/?id=${asset.id}`}/>
        }

    },
    {
        id: "actions",
        cell: ({row}) => {

            const asset = row.original
            const [deleteAsset] = useAssetStore((state) => [state.delete]);
            return (
                <TableCell className=" cusor-pointer pl-2 pr-10 capitalize min-w-24">
                    <CustomTableCell id={asset.id!} entity={asset}
                                     deleteEntity={() => deleteAsset(asset.id!)}
                                     setRefresh={(flag: boolean) => console.log(flag)}
                                     updateEntity={() => {
                                     }}
                                     viewPath={`/assets/view/?id=${asset.id}`}/>
                </TableCell>
            )
        },
    },
]



