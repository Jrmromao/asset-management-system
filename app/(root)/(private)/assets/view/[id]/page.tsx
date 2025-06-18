// "use client";

// import { useEffect, useState } from "react";
// import { DetailView } from "@/components/shared/DetailView/DetailView";
// import QRCode from "react-qr-code";
// import Link from "next/link";
// import { toast } from "sonner";
// import Swal from "sweetalert2";
// import { Scan } from "lucide-react";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { DialogContainer } from "@/components/dialogs/DialogContainer";
// import AssignmentForm from "@/components/forms/AssignmentForm";
// import { useAssetStore } from "@/lib/stores/assetStore";
// import { DetailViewProps } from "@/components/shared/DetailView/types";
// import { checkin, checkout, findById } from "@/lib/actions/assets.actions";
// import DetailViewSkeleton from "@/components/shared/DetailView/DetailViewSkeleton";
// import printQRCode from "@/utils/QRCodePrinter";
// import { useRouter } from "next/navigation";
// import ItemDetailsTabs from "@/components/shared/DetailsTabs/ItemDetailsTabs";

// interface AssetPageProps {
//   params: {
//     id: string;
//   };
// }

// interface EnhancedAssetType {
//   id: string;
//   name: string;
//   price: number;
//   serialNumber: string;
//   status: string;
//   category: {
//     name: string;
//   };
//   statusLabel: {
//     name: string;
//     colorCode: string;
//   };
//   assignee?: {
//     name: string;
//   };
//   co2Score?: {
//     co2e: number;
//     units: string;
//   };
//   model: {
//     name: string;
//   };
//   location: {
//     name: string;
//   };
//   department: {
//     name: string;
//   };
//   formTemplate: {
//     id: string;
//     name: string;
//     values: any[];
//   };
//   auditLogs: AuditLog[];
//   assigneeId?: string;
//   createdAt: Date;
//   updatedAt: Date;
//   assetHistory: AssetHistory[];
//   usedBy: UserItems[];
// }

// const UnassignModal = async () => {
//   return await Swal.fire({
//     title: "Are you sure?",
//     text: "You won't be able to revert this operation!",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#3085d6",
//     cancelButtonColor: "#d33",
//     confirmButtonText: "Yes, unassign it!",
//   });
// };

// interface LoadingStates {
//   isInitialLoading: boolean;
//   isCheckingIn: Set<string>;
//   isAssigning: boolean;
//   isRefreshing: boolean;
// }

// export default function AssetPage({ params }: AssetPageProps) {
//   const [error, setError] = useState<string | null>(null);
//   const { id } = params;
//   const [loadingStates, setLoadingStates] = useState<LoadingStates>({
//     isInitialLoading: true,
//     isCheckingIn: new Set<string>(),
//     isAssigning: false,
//     isRefreshing: false,
//   });

//   const { isAssignOpen, onAssignOpen, onAssignClose } = useAssetStore();
//   const navigate = useRouter();
//   const [asset, setAsset] = useState<EnhancedAssetType | undefined>();

//   const handleCheckIn = async (userAccessoryId: string) => {};

//   useEffect(() => {
//     const fetchAsset = async () => {
//       if (!id) return;

//       try {
//         const foundAssetResponse = await findById(id);

//         if (!foundAssetResponse.error && foundAssetResponse.data) {
//           const foundAsset = foundAssetResponse.data;
//           const allValues =
//             foundAsset?.formTemplateValues?.map((item) => item?.values) ?? [];
//           let co2Score = 0;
//           let units = "";

//           if (foundAsset?.Co2eRecord?.[0]) {
//             co2Score = foundAsset.Co2eRecord[0].co2e;
//             units = foundAsset.Co2eRecord[0].units;
//           }

