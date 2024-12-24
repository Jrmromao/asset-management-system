'use client'

import { useEffect, useState } from 'react';
import { DetailView } from '@/components/shared/DetailView/DetailView';
import QRCode from "react-qr-code";
import Link from "next/link";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Scan } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import AssignAssetForm from "@/components/forms/AssignAssetForm";
import { useAssetStore } from "@/lib/stores/assetStore";
import { AssetType, DetailViewProps } from "@/components/shared/DetailView/types";
import { useRouter } from "next/navigation";
import {formatAmount} from "@/lib/utils";
import {findById} from "@/lib/actions/assets.actions";

interface AssetPageProps {
    params: {
        id: string;
    };
}

// // Define proper types for actions
// interface AssetActions {
//     onArchive: () => void;
//     onAssign?: () => void;
//     onUnassign?: () => void;
//     onDuplicate: () => void;
//     onEdit: () => void;
//     onPrintLabel: () => void;
// }

// Enhanced AssetType with optional fields
interface EnhancedAssetType {
    id: string;
    name: string;
    price: number;
    serialNumber: string;
    category: {
        name: string;
    };
    statusLabel: {
        name: string;
        colorCode: string;
    };
    assignee?: {
        name: string;
    };
    co2Score?: number;
    model: {
        name: string
    }
    assigneeId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UnassignModal = async () => {
   return  await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this operation!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, unassign it!"
    });
};

export default function AssetPage({ params }: AssetPageProps) {
    const [error, setError] = useState<string | null>(null);
    const { id } = params;
    const router = useRouter();
    const {
        isAssignOpen,
        onAssignOpen,
        onAssignClose,
        unassign,
        assets
    } = useAssetStore();

    const [asset, setAsset] = useState<EnhancedAssetType | undefined>();

    useEffect(() => {
        const fetchAsset = async () => {
            if (!id) return;

            try {
                const foundAssetResponse = await findById(id);

                if (!foundAssetResponse.error) {

                    const foundAsset = foundAssetResponse.data;

                    setAsset({
                        id: foundAsset?.id!,
                        name: foundAsset?.name ?? '',
                        price: foundAsset?.price || 0,
                        serialNumber: foundAsset?.serialNumber ?? '',
                        co2Score: foundAsset?.co2Score ?? 0,
                        category: {
                            name: foundAsset?.model?.category?.name ?? ''
                        },
                        model: {
                            name: foundAsset?.model?.name ?? ''
                        },
                        statusLabel: {
                            name: foundAsset?.statusLabel?.name ?? '',
                            colorCode: foundAsset?.statusLabel?.colorCode ?? '#000000'
                        },
                        assignee: foundAsset?.assignee?.name ? {
                            name: foundAsset?.assignee.name
                        } : undefined,
                        assigneeId: foundAsset?.assigneeId,
                        createdAt: foundAsset?.createdAt!,
                        updatedAt: foundAsset?.updatedAt!
                    });
                }

                console.log(!!foundAssetResponse?.data?.assigneeId)

            } catch (error) {
                console.error('Error fetching asset:', error);
                // Handle error appropriately - maybe set an error state
            }
        };

        fetchAsset();


    }, [id]);


    const handleUnassign = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (!asset?.id) return;

        const result =  await UnassignModal();

        if (result.isConfirmed) {
            const previousState = { ...asset };
            try {
                setAsset(prev => prev ? {
                    ...prev,
                    assigneeId: undefined,
                    assignee: undefined
                } : undefined);

                await unassign(asset.id);
                toast.success('Asset unassigned successfully');
            } catch (error) {
                setAsset(previousState);
                toast.error('Failed to unassign asset');
            }
        }
    };

    const printQRCode = (imageUrl: string) => {
        try {
            // Create print window
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (!printWindow) {
                throw new Error('Popup blocked');
            }

            // Write HTML content
            printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Image</title>
                    <style>
                        @media print {
                            @page {
                                margin: 0;
                                size: auto;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            img {
                                width: 100%;
                                height: auto;
                                page-break-inside: avoid;
                            }
                        }
                        body {
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <img 
                        src="${imageUrl}" 
                        alt="Print preview"
                        onload="setTimeout(() => { window.print(); window.close(); }, 200);"
                        onerror="window.close(); alert('Failed to load image');"
                    />
                </body>
            </html>
        `);

            printWindow.document.close();

        } catch (error) {
            console.error('Print error:', error);
            alert('Failed to print image. Please allow popups for this feature.');
        }
    };

    if (!asset) {
        return <div>Loading...</div>;
    }

    const detailViewProps: DetailViewProps = {
        title: asset.name,
        isLoading: false,
        co2Score: asset.co2Score,
        isAssigned: !!asset.assigneeId,
        error,
        fields: [
            { label: 'Name', value: asset.name, type: 'text' },
            { label: 'Price', value: asset.price, type: 'currency' },
            { label: 'Category', value: asset.category.name, type: 'text' },
            { label: 'Model', value: asset.model.name, type: 'text' },
            { label: 'Status', value: asset.statusLabel.name, type: 'text' },
            { label: 'Location', value: '[Some Location ID]', type: 'text' },
            {
                label: asset.assigneeId ? 'Assigned To' : 'Not Assigned',
                value: asset.assigneeId ? (asset.assignee?.name ?? '') : '',
                type: 'text'
            },
            { label: 'Tag Number', value: asset.serialNumber, type: 'text' },
            { label: 'Created At', value: asset.createdAt.toString(), type: 'date' },
            { label: 'Last Updated', value: asset.updatedAt.toString(), type: 'date' }
        ],
        breadcrumbs: (
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/assets">Assets</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/assets/view/${id}`}>View</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                </BreadcrumbList>
            </Breadcrumb>
        ),
        qrCode: (
            <div className="flex items-center gap-2">
                <QRCode value={`/qr-code/sample.png`} size={140} />
                <Scan className="w-6 h-6 text-gray-500" />
            </div>
        ),
        actions: {
            onArchive: () => handleAction('archive'),
            onAssign: asset.assigneeId ? undefined : () => onAssignOpen(),
            onUnassign: asset.assigneeId ? handleUnassign : undefined,
            onDuplicate: () => handleAction('duplicate'),
            onEdit: () => handleAction('edit'),
            onPrintLabel: () => printQRCode('/qr-code/sample.png')
        }
    };

    const handleAction = (action: 'archive' | 'duplicate' | 'edit' | 'print') => {
        const actions: Record<typeof action, () => void> = {
            archive: () => toast.info('Archive action not implemented'),
            duplicate: () => toast.info('Duplicate action not implemented'),
            edit: () => toast.info('Edit action not implemented', { id: 'edit' }),
            print: () => toast.info('Print label action not implemented')
        };

        actions[action]();
    };

    return (
        <>
            <DetailView {...detailViewProps} />
            <DialogContainer
                description="Assign this asset to a user"
                open={isAssignOpen}
                onOpenChange={onAssignClose}
                title="Assign Asset"
                form={
                    <AssignAssetForm
                        assetId={id}
                        onOptimisticUpdate={(userData) => {
                            // Immediately update the UI
                            setAsset(prev => prev ? {
                                ...prev,
                                assigneeId: userData.userId,
                                assignee: { name: userData.userName }
                            } : undefined);
                        }}
                        onSuccess={() => {
                            toast.success('Asset assigned successfully');
                            onAssignClose();
                        }}
                        onError={(previousData) => {
                            // Rollback the optimistic update if we have previous data
                            if (previousData) {
                                setAsset(prev => prev ? {
                                    ...prev,
                                    assigneeId: undefined,
                                    assignee: undefined
                                } : undefined);
                            }
                            toast.error('Failed to assign asset');
                        }}
                    />
                }
            />
        </>
    );
}