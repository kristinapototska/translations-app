# [Draft] Add App Extensions support to Category List/Table component

## Related Jira
- Story: [CATALOG-11279](https://bigcommercecloud.atlassian.net/browse/CATALOG-11279)
- Task: [CATALOG-XXXXX](https://bigcommercecloud.atlassian.net/browse/CATALOG-XXXXX) (Category List Page Integration - to be created)
- Depends on: 
  - Task for GraphQL Schema (CATALOG-XXXXX)
  - Task for Backend Service (CATALOG-XXXXX)
  - Task for Shared Components (CATALOG-XXXXX)

## Description

This PR adds App Extensions support to the category list/table component, allowing extensions registered with the `CATEGORIES` model to appear in the category list view.

## Changes

### 1. Category List Component Update

**File:** `app/Categories/index.tsx` or `components/CategoryList.tsx` (or equivalent)

```typescript
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';

export default function CategoryListPage() {
  // Fetch App Extensions for category list context
  // Note: List-level extensions may be less common, but we support them
  const { data: appExtensions, isLoading } = useAppExtensions({
    model: 'CATEGORIES',
    context: 'list', // if list context is supported
  });

  // ... existing category list code

  return (
    <div>
      <CategoryTable categories={categories} />
      
      {/* App Extensions - List level actions */}
      {!isLoading && appExtensions && appExtensions.length > 0 && (
        <div className="category-list-extensions">
          <AppExtensionRenderer
            extensions={appExtensions}
            model="CATEGORIES"
            context="list"
          />
        </div>
      )}
    </div>
  );
}
```

### 2. Category Table Row Extensions (Optional - if per-row extensions are desired)

**File:** `components/CategoryTable.tsx` or `components/CategoryTableRow.tsx`

```typescript
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';

interface CategoryTableRowProps {
  category: Category;
}

export function CategoryTableRow({ category }: CategoryTableRowProps) {
  // Fetch extensions for this specific category
  const { data: appExtensions } = useAppExtensions({
    model: 'CATEGORIES',
    entityId: category.id.toString(),
  });

  return (
    <tr>
      <td>{category.name}</td>
      <td>{category.description}</td>
      <td>
        {/* Action buttons */}
        <Button>Edit</Button>
        <Button>Delete</Button>
        
        {/* App Extensions for this category */}
        {appExtensions && appExtensions.length > 0 && (
          <AppExtensionRenderer
            extensions={appExtensions}
            entityId={category.id.toString()}
            model="CATEGORIES"
          />
        )}
      </td>
    </tr>
  );
}
```

### 3. Category Actions Menu Integration (Alternative approach)

**File:** `components/CategoryActions.tsx` or similar

```typescript
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionMenuItem } from '@/components/AppExtensions/AppExtensionMenuItem';

interface CategoryActionsProps {
  categoryId: string;
}

export function CategoryActions({ categoryId }: CategoryActionsProps) {
  const { data: appExtensions } = useAppExtensions({
    model: 'CATEGORIES',
    entityId: categoryId,
  });

  return (
    <Dropdown>
      <DropdownItem>Edit</DropdownItem>
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
  );
}
```

## Implementation Details

- Extensions appear in category list view
- Supports both list-level and per-row extensions
- Automatically handles PANEL and LINK contexts
- URL templating replaces `${id}` with category ID

## Placement Options

Choose one or more of these placement options:

1. **List-level toolbar** - Extensions appear in the main toolbar above the table
2. **Per-row actions** - Extensions appear in each category row's action menu
3. **Bulk actions** - Extensions appear in bulk action menu (if applicable)

## Testing

- [ ] Extensions appear on category list page
- [ ] List-level extensions render correctly
- [ ] Per-row extensions render correctly (if implemented)
- [ ] PANEL context opens side panel
- [ ] LINK context navigates correctly
- [ ] URL templating works with category IDs
- [ ] Extensions work with filtered/searched categories

## Related PRs

- Depends on: PR #1 (GraphQL Schema), PR #2 (Service), PR #5 (Shared Components)
- Works with: PR #4 (Category Detail Page)

## Checklist

- [ ] Category list component updated
- [ ] Extensions render correctly
- [ ] Both PANEL and LINK contexts work
- [ ] URL templating tested
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Visual regression tests (if applicable)

