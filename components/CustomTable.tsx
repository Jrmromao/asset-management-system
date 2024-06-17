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

const TransactionsTable = ({ assets }: AssetTableProps) => {


    return (
        <Table>
            <TableHeader className="bg-[#f9fafb]">
                <TableRow>
                    <TableHead className="px-2">Transaction</TableHead>
                    <TableHead className="px-2">Amount</TableHead>
                    <TableHead className="px-2">Status</TableHead>
                    <TableHead className="px-2">Date</TableHead>
                    <TableHead className="px-2 max-md:hidden">Channel</TableHead>
                    <TableHead className="px-2 max-md:hidden">Category</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>



                {assets?.map((t: Asset) => {
                    const status = getTransactionStatus(new Date(t.date))
                    const amount = formatAmount(t.price)


                    return (
                        <TableRow key={t.id} className={` bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT`}>
                            <TableCell className="max-w-[250px] pl-2 pr-10">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-14 truncate font-semibold text-[#344054]">
                                        {removeSpecialCharacters(t.name)}
                                    </h1>
                                </div>
                            </TableCell>


                            <TableCell className="pl-2 pr-10">
                            </TableCell>

                            <TableCell className="min-w-32 pl-2 pr-10">
                                {formatDateTime(new Date(t.date)).dateTime}
                            </TableCell>

                            <TableCell className="pl-2 pr-10 capitalize min-w-24">

                            </TableCell>


                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

export default TransactionsTable