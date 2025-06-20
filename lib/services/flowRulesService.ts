import { prisma } from "@/app/db";

export interface FlowRuleData {
  id?: string;
  name: string;
  description: string;
  trigger: string;
  priority: number;
  isActive: boolean;
  conditions: FlowConditionData[];
  actions: FlowActionData[];
}

export interface FlowConditionData {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: string;
  order?: number;
}

export interface FlowActionData {
  type: string;
  parameters: Record<string, any>;
  order?: number;
}

export interface FlowExecutionContext {
  maintenance?: any;
  asset?: any;
  user?: any;
  oldStatus?: string;
  newStatus?: string;
  [key: string]: any;
}

export class FlowRulesService {
  async getActiveRules(
    companyId: string,
    trigger?: string,
  ): Promise<FlowRuleData[]> {
    const where: any = {
      companyId,
      isActive: true,
    };

    if (trigger) {
      where.trigger = trigger;
    }

    const rules = await prisma.flowRule.findMany({
      where,
      include: {
        conditions: {
          orderBy: { order: "asc" },
        },
        actions: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: [{ priority: "desc" }, { name: "asc" }],
    });

    return rules.map((rule) => ({
      ...rule,
      conditions: rule.conditions.map((condition) => ({
        ...condition,
        value: JSON.parse(condition.value),
        logicalOperator: condition.logicalOperator ?? undefined,
      })),
      actions: rule.actions.map((action) => ({
        ...action,
        parameters: action.parameters as Record<string, any>,
      })),
    }));
  }

  async createRule(
    companyId: string,
    ruleData: FlowRuleData,
  ): Promise<FlowRuleData> {
    return await prisma.$transaction(async (tx) => {
      const rule = await tx.flowRule.create({
        data: {
          name: ruleData.name,
          description: ruleData.description,
          trigger: ruleData.trigger,
          priority: ruleData.priority,
          isActive: ruleData.isActive,
          companyId,
        },
      });

      // Create conditions
      for (const condition of ruleData.conditions) {
        await tx.flowCondition.create({
          data: {
            flowRuleId: rule.id,
            field: condition.field,
            operator: condition.operator,
            value: JSON.stringify(condition.value),
            logicalOperator: condition.logicalOperator,
            order: condition.order || 0,
          },
        });
      }

      // Create actions
      for (const action of ruleData.actions) {
        await tx.flowAction.create({
          data: {
            flowRuleId: rule.id,
            type: action.type,
            parameters: action.parameters,
            order: action.order || 0,
          },
        });
      }

      return this.getRuleById(rule.id);
    });
  }

  async updateRule(
    ruleId: string,
    ruleData: Partial<FlowRuleData>,
  ): Promise<FlowRuleData> {
    return await prisma.$transaction(async (tx) => {
      // Update rule
      if (
        ruleData.name ||
        ruleData.description ||
        ruleData.trigger ||
        ruleData.priority !== undefined ||
        ruleData.isActive !== undefined
      ) {
        await tx.flowRule.update({
          where: { id: ruleId },
          data: {
            name: ruleData.name,
            description: ruleData.description,
            trigger: ruleData.trigger,
            priority: ruleData.priority,
            isActive: ruleData.isActive,
          },
        });
      }

      // Update conditions if provided
      if (ruleData.conditions) {
        // Delete existing conditions
        await tx.flowCondition.deleteMany({
          where: { flowRuleId: ruleId },
        });

        // Create new conditions
        for (const condition of ruleData.conditions) {
          await tx.flowCondition.create({
            data: {
              flowRuleId: ruleId,
              field: condition.field,
              operator: condition.operator,
              value: JSON.stringify(condition.value),
              logicalOperator: condition.logicalOperator,
              order: condition.order || 0,
            },
          });
        }
      }

      // Update actions if provided
      if (ruleData.actions) {
        // Delete existing actions
        await tx.flowAction.deleteMany({
          where: { flowRuleId: ruleId },
        });

        // Create new actions
        for (const action of ruleData.actions) {
          await tx.flowAction.create({
            data: {
              flowRuleId: ruleId,
              type: action.type,
              parameters: action.parameters,
              order: action.order || 0,
            },
          });
        }
      }

      return this.getRuleById(ruleId);
    });
  }

  async deleteRule(ruleId: string): Promise<void> {
    await prisma.flowRule.delete({
      where: { id: ruleId },
    });
  }

  async getRuleById(ruleId: string): Promise<FlowRuleData> {
    const rule = await prisma.flowRule.findUnique({
      where: { id: ruleId },
      include: {
        conditions: {
          orderBy: { order: "asc" },
        },
        actions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!rule) {
      throw new Error("Flow rule not found");
    }

    return {
      ...rule,
      conditions: rule.conditions.map((condition) => ({
        ...condition,
        value: JSON.parse(condition.value),
        logicalOperator: condition.logicalOperator ?? undefined,
      })),
      actions: rule.actions.map((action) => ({
        ...action,
        parameters: action.parameters as Record<string, any>,
      })),
    };
  }

  async executeRules(
    companyId: string,
    trigger: string,
    context: FlowExecutionContext,
  ): Promise<FlowExecutionResult[]> {
    const rules = await this.getActiveRules(companyId, trigger);
    const results: FlowExecutionResult[] = [];

    for (const rule of rules) {
      try {
        const ruleResult = await this.executeRule(rule, context);
        results.push(ruleResult);
      } catch (error) {
        results.push({
          success: false,
          ruleId: rule.id!,
          ruleName: rule.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  private async executeRule(
    rule: FlowRuleData,
    context: FlowExecutionContext,
  ): Promise<FlowExecutionResult> {
    // Evaluate conditions
    if (!this.evaluateConditions(rule.conditions, context)) {
      return {
        success: true,
        ruleId: rule.id!,
        ruleName: rule.name,
        skipped: true,
        reason: "Conditions not met",
      };
    }

    // Execute actions
    const actionResults = [];
    for (const action of rule.actions) {
      try {
        const result = await this.executeAction(action, context);
        actionResults.push({
          type: action.type,
          success: true,
          result,
        });
      } catch (error) {
        actionResults.push({
          type: action.type,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Log execution
    await this.logExecution(rule, context, actionResults);

    return {
      success: true,
      ruleId: rule.id!,
      ruleName: rule.name,
      actionResults,
    };
  }

  private evaluateConditions(
    conditions: FlowConditionData[],
    context: FlowExecutionContext,
  ): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0], context);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, context);

      if (condition.logicalOperator === "OR") {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  private evaluateCondition(
    condition: FlowConditionData,
    context: FlowExecutionContext,
  ): boolean {
    const fieldValue = this.getNestedValue(context, condition.field);

    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;
      case "not_equals":
        return fieldValue !== condition.value;
      case "contains":
        return String(fieldValue).includes(String(condition.value));
      case "greater_than":
        return Number(fieldValue) > Number(condition.value);
      case "less_than":
        return Number(fieldValue) < Number(condition.value);
      case "in":
        return (
          Array.isArray(condition.value) && condition.value.includes(fieldValue)
        );
      case "not_in":
        return (
          Array.isArray(condition.value) &&
          !condition.value.includes(fieldValue)
        );
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private async executeAction(
    action: FlowActionData,
    context: FlowExecutionContext,
  ): Promise<any> {
    const params = this.interpolateParameters(action.parameters, context);

    switch (action.type) {
      case "update_status":
        return await this.updateMaintenanceStatus(
          context.maintenance?.id,
          params,
        );

      case "send_notification":
        return await this.sendNotification(params);

      case "update_asset":
        return await this.updateAsset(params);

      case "create_record":
        return await this.createRecord(params);

      case "send_email":
        return await this.sendEmail(params);

      case "calculate_cost":
        return await this.calculateCost(context.maintenance?.id, params);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private interpolateParameters(
    parameters: Record<string, any>,
    context: FlowExecutionContext,
  ): Record<string, any> {
    const interpolated: Record<string, any> = {};

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === "string" && value.includes("{{")) {
        interpolated[key] = this.interpolateString(value, context);
      } else {
        interpolated[key] = value;
      }
    }

    return interpolated;
  }

  private interpolateString(
    template: string,
    context: FlowExecutionContext,
  ): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      return this.getNestedValue(context, path) || match;
    });
  }

  private async logExecution(
    rule: FlowRuleData,
    context: FlowExecutionContext,
    actionResults: any[],
  ): Promise<void> {
    await prisma.flowExecution.create({
      data: {
        flowRuleId: rule.id!,
        maintenanceId: context.maintenance?.id,
        assetId: context.asset?.id,
        trigger: rule.trigger,
        context: context,
        results: actionResults,
        success: actionResults.every((result) => result.success !== false),
      },
    });
  }

  // Action implementations
  private async updateMaintenanceStatus(maintenanceId: string, params: any) {
    return await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: { [params.field]: params.value },
    });
  }

  private async sendNotification(params: any) {
    // Implement notification logic
    console.log("Sending notification:", params);
  }

  private async updateAsset(params: any) {
    return await prisma.asset.update({
      where: { id: params.assetId },
      data: { statusLabelId: params.statusLabelId },
    });
  }

  private async createRecord(params: any) {
    if (params.type === "maintenance") {
      return await prisma.maintenance.create({
        data: params.data,
      });
    }
  }

  private async sendEmail(params: any) {
    // Implement email sending logic
    console.log("Sending email:", params);
  }

  private async calculateCost(maintenanceId: string, params: any) {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: maintenanceId },
      include: { asset: true },
    });

    // Calculate total cost based on parameters
    const totalCost = 0;

    if (params.includeParts) {
      // Add parts cost calculation
    }

    if (params.includeLabor) {
      // Add labor cost calculation
    }

    if (params.includeTravel) {
      // Add travel cost calculation
    }

    return await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: { cost: totalCost },
    });
  }
}

interface FlowExecutionResult {
  success: boolean;
  ruleId: string;
  ruleName: string;
  skipped?: boolean;
  reason?: string;
  error?: string;
  actionResults?: any[];
}
