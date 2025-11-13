# Implementation Decisions: API Migration

## Summary

This document outlines the decisions made for migrating to the new Translations API while maintaining backward compatibility.

---

## API Usage Strategy

### ✅ New Translations API (Implement Now)

1. **Basic Product Fields**
   - Resource Type: `PRODUCTS`
   - Fields: `name`, `description`, `page_title`, `meta_description`, `pre_order_message`, `warranty_information`, `availability_text`, `search_keywords`
   - Query: `store.translations(filters: { resourceType: PRODUCTS, ... })`
   - Update: `translation.updateTranslations(input: { resourceType: PRODUCTS, ... })`

2. **Custom Fields**
   - Resource Type: `PRODUCT_CUSTOM_FIELDS`
   - Fields: `name`, `value`
   - Query: `store.translations(filters: { resourceType: PRODUCT_CUSTOM_FIELDS, ... })`
   - Update: `translation.updateTranslations(input: { resourceType: PRODUCT_CUSTOM_FIELDS, ... })`
   - Delete: `translation.deleteTranslations(input: { resourceType: PRODUCT_CUSTOM_FIELDS, ... })`

3. **Locales**
   - Query: `store.locales(input: { channelId: ... })`
   - Replaces: REST API `/v3/settings/store/locales?channel_id=X`

### ⏸️ Old API (Keep for Now)

1. **Product Options**
   - Continue using: `setProductOptionsInformation` mutation
   - Continue using: `overridesForLocale` on options
   - **Reason**: New API support not yet available
   - **Future**: Will migrate when support is added

2. **Product Modifiers**
   - Continue using: `setProductModifiersInformation` mutation
   - Continue using: `overridesForLocale` on modifiers
   - **Reason**: New API support not yet available
   - **Future**: Will migrate when support is added

---

## Implementation Approach

### Hybrid Architecture

```
Product Translation Request
    │
    ├─→ Basic Fields → New Translations API (PRODUCTS)
    ├─→ Custom Fields → New Translations API (PRODUCT_CUSTOM_FIELDS)
    ├─→ Options → Old API (overridesForLocale)
    └─→ Modifiers → Old API (overridesForLocale)
```

### Code Structure

1. **New Methods** (in `GraphQLClient`):
   - `getProductTranslations()` - Query basic fields
   - `updateProductTranslations()` - Update basic fields
   - `deleteProductTranslations()` - Delete basic fields
   - `getProductCustomFieldTranslations()` - Query custom fields
   - `updateProductCustomFieldTranslations()` - Update custom fields
   - `deleteCustomFieldTranslations()` - Delete custom fields
   - `getChannelLocales()` - Query locales via GraphQL

2. **Preserved Methods** (keep existing):
   - `getProductLocaleData()` - Still used for options/modifiers
   - `NOTADA_updateProductLocaleData()` - Still used for options/modifiers

3. **API Routes**:
   - `/api/product/[pid]` - Combines new API (basic fields) + old API (options/modifiers)
   - `/api/channels` - Uses new GraphQL API for locales

---

## Migration Path

### Phase 1: Basic Fields & Custom Fields (Current)
- ✅ Implement new API for basic product fields (updates and deletions)
- ✅ Implement new API for custom fields (updates and deletions)
- ✅ Implement GraphQL for locales
- ✅ Keep old API for options/modifiers

### Phase 2: Options & Modifiers (Future)
- ⏳ Wait for BigCommerce to add support
- ⏳ Migrate options to new API
- ⏳ Migrate modifiers to new API
- ⏳ Remove old API code

---

## Benefits

1. **Immediate Improvements**:
   - Simplified API for basic fields (single mutation vs multiple)
   - Better performance for translations queries
   - Consistent API pattern (matches categories)

2. **Future-Proof**:
   - Ready to migrate options/modifiers when support is available
   - Clean separation between new and old API usage
   - Easy to remove old API code later

3. **Backward Compatibility**:
   - No breaking changes
   - Options/modifiers continue working
   - Gradual migration path

---

## Testing Strategy

### Test New API
- [ ] Basic product fields translation query
- [ ] Basic product fields translation update
- [ ] Basic product fields translation deletion
- [ ] Custom fields translation query
- [ ] Custom fields translation update
- [ ] Custom fields translation deletion
- [ ] Locales query via GraphQL

### Test Old API (Preserved)
- [ ] Options translation query
- [ ] Options translation update
- [ ] Modifiers translation query
- [ ] Modifiers translation update

### Test Integration
- [ ] Combined request (basic fields + options + modifiers)
- [ ] App extension authentication (bug fix preserved)
- [ ] Existing flows continue working

---

## Code Examples

### Basic Fields (New API)
```typescript
// Query
const translations = await graphQLClient.getProductTranslations({
  channelId: 1,
  locale: 'fr',
  productId: 123
});

// Update
await graphQLClient.updateProductTranslations({
  channelId: 1,
  locale: 'fr',
  productId: 123,
  fields: [
    { fieldName: 'name', value: 'Produit' },
    { fieldName: 'description', value: 'Description' }
  ]
});
```

### Options/Modifiers (Old API - Preserved)
```typescript
// Still use existing methods
const productData = await graphQLClient.getProductLocaleData({
  pid: 123,
  channelId: 1,
  locale: 'fr',
  // ... includes options/modifiers via overridesForLocale
});

await graphQLClient.NOTADA_updateProductLocaleData({
  // ... options/modifiers updates
});
```

---

## Summary

- ✅ **New API**: Basic fields (updates & deletions), custom fields (updates & deletions), locales
- ⏸️ **Old API**: Options, modifiers (until support available)
- 🔄 **Hybrid**: Both APIs work together seamlessly
- 🚀 **Future**: Easy migration path for options/modifiers

This approach provides immediate benefits while maintaining full functionality and preparing for future enhancements. Custom fields are now fully migrated to the new API.

