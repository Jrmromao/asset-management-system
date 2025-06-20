"use server";

import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { handleError, parseStringify } from "@/lib/utils";
import {
  FlowRulesService,
  type FlowRuleData,
} from "@/lib/services/flowRulesService";
import { z } from "zod";

const flowRulesService = new FlowRulesService();

// Validation schemas
const flowRuleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  trigger: z.enum(["status_change", "creation", "completion", "approval"]),
  priority: z.number().min(1).max(1000),
  isActive: z.boolean(),
  conditions: z.array(
    z.object({
      field: z.string().min(1, "Field is required"),
      operator: z.enum([
        "equals",
        "not_equals",
        "contains",
        "greater_than",
        "less_than",
        "in",
        "not_in",
      ]),
      value: z.any(),
      logicalOperator: z.enum(["AND", "OR"]).optional(),
      order: z.number().optional(),
    }),
  ),
  actions: z.array(
    z.object({
      type: z.string().min(1, "Action type is required"),
      parameters: z.record(z.any()),
      order: z.number().optional(),
    }),
  ),
});

export const createFlowRule = withAuth(
  async (user, data: FlowRuleData): Promise<AuthResponse<FlowRuleData>> => {
    try {
      const validation = flowRuleSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0].message,
          data: null,
        };
      }

      const rule = await flowRulesService.createRule(
        user.user_metadata.companyId,
        validation.data,
      );
      return { success: true, data: parseStringify(rule) };
    } catch (error) {
      return handleError(error);
    }
  },
);

export const updateFlowRule = withAuth(
  async (
    user,
    data: { id: string; rule: Partial<FlowRuleData> },
  ): Promise<AuthResponse<FlowRuleData>> => {
    try {
      const rule = await flowRulesService.updateRule(data.id, data.rule);
      return { success: true, data: parseStringify(rule) };
    } catch (error) {
      return handleError(error);
    }
  },
);

export const deleteFlowRule = withAuth(
  async (user, data: { id: string }): Promise<AuthResponse<void>> => {
    try {
      await flowRulesService.deleteRule(data.id);
      return { success: true, data: null };
    } catch (error) {
      return handleError(error);
    }
  },
);

export const getFlowRules = withAuth(
  async (
    user,
    data: { trigger?: string },
  ): Promise<AuthResponse<FlowRuleData[]>> => {
    try {
      const rules = await flowRulesService.getActiveRules(
        user.user_metadata.companyId,
        data.trigger,
      );
      return { success: true, data: parseStringify(rules) };
    } catch (error) {
      return handleError(error);
    }
  },
);

export const getFlowRuleById = withAuth(
  async (user, data: { id: string }): Promise<AuthResponse<FlowRuleData>> => {
    try {
      const rule = await flowRulesService.getRuleById(data.id);
      return { success: true, data: parseStringify(rule) };
    } catch (error) {
      return handleError(error);
    }
  },
);
