# Audit Logging Robustness Plan

## Objective
To achieve robust, trustworthy audit logging across all business/domain entities and services, ensuring transparency, compliance, and user/authority trust.

---

## 1. **Scope: Entities & Services to Review**

### **Business/Domain Entities (lib/actions)**
- company.actions.ts
- role.actions.ts
- location.actions.ts
- manufacturer.actions.ts
- kits.actions.ts
- purchaseOrder.actions.ts
- pricingPlan.actions.ts
- subscription.actions.ts
- statusLabel.actions.ts
- model.actions.ts
- flowRules.actions.ts
- usageRecord.actions.ts
- smart-cleanup.actions.ts
- chatGPT.actions.ts
- invitation.actions.ts
- stripe.actions.ts
- auditLog.actions.ts (log access/export)
- base-action.ts (if used for sensitive logic)

### **Service Layer (lib/services, services/)**
- co2-consistency.service.ts
- co2Footprint.service.ts
- ai.service.ts
- ai-analytics.service.ts
- ai-cost-optimization.service.ts
- ai-multi-provider.service.ts
- smart-cleanup-engine-simple.service.ts
- report-cleanup.service.ts
- usage.service.ts
- flowRulesService.ts
- services/email/
- services/auth/
- services/aws/
- services/user/
- services/OpenAI/
- services/validation.ts
- services/test.ts

---

## 2. **Audit Logging Checklist for Each File**
- [ ] **CRUD Operations:** Log create, update, delete actions.
- [ ] **Sensitive Actions:** Log assignments, check-ins, approvals, permission changes, etc.
- [ ] **Exports/Downloads:** Log when data is exported or downloaded (CSV, PDF, etc.).
- [ ] **Bulk/Batch Operations:** Log all mass/bulk actions.
- [ ] **Data Access/Views:** (Premium) Log when sensitive data is viewed.
- [ ] **Audit Log Access:** Log when audit logs themselves are viewed or exported.
- [ ] **Automated/Background Jobs:** Log system/scheduled actions (actor: "system").
- [ ] **Webhooks/Integrations:** Log all inbound/outbound events that change data.
- [ ] **Use Centralized Helper:** Use `createAuditLog` for consistency.
- [ ] **Log Details:** Always include `companyId`, `entity`, `entityId`, `action`, and a clear, human-readable `details` string (who, what, when, why).

---

## 3. **Best Practices for Audit Logging**
- **Consistency:** Use a single helper (e.g., `createAuditLog`) everywhere.
- **Coverage:** Log all business-critical and sensitive actions, not just CRUD.
- **Clarity:** Make log entries self-explanatory for both users and auditors.
- **Retention:** Define and document how long logs are kept (e.g., 1 year for standard, 7+ years for enterprise).
- **Customer Visibility:** (Premium) Allow customers to view/export their audit logs.
- **Security:** Never log sensitive data values (e.g., passwords, secrets), only metadata about the action.
- **Tamper Resistance:** For high-trust environments, consider write-once storage or external archiving.

---

## 4. **Action Steps**
1. **Review each file listed above.**
2. **For each action that modifies, deletes, exports, or views sensitive data, add a call to `createAuditLog` after successful completion.**
3. **For background/system actions, log the actor as `"system"`.**
4. **For webhooks/integrations, log the event, source, and affected data.**
5. **Test audit logging for all critical workflows.**
6. **Document your audit logging policy and retention in the product documentation.**

---

## 5. **Goal: Transmit Trust**
- **To Users:** Demonstrate transparency and accountability for all actions affecting their data.
- **To Authorities:** Provide a clear, tamper-resistant audit trail for compliance and investigations.
- **To Customers:** Enable premium features like audit log access, export, and advanced compliance.

---

> **By following this plan, your app will have industry-leading audit logging, supporting both MVP and premium compliance needs.** 