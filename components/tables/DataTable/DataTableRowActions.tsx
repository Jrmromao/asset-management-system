import React from 'react'
import {Row} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


interface DataTableRowActionsProps<TData>{
    row: Row<TData>
    onView: (value: TData) => void
    onDelete: (value: TData) => void
}
const DataTableRowActions = <TData,>({row, onView, onDelete}: DataTableRowActionsProps<TData>) => {
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <span className="cusor-pointer sr-only sm:not-sr-only">...</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuCheckboxItem onClick={() => onDelete(row.original)}>
                        <div className={'cursor-pointer text-[#344054]'}> Delete</div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem  onClick={()=> onView(row.original)}>
                        <div className={'cursor-pointer text-[#344054]'}>View</div>
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </div>
    )
}

export default DataTableRowActions
