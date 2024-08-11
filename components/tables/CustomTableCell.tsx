import React from 'react'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import {useRouter} from "next/navigation";

const CustomTableCell = ({id, deleteEntity, updateEntity, viewPath, setRefresh}: { id: number, entity: Object, deleteEntity: (id: number) => void, updateEntity: (id: number) => void, viewPath: string, setRefresh: (flag: boolean) => void}) => {
    const navigate = useRouter()
    const handleDelete = (id: number) => {

        Swal.fire({
            title: "Are you sure?",
            text: `You won't be able to revert this!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {

                Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                });

                deleteEntity(id)
                setRefresh(true)
            }
        });
    }



    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <span className="cusor-pointer sr-only sm:not-sr-only">...</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuCheckboxItem  onClick={()=> navigate.push(`${viewPath}`)}>
                        <div className={'cursor-pointer text-[#344054]'}>View</div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem onClick={() => updateEntity(id)}>
                        <div className={'cursor-pointer text-[#344054]'}> Update</div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem onClick={() => {handleDelete(id)}}>
                        <div className={'cursor-pointer text-[#344054]'}> Delete</div>
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
export default CustomTableCell
