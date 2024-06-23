import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {formatDateTime} from "@/lib/utils";


const CustomAssetTable = ({ categories }: CategoryTableProps) => {


    return (
        <Table>
            <TableHeader className="bg-[#f9fafb]">
                <TableRow>
                    <TableHead className="px-2">Name</TableHead>
                    <TableHead className="px-2">Note</TableHead>
                    <TableHead className="px-2">Created At</TableHead>
                    <TableHead className="px-2"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>

                {categories?.map((category: Category) => {

                    const createdAt = formatDateTime(category.createdAt!);

                    return (
                        <TableRow key={category.id} className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT`}>

                            <TableCell className="pl-2 pr-10">
                                {category.name}
                            </TableCell>

                            <TableCell className="min-w-32 pl-2 pr-10">
                                {category.note}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                {createdAt.dateTime}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                ...
                            </TableCell>

                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

export default CustomAssetTable