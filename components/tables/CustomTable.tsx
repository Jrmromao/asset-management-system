import React, {FC} from 'react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {formatDateTime} from "@/lib/utils";
import LEGACY_CustomTableCell from "@/components/tables/LEGACY_CustomTableCell";
import Column from "@/components/tables/Column";


interface IProps {
    data: Object[]
    columns: Object[]
    navigate: any
    rowClick: (e: any, row: any) => void
    headers: string[]
}

const CustomTable: FC<IProps> = ({data: data, navigate, rowClick, columns, headers}) => {
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
            {(data || []).map((row, rowIndex) => {
                {
                    console.log(columns)}

                return (
                    <TableRow

                        key={rowIndex}
                        onClick={(e) => rowClick(e, row)}
                    >
                        {columns.map((column, columnIndex) => (
                            <Column
                                key={columnIndex}
                                rowIndex={rowIndex}
                                column={column}
                                row={row}
                            />
                        ))}
                    </TableRow>
                )
            })}
            </TableBody>
      </Table>
        </div>
    )
}
export default CustomTable
