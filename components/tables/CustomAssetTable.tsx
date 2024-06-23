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
import { cn, formatAmount, formatDateTime, getTransactionStatus, removeSpecialCharacters } from "@/lib/utils"
import {
    DropdownMenu, DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ListFilter} from "lucide-react";

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

const CustomAssetTable = ({ assets = [] }: AssetTableProps) => {


    return (
        <Table>
            <TableHeader className="bg-[#f9fafb]">
                <TableRow>
                    <TableHead className="px-2">Image</TableHead>
                    <TableHead className="px-2">Asset Title</TableHead>
                    {/*<TableHead className="px-2">Brand</TableHead>*/}
                    {/*<TableHead className="px-2">Model</TableHead>*/}
                    <TableHead className="px-2">Assigned</TableHead>
                    <TableHead className="px-2">Category</TableHead>
                    <TableHead className="px-2">Status</TableHead>
                    <TableHead className="px-2">Location</TableHead>
                    {/*<TableHead className="px-2 max-md:hidden">Category</TableHead>*/}
                    <TableHead className="px-2">Date Purchased</TableHead>
                    <TableHead className="px-2"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>

                {assets?.map((asset: Asset) => {
                    return (
                        <TableRow key={asset.id} className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT`}>
                            <TableCell className="max-w-[250px] pl-2 pr-10">
                                {/*<div className="flex items-center gap-3">*/}
                                {/*    <h1 className="text-14 truncate font-semibold text-[#344054]">*/}
                                {/*        {asset.id}*/}
                                {/*    </h1>*/}
                                {/*</div>*/}

                                <img src={''} alt={''} className="bg-yellow-100 h-8 w-8" />
                            </TableCell>

                            <TableCell className="pl-2 pr-10">
                                {asset.name}
                            </TableCell>

                            <TableCell className="min-w-32 pl-2 pr-10">
                                {asset.status}
                            </TableCell>

                            {/*<TableCell className="pl-2 pr-10 capitalize min-w-24">*/}
                            {/*    {asset.note}*/}
                            {/*</TableCell>*/}

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                {asset.status}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                {asset.location}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">
                                {asset.datePurchased}
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
    )
}

export default CustomAssetTable