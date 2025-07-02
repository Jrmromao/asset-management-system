import React, { useMemo, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  File,
  FileImage,
  FileArchive,
  User as UserIcon,
  Download,
  Clock,
  CheckCircle,
  UploadCloud,
  Trash2,
  UserPlus,
  UserMinus,
  Edit2,
} from "lucide-react";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { auditLogColumns } from "@/components/tables/AuditLogColumns";
import { usedByAccColumns } from "@/components/tables/usedByColumns";
import { SimpleAuditLog } from "@/types/audit";
import Image from "next/image";
import JSZip from "jszip";

// LicenseFile type (inline, or import from types if available)
type LicenseFile = {
  id: string;
  licenseId: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy?: string | null;
};

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FileText className="text-red-500 w-6 h-6" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return <FileImage className="text-blue-500 w-6 h-6" />;
    case "zip":
    case "rar":
      return <FileArchive className="text-yellow-500 w-6 h-6" />;
    case "doc":
    case "docx":
    case "txt":
      return <FileText className="text-indigo-500 w-6 h-6" />;
    default:
      return <File className="text-gray-400 w-6 h-6" />;
  }
}

const PAGE_SIZE = 12;

const AttachmentsTab: React.FC<{ files: LicenseFile[] }> = ({ files }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [files]);

  const totalPages = Math.ceil(files.length / PAGE_SIZE);
  const pagedFiles = files.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSelect = (fileId: string) => {
    setSelected((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
    );
  };

  const handleSelectAll = () => {
    if (selected.length === files.length) setSelected([]);
    else setSelected(files.map((f) => f.id));
  };

  const handleBulkDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const zip = new JSZip();
      for (const file of files.filter((f) => selected.includes(f.id))) {
        // Fetch presigned URL
        const res = await fetch(
          `/api/licenses/files/download-url?fileId=${file.id}`,
        );
        const { data: url } = await res.json();
        const fileRes = await fetch(url);
        const blob = await fileRes.blob();
        zip.file(file.fileName, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = "license-attachments.zip";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError("Failed to download files as ZIP.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span
          className="w-8 h-8 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin"
          aria-label="Loading attachments"
        />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 py-8 text-center">{error}</div>;
  }
  if (!files?.length) {
    return (
      <div className="text-slate-500 py-8 text-center">
        No attachments found for this license.
      </div>
    );
  }
  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <button
          className="px-3 py-2 bg-emerald-600 text-white rounded font-semibold shadow hover:bg-emerald-700 transition disabled:opacity-50"
          onClick={handleBulkDownload}
          disabled={selected.length === 0 || loading}
          title={
            selected.length === 0
              ? "Select files to download"
              : "Download selected files as ZIP"
          }
        >
          Download Selected ({selected.length})
        </button>
        <button
          className="text-sm underline text-emerald-700 hover:text-emerald-900"
          onClick={handleSelectAll}
        >
          {selected.length === files.length ? "Deselect All" : "Select All"}
        </button>
      </div>
      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {pagedFiles.map((file) => {
          const ext = file.fileName.split(".").pop()?.toLowerCase();
          const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
            ext || "",
          );
          return (
            <li
              key={file.id}
              className="flex flex-col bg-white rounded-xl shadow border p-4 hover:shadow-lg transition relative"
            >
              <input
                type="checkbox"
                checked={selected.includes(file.id)}
                onChange={() => handleSelect(file.id)}
                className="absolute top-3 left-3 w-4 h-4 accent-emerald-600 focus:ring-2 focus:ring-emerald-400"
                aria-label={`Select ${file.fileName}`}
              />
              <div className="flex items-center gap-3 mb-2 ml-6">
                {isImage ? (
                  <Image
                    src={`/api/licenses/files/download-url?fileId=${file.id}`}
                    alt={file.fileName}
                    width={40}
                    height={40}
                    className="rounded border object-cover w-10 h-10"
                    onError={() => setError("Failed to load image preview.")}
                  />
                ) : (
                  getFileIcon(file.fileName)
                )}
                <span className="truncate font-medium text-lg">
                  {file.fileName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 ml-6">
                <UserIcon className="w-4 h-4" />
                {file.uploadedBy || "Unknown"}
                <span className="mx-2">•</span>
                {new Date(file.uploadedAt).toLocaleDateString()}
              </div>
              <a
                href={`/api/licenses/files/download-url?fileId=${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-semibold shadow hover:from-emerald-700 hover:to-emerald-600 transition group focus:outline-none focus:ring-2 focus:ring-emerald-400"
                title={`Download ${file.fileName}`}
                tabIndex={0}
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Download</span>
              </a>
            </li>
          );
        })}
      </ul>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            className="px-3 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

const eventIconMap: Record<string, React.ReactNode> = {
  LICENSE_ASSIGNED: <UserPlus className="text-emerald-600 w-5 h-5" />,
  LICENSE_CHECKIN: <UserMinus className="text-yellow-600 w-5 h-5" />,
  LICENSE_FILE_UPLOADED: <UploadCloud className="text-blue-600 w-5 h-5" />,
  LICENSE_FILE_DELETED: <Trash2 className="text-red-500 w-5 h-5" />,
  LICENSE_UPDATED: <Edit2 className="text-indigo-600 w-5 h-5" />,
  LICENSE_CREATED: <CheckCircle className="text-emerald-700 w-5 h-5" />,
  LICENSE_DELETED: <Trash2 className="text-red-700 w-5 h-5" />,
  LICENSES_EXPORTED_CSV: <UploadCloud className="text-gray-400 w-5 h-5" />,
  LICENSE_FILE_DOWNLOAD_URL_REQUESTED: (
    <Download className="text-gray-400 w-5 h-5" />
  ),
  default: <Clock className="text-slate-400 w-5 h-5" />,
};

const TimelineTab: React.FC<{ logs: SimpleAuditLog[] }> = ({ logs }) => {
  const [showAll, setShowAll] = useState(false);
  const DEFAULT_VISIBLE = 5;

  if (!logs?.length) {
    return (
      <div className="text-slate-500 py-8 text-center">
        No history found for this license.
      </div>
    );
  }
  // Sort logs by date descending
  const sorted = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const visibleLogs = showAll ? sorted : sorted.slice(0, DEFAULT_VISIBLE);

  return (
    <div>
      <ol className="relative border-l border-slate-200 ml-4">
        {visibleLogs.map((log, i) => (
          <li key={log.id || i} className="mb-8 ml-6">
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-white border-2 border-slate-200 rounded-full">
              {eventIconMap[log.action] || eventIconMap.default}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-slate-800">
                {log.action
                  .replace(/_/g, " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
              <span className="text-xs text-slate-500">{log.details}</span>
              <span className="text-xs text-slate-400">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          </li>
        ))}
      </ol>
      {sorted.length > DEFAULT_VISIBLE && (
        <button
          className="text-blue-600 hover:underline mt-2"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Show Less" : `Show All (${sorted.length})`}
        </button>
      )}
    </div>
  );
};

interface ItemDetailsTabsProps {
  itemId: string;
  itemType: "asset" | "accessory" | "license" | "component";
  auditLogs: SimpleAuditLog[];
  usedBy?: UserItems[];
  isCheckingIn: Set<string>;
  isRefreshing: boolean;
  handleCheckIn: (id: string) => Promise<void>;
  onViewUsedBy?: (id: string) => void;
  customTabs?: {
    [key: string]: {
      label: string;
      icon?: React.ReactNode;
      content: React.ReactNode;
    };
  };
  attachments?: LicenseFile[];
}

const ItemDetailsTabs: React.FC<ItemDetailsTabsProps> = ({
  itemType,
  auditLogs,
  usedBy = [],
  handleCheckIn,
  customTabs = {},
  isCheckingIn,
  attachments = [],
}) => {
  const auditLogColumnsMemo = useMemo(() => auditLogColumns(), []);
  const usedByAccessoryColumnsMemo = useMemo(
    () =>
      usedByAccColumns({
        onCheckIn: handleCheckIn,
        checkingInIds: isCheckingIn,
      }),
    [handleCheckIn, isCheckingIn],
  );

  return (
    <div className="w-full">
      <Tabs defaultValue="timeline" className="w-full space-y-6">
        <div className="border-b">
          <TabsList className="h-auto p-0 bg-transparent">
            {/* Hide Audit Log tab for now */}
            {/*
            <TabsTrigger
              value="history"
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent",
                "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                "hover:text-blue-800 transition-colors",
              )}
            >
              <FileText className="h-4 w-4" />
              Audit Log
            </TabsTrigger>
            */}

            {/* Show Timeline for license, asset, and accessory */}
            {(itemType === "license" ||
              itemType === "asset" ||
              itemType === "accessory") && (
              <TabsTrigger
                value="timeline"
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-600",
                  "hover:text-emerald-800 transition-colors",
                )}
              >
                <Clock className="h-4 w-4" />
                Timeline
              </TabsTrigger>
            )}

            {itemType !== "asset" && (
              <TabsTrigger
                value="used-by"
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                  "hover:text-blue-800 transition-colors",
                )}
              >
                <Users className="h-4 w-4" />
                <span>Assignments</span>
              </TabsTrigger>
            )}

            {itemType === "license" && (
              <TabsTrigger
                value="attachments"
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                  "hover:text-blue-800 transition-colors",
                )}
              >
                <File className="h-4 w-4" />
                Attachments
              </TabsTrigger>
            )}

            {Object.entries(customTabs).map(([key, tab]) => (
              <TabsTrigger
                key={key}
                value={key}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                  "hover:text-blue-800 transition-colors",
                )}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Hide Audit Log tab for now */}
        {/*
        <TabsContent value="history" className="pt-4">
          {auditLogs?.length > 0 ? (
            <div className="rounded-lg border bg-white mr-3 ml-3 mb-6">
              <DataTable columns={auditLogColumnsMemo} data={auditLogs} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Audit Log</p>
              <p className="text-sm">No audit activities have been recorded yet.</p>
            </div>
          )}
        </TabsContent>
        */}

        {/* Timeline tab for license, asset, and accessory */}
        {(itemType === "license" ||
          itemType === "asset" ||
          itemType === "accessory") && (
          <TabsContent value="timeline" className="pt-4">
            <div className="rounded-lg border bg-white p-6">
              <TimelineTab logs={auditLogs} />
            </div>
          </TabsContent>
        )}

        <TabsContent value="used-by" className="pt-4">
          {(usedBy?.length | usedBy.length) > 0 ? (
            <div className="rounded-lg border bg-white mx-3 mb-6">
              <DataTable columns={usedByAccessoryColumnsMemo} data={usedBy} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Assignments</p>
              <p className="text-sm">
                No assignment activity has been recorded yet
              </p>
            </div>
          )}
        </TabsContent>

        {itemType === "license" && (
          <TabsContent value="attachments" className="pt-4">
            <div className="rounded-lg border bg-white p-6">
              <AttachmentsTab files={attachments || []} />
            </div>
          </TabsContent>
        )}

        {Object.entries(customTabs).map(([key, tab]) => (
          <TabsContent key={key} value={key} className="pt-4">
            <div className="rounded-lg border bg-white p-6">{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ItemDetailsTabs;
