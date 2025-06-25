# CO2 Calculation Consistency System

## Overview

The CO2 Calculation Consistency System ensures that identical assets always return the same CO2 footprint values, regardless of how they're described or when they're calculated. This addresses the critical issue of inconsistent CO2 figures for the same asset.

## Problem Statement

**Before**: The same asset could return different CO2 values due to:
- Different AI provider responses
- Variations in asset descriptions ("MacBook Pro 14" vs "MacBook Pro 14-inch")
- Non-deterministic AI parameters
- Lack of caching for identical assets

**After**: Identical assets always return consistent CO2 values through:
- Asset fingerprinting and normalization
- Deterministic AI parameters
- Intelligent caching system
- Fallback provider consistency

## How It Works

### 1. Asset Fingerprinting

Each asset gets a unique fingerprint based on normalized characteristics:

```typescript
// Example fingerprint generation
const asset = {
  manufacturer: "Apple Inc.",
  model: "MacBook Pro 14-inch M3 512GB Space Gray",
  category: "Laptops",
  type: "MacBook Pro"
};

// Normalized to:
const normalized = {
  manufacturer: "apple",
  model: "macbook pro 14-inch",
  category: "laptop", 
  type: "laptop"
};

// SHA-256 hash: "a1b2c3d4e5f6..."
```

### 2. Asset Normalization

The system handles common variations:

#### Manufacturer Normalization
- "Apple Inc." → "apple"
- "Dell Technologies" → "dell"
- "Hewlett-Packard" → "hp"

#### Model Normalization
- Removes storage sizes: "512GB", "1TB"
- Removes colors: "Space Gray", "Silver"
- Removes screen sizes: '14"', "inch"
- Standardizes naming: "MacBook Pro 14" → "macbook pro 14-inch"

#### Category Normalization
- "Laptops" → "laptop"
- "Desktop Computer" → "desktop"
- "Portable Computer" → "laptop"

### 3. Deterministic AI Parameters

AI providers use consistent parameters for reproducible results:

```typescript
// OpenAI/DeepSeek
{
  temperature: 0.0,     // Maximum determinism
  seed: 42,             // Fixed seed
  top_p: 1.0           // Use all tokens
}

// Gemini
{
  temperature: 0.0,     // Maximum determinism
  topP: 1.0,           // Use all tokens  
  topK: 1              // Most deterministic
}
```

### 4. Intelligent Caching

The system caches CO2 calculations by fingerprint:

```sql
-- Special CO2 records for caching
INSERT INTO Co2eRecord (
  itemType = 'AssetTemplate',
  details = '{"fingerprint": "a1b2c3d4...", "totalCo2e": 384.2, ...}'
)
```

## Usage

### Basic Asset CO2 Calculation

```typescript
import { CO2ConsistencyService } from "@/lib/services/co2-consistency.service";

const result = await CO2ConsistencyService.calculateConsistentCO2(
  "MacBook Pro",           // Asset name
  "Apple",                 // Manufacturer
  "MacBook Pro 14-inch",   // Model
  "Laptop"                 // Category (optional)
);

if (result.success) {
  console.log(`CO2e: ${result.data.totalCo2e} ${result.data.units}`);
  console.log(`Source: ${result.source}`); // 'cache' or 'calculation'
  console.log(`Fingerprint: ${result.fingerprint}`);
}
```

### Force Recalculation

```typescript
const result = await CO2ConsistencyService.calculateConsistentCO2(
  "MacBook Pro",
  "Apple", 
  "MacBook Pro 14-inch",
  "Laptop",
  true // Force recalculation
);
```

### Get Asset Fingerprint

```typescript
const fingerprint = await CO2ConsistencyService.getAssetFingerprint(assetId);
```

### Clear Cache

```typescript
// Clear specific fingerprint
await CO2ConsistencyService.clearCO2Cache("a1b2c3d4e5f6...");

// Clear all cache
await CO2ConsistencyService.clearCO2Cache();
```

## Integration

### Updated CO2FootprintService

The main CO2 service now uses the consistency service:

```typescript
// Before
const co2Result = await calculateAssetCo2(name, manufacturer, model);

// After  
const co2Result = await CO2ConsistencyService.calculateConsistentCO2(
  name, manufacturer, model, category
);
```

### API Routes

- `POST /api/co2/test-consistency` - Test consistency
- `POST /api/co2/clear-cache` - Clear cache
- `POST /api/co2/calculate` - Calculate with consistency

### Admin Interface

Use the `CO2ConsistencyManager` component to:
- Test asset consistency
- View cached calculations
- Understand asset fingerprinting
- Clear cache when needed

## Benefits

### ✅ Consistency Guarantees

- **Same Asset = Same CO2**: Identical assets always return identical values
- **Description Variations**: "MacBook Pro 14" and "MacBook Pro 14-inch M3" return same result
- **Provider Independence**: Consistent results regardless of AI provider used

### ✅ Performance Improvements

- **Cache Hits**: Subsequent calculations for same assets are instant
- **Reduced AI Costs**: Fewer API calls to AI providers
- **Faster Response Times**: Cached results return in milliseconds

### ✅ Data Integrity

- **Audit Trail**: Track calculation source (cache vs new)
- **Fingerprint Tracking**: Understand asset groupings
- **Validation**: Ensure data quality and consistency

## Configuration

### Environment Variables

```bash
# Use consistent AI provider for deterministic results
OPENAI_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here  
GEMINI_API_KEY=your_key_here
```

### Database Schema

The system uses the existing `Co2eRecord` table with:
- `itemType: 'AssetTemplate'` for cached calculations
- `details` field stores complete CO2 data with fingerprint
- `scope`, `scopeCategory` for GHG classification

## Monitoring

### Consistency Metrics

Track these metrics for system health:
- Cache hit rate (target: >80%)
- Consistency test pass rate (target: 100%)
- Fingerprint collision rate (target: <0.1%)

### Admin Dashboard

Use the CO2ConsistencyManager component to:
- Monitor cached calculations
- Test consistency across asset variations
- Clear problematic cache entries
- Understand fingerprint generation

## Troubleshooting

### Inconsistent Results

If you see inconsistent results:

1. **Check AI Provider**: Ensure deterministic parameters are set
2. **Verify Normalization**: Check asset normalization logic
3. **Clear Cache**: Clear specific fingerprint cache
4. **Test Consistency**: Use admin interface to test

### Cache Issues

If cache isn't working:

1. **Database Connection**: Verify Prisma connection
2. **Fingerprint Generation**: Check fingerprint creation
3. **Cache Storage**: Verify Co2eRecord creation
4. **Cache Retrieval**: Check fingerprint matching

### Performance Issues

If calculations are slow:

1. **Cache Hit Rate**: Check if cache is being used
2. **AI Provider Response**: Monitor AI service latency
3. **Database Queries**: Optimize fingerprint lookups
4. **Batch Processing**: Consider bulk calculations

## Future Enhancements

### Planned Features

- **Machine Learning**: Improve asset normalization with ML
- **Similarity Matching**: Find similar assets for approximation
- **Confidence Scoring**: Rate fingerprint accuracy
- **Bulk Operations**: Batch consistency updates

### API Improvements

- **GraphQL Support**: More flexible querying
- **Webhook Notifications**: Real-time consistency alerts
- **Batch Endpoints**: Bulk consistency operations
- **Analytics API**: Consistency metrics and insights 