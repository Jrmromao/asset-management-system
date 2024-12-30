"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Button} from "@/components/ui/button"
import {
    BadgeIcon,
    Mail,
    User as UserIcon,
    ArrowUpDown,
    CircleUserRound, HashIcon, CheckCircle2
} from "lucide-react"
import {formatDateTime} from "@/lib/utils"

export const itemUseByColumns = ({  }): ColumnDef<UserAccessory>[] => [
    {
        accessorKey: "user.employeeId",
        enableSorting: true,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
                >
                    <HashIcon className="w-4 h-4" />
                    Employee ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const user = row.original.user
            return (
                <div className="text-sm text-gray-600">
                    {user.employeeId}
                </div>
            )
        }
    },
    {
        accessorKey: "user.name",
        enableSorting: true,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
                >
                    <CircleUserRound className="w-4 h-4" />
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const user = row.original.user
            return (
                <div className="text-sm text-gray-900">
                    {user.name}
                </div>
            )
        }
    },
    {
        accessorKey: "user.email",
        enableSorting: true,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
                >
                    <Mail className="w-4 h-4" />
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const user = row.original.user
            return (
                <div className="text-sm text-gray-900">
                    {user.email}
                </div>
            )
        }
    },
    {
        accessorFn: (row) => row.user.active,
        id: "status",
        enableSorting: true,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
                >
                    <UserIcon className="w-4 h-4" />
                    Account Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const user = row.original.user
            return (
                <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                            {user.active ? "Active" : "Inactive"}
                        </div>
                        <div className="text-xs text-gray-500">Administrator</div>
                    </div>
                </div>
            )
        }
    },
    {
        id: "actions",
        enableSorting: false,
        header: () => (
            <div className="text-xs font-medium text-gray-500 uppercase text-center">
                Actions
            </div>
        ),
        cell: ({ row }) => {
            const user = row.original.user
            return (
                <div className="flex items-center justify-center">
                    <Button
                        variant={ user.active ? "link": "ghost"}
                        size="sm"
                        className={`flex items-center gap-2 text-sm ${
                            user.active
                                ? "text-green-600 hover:text-green-700"
                                : "text-gray-600 hover:text-gray-700"
                        }`}
                        onClick={() => {
                            console.log('Check in clicked for:', user.employeeId)
                        }}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Check In
                    </Button>
                </div>
            )
        }
    }
]