import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {filterColumns, formatDateTime, renameColumns} from "@/lib/utils";
import CustomTableCell from "@/components/tables/CustomTableCell";
import React from "react";
import {licenseStore} from "@/lib/stores/store";
import {getLicenses, create, remove, findById} from "@/lib/actions/license.actions";


const LicensesTable = ({licenses = []}: LicenseTableProps) => {


    const columnMappings: { createdAt: string; name: string; id: string; key: string; updatedAt: string , issuedDate: string, expirationDate: string, userId: string} = {
        key: 'Key',
        name: 'Name',
        userId: 'User Id',
        id: "id",
        issuedDate: "Issued Date",
        expirationDate: "Expiration Date",
        createdAt: "Created At",
        updatedAt: "updatedAt"
    };
    const filteredData = filterColumns(licenses, ['id', 'updatedAt']);
    const renamedData = renameColumns(filteredData, columnMappings);
    const refresh = licenseStore((state) => state.shouldRefresh)


    if (renamedData.length === 0) return <p>No assets found</p>
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

                {licenses?.map((license: LicenseType) => {
                    const createdAt = formatDateTime(license.createdAt!);
                    return (
                        <TableRow key={license.id} className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT`}>

                            <TableCell className="pl-2 pr-10">
                                {license.name}
                            </TableCell>

                            <TableCell className="min-w-32 pl-2 pr-10">
                                {license.key}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                {license.issuedDate.toString()}
                            </TableCell>
                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                {license.expirationDate.toString()}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                userID
                            </TableCell>
                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                created at
                            </TableCell>
                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                <CustomTableCell id={Number(license.id)} entity={license} deleteEntity={remove} updateEntity={() => {}} viewEntity={findById}/>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>


    )
}

export default LicensesTable