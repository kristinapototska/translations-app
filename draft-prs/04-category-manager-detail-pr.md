# [Draft] Add App Extensions support to Category Detail/Edit page

## Related Jira
- Story: [CATALOG-11279](https://bigcommercecloud.atlassian.net/browse/CATALOG-11279)
- Task: [CATALOG-XXXXX](https://bigcommercecloud.atlassian.net/browse/CATALOG-XXXXX) (Category Detail/Edit Page Integration - to be created)
- Depends on:
  - Task for GraphQL Schema (CATALOG-XXXXX)
  - Task for Backend Service (CATALOG-XXXXX)
  - Task for Shared Components (CATALOG-XXXXX)

## Description

This PR adds App Extensions support to the category detail and edit pages, allowing extensions registered with the `CATEGORIES` model to appear when viewing or editing a specific category.

## Changes

### 1. Category Detail Page Update

**File:** `app/Categories/[id]/page.tsx` or `pages/Categories/[id].tsx` (or equivalent)

```typescript
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';
import { CategoryDetails } from '@/components/CategoryDetails';
import { CategoryForm } from '@/components/CategoryForm';

export default function CategoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params.id as string;
  const isEditMode = searchParams?.get('mode') === 'edit';

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
    <div className="category-detail-page">
      <CategoryHeader category={category} />
      
      {/* App Extensions - Toolbar/Actions */}
      {!isLoadingExtensions && appExtensions && appExtensions.length > 0 && (
        <div className="category-extensions-toolbar">
          <AppExtensionRenderer
            extensions={appExtensions}
            entityId={categoryId}
            model="CATEGORIES"
          />
        </div>
      )}

      {/* Category content */}
      {isEditMode ? (
        <CategoryForm category={category} />
      ) : (
        <CategoryDetails category={category} />
      )}
    </div>
  );
}
```

### 2. Category Form Integration (Alternative placement)

**File:** `components/CategoryForm.tsx`

```typescript
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';

interface CategoryFormProps {
  category: Category;
}

export function CategoryForm({ category }: CategoryFormProps) {
  const { data: appExtensions } = useAppExtensions({
    model: 'CATEGORIES',
    entityId: category.id.toString(),
  });

  return (
    <Form>
      {/* Form fields */}
      <FormField name="name" />
      <FormField name="description" />
      
      {/* App Extensions - In form actions */}
      {appExtensions && appExtensions.length > 0 && (
        <FormSection title="Extensions">
          <AppExtensionRenderer
            extensions={appExtensions}
            entityId={category.id.toString()}
            model="CATEGORIES"
          />
        </FormSection>
      )}
      
      <FormActions>
        <Button type="submit">Save</Button>
        <Button type="button">Cancel</Button>
      </FormActions>
    </Form>
  );
}
```

### 3. Category Action Menu Integration

**File:** `components/CategoryDetailActions.tsx` or similar

```typescript
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionMenuItem } from '@/components/AppExtensions/AppExtensionMenuItem';

interface CategoryDetailActionsProps {
  categoryId: string;
}

export function CategoryDetailActions({ categoryId }: CategoryDetailActionsProps) {
  const { data: appExtensions } = useAppExtensions({
    model: 'CATEGORIES',
    entityId: categoryId,
  });

  return (
    <Toolbar>
      <Button>Save</Button>
      <Button>Cancel</Button>
      
      <Dropdown>
        <DropdownItem>Duplicate</DropdownItem>
        <DropdownItem>Delete</DropdownItem>
        <DropdownDivider />
        
        {/* App Extensions */}
        {appExtensions?.map(extension => (
          <AppExtensionMenuItem
            key={extension.id}
            extension={extension}
            entityId={categoryId}
          />
        ))}
      </Dropdown>
    </Toolbar>
  );
}
```

## Implementation Details

- Extensions appear on category detail and edit pages
- Supports both PANEL and LINK contexts automatically
- URL templating replaces `${id}` with category ID
- Context parameter is passed to app for authentication

## Placement Options

Choose one or more placement options:

1. **Page Toolbar** - Extensions appear in the main page toolbar
2. **Action Menu** - Extensions appear in the action dropdown menu
3. **Form Section** - Extensions appear in a dedicated form section (for edit page)
4. **Side Panel Trigger** - PANEL context extensions show as side panel buttons

## Context Parameter Handling

The `context` parameter passed to apps should include:
- Store hash
- Access token (or session reference)
- Category ID
- Model type ('CATEGORIES')

```typescript
// Example context encoding
const context = encodeContext({
  storeHash: 'abc123',
  accessToken: 'token...',
  entityId: categoryId,
  model: 'CATEGORIES',
});

// URL passed to app
const appUrl = `${extension.url.replace('${id}', categoryId)}?context=${context}`;
```

## Testing

- [ ] Extensions appear on category detail page
- [ ] Extensions appear on category edit page
- [ ] PANEL context opens side panel with correct URL
- [ ] LINK context navigates to app with correct URL
- [ ] URL templating works correctly
- [ ] Context parameter is properly encoded
- [ ] Extensions work when category is being created (new category)
- [ ] Extensions work when category is being edited (existing category)

## Related PRs

- Depends on: PR #1 (GraphQL Schema), PR #2 (Service), PR #5 (Shared Components)
- Works with: PR #3 (Category List Page)

## Checklist

- [ ] Category detail page updated
- [ ] Category edit page updated (if separate)
- [ ] Extensions render correctly
- [ ] Both PANEL and LINK contexts work
- [ ] URL templating tested
- [ ] Context parameter encoding tested
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Visual regression tests (if applicable)

