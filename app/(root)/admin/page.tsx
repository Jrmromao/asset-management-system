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

// import {
//     Tooltip,
//     TooltipContent,
//     TooltipTrigger,
// } from "@/components/ui/tooltip"

const Admin = () => {

    const [refresh, setRefresh] = useState(false)

    const [shouldRefresh, licenses] = licenseStore((state) => [state.shouldRefresh, state.licenses])

    // const [categories, deleteCategory, getAll] = useCategoryStore(state => [state.categories, state.delete, state.getAll])

    // const categoriesMemo = useMemo(() => categories, [categories, getAll])


    useEffect(() => {
        // getAll()
    }, []);


    useEffect(() => {

        if (refresh) {
            // getAll()
                setRefresh(false)
        }
    }, [refresh]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 admin">
            <div className="">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">

                    <Breadcrumb className="hidden md:flex pb-5">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="#">Admin</Link>
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
                <main  className="grid flex-1 items-start gap-4 p-4 sm:px-1 sm:py-0 md:gap-2 lg:grid-cols-1 xl:grid-cols-1">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                            <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                                <CardHeader className="pb-3">
                                    <CardTitle>Need to decide</CardTitle>
                                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                                        Some description
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button>Create New Order</Button>
                                </CardFooter>
                            </Card>
                            <Card x-chunk="dashboard-05-chunk-1">
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Assets</CardDescription>
                                    <CardTitle className="text-4xl">999/2000</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">
                                        Max assets in your account
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Progress value={25} aria-label="25% increase"/>
                                </CardFooter>
                            </Card>
                            <Card x-chunk="dashboard-05-chunk-2">
                                <CardHeader className="pb-2">
                                    <CardDescription>Total Licenses</CardDescription>
                                    <CardTitle className="text-4xl">133/300</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground">
                                        Max licenses in your account
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Progress value={12} aria-label="12% increase"/>
                                </CardFooter>
                            </Card>
                        </div>
                        <Tabs defaultValue="category">
                            <div className="flex items-center">
                                <TabsList>
                                    <TabsTrigger value="category">Category</TabsTrigger>
                                    <TabsTrigger value="licenses">Licenses</TabsTrigger>
                                    <TabsTrigger value="people">People</TabsTrigger>
                                </TabsList>
                                <div className="ml-auto flex items-center gap-2">
                                    {/*<DropdownMenu>*/}
                                    {/*    <DropdownMenuTrigger asChild>*/}
                                    {/*        <Button*/}
                                    {/*            variant="outline"*/}
                                    {/*            size="sm"*/}
                                    {/*            className="h-7 gap-1 text-sm"*/}
                                    {/*        >*/}
                                    {/*            <ListFilter className="h-3.5 w-3.5"/>*/}
                                    {/*            <span className="sr-only sm:not-sr-only">Filter</span>*/}
                                    {/*        </Button>*/}
                                    {/*    </DropdownMenuTrigger>*/}
                                    {/*    <DropdownMenuContent align="end">*/}
                                    {/*        <DropdownMenuLabel>Filter by</DropdownMenuLabel>*/}
                                    {/*        <DropdownMenuSeparator/>*/}
                                    {/*        <DropdownMenuCheckboxItem checked>*/}
                                    {/*            Fulfilled*/}
                                    {/*        </DropdownMenuCheckboxItem>*/}
                                    {/*        <DropdownMenuCheckboxItem>*/}
                                    {/*            Declined*/}
                                    {/*        </DropdownMenuCheckboxItem>*/}
                                    {/*        <DropdownMenuCheckboxItem>*/}
                                    {/*            Refunded*/}
                                    {/*        </DropdownMenuCheckboxItem>*/}
                                    {/*    </DropdownMenuContent>*/}
                                    {/*</DropdownMenu>*/}
                                    {/*<Button*/}
                                    {/*    size="sm"*/}
                                    {/*    variant="outline"*/}
                                    {/*    className="h-7 gap-1 text-sm"*/}
                                    {/*>*/}
                                    {/*    <File className="h-3.5 w-3.5"/>*/}
                                    {/*    <span className="sr-only sm:not-sr-only">Export</span>*/}
                                    {/*</Button>*/}
                                </div>
                            </div>

                            <TabsContent value="category">
                                <Card x-chunk="dashboard-05-chunk-3">
                                    <CardHeader className="px-7">
                                        <CardTitle>Add Category</CardTitle>
                                        <CardDescription>
                                            Register a new Asset Category.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent
                                        className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3">

                                        <Card x-chunk="dashboard-05-chunk-1">
                                            <CardHeader className="pb-2">
                                                <CardTitle>Add Category</CardTitle>
                                                <CardDescription className="max-w-lg text-balance leading-relaxed">
                                                    Fill the form to create new category.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <CategoryForm />
                                            </CardContent>
                                            <CardFooter>
                                            </CardFooter>
                                        </Card>
                                        <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                                            <CardHeader className="pb-3">
                                                <CardTitle>All Categories</CardTitle>
                                                <CardDescription className="max-w-lg text-balance leading-relaxed">
                                                    All the categories in your account are listed here.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {/*<CategoryTable licenses={categories} deleteCategory={deleteCategory} setRefresh={setRefresh}  />*/}
                                            </CardContent>
                                            <CardFooter>
                                            </CardFooter>
                                        </Card>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="licenses">
                                <Card x-chunk="dashboard-05-chunk-3">
                                    <CardHeader className="px-7">
                                        <CardTitle>Add License</CardTitle>
                                        <CardDescription>
                                            Register a new License.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent
                                        className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3">
                                        <Card x-chunk="dashboard-05-chunk-1">
                                            <CardHeader className="pb-2">
                                                <CardTitle>Add License</CardTitle>
                                                <CardDescription className="max-w-lg text-balance leading-relaxed">
                                                    Fill the form to create new license.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                             test
                                            </CardContent>
                                            <CardFooter>
                                            </CardFooter>
                                        </Card>
                                        <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                                            <CardHeader className="pb-3">
                                                <CardTitle>All Locations</CardTitle>
                                                <CardDescription className="max-w-lg text-balance leading-relaxed">
                                                    All the locations in your account are listed here.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {/*<LicensesTable licenses={licenses || []}/>*/}
                                            </CardContent>
                                            <CardFooter>
                                            </CardFooter>
                                        </Card>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="people">
                                <Card x-chunk="dashboard-05-chunk-3">
                                    <CardHeader className="px-7">
                                        <CardTitle>Add People</CardTitle>
                                        <CardDescription>
                                            Register a new People.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent
                                        className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3">
                                        <Card x-chunk="dashboard-05-chunk-1">
                                            <CardHeader className="pb-2">
                                                <CardTitle>Add People</CardTitle>
                                                <CardDescription className="max-w-lg text-balance leading-relaxed">
                                                    Fill the form to create new category.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <CategoryForm/>
                                            </CardContent>
                                            <CardFooter>
                                            </CardFooter>
                                        </Card>
                                        <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                                            <CardHeader className="pb-3">
                                                <CardTitle>All People</CardTitle>
                                                <CardDescription className="max-w-lg text-balance leading-relaxed">
                                                    All the people in your account are listed here.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {/*<CategoryTable licenses={categories} deleteCategory={deleteCategory} setRefresh={setRefresh}/>*/}
                                            </CardContent>
                                            <CardFooter>
                                            </CardFooter>
                                        </Card>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Admin