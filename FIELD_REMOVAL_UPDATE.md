# Field Removal Strategy Update

## Decision

**Basic field removals will use the new API's `deleteTranslations` mutation.**

This ensures consistency: if basic fields are updated via the new API, removals should also use the new API.

---

## Implementation Changes

### 1. Field Name Mapping

Created a mapping from old API field names to new API field names:

```typescript
// Note: Field names must match what getBasicInformationFieldsToRemove, etc. return
const oldToNewFieldNameMap: Record<string, string> = {
  'PRODUCT_NAME_FIELD': 'name',
  'PRODUCT_DESCRIPTION_FIELD': 'description',
  'PRODUCT_PAGE_TITLE_FIELD': 'page_title',
  'PRODUCT_META_DESCRIPTION_FIELD': 'meta_description',
  'PRODUCT_WARRANTY': 'warranty_information',  // Note: no _FIELD suffix
  'PRODUCT_AVAILABILITY_DESCRIPTION_FIELD': 'availability_text',
  'PRODUCT_SEARCH_KEYWORDS': 'search_keywords',  // Note: no _FIELD suffix
  'PRODUCT_PRE_ORDER_MESSAGE': 'pre_order_message',  // Note: no _FIELD suffix
};
```

### 2. Updated PUT Handler

The PUT handler now:
1. Gets fields to remove using existing helper functions
2. Maps old API field names to new API field names
3. Uses `deleteProductTranslations` for basic field removals
4. Continues using old API for options/modifiers/customFields removals

### 3. Code Flow

```typescript
// 1. Get fields to remove (using existing helpers)
const basicInfoFieldsToRemove = getBasicInformationFieldsToRemove({...});
const seoFieldsToRemove = getSeoInformationFieldsToRemove({...});
// ... etc

// 2. Map to new API field names
const fieldsToDelete: string[] = [];
basicInfoFieldsToRemove.forEach((field: string) => {
  const newFieldName = oldToNewFieldNameMap[field];
  if (newFieldName) fieldsToDelete.push(newFieldName);
});
// ... repeat for all field types

// 3. Delete using new API
if (fieldsToDelete.length > 0) {
  await graphQLClient.deleteProductTranslations({
    channelId: Number(channelId),
    locale: body.locale,
    productId: Number(pid),
    fields: fieldsToDelete,
  });
}
```

---

## Benefits

1. ✅ **Consistency**: Basic fields use new API for both updates and deletions
2. ✅ **Clarity**: Clear separation between new API (basic fields) and old API (options/modifiers)
3. ✅ **Future-proof**: Easier to migrate remaining fields later
4. ✅ **Error Handling**: Proper error handling with graceful fallback

---

## What Still Uses Old API

- ✅ Options (updates and removals)
- ✅ Modifiers (updates and removals)
- ✅ Custom fields (removals only - updates use new API)

---

## Testing Checklist

- [ ] Test removing a single basic field (e.g., name)
- [ ] Test removing multiple basic fields
- [ ] Test removing all basic fields
- [ ] Test removing fields that don't exist (should handle gracefully)
- [ ] Verify options/modifiers removals still work (old API)
- [ ] Verify custom fields removals still work (old API)
- [ ] Test error handling if new API deletion fails

---

## Updated Files

1. ✅ `SUGGESTED_CHANGES.md` - Updated PUT handler implementation
2. ✅ `SUGGESTED_CHANGES.md` - Updated documentation section

---

## Status

✅ **Implementation Updated**

The code now uses the new API's `deleteTranslations` for basic field removals, ensuring consistency with the update strategy.

