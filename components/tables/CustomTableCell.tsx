import React from 'react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const CustomTableCell = ({id, entity}: { id: number, entity: Object  }) => {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <span className="sr-only sm:not-sr-only">...</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuCheckboxItem  onClick={()=> console.log(id)}>
                        <div className={'cursor-pointer text-[#344054]'}>Update</div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem onClick={() => console.log(entity)}>
                        <div className={'cursor-pointer text-[#344054]'}> Delete</div>
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
export default CustomTableCell
