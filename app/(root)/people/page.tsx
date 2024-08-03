



'use client'
import React, {useMemo, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
// import {getLicenses} from "@/lib/actions/licenseTool.actions";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import LicensesTable from "@/components/tables/LicensesTable";
import {licenseStore} from "@/lib/stores/store";
import {Button} from "@/components/ui/button";
import AssetTable from "@/components/tables/AssetTable";
import {useRouter} from "next/navigation";
import {usePeopleStore} from "@/lib/stores/userStore";


const People = () => {
    const [refresh, setRefresh] = useState(0)
     const navigate = useRouter()

    return (

        <div className="assets">
            <div className="transactions-header">
                <HeaderBox
                    title="People"
                    subtext="Manage asset assignees."
                />
            </div>
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                        <Button
                            variant={'link'}
                            onClick={() => navigate.push('/people/create')}>Add Assignee
                        </Button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                 </section>
            </div>
        </div>
    )
}
export default People
