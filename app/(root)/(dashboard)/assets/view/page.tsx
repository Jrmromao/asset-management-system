'use client'

import React, {useEffect, useMemo, useState} from 'react'
import {useRouter, useSearchParams} from "next/navigation"

import {findById} from "@/lib/actions/assets.actions";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table";
import Image from "next/image";
import CustomButton from "@/components/CustomButton";
import {FaArchive, FaChevronLeft, FaChevronRight, FaCopy, FaPen, FaPrint} from 'react-icons/fa';
import {findAllByOrganization} from "@/lib/actions/auditLog.actions";
import {AuditLog} from "@prisma/client";
import {useAssetStore} from "@/lib/stores/assetStore";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import AssignAssetForm from "@/components/forms/AsignAssetForm";
import Swal from "sweetalert2";
import {toast} from "sonner";
import {formatAmount} from "@/lib/utils";
import QRCode from "react-qr-code";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const View = () => {
    const [asset, setAsset] = useState<Asset>()
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>()
    const searchParams = useSearchParams()
    const navigate = useRouter()
    const id = String(searchParams.get('id'))
    const [isAssignOpen, onOpen, unassign] = useAssetStore((state) => [state.isAssignOpen, state.onAssignOpen, state.unassign])

    useEffect(() => {
        if (!id) {
            navigate.back();
            return;
        }
        findById(id as string)
            .then(asset => {
                setAsset(asset.data);
            })
    }, [isAssignOpen]);


    function printImage(imageUrl: string) {
        const printWindow = window.open('', '', 'width=600,height=400');

        if (printWindow) { // Check if the window opened successfully
            printWindow.document.write(`
      <html>
        <head>
          <title>Print Image</title>
        </head>
        <body>
          <img src="${imageUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
            printWindow.document.close();
        } else {
            // Handle the case where the popup is blocked
            console.error('Popup window blocked. Please allow popups for this feature.');
            // You might want to display a user-friendly message here
        }
    }

    const handleUnassign = () => {
        Swal.fire({
            title: "Are you sure?",
            text: `You won't be able to revert this operation!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, unassign it!"
        }).then((result) => {
            if (result.isConfirmed) {
                unassign(asset?.id!).then(_ => {
                    if (asset) {
                        setAsset({
                            ...asset,
                            assigneeId: undefined
                        })
                    }


                })
                toast.success('The Asset has been unassigned!', {
                    position: 'top-right',
                })
            }
        })


    }



    return (
        <div className="assets">

            <Breadcrumb className="hidden md:flex pb-5">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/assets">Assets</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/app/(root)/(dashboard)/assets/view/?id=${id}`}>View</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                </BreadcrumbList>
            </Breadcrumb>

            <DialogContainer open={isAssignOpen} onOpenChange={onOpen} title={'Assign Asset'}
                             description={'Assign this asset to a user'}
                             form={<AssignAssetForm assetId={id}/>}
            />

            {asset && <>
              <div className="space-y-6">
                 <section className="flex w-full flex-col gap-6">
                  <Card className={'w-full'}>
                    <CardHeader className="text-xl"> ${asset?.name}</CardHeader>
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
                              <p className="font-semibold text-gray-600">{formatAmount(asset?.price) }</p>
                            </div>
                            <div className="p-4">
                              <h2 className="text-gray-500 mb-2">Category</h2>
                              <p className="font-semibold text-gray-600">{asset?.category?.name}</p>
                            </div>

                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 ">
                              <h2 className="text-gray-500 mb-2">Status Label</h2>
                              <p
                                className={`font-semibold text-[${asset?.statusLabel?.colorCode}]`}>{asset?.statusLabel?.name}</p>
                            </div>
                            <div className="p-4">
                              <h2 className="text-gray-500 mb-2">Location</h2>
                              <p className="font-semibold text-gray-600">[Some Location ID]</p>
                            </div>


                            <div className="p-4">
                              <h2 className="text-gray-500 mb-2">{asset?.assigneeId ? 'Assigned To' : 'Not Assigned'}</h2>
                              <p className="font-semibold text-gray-600">{asset?.assigneeId ? asset?.assignee?.name : ''}</p>
                            </div>



                            <div className="p-4">
                              <h2 className="text-gray-500 mb-2">Tag Num</h2>
                              <p className="font-semibold text-gray-600">{asset?.serialNumber}</p>
                            </div>

                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 ">
                              <h2 className="text-gray-500 mb-2">CO2 Metric</h2>
                                <p  className={`font-semibold text-[${asset?.statusLabel?.colorCode}]`}>{asset?.statusLabel?.name}</p>
                            </div>
                            <div className="p-4">
                              <h2 className="text-gray-500 mb-2">Location</h2>
                              <p className="font-semibold text-gray-600">[Some Location ID]</p>
                            </div>
                            <div className="p-4">
                              <h2 className="text-gray-500 mb-2">Created At</h2>
                              <p className="font-semibold text-gray-600">{new Date(asset?.createdAt!).toLocaleString()}</p>
                            </div>
                            <div className="p-4">
                              <h2 className="text-gray-500 mb-2">Last Updated At</h2>
                              <p
                                className="font-semibold text-gray-600">{new Date(asset?.updatedAt!).toLocaleString()}</p>
                            </div>

                          </div>
                        </div>
                        <div className=" p-4 flex items-center justify-center">
                          {/*<Image src={'/qr-code/sample.png'} alt={''} width={158} height={150}*/}
                          {/*       className={'mt-5'}/>*/}

                            <QRCode
                                value={asset.name}
                                size={140}
                            />

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
                          {
                              asset?.assigneeId ?
                                  <CustomButton
                                      size="sm"
                                      className={'w-full sm:w-auto'}
                                      variant="outline"
                                      action={handleUnassign}
                                      value="Unassign"
                                      Icon={FaChevronLeft}
                                  /> : <CustomButton
                                      size="sm"
                                      className={'w-full sm:w-auto'}
                                      variant="outline"
                                      action={onOpen}
                                      value="Assign"
                                      Icon={FaChevronRight}
                                  />
                          }


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
                          action={() => navigate.push(`/assets/update/?id=${asset?.id}`)}
                          value="Edit"
                          Icon={FaPen}
                        />
                        <CustomButton
                          className={'w-full sm:w-auto md:w-auto'}
                          size="sm"
                          variant="outline"
                          action={() => printImage('/qr-code/sample.png')}
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
                      {auditLogs?.length === 0 ? <p>No Activity Log</p> : (
                          <Table className="w-full table-auto bg-gray-100 text-gray-600 rounded-lg">
                              <TableBody>
                                  {auditLogs?.map((auditLog) => (
                                      <TableRow className="w-full bg-gray-100" key={auditLog?.id}>
                                          <TableCell
                                              className="border px-4 py-2 sm:w-1/6">{auditLog?.createdAt.toDateString()}</TableCell>
                                          <TableCell className="border px-4 py-2">{auditLog?.action}</TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>)}
                  </CardContent>
                </Card>

              </section>
            </>}
        </div>
    )
}
export default View
