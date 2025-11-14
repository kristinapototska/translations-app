# BigCommerce App Extensions: UI Area Extension Analysis

## Executive Summary

This document analyzes how BigCommerce App Extensions work and outlines the steps needed to extend UI areas beyond the currently supported models (PRODUCTS, CUSTOMERS, ORDERS, and PRODUCT_DESCRIPTION).

## Current Implementation Overview

### Supported Models (from GraphQL Schema)

Based on the GraphQL schema, BigCommerce currently supports these `AppExtensionModel` enum values:

1. **PRODUCTS** - Appears on products-related pages
2. **CUSTOMERS** - Appears on customer-related pages  
3. **ORDERS** - Appears on orders-related pages
4. **PRODUCT_DESCRIPTION** - Appears in the description field on Edit Products pages

### Supported Contexts

The `AppExtensionContext` enum supports:
- **PANEL** - Opens a side panel on the current page
- **LINK** - Navigates away to the app's page

(Note: The TypeScript types in this codebase also include `BUTTON` and `FULL_PAGE`, suggesting these may be coming or available in some environments)

## How App Extensions Work

### 1. Registration Flow

**App Side (Current Codebase Pattern):**

```typescript
// lib/constants.ts - Define extensions
export const appExtensions: CreateAppExtension[] = [
  {
    context: "PANEL",
    model: "PRODUCTS",
    url: "/products/${id}",
    label: {
      defaultValue: "Translate",
      locales: [/* locale-specific labels */]
    },
  },
];

// app/api/auth/route.ts - Register during OAuth callback
if (isAppExtensionsScopeEnabled && storeHash) {
  const graphqlClient = new GraphQLClient({ accessToken, storeHash });
  
  for (const extension of appExtensions) {
    await graphqlClient.upsertAppExtension(extension, {
      cleanupDuplicates: true,
    });
  }
}
```

**GraphQL API:**
- Uses `createAppExtension` mutation to register
- Stores extension metadata (model, context, url, label)
- Returns extension ID for future updates/deletes

### 2. Extension Matching Logic

The `upsertAppExtension` method matches extensions by:
- `context` (PANEL/LINK)
- `model` (PRODUCTS/CUSTOMERS/ORDERS/etc.)
- `url` (the route pattern)

If a match exists, it updates; otherwise, it creates a new extension.

### 3. URL Templating

Extensions use template literals in URLs:
- Pattern: `/products/${id}`
- BigCommerce replaces `${id}` with the actual entity ID
- Example: For product ID 123, `/products/${id}` becomes `/products/123`

## Steps to Extend Support to New UI Areas

### Phase 1: BigCommerce Control Panel Changes

To add support for a new model (e.g., `CATEGORIES`, `BRANDS`, `PAGES`), BigCommerce needs to:

#### 1.1 GraphQL Schema Updates

**File: `app/AppExtensions/schema.graphql` (or equivalent)**

```graphql
enum AppExtensionModel {
  CUSTOMERS
  ORDERS
  PRODUCTS
  PRODUCT_DESCRIPTION
  CATEGORIES  # NEW
  BRANDS      # NEW
  # ... other new models
}
```

#### 1.2 Backend Model Registration

**Location: Backend service handling App Extensions**

- Register the new model in the AppExtension model registry
- Ensure the model can be queried and filtered
- Add validation for the new model type

#### 1.3 UI Component Integration

**Location: Control Panel UI components for each area**

For each new model, BigCommerce needs to:

1. **Identify Target Pages:**
   - List pages (e.g., `/categories`)
   - Detail pages (e.g., `/categories/:id`)
   - Edit pages (e.g., `/categories/:id/edit`)

2. **Add Extension Hook Points:**
   ```typescript
   // Example: Category detail page component
   const { data: appExtensions } = useAppExtensions({ 
     model: 'CATEGORIES',
     entityId: categoryId 
   });
   
   // Render extension links/panels
   <AppExtensionRenderer 
     extensions={appExtensions}
     entityId={categoryId}
   />
   ```

3. **Create Extension Renderer Component:**
   - For `PANEL` context: Render side panel trigger button
   - For `LINK` context: Render navigation link
   - Handle URL templating (replace `${id}` with actual entity ID)

#### 1.4 Context Support

If adding new contexts (e.g., `BUTTON`, `FULL_PAGE`):

1. **Update GraphQL Schema:**
   ```graphql
   enum AppExtensionContext {
     LINK
     PANEL
     BUTTON    # NEW
     FULL_PAGE # NEW
   }
   ```

2. **Implement Context Handlers:**
   - `BUTTON`: Render as action button in toolbar
   - `FULL_PAGE`: Navigate to full-page view

### Phase 2: App Developer Changes

#### 2.1 Update Type Definitions

**File: `lib/graphql-client/src/types/app-extension.ts`**

```typescript
export type AppExtensionModel = 
  | 'PRODUCTS' 
  | 'CATEGORIES'  // NEW
  | 'ORDERS' 
  | 'CUSTOMERS' 
  | 'PRODUCT_DESCRIPTION'
  | 'BRANDS';     // NEW
```

