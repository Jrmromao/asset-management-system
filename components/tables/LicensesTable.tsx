import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {filterColumns, formatDateTime, renameColumns} from "@/lib/utils";
import CustomTableCell from "@/components/tables/CustomTableCell";
import React, {useEffect} from "react";
import {licenseStore} from "@/lib/stores/store";
import {findById} from "@/lib/actions/license.actions";
import LinkTableCell from "@/components/tables/LinkTableCell";
import {useLicenseStore} from "@/lib/stores/licenseStore";


const LicensesTable = () => {


    const columnMappings: Record<keyof License, string> = {
        id: 'ID',
        name: 'License Name',
        licenseKey: 'License Key',
        renewalDate: 'Renewal Date',
        licenseUrl: 'License Url',
        licensedEmail: 'Licensed Email',
        purchaseDate: 'Purchase Date',
        vendor: 'Vendor',
        purchaseNotes: 'Purchase Notes',
        minCopiesAlert: 'Min Copies Alert',
        alertRenewalDays: 'Alert Renewal Days',
        licenseCopiesCount: '# Copies',
        purchasePrice: 'Purchase Price',
        createdAt: "",
        updatedAt: "",
    };
    const [licenses] = useLicenseStore((state) => [state.licenses, state.getAll])
    // @ts-ignore
    const filteredData = filterColumns(licenses, ['id', 'userId', 'updatedAt', 'createdAt', 'licenseUrl', 'purchasePrice', 'alertRenewalDays', 'purchaseNotes', 'minCopiesAlert']);
    const renamedData = renameColumns(filteredData, columnMappings);

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

                {licenses?.map((license: License) => {
                    const createdAt = formatDateTime(license.createdAt!);
                    return (
                        <TableRow key={license.id} className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT`}>
                            <LinkTableCell navigateTo={'/licenses/' + license.id} value={license?.name}/>
                            <LinkTableCell navigateTo={'/licenses/' + license.id} value={license?.licenseCopiesCount}/>
                            <LinkTableCell navigateTo={'/licenses/' + license.id} value={license?.licensedEmail}/>
                            <LinkTableCell navigateTo={'/licenses/' + license.id} value={license?.renewalDate?.toString().split('T')[0]}/>
                            <LinkTableCell navigateTo={'/licenses/' + license.id}
                                           value={license?.vendor}/>
                            <LinkTableCell navigateTo={'/licenses/' + license.id} value={license?.licenseKey}/>
                            <LinkTableCell navigateTo={'/licenses/' + license.id} value={license?.purchaseDate?.toString().split('T')[0]}/>
                            <TableCell className="pl-2 pr-10 capitalize min-w-24">

                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>


    )
}

export default LicensesTable