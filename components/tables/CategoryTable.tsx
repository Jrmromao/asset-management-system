import {
    Table,
    TableBody,
    TableCaption,
    TableCell, TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {filterColumns, formatDateTime, renameColumns} from "@/lib/utils";
import CustomTableCell from "@/components/tables/CustomTableCell";
import React, {useMemo} from "react";
import {get} from "@/lib/actions/assets.actions";


const CustomAssetTable = ({licenses}: CategoryTableProps) => {

    const invoices = [
        {
            invoice: "INV001",
            paymentStatus: "Paid",
            totalAmount: "$250.00",
            paymentMethod: "Credit Card",
        },
        {
            invoice: "INV002",
            paymentStatus: "Pending",
            totalAmount: "$150.00",
            paymentMethod: "PayPal",
        },
        {
            invoice: "INV003",
            paymentStatus: "Unpaid",
            totalAmount: "$350.00",
            paymentMethod: "Bank Transfer",
        },
        {
            invoice: "INV004",
            paymentStatus: "Paid",
            totalAmount: "$450.00",
            paymentMethod: "Credit Card",
        },
        {
            invoice: "INV005",
            paymentStatus: "Paid",
            totalAmount: "$550.00",
            paymentMethod: "PayPal",
        },
        {
            invoice: "INV006",
            paymentStatus: "Pending",
            totalAmount: "$200.00",
            paymentMethod: "Bank Transfer",
        },
        {
            invoice: "INV007",
            paymentStatus: "Unpaid",
            totalAmount: "$300.00",
            paymentMethod: "Credit Card",
        },
    ]


    const columnMappings: Record<keyof Category, string> = {
        note: "Note",
        name: 'Name',
        id: "id",
        createdAt: "Created At",
        updatedAt: "updatedAt"
    };
    const filteredData = filterColumns(licenses, ['id', 'updatedAt']);
    const renamedData = renameColumns(filteredData, columnMappings);
    if(renamedData.length === 0) return <p>No assets found</p>
    const headers = Object.keys(renamedData[0])
    return (

        <Table>
            <TableHeader className="bg-[#f9fafb]">
                <TableRow>
                    {headers.map(name => {
                        return (
                            <TableHead key={name} className="px-2">{name}</TableHead>
                        )
                    })}
                    <TableHead className="px-2"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>

                {licenses?.map((category: Category) => {
                    const createdAt = formatDateTime(category.createdAt!);
                    return (
                        <TableRow key={category.id} className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT`}>

                            <TableCell className="pl-2 pr-10">
                                {category.name}
                            </TableCell>

                            <TableCell className="min-w-32 pl-2 pr-10">
                                {category.note}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                {createdAt.dateTime}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                <CustomTableCell id={Number(category.id)} entity={category} />
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>



    )
}

export default CustomAssetTable