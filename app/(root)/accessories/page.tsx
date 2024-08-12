'use client'
import React, {useCallback, useMemo, useState} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useAccessoryStore} from "@/lib/stores/accessoryStore";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {DataTable} from "@/components/tables/DataTable/data-table";
import {accessoriesColumns} from "@/components/tables/AccessoriesColumns";
import {licenseColumns} from "@/components/tables/LicensesColumns";
import {assetColumns} from "@/components/tables/AssetColumns";
import {toast} from "sonner";
import {Accessory} from "@prisma/client";


const Consumables = () => {
    const [licensesList, setLicenseList] = useState<[]>()
    const [accessories, getAll, deleteAccessory] = useAccessoryStore((state) => [state.accessories, state.getAll, state.delete])

    const handleDelete = async (id: number) => {
        await deleteAccessory(id).then(_ => {
            getAll()
            toast.success('Accessory has been created')
        })
    }

    const handleView = async (id: number) => {
        navigate.push(`/assets/view/?id=${id}`)
    }
    const onDelete = useCallback((accessory: any) => handleDelete(accessory?.id!), [])
    const onView = useCallback((accessory: any) => handleView(accessory?.id!), [])


    const columns = useMemo(() => accessoriesColumns({onDelete, onView}), []);

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
                    <DataTable columns={columns} data={accessories}/>
                </section>
            </div>
        </div>)
}
export default Consumables
