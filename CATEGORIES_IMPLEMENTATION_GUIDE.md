# Implementation Guide: Adding CATEGORIES Support to BigCommerce App Extensions

## Overview

This guide provides step-by-step instructions for implementing CATEGORIES model support in BigCommerce App Extensions, following the same pattern as the existing PRODUCTS implementation.

## Reference: How PRODUCTS Extensions Work

### Current PRODUCTS Implementation Pattern

1. **GraphQL Schema** - `PRODUCTS` is defined in `AppExtensionModel` enum
2. **Control Panel UI** - Product pages query and render extensions
3. **App Registration** - Apps register extensions via GraphQL API
4. **URL Routing** - Apps handle `/products/${id}` routes with `context` parameter

### Key Files in Category Manager Repository

Based on the pattern, the category-manager repository likely has:
- Category list page (`/categories` or similar)
- Category detail/edit pages (`/categories/:id` or `/categories/:id/edit`)
- Category-related components and hooks
- App Extensions integration (if any exists for other models)

## Implementation Steps

### Step 1: GraphQL Schema Updates

**Location:** `app/AppExtensions/schema.graphql` (or equivalent schema file)

**Action:** Add `CATEGORIES` to the `AppExtensionModel` enum

```graphql
enum AppExtensionModel {
  CUSTOMERS
  ORDERS
  PRODUCTS
  PRODUCT_DESCRIPTION
  CATEGORIES  # ADD THIS
}
```

**Files to modify:**
- GraphQL schema definition file
- Type generation files (if using code generation)

**Validation:**
- Ensure enum is exported/accessible
- Update any validation logic that checks model types
- Add tests for new model type

---

### Step 2: Backend Service Updates

**Location:** Backend service handling App Extensions (likely in `app/AppExtensions/services/` or similar)

**Actions:**

#### 2.1 Update Model Registry

```typescript
// Example: app/AppExtensions/services/app-extension.service.ts

const SUPPORTED_MODELS = {
  PRODUCTS: {
    entityType: 'product',
    idField: 'id',
    // ... other metadata
  },
  CUSTOMERS: { /* ... */ },
  ORDERS: { /* ... */ },
  CATEGORIES: {  // ADD THIS
    entityType: 'category',
    idField: 'id',
    // Category-specific metadata
  },
} as const;
```

#### 2.2 Add Model Validation

```typescript
// Ensure CATEGORIES is accepted in validation
const isValidModel = (model: string): boolean => {
  return ['PRODUCTS', 'CUSTOMERS', 'ORDERS', 'PRODUCT_DESCRIPTION', 'CATEGORIES'].includes(model);
};
```

#### 2.3 Update Query/Filter Logic

Ensure App Extensions can be queried and filtered by `CATEGORIES` model:

```typescript
// Example query filter
const getExtensionsByModel = async (model: AppExtensionModel) => {
  return await db.appExtensions.findMany({
    where: { model },
  });
};
```

**Files to modify:**
- `app/AppExtensions/services/app-extension.service.ts` (or equivalent)
- `app/AppExtensions/repositories/app-extension.repository.ts` (if separate)
- Validation middleware/files

---

### Step 3: UI Component Integration - Category List Page

**Location:** Category list/table component (likely `app/Categories/index.tsx` or `components/CategoryList.tsx`)

**Action:** Add App Extensions support to category list actions

#### 3.1 Import Required Hooks/Components

```typescript
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';
```

#### 3.2 Fetch Extensions for List Context

```typescript
// In category list component
const CategoryListPage = () => {
  // Fetch extensions that support list view (if applicable)
  // Note: Most extensions are entity-specific, but some might support list actions
  const { data: listExtensions } = useAppExtensions({ 
    model: 'CATEGORIES',
    context: 'list' // if supported
  });

  // ... existing category list code
};
```

**Note:** List-level extensions may not be common. Most extensions are entity-specific (detail/edit pages).

---

### Step 4: UI Component Integration - Category Detail/Edit Page

**Location:** Category detail or edit page (likely `app/Categories/[id]/page.tsx` or `components/CategoryForm.tsx`)

**Action:** Add App Extensions hook and renderer

#### 4.1 Add Extension Hook

