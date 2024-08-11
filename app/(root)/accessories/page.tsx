'use client'
import React, {useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useAccessoryStore} from "@/lib/stores/accessoryStore";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {DataTable} from "@/components/tables/DataTable/data-table";
import {accessoriesColumns} from "@/components/tables/AccessoriesColumns";
import {licenseColumns} from "@/components/tables/LicensesColumns";


const Consumables = () => {
    const [licensesList, setLicenseList] = useState<[]>()
    const [accessories] = useAccessoryStore((state) => [state.accessories])
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
                    <DataTable columns={accessoriesColumns} data={accessories} />
                </section>
            </div>
        </div>)
}
export default Consumables
