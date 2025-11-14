# [Draft] Update shared App Extensions components to support CATEGORIES

## Related Jira
- Story: [CATALOG-11279](https://bigcommercecloud.atlassian.net/browse/CATALOG-11279)
- Task: [CATALOG-XXXXX](https://bigcommercecloud.atlassian.net/browse/CATALOG-XXXXX) (Shared Components Update - to be created)
- Depends on: Task for GraphQL Schema (CATALOG-XXXXX)

## Description

This PR updates the shared App Extensions hooks and components to support the `CATEGORIES` model, ensuring extensions can be fetched and rendered correctly for category pages.

## Changes

### 1. Update useAppExtensions Hook

**File:** `hooks/useAppExtensions.ts` or `app/AppExtensions/hooks/useAppExtensions.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { gql, useQuery as useApolloQuery } from '@apollo/client';

interface UseAppExtensionsParams {
  model: 'PRODUCTS' | 'CUSTOMERS' | 'ORDERS' | 'PRODUCT_DESCRIPTION' | 'CATEGORIES'; // ADD CATEGORIES
  entityId?: string;
  context?: 'list' | 'detail' | 'edit';
}

const GET_APP_EXTENSIONS = gql`
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
`;

export const useAppExtensions = ({ 
  model, 
  entityId, 
  context 
}: UseAppExtensionsParams) => {
  const { data, loading, error } = useApolloQuery(GET_APP_EXTENSIONS, {
    variables: { model },
    skip: !model,
  });

  const extensions = data?.store?.appExtensions?.edges?.map(edge => edge.node) || [];

  return {
    data: extensions,
    isLoading: loading,
    error,
  };
};
```

### 2. Update AppExtensionRenderer Component

**File:** `components/AppExtensions/AppExtensionRenderer.tsx`

```typescript
import { AppExtension, AppExtensionModel } from '@/types/app-extension';
import { AppExtensionPanel } from './AppExtensionPanel';
import { AppExtensionLink } from './AppExtensionLink';

interface AppExtensionRendererProps {
  extensions: AppExtension[];
  entityId?: string;
  model: AppExtensionModel;
  context?: 'list' | 'detail' | 'edit';
}

export const AppExtensionRenderer = ({ 
  extensions, 
  entityId, 
  model,
  context 
}: AppExtensionRendererProps) => {
  const templateUrl = (url: string, id: string) => {
    return url.replace('${id}', id);
  };

  const encodeContext = () => {
    // Encode context with store hash, token, entity ID, and model
    // Implementation depends on your auth system
    return btoa(JSON.stringify({
      storeHash: getStoreHash(),
      accessToken: getAccessToken(),
      entityId,
      model,
    }));
  };

  return (
    <>
      {extensions.map(extension => {
        const resolvedUrl = entityId 
          ? templateUrl(extension.url, entityId)
          : extension.url;
        
        if (extension.context === 'PANEL') {
          return (
            <AppExtensionPanel
              key={extension.id}
              extension={extension}
              entityId={entityId}
              model={model}
              resolvedUrl={resolvedUrl}
            />
          );
        } else if (extension.context === 'LINK') {
          return (
            <AppExtensionLink
              key={extension.id}
              extension={extension}
              entityId={entityId}
              model={model}
              resolvedUrl={resolvedUrl}
            />
          );
        }
        
        return null;
      })}
    </>
  );
};
```

### 3. Update AppExtensionPanel Component

**File:** `components/AppExtensions/AppExtensionPanel.tsx`

```typescript
import { useState } from 'react';
import { AppExtension, AppExtensionModel } from '@/types/app-extension';
import { SidePanel } from '@/components/SidePanel';

interface AppExtensionPanelProps {
  extension: AppExtension;
  entityId?: string;
  model: AppExtensionModel;
  resolvedUrl: string;
}

export const AppExtensionPanel = ({
  extension,
  entityId,
  model,
  resolvedUrl,
}: AppExtensionPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const encodeContext = () => {
    // Encode context parameter
    return btoa(JSON.stringify({
      storeHash: getStoreHash(),
      accessToken: getAccessToken(),
      entityId,
      model,
    }));
  };

  const appOrigin = getAppOrigin(extension); // Get from extension metadata or config
  const context = encodeContext();
  const iframeUrl = `${appOrigin}${resolvedUrl}?context=${context}`;

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        {extension.label.defaultValue}
      </Button>
      
      <SidePanel isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <iframe
          src={iframeUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={extension.label.defaultValue}
          allow="clipboard-read; clipboard-write"
        />
      </SidePanel>
    </>
  );
};
```

### 4. Update AppExtensionLink Component

**File:** `components/AppExtensions/AppExtensionLink.tsx`

```typescript
import { AppExtension, AppExtensionModel } from '@/types/app-extension';

interface AppExtensionLinkProps {
  extension: AppExtension;
  entityId?: string;
  model: AppExtensionModel;
  resolvedUrl: string;
}

export const AppExtensionLink = ({
  extension,
  entityId,
  model,
  resolvedUrl,
}: AppExtensionLinkProps) => {
  const encodeContext = () => {
    return btoa(JSON.stringify({
      storeHash: getStoreHash(),
      accessToken: getAccessToken(),
      entityId,
      model,
    }));
  };

  const appOrigin = getAppOrigin(extension);
  const context = encodeContext();
  const fullUrl = `${appOrigin}${resolvedUrl}?context=${context}`;

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="app-extension-link"
    >
      {extension.label.defaultValue}
    </a>
  );
};
```

### 5. Update AppExtensionMenuItem Component (if exists)

**File:** `components/AppExtensions/AppExtensionMenuItem.tsx`

```typescript
import { AppExtension, AppExtensionModel } from '@/types/app-extension';
import { DropdownItem } from '@/components/Dropdown';

interface AppExtensionMenuItemProps {
  extension: AppExtension;
  entityId?: string;
  model: AppExtensionModel;
}

export const AppExtensionMenuItem = ({
  extension,
  entityId,
  model,
}: AppExtensionMenuItemProps) => {
  const handleClick = () => {
    const resolvedUrl = entityId 
      ? extension.url.replace('${id}', entityId)
      : extension.url;
    
    if (extension.context === 'PANEL') {
      // Open panel (implementation depends on your panel system)
      openAppExtensionPanel({ extension, entityId, model, resolvedUrl });
    } else if (extension.context === 'LINK') {
      // Navigate to app
      const context = encodeContext({ entityId, model });
      window.location.href = `${getAppOrigin(extension)}${resolvedUrl}?context=${context}`;
    }
  };

  return (
    <DropdownItem onClick={handleClick}>
      {extension.label.defaultValue}
    </DropdownItem>
  );
};
```

### 6. Update Type Definitions

**File:** `types/app-extension.ts`

```typescript
export type AppExtensionModel = 
  | 'PRODUCTS'
  | 'CUSTOMERS'
  | 'ORDERS'
  | 'PRODUCT_DESCRIPTION'
  | 'CATEGORIES'; // ADD THIS

export type AppExtensionContext = 'PANEL' | 'LINK';

export interface AppExtensionLabel {
  defaultValue: string;
  locales?: {
    value: string;
    localeCode: string;
  }[];
}

export interface AppExtension {
  id: string;
  context: AppExtensionContext | null;
  model: AppExtensionModel | null;
  url: string;
  label: AppExtensionLabel;
}
```

## Implementation Details

- Updated hook to support CATEGORIES model
- Updated renderer to handle CATEGORIES extensions
- Updated panel and link components to work with categories
- URL templating supports category IDs
- Context encoding includes CATEGORIES model type

## Testing

- [ ] Hook fetches CATEGORIES extensions correctly
- [ ] Renderer displays CATEGORIES extensions
- [ ] Panel opens with correct URL and context
- [ ] Link navigates with correct URL and context
- [ ] URL templating works with category IDs
- [ ] Context parameter encoding/decoding works
- [ ] Backward compatibility with existing models

## Related PRs

- Depends on: PR #1 (GraphQL Schema), PR #2 (Service)
- Required for: PR #3 (Category List), PR #4 (Category Detail)

## Checklist

- [ ] useAppExtensions hook updated
- [ ] AppExtensionRenderer updated
- [ ] AppExtensionPanel updated
- [ ] AppExtensionLink updated
- [ ] Type definitions updated
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Documentation updated (if applicable)

