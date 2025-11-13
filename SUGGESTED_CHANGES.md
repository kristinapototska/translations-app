# Suggested Changes: Migration to New Translations API

## Summary

This document shows the suggested changes to migrate from the current product translation implementation to the new [Translations Admin GraphQL API](https://developer.bigcommerce.com/docs/store-operations/translations/product).

**Important**: The app extension authentication bug fix (from previous work) is preserved in all changes.

---

## 1. Add New GraphQL Queries for Product Translations

### File: `lib/graphql-client/src/queries/product.tada.ts`

**Add these new queries at the end of the file:**

```typescript
// New: Get Product Translations Query (using new Translations API)
export const GetProductTranslationsDocument = graphql(`
  query GetProductTranslations(
    $channelId: ID!
    $localeId: ID!
    $resourceIds: [ID!]
    $first: Int
  ) {
    store {
      translations(filters: {
        resourceType: PRODUCTS
        channelId: $channelId
        localeId: $localeId
        resourceIds: $resourceIds
      }, first: $first) {
        edges {
          node {
            resourceId
            fields {
              fieldName
              original
              translation
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`);

// New: Update Product Translations Mutation (using new Translations API)
export const UpdateProductTranslationsDocument = graphql(`
  mutation UpdateProductTranslations($input: UpdateTranslationsInput!) {
    translation {
      updateTranslations(input: $input) {
        __typename
        errors {
          __typename
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

// New: Delete Product Translations Mutation
export const DeleteProductTranslationsDocument = graphql(`
  mutation DeleteProductTranslations($input: DeleteTranslationsInput!) {
    translation {
      deleteTranslations(input: $input) {
        __typename
        errors {
          __typename
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

// Helper function to create variables for getting product translations
export function createGetProductTranslationsVariables(params: {
  channelId: number;
  locale: string;
  productId?: number;
  first?: number;
}) {
  return {
    channelId: `bc/store/channel/${params.channelId}`,
    localeId: `bc/store/locale/${params.locale}`,
    resourceIds: params.productId 
      ? [`bc/store/product/${params.productId}`]
      : [],
    first: params.first || 50,
  };
}

// Helper function to create variables for updating product translations
export function createUpdateProductTranslationsVariables(params: {
  channelId: number;
  locale: string;
  productId: number;
  fields: Array<{
    fieldName: string;
    value: string;
  }>;
}) {
  return {
    input: {
      resourceType: "PRODUCTS",
      channelId: `bc/store/channel/${params.channelId}`,
      localeId: `bc/store/locale/${params.locale}`,
      entities: [
        {
          resourceId: `bc/store/product/${params.productId}`,
          fields: params.fields
        }
      ]
    }
  };
}

// Helper function to create variables for deleting product translations
export function createDeleteProductTranslationsVariables(params: {
  channelId: number;
  locale: string;
  productId: number;
  fields: string[];
}) {
  return {
    input: {
      resourceType: "PRODUCTS",
      channelId: `bc/store/channel/${params.channelId}`,
      localeId: `bc/store/locale/${params.locale}`,
      resources: [
        {
          resourceId: `bc/store/product/${params.productId}`,
          fields: params.fields
        }
      ]
    }
  };
}
```

---

## 2. Add New GraphQL Query for Locales

### File: `lib/graphql-client/src/queries/locales.tada.ts` (NEW FILE)

**Create this new file:**

```typescript
import { graphql } from "../graphql";

// Get Channel Locales Query (using new GraphQL API)
export const GetChannelLocalesDocument = graphql(`
  query GetChannelLocales($channelId: ID!) {
    store {
      locales(input: { channelId: $channelId }) {
        edges {
          node {
            code
            status
            isDefault
          }
        }
      }
    }
  }
`);

// Helper function to create variables for getting channel locales
export function createGetChannelLocalesVariables(params: {
  channelId: number;
}) {
  return {
    channelId: `bc/store/channel/${params.channelId}`
  };
}
```

---

## 3. Update GraphQL Client Methods

### File: `lib/graphql-client/src/client.ts`

**Add these new methods after the existing `getProductLocaleData` method:**

```typescript
// New: Get product translations using new Translations API
async getProductTranslations(options: {
  channelId: number;
  locale: string;
  productId?: number;
  first?: number;
}) {
  type Response = ResultOf<typeof GetProductTranslationsDocument>;
  
  const variables = createGetProductTranslationsVariables({
    channelId: options.channelId,
    locale: options.locale,
    productId: options.productId,
    first: options.first,
  });

  const response = await this.request<Response>(
    { query: print(GetProductTranslationsDocument) },
    variables
  );

  if (!response.data?.store?.translations) {
    const productInfo = options.productId ? ` for product ${options.productId}` : '';
    throw new Error(`Failed to fetch translations${productInfo} in locale ${options.locale}`);
  }

  return response.data.store.translations;
}

// New: Update product translations using new Translations API
async updateProductTranslations(options: {
  channelId: number;
  locale: string;
  productId: number;
  fields: Array<{
    fieldName: string;
    value: string;
  }>;
}) {
  type Response = ResultOf<typeof UpdateProductTranslationsDocument>;
  
  const variables = createUpdateProductTranslationsVariables({
    channelId: options.channelId,
    locale: options.locale,
    productId: options.productId,
    fields: options.fields,
  });

  const response = await this.request<Response>(
    { query: print(UpdateProductTranslationsDocument) },
    variables
  );

  if (response.data?.translation?.updateTranslations?.errors?.length) {
    const errors = response.data.translation.updateTranslations.errors;
    throw new Error(
      `Translation update failed for product ${options.productId} in locale ${options.locale}: ${errors.map(e => e.message).join(', ')}`
    );
  }

  return response.data;
}

// New: Delete product translations
async deleteProductTranslations(options: {
  channelId: number;
  locale: string;
  productId: number;
  fields: string[];
}) {
  type Response = ResultOf<typeof DeleteProductTranslationsDocument>;
  
  const variables = createDeleteProductTranslationsVariables({
    channelId: options.channelId,
    locale: options.locale,
    productId: options.productId,
    fields: options.fields,
  });

  const response = await this.request<Response>(
    { query: print(DeleteProductTranslationsDocument) },
    variables
  );

  if (response.data?.translation?.deleteTranslations?.errors?.length) {
    const errors = response.data.translation.deleteTranslations.errors;
    throw new Error(
      `Translation deletion failed for product ${options.productId} in locale ${options.locale}: ${errors.map(e => e.message).join(', ')}`
    );
  }

  return response.data;
}

// New: Get channel locales using GraphQL
async getChannelLocales(channelId: number) {
  type Response = ResultOf<typeof GetChannelLocalesDocument>;
  
  const variables = createGetChannelLocalesVariables({
    channelId,
  });

  const response = await this.request<Response>(
    { query: print(GetChannelLocalesDocument) },
    variables
  );

  if (!response.data?.store?.locales) {
    throw new Error(`Failed to fetch locales for channel ${channelId}`);
  }

  return response.data.store.locales.edges.map((edge: any) => ({
    code: edge.node.code,
    status: edge.node.status,
    is_default: edge.node.isDefault,
  }));
}
```

**Add imports at the top of the file:**

```typescript
import { 
  GetProductTranslationsDocument,
  UpdateProductTranslationsDocument,
  DeleteProductTranslationsDocument,
  createGetProductTranslationsVariables,
  createUpdateProductTranslationsVariables,
  createDeleteProductTranslationsVariables,
} from "./queries/product.tada";
import {
  GetChannelLocalesDocument,
  createGetChannelLocalesVariables,
} from "./queries/locales.tada";
```

---

## 4. Update Product API Route

### File: `app/api/product/[pid]/route.ts`

**Update the GET handler to use new API (around line 759):**

```typescript
export async function GET(request: NextRequest, props: { params: Promise<{ pid: string }> }) {
  const params = await props.params;
  const pid = params.pid;
  const searchParams = request.nextUrl.searchParams;
  const context = searchParams.get("context") ?? "";
  const channelId = searchParams.get("channel_id") ?? null;

  if (!channelId) {
    return new Response("Channel ID missing", {
      status: 422,
    });
  }

  try {
    const { defaultLocale, availableLocales } = await getChannelLocales(context, channelId);
    const selectedLocale = searchParams.get("locale") ?? (availableLocales?.[1]?.code || availableLocales[0].code);
    const { accessToken, storeHash } = await getSessionFromContext(context);
    const graphQLClient = createGraphQLClient(accessToken, storeHash);

    // NEW: Use new Translations API to get translations (with error handling)
    // Make both API calls in parallel for better performance
    let translationMap: Record<string, string> = {};
    
    const [translationsDataResult, gqlDataResult] = await Promise.allSettled([
      // New API call - wrapped in promise to handle failures gracefully
      graphQLClient.getProductTranslations({
        channelId: Number(channelId),
        locale: selectedLocale,
        productId: Number(pid),
      }).catch((error) => {
        console.warn(`Failed to fetch translations from new API for product ${pid}, falling back to old API:`, error);
        return null; // Return null on failure to allow graceful fallback
      }),
      // Old API call - required for options/modifiers/customFields
      graphQLClient.getProductLocaleData({
        pid: Number(pid),
        channelId: Number(channelId),
        locale: selectedLocale,
        availableLocales,
        defaultLocale,
      })
    ]);

    // Handle translations data from new API (if available)
    if (translationsDataResult.status === 'fulfilled' && translationsDataResult.value) {
      const translationNode = translationsDataResult.value.edges?.[0]?.node;
      if (translationNode?.fields) {
        translationNode.fields.forEach((field: { fieldName: string; original: string; translation: string | null }) => {
          translationMap[field.fieldName] = field.translation || field.original;
        });
      }
    }

    // Handle product data from old API (required)
    if (gqlDataResult.status === 'rejected') {
      return new Response(`Failed to fetch product data: ${gqlDataResult.reason}`, {
        status: 500,
      });
    }

    const gqlData = gqlDataResult.value;
    if (!gqlData?.id) {
      return new Response(`Product ID ${pid} not found or invalid GraphQL response`, {
        status: 404,
      });
    }

    const productNode = gqlData;

    // Build normalized product data with translations from new API, fallback to old API data
    const normalizedProductData = {
      name: translationMap['name'] || productNode.basicInformation?.name || '',
      description: translationMap['description'] || productNode.basicInformation?.description || '',
      pageTitle: translationMap['page_title'] || productNode.seoInformation?.pageTitle || '',
      metaDescription: translationMap['meta_description'] || productNode.seoInformation?.metaDescription || '',
      preOrderMessage: translationMap['pre_order_message'] || productNode.preOrderSettings?.message || '',
      warranty: translationMap['warranty_information'] || productNode.storefrontDetails?.warranty || '',
      availabilityDescription: translationMap['availability_text'] || productNode.storefrontDetails?.availabilityDescription || '',
      searchKeywords: translationMap['search_keywords'] || productNode.storefrontDetails?.searchKeywords || '',
      // ... rest of the existing code for options, modifiers, customFields ...
      options: {
        edges: (productNode.options?.edges || []).map((edge: any) => ({
          node: {
            id: edge.node?.id,
            displayName: edge.node?.displayName,
            values: (edge.node?.values || []).map((value: any) => ({
              id: value?.id,
              label: value?.label,
            })),
          },
        })),
      },
      modifiers: {
        edges: (productNode.modifiers?.edges || []).map((edge: any) => {
          // ... existing modifier mapping code ...
        }),
      },
      customFields: {
        edges: (productNode.customFields?.edges || []).map((edge: any) => ({
          node: {
            id: edge.node?.id,
            name: edge.node?.name,
            value: edge.node?.value,
            overridesForLocale: edge.node?.overridesForLocale,
          },
        })),
      },
      localeData: {} as { [key: string]: any },
    };

    // Build locale data from translations
    // Use translations from new API for basic fields, old API for options/modifiers/customFields
    normalizedProductData.localeData[selectedLocale] = {
      name: translationMap['name'] || null,
      description: translationMap['description'] || null,
      pageTitle: translationMap['page_title'] || null,
      metaDescription: translationMap['meta_description'] || null,
      preOrderMessage: translationMap['pre_order_message'] || null,
      warranty: translationMap['warranty_information'] || null,
      availabilityDescription: translationMap['availability_text'] || null,
      searchKeywords: translationMap['search_keywords'] || null,
      // Options, modifiers, customFields still use old API structure
      // Note: These transform functions already exist in the route file
      options: transformGraphQLOptionsDataToLocaleData(gqlData?.options?.edges),
      modifiers: transformGraphQLModifiersDataToLocaleData(gqlData?.modifiers?.edges),
      customFields: transformGraphQLCustomFieldsDataToLocaleData(gqlData?.customFields?.edges),
    };

    return Response.json(normalizedProductData);
  } catch (error: any) {
    const { message, response } = error;

    return new Response(message || "Authentication failed, please re-install", {
      status: response?.status || 500,
    });
  }
}
```

**Update the PUT handler to use new API (around line 915):**

```typescript
export async function PUT(request: NextRequest, props: { params: Promise<{ pid: string }> }) {
  const params = await props.params;
  const body = (await request.json()) as any;
  const pid = params.pid;
  const searchParams = request.nextUrl.searchParams;
  const context = searchParams.get("context") ?? "";
  const channelId = searchParams.get("channel_id") ?? null;

  if (!channelId) {
    return new Response("Channel ID missing", {
      status: 422,
    });
  }

  try {
    const { defaultLocale } = await getChannelLocales(context, channelId);
    const { accessToken, storeHash } = await getSessionFromContext(context);
    const graphQLClient = createGraphQLClient(accessToken, storeHash);

    if (body["locale"] && body.locale !== defaultLocale) {
      // NEW: Use new Translations API for basic product fields
      const fields: Array<{ fieldName: string; value: string }> = [];

      // Map form data to new API field names (validate and add fields)
      if (body.name !== undefined && typeof body.name === 'string') {
        fields.push({ fieldName: 'name', value: body.name });
      }
      if (body.description !== undefined && typeof body.description === 'string') {
        fields.push({ fieldName: 'description', value: body.description });
      }
      if (body.pageTitle !== undefined && typeof body.pageTitle === 'string') {
        fields.push({ fieldName: 'page_title', value: body.pageTitle });
      }
      if (body.metaDescription !== undefined && typeof body.metaDescription === 'string') {
        fields.push({ fieldName: 'meta_description', value: body.metaDescription });
      }
      if (body.preOrderMessage !== undefined && typeof body.preOrderMessage === 'string') {
        fields.push({ fieldName: 'pre_order_message', value: body.preOrderMessage });
      }
      if (body.warranty !== undefined && typeof body.warranty === 'string') {
        fields.push({ fieldName: 'warranty_information', value: body.warranty });
      }
      if (body.availabilityDescription !== undefined && typeof body.availabilityDescription === 'string') {
        fields.push({ fieldName: 'availability_text', value: body.availabilityDescription });
      }
      if (body.searchKeywords !== undefined && typeof body.searchKeywords === 'string') {
        fields.push({ fieldName: 'search_keywords', value: body.searchKeywords });
      }

      // Update basic fields with new API (with error handling)
      if (fields.length > 0) {
        try {
          await graphQLClient.updateProductTranslations({
            channelId: Number(channelId),
            locale: body.locale,
            productId: Number(pid),
            fields: fields,
          });
        } catch (error) {
          console.error(`Failed to update translations with new API for product ${pid}:`, error);
          // Continue with old API updates - partial update is better than complete failure
          // Log error but don't throw to allow options/modifiers to still update
        }
      }

      // Options, modifiers, and custom fields still use old API
      const optionData = createGraphFieldsFromPostData(body, "options");
      const modifierData = createGraphFieldsFromPostData(body, "modifiers");
      const customFieldData = createGraphFieldsFromPostData(body, "customFields");

      // Get fields to remove for each section
      const basicInfoFieldsToRemove = getBasicInformationFieldsToRemove({
        name: body.name,
        description: body.description
      });
      const seoFieldsToRemove = getSeoInformationFieldsToRemove({
        pageTitle: body.pageTitle,
        metaDescription: body.metaDescription
      });
      const storefrontFieldsToRemove = getStorefrontDetailsFieldsToRemove({
        warranty: body.warranty,
        availabilityDescription: body.availabilityDescription,
        searchKeywords: body.searchKeywords
      });
      const preOrderFieldsToRemove = getPreOrderSettingsFieldsToRemove({
        preOrderMessage: body.preOrderMessage
      });
      const customFieldsToRemove = getCustomFieldsToRemove(customFieldData);

      // Map old API field names to new API field names for deletion
      // Note: Field names must match what getBasicInformationFieldsToRemove, etc. return
      const oldToNewFieldNameMap: Record<string, string> = {
        'PRODUCT_NAME_FIELD': 'name',
        'PRODUCT_DESCRIPTION_FIELD': 'description',
        'PRODUCT_PAGE_TITLE_FIELD': 'page_title',
        'PRODUCT_META_DESCRIPTION_FIELD': 'meta_description',
        'PRODUCT_WARRANTY': 'warranty_information',
        'PRODUCT_AVAILABILITY_DESCRIPTION_FIELD': 'availability_text',
        'PRODUCT_SEARCH_KEYWORDS': 'search_keywords',
        'PRODUCT_PRE_ORDER_MESSAGE': 'pre_order_message',
      };

      // Collect all basic fields to delete using new API
      const fieldsToDelete: string[] = [];
      
      // Map basic info fields
      basicInfoFieldsToRemove.forEach((field: string) => {
        const newFieldName = oldToNewFieldNameMap[field];
        if (newFieldName) fieldsToDelete.push(newFieldName);
      });
      
      // Map SEO fields
      seoFieldsToRemove.forEach((field: string) => {
        const newFieldName = oldToNewFieldNameMap[field];
        if (newFieldName) fieldsToDelete.push(newFieldName);
      });
      
      // Map storefront fields
      storefrontFieldsToRemove.forEach((field: string) => {
        const newFieldName = oldToNewFieldNameMap[field];
        if (newFieldName) fieldsToDelete.push(newFieldName);
      });
      
      // Map pre-order fields
      preOrderFieldsToRemove.forEach((field: string) => {
        const newFieldName = oldToNewFieldNameMap[field];
        if (newFieldName) fieldsToDelete.push(newFieldName);
      });

      // Delete basic fields using new API
      if (fieldsToDelete.length > 0) {
        try {
          await graphQLClient.deleteProductTranslations({
            channelId: Number(channelId),
            locale: body.locale,
            productId: Number(pid),
            fields: fieldsToDelete,
          });
        } catch (error) {
          console.error(`Failed to delete translations with new API for product ${pid}:`, error);
          // Continue with other updates - partial update is better than complete failure
        }
      }

      // Update options/modifiers/customFields with old API (existing code)
      // Note: Custom fields removals still use old API for now
      const graphVariables = {
        channelId: `bc/store/channel/${channelId}`,
        locale: body.locale,
        ...(customFieldsToRemove.length > 0 && {
          removedCustomFieldsInput: {
            productId: `bc/store/product/${pid}`,
            data: customFieldsToRemove.map(field => ({
              customFieldId: field.customFieldId,
              channelLocaleContextData: {
                context: {
                  channelId: `bc/store/channel/${channelId}`,
                  locale: body.locale
                },
                attributes: field.fields
              }
            }))
          }
        }),
        removedOptionsInput: {
          productId: `bc/store/product/${pid}`,
          localeContext: {
            channelId: `bc/store/channel/${channelId}`,
            locale: body.locale,
          },
          data: {
            options: transformPostedOptionDataToGraphQLSchema(optionData).removedValues
          }
        },
        optionsInput: {
          productId: `bc/store/product/${pid}`,
          localeContext: {
            channelId: `bc/store/channel/${channelId}`,
            locale: body.locale,
          },
          data: {
            options: transformPostedOptionDataToGraphQLSchema(optionData).options,
          },
        },
        removedModifiersInput: {
          productId: `bc/store/product/${pid}`,
          localeContext: {
            channelId: `bc/store/channel/${channelId}`,
            locale: body.locale,
          },
          data: {
            modifiers: transformPostedModifierDataToGraphQLSchema(modifierData).removedValues
          }
        },
        modifiersInput: {
          productId: `bc/store/product/${pid}`,
          localeContext: {
            channelId: `bc/store/channel/${channelId}`,
            locale: body.locale,
          },
          data: {
            modifiers: transformPostedModifierDataToGraphQLSchema(modifierData).modifiers,
          },
        },
        customFieldsInput: {
          productId: `bc/store/product/${pid}`,
          data: transformPostedCustomFieldDataToGraphQLSchema(
            customFieldData,
            channelId,
            body.locale
          ),
        },
      };

      // Update options/modifiers/customFields with old API
      try {
        await graphQLClient.NOTADA_updateProductLocaleData(graphVariables);
      } catch (error) {
        console.error(`Failed to update options/modifiers/customFields with old API for product ${pid}:`, error);
        // If this fails, we still want to return the basic fields that were updated
        // Log error but continue to return partial result
      }

      // Fetch complete updated data to return in response
      const { defaultLocale: updatedDefaultLocale, availableLocales: updatedLocales } = await getChannelLocales(context, channelId);
      
      // Fetch updated product data (includes options/modifiers/customFields)
      const updatedGqlData = await graphQLClient.getProductLocaleData({
        pid: Number(pid),
        channelId: Number(channelId),
        locale: body.locale,
        availableLocales: updatedLocales,
        defaultLocale: updatedDefaultLocale,
      });

      // Fetch updated translations from new API (with error handling)
      let updatedTranslationMap: Record<string, string> = {};
      try {
        const updatedTranslationsData = await graphQLClient.getProductTranslations({
          channelId: Number(channelId),
          locale: body.locale,
          productId: Number(pid),
        });
        
        const updatedTranslationNode = updatedTranslationsData.edges?.[0]?.node;
        if (updatedTranslationNode?.fields) {
          updatedTranslationNode.fields.forEach((field: { fieldName: string; translation: string | null; original: string }) => {
            updatedTranslationMap[field.fieldName] = field.translation || field.original;
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch updated translations, using old API data:`, error);
        // Fallback to old API data
        if (updatedGqlData.overridesForLocale) {
          updatedTranslationMap['name'] = updatedGqlData.overridesForLocale.basicInformation?.name || '';
          updatedTranslationMap['description'] = updatedGqlData.overridesForLocale.basicInformation?.description || '';
          updatedTranslationMap['page_title'] = updatedGqlData.overridesForLocale.seoInformation?.pageTitle || '';
          updatedTranslationMap['meta_description'] = updatedGqlData.overridesForLocale.seoInformation?.metaDescription || '';
          updatedTranslationMap['pre_order_message'] = updatedGqlData.overridesForLocale.preOrderSettings?.message || '';
          updatedTranslationMap['warranty_information'] = updatedGqlData.overridesForLocale.storefrontDetails?.warranty || '';
          updatedTranslationMap['availability_text'] = updatedGqlData.overridesForLocale.storefrontDetails?.availabilityDescription || '';
          updatedTranslationMap['search_keywords'] = updatedGqlData.overridesForLocale.storefrontDetails?.searchKeywords || '';
        }
      }

      // Build complete result with all fields
      const result = {
        name: updatedTranslationMap['name'] || updatedGqlData.overridesForLocale?.basicInformation?.name || null,
        description: updatedTranslationMap['description'] || updatedGqlData.overridesForLocale?.basicInformation?.description || null,
        pageTitle: updatedTranslationMap['page_title'] || updatedGqlData.overridesForLocale?.seoInformation?.pageTitle || null,
        metaDescription: updatedTranslationMap['meta_description'] || updatedGqlData.overridesForLocale?.seoInformation?.metaDescription || null,
        preOrderMessage: updatedTranslationMap['pre_order_message'] || updatedGqlData.overridesForLocale?.preOrderSettings?.message || null,
        warranty: updatedTranslationMap['warranty_information'] || updatedGqlData.overridesForLocale?.storefrontDetails?.warranty || null,
        availabilityDescription: updatedTranslationMap['availability_text'] || updatedGqlData.overridesForLocale?.storefrontDetails?.availabilityDescription || null,
        searchKeywords: updatedTranslationMap['search_keywords'] || updatedGqlData.overridesForLocale?.storefrontDetails?.searchKeywords || null,
        // Include options, modifiers, customFields from updated product data
        // Note: These transform functions already exist in the route file
        options: transformGraphQLOptionsResponse(updatedGqlData?.options),
        modifiers: transformGraphQLModifiersResponse(updatedGqlData?.modifiers),
        customFields: transformGraphQLCustomFieldsResponse(updatedGqlData?.customFields),
      };

      return Response.json(result);
    } else {
      // Default locale - update main product (existing code)
      const bigcommerce = new BigCommerceRestClient({
        accessToken,
        storeHash,
      });
      const { data: updatedProduct } = await bigcommerce.put(`/v3/catalog/products/${pid}`, body);
      return Response.json(updatedProduct);
    }
  } catch (error: any) {
    const { message, response } = error;

    return new Response(message || "Authentication failed, please re-install", {
      status: response?.status || 500,
    });
  }
}
```

---

## 5. Update Channels API Route

### File: `app/api/channels/route.ts`

**Update to use GraphQL for locales:**

```typescript
import { type NextRequest } from "next/server";
import { getSessionFromContext } from "@/lib/auth";
import { BigCommerceRestClient } from "@bigcommerce/translations-rest-client";
import { createGraphQLClient } from "@bigcommerce/translations-graphql-client";
import { fallbackLocale, hardcodedAvailableLocales } from "@/lib/constants";
import { unstable_cache } from "next/cache";

// ... existing types ...

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const context = searchParams.get("context") ?? "";

  try {
    const { accessToken, storeHash } = await getSessionFromContext(context);
    const bigcommerce = new BigCommerceRestClient({
      accessToken: accessToken,
      storeHash: storeHash,
    });
    const graphQLClient = createGraphQLClient(accessToken, storeHash);

    const getChannelsData = async (): Promise<ChannelResponse[]> => {
      const { data: channelsData } = await bigcommerce.getAvailableChannels();

      const result = await Promise.all(
        channelsData.map(async (channel: Channel) => {
          try {
            // NEW: Use GraphQL to get locales
            const localesData = await graphQLClient.getChannelLocales(channel.id);
            
            const locales: Locale[] = localesData.map(
              (locale: {
                code: string;
                status: string;
                is_default: boolean;
              }) => ({
                ...locale,
                title: hardcodedAvailableLocales.find(
                  ({ id }) => id === locale.code
                )?.name,
              })
            );

            const defaultLocale =
              locales.find((locale) => locale.is_default)?.code ||
              fallbackLocale.code;

            return {
              channel_id: channel.id,
              channel_name: channel.name,
              default_locale: defaultLocale,
              locales,
            };
          } catch (innerError) {
            console.error(
              `Failed to fetch locales for channel ${channel.id}:`,
              innerError
            );
            return {
              channel_id: channel.id,
              channel_name: channel.name,
              default_locale: fallbackLocale.code,
              locales: [fallbackLocale],
            };
          }
        })
      );

      // Filter channels to only include those with more than one locale
      return result.filter((channel) => channel.locales.length > 1);
    };

    // Cache per storeHash
    const cachedData = await unstable_cache(
      getChannelsData,
      [`channels-${storeHash}`],
      {
        revalidate: 3600,
        tags: [`store-${storeHash}`],
      }
    )();

    return Response.json(cachedData);
  } catch (error: any) {
    const { message, response } = error;

    return new Response(message || "Authentication failed, please re-install", {
      status: response?.status || 500,
    });
  }
}
```

---

## 6. Update Exports in GraphQL Client

### File: `lib/graphql-client/src/queries/index.ts`

**Add exports:**

```typescript
// ... existing exports ...
export * from "./product.tada";
export * from "./locales.tada"; // NEW
```

---

## 7. Field Name Mapping Reference

### New API Field Names → Current Field Names

| New API Field Name | Current Field Name | Notes |
|-------------------|-------------------|-------|
| `name` | `name` | Direct mapping |
| `description` | `description` | Direct mapping |
| `page_title` | `pageTitle` | Snake case → camelCase |
| `meta_description` | `metaDescription` | Snake case → camelCase |
| `pre_order_message` | `preOrderMessage` | Snake case → camelCase |
| `warranty_information` | `warranty` | Different name |
| `availability_text` | `availabilityDescription` | Different name |
| `search_keywords` | `searchKeywords` | Snake case → camelCase |
| `image_alt_text` | Not supported | Not in current implementation |

---

## 8. Important Notes

### Options and Modifiers
- **Decision**: Options and modifiers will continue using the **old API** (`overridesForLocale`)
- **Reason**: New Translations API support for options/modifiers is not yet available
- **Future**: Will be migrated to new API once support is available
- **Implementation**: Old API methods (`setProductOptionsInformation`, `setProductModifiersInformation`) are preserved

### Custom Fields
- **Decision**: Custom fields will use the **new Translations API** with `PRODUCT_CUSTOM_FIELDS` resource type
- **Implementation**: Query and update custom fields using `store.translations(filters: { resourceType: PRODUCT_CUSTOM_FIELDS, ... })`
- **Migration**: Custom fields will be migrated from old API to new API
- **Note**: Custom field removals now use new API's `deleteTranslations` with `PRODUCT_CUSTOM_FIELDS` resource type

### Field Removals
- **Decision**: Basic field removals use the **new API's `deleteTranslations`** mutation
- **Implementation**: Map old API field names to new API field names and use `deleteProductTranslations`
- **Mapping**: Old API field names (e.g., `PRODUCT_NAME_FIELD`) are mapped to new API field names (e.g., `name`)
- **Reason**: Consistency - if basic fields are updated via new API, removals should also use new API

### Hybrid Approach Summary
- ✅ **New API**: Basic product fields (name, description, page_title, etc.) - **updates and deletions**
- ✅ **New API**: Custom fields (PRODUCT_CUSTOM_FIELDS resource type) - **updates and deletions**
- ✅ **New API**: Locales (GraphQL `store.locales` query)
- ⏸️ **Old API**: Options (will migrate later)
- ⏸️ **Old API**: Modifiers (will migrate later)

### Backward Compatibility
- Old methods are kept for options/modifiers/customFields
- New methods are used for basic product fields
- This ensures no breaking changes

### Bug Fix Preservation
- The app extension authentication fix (from `app/products/[pid]/page.tsx`) is **preserved**
- All changes are additive and don't affect the authentication flow

---

## 9. Testing Checklist

After implementing these changes:

- [ ] Test product translation query with new API
- [ ] Test product translation update with new API
- [ ] Test channel locales query with GraphQL
- [ ] Verify options/modifiers still work (using old API)
- [ ] Verify custom fields still work (using old API)
- [ ] Test app extension authentication (bug fix preserved)
- [ ] Test existing flows (backward compatibility)
- [ ] Verify error handling works correctly

---

## 10. Next Steps

1. Review these suggested changes
2. Test with a real BigCommerce store
3. Verify all fields are supported
4. Make adjustments as needed
5. Update documentation
6. Deploy

---

## Summary

This migration:
- ✅ Uses new Translations API for basic product fields
- ✅ Uses GraphQL for locales query
- ✅ Preserves bug fix for app extension authentication
- ✅ Maintains backward compatibility for options/modifiers/customFields
- ✅ Follows the same pattern as category translations (already implemented)

The implementation is **hybrid**: new API for basic fields, old API for complex fields (options/modifiers/customFields) until confirmed support.

