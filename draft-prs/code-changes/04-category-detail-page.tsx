// File: app/Categories/[id]/page.tsx
// Changes for PR #4 - Category Detail/Edit Page Integration

'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useAppExtensions } from '@/hooks/useAppExtensions';
import { AppExtensionRenderer } from '@/components/AppExtensions/AppExtensionRenderer';
import { CategoryDetails } from '@/components/CategoryDetails';
import { CategoryForm } from '@/components/CategoryForm';
import { LoadingScreen } from '@/components/LoadingScreen';

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
      <PageHeader 
        title={isEditMode ? 'Edit Category' : 'Category Details'}
        category={category}
      />
      
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
      <div className="category-content">
        {isEditMode ? (
          <CategoryForm category={category} />
        ) : (
          <CategoryDetails category={category} />
        )}
      </div>
    </div>
  );
}

