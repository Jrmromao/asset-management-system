'use client'
import React, {useMemo, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import LicensesTable from "@/components/tables/LicensesTable";
import {licenseStore} from "@/lib/stores/store";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {DataTable} from "@/components/tables/DataTable/data-table";
import {kitColumns} from "@/components/tables/KitsColumns";
import {assetColumns} from "@/components/tables/AssetColumns";


const Consumables = () => {
    const [licensesList, setLicenseList] = useState<[]>()
    const refresh = licenseStore((state) => state.shouldRefresh)
    // const memoAssetList = useMemo(() => getLicenses().then(aceessories => setLicenseList(aceessories)), [setLicenseList, refresh]);

    const handleDelete = async (id: number) => {

    }

    const handleView = async (id: number) => {
        navigate.push(`/kits/view/?id=${id}`)
    }

    // const columns = useMemo(() => assetColumns({}), []);

    const navigate = useRouter()

    return (
        <div className="assets">
            <div className="transactions-header">
                <HeaderBox
                    title="Kits"
                    subtext="Manage your kits and assign them to users"
                />
            </div>
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                        <Button
                            variant={'link'}
                            onClick={() => navigate.push('/accessories/create')}>Create Kit
                        </Button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                    {/*<DataTable columns={kitColumns} data={assets}/>*/}
                </section>
            </div>
        </div>)
}
export default Consumables
