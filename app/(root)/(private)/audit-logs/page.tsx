import AuditLogsTableClient from "@/components/tables/AuditLogsTableClient";
import { getAuditLogs } from "@/lib/actions/auditLog.actions";
import { SimpleAuditLog } from "@/types/audit";
import React from "react";
import HeaderBox from "@/components/HeaderBox";
import { FileText } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default async function AuditLogsPage() {
  // Fetch the first page of audit logs, 20 per page
  const result = await getAuditLogs(1, 20);
  const logs: SimpleAuditLog[] = result?.success && result.data ? result.data : [];

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900">
         <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/audit-logs">Audit Logs</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>
      <HeaderBox
        title="Audit Logs"
        subtitle="Track all critical actions and changes across your organization."
        icon={<FileText className="w-5 h-5" />}
      />
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-4">
        {/* TODO: Add search/filter controls here, in the client component */}
        <AuditLogsTableClient logs={logs} />
      </div>
    </div>
  );
} 