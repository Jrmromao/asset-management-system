import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {filterColumns, formatDateTime, renameColumns} from "@/lib/utils"
import React, {useState} from "react";
import CustomTableCell from "@/components/tables/CustomTableCell";
import {useRouter} from "next/navigation";
import LinkTableCell from "@/components/tables/LinkTableCell";


const AssetTable = ({assets, findById, deleteAsset}: AssetTableProps) => {

    const navigate = useRouter()
    const columnMappings: Record<keyof Asset, string> = {
        categoryId: "categoryId",
        datePurchased: "Date Purchased",
        serialNumber: "Serial Number",
        name: "Asset Title",
        purchasePrice: "Purchase price",
        id: "id",
        createdAt: "Created At",
        updatedAt: "updatedAt",
        assigneeId: "assigneeId",
        certificateUrl: "certificateUrl",
        licenceUrl: "licenceUrl",
        model: "Model",
        brand: "Brand",
        category: "Category",
        license: "",
        licenseId: "",
        price: "Price",
        statusLabel: "Status Label",
        statusLabelId: ""
    };

    const filteredData = filterColumns(assets, ['id', 'updatedAt', 'categoryId', 'datePurchased', 'certificateUrl', 'assigneeId', 'purchasePrice', 'licenceUrl', 'licenseId', "license", "statusLabelId"]);
    const renamedData = renameColumns(filteredData, columnMappings);
    if (renamedData?.length === 0) return <p>No assets found</p>

    const headers = renamedData?.length > 0 ? Object?.keys(renamedData[0]) : []

    return (
        <div>
            <Table>
                <TableHeader className="bg-[#f9fafb]">
                    <TableRow>
                        {/*<TableHead className="px-2"></TableHead>*/}
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
                            <TableRow key={asset.id}
                                      className={`cursor-pointer bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT border-b-[1px]`}>
                                <LinkTableCell value={asset?.name} navigateTo={`/assets/view/?id=${asset.id}`}/>
                                <LinkTableCell value={asset?.price} navigateTo={`/assets/view/?id=${asset.id}`}/>
                                <LinkTableCell value={asset?.createdAt?.toString().split('T')[0]}
                                               navigateTo={`/assets/view/?id=${asset.id}`}/>
                                <LinkTableCell value={asset?.brand} navigateTo={`/assets/view/?id=${asset.id}`}/>
                                <LinkTableCell value={asset?.model} navigateTo={`/assets/view/?id=${asset.id}`}/>
                                <LinkTableCell value={asset?.serialNumber} navigateTo={`/assets/view/?id=${asset.id}`}/>
                                <LinkTableCell value={asset?.category?.name}
                                               navigateTo={`/assets/view/?id=${asset.id}`}/>


                                <LinkTableCell value={asset?.statusLabel?.name} label={asset?.statusLabel}/>


                                <TableCell className=" cusor-pointer pl-2 pr-10 capitalize min-w-24">
                                    <CustomTableCell id={asset.id!} entity={asset}
                                                     deleteEntity={() => deleteAsset(asset.id!)}
                                                     setRefresh={(flag: boolean) => console.log(flag)}
                                                     updateEntity={() => {
                                                     }}
                                                     viewEntity={() => {
                                                         navigate.push(`/assets/view/?id=${asset.id}`)
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

export default AssetTable