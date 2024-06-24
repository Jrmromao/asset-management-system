import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { transactionCategoryStyles } from "@/constants"
import {
    cn,
    filterColumns,
    formatAmount,
    formatDateTime,
    getTransactionStatus,
    removeSpecialCharacters, renameColumns
} from "@/lib/utils"
import {
    DropdownMenu, DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ListFilter} from "lucide-react";
import {Pagination} from "@/components/Pagination";

// const CategoryBadge = ({ category }: CategoryBadgeProps) => {
//     const {
//         borderColor,
//         backgroundColor,
//         textColor,
//         chipBackgroundColor,
//     } = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles] || transactionCategoryStyles.default
//
//     return (
//         <div className={cn('category-badge', borderColor, chipBackgroundColor)}>
//             <div className={cn('size-2 rounded-full', backgroundColor)} />
//             <p className={cn('text-[12px] font-medium', textColor)}>{category}</p>
//         </div>
//     )
// }

const CustomAssetTable = ({ assets}: AssetTableProps) => {

    const columnMappings: Record<keyof Asset, string> = {
        categoryId: "categoryId",
        datePurchased: "Date Purchased",
        location: "location",
        name: "name",
        price: "Price",
        purchasePrice: "Price",
        status: "Status",
        id: "id",
        description: "description",
        createdAt: "Created At",
        updatedAt: "updatedAt",
        userId: "userId",
        image: ""
    };

    const filteredData = filterColumns(assets, ['id', 'updatedAt', 'categoryId', 'datePurchased','userId', 'purchasePrice', 'description']);

    const renamedData = renameColumns(filteredData, columnMappings);

    if(renamedData.length === 0) return <p>No assets found</p>
    const headers = Object?.keys(renamedData[0])

    return (
        <div>
        <Table>
            <TableHeader className="bg-[#f9fafb]">
                <TableRow>
                    <TableHead className="px-2"></TableHead>
                    {headers.map(name => {
                        return (
                            <TableHead key={name} className="px-2">{name}</TableHead>
                        )
                    })}
                    <TableHead className="px-2"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {assets?.map((asset: Asset) => {
                    return (
                        <TableRow key={asset.id} className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT`}>
                            <TableCell className="max-w-[250px] pl-2 pr-10">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-14 truncate font-semibold text-[#344054]">
                                        {asset.image}
                                    </h1>
                                </div>

                                <img src={''} alt={''} className="bg-yellow-100 h-8 w-8" />
                            </TableCell>

                            <TableCell className="pl-2 pr-10">
                                {asset.name}
                            </TableCell>

                            <TableCell className="min-w-32 pl-2 pr-10">
                                {asset.price}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                {formatDateTime(asset.createdAt!).dateTime}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <span className="sr-only sm:not-sr-only">...</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuCheckboxItem  onClick={()=> console.log(asset.id)}>
                                            <div className={'cursor-pointer text-[#344054]'}>Update</div>
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem onClick={() => console.log(asset)}>
                                            <div className={'cursor-pointer text-[#344054]'}> Delete</div>
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>

                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>

        </div>
    )
}

export default CustomAssetTable