# Code Review: Fixed Implementation

## Issues Found and Fixed

This document provides the corrected implementation addressing all issues found in the code review.

---

## 🔴 Critical Fixes

### Fix #1: Error Handling for New API Call

**Issue**: If new API fails, entire request fails

**Fixed Implementation**:

```typescript
// In GET handler - app/api/product/[pid]/route.ts
let translationsData = null;
let translationMap: Record<string, string> = {};

try {
  translationsData = await graphQLClient.getProductTranslations({
    channelId: Number(channelId),
    locale: selectedLocale,
    productId: Number(pid),
  });
  
  const translationNode = translationsData.edges?.[0]?.node;
  if (translationNode) {
    const translationFields = translationNode.fields || [];
    translationFields.forEach((field: { fieldName: string; original: string; translation: string | null }) => {
      translationMap[field.fieldName] = field.translation || field.original;
    });
  }
} catch (error) {
  console.warn('Failed to fetch translations from new API, falling back to old API only:', error);
  // Continue with old API data - this is acceptable fallback
}

// Continue with existing getProductLocaleData call...
const gqlData = await graphQLClient.getProductLocaleData({
  // ... existing code
});
```

---

### Fix #2: Complete Return Data in PUT Handler

**Issue**: Missing options/modifiers/customFields in response

**Fixed Implementation**:

```typescript
// In PUT handler - after updating translations
if (body["locale"] && body.locale !== defaultLocale) {
  // Update basic fields with new API
  const fields: Array<{ fieldName: string; value: string }> = [];
  
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

  // Update basic fields with new API
  if (fields.length > 0) {
    try {
      await graphQLClient.updateProductTranslations({
        channelId: Number(channelId),
        locale: body.locale,
        productId: Number(pid),
        fields: fields,
      });
    } catch (error) {
      console.error('Failed to update translations with new API:', error);
      // Continue with old API - partial update is better than complete failure
    }
  }

  // Update options/modifiers/customFields with old API (existing code)
  const optionData = createGraphFieldsFromPostData(body, "options");
  const modifierData = createGraphFieldsFromPostData(body, "modifiers");
  const customFieldData = createGraphFieldsFromPostData(body, "customFields");

  // ... existing code for old API updates ...

  // Fetch updated data to return complete response
  const { defaultLocale: updatedDefaultLocale, availableLocales: updatedLocales } = await getChannelLocales(context, channelId);
  
  const updatedGqlData = await graphQLClient.getProductLocaleData({
    pid: Number(pid),
    channelId: Number(channelId),
    locale: body.locale,
    availableLocales: updatedLocales,
    defaultLocale: updatedDefaultLocale,
  });

  // Get updated translations from new API
  let updatedTranslationMap: Record<string, string> = {};
  try {
    const updatedTranslationsData = await graphQLClient.getProductTranslations({
      channelId: Number(channelId),
      locale: body.locale,
      productId: Number(pid),
    });
    
    const updatedTranslationNode = updatedTranslationsData.edges?.[0]?.node;
    if (updatedTranslationNode) {
      updatedTranslationNode.fields?.forEach((field: { fieldName: string; translation: string | null; original: string }) => {
        updatedTranslationMap[field.fieldName] = field.translation || field.original;
      });
    }
  } catch (error) {
    console.warn('Failed to fetch updated translations, using old API data:', error);
  }

  // Build complete result
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
    options: transformGraphQLOptionsResponse(updatedGqlData?.options),
    modifiers: transformGraphQLModifiersResponse(updatedGqlData?.modifiers),
    customFields: transformGraphQLCustomFieldsResponse(updatedGqlData?.customFields),
  };

  return Response.json(result);
}
```

---

### Fix #3: Performance Optimization - Parallel API Calls

**Issue**: Sequential API calls slow down response

**Fixed Implementation**:

```typescript
// In GET handler
// Make both API calls in parallel
const [translationsDataResult, gqlDataResult] = await Promise.allSettled([
  graphQLClient.getProductTranslations({
    channelId: Number(channelId),
    locale: selectedLocale,
    productId: Number(pid),
  }).catch(error => {
    console.warn('New API call failed, will use old API only:', error);
    return null;
  }),
  graphQLClient.getProductLocaleData({
    pid: Number(pid),
    channelId: Number(channelId),
    locale: selectedLocale,
    availableLocales,
    defaultLocale,
  })
]);

// Handle translations data
let translationMap: Record<string, string> = {};
if (translationsDataResult.status === 'fulfilled' && translationsDataResult.value) {
  const translationNode = translationsDataResult.value.edges?.[0]?.node;
  if (translationNode) {
    translationNode.fields?.forEach((field: { fieldName: string; translation: string | null; original: string }) => {
      translationMap[field.fieldName] = field.translation || field.original;
    });
  }
}

// Handle product data
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
```

---

### Fix #4: Type Safety Improvements

**Issue**: Use of `any` types

**Fixed Implementation**:

```typescript
// Add type definitions
interface TranslationField {
  fieldName: string;
  original: string;
  translation: string | null;
}

interface TranslationNode {
  resourceId: string;
  fields: TranslationField[];
}

interface TranslationsResponse {
  edges: Array<{
    node: TranslationNode;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

// Use in code
translationFields.forEach((field: TranslationField) => {
  translationMap[field.fieldName] = field.translation || field.original;
});
```

