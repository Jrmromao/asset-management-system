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
export type License = {
    id?: number;
    name: string;
    licenseKey: string;
    renewalDate: Date;
    licenseUrl?: string;
    licensedEmail: string;
    purchaseDate: Date;
    vendor: string;
    purchaseNotes: string;
    minCopiesAlert: number;
    alertRenewalDays: number;
    licenseCopiesCount: number;
    purchasePrice: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// const navigate = useRouter() ncannot use hook in a non hook component
export const licenseColumns: ColumnDef<License>[] = [
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
        accessorKey: "licenseKey",
        header: "Key",
        cell: ({row}) => {
            const value = row.getValue('model')
            const asset = row.original
            return <LinkTableCell value={value as string} navigateTo={`/assets/view/?id=${asset.id}`}/>
        }
    },
    {
        accessorKey: "licensedEmail",
        header: "Licensed Email",
        cell: ({row}) => {
            const asset = row.original
            return (<div className={'cursor-pointer'}><LinkTableCell value={''} navigateTo={`/assets/view/?id=${asset.id}`}/></div>)
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