```typescript
// app/Categories/[id]/page.tsx or similar
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  const categoryId = params.id;
  
  // Fetch App Extensions for this category
  const { data: appExtensions, isLoading } = useAppExtensions({
    model: 'CATEGORIES',
    entityId: categoryId,
  });

  // ... existing category detail code

  return (
    <div>
      {/* Existing category content */}
      <CategoryDetails categoryId={categoryId} />
      
      {/* Add App Extensions renderer */}
      {!isLoading && appExtensions && (
        <AppExtensionRenderer
          extensions={appExtensions}
          entityId={categoryId}
          model="CATEGORIES"
        />
      )}
    </div>
  );
}
```

#### 4.2 Integration Points

Extensions should appear in one of these locations (match PRODUCTS pattern):

**Option A: Action Menu/Dropdown**
```typescript
// In category action menu
<Dropdown>
  <DropdownItem>Edit</DropdownItem>
  <DropdownItem>Delete</DropdownItem>
  {/* App Extensions */}
  {appExtensions?.map(ext => (
    <AppExtensionMenuItem key={ext.id} extension={ext} entityId={categoryId} />
  ))}
</Dropdown>
```

**Option B: Toolbar/Action Bar**
```typescript
// In category toolbar
<Toolbar>
  <Button>Save</Button>
  <Button>Cancel</Button>
  {/* App Extensions */}
  {appExtensions?.map(ext => (
    <AppExtensionButton key={ext.id} extension={ext} entityId={categoryId} />
  ))}
</Toolbar>
```

**Option C: Side Panel Trigger**
```typescript
// For PANEL context extensions
{appExtensions
  ?.filter(ext => ext.context === 'PANEL')
  .map(ext => (
    <AppExtensionPanelTrigger 
      key={ext.id} 
      extension={ext} 
      entityId={categoryId} 
    />
  ))}
```

**Files to modify:**
- `app/Categories/[id]/page.tsx` (or equivalent detail page)
- `components/CategoryForm.tsx` (if extensions should appear in edit form)
- `components/CategoryActions.tsx` (if separate actions component)

---

### Step 5: Create/Update App Extension Hook

**Location:** `hooks/useAppExtensions.ts` (or `app/AppExtensions/hooks/useAppExtensions.ts`)

**Action:** Ensure hook supports CATEGORIES model

