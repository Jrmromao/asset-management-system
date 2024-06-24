import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {filterColumns, formatDateTime, renameColumns} from "@/lib/utils";


const CustomAssetTable = ({categories}: CategoryTableProps) => {

    const columnMappings: Record<keyof Category, string> = {
        note: "Note",
        name: 'Name',
        id: "id",
        createdAt: "Created At",
        updatedAt: "updatedAt"
    };
    const filteredData = filterColumns(categories, ['id', 'updatedAt']);
    const renamedData = renameColumns(filteredData, columnMappings);
    if(renamedData.length === 0) return <p>No assets found</p>
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