# Query and Action Pattern Best Practices

This document outlines the best practices for implementing queries and server actions in our Next.js application with Supabase integration.

## Overview

Our application uses a combination of:
- React Query for client-side state management
- Next.js Server Actions for server-side operations
- Supabase for authentication and authorization
- Prisma for database operations
- Zod for schema validation

## Core Patterns

### 1. Type Definitions

```typescript
// Common response type for all server actions
interface ActionResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Base entity interface for all models
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Server Actions Pattern

```typescript
// 1. Always use the 'use server' directive
"use server";

// 2. Define Zod schema for validation
const modelSchema = z.object({
  name: z.string(),
  // ... other fields
});

// 3. Use withAuth HOC for protected routes
export const create = withAuth(
  async (
    user,
    data: z.infer<typeof modelSchema>
  ): Promise<ActionResponse<T>> => {
    try {
      // Validate input
      const validation = modelSchema.parse(data);
      
      // Add company context from authenticated user
      const result = await prisma.model.create({
        data: {
          ...validation,
          companyId: user.user_metadata?.companyId,
        },
      });

      // Revalidate affected paths
      revalidatePath("/path-to-revalidate");
      
      return {
        success: true,
        data: parseStringify(result),
      };
    } catch (error) {
      console.error("Operation failed:", error);
      return {
        success: false,
        error: "Failed to perform operation",
      };
    } finally {
      await prisma.$disconnect();
    }
  }
);

// 4. Create wrapper for client-side use
export async function createModel(
  data: z.infer<typeof modelSchema>
): Promise<ActionResponse<T>> {
  const session = await getSession();
  return create(session, data);
}
```

### 3. Query Hook Pattern

```typescript
// 1. Define query key constant
export const MODEL_KEY = ["model"] as const;

// 2. Define input types using Zod schema
type CreateModelInput = z.infer<typeof modelSchema>;

// 3. Define query hook using generic factory
export function useModelQuery() {
  const { onClose } = useModelUIStore();

  const genericQuery = createGenericQuery<Model, CreateModelInput>(
    MODEL_KEY,
    {
      getAll: async () => getAllModels(),
      insert: async (data) => createModel(data),
      delete: async (id) => deleteModel(id),
      update: async (id, data) => updateModel(id, data),
    },
    {
      onClose,
      successMessage: "Operation successful",
      errorMessage: "Operation failed",
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    isCreating,
    isUpdating,
    refresh,
  } = genericQuery();

  return {
    items,
    isLoading,
    error,
    createItem,
    updateItem,
    deleteItem,
    isCreating,
    isUpdating,
    refresh,
  };
}
```

## Best Practices

### Server Actions

1. **Authentication & Authorization**
   - Always use the `withAuth` HOC for protected routes
   - Include company context in all queries
   - Validate user permissions before operations

2. **Data Validation**
   - Use Zod schemas for input validation
   - Define schemas in a central location (`lib/schemas`)
   - Validate both on client and server side

3. **Error Handling**
   - Use consistent error response format
   - Log errors with appropriate context
   - Return user-friendly error messages

4. **Database Operations**
   - Always include company context in queries
   - Use Prisma transactions when needed
   - Properly disconnect from database

5. **Cache Management**
   - Use `revalidatePath` for affected routes
   - Consider cache implications in mutations
   - Implement optimistic updates when appropriate

### Query Hooks

1. **Type Safety**
   - Use TypeScript generics for type safety
   - Define proper input/output types
   - Avoid type assertions (`as any`)

2. **State Management**
   - Use React Query for caching and state
   - Implement proper loading states
   - Handle errors consistently

3. **Performance**
   - Set appropriate stale times
   - Implement pagination where needed
   - Use optimistic updates for better UX

4. **Code Organization**
   - Keep query keys consistent
   - Separate UI state from data state
   - Use proper file structure

## Implementation Steps

1. **Create Schema**
   ```typescript
   // lib/schemas/model.schema.ts
   export const modelSchema = z.object({
     // Define your schema
   });
   ```

2. **Create Server Actions**
   ```typescript
   // lib/actions/model.actions.ts
   "use server";
   export const create = withAuth(async (user, data) => {
     // Implement action
   });
   ```

3. **Create Query Hook**
   ```typescript
   // hooks/queries/useModelQuery.ts
   export function useModelQuery() {
     // Implement query hook
   }
   ```

4. **Use in Components**
   ```typescript
   // components/ModelComponent.tsx
   const { items, createItem } = useModelQuery();
   ```

## Common Pitfalls to Avoid

1. Don't skip input validation
2. Don't use type assertions (`as any`) - implement proper types instead
3. Don't mix UI state with data state
4. Don't forget to handle loading and error states
5. Don't forget to include company context in queries
6. Don't mix AuthResponse with ActionResponse types
7. Don't skip proper error handling
8. Don't forget to revalidate cache after mutations
9. Don't use full types for partial updates
10. Don't hardcode error messages - use configuration objects

## Advanced Patterns

### 1. Type Safety Between Server and Client

```typescript
// Bad Practice ❌
update: async (id: string, data: CreateManufacturerInput) => {
  return await update(id, data as any);
}

// Good Practice ✅
update: async (id: string, data: Partial<CreateManufacturerInput>) => {
  return await update(id, data);
}
```

### 2. Search Parameters

```typescript
// Action Definition
export const getAll = withAuth(
  async (
    user,
    params?: { search?: string }
  ): Promise<ActionResponse<T[]>> => {
    try {
      const where = {
        companyId: user.user_metadata?.companyId,
        ...(params?.search && {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            // Add other searchable fields
          ],
        }),
      };
      // ... implementation
    }
  }
);

