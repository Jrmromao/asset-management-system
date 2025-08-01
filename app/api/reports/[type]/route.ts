import { NextRequest, NextResponse } from "next/server";
import { getAllAssets } from "@/lib/actions/assets.actions";
import { getTotalCo2Savings } from "@/lib/actions/co2.actions";
import { getAllUsersWithService } from "@/lib/actions/user.actions";
import { prisma } from "@/app/db";

// Mock data for demonstration
const mockReports = {
  esg: {
    energyUsage: [
      { month: "Jan", usage: 320, target: 300 },
      { month: "Feb", usage: 300, target: 300 },
      { month: "Mar", usage: 340, target: 300 },
      { month: "Apr", usage: 280, target: 300 },
      { month: "May", usage: 290, target: 300 },
      { month: "Jun", usage: 310, target: 300 },
    ],
    carbonEmissions: [
      { month: "Jan", emissions: 25, target: 22 },
      { month: "Feb", emissions: 23, target: 22 },
      { month: "Mar", emissions: 26, target: 22 },
      { month: "Apr", emissions: 22, target: 22 },
      { month: "May", emissions: 21, target: 22 },
      { month: "Jun", emissions: 20, target: 22 },
    ],
  },
  financial: {
    depreciation: [
      { month: "Jan", value: 1200 },
      { month: "Feb", value: 1150 },
      { month: "Mar", value: 1100 },
      { month: "Apr", value: 1080 },
      { month: "May", value: 1050 },
      { month: "Jun", value: 1020 },
    ],
    tco: 50000,
    assetValuation: 120000,
  },
  operational: {
    maintenance: [
      { month: "Jan", events: 12 },
      { month: "Feb", events: 10 },
      { month: "Mar", events: 15 },
      { month: "Apr", events: 9 },
      { month: "May", events: 11 },
      { month: "Jun", events: 8 },
    ],
    utilization: 0.87,
    audits: 3,
  },
  compliance: {
    licenseCompliance: 0.98,
    warrantyExpirations: 2,
  },
  all: {
    summary: "This is a summary of all reporting categories.",
  },
};

const mockEnergyUsage = [
  { month: "Jan", usage: 320, target: 300, previous: 340 },
  { month: "Feb", usage: 300, target: 300, previous: 320 },
  { month: "Mar", usage: 340, target: 300, previous: 310 },
  { month: "Apr", usage: 280, target: 300, previous: 330 },
  { month: "May", usage: 290, target: 300, previous: 300 },
  { month: "Jun", usage: 310, target: 300, previous: 290 },
];

const mockCarbonEmissions = [
  { month: "Jan", emissions: 25, target: 22 },
  { month: "Feb", emissions: 23, target: 22 },
  { month: "Mar", emissions: 26, target: 22 },
  { month: "Apr", emissions: 22, target: 22 },
  { month: "May", emissions: 21, target: 22 },
  { month: "Jun", emissions: 20, target: 22 },
];

const mockAssetDistribution = [
  { name: "Laptops", value: 45, trend: "up", change: "+5%" },
  { name: "Monitors", value: 30, trend: "down", change: "-2%" },
  { name: "Mobile Devices", value: 15, trend: "up", change: "+3%" },
  { name: "Others", value: 10, trend: "stable", change: "0%" },
];

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
}