#### 2.2 Regenerate GraphQL Schema

```bash
# Pull latest schema from BigCommerce
npm run generate-schema
```

#### 2.3 Add Extension Configuration

**File: `lib/constants.ts`**

```typescript
export const appExtensions: CreateAppExtension[] = [
  {
    context: "PANEL",
    model: "PRODUCTS",
    url: "/products/${id}",
    label: { /* ... */ },
  },
  // NEW: Category extension
  {
    context: "PANEL",
    model: "CATEGORIES",
    url: "/categories/${id}",
    label: {
      defaultValue: "Manage Category",
      locales: [/* ... */]
    },
  },
];
```

#### 2.4 Create Route Handlers

**File: `app/categories/[id]/page.tsx` (or equivalent)**

```typescript
export default function CategoryExtensionPage({ params }: { params: { id: string } }) {
  const categoryId = params.id;
  
  // Fetch category data
  // Render extension UI
  return <CategoryExtensionView categoryId={categoryId} />;
}
```

### Phase 3: Testing & Validation

1. **Scope Verification:**
   - Ensure `store_app_extensions_manage` scope is enabled
   - Verify OAuth flow includes extension registration

2. **Extension Registration:**
   - Test `createAppExtension` mutation with new model
   - Verify extension appears in `getAppExtensions` query

3. **UI Integration:**
   - Test extension appears on target pages
   - Verify URL templating works correctly
   - Test both PANEL and LINK contexts

4. **Edge Cases:**
   - Multiple extensions for same model/context
   - Extension updates and deletions
   - Locale-specific labels

## Key Files in BigCommerce Repository

Based on the pattern, BigCommerce likely has:

```
app/AppExtensions/
├── schema/
│   └── app-extension.graphql          # GraphQL type definitions
├── services/
│   └── app-extension.service.ts       # Backend business logic
├── components/
│   ├── AppExtensionRenderer.tsx       # Generic renderer component
│   ├── AppExtensionPanel.tsx          # Panel context handler
│   └── AppExtensionLink.tsx            # Link context handler
├── hooks/
│   └── useAppExtensions.ts            # React hook for fetching extensions
└── utils/
    └── urlTemplate.ts                 # URL templating utilities
```

## Implementation Checklist

### BigCommerce Control Panel

- [ ] Add new model to `AppExtensionModel` enum in GraphQL schema
- [ ] Update backend model registry
- [ ] Add extension hook points to target UI pages
- [ ] Implement extension renderer components
- [ ] Add URL templating support for new entity types
- [ ] Update documentation
- [ ] Add tests for new model support

### App Developer

- [ ] Update TypeScript types with new model
- [ ] Regenerate GraphQL schema/types
- [ ] Add extension configuration to constants
- [ ] Create route handlers for new extension URLs
- [ ] Implement UI components for extension pages
- [ ] Test extension registration and rendering
- [ ] Update app documentation

## Example: Adding CATEGORIES Support

### 1. BigCommerce Schema Update

```graphql
enum AppExtensionModel {
  # ... existing models
  CATEGORIES
}
```

### 2. BigCommerce UI Integration

```typescript
// app/Categories/[id]/page.tsx
import { useAppExtensions } from '@/hooks/useAppExtensions';

export default function CategoryDetailPage({ categoryId }) {
  const extensions = useAppExtensions({ 
    model: 'CATEGORIES', 
    entityId: categoryId 
  });
  
  return (
    <div>
      <CategoryDetails categoryId={categoryId} />
      <AppExtensionRenderer 
        extensions={extensions}
        entityId={categoryId}
      />
    </div>
  );
}
```

### 3. App Configuration

```typescript
// lib/constants.ts
export const appExtensions: CreateAppExtension[] = [
  // ... existing
  {
    context: "PANEL",
    model: "CATEGORIES",
    url: "/categories/${id}",
    label: {
      defaultValue: "Translate Category",
      locales: [/* ... */]
    },
  },
];
```

### 4. App Route Handler

```typescript
// app/categories/[id]/page.tsx
export default function CategoryExtensionPage({ params }) {
  return <CategoryTranslationView categoryId={params.id} />;
}
```

## Notes

1. **Model Availability:** The GraphQL schema is the source of truth. New models must be added there first before apps can use them.

2. **Backward Compatibility:** Existing extensions should continue working when new models are added.

3. **Scope Requirements:** Apps need the `store_app_extensions_manage` OAuth scope to register extensions.

4. **URL Parameters:** Currently only `${id}` is supported. Additional parameters would require schema and implementation changes.

5. **Context Limitations:** Not all contexts may be available for all models. BigCommerce may restrict certain combinations.

## References

- GraphQL Schema: `lib/graphql-client/schema.graphql` (lines 3276-3296)
- Extension Types: `lib/graphql-client/src/types/app-extension.ts`
- Registration Logic: `app/api/auth/route.ts` (lines 75-94)
- Client Implementation: `lib/graphql-client/src/client.ts` (lines 384-436)

