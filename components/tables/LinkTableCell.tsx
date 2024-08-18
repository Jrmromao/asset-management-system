import React from 'react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {TableCell} from "@/components/ui/table";
import {useRouter} from "next/navigation";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {InfoIcon} from "lucide-react";

const CustomTableCell = ({value, navigateTo, label}: {
    value?: string | number,
    navigateTo?: string,
    label?: StatusLabel
}) => {
    const navigate = useRouter()

    const InfoPopover = (description: string, colorCode: string) => {
        return (
            <div className="text-right align-top">
                <Popover>
                    <PopoverTrigger asChild>
                        <InfoIcon className="h-4 w-4 "/>
                    </PopoverTrigger>
                    <PopoverContent className={`w-80 bg-white p-4 text-[${colorCode}]`}>
                        {description}
                    </PopoverContent>
                </Popover>
            </div>
        )
    }


    return (
        <>
            <TableCell className={`min-w-32 pl-2 pr-10 ${label?.colorCode ? `italic text-[${label?.colorCode}]` : ''}`}
                       onClick={() => navigate.push(navigateTo || '#')}>
                <div className="flex">
                    <div className="w-9/12"> {value ? value : "n/a"}</div>
                    <div
                        className={`w-3/12 text-[${label?.colorCode}]`}> {label ? InfoPopover(label?.description, label?.colorCode) : null}</div>
                </div>
            </TableCell>
        </>
    )
}


export default CustomTableCell
