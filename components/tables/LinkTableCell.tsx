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

const CustomTableCell = ({value, navigateTo}: {value?: string | number, navigateTo: string }) => {
    const navigate = useRouter()
    return (
        <>
            <TableCell className="min-w-32 pl-2 pr-10" onClick={() => navigate.push(navigateTo)}>
                {value ? value : "n/a"}
            </TableCell>
        </>
    )
}
export default CustomTableCell
