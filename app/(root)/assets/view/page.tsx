'use client'

import React, {useEffect, useState} from 'react'
import {useRouter, useSearchParams} from "next/navigation"
import {findById} from "@/lib/actions/assets.actions";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table";
import Image from "next/image";
import CustomButton from "@/components/CustomButton";
import {FaArchive, FaChevronRight, FaCopy, FaPen, FaPrint} from 'react-icons/fa';
import {findAllByOrganization} from "@/lib/actions/auditLog.actions";
import {AuditLog} from "@prisma/client"; // Example icon from react-icons

const View = () => {
    const [asset, setAsset] = useState<Asset>()
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>()
    const searchParams = useSearchParams()
    const navigate = useRouter()
    const id = +searchParams.get('id')!


    useEffect(() => {
        if (!id) {
            navigate.back()
            return
        }
        findById(id).then(asset => setAsset(asset))
        findAllByOrganization(id).then(auditLog => setAuditLogs(auditLog))

    }, [setAsset, findById]);


    return (
        <div className="assets">
            <div className="space-y-6">
                <section className="flex w-full flex-col gap-6">
                    <Card className={'w-full'}>
                        <CardHeader className="text-xl">MacBook M1 Pro</CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mt-6">
                                <div className="lg:col-span-5 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 ">
                                            <h2 className="text-gray-500 mb-2">Name</h2>
                                            <p className="font-semibold text-gray-600">{asset?.name}</p>
                                        </div>
                                        <div className="p-4">
                                            <h2 className="text-gray-500 mb-2">Price</h2>
                                            <p className="font-semibold text-gray-600">[PRICE]</p>
                                        </div>
                                        <div className="p-4">
                                            <h2 className="text-gray-500 mb-2">Created At</h2>
                                            <p className="font-semibold text-gray-600">{new Date().toDateString()}</p>
                                        </div>
                                        <div className="p-4">
                                            <h2 className="text-gray-500 mb-2">Created At</h2>
                                            <p className="font-semibold text-gray-600">{new Date().toDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 ">
                                            <h2 className="text-gray-500 mb-2">Status</h2>
                                            <p className="font-semibold text-gray-600">[ACTIVE]</p>
                                        </div>
                                        <div className="p-4">
                                            <h2 className="text-gray-500 mb-2">Location</h2>
                                            <p className="font-semibold text-gray-600">[Some Location ID]</p>
                                        </div>
                                        <div className="p-4">
                                            <h2 className="text-gray-500 mb-2">Tag Num</h2>
                                            <p className="font-semibold text-gray-600">[Some Tag ID]</p>
                                        </div>
                                        <div className="p-4">
                                            <h2 className="text-gray-500 mb-2">Tag Num</h2>
                                            <p className="font-semibold text-gray-600">[Some Tag ID]</p>
                                        </div>

                                    </div>
                                </div>
                                <div className=" p-4 flex items-center justify-center">
                                    <Image src={'/qr-code/sample.png'} alt={''} width={158} height={150} className={'mt-5'}/>
                                </div>

                            </div>

                        </CardContent>
                        <CardFooter className={'bg-white'}>


                            <div
                                className="w-full flex flex-col sm:flex-row lg:justify-end gap-2 md:flex-row md:justify-center mt-4 md:mt-0">
                                <CustomButton
                                    size="sm"
                                    className={'w-full sm:w-auto'}
                                    variant="outline"
                                    action={navigate.back}
                                    value="Archive"
                                    Icon={FaArchive}
                                />
                                <CustomButton
                                    size="sm"
                                    className={'w-full sm:w-auto'}
                                    variant="outline"
                                    action={navigate.back}
                                    value="Assign"
                                    Icon={FaChevronRight}
                                />
                                <CustomButton
                                    className={'w-full sm:w-auto md:w-auto'}
                                    size="sm"
                                    variant="outline"
                                    action={navigate.back}
                                    value="Duplicate"
                                    Icon={FaCopy}
                                />
                                <CustomButton
                                    className={'w-full sm:w-auto md:w-auto'}
                                    size="sm"
                                    variant="outline"
                                    action={navigate.back}
                                    value="Edit"
                                    Icon={FaPen}
                                />
                                <CustomButton
                                    className={'w-full sm:w-auto md:w-auto'}
                                    size="sm"
                                    variant="outline"
                                    action={navigate.back}
                                    value="Print Label"
                                    Icon={FaPrint}
                                />
                            </div>
                        </CardFooter>
                    </Card>
                </section>
            </div>
            <section className="flex w-full">
                <Card className="w-full mx-auto py-3 max-h-900 overflow-y-auto">
                    <CardHeader className="px-4 text-xl">Activity Log</CardHeader>
                    <CardContent className="max-h-900 overflow-y-auto">
                        {auditLogs?.length === 0 ?  <p>No Activity Log</p> :  (<Table className="w-full table-auto bg-gray-100 text-gray-600 rounded-lg">
                            <TableBody>
                                {auditLogs?.map((auditLog) => (
                                    <TableRow className="w-full bg-gray-100" key={auditLog?.id}>
                                        <TableCell className="border px-4 py-2 sm:w-1/6">{auditLog?.createdAt.toDateString()}</TableCell>
                                        <TableCell className="border px-4 py-2">{auditLog?.action}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>)}
                    </CardContent>
                </Card>

            </section>

        </div>
    )
}
export default View
