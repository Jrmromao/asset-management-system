'use client'
import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import {Progress} from "@/components/ui/progress"
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs"
import CategoryForm from "@/components/forms/CategoryForm";
import CategoryTable from "@/components/tables/CategoryTable";
import React, {useEffect, useMemo, useState} from "react";
import {licenseStore} from "@/lib/stores/store";
import {useCategoryStore} from "@/lib/stores/categoryStore";
import {useAssetStore} from "@/lib/stores/assetStore";
import {useAccessoryStore} from "@/lib/stores/accessoryStore";

// import {
//     Tooltip,
//     TooltipContent,
//     TooltipTrigger,
// } from "@/components/ui/tooltip"

const Home = () => {


    const [licenses] = licenseStore((state) => [state.licenses])
    const [accessories] = useAccessoryStore(state => [state.accessories])
    const [assets] = useAssetStore(state => [state.assets])


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 admin">
            <div className="">
                <header
                    className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">

                    <Breadcrumb className="hidden md:flex pb-5">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="#">Home</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator/>
                            {/*<BreadcrumbItem>*/}
                            {/*    <BreadcrumbLink asChild>*/}
                            {/*        <Link href="#">Orders</Link>*/}
                            {/*    </BreadcrumbLink>*/}
                            {/*</BreadcrumbItem>*/}
                            {/*<BreadcrumbSeparator />*/}
                            {/*<BreadcrumbItem>*/}
                            {/*    <BreadcrumbPage>Recent Orders</BreadcrumbPage>*/}
                            {/*</BreadcrumbItem>*/}
                        </BreadcrumbList>
                    </Breadcrumb>


                </header>
                <main
                    className="grid flex-1 items-start gap-4 p-4 sm:px-1 sm:py-0 md:gap-2 lg:grid-cols-1 xl:grid-cols-1">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            <Card x-chunk="dashboard-05-chunk-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">Accessories</CardTitle>
                                    <CardDescription></CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {accessories.length}
                                </CardContent>

                            </Card>

                            <Card x-chunk="dashboard-05-chunk-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">Assets</CardTitle>
                                    <CardDescription></CardDescription>
                                </CardHeader>
                                <CardContent>{assets.length}</CardContent>
                            </Card>

                            <Card x-chunk="dashboard-05-chunk-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">Consumables</CardTitle>
                                    <CardDescription></CardDescription>
                                </CardHeader>
                                <CardContent>90</CardContent>
                            </Card>

                            <Card x-chunk="dashboard-05-chunk-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-2xl">Licenses</CardTitle>
                                    <CardDescription></CardDescription>
                                </CardHeader>
                                <CardContent>{licenses.length}</CardContent>
                            </Card>
                        </div>

                    </div>
                </main>
                <div>
                    What do i need to get done for this?
                    <ul className="list-disc pl-6">
                        <li>Make it look like a dashboard</li>
                        <li>Make the cards look like cards</li>
                        <li>Get the count of each type of asset</li>
                        <li>Make the cards clickable</li>
                        <li>Make the cards link to the respective page</li>
                        <li>Make the cards have a title and a description</li>
                        <li>Make the cards have a button</li>
                        <li>Make the cards have a progress bar</li>
                        <li>Make the cards have a tooltip</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Home