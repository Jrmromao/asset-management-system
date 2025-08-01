import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import S3Service from "@/services/aws/S3";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export async function GET(
  request: NextRequest,
  context: { params: { reportId: string } },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = context.params;

    // Fetch the generated report
    const generatedReport = await prisma.generatedReport.findUnique({
      where: { id: reportId },
      include: {
        configuration: {
          include: {
            metrics: true,
            company: true,
          },
        },
      },
    });

    if (!generatedReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (generatedReport.status === "processing") {
      return NextResponse.json(
        {
          error:
            "Report is still being generated. Please try again in a few moments.",
        },
        { status: 202 }, // 202 Accepted - processing
      );
    }

    if (generatedReport.status === "failed") {
      return NextResponse.json(
        {
          error:
            "Report generation failed. Please try generating the report again.",
        },
        { status: 500 },
      );
    }

    if (generatedReport.status !== "completed") {
      return NextResponse.json(
        { error: "Report is not ready for download" },
        { status: 400 },
      );
    }

    // Get the S3 key from the database or construct it
    const s3Service = S3Service.getInstance();
    const s3Key = `reports/${generatedReport.id}/`;

    try {
      // List files in the report directory to find the actual file
      const files = await s3Service.listFiles(
        generatedReport.configuration.companyId,
        s3Key,
      );

      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: "Report file not found in storage" },
          { status: 404 },
        );
      }

      // Get the first (and should be only) file
      const reportFile = files[0];
      if (!reportFile.Key) {
        return NextResponse.json(
          { error: "Invalid report file" },
          { status: 500 },
        );
      }

      // Extract just the filename from the full S3 key
      const fileKey = reportFile.Key.replace(
        `companies/${generatedReport.configuration.companyId}/`,
        "",
      );

      // Download file from S3
      const s3Object = await s3Service.downloadFile(
        generatedReport.configuration.companyId,
        fileKey,
      );

      if (!s3Object.Body) {
        return NextResponse.json(
          { error: "Report file content not found" },
          { status: 404 },
        );
      }

      // Convert stream to buffer
      let buffer: Buffer;
      const stream = s3Object.Body as any;

      if (stream.transformToByteArray) {
        const byteArray = await stream.transformToByteArray();
        buffer = Buffer.from(byteArray);
      } else {
        // Fallback for older AWS SDK versions
        const chunks: any[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        buffer = Buffer.concat(chunks);
      }

      // Determine content type and filename based on format
      let contentType: string;
      let fileName: string;

      switch (generatedReport.format.toLowerCase()) {
        case "pdf":
          contentType = "application/pdf";
          fileName = `${generatedReport.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
          break;

        case "excel":
          contentType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          fileName = `${generatedReport.title.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
          break;

        case "csv":
          contentType = "text/csv";
          fileName = `${generatedReport.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
          break;

        case "dashboard":
          // For dashboard format, return JSON data
          const content = buffer.toString("utf-8");
          return NextResponse.json({
            success: true,
            data: JSON.parse(content),
          });

        default:
          contentType = "application/octet-stream";
          fileName = `${generatedReport.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
      }

      // --- AUDIT LOG ---
      await createAuditLog({
        companyId: generatedReport.configuration.companyId,
        action: "REPORT_EXPORTED",
        entity: "GENERATED_REPORT",
        entityId: generatedReport.id,
        details: `Report exported: ${generatedReport.title} (${generatedReport.format}) by user ${userId}`,
      });

      // Return the file content
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Cache-Control": "private, max-age=3600",
          "Content-Length": buffer.length.toString(),
        },
      });
    } catch (s3Error) {
      console.error("S3 download error:", s3Error);
      return NextResponse.json(
        { error: "Failed to download report from storage" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error downloading report:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// This file now serves reports from S3 storage
// Report generation and content creation has been moved to the generate API
