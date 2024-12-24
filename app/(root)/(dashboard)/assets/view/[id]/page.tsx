'use client'

import {useState} from 'react';
import {DetailView} from '@/components/shared/DetailView/DetailView';
import QRCode from "react-qr-code";
import Link from "next/link";
import {toast} from "sonner";
import Swal from "sweetalert2";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import AssignAssetForm from "@/components/forms/AsignAssetForm";
import {useAssetStore} from "@/lib/stores/assetStore";
import {AssetType, DetailViewProps} from "@/components/shared/DetailView/types";
import {useRouter} from "next/navigation";


interface AssetPageProps {
    params: {
        id: string;
    };
}

const mockAsset: AssetType = {
    id: "asset-123eee",
    name: "MacBook Pro M2",
    price: 2499.99,
    serialNumber: "MBP2023-001",
    category: {
        name: "Laptops"
    },
    statusLabel: {
        name: "In Use",
        colorCode: "#00ff00"
    },
    assignee: {
        name: "John Doe"
    },
    assigneeId: "user-123",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2024-03-15")
};

export default function AssetPage({params}: AssetPageProps) {
    const [asset, setAsset] = useState<AssetType>(mockAsset);
    const [error, setError] = useState<string | null>(null);
    const navigate = useRouter();
    const {id} = params;
    const router = useRouter()
    const {
        isAssignOpen,
        onAssignOpen,
        onAssignClose,
        unassign,
    } = useAssetStore();

    const handleUnassign = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (!asset?.id) return;

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this operation!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, unassign it!"
        });

        if (result.isConfirmed) {
            const previousState = {...asset};
            try {
                setAsset(prev => ({
                    ...prev,
                    assigneeId: undefined,
                    assignee: undefined
                }));

                await unassign(asset.id);
                toast.success('Asset unassigned successfully');
            } catch (error) {
                setAsset(previousState);
                toast.error('Failed to unassign asset');
            }
        }
    };

    const printQRCode = () => {
        try {
            const printWindow = window.open('', '', 'width=600,height=400');
            if (!printWindow) throw new Error('Popup blocked');

            printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="/qr-code/sample.png" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
        } catch (error) {
            toast.error('Failed to print QR code. Please allow popups for this feature.');
        }
    };

    const detailViewProps: DetailViewProps = {
        title: asset.name,
        isLoading: false,
        error,
        fields: [
            {label: 'Name', value: asset.name, type: 'text'},
            {label: 'Price', value: asset.price, type: 'currency'},
            {label: 'Category', value: asset.category?.name || '', type: 'text'},
            {label: 'Status', value: asset.statusLabel?.name || '', type: 'text'},
            {label: 'Location', value: '[Some Location ID]', type: 'text'},
            {
                label: asset.assigneeId ? 'Assigned To' : 'Not Assigned',
                value: asset.assigneeId ? (asset.assignee?.name || '') : '',
                type: 'text'
            },
            {label: 'Tag Number', value: asset.serialNumber, type: 'text'},
            {label: 'Created At', value: asset.createdAt.toString(), type: 'date'},
            {label: 'Last Updated', value: asset.updatedAt.toString(), type: 'date'}
        ],
        breadcrumbs: (
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/assets">Assets</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/assets/view/${id}`}>View</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator/>
                </BreadcrumbList>
            </Breadcrumb>
        ),
        qrCode: (
            <QRCode
                value={`/qr-code/sample.png`}
                size={140}
            />
        ),
        actions: {
            onArchive: () => handleArchive(),
            onAssign: asset.assigneeId ? undefined : () => onAssignOpen(),
            onUnassign: asset.assigneeId ? handleUnassign : undefined,
            onDuplicate: () => handleDuplicate(),
            onEdit: () => handleEdit(),
            onPrintLabel: () => printQRCode()
        }
    };
    const handleArchive = () => {
        toast.info('Archive action not implemented');
        console.log('Archive action not implemented');
    };

    const handleDuplicate = () => {
        toast.info('Duplicate action not implemented');
    };

    const handleEdit = () => {
        toast.info('Duplicate action not implemented', {id: 'edit'});
        // router.push(`/assets/update/?id=${asset.id}`);
    };

    const handlePrintLabel = () => {
        // Your print QR code logic here
        toast.info('Print label action not implemented');
    };

    const handleAction = (action: 'archive' | 'duplicate' | 'edit' | 'print') => {
        switch (action) {
            case 'archive':
                handleArchive()
                break;
            case 'duplicate':
                handleDuplicate()
                break;
            case 'edit':
                handleEdit()
                break;
            case 'print':
                handlePrintLabel()
                break;
        }
    };


    return (
        <>
            <DetailView
                asset={asset}
                qrCode={'/qr-code/sample.png'}
                actions={{
                    onArchive: () => handleAction('archive'),
                    onDuplicate: () => handleAction('duplicate'),
                    onEdit: () => handleAction('edit'),
                    onPrintLabel: () => handleAction('print')
                }}
                {...detailViewProps}
            />
            <DialogContainer
                description="Assign this asset to a user"
                open={isAssignOpen}
                onOpenChange={onAssignClose}
                title="Assign Asset"
                form={
                    <AssignAssetForm
                        assetId={id}
                        onBeforeSubmit={async (userData) => {
                            const previousState = {...asset};
                            try {
                                setAsset(prev => ({
                                    ...prev,
                                    assigneeId: userData.userId,
                                    assignee: {name: userData.userName}
                                }));

                                onAssignClose();
                                toast.success('Asset assigned successfully');
                            } catch (error) {
                                setAsset(previousState);
                                toast.error('Failed to assign asset');
                            }
                        }}
                        onError={undefined}
                    />
                }
            />
        </>
    );
}