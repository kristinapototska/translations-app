// File: hooks/useAppExtensions.ts
// Changes for PR #5 - Update hook to support CATEGORIES

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