//           setAsset({
//             id: foundAsset?.id ?? "",
//             name: foundAsset?.name ?? "",
//             price: foundAsset?.price ?? 0,
//             status: foundAsset?.status ?? "",
//             serialNumber: foundAsset?.serialNumber ?? "",
//             co2Score: {
//               co2e: co2Score,
//               units: units,
//             },
//             category: {
//               name: foundAsset?.formTemplate?.name ?? "-",
//             },
//             model: {
//               name: foundAsset?.model?.name ?? "",
//             },
//             statusLabel: {
//               name: foundAsset?.statusLabel?.name ?? "",
//               colorCode: foundAsset?.statusLabel?.colorCode ?? "#000000",
//             },
//             assignee: foundAsset?.assignee?.name
//               ? {
//                   name: foundAsset.assignee.name,
//                 }
//               : undefined,
//             location: {
//               name: foundAsset?.departmentLocation?.name ?? "",
//             },
//             department: {
//               name: foundAsset?.department?.name ?? "",
//             },
//             formTemplate: {
//               id: foundAsset?.formTemplate?.id ?? "",
//               name: foundAsset?.formTemplate?.name ?? "",
//               values: allValues ?? [],
//             },
//             assetHistory: foundAsset?.assetHistory ?? [],
//             auditLogs: foundAsset?.auditLogs ?? [],
//             assigneeId: foundAsset?.assigneeId ?? "",
//             createdAt: foundAsset?.createdAt ?? new Date(),
//             updatedAt: foundAsset?.updatedAt ?? new Date(),
//             usedBy: [],
//           });
//         }
//       } catch (error) {
//         console.error("Error fetching asset:", error);
//         setError("Failed to load asset details");
//       } finally {
//         setLoadingStates(prev => ({ ...prev, isInitialLoading: false }));
//       }
//     };

//     fetchAsset();
//   }, [id]);

//   const handleUnassign = async (e?: React.MouseEvent) => {
//     e?.preventDefault();
//     if (!asset?.id) return;

//     const result = await UnassignModal();

//     if (result.isConfirmed) {
//       const previousState = { ...asset };
//       try {
//         setAsset((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 assigneeId: undefined,
//                 assignee: undefined,
//               }
//             : undefined,
//         );

//         await checkin(asset.id);
//         const freshData = await findById(asset.id);
//         if (!freshData.error && freshData.data) {
//           setAsset((prev) => {
//             if (!prev) return undefined;

//             return {
//               ...prev,
//               auditLogs: freshData?.data?.auditLogs ?? [],
//               assigneeId: undefined,
//               assignee: undefined,
//             };
//           });
//         }
//         toast.success("Asset unassigned successfully");
//       } catch (error) {
//         setAsset(previousState);
//         toast.error("Failed to unassign asset");
//       }
//     }
//   };

//   const canPerformActions = (status: string) => {
//     return status !== "Inactive";
//   };

//   const handleAssignmentAction = (status: string) => {
//     if (!canPerformActions(status)) {
//       return undefined;
//     }
//     return asset?.assigneeId ? undefined : () => onAssignOpen();
//   };

//   const handleUnassignmentAction = (status: string) => {
//     if (!canPerformActions(status)) {
//       return undefined;
//     }
//     return asset?.assigneeId ? handleUnassign : undefined;
//   };