```typescript
// hooks/useAppExtensions.ts
import { useQuery } from '@tanstack/react-query';
import { gql } from '@apollo/client';

interface UseAppExtensionsParams {
  model: 'PRODUCTS' | 'CUSTOMERS' | 'ORDERS' | 'CATEGORIES'; // ADD CATEGORIES
  entityId?: string;
  context?: 'list' | 'detail' | 'edit';
}

export const useAppExtensions = ({ model, entityId, context }: UseAppExtensionsParams) => {
  return useQuery({
    queryKey: ['appExtensions', model, entityId, context],
    queryFn: async () => {
      const { data } = await client.query({
        query: gql`
          query GetAppExtensions($model: AppExtensionModel!) {
            store {
              appExtensions(filter: { model: $model }) {
                edges {
                  node {
                    id
                    context
                    model
                    url
                    label {
                      defaultValue
                      locales {
                        value
                        localeCode
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { model },
      });
      
      return data.store.appExtensions.edges.map(edge => edge.node);
    },
    enabled: !!model, // Only fetch if model is provided
  });
};
```

**Files to modify:**
- `hooks/useAppExtensions.ts` (or equivalent)
- Update TypeScript types to include 'CATEGORIES'

---

### Step 6: Create/Update App Extension Renderer Component

**Location:** `components/AppExtensions/AppExtensionRenderer.tsx` (or equivalent)

**Action:** Ensure renderer handles CATEGORIES model and URL templating

```typescript
// components/AppExtensions/AppExtensionRenderer.tsx
import { AppExtension } from '@/types/app-extension';

interface AppExtensionRendererProps {
  extensions: AppExtension[];
  entityId: string;
  model: 'PRODUCTS' | 'CUSTOMERS' | 'ORDERS' | 'CATEGORIES'; // ADD CATEGORIES
}

export const AppExtensionRenderer = ({ 
  extensions, 
  entityId, 
  model 
}: AppExtensionRendererProps) => {
  const templateUrl = (url: string, id: string) => {
    return url.replace('${id}', id);
  };

  const handleExtensionClick = (extension: AppExtension) => {
    const { context, url } = extension;
    const resolvedUrl = templateUrl(url, entityId);
    
    if (context === 'PANEL') {
      // Open side panel with app URL
      openAppExtensionPanel({
        url: resolvedUrl,
        extensionId: extension.id,
        entityId,
        model,
      });
    } else if (context === 'LINK') {
      // Navigate to app URL
      window.location.href = `${APP_ORIGIN}${resolvedUrl}?context=${encodeContext()}`;
    }
  };

  return (
    <>
      {extensions.map(extension => (
        <AppExtensionButton
          key={extension.id}
          extension={extension}
          onClick={() => handleExtensionClick(extension)}
        />
      ))}
    </>
  );
};
```

**Files to modify:**
- `components/AppExtensions/AppExtensionRenderer.tsx`
- `components/AppExtensions/AppExtensionPanel.tsx` (for PANEL context)
- `components/AppExtensions/AppExtensionLink.tsx` (for LINK context)

---

### Step 7: Panel Context Implementation (if not exists)

**Location:** `components/AppExtensions/AppExtensionPanel.tsx` (or equivalent)

**Action:** Ensure panel can handle category extensions

```typescript
// components/AppExtensions/AppExtensionPanel.tsx
interface AppExtensionPanelProps {
  extension: AppExtension;
  entityId: string;
  model: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AppExtensionPanel = ({
  extension,
  entityId,
  model,
  isOpen,
  onClose,
}: AppExtensionPanelProps) => {
  const resolvedUrl = extension.url.replace('${id}', entityId);
  const appOrigin = getAppOrigin(extension); // Get from extension metadata
  const context = encodeContext(); // Encode session context
  
  return (
    <SidePanel isOpen={isOpen} onClose={onClose}>
      <iframe
        src={`${appOrigin}${resolvedUrl}?context=${context}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title={extension.label.defaultValue}
      />
    </SidePanel>
  );
};
```

**Files to modify:**
- `components/AppExtensions/AppExtensionPanel.tsx`
- Panel management hook/context (if exists)

---

### Step 8: URL Context Encoding/Decoding

**Location:** Context encoding utilities (likely in `lib/context.ts` or `utils/context.ts`)

**Action:** Ensure context encoding works for category pages

The `context` parameter passed to apps should include:
- Store hash
- Access token (or session reference)
- Entity ID (category ID)
- Model type

```typescript
// utils/context.ts or lib/context.ts
export const encodeContext = (params: {
  storeHash: string;
  accessToken: string;
  entityId?: string;
  model?: string;
}): string => {
  // Encode context (similar to existing implementation)
  // This is used when opening extensions
  return btoa(JSON.stringify(params));
};

export const decodeContext = (context: string) => {
  // Decode context (used by apps)
  return JSON.parse(atob(context));
};
```

**Files to modify:**
- Context encoding/decoding utilities
- Ensure category pages can generate proper context

---

### Step 9: Type Definitions

**Location:** Type definition files (likely `types/app-extension.ts` or `app/AppExtensions/types.ts`)

**Action:** Add CATEGORIES to type definitions

```typescript
// types/app-extension.ts
export type AppExtensionModel = 
  | 'PRODUCTS'
  | 'CUSTOMERS'
  | 'ORDERS'
  | 'PRODUCT_DESCRIPTION'
  | 'CATEGORIES'; // ADD THIS

export interface AppExtension {
  id: string;
  context: AppExtensionContext | null;
  model: AppExtensionModel | null;
  url: string;
  label: AppExtensionLabel;
}
```

**Files to modify:**
- `types/app-extension.ts`
- Any other type definition files referencing AppExtensionModel

---

### Step 10: Testing

#### 10.1 Unit Tests

```typescript
// __tests__/AppExtensions/categories.test.ts
describe('CATEGORIES App Extensions', () => {
  it('should fetch extensions for category', async () => {
    const { result } = renderHook(() =>
      useAppExtensions({ model: 'CATEGORIES', entityId: '123' })
    );
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].model).toBe('CATEGORIES');
  });

  it('should template URL with category ID', () => {
    const url = '/categories/${id}';
    const categoryId = '123';
    const resolved = templateUrl(url, categoryId);
    expect(resolved).toBe('/categories/123');
  });
});
```

#### 10.2 Integration Tests

- Test extension appears on category detail page
- Test PANEL context opens side panel
- Test LINK context navigates correctly
- Test URL templating with category ID
- Test context parameter encoding/decoding

#### 10.3 E2E Tests

- Register a test extension with CATEGORIES model
- Navigate to category page
- Verify extension appears
- Click extension and verify behavior

**Files to create/modify:**
- `__tests__/AppExtensions/categories.test.ts`
- `__tests__/integration/category-extensions.test.ts`
- E2E test files

---

### Step 11: Documentation Updates

**Location:** Documentation files (README, API docs, etc.)

**Actions:**
1. Update App Extensions documentation to include CATEGORIES
2. Add examples for category extensions
3. Update developer guide with category-specific instructions

**Files to modify:**
- `docs/AppExtensions.md` (or equivalent)
- `README.md` (if it mentions supported models)
- API documentation

---

## Implementation Checklist

### Backend/GraphQL
- [ ] Add `CATEGORIES` to `AppExtensionModel` enum in GraphQL schema
- [ ] Update model registry to include CATEGORIES
- [ ] Add validation for CATEGORIES model
- [ ] Update query/filter logic to support CATEGORIES
- [ ] Add unit tests for CATEGORIES model

### Frontend/UI Components
- [ ] Update `useAppExtensions` hook to support CATEGORIES
- [ ] Add extension renderer to category list page (if needed)
- [ ] Add extension renderer to category detail/edit page
- [ ] Update `AppExtensionRenderer` component
- [ ] Ensure panel context works for categories
- [ ] Update URL templating logic
- [ ] Add integration tests

### Types & Configuration
- [ ] Update TypeScript types to include CATEGORIES
- [ ] Update type definitions in all relevant files
- [ ] Regenerate GraphQL types (if using code generation)

### Testing
- [ ] Write unit tests for CATEGORIES extensions
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Test PANEL context
- [ ] Test LINK context
- [ ] Test URL templating

### Documentation
- [ ] Update App Extensions documentation
- [ ] Add CATEGORIES examples
- [ ] Update developer guide

---

## Example: Complete Category Detail Page Integration

```typescript
// app/Categories/[id]/page.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';
import { CategoryDetails } from '@/components/CategoryDetails';

export default function CategoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params.id as string;
  const context = searchParams?.get('context');

  // Fetch App Extensions for this category
  const { data: appExtensions, isLoading: isLoadingExtensions } = useAppExtensions({
    model: 'CATEGORIES',
    entityId: categoryId,
  });

  // Fetch category data
  const { data: category, isLoading: isLoadingCategory } = useCategory(categoryId);

  if (isLoadingCategory) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <CategoryHeader category={category} />
      
      <CategoryDetails category={category} />
      
      {/* App Extensions */}
      {!isLoadingExtensions && appExtensions && appExtensions.length > 0 && (
        <div className="app-extensions-section">
          <h3>Extensions</h3>
          <AppExtensionRenderer
            extensions={appExtensions}
            entityId={categoryId}
            model="CATEGORIES"
          />
        </div>
      )}
    </div>
  );
}
```

---

## Comparison: PRODUCTS vs CATEGORIES Implementation

| Aspect | PRODUCTS | CATEGORIES |
|--------|----------|------------|
| **GraphQL Model** | `PRODUCTS` | `CATEGORIES` (to be added) |
| **URL Pattern** | `/products/${id}` | `/categories/${id}` |
| **Entity Type** | `product` | `category` |
| **ID Field** | `id` | `id` |
| **List Page** | `/products` | `/categories` |
| **Detail Page** | `/products/:id` | `/categories/:id` |
| **Edit Page** | `/products/:id/edit` | `/categories/:id/edit` |
| **Extension Hook** | `useAppExtensions({ model: 'PRODUCTS', ... })` | `useAppExtensions({ model: 'CATEGORIES', ... })` |

---

## Key Differences from PRODUCTS

1. **Entity Type**: Categories vs Products (different data structure)
2. **URL Routes**: `/categories/${id}` vs `/products/${id}`
3. **Page Components**: Category-specific components vs Product-specific
4. **Context Data**: Category context vs Product context

Everything else should follow the same pattern as PRODUCTS.

---

## Notes

1. **Backward Compatibility**: Ensure existing PRODUCTS, CUSTOMERS, and ORDERS extensions continue to work
2. **Performance**: Consider caching extension queries
3. **Error Handling**: Handle cases where extensions fail to load
4. **Accessibility**: Ensure extension UI is accessible
5. **Internationalization**: Support locale-specific extension labels

---

## References

- GraphQL Schema: `lib/graphql-client/schema.graphql` (AppExtensionModel enum)
- PRODUCTS Implementation: `app/products/[pid]/page.tsx`
- Extension Types: `lib/graphql-client/src/types/app-extension.ts`
- Extension Client: `lib/graphql-client/src/client.ts`

