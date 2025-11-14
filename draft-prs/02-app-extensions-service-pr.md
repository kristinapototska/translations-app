# [Draft] Add CATEGORIES model support to App Extensions service

## Related Jira
- Story: [CATALOG-11279](https://bigcommercecloud.atlassian.net/browse/CATALOG-11279)
- Task: [CATALOG-XXXXX](https://bigcommercecloud.atlassian.net/browse/CATALOG-XXXXX) (Backend Service Updates - to be created)
- Depends on: Task for GraphQL Schema (CATALOG-XXXXX)

## Description

This PR updates the App Extensions backend service to support the `CATEGORIES` model, including model registration, validation, and query filtering.

## Changes

### 1. Model Registry Update

**File:** `app/AppExtensions/services/app-extension.service.ts` (or equivalent)

```typescript
const SUPPORTED_MODELS = {
  PRODUCTS: {
    entityType: 'product',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
  CUSTOMERS: {
    entityType: 'customer',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
  ORDERS: {
    entityType: 'order',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
  PRODUCT_DESCRIPTION: {
    entityType: 'product',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
  CATEGORIES: {  // NEW
    entityType: 'category',
    idField: 'id',
    supportedContexts: ['PANEL', 'LINK'],
  },
} as const;
```

### 2. Validation Update

**File:** `app/AppExtensions/validators/app-extension.validator.ts` (or equivalent)

```typescript
const VALID_MODELS = [
  'PRODUCTS',
  'CUSTOMERS',
  'ORDERS',
  'PRODUCT_DESCRIPTION',
  'CATEGORIES',  // NEW
] as const;

export const validateAppExtensionModel = (model: string): boolean => {
  return VALID_MODELS.includes(model as typeof VALID_MODELS[number]);
};
```

### 3. Query/Filter Logic

**File:** `app/AppExtensions/repositories/app-extension.repository.ts` (or equivalent)

```typescript
// Ensure queries support filtering by CATEGORIES
export const getExtensionsByModel = async (
  model: AppExtensionModel
): Promise<AppExtension[]> => {
  return await db.appExtensions.findMany({
    where: { 
      model,
      isActive: true,
    },
  });
};
```

### 4. Type Definitions

**File:** `app/AppExtensions/types/app-extension.types.ts` (or equivalent)

```typescript
export type AppExtensionModel = 
  | 'PRODUCTS'
  | 'CUSTOMERS'
  | 'ORDERS'
  | 'PRODUCT_DESCRIPTION'
  | 'CATEGORIES';  // NEW
```

## Implementation Details

- Added CATEGORIES to model registry with appropriate metadata
- Updated validation to accept CATEGORIES model
- Ensured query/filter logic supports CATEGORIES
- Updated TypeScript types

## Testing

- [ ] Unit tests for model validation with CATEGORIES
- [ ] Integration tests for creating CATEGORIES extensions
- [ ] Integration tests for querying CATEGORIES extensions
- [ ] Verify backward compatibility

## Related PRs

- Depends on: PR #1 (GraphQL Schema)
- Required for: PR #3, PR #4 (Category Manager UI)

## Checklist

- [ ] Model registry updated
- [ ] Validation logic updated
- [ ] Query/filter logic updated
- [ ] Type definitions updated
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Documentation updated (if applicable)

