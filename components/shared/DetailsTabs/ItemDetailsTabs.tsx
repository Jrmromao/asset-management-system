import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileText, Users, File, FileImage, FileArchive, User as UserIcon, Download } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { auditLogColumns } from "@/components/tables/AuditLogColumns";
import { usedByAccColumns } from "@/components/tables/usedByColumns";
import { SimpleAuditLog } from "@/types/audit";
import Image from "next/image";

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
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return <FileText className="text-red-500 w-6 h-6" />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif": return <FileImage className="text-blue-500 w-6 h-6" />;
    case "zip":
    case "rar": return <FileArchive className="text-yellow-500 w-6 h-6" />;
    case "doc":
    case "docx":
    case "txt": return <FileText className="text-indigo-500 w-6 h-6" />;
    default: return <File className="text-gray-400 w-6 h-6" />;
  }
}

const AttachmentsTab: React.FC<{ files: LicenseFile[] }> = ({ files }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="w-8 h-8 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin" aria-label="Loading attachments" />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 py-8 text-center">{error}</div>;
  }
  if (!files?.length) {
    return <div className="text-slate-500 py-8 text-center">No attachments found for this license.</div>;
  }
  return (
    <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {files.map(file => {
        const ext = file.fileName.split('.').pop()?.toLowerCase();
        const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
        return (
          <li key={file.id} className="flex flex-col bg-white rounded-xl shadow border p-4 hover:shadow-lg transition">
            <div className="flex items-center gap-3 mb-2">
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
              <span className="truncate font-medium text-lg">{file.fileName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
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
      <Tabs defaultValue="history" className="w-full space-y-6">
        <div className="border-b">
          <TabsList className="h-auto p-0 bg-transparent">
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

        <TabsContent value="used-by" className="pt-4">
          {(usedBy?.length | usedBy.length) > 0 ? (
            <div className="rounded-lg border bg-white mx-3 mb-6">
              <DataTable columns={usedByAccessoryColumnsMemo} data={usedBy} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Assignments</p>
              <p className="text-sm">No assignment activity has been recorded yet</p>
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
