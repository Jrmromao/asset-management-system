import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ActivityLog = ({
  sourceType,
  sourceId,
  auditLogs,
}: {
  sourceType: string;
  sourceId: string;
  auditLogs?: AuditLog[];
}) => {
  return (
    <section className="flex w-full">
      <Card className="w-full mx-auto py-3 max-h-900 overflow-y-auto mt-2">
        <CardHeader className="px-4 text-xl">Activity Log</CardHeader>
        <CardContent className="max-h-900 overflow-y-auto">
          {/*{auditLogs?.length === 0 ? <p>No Activity Log</p> : (*/}
          {/*    <Table className="w-full table-auto bg-gray-100 text-gray-600 rounded-lg">*/}
          {/*        <TableBody>*/}
          {/*            {auditLogs?.map((auditLog) => (*/}
          {/*                <TableRow className="w-full bg-gray-100" key={auditLog?.id}>*/}
          {/*                    <TableCell className="border px-4 py-2 sm:w-1/6">{auditLog?.createdAt.toDateString()}</TableCell>*/}
          {/*                    <TableCell className="border px-4 py-2">{auditLog?.action}</TableCell>*/}
          {/*                </TableRow>*/}
          {/*            ))}*/}
          {/*        </TableBody>*/}
          {/*    </Table>)}*/}
        </CardContent>
      </Card>
    </section>
  );
};
export default ActivityLog;
