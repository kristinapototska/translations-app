// File: components/AppExtensions/AppExtensionRenderer.tsx
// Changes for PR #5 - Update renderer to support CATEGORIES

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

