import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import S3Service from "@/services/aws/S3";
import { getAllAssets } from "@/lib/actions/assets.actions";
import { getTotalCo2Savings } from "@/lib/actions/co2.actions";
import puppeteer from "puppeteer";
import ExcelJS from "exceljs";

interface ReportSection {
  title: string;
  type: string;
  data: any;
}

interface ReportData {
  title: string;
  generatedAt: Date;
  timePeriod: string;
  format: string;
  sections: ReportSection[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { configurationId, generateNow = true } = body;

    if (!configurationId) {
      return NextResponse.json(
        { error: "Configuration ID is required" },
        { status: 400 }
      );
    }

    // Fetch the report configuration
    const configuration = await prisma.reportConfiguration.findUnique({
      where: { id: configurationId },
      include: {
        metrics: true,
        company: true,
      },
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Report configuration not found" },
        { status: 404 }
      );
    }

    // Create a generated report record
    const generatedReport = await prisma.generatedReport.create({
      data: {
        configurationId: configuration.id,
        title: `${configuration.name} - ${new Date().toLocaleDateString()}`,
        format: configuration.format,
        filePath: "", // Will be updated with actual report ID after creation
        fileSize: 0, // Will be updated when file is generated
        status: generateNow ? "processing" : "queued",
        companyId: configuration.companyId,
      },
    });

    // Update with the correct download path using the generated report ID
    await prisma.generatedReport.update({
      where: { id: generatedReport.id },
      data: {
        filePath: `/api/reports/download/${generatedReport.id}`,
      },
    });

    if (generateNow) {
      // In a real implementation, this would trigger background job processing
      // For now, we'll simulate immediate processing
              // Generate report in background
      generateReportFile(generatedReport.id, configuration)
        .then(async (result) => {
          await prisma.generatedReport.update({
            where: { id: generatedReport.id },
            data: {
              status: "completed",
              filePath: result.filePath,
              fileSize: result.fileSize,
            },
          });
        })
        .catch(async (error) => {
          console.error("Report generation failed:", error);
          await prisma.generatedReport.update({
            where: { id: generatedReport.id },
            data: {
              status: "failed",
            },
          });
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        reportId: generatedReport.id,
        status: generatedReport.status,
        estimatedCompletion: generateNow ? "2-3 minutes" : "Queued",
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Generate and save report file to S3
async function generateReportFile(reportId: string, configuration: any): Promise<{ filePath: string; fileSize: number }> {
  const s3Service = S3Service.getInstance();
  
  // Generate report content
  const reportData = await generateReportData(configuration);
  
  let buffer: Buffer;
  let contentType: string;
  let fileExtension: string;

  switch (configuration.format.toLowerCase()) {
    case "pdf":
      buffer = await generatePDFBuffer(reportData);
      contentType = "application/pdf";
      fileExtension = "pdf";
      break;
    
    case "excel":
      buffer = await generateExcelBuffer(reportData);
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      fileExtension = "xlsx";
      break;
    
    case "csv":
      const csvContent = generateCSVContent(reportData);
      buffer = Buffer.from(csvContent, 'utf-8');
      contentType = "text/csv";
      fileExtension = "csv";
      break;
    
    case "dashboard":
      const jsonContent = JSON.stringify(reportData, null, 2);
      buffer = Buffer.from(jsonContent, 'utf-8');
      contentType = "application/json";
      fileExtension = "json";
      break;
    
    default:
      throw new Error(`Unsupported format: ${configuration.format}`);
  }

  // Generate S3 key
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${reportData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${fileExtension}`;
  const s3Key = `reports/${reportId}/${fileName}`;

  // Upload to S3
  await s3Service.uploadFile(configuration.companyId, s3Key, buffer, contentType);

  // Calculate file size in MB
  const fileSize = buffer.length / (1024 * 1024);

  return {
    filePath: `/api/reports/download/${reportId}`,
    fileSize: Math.round(fileSize * 100) / 100, // Round to 2 decimal places
  };
}

// Helper function to generate report data based on configuration
async function generateReportData(configuration: any) {
  // This would contain the actual report generation logic
  // For now, we'll return a mock structure
  
  const reportData: ReportData = {
    title: configuration.name,
    generatedAt: new Date(),
    timePeriod: configuration.timePeriod,
    format: configuration.format,
    sections: [],
  };

  // Process each metric
  for (const metric of configuration.metrics) {
    if (!metric.enabled) continue;

    switch (metric.metricName) {
      case "Energy Consumption":
        reportData.sections.push({
          title: "Energy Consumption Analysis",
          type: "chart",
          data: await getEnergyConsumptionData(configuration.companyId),
        });
        break;
      case "Carbon Emissions":
        reportData.sections.push({
          title: "Carbon Emissions Report",
          type: "chart", 
          data: await getCarbonEmissionsData(configuration.companyId),
        });
        break;
      case "Asset Distribution":
        reportData.sections.push({
          title: "Asset Distribution",
          type: "pie-chart",
          data: await getAssetDistributionData(configuration.companyId),
        });
        break;
      case "Maintenance History":
        reportData.sections.push({
          title: "Maintenance History",
          type: "table",
          data: await getMaintenanceHistoryData(configuration.companyId),
        });
        break;
      case "Cost Analysis":
        reportData.sections.push({
          title: "Cost Analysis",
          type: "financial",
          data: await getCostAnalysisData(configuration.companyId),
        });
        break;
      default:
        reportData.sections.push({
          title: metric.metricName,
          type: "placeholder",
          data: { message: "Data coming soon" },
        });
    }
  }

  return reportData;
}

// Mock data functions (these would be replaced with real queries)
async function getEnergyConsumptionData(companyId: string) {
  return { totalConsumption: 1500, trend: "+5%", period: "last6months" };
}

async function getCarbonEmissionsData(companyId: string) {
  return { totalEmissions: 250, trend: "-3%", period: "last6months" };
}

async function getAssetDistributionData(companyId: string) {
  return [
    { category: "Laptops", count: 45, percentage: 45 },
    { category: "Monitors", count: 30, percentage: 30 },
    { category: "Mobile", count: 25, percentage: 25 },
  ];
}

async function getMaintenanceHistoryData(companyId: string) {
  return [
    { asset: "Laptop-001", date: "2024-01-15", type: "Routine", cost: 150 },
    { asset: "Monitor-002", date: "2024-01-10", type: "Repair", cost: 75 },
  ];
}

async function getCostAnalysisData(companyId: string) {
  const assets = await prisma.asset.findMany({
    where: { companyId },
    select: { 
      name: true, 
      purchasePrice: true, 
      currentValue: true,
      category: { select: { name: true } } 
    },
  });

  return assets.map(asset => ({
    "Asset Name": asset.name,
    "Category": asset.category?.name || "Uncategorized",
    "Purchase Price": asset.purchasePrice || 0,
    "Current Value": asset.currentValue || 0,
  }));
}

// Content generation functions
async function generatePDFBuffer(reportData: any): Promise<Buffer> {
  const htmlContent = generateHTMLContent(reportData);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

async function generateExcelBuffer(reportData: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Add metadata
  workbook.creator = 'EcoKeepr';
  workbook.lastModifiedBy = 'EcoKeepr';
  workbook.created = new Date();
  workbook.modified = new Date();
  
  // Create main sheet
  const worksheet = workbook.addWorksheet('Report');
  
  // Add header
  worksheet.mergeCells('A1:E1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = reportData.title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };
  
  // Add metadata
  let currentRow = 3;
  worksheet.getCell(`A${currentRow}`).value = 'Generated:';
  worksheet.getCell(`B${currentRow}`).value = new Date(reportData.generatedAt).toLocaleString();
  currentRow++;
  worksheet.getCell(`A${currentRow}`).value = 'Time Period:';
  worksheet.getCell(`B${currentRow}`).value = reportData.timePeriod;
  currentRow++;
  worksheet.getCell(`A${currentRow}`).value = 'Format:';
  worksheet.getCell(`B${currentRow}`).value = reportData.format.toUpperCase();
  currentRow += 2;
  
  // Add sections
  for (const section of reportData.sections) {
    // Section title
    worksheet.getCell(`A${currentRow}`).value = section.title;
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow += 2;
    
    if (Array.isArray(section.data)) {
      // Table data
      if (section.data.length > 0) {
        const headers = Object.keys(section.data[0]);
        
        // Add headers
        headers.forEach((header, index) => {
          const cell = worksheet.getCell(currentRow, index + 1);
          cell.value = header;
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6E6' }
          };
        });
        currentRow++;
        
        // Add data rows
        section.data.forEach((row: any) => {
          headers.forEach((header, index) => {
            worksheet.getCell(currentRow, index + 1).value = row[header] || '';
          });
          currentRow++;
        });
      }
    } else if (typeof section.data === 'object' && section.data !== null) {
      // Object data
      Object.entries(section.data).forEach(([key, value]) => {
        worksheet.getCell(`A${currentRow}`).value = key;
        worksheet.getCell(`B${currentRow}`).value = String(value);
        currentRow++;
      });
    }
    
    currentRow += 2; // Add space between sections
  }
  
  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.values) {
      const lengths = column.values.map(v => v ? v.toString().length : 0);
      const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
      column.width = Math.min(maxLength + 2, 50);
    }
  });
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function generateHTMLContent(reportData: any): string {
  const sections = reportData.sections.map((section: any) => {
    let sectionContent = "";
    
    if (section.data.message) {
      sectionContent = `<p>${section.data.message}</p>`;
    } else if (Array.isArray(section.data)) {
      // Table format for arrays
      const headers = Object.keys(section.data[0] || {});
      sectionContent = `
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              ${headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${section.data.map((row: any) => `
              <tr>
                ${headers.map(h => `<td style="border: 1px solid #ddd; padding: 8px;">${row[h] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      // Object format
      sectionContent = `
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${Object.entries(section.data).map(([key, value]) => 
            `<p><strong>${key}:</strong> ${value}</p>`
          ).join('')}
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">${section.title}</h2>
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Category: ${section.category}</p>
        ${sectionContent}
      </div>
    `;
  }).join('');

  // Use EcoKeepr as the app name
  const appName = 'EcoKeepr';
  // Use companyName if available, otherwise EcoKeepr
  const companyName = reportData.companyName || appName;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${reportData.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; background: #f6fffa; }
        .logo-wrapper { display: flex; flex-direction: column; align-items: center; margin-bottom: 8px; }
        .logo-svg { display: block; margin: 0 auto; }
        .app-name { font-size: 2rem; font-weight: bold; color: #10b981; margin-bottom: 4px; letter-spacing: 1px; }
        .tagline { color: #666; font-size: 1rem; margin-top: 4px; }
        .meta-info { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 30px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-wrapper">
          <svg class="logo-svg" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="28" fill="#10b981"/>
            <path d="M36 20C32 28 24 32 20 36C28 32 32 24 36 20Z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M28 28C28 24 32 20 36 20" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="app-name">EcoKeepr</div>
        <div class="tagline">Sustainable Asset Management</div>
        <h1 style="color: #10b981; margin: 0;">${reportData.title}</h1>
        <p style="color: #666; margin: 10px 0 0 0;">${companyName}</p>
      </div>
      <div class="meta-info">
        <p><strong>Generated:</strong> ${new Date(reportData.generatedAt).toLocaleString()}</p>
        <p><strong>Time Period:</strong> ${reportData.timePeriod}</p>
        <p><strong>Format:</strong> ${reportData.format.toUpperCase()}</p>
      </div>
      ${sections}
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
        <p>Generated by EcoKeepr – Sustainable Asset Management</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}

// CSV generation function remains the same but simplified

function generateCSVContent(reportData: any): string {
  let csvContent = `"${reportData.title}"\n`;
  csvContent += `"Generated: ${new Date(reportData.generatedAt).toLocaleString()}"\n`;
  csvContent += `"Time Period: ${reportData.timePeriod}"\n`;
  csvContent += `"Format: ${reportData.format.toUpperCase()}"\n\n`;

  reportData.sections.forEach((section: any) => {
    csvContent += `"${section.title}"\n`;
    
    if (Array.isArray(section.data)) {
      if (section.data.length > 0) {
        const headers = Object.keys(section.data[0]);
        csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
        section.data.forEach((row: any) => {
          csvContent += headers.map(h => `"${row[h] || ''}"`).join(',') + '\n';
        });
      }
    } else if (typeof section.data === 'object' && section.data !== null) {
      Object.entries(section.data).forEach(([key, value]) => {
        csvContent += `"${key}","${value}"\n`;
      });
    }
    csvContent += '\n';
  });

  csvContent += '\nGenerated by EcoKeepr – Sustainable Asset Management';

  return csvContent;
} 