import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {filterColumns, formatDateTime, renameColumns} from "@/lib/utils"
import React from "react";
import CustomTableCell from "@/components/tables/CustomTableCell";
import {useRouter} from "next/navigation";


const CustomAssetTable = ({assets, findById}: AssetTableProps) => {

    const navigate = useRouter()
    const columnMappings: Record<keyof Asset, string> = {
        categoryId: "categoryId",
        datePurchased: "Date Purchased",
        location: "location",
        name: "name",
        price: "Price",
        purchasePrice: "Price",
        status: "Status",
        id: "id",
        description: "description",
        createdAt: "Created At",
        updatedAt: "updatedAt",
        userId: "userId",
        image: ""
    };
    const filteredData = filterColumns(assets, ['id', 'updatedAt', 'categoryId', 'datePurchased', 'userId', 'purchasePrice', 'description']);

    const renamedData = renameColumns(filteredData, columnMappings);
    if (renamedData.length === 0) return <p>No assets found</p>
    const headers = Object?.keys(renamedData[0])




    return (
        <div>
            <Table>
                <TableHeader className="bg-[#f9fafb]">
                    <TableRow>
                        <TableHead className="px-2"></TableHead>
                        {headers.map(name => {
                            return (
                                <TableHead key={name} className="px-2">{name}</TableHead>
                            )
                        })}
                        <TableHead className="px-2"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assets?.map((asset: Asset) => {
                        return (
                            <TableRow key={asset.id} onClick={() => { navigate.push(`/assets/view/?id=${asset.id}`)}
                            }
                                      className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT border-b-[1px]`}>
                                <TableCell>
                                    {asset.image}
                                </TableCell>
                                <TableCell className="pl-2 pr-10">
                                    {asset.name}
                                </TableCell>
                                <TableCell className="min-w-32 pl-2 pr-10">
                                    {asset.price}
                                </TableCell>
                                <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                    {formatDateTime(asset.createdAt!).dateTime}
                                </TableCell>
                                <TableCell className="pl-2 pr-10 capitalize min-w-24">

                                    <CustomTableCell id={asset.id!} entity={asset} deleteEntity={() => {
                                    }} updateEntity={() => {
                                    }} viewEntity={() => {
                                    }}/>
                                </TableCell>

                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>


        </div>
    )
}

export default CustomAssetTable