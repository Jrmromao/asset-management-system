# Maintenance Types & Categories Implementation

## Problem Fixed

Users were unable to create new Maintenance Types & Categories because the necessary backend infrastructure was missing. The frontend components existed but only saved to local state without any API integration.

## Solution Implemented

### 1. Database Schema
Added new Prisma models to support maintenance types and categories:

```prisma
model MaintenanceCategory {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String   @default("#3B82F6")
  isActive    Boolean  @default(true)
  companyId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  company         Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)
  maintenanceTypes MaintenanceType[]

  @@unique([name, companyId])
  @@index([companyId])
  @@index([isActive])
}

model MaintenanceType {
  id                String   @id @default(cuid())
  name              String
  description       String?
  categoryId        String   // References MaintenanceCategory.id
  priority          String   @default("Medium") // "Low", "Medium", "High", "Critical"
  estimatedDuration Int      @default(1) // in hours
  requiredSkills    Json     @default("[]") // Array of strings
  defaultCost       Decimal  @default(0) @db.Decimal(10, 2)
  isActive          Boolean  @default(true)
  color             String   @default("#3B82F6")
  icon              String   @default("wrench")
  checklist         Json     @default("[]") // Array of ChecklistItem objects
  customFields      Json     @default("[]") // Array of CustomField objects
  companyId         String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  company           Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)
  category          MaintenanceCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([name, companyId])
  @@index([companyId])
  @@index([categoryId])
  @@index([isActive])
}
```

### 2. Server Actions
Created comprehensive server actions in `lib/actions/maintenanceType.actions.ts`:

**Maintenance Categories:**
- `getMaintenanceCategories()` - List all categories for user's company
- `createMaintenanceCategory()` - Create new category
- `updateMaintenanceCategory()` - Update existing category
- `deleteMaintenanceCategory()` - Delete category (with validation)

**Maintenance Types:**
- `getMaintenanceTypes()` - List all types with optional filtering
- `createMaintenanceType()` - Create new type
- `updateMaintenanceType()` - Update existing type
- `deleteMaintenanceType()` - Delete type

### 3. API Routes
Created REST API endpoints:

**Categories:**
- `GET /api/maintenance-categories` - List categories
- `POST /api/maintenance-categories` - Create category
- `PUT /api/maintenance-categories/[id]` - Update category
- `DELETE /api/maintenance-categories/[id]` - Delete category

**Types:**
- `GET /api/maintenance-types` - List types (with filtering)
- `POST /api/maintenance-types` - Create type
- `PUT /api/maintenance-types/[id]` - Update type
- `DELETE /api/maintenance-types/[id]` - Delete type

### 4. React Query Hooks
Created comprehensive hooks in `hooks/queries/useMaintenanceTypeQuery.ts`:

**Categories:**
- `useMaintenanceCategories()` - Fetch categories
- `useCreateMaintenanceCategory()` - Create category mutation
- `useUpdateMaintenanceCategory()` - Update category mutation
- `useDeleteMaintenanceCategory()` - Delete category mutation

**Types:**
- `useMaintenanceTypes()` - Fetch types with filtering
- `useCreateMaintenanceType()` - Create type mutation
- `useUpdateMaintenanceType()` - Update type mutation
- `useDeleteMaintenanceType()` - Delete type mutation

### 5. Updated Component
Completely rewrote `components/maintenance/MaintenanceTypeManager.tsx` to:
- Use React Query hooks instead of local state
- Properly handle loading states
- Show real-time data from the database
- Handle errors gracefully
- Support full CRUD operations

## Key Features

### Maintenance Categories
- **Name & Description**: Basic category information
- **Color Coding**: Visual identification with custom colors
- **Active/Inactive States**: Enable/disable categories
- **Company Isolation**: Categories are scoped to each company
- **Validation**: Prevents deletion if types are using the category

### Maintenance Types
- **Rich Configuration**: Name, description, priority, duration, cost
- **Category Association**: Link to maintenance categories
- **Visual Customization**: Custom colors and icons
- **Skills & Checklists**: Required skills and task checklists
- **Custom Fields**: Extensible field system for additional data
- **Priority Levels**: Low, Medium, High, Critical
- **Company Isolation**: Types are scoped to each company

### Data Validation
- **Unique Names**: Category and type names must be unique per company
- **Required Fields**: Validates essential fields before saving
- **Category Dependencies**: Prevents deletion of categories in use
- **Data Integrity**: Ensures consistent relationships

## Usage Examples

### Creating a Category
```typescript
const createCategory = useCreateMaintenanceCategory();

await createCategory.mutateAsync({
  name: "Preventive",
  description: "Scheduled maintenance to prevent issues",
  color: "#22C55E",
  isActive: true
});
```

### Creating a Type
```typescript
const createType = useCreateMaintenanceType();

await createType.mutateAsync({
  name: "Oil Change",
  description: "Regular engine oil replacement",
  categoryId: "category-id",
  priority: "Medium",
  estimatedDuration: 2,
  requiredSkills: ["Basic Mechanical"],
  defaultCost: 50.00,
  color: "#3B82F6",
  icon: "wrench",
  isActive: true,
  checklist: [],
  customFields: []
});
```

## Benefits

1. **Full CRUD Operations**: Complete create, read, update, delete functionality
2. **Real-time Updates**: Changes are immediately reflected across the application
3. **Data Persistence**: All data is stored in the database
4. **Company Isolation**: Multi-tenant support with proper data separation
5. **Type Safety**: Full TypeScript support with proper type definitions
6. **Error Handling**: Comprehensive error handling and user feedback
7. **Performance**: Optimized queries with proper indexing
8. **Extensibility**: Flexible schema supports future enhancements

## Database Migration

The schema changes were applied with:
```bash
npx prisma migrate dev --name add_maintenance_types_categories
```

This created the necessary tables and relationships in the database.

## Testing

The implementation can be tested by:
1. Navigating to the maintenance flows page
2. Accessing the maintenance type manager
3. Creating categories and types
4. Verifying data persistence across page refreshes
5. Testing CRUD operations through the UI

## Future Enhancements

- **Workflow Templates**: Pre-defined maintenance workflows
- **Resource Requirements**: Link to required tools and parts
- **Time Tracking**: Integration with actual maintenance duration
- **Cost Analysis**: Track actual vs estimated costs
- **Reporting**: Analytics on maintenance type performance
- **Import/Export**: Bulk operations for maintenance configurations 