// Helper function to get date ranges
function getDateRanges() {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    currentMonthStart,
    previousMonthStart,
    previousMonthEnd,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: { type: string } },
) {
  const { type } = context.params;
  const searchParams = request.nextUrl.searchParams;
  const dateRange = searchParams.get("range") || "last6months";

  if (type === "all") {
    try {
      const { currentMonthStart, previousMonthStart, previousMonthEnd } =
        getDateRanges();

      // Get total reports (GeneratedReport count)
      const totalReports = await prisma.generatedReport.count();
      const previousMonthReports = await prisma.generatedReport.count({
        where: {
          generatedAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      });
      const currentMonthReports = await prisma.generatedReport.count({
        where: {
          generatedAt: {
            gte: currentMonthStart,
          },
        },
      });
      const totalReportsChange = calculatePercentageChange(
        currentMonthReports,
        previousMonthReports,
      );

      // Get total assets (for activeAssets, etc.)
      const assetsRes = await getAllAssets();
      const totalAssets = assetsRes.success ? (assetsRes.data ?? []).length : 0;
      const previousMonthAssets = await prisma.asset.count({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      });
      const currentMonthAssets = await prisma.asset.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
          },
        },
      });
      const activeAssetsChange = calculatePercentageChange(
        currentMonthAssets,
        previousMonthAssets,
      );

      // Get total users
      const usersRes = await getAllUsersWithService();
      const totalUsers = usersRes.success ? usersRes.data.totalUsers : 0;
      // Get carbon reduction (in tons)
      const co2Res = await getTotalCo2Savings();
      const carbonReduction = co2Res.data || 0;

      // Calculate carbon reduction trend (mock for now, can be enhanced with historical CO2 data)
      const carbonReductionChange = "+2.3%"; // TODO: Calculate from historical CO2 data

      // Calculate energy efficiency trend (mock for now, can be enhanced with historical energy data)
      const energyEfficiencyChange = "+1.5%"; // TODO: Calculate from historical energy consumption

      // Calculate energy efficiency (assets + accessories)
      let energyEfficiency = 0;
      let totalEnergy = 0;
      let targetEnergy = 10000; // Default fallback
      let targetCarbonReduction = 100; // Default fallback (tons)
      try {
        const companyId =
          assetsRes.success && (assetsRes.data ?? []).length > 0
            ? (assetsRes.data ?? [])[0].companyId
            : undefined;

        // Fetch company-specific targetEnergy if available
        if (companyId) {
          const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { targetEnergy: true, targetCarbonReduction: true },
          });
          if (company?.targetEnergy) {
            targetEnergy = Number(company.targetEnergy);
          }
          if (company?.targetCarbonReduction) {
            targetCarbonReduction = Number(company.targetCarbonReduction);
          }
        }

        const assets = await prisma.asset.findMany({
          where: { companyId },
          select: { id: true, energyConsumption: true },
        });
        const accessories = await prisma.accessory.findMany({
          where: { companyId },
          select: { id: true, energyConsumption: true },
        });
        const totalAssetEnergy = assets.reduce(
          (sum, a) =>
            sum + (a.energyConsumption ? Number(a.energyConsumption) : 0),
          0,
        );
        const totalAccessoryEnergy = accessories.reduce(
          (sum, a) =>
            sum + (a.energyConsumption ? Number(a.energyConsumption) : 0),
          0,
        );
        totalEnergy = totalAssetEnergy + totalAccessoryEnergy;
        // Calculate energy efficiency: if we're under target, we're 100% efficient
        // If we're over target, calculate how much over we are as a percentage decrease
        if (targetEnergy > 0 && totalEnergy > 0) {
          if (totalEnergy <= targetEnergy) {
            energyEfficiency = 100; // We're at or under target - perfect efficiency
          } else {
            // We're over target - calculate efficiency as percentage
            const overagePercentage =
              ((totalEnergy - targetEnergy) / targetEnergy) * 100;
            energyEfficiency = Math.max(0, Math.round(100 - overagePercentage));
          }
        } else {
          energyEfficiency = 0;
        }
      } catch (err) {
        // fallback to 0
        energyEfficiency = 0;
        totalEnergy = 0;
      }

      // Recent reports: fetch from GeneratedReport
      let recentReports: any[] = [];
      try {
        const generatedReports = await prisma.generatedReport.findMany({
          orderBy: { generatedAt: "desc" },
          take: 3,
        });
        recentReports = generatedReports.map((report) => ({
          name: report.title,
          date: report.generatedAt.toISOString().split("T")[0],
          type: report.format,
          status: report.status,
          size: report.fileSize ? `${report.fileSize.toFixed(1)} MB` : "N/A",
          icon: "FileText",
          filePath: report.filePath,
        }));
      } catch (err) {
        // If error, just return empty array
        recentReports = [];
      }

      // Calculate real asset distribution
      let assetDistribution: any[] = [];
      try {
        const companyId =
          assetsRes.success && (assetsRes.data ?? []).length > 0
            ? (assetsRes.data ?? [])[0].companyId
            : undefined;

        if (companyId) {
          const assetsByCategory = await prisma.asset.groupBy({
            by: ["categoryId"],
            where: { companyId },
            _count: { id: true },
          });

          const categories = await prisma.category.findMany({
            where: {
              id: {
                in: assetsByCategory
                  .map((a: any) => a.categoryId)
                  .filter(Boolean),
              },
            },
            select: { id: true, name: true },
          });

          const totalAssetsForDistribution = assetsByCategory.reduce(
            (sum: number, a: any) => sum + a._count.id,
            0,
          );

          assetDistribution = assetsByCategory.map((asset: any) => {
            const category = categories.find(
              (c: any) => c.id === asset.categoryId,
            );
            const percentage =
              totalAssetsForDistribution > 0
                ? Math.round(
                    (asset._count.id / totalAssetsForDistribution) * 100,
                  )
                : 0;
            return {
              name: category?.name || "Uncategorized",
              value: percentage,
              trend: "stable", // TODO: Calculate real trend
              change: "0%", // TODO: Calculate real change
            };
          });
        }
      } catch (err) {
        // Fallback to mock data if error
        assetDistribution = [
          { name: "Laptops", value: 45, trend: "up", change: "+5%" },
          { name: "Monitors", value: 30, trend: "down", change: "-2%" },
          { name: "Mobile Devices", value: 15, trend: "up", change: "+3%" },
          { name: "Others", value: 10, trend: "stable", change: "0%" },
        ];
      }

      // Calculate real energy usage time-series (last 6 months)
      let energyUsage: any[] = [];
      try {
        const companyId =
          assetsRes.success && (assetsRes.data ?? []).length > 0
            ? (assetsRes.data ?? [])[0].companyId
            : undefined;

        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextMonthDate = new Date(
            now.getFullYear(),
            now.getMonth() - i + 1,
            1,
          );
          const monthName = months[monthDate.getMonth()];

          // Get assets created in this month and their energy consumption
          const monthlyAssets = await prisma.asset.findMany({
            where: {
              companyId,
              createdAt: {
                gte: monthDate,
                lt: nextMonthDate,
              },
            },
            select: { energyConsumption: true },
          });

          const monthlyUsage = monthlyAssets.reduce(
            (sum: number, asset: any) =>
              sum +
              (asset.energyConsumption ? Number(asset.energyConsumption) : 0),
            0,
          );

          energyUsage.push({
            month: monthName,
            usage: Math.round(monthlyUsage),
            target: Math.round(targetEnergy / 12), // Distribute annual target across months
            previous: Math.round(monthlyUsage * 1.1), // Mock previous year data
          });
        }
      } catch (err) {
        // Fallback to mock data
        energyUsage = mockEnergyUsage;
      }

      // Calculate real carbon emissions time-series (last 6 months)
      let carbonEmissions: any[] = [];
      try {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextMonthDate = new Date(
            now.getFullYear(),
            now.getMonth() - i + 1,
            1,
          );
          const monthName = months[monthDate.getMonth()];

          // Get CO2 records for this month
          const monthlyCo2Records = await prisma.co2eRecord.findMany({
            where: {
              createdAt: {
                gte: monthDate,
                lt: nextMonthDate,
              },
            },
            select: { co2e: true },
          });

          const monthlyEmissions = monthlyCo2Records.reduce(
            (sum: number, record: any) =>
              sum + (record.co2e ? Number(record.co2e) : 0),
            0,
          );

          carbonEmissions.push({
            month: monthName,
            emissions: Math.round(monthlyEmissions * 100) / 100, // Round to 2 decimal places
            target: Math.round((targetCarbonReduction / 12) * 100) / 100, // Distribute annual target
          });
        }
      } catch (err) {
        // Fallback to mock data
        carbonEmissions = mockCarbonEmissions;
      }

      return NextResponse.json({
        success: true,
        type,
        dateRange,
        data: {
          totalReports,
          totalReportsChange,
          energyEfficiency,
          energyEfficiencyChange,
          totalEnergy,
          targetEnergy,
          targetCarbonReduction,
          carbonReduction,
          carbonReductionChange,
          activeAssets: totalAssets,
          activeAssetsChange,
          energyUsage,
          carbonEmissions,
          assetDistribution,
          recentReports,
        },
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          type,
          dateRange,
          error:
            error instanceof Error ? error.message : "Failed to fetch report",
        },
        { status: 500 },
      );
    }
  }

  // In a real implementation, use type and dateRange to aggregate data
  const data =
    mockReports[type as keyof typeof mockReports] || mockReports["all"];

  return NextResponse.json({
    success: true,
    type,
    dateRange,
    data,
  });
}
