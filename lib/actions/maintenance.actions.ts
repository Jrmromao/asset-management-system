"use server";

import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { handleError, parseStringify } from "@/lib/utils";
import { z } from "zod";
import { analyzeWithLlm } from "./chatGPT.actions";
import { FlowRulesService } from "../services/flowRulesService";
import { Prisma } from "@prisma/client";

const flowRulesService = new FlowRulesService();

// Define a type for the maintenance event with its relations
const maintenanceWithDetails = Prisma.validator<Prisma.MaintenanceDefaultArgs>()({
  include: {
    asset: { include: { user: true, category: true } }, // Corrected from assignee to user
    statusLabel: true,
  },
});
type MaintenanceWithDetails = Prisma.MaintenanceGetPayload<
  typeof maintenanceWithDetails
>;

// Validation schema for creating a maintenance event
const maintenanceSchema = z.object({
  assetId: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  notes: z.string().optional(),
  startDate: z.coerce.date(), // Coerce string to Date
  isWarranty: z.boolean().default(false),
  cost: z.number().optional(), // Changed from estimatedCost
});

type MaintenanceInput = z.infer<typeof maintenanceSchema>;

export const createMaintenanceEvent = withAuth(
  async (
    user,
    data: MaintenanceInput,
  ): Promise<AuthResponse<MaintenanceWithDetails>> => {
    try {
      const validation = maintenanceSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0].message,
          data: {} as MaintenanceWithDetails,
        };
      }

      // Find the "Scheduled" status label
      const maintenanceStatus = await prisma.statusLabel.findFirst({
        where: {
          name: "Scheduled",
          companyId: user.user_metadata.companyId,
        },
      });

      if (!maintenanceStatus) {
        return {
          success: false,
          error: "Status 'Scheduled' not found. Please create it.",
          data: {} as MaintenanceWithDetails,
        };
      }

      // Use a transaction to ensure both operations succeed or fail together
      const newEvent = await prisma.$transaction(async (tx) => {
        // 1. Create the maintenance event
        const event = await tx.maintenance.create({
          data: {
            ...validation.data,
            technicianId: user.id,
            statusLabelId: maintenanceStatus.id,
          },
          include: {
            asset: { include: { user: true, category: true } }, // Corrected relation
            statusLabel: true,
          },
        });

        // 2. Execute flow rules
        const context = {
          maintenance: event,
          user,
          asset: event.asset,
          status: event.statusLabel.name,
          cost: validation.data.cost || 0, // Use cost
        };

        const flowResults = await flowRulesService.executeRules(
          user.user_metadata.companyId,
          "creation",
          context,
        );

        console.log("Flow rules executed:", flowResults);

        return event;
      });

      // TODO: SEND EMAIL NOTIFICATION
      // Notify the asset assignee that maintenance has been scheduled.
      // Example: await sendEmail({ to: newEvent.asset.user?.email, ... });

      // 3. Trigger AI carbon footprint analysis (asynchronously)
      if (newEvent.notes) {
        analyzeAndRecordCarbonFootprint(newEvent.id, newEvent.notes);
      }

      return { success: true, data: parseStringify(newEvent) };
    } catch (error) {
      return handleError(error, {} as MaintenanceWithDetails);
    }
  },
);

/**
 * Analyzes maintenance notes with an LLM to estimate and record the carbon footprint.
 * This runs in the background and does not block the API response.
 * @param maintenanceId - The ID of the maintenance event.
 * @param maintenanceNotes - The notes describing the work done.
 */
async function analyzeAndRecordCarbonFootprint(
  maintenanceId: string,
  maintenanceNotes: string,
) {
  try {
    const prompt = `Analyze the following maintenance notes and estimate the carbon footprint in kg CO2e. Consider parts, travel, and energy used. Return ONLY a JSON object with "co2e": <number> and "reasoning": "<text>". Notes: "${maintenanceNotes}"`;

    const analysisResult = await analyzeWithLlm(prompt);
    const resultJson = JSON.parse(analysisResult.data);

    if (resultJson.co2e) {
      const maintenanceEvent = await prisma.maintenance.findUnique({
        where: { id: maintenanceId },
        select: { assetId: true },
      });

      if (maintenanceEvent) {
        await prisma.co2eRecord.create({
          data: {
            co2e: resultJson.co2e,
            co2eType: "Maintenance",
            sourceOrActivity: resultJson.reasoning,
            assetId: maintenanceEvent.assetId,
            maintenanceId: maintenanceId, // Link to the maintenance event
            itemType: "Asset",
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to analyze/record carbon footprint:", error);
    // This failure should not impact the user, so we just log it.
  }
}

// TODO: Add other actions like getMaintenanceForAsset, updateMaintenance, etc. 