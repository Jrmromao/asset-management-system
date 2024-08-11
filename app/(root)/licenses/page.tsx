'use client'
import React, {useEffect, useMemo, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import LicensesTable from "@/components/tables/LicensesTable";
import {licenseStore} from "@/lib/stores/store";
import {Button} from "@/components/ui/button";
import AssetTable from "@/components/tables/AssetTable";
import {useRouter} from "next/navigation";
import {useLicenseStore} from "@/lib/stores/licenseStore";
import {DataTable} from "@/components/tables/DataTable/data-table";
import {licenseColumns} from "@/components/tables/LicensesColumns";


const Licenses = () => {
    const navigate = useRouter()
    const [licenses] = useLicenseStore((state) => [state.licenses, state.getAll])

    return (
        <div className="assets">
            <div className="transactions-header">
                <HeaderBox
                    title="Licenses"
                    subtext="Manage your licenses."
                />
            </div>
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                        <Button
                            variant={'link'}
                            onClick={() => navigate.push('/licenses/create')}>Add License
                        </Button>
                        <Button
                            variant={"link"}

                            onClick={() => navigate.push('/licenses/export')}>
                            Export
                        </Button>

                        <Button
                            variant={"link"}
                            className={'flex justify-end'}
                            onClick={() => navigate.push('/licenses/export')}>
                            Import
                        </Button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">


                    <DataTable columns={licenseColumns} data={licenses} />
                </section>
            </div>
        </div>
    )
}
export default Licenses
