# GHG Scope Integration Guide

## Overview

This guide shows how to integrate GHG Protocol Scope 1/2/3 classification into your existing CO2 calculation system. The integration enhances your current AI-powered carbon footprint calculations with proper emissions categorization for ESG compliance.

## What We've Added

### 1. Database Schema Enhancement
- Added scope classification fields to `Co2eRecord` model:
  - `scope`: Primary GHG scope (1, 2, or 3)
  - `scopeCategory`: Detailed category description
  - `emissionFactor`: Emission factor used for calculation
  - `emissionFactorSource`: Source of emission factor
  - `activityData`: Activity data used in calculation

### 2. Enhanced TypeScript Types
- Extended `CO2CalculationResult` interface with:
  - `scopeBreakdown`: Complete GHG scope breakdown
  - `primaryScope` and `primaryScopeCategory`: Main classification
  - `emissionFactors`: Enhanced source tracking
  - `activityData`: Calculation inputs

### 3. AI Prompt Enhancement
- Updated AI service to classify emissions by GHG Protocol
- Provides detailed scope breakdown for each asset
- Maps lifecycle stages to appropriate scopes

### 4. Enhanced UI Components
- New tabbed CO2 dialog with scope visualization
- GHG scope breakdown dashboard component
- Color-coded scope indicators

## How to Use

### 1. Calculating CO2 with Scopes

```typescript
// Your existing calculation still works
const result = await calculateAssetCO2Action(assetId);

// Now includes scope classification
if (result.success && result.data) {
  console.log("Primary Scope:", result.data.primaryScope);
  console.log("Scope Breakdown:", result.data.scopeBreakdown);
}
```

### 2. Displaying Scope Data

```tsx
// Use the enhanced CO2 dialog
<CO2Dialog 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  assetId={assetId}
  assetName={assetName}
  initialResult={co2Result}
  isNewCalculation={true}
/>

// Or use the scope breakdown component
<GHGScopeBreakdown scopeData={scopeBreakdown} />
```

### 3. Scope-Based Reporting

```typescript
// Get scope statistics for a company
const stats = await CO2FootprintService.getCO2FootprintStats(companyId);
if (stats.success && stats.data) {
  console.log("Scope breakdown:", stats.data.scopeBreakdown);
  console.log("Assets by scope:", stats.data.co2ByScope);
}
```

## GHG Scope Classification

### For IT Assets (Most Common)

**Primary Scope: 3** - Other Indirect Emissions
- **Manufacturing**: Scope 3, Category 1 (Purchased goods and services)
- **Transport**: Scope 3, Category 4 (Upstream transportation)
- **Use Phase**: Scope 2 (Purchased electricity)
- **End-of-Life**: Scope 3, Category 12 (End-of-life treatment)

### Scope Definitions

**Scope 1: Direct Emissions**
- Company-owned vehicles
- On-site fuel combustion
- Process emissions
- Fugitive emissions

**Scope 2: Energy Indirect Emissions**
- Purchased electricity
- Purchased heating/cooling
- Purchased steam

**Scope 3: Other Indirect Emissions**
- Purchased goods and services (manufacturing)
- Capital goods
- Fuel and energy activities
- Transportation and distribution
- Waste generated in operations
- Business travel
- Employee commuting
- Use of sold products
- End-of-life treatment

## Migration Steps

### 1. Run Database Migration
```bash
npx prisma migrate dev --name add_ghg_scope_classification
```

### 2. Update Existing Records (Optional)
Run this script to classify existing CO2 records:

```typescript
// utils/migrateExistingCO2Records.ts
import { prisma } from "@/app/db";

export async function migrateExistingCO2Records() {
  const records = await prisma.co2eRecord.findMany({
    where: { scope: null },
    include: { asset: { include: { category: true } } }
  });

  for (const record of records) {
    // Default IT assets to Scope 3 (manufacturing-heavy)
    await prisma.co2eRecord.update({
      where: { id: record.id },
      data: {
        scope: 3,
        scopeCategory: "Purchased goods and services (manufacturing)",
      }
    });
  }
}
```

### 3. Update Your Dashboard
Add the scope breakdown component to your main dashboard:

```tsx
// In your dashboard component
import { GHGScopeBreakdown } from "@/components/dashboard/AssetCharts";

// Use it with your CO2 stats
{stats.scopeBreakdown && (
  <GHGScopeBreakdown scopeData={stats.scopeBreakdown} />
)}
```

## Benefits

### 1. ESG Compliance Ready
- Proper GHG Protocol classification
- Foundation for CSRD, GRI, CDP reporting
- Audit-ready scope documentation

### 2. Enhanced Analytics
- Scope-based emissions tracking
- Category-level insights
- Hotspot identification

### 3. Better Decision Making
- Understand emission sources
- Prioritize reduction efforts
- Track scope-specific progress

## Next Steps

### Phase 1: Current Implementation ✅
- [x] Database schema with scope fields
- [x] Enhanced AI calculations
- [x] Scope-aware UI components
- [x] Basic scope reporting

### Phase 2: Advanced Features (Next 2-4 weeks)
- [ ] Scope 3 category breakdown (15 categories)
- [ ] Multi-site scope aggregation
- [ ] Scope-based reduction targets
- [ ] Automated scope classification rules

### Phase 3: Full ESG Platform (2-3 months)
- [ ] Complete CSRD compliance
- [ ] GRI 305 reporting templates
- [ ] CDP questionnaire integration
- [ ] Third-party verification support

## Example Output

When you calculate CO2 for a MacBook Pro, you'll now get:

```json
{
  "totalCo2e": 384.2,
  "primaryScope": 3,
  "primaryScopeCategory": "Purchased goods and services (manufacturing)",
  "scopeBreakdown": {
    "scope1": { "total": 0, "categories": {} },
    "scope2": { "total": 85.0, "electricity": 85.0 },
    "scope3": { 
      "total": 299.2,
      "categories": {
        "purchasedGoods": 270.8,
        "upstreamTransport": 18.4,
        "endOfLifeTreatment": 10.0
      }
    }
  }
}
```

This gives you the foundation for ESG reporting while maintaining your existing AI-powered calculation workflow. 