---

### Fix #5: Handle Empty Translations

**Issue**: Not explicitly handling products with no translations

**Fixed Implementation**:

```typescript
// In GET handler
const translationNode = translationsData?.edges?.[0]?.node;

if (!translationNode) {
  // No translations exist yet - this is normal for new products
  // Use original product data as fallback
  console.log(`No translations found for product ${pid} in locale ${selectedLocale}`);
  // Continue with gqlData only
}

// Build translation map (will be empty if no translations)
const translationMap: Record<string, string> = {};
if (translationNode?.fields) {
  translationNode.fields.forEach((field: TranslationField) => {
    translationMap[field.fieldName] = field.translation || field.original;
  });
}

// Use translation map with fallback to original data
const normalizedProductData = {
  name: translationMap['name'] || productNode.basicInformation?.name || '',
  description: translationMap['description'] || productNode.basicInformation?.description || '',
  // ... etc with proper fallbacks
};
```

---

### Fix #6: Locales API Response Structure

**Issue**: Return type mismatch

**Fixed Implementation**:

```typescript
// In lib/graphql-client/src/client.ts - getChannelLocales method
async getChannelLocales(channelId: number): Promise<Array<{
  code: string;
  status: string;
  is_default: boolean;
}>> {
  // ... existing code ...
  
  return typedResponse.data.store.locales.edges.map((edge: {
    node: {
      code: string;
      status: string;
      isDefault: boolean;
    }
  }) => ({
    code: edge.node.code,
    status: edge.node.status,
    is_default: edge.node.isDefault,  // Map isDefault → is_default
  }));
}
```

**In app/api/channels/route.ts**:

```typescript
// The getChannelLocales returns { code, status, is_default }[]
// We add 'title' in the channels route (as it's not from API)
const localesData = await graphQLClient.getChannelLocales(channel.id);

const locales: Locale[] = localesData.map(
  (locale: { code: string; status: string; is_default: boolean }) => ({
    code: locale.code,
    status: locale.status,
    is_default: locale.is_default,
    title: hardcodedAvailableLocales.find(
      ({ id }) => id === locale.code
    )?.name,  // Add title from hardcoded list
  })
);
```

---

### Fix #7: Remove Unused Code

**Issue**: Unused fieldNameMap variable

**Fixed Implementation**:

```typescript
// Remove the unused fieldNameMap
// The mapping is done inline, which is clearer

const normalizedProductData = {
  // Direct mapping with fallback
  name: translationMap['name'] || productNode.basicInformation?.name,
  description: translationMap['description'] || productNode.basicInformation?.description,
  pageTitle: translationMap['page_title'] || productNode.seoInformation?.pageTitle,
  // ... etc
};
```

---

## 🟡 Medium Priority Fixes

### Fix #8: Input Validation

**Added validation**:

```typescript
// In PUT handler
const validFieldNames = [
  'name', 'description', 'page_title', 'meta_description',
  'pre_order_message', 'warranty_information', 
  'availability_text', 'search_keywords'
];

const fields: Array<{ fieldName: string; value: string }> = [];

// Validate and add fields
const addField = (fieldName: string, value: unknown) => {
  if (value !== undefined && value !== null && typeof value === 'string') {
    if (validFieldNames.includes(fieldName)) {
      fields.push({ fieldName, value });
    } else {
      console.warn(`Invalid field name: ${fieldName}`);
    }
  }
};

addField('name', body.name);
addField('description', body.description);
addField('page_title', body.pageTitle);
// ... etc
```

---

### Fix #9: Better Error Messages

**Improved error messages**:

```typescript
// In client methods
if (!typedResponse.data?.store?.translations) {
  throw new Error(`Failed to fetch translations for product ${options.productId} in locale ${options.locale}`);
}

// In update method
if (errors && errors.length > 0) {
  const errorMessages = errors
    .map((e: any) => e.message)
    .filter(Boolean)
    .join(", ");
  throw new Error(
    `Translation update failed for product ${options.productId} in locale ${options.locale}: ${errorMessages}`
  );
}
```

---

## Summary of All Fixes

### Critical (Must Fix):
1. ✅ Error handling with graceful fallback
2. ✅ Complete return data including options/modifiers
3. ✅ Performance optimization (parallel calls)

### Important (Should Fix):
4. ✅ Type safety improvements
5. ✅ Empty translations handling
6. ✅ Response structure consistency

### Nice to Have:
7. ✅ Remove unused code
8. ✅ Input validation
9. ✅ Better error messages

---

## Testing Checklist After Fixes

- [ ] Test with product that has no translations
- [ ] Test with product that has partial translations
- [ ] Test when new API fails (should fallback to old API)
- [ ] Test when old API fails (should still work with new API)
- [ ] Test parallel API calls performance
- [ ] Test complete response includes all fields
- [ ] Test error messages are clear
- [ ] Test input validation rejects invalid data
- [ ] Test type safety (no runtime errors)

---

## Implementation Notes

1. **Graceful Degradation**: New API failures don't break the app
2. **Performance**: Parallel calls reduce latency
3. **Completeness**: All data returned in responses
4. **Type Safety**: Proper types reduce bugs
5. **Error Handling**: Clear error messages aid debugging

All fixes maintain backward compatibility and preserve the app extension authentication bug fix.

