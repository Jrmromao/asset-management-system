'use client'
import React, {useCallback, useEffect, useMemo} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useLicenseStore} from "@/lib/stores/licenseStore";
import {DataTable} from "@/components/tables/DataTable/data-table";
import {licenseColumns} from "@/components/tables/LicensesColumns";


const Licenses = () => {
    const navigate = useRouter()
    const [licenses, getAll, deleteLicense] = useLicenseStore((state) => [state.licenses, state.getAll, state.delete])
    const handleDelete = async (id: string) => {
        await deleteLicense(id).then(_ => {
            getAll()
        })
    }
    const handleView = async (id: string) => {
        navigate.push(`/assets/view/?id=${id}`)
    }
    const onDelete = useCallback((accessory: any) => handleDelete(accessory?.id!), [])
    const onView = useCallback((accessory: any) => handleView(accessory?.id!), [])
    const columns = useMemo(() => licenseColumns({onDelete, onView}), []);

    useEffect(() => {
        getAll();
    }, []);


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
                    <DataTable columns={columns} data={licenses}/>
                </section>
            </div>
        </div>
    )
}
export default Licenses
