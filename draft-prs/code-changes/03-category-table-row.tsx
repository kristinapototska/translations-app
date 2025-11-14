// File: components/CategoryTableRow.tsx
// Changes for PR #3 - Per-row extensions in category table

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
        <div className="category-row-actions">
          <Button size="small">Edit</Button>
          <Button size="small" variant="destructive">Delete</Button>
          
          {/* App Extensions for this category */}
          {appExtensions && appExtensions.length > 0 && (
            <AppExtensionRenderer
              extensions={appExtensions}
              entityId={category.id.toString()}
              model="CATEGORIES"
            />
          )}
        </div>
      </td>
    </tr>
  );
}

