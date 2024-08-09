'use client'
import React, {useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import LicensesTable from "@/components/tables/LicensesTable";
import {licenseStore} from "@/lib/stores/store";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";


const Consumables = () => {
    const [licensesList, setLicenseList] = useState<[]>()
    const refresh = licenseStore((state) => state.shouldRefresh)
    // const memoAssetList = useMemo(() => getLicenses().then(aceessories => setLicenseList(aceessories)), [setLicenseList, refresh]);

    const navigate = useRouter()

    return (
        <div className="assets">
            <div className="transactions-header">
                <HeaderBox
                    title="Accessories"
                    subtext="Manage your accessories."
                />
            </div>
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                        <Button
                            variant={'link'}
                            onClick={() => navigate.push('/accessories/create')}>Create Accessory
                        </Button>

                        <Button
                            variant={"link"}
                            className={'flex justify-end'}
                            onClick={() => navigate.push('/accessories/export')}>
                            Import
                        </Button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                    <LicensesTable/>
                </section>
            </div>
        </div>)
}
export default Consumables
