'use client'
import React, {useEffect, useMemo, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import LicenseForm from "@/components/forms/LicenseForm";
import {getLicenses} from "@/lib/actions/license.actions";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import LicensesTable from "@/components/tables/LicensesTable";
import {licenseStore} from "@/lib/stores/store";


const Licenses = () => {
    const [licensesList, setLicenseList] = useState<[]>()
    const [shouldRefresh,licenses ] = licenseStore((state) => [state.shouldRefresh, state.licenses])

    useEffect(() => {
        console.log(licenses)
        getLicenses().then(licenses => setLicenseList(licenses))
    }, [setLicenseList, shouldRefresh]);


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 admin ">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header
                    className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                </header>
                <main
                    className="grid flex-1 items-start gap-4 p-4 sm:px-1 sm:py-0 md:gap-2 lg:grid-cols-1 xl:grid-cols-1">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        <Tabs defaultValue="list">
                            <div className={'mb-4 mt-1'}>
                                <HeaderBox title={'Licenses'} subtext={'Manage your Licenses'}/>
                            </div>

                            <div className="flex items-center">
                                <TabsList>
                                    <TabsTrigger value="list">List Licenses</TabsTrigger>
                                    <TabsTrigger value="add">Add License</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="list">
                                <Card x-chunk="dashboard-05-chunk-3">
                                    <CardHeader className="px-7">
                                        <CardTitle>Licenses</CardTitle>
                                    </CardHeader>
                                    <CardContent
                                        className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
                                        <LicensesTable licenses={licenses || []}/>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="add">
                                <Card x-chunk="dashboard-05-chunk-3">
                                    <CardHeader className="px-7">
                                        <CardTitle>Add License</CardTitle>
                                        <CardDescription>
                                            Fill the form to register a new license.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <LicenseForm/>
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
export default Licenses
