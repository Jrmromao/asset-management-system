// 'use client'
// import Link from "next/link"
// import {
//     Breadcrumb,
//     BreadcrumbItem,
//     BreadcrumbLink,
//     BreadcrumbList,
//     BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import {Button} from "@/components/ui/button"
// import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
// import {Progress} from "@/components/ui/progress"
// import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs"
// import CategoryForm from "@/components/forms/CategoryForm";
// import CategoryTable from "@/components/tables/CategoryTable";
// import React, {useEffect, useMemo, useState} from "react";
// import {licenseStore} from "@/lib/stores/store";
// import {useCategoryStore} from "@/lib/stores/categoryStore";
// import {useAssetStore} from "@/lib/stores/assetStore";
// import {useAccessoryStore} from "@/lib/stores/accessoryStore";
//
// // import {
// //     Tooltip,
// //     TooltipContent,
// //     TooltipTrigger,
// // } from "@/components/ui/tooltip"
//
// const Home = () => {
//
//
//     const [licenses] = licenseStore((state) => [state.licenses])
//     const [accessories] = useAccessoryStore(state => [state.accessories])
//     const [assets] = useAssetStore(state => [state.assets])
//
//
//     return (
//         <div className="flex min-h-screen w-full flex-col bg-muted/40 admin">
//             <div className="">
//                 <header
//                     className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
//
//                     <Breadcrumb className="hidden md:flex pb-5">
//                         <BreadcrumbList>
//                             <BreadcrumbItem>
//                                 <BreadcrumbLink asChild>
//                                     <Link href="#">Home</Link>
//                                 </BreadcrumbLink>
//                             </BreadcrumbItem>
//                             <BreadcrumbSeparator/>
//                             {/*<BreadcrumbItem>*/}
//                             {/*    <BreadcrumbLink asChild>*/}
//                             {/*        <Link href="#">Orders</Link>*/}
//                             {/*    </BreadcrumbLink>*/}
//                             {/*</BreadcrumbItem>*/}
//                             {/*<BreadcrumbSeparator />*/}
//                             {/*<BreadcrumbItem>*/}
//                             {/*    <BreadcrumbPage>Recent Orders</BreadcrumbPage>*/}
//                             {/*</BreadcrumbItem>*/}
//                         </BreadcrumbList>
//                     </Breadcrumb>
//
//
//                 </header>
//                 <main
//                     className="grid flex-1 items-start gap-4 p-4 sm:px-1 sm:py-0 md:gap-2 lg:grid-cols-1 xl:grid-cols-1">
//                     <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
//                         <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
//                             <Card x-chunk="dashboard-05-chunk-1">
//                                 <CardHeader className="pb-2">
//                                     <CardTitle className="text-2xl">Accessories</CardTitle>
//                                     <CardDescription></CardDescription>
//                                 </CardHeader>
//                                 <CardContent>
//                                     {accessories.length}
//                                 </CardContent>
//
//                             </Card>
//
//                             <Card x-chunk="dashboard-05-chunk-1">
//                                 <CardHeader className="pb-2">
//                                     <CardTitle className="text-2xl">Assets</CardTitle>
//                                     <CardDescription></CardDescription>
//                                 </CardHeader>
//                                 <CardContent>{assets.length}</CardContent>
//                             </Card>
//
//                             <Card x-chunk="dashboard-05-chunk-1">
//                                 <CardHeader className="pb-2">
//                                     <CardTitle className="text-2xl">Consumables</CardTitle>
//                                     <CardDescription></CardDescription>
//                                 </CardHeader>
//                                 <CardContent>90</CardContent>
//                             </Card>
//
//                             <Card x-chunk="dashboard-05-chunk-1">
//                                 <CardHeader className="pb-2">
//                                     <CardTitle className="text-2xl">Licenses</CardTitle>
//                                     <CardDescription></CardDescription>
//                                 </CardHeader>
//                                 <CardContent>{licenses.length}</CardContent>
//                             </Card>
//                         </div>
//
//                     </div>
//                 </main>
//                 <div>
//                     What do i need to get done for this?
//                     <ul className="list-disc pl-6">
//                         <li>Make it look like a dashboard</li>
//                         <li>Make the cards look like cards</li>
//                         <li>Get the count of each type of asset</li>
//                         <li>Make the cards clickable</li>
//                         <li>Make the cards link to the respective page</li>
//                         <li>Make the cards have a title and a description</li>
//                         <li>Make the cards have a button</li>
//                         <li>Make the cards have a progress bar</li>
//                         <li>Make the cards have a tooltip</li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     )
// }
//
// export default Home


import {ArrowRight, BarChart2, Box, Leaf, Phone, Shield} from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Top Bar */}
            <div className="hidden border-b bg-muted/40 px-4 py-2 md:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {/*<Phone className="h-4 w-4" />*/}
                        {/*<span className="text-sm">1-888-ECO-KEEP</span>*/}
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="#" className="text-sm hover:underline">
                            About EcoKeepr
                        </Link>
                        <Link href="#" className="text-sm hover:underline">
                            Careers
                        </Link>
                        <Link href="#" className="text-sm hover:underline">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <header className="sticky top-0 z-50 border-b bg-background">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <div className="flex items-center space-x-8">
                        <Link href="/" className="flex items-center space-x-2">
                            <Leaf className="h-8 w-8 text-green-600"/>
                            <span className="text-xl font-bold">EcoKeepr</span>
                        </Link>
                        <nav className="hidden space-x-6 md:flex">
                            <Link href="#" className="text-sm font-medium hover:text-green-600">
                                Features
                            </Link>
                            <Link href="#" className="text-sm font-medium hover:text-green-600">
                                Industries
                            </Link>
                            <Link href="#" className="text-sm font-medium hover:text-green-600">
                                Integrations
                            </Link>
                            <Link href="#" className="text-sm font-medium hover:text-green-600">
                                Blog
                            </Link>
                            <Link href="#" className="text-sm font-medium hover:text-green-600">
                                Pricing
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost">Login</Button>
                        <Button>Free trial</Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-white to-green-50">
                <div className="mx-auto max-w-7xl px-4 py-20">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
                        <div className="flex flex-col justify-center space-y-8">
                            <div>
                                <div
                                    className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
                                    SUSTAINABLE ASSET MANAGEMENT SOFTWARE
                                </div>
                                <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                                    Smart asset management with environmental impact tracking
                                </h1>
                            </div>
                            <p className="text-xl text-muted-foreground">
                                EcoKeepr helps you manage your assets while monitoring their carbon footprint. Track,
                                maintain, and optimize
                                your equipment&apos;s environmental impact all in one place.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                    Start free trial
                                    <ArrowRight className="ml-2 h-4 w-4"/>
                                </Button>
                                <Button size="lg" variant="outline">
                                    Book a demo
                                </Button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative z-10">
                                <Image
                                    src="/placeholder.svg"
                                    alt="EcoKeepr dashboard preview"
                                    width={650}
                                    height={400}
                                    className="rounded-lg shadow-2xl"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-12 md:grid-cols-3">
                        <div className="space-y-4">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <Box className="h-6 w-6 text-green-600"/>
                            </div>
                            <h3 className="text-xl font-semibold">Asset Tracking</h3>
                            <p className="text-muted-foreground">
                                Comprehensive tracking of all your physical and digital assets with detailed lifecycle
                                management.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <Leaf className="h-6 w-6 text-green-600"/>
                            </div>
                            <h3 className="text-xl font-semibold">Carbon Footprint</h3>
                            <p className="text-muted-foreground">
                                Monitor and analyze the environmental impact of your assets with real-time carbon
                                footprint tracking.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                <BarChart2 className="h-6 w-6 text-green-600"/>
                            </div>
                            <h3 className="text-xl font-semibold">Sustainability Reports</h3>
                            <p className="text-muted-foreground">
                                Generate detailed sustainability reports and get actionable insights to reduce your
                                environmental impact.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="border-t bg-muted/40 py-20">
                <div className="mx-auto max-w-7xl px-4">
                    <h2 className="mb-12 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Trusted by sustainable organizations worldwide
                    </h2>
                    {/*<div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">*/}
                    {/*    {[...Array(6)].map((_, i) => (*/}
                    {/*        <div key={i} className="flex items-center justify-center">*/}
                    {/*            <Image*/}
                    {/*                src="/placeholder-logo.svg"*/}
                    {/*                alt={`Customer logo ${i + 1}`}*/}
                    {/*                width={120}*/}
                    {/*                height={60}*/}
                    {/*                className="grayscale transition-all hover:grayscale-0"*/}
                    {/*            />*/}
                    {/*        </div>*/}
                    {/*    ))}*/}
                    {/*</div>*/}

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
            </section>
        </div>
    )
}

