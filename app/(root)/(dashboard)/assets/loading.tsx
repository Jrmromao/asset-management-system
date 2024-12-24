'use client'

import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const Loading = () => {
    const renderSkeletonInfo = () => (
        <div className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-32" />
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Breadcrumb Skeleton */}
            <Breadcrumb className="hidden md:flex pb-5">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Skeleton className="h-4 w-16" />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <Skeleton className="h-4 w-16" />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                </BreadcrumbList>
            </Breadcrumb>

            <div className="space-y-6">
                <section className="flex w-full flex-col gap-6">
                    <Card className="w-full">
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent>

                            <h2 className="text-gray-500 mb-2">Loading...</h2>
                            {/*<div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">*/}
                            {/*    <div className="lg:col-span-5 p-4">*/}
                            {/*        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">*/}
                            {/*            /!* First Row *!/*/}
                            {/*            {Array(4).fill(null).map((_, i) => (*/}
                            {/*                renderSkeletonInfo()*/}
                            {/*            ))}*/}

                            {/*            /!* Second Row *!/*/}
                            {/*            {Array(4).fill(null).map((_, i) => (*/}
                            {/*                renderSkeletonInfo()*/}
                            {/*            ))}*/}

                            {/*            /!* Third Row *!/*/}
                            {/*            {Array(4).fill(null).map((_, i) => (*/}
                            {/*                renderSkeletonInfo()*/}
                            {/*            ))}*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*    <div className="p-4 flex items-center justify-center">*/}
                            {/*        <Skeleton className="h-36 w-36" /> /!* QR Code placeholder *!/*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                        </CardContent>
                        <CardFooter className="bg-gray-50">
                            <div className="w-full flex flex-wrap justify-end gap-2">
                                {/* Action Buttons */}
                                {Array(5).fill(null).map((_, i) => (
                                    <Skeleton key={i} className="h-9 w-24" />
                                ))}
                            </div>
                        </CardFooter>
                    </Card>
                </section>

                {/* Activity Log Section */}
                <section className="flex w-full">
                    <Card className="w-full">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            {/* Activity Log Items */}
                            <div className="space-y-4">
                                {Array(5).fill(null).map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-6 flex-1" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}

export default Loading