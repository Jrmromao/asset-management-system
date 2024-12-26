'use client'

import {useEffect, useState} from 'react';
import {DetailView} from '@/components/shared/DetailView/DetailView';
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
import AssignmentForm from "@/components/forms/AssignmentForm";
import {DetailViewProps} from "@/components/shared/DetailView/types";
import {findById} from "@/lib/actions/license.actions";
import ActivityLog from "@/components/shared/ActivityLog/ActivityLog";
import {useAccessoryStore} from "@/lib/stores/accessoryStore";
import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";
import {useItemDetails} from "@/components/shared/DetailsTabs/useItemDetails";
import {BoxIcon} from "lucide-react";

interface AssetPageProps {
    params: {
        id: string;
    };
}

interface EnhancedLicenseType {
    id: string;
    name: string;
    statusLabel: {
        name: string;
        colorCode: string;
    };
    purchaseDate: Date;
    renewalDate: Date;
    co2Score?: number;
    location: {
        name: string
    }
    department: {
        name: string
    },
    assigneeId?: string;
    useBy: {
        name: string
    },
    inventory: {
        name: string
    },
    totalQuantity: number
    reorderPoint: number
    alertEmail: string
    supplier: {
        name: string
    }
    poNumber: string
}

const UnassignModal = async () => {
    return await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this operation!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, unassign it!"
    });
};

export default function View({ params }: AssetPageProps) {
    const [error, setError] = useState<string | null>(null);
    const { id } = params;
    const {isAssignOpen, onAssignOpen, onAssignClose} = useAccessoryStore();

    const [accessory, setAccessory] = useState<EnhancedLicenseType | undefined>();
    const { relationships, attachments, isLoading } = useItemDetails({
        itemId: id,
        itemType: 'license'
    });

    useEffect(() => {
        const fetchAsset = async () => {
            if (!id) return;

            try {
                const foundLicenseResponse = await findById(id);
                if (!foundLicenseResponse.error) {
                    const foundLicense = foundLicenseResponse.data;


                    console.log('foundLicense: ',foundLicense)

                    setAccessory({
                        id: foundLicense?.id!,
                        name: foundLicense?.name ?? '',
                        co2Score: 23,
                        statusLabel: {
                            name: foundLicense?.statusLabel?.name ?? '',
                            colorCode: foundLicense?.statusLabel?.colorCode ?? '#000000'
                        },
                        useBy: {
                            name: ''
                        },
                        location: {
                            name: foundLicense?.departmentLocation?.name ?? ''
                        },
                        department: {
                            name: foundLicense?.department?.name ?? ''
                        },
                        // assigneeId: foundLicense?.assigneeId!,
                        purchaseDate: foundLicense?.purchaseDate ?? new Date(),
                        renewalDate: foundLicense?.renewalDate ?? new Date(),
                        inventory: {
                            name: foundLicense?.inventory?.name ?? ''
                        },
                        totalQuantity: foundLicense?.licenseCopiesCount ?? 0,
                        reorderPoint: foundLicense?.minCopiesAlert ?? 0,
                        alertEmail: foundLicense?.licensedEmail ?? '',
                        supplier: {
                            name: foundLicense?.supplier?.name ?? ''
                        },
                        poNumber: foundLicense?.poNumber ?? ''
                    });
                }
            } catch (error) {
                console.error('Error fetching asset:', error);
                setError('Failed to fetch asset details');
            }
        };

        fetchAsset();
    }, [id]);

    const handleUnassign = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        if (!accessory?.id) return;

        const result = await UnassignModal();

        if (result.isConfirmed) {
            const previousState = { ...accessory };
            try {
                setAccessory(prev => prev ? {
                    ...prev,
                    assigneeId: undefined,
                    useBy: { name: '' }
                } : undefined);

                toast.success('Asset unassigned successfully');
            } catch (error) {
                setAccessory(previousState);
                toast.error('Failed to unassign asset');
            }
        }
    };

    if (!accessory) {
        return <div>Loading...</div>;
    }

    const detailViewProps: DetailViewProps = {
        title: accessory.name,
        isLoading: false,
        co2Score: accessory.co2Score,
        isAssigned: !!accessory.assigneeId,
        error,
        fields: [
            { label: 'Name', value: accessory.name, type: 'text' },
            // { label: 'Category', value: accessory.category.name, type: 'text' },
            // { label: 'Model', value: accessory.model.name, type: 'text' },
            { label: 'Status', value: accessory.statusLabel.name, type: 'text' },
            { label: 'Location', value: accessory.location.name, type: 'text' },
            { label: 'Department', value: accessory.department.name, type: 'text' },
            { label: 'Purchase Date', value: new Date(accessory.purchaseDate).toLocaleDateString(), type: 'text' },
            { label: 'Renewal Date', value: new Date(accessory.renewalDate).toLocaleDateString(), type: 'text' },
            {
                label: accessory.assigneeId ? 'Assigned To' : 'Not Assigned',
                value: accessory.useBy.name || '',
                type: 'text'
            },
            { label: 'Inventory', value: accessory.inventory.name, type: 'text' },
            { label: 'Total Quantity', value: accessory.totalQuantity, type: 'text' },
            { label: 'Reorder Point', value: accessory.reorderPoint, type: 'text' },
            { label: 'Alert Email', value: accessory.alertEmail, type: 'text' },
            { label: 'Supplier', value: accessory.supplier.name, type: 'text' },
            { label: 'PO Number', value: accessory.poNumber, type: 'text' }
        ],
        breadcrumbs: (
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/licenses">Licenses</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/licenses/${id}`}>View</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                </BreadcrumbList>
            </Breadcrumb>
        ),
        qrCode: null,
        actions: {
            onArchive: () => handleAction('archive'),
            onAssign: accessory.assigneeId ? undefined : () => onAssignOpen(),
            onUnassign: accessory.assigneeId ? handleUnassign : undefined,
            onDuplicate: () => handleAction('duplicate'),
            onEdit: () => handleAction('edit'),
            onPrintLabel: () => handleAction('print')
        },
        sourceData: 'accessory'
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
                description="Assign this License to a user or Asset"
                open={isAssignOpen}
                onOpenChange={onAssignClose}
                title="Assign Asset"
                form={
                    <AssignmentForm
                        itemId={id}
                        type="license"
                        assignAction={() => {
                        }}
                        onOptimisticUpdate={(userData) => {
                            setAccessory(prev => prev ? {
                                ...prev,
                                assigneeId: userData.userId,
                                useBy: {name: userData.userName}
                            } : undefined);
                        }}
                        onSuccess={() => {
                            toast.success('Asset assigned successfully');
                            onAssignClose();
                        }}
                        onError={(previousData) => {
                            if (previousData) {
                                setAccessory(prev => prev ? {
                                    ...prev,
                                    assigneeId: undefined,
                                    useBy: {name: ''}
                                } : undefined);
                            }
                            toast.error('Failed to assign asset');
                        }}
                    />
                }
            />

            <div className="mt-5 ">
                <ItemDetailsTabs
                    itemId={id}
                    itemType="license"
                    relationships={relationships}
                    attachments={attachments}
                    customTabs={{
                        inventory: {
                            label: "Inventory",
                            icon: <BoxIcon className="h-4 w-4"/>,
                            content: (
                                <div>
                                    {/* Custom inventory content */}
                                </div>
                            )
                        }
                    }}
                />
            </div>
        </>
    );
}