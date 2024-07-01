import React from 'react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const CustomTableCell = ({id, entity, deleteEntity, updateEntity, viewEntity}: { id: number, entity: Object, deleteEntity: (id: number) => void, updateEntity: (id: number) => void, viewEntity: (id: number) => void }) => {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <span className="sr-only sm:not-sr-only">...</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuCheckboxItem  onClick={()=> viewEntity(id)}>
                        <div className={'cursor-pointer text-[#344054]'}>View</div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem onClick={() => updateEntity(id)}>
                        <div className={'cursor-pointer text-[#344054]'}> Update</div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem onClick={() => deleteEntity(id)}>
                        <div className={'cursor-pointer text-[#344054]'}> Delete</div>
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
export default CustomTableCell
