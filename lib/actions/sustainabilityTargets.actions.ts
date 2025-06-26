"use server";

import { prisma } from "@/app/db";
import { AuthResponse, withAuth } from "@/lib/middleware/withAuth";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

interface SustainabilityTargets {
  targetEnergy: number | null;
  targetCarbonReduction: number | null;
}

interface TargetProgress {
  currentEnergy: number;
  currentCarbon: number;
  energyProgress: number;
  carbonProgress: number;
  lastUpdated: Date;
}

// Get sustainability targets for a company
export const getSustainabilityTargets = withAuth(
  async (user): Promise<AuthResponse<{ targets: SustainabilityTargets; progress: TargetProgress }>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: null as any,
        };
      }

      // Get company targets
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { targetEnergy: true, targetCarbonReduction: true },
      });

      const targets: SustainabilityTargets = {
        targetEnergy: company?.targetEnergy ? Number(company.targetEnergy) : null,
        targetCarbonReduction: company?.targetCarbonReduction ? Number(company.targetCarbonReduction) : null,
      };

      // Calculate current progress
      const [assets, accessories, co2Records] = await Promise.all([
        // Get total energy consumption from assets
        prisma.asset.aggregate({
          where: { companyId },
          _sum: { energyConsumption: true },
        }),
        // Get total energy consumption from accessories
        prisma.accessory.aggregate({
          where: { companyId },
          _sum: { energyConsumption: true },
        }),
        // Get total CO2 savings
        prisma.co2eRecord.aggregate({
          where: { 
            asset: { companyId },
            co2e: { gt: 0 },
          },
          _sum: { co2e: true },
        }),
      ]);

      const totalEnergy = Number(assets._sum.energyConsumption || 0) + Number(accessories._sum.energyConsumption || 0);
      const totalCarbon = Number(co2Records._sum.co2e || 0) / 1000; // Convert kg to tons

      // Calculate progress percentages
      const energyProgress = targets.targetEnergy && totalEnergy > 0 
        ? Math.min(100, Math.round((totalEnergy / targets.targetEnergy) * 100))
        : 0;
      
      const carbonProgress = targets.targetCarbonReduction && totalCarbon > 0
        ? Math.min(100, Math.round((totalCarbon / targets.targetCarbonReduction) * 100))
        : 0;

      const progress: TargetProgress = {
        currentEnergy: totalEnergy,
        currentCarbon: totalCarbon,
        energyProgress,
        carbonProgress,
        lastUpdated: new Date(),
      };

      return {
        success: true,
        data: { targets, progress },
      };
    } catch (error) {
      console.error("Get sustainability targets error:", error);
      return {
        success: false,
        error: "Failed to fetch sustainability targets",
        data: null as any,
      };
    }
  },
);

// Update sustainability targets for a company
export const updateSustainabilityTargets = withAuth(
  async (user, targets: SustainabilityTargets): Promise<AuthResponse<{ targets: SustainabilityTargets }>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: null as any,
        };
      }

      // Update company with new targets
      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: {
          targetEnergy: targets.targetEnergy,
          targetCarbonReduction: targets.targetCarbonReduction,
        },
      });

      // Create audit log
      await createAuditLog({
        companyId,
        action: "SUSTAINABILITY_TARGETS_UPDATED",
        entity: "COMPANY",
        entityId: companyId,
        details: `Sustainability targets updated: Energy=${targets.targetEnergy}kWh, Carbon=${targets.targetCarbonReduction}tons by user ${user.id}`,
      });

      return {
        success: true,
        data: { targets },
      };
    } catch (error) {
      console.error("Update sustainability targets error:", error);
      return {
        success: false,
        error: "Failed to update sustainability targets",
        data: null as any,
      };
    }
  },
); 