//   const detailViewProps: DetailViewProps = {
//     title: asset?.name ?? "Untitled Asset",
//     isLoading: loadingStates.isInitialLoading,
//     co2Score: {
//       co2e: asset?.co2Score?.co2e ?? 0,
//       units: asset?.co2Score?.units ?? "kg",
//     },
//     isAssigned: Boolean(asset?.assigneeId),
//     error,
//     fields: [
//       { label: "Name", value: asset?.name ?? "", type: "text" },
//       { label: "Category", value: asset?.category?.name ?? "", type: "text" },
//       { label: "Model", value: asset?.model?.name ?? "", type: "text" },
//       {
//         label: "Status",
//         value: asset?.status,
//         type: "text",
//       },
//       { label: "Location", value: asset?.location?.name ?? "", type: "text" },
//       {
//         label: "Department",
//         value: asset?.department?.name ?? "",
//         type: "text",
//       },
//       {
//         label: asset?.assigneeId ? "Assigned To" : "Not Assigned",
//         value: asset?.assignee?.name ?? "",
//         type: "text",
//       },
//       { label: "Tag Number", value: asset?.serialNumber ?? "", type: "text" },
//       {
//         label: "Created At",
//         value: asset?.createdAt?.toString() ?? "",
//         type: "date",
//       },
//       {
//         label: "Last Updated",
//         value: asset?.updatedAt?.toString() ?? "",
//         type: "date",
//       },
//     ],
//     customFormFields: asset?.formTemplate?.values ?? [],
//     breadcrumbs: asset ? (
//       <Breadcrumb className="hidden md:flex">
//         <BreadcrumbList>
//           <BreadcrumbItem>
//             <BreadcrumbLink asChild>
//               <Link href="/assets">Assets</Link>
//             </BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem>
//             <BreadcrumbLink asChild>
//               <Link href={`/assets/view/${id}`}>View</Link>
//             </BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator />
//         </BreadcrumbList>
//       </Breadcrumb>
//     ) : null,
//     qrCode: (
//       <div className="flex items-center gap-2">
//         <QRCode value={`/qr-code/sample.png`} size={140} />
//         <Scan className="w-6 h-6 text-gray-500" />
//       </div>
//     ),
//     actions: {
//       onArchive: () => handleAction("archive"),
//       onAssign: handleAssignmentAction(asset?.status!),
//       onUnassign: handleUnassignmentAction(asset?.status!),
//       onDuplicate: () => handleAction("duplicate"),
//       onEdit: () => handleAction("edit"),
//       onPrintLabel: () => printQRCode("/qr-code/sample.png"),
//     },
//   };

//   const handleAction = (action: "archive" | "duplicate" | "edit" | "print") => {
//     const actions: Record<typeof action, () => void> = {
//       archive: () => toast.info("Archive action not implemented"),
//       duplicate: () => toast.info("Duplicate action not implemented"),
//       edit: () => navigate.push(`/assets/edit/${id}`),
//       print: () => toast.info("Print label action not implemented"),
//     };

//     actions[action]();
//   };

//   return (
//     <>
//       {asset ? <DetailView {...detailViewProps} /> : <DetailViewSkeleton />}
//       <DialogContainer
//         description="Assign this asset to a user"
//         open={isAssignOpen}
//         onOpenChange={onAssignClose}
//         title="Assign Checkout"
//         form={
//           <AssignmentForm
//             itemId={asset?.id!}
//             type="asset"
//             assignAction={checkout}
//             onOptimisticUpdate={(userData) => {
//               setAsset((prev) =>
//                 prev
//                   ? {
//                       ...prev,
//                       assigneeId: userData.userId,
//                       assignee: { name: userData.userName },
//                     }
//                   : undefined,
//               );
//             }}
//             onSuccess={async () => {
//               toast.success("Asset assigned successfully");
//               onAssignClose();

//               try {
//                 const freshData = await findById(asset?.id!);
//                 if (!freshData.error && freshData.data) {
//                   setAsset((prev) => {
//                     if (!prev) return undefined;

//                     return {
//                       ...prev,
//                       auditLogs: freshData?.data?.auditLogs ?? [],
//                       assigneeId: prev.assigneeId,
//                       assignee: prev.assignee,
//                     };
//                   });
//                 }
//               } catch (error) {
//                 console.error("Error refreshing audit logs:", error);
//               }
//             }}
//             onError={(previousData) => {
//               if (previousData) {
//                 setAsset((prev) =>
//                   prev
//                     ? {
//                         ...prev,
//                         assigneeId: undefined,
//                         assignee: undefined,
//                       }
//                     : undefined,
//                 );
//               }
//               toast.error("Failed to assign asset");
//             }}
//           />
//         }
//       />

//       <div className="mt-5 ">
//         <ItemDetailsTabs
//           handleCheckIn={handleCheckIn}
//           auditLogs={asset?.auditLogs ?? []}
//           itemId={id}
//           usedBy={asset?.usedBy}
//           itemType="asset"
//           isCheckingIn={loadingStates.isCheckingIn}
//           isRefreshing={loadingStates.isRefreshing}
//         />
//       </div>
//     </>
//   );
// }
