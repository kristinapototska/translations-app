// File: app/Categories/index.tsx or components/CategoryList.tsx
// Changes for PR #3 - Category List Page Integration

import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';
import { CategoryTable } from '@/components/CategoryTable';

export default function CategoryListPage() {
  // Fetch App Extensions for category list context
  const { data: appExtensions, isLoading: isLoadingExtensions } = useAppExtensions({
    model: 'CATEGORIES',
    context: 'list',
  });

  // ... existing category list code (fetch categories, etc.)

  return (
    <div className="category-list-page">
      <PageHeader title="Categories" />
      
      {/* App Extensions - List level toolbar */}
      {!isLoadingExtensions && appExtensions && appExtensions.length > 0 && (
        <div className="category-list-extensions-toolbar">
          <AppExtensionRenderer
            extensions={appExtensions}
            model="CATEGORIES"
            context="list"
          />
        </div>
      )}

      <CategoryTable categories={categories} />
    </div>
  );
}