// Query Hook Usage
const genericQuery = createGenericQuery<T, CreateInput>(
  MODEL_KEY,
  {
    getAll: async (params?: { search?: string }) => {
      return await getAll(params);
    },
    // ... other operations
  }
);
```

### 3. Error Message Handling

```typescript
// In createGenericQuery
{
  successMessage: {
    create: "Item created successfully",
    update: "Item updated successfully",
    delete: "Item deleted successfully"
  },
  errorMessage: {
    create: "Failed to create item",
    update: "Failed to update item",
    delete: "Failed to delete item"
  }
}
```

### 4. UI State Management

```typescript
// Separate UI State
interface UIStore {
  isOpen: boolean;
  selectedItem: T | null;
  onOpen: () => void;
  onClose: () => void;
}

// Data State
interface DataStore<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
}

// Usage in Query Hook
export function useEntityQuery() {
  const { onClose } = useEntityUIStore();
  const queryClient = useQueryClient();

  return {
    // Data operations
    items,
    isLoading,
    error,
    
    // UI operations
    onClose,
    refresh: () => queryClient.invalidateQueries(MODEL_KEY)
  };
}
```

### 5. Response Type Consistency

```typescript
// Define consistent response types
type ActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

// Never use AuthResponse for data operations
type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
};

// Use proper type guards
function isActionResponse<T>(response: unknown): response is ActionResponse<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response
  );
}
```

## Migration Guide

When migrating existing code to this pattern:

1. Start with schema definitions
2. Update server actions to use `withAuth`
3. Create or update query hooks
4. Update components to use new hooks
5. Test thoroughly, especially error cases
6. Update tests to match new pattern

## Testing

1. **Unit Tests**
   - Test schema validation
   - Test server actions in isolation
   - Test query hooks with mocked data

2. **Integration Tests**
   - Test complete flow from UI to database
   - Test error scenarios
   - Test authentication flows

3. **E2E Tests**
   - Test critical user flows
   - Test with real database
   - Test with real authentication

## Conclusion

Following these patterns ensures:
- Type safety across the application
- Consistent error handling
- Proper authentication and authorization
- Clean and maintainable code
- Good performance and user experience 