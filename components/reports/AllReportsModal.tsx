"use client";
import React, { useState, useMemo } from "react";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Archive, Trash2, Clock, Undo2, MoreVertical, CheckCircle, Download } from "lucide-react";
import { format } from "date-fns";
import { CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

// Types
export type ReportStatus = "active" | "archived" | "scheduled" | "deleted" | "processing" | "completed";
export interface Report {
  id: string;
  name: string;
  createdAt: string;
  sizeMB: number;
  status: ReportStatus;
  scheduledDeletionAt?: string | null;
  filePath?: string;
}

interface AllReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: Report[];
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onScheduleDeletion: (id: string, date: string) => void;
}

const statusColors: Record<ReportStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-700 border-slate-200",
  scheduled: "bg-amber-100 text-amber-700 border-amber-200",
  deleted: "bg-red-100 text-red-700 border-red-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

// Helper to format file sizes
function formatFileSize(sizeMB: number): string {
  if (typeof sizeMB !== "number" || isNaN(sizeMB)) return "-";
  const sizeBytes = sizeMB * 1024 * 1024;
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(2)} KB`;
  if (sizeBytes < 1024 * 1024 * 1024) return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const AllReportsModal: React.FC<AllReportsModalProps> = ({
  open,
  onOpenChange,
  reports,
  onArchive,
  onRestore,
  onDelete,
  onScheduleDeletion,
}) => {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(true);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    type: "delete" | "archive" | "restore";
    reportId: string;
    reportName: string;
  }>({
    open: false,
    type: "delete",
    reportId: "",
    reportName: "",
  });
  const [scheduleDialog, setScheduleDialog] = useState<{
    open: boolean;
    reportId: string;
    reportName: string;
    date: string;
  }>({ open: false, reportId: '', reportName: '', date: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filter reports based on search and toggles
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (!showArchived && r.status === "archived") return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [reports, search, showArchived]);

  // Download report function
  const handleDownload = async (report: Report) => {
    if (!report.filePath) {
      toast({
        title: "Download Unavailable",
        description: "This report is not available for download.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(report.filePath);
      if (response.status === 202) {
        toast({
          title: "Report Still Processing",
          description: "Please try again in a few moments.",
          variant: "destructive",
        });
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
        toast({
          title: "Download Failed",
          description: errorData.error || 'Failed to download report',
          variant: "destructive",
        });
        return;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        console.log('Dashboard data:', jsonData);
        toast({
          title: "Dashboard Data",
          description: "Data logged to console (feature coming soon)",
        });
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = response.headers.get('content-disposition');
      let filename = report.name;
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Successful",
        description: `${report.name} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "An error occurred while downloading the report.",
        variant: "destructive",
      });
    }
  };

  // Handle archive with confirmation
  const handleArchiveWithConfirm = (reportId: string, reportName: string) => {
    setAlertDialog({
      open: true,
      type: "archive",
      reportId,
      reportName,
    });
  };

  // Handle delete with confirmation
  const handleDeleteWithConfirm = (reportId: string, reportName: string) => {
    setAlertDialog({
      open: true,
      type: "delete",
      reportId,
      reportName,
    });
  };

  // Execute action after confirmation
  const executeAction = async () => {
    const { type, reportId, reportName } = alertDialog;
    if (type === "archive") {
      try {
        const res = await fetch("/api/reports/all-reports", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: reportId }),
        });
        if (!res.ok) throw new Error("Failed to archive report");
        toast({
          title: "Report Archived",
          description: `${reportName} has been archived successfully.`,
        });
        await queryClient.invalidateQueries({ queryKey: ["allReports"] });
      } catch (err) {
        toast({
          title: "Archive Failed",
          description: err instanceof Error ? err.message : "Failed to archive report.",
          variant: "destructive",
        });
      }
    } else if (type === "delete") {
      try {
        const res = await fetch("/api/reports/all-reports", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: reportId }),
        });
        if (!res.ok) throw new Error("Failed to delete report");
        toast({
          title: "Report Deleted",
          description: `${reportName} has been deleted successfully.`,
        });
        await queryClient.invalidateQueries({ queryKey: ["allReports"] });
      } catch (err) {
        toast({
          title: "Delete Failed",
          description: err instanceof Error ? err.message : "Failed to delete report.",
          variant: "destructive",
        });
      }
    } else if (type === "restore") {
      try {
        const res = await fetch("/api/reports/all-reports", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: reportId, restore: true }),
        });
        if (!res.ok) throw new Error("Failed to restore report");
        toast({
          title: "Report Restored",
          description: `${reportName} has been restored successfully.`,
        });
        await queryClient.invalidateQueries({ queryKey: ["allReports"] });
      } catch (err) {
        toast({
          title: "Restore Failed",
          description: err instanceof Error ? err.message : "Failed to restore report.",
          variant: "destructive",
        });
      }
    }
    setAlertDialog({ open: false, type: "delete", reportId: "", reportName: "" });
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: (row: any) => (
          <span className="font-medium text-gray-900">{row.row.original.name}</span>
        ),
      },
      {
        header: "Created",
        accessorKey: "createdAt",
        cell: (row: any) => (
          <span className="text-gray-600 text-sm">
            {format(new Date(row.row.original.createdAt), "yyyy-MM-dd HH:mm")}
          </span>
        ),
      },
      {
        header: "Size",
        accessorKey: "sizeMB",
        cell: (row: any) => (
          <span className="text-gray-600 text-sm" title={`${row.row.original.sizeMB} MB`}>
            {formatFileSize(row.row.original.sizeMB)}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (row: any) => {
          const status: ReportStatus = row.row.original.status;
          return (
            <Badge className={`border ${statusColors[status]} capitalize flex items-center gap-1`}>
              {status === "active" && <CheckCircle className="w-3 h-3 text-emerald-600" />}
              {status === "archived" && <Archive className="w-3 h-3 text-slate-600" />}
              {status === "scheduled" && <Clock className="w-3 h-3 text-amber-600" />}
              {status === "deleted" && <Trash2 className="w-3 h-3 text-red-600" />}
              {status === "processing" && <Clock className="w-3 h-3 animate-spin text-blue-600" />}
              {status === "completed" && <CheckCircle className="w-3 h-3 text-emerald-600" />}
              {status}
              {status === "scheduled" && row.row.original.scheduledDeletionAt && (
                <span className="ml-2 flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {format(new Date(row.row.original.scheduledDeletionAt), "yyyy-MM-dd")}
                </span>
              )}
            </Badge>
          );
        },
      },
      {
        header: "Actions",
        id: "actions",
        cell: (row: any) => {
          const report: Report = row.row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Open actions">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {report.status === "processing" && (
                  <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                )}
                {report.status === "completed" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => handleDownload(report)} 
                      title="Download Report"
                    >
                      <Download className="w-4 h-4 mr-2 text-blue-600" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleArchiveWithConfirm(report.id, report.name)} 
                      title="Archive Report"
                    >
                      <Archive className="w-4 h-4 mr-2 text-slate-600" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteWithConfirm(report.id, report.name)}
                      className="text-red-600"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
                {report.status === "active" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => handleDownload(report)} 
                      title="Download Report"
                    >
                      <Download className="w-4 h-4 mr-2 text-blue-600" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleArchiveWithConfirm(report.id, report.name)} 
                      title="Archive Report"
                    >
                      <Archive className="w-4 h-4 mr-2 text-slate-600" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setScheduleDialog({ open: true, reportId: report.id, reportName: report.name, date: '' })}
                      title="Schedule Deletion"
                    >
                      <Clock className="w-4 h-4 mr-2 text-amber-600" /> Schedule Deletion
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteWithConfirm(report.id, report.name)}
                      className="text-red-600"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
                {report.status === "archived" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => handleDownload(report)} 
                      title="Download Report"
                    >
                      <Download className="w-4 h-4 mr-2 text-blue-600" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setAlertDialog({ open: true, type: "restore", reportId: report.id, reportName: report.name })} 
                      title="Restore Report"
                    >
                      <Undo2 className="w-4 h-4 mr-2 text-emerald-600" /> Restore
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteWithConfirm(report.id, report.name)}
                      className="text-red-600"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
                {report.status === "scheduled" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => handleDownload(report)} 
                      title="Download Report"
                    >
                      <Download className="w-4 h-4 mr-2 text-blue-600" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onScheduleDeletion(report.id, "");
                        toast({
                          title: "Scheduled Deletion Cancelled",
                          description: `${report.name} will no longer be automatically deleted.`,
                        });
                      }}
                      title="Cancel Scheduled Deletion"
                    >
                      <Clock className="w-4 h-4 mr-2 text-amber-600" /> Cancel Scheduled Deletion
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteWithConfirm(report.id, report.name)}
                      className="text-red-600"
                      title="Delete Now"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Now
                    </DropdownMenuItem>
                  </>
                )}
                {report.status === "deleted" && (
                  <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onArchive, onRestore, onDelete, onScheduleDeletion]
  );

  return (
    <>
      <DialogContainer
        open={open}
        onOpenChange={() => onOpenChange(false)}
        title="All Reports"
        description="Manage, archive, or schedule deletion for your reports."
        className="max-w-6xl"
        form={null}
        body={
          <>
            {/* Search and filter controls */}
            <div className="flex items-center gap-3 mb-4">
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64"
                placeholder="Search reports..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={e => setShowArchived(e.target.checked)}
                  className="accent-slate-600"
                />
                Show Archived
              </label>
            </div>
            {/* DataTable */}
            <div className="rounded-lg overflow-hidden">
              <DataTable columns={columns} data={filteredReports} />
            </div>
          </>
        }
      />

      {/* Alert Dialog for Delete/Archive confirmation */}
      <AlertDialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertDialog.type === "delete"
                ? "Delete Report"
                : alertDialog.type === "archive"
                ? "Archive Report"
                : "Restore Report"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.type === "delete"
                ? `Are you sure you want to delete \"${alertDialog.reportName}\"? This action cannot be undone.`
                : alertDialog.type === "archive"
                ? `Are you sure you want to archive \"${alertDialog.reportName}\"? You can restore it later from the archived section.`
                : `Are you sure you want to restore \"${alertDialog.reportName}\"? It will become active again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeAction}
              className={
                alertDialog.type === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : alertDialog.type === "restore"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : ""
              }
            >
              {alertDialog.type === "delete"
                ? "Delete"
                : alertDialog.type === "archive"
                ? "Archive"
                : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Schedule Deletion Dialog */}
      <AlertDialog open={scheduleDialog.open} onOpenChange={open => setScheduleDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Schedule Report Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Choose a date to schedule deletion for <span className="font-semibold">{scheduleDialog.reportName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <label className="text-sm font-medium">Deletion Date</label>
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm"
              value={scheduleDialog.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setScheduleDialog(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScheduleDialog({ open: false, reportId: '', reportName: '', date: '' })}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!scheduleDialog.date}
              onClick={() => {
                onScheduleDeletion(scheduleDialog.reportId, scheduleDialog.date);
                toast({
                  title: "Deletion Scheduled",
                  description: `Report will be deleted on ${scheduleDialog.date}.`,
                });
                setScheduleDialog({ open: false, reportId: '', reportName: '', date: '' });
              }}
            >
              Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AllReportsModal; 