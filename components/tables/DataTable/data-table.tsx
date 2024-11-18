// components/DataTable.tsx
"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    getSortedRowModel,
    SortingState,
    VisibilityState,
    PaginationState
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"

// Add your data type
interface Asset {
    name: string
    assigned: string
    model: string
    co2Footprint: string
    serialNumber: string
    plannedEndOfLife: string
    // Add other fields as needed
}

// Define your columns
export const columns: ColumnDef<Asset>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "assigned",
        header: "Assigned",
    },
    {
        accessorKey: "model",
        header: "Model",
    },
    {
        accessorKey: "co2Footprint",
        header: "CO2 Footprint",
    },
    {
        accessorKey: "serialNumber",
        header: "Serial Number",
    },
    {
        accessorKey: "plannedEndOfLife",
        header: "Planned End of Life",
    },
]

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                         }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const pagination = {
        pageIndex,
        pageSize,
    }

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnVisibility,
            pagination,
        },
    })

    const rows = table.getRowModel().rows
    const hasRows = Array.isArray(rows) && rows.length > 0
    const currentPage = table.getState().pagination.pageIndex + 1
    const totalPages = table.getPageCount()

    // Helper function to get clean cell content
    const getCellContent = (cell: any) => {
        const content = flexRender(cell.column.columnDef.cell, cell.getContext())

        if (typeof content === 'object') {
            return cell.getValue() || cell.getContext().row.original[cell.column.id] || '';
        }

        return content;
    }
    const getHeaderText = (header: any): string => {
        if (typeof header === 'string') {
            return header
        }
        if (typeof header === 'function') {
            return '' // Skip functional headers in mobile view
        }
        if (typeof header === 'object' && header !== null) {
            // For complex header objects, use column ID
            return String(header.column?.id || '')
                .split(/(?=[A-Z])/)
                .join(' ')
                .replace(/^\w/, c => c.toUpperCase())
        }
        return ''
    }
    const renderMobileCard = (row: any) => (
        <div key={row.id}>
            {row.getVisibleCells().map((cell: any) => {
                const headerText = getHeaderText(cell.column.columnDef.header)

                // Skip empty headers
                if (!headerText) return null

                return (
                    <div key={cell.id} className="flex flex-col px-6 py-4 border-b border-gray-200 bg-white last:border-b-0">
                        <span className="text-[15px] text-gray-500 font-normal">
                            {headerText}
                        </span>
                        <span className="text-[15px] mt-1 font-normal">
                            {getCellContent(cell)}
                        </span>
                    </div>
                )
            }).filter(Boolean)}
        </div>
    )
    return (
        <div className="space-y-4">
            {/* Table/Cards Container */}
            <div className={isMobile ? "bg-white" : "rounded-md border"}>
                {isMobile ? (
                    // Mobile card view
                    <div>
                        {hasRows ? (
                            rows.map((row) => renderMobileCard(row))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No results.
                            </div>
                        )}
                    </div>
                ) : (
                    // Desktop/Tablet table view
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-[#f9fafb]">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableHead key={header.id}>
                                                {!header.isPlaceholder &&
                                                    flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {hasRows ? (
                                    rows.map(row => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className={`flex flex-col ${isMobile ? 'space-y-4' : 'sm:flex-row sm:justify-between'} items-center py-4 px-4`}>
                <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[72px] border-0 bg-transparent p-0 hover:bg-transparent [&>span]:font-normal [&>span]:text-black">
                            <SelectValue placeholder="Select rows" />
                        </SelectTrigger>
                        <SelectContent
                            align="start"
                            className="w-[100px] rounded-md border bg-white p-0"
                        >
                            {[5, 10, 20, 30, 40, 50].map((size) => (
                                <SelectItem
                                    key={size}
                                    value={size.toString()}
                                    className="relative flex cursor-pointer items-center px-3 py-2 hover:bg-gray-100"
                                >
                                    <span className="absolute left-2">
                                        {pageSize === size && "✓"}
                                    </span>
                                    <span className="pl-6">{size}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="whitespace-nowrap"
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}