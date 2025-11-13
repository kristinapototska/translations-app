# Migrate Product Translations to New BigCommerce Translations Admin GraphQL API

## Summary

This PR migrates product translations to use the new [BigCommerce Translations Admin GraphQL API](https://developer.bigcommerce.com/docs/store-operations/translations/product) for basic product fields, while maintaining backward compatibility for options, modifiers, and custom fields.

## Changes

### ✅ Implemented

1. **App Extension Authentication Fix** (from previous work)
   - Fixed app extension loading issue when `context` parameter is missing
   - Updated `/api/load/route.ts` to handle redirect paths correctly
   - Updated `/app/products/[pid]/page.tsx` to redirect to `/api/load` when needed
   - Added test coverage for the fix

2. **New GraphQL Queries and Mutations** ✅
   - Added `GetProductTranslationsDocument` query
   - Added `UpdateProductTranslationsDocument` mutation
   - Added `DeleteProductTranslationsDocument` mutation
   - Added `GetChannelLocalesDocument` query
   - Helper functions for creating variables

3. **GraphQL Client Methods** ✅
   - `getProductTranslations()` - Fetch translations using new API
   - `updateProductTranslations()` - Update translations using new API
   - `deleteProductTranslations()` - Delete translations using new API
   - `deleteCustomFieldTranslations()` - Delete custom field translations using new API
   - `getChannelLocales()` - Fetch locales using GraphQL

4. **Product API Route Updates** ✅
   - **GET Handler**: Hybrid approach with parallel API calls
     - Uses new API for basic product fields
     - Uses old API for options/modifiers/customFields
     - Graceful fallback if new API fails
   - **PUT Handler**: Hybrid approach
     - Updates basic fields via new API
     - Deletes basic fields via new API's `deleteTranslations`
     - Deletes custom fields via new API's `deleteTranslations` with `PRODUCT_CUSTOM_FIELDS`
     - Updates options/modifiers/customFields via old API
     - Complete return data with all fields

5. **Channels API Route Updates** ✅
   - Updated to use GraphQL `store.locales` query
   - Maintains backward compatibility

## Technical Details

### Hybrid Approach

- ✅ **New API**: Basic product fields (name, description, page_title, etc.) - **updates and deletions**
- ✅ **New API**: Custom fields (PRODUCT_CUSTOM_FIELDS resource type) - **updates and deletions**
- ✅ **New API**: Locales (GraphQL `store.locales` query)
- ⏸️ **Old API**: Options (will migrate later)
- ⏸️ **Old API**: Modifiers (will migrate later)

### Error Handling

- Parallel API calls with `Promise.allSettled()` for better performance
- Graceful fallback if new API fails
- Separate try-catch blocks for new API and old API updates
- Comprehensive error logging with context
- Partial updates handled gracefully

### Field Name Mapping

Old API field names are mapped to new API field names:
- `PRODUCT_NAME_FIELD` → `name`
- `PRODUCT_DESCRIPTION_FIELD` → `description`
- `PRODUCT_PAGE_TITLE_FIELD` → `page_title`
- `PRODUCT_META_DESCRIPTION_FIELD` → `meta_description`
- `PRODUCT_WARRANTY` → `warranty_information`
- `PRODUCT_AVAILABILITY_DESCRIPTION_FIELD` → `availability_text`
- `PRODUCT_SEARCH_KEYWORDS` → `search_keywords`
- `PRODUCT_PRE_ORDER_MESSAGE` → `pre_order_message`

## Files Changed

### Implementation Files (✅ Implemented)
- `lib/graphql-client/src/queries/product.tada.ts` - New queries ✅
- `lib/graphql-client/src/queries/locales.tada.ts` - New file ✅
- `lib/graphql-client/src/queries/index.ts` - Exports ✅
- `lib/graphql-client/src/client.ts` - New methods ✅
- `app/api/product/[pid]/route.ts` - GET and PUT handlers ✅
- `app/api/channels/route.ts` - Locales query ✅

### Documentation Files (Included)
- `SUGGESTED_CHANGES.md` - Complete implementation guide
- `CODE_REVIEW.md` - Detailed code review
- `PR_CODE_REVIEW.md` - PR-specific code review
- `LOCAL_TESTING_GUIDE.md` - Testing instructions
- `QUICK_START_TESTING.md` - Quick testing reference

### Bug Fixes (Already Implemented)
- `app/api/load/route.ts` - App extension authentication fix
- `app/products/[pid]/page.tsx` - App extension loading fix
- `app/products/[pid]/page.test.tsx` - Test coverage

## Testing

### Test Checklist

- [ ] Test product translation query with new API
- [ ] Test product translation update with new API
- [ ] Test basic field deletion with new API
- [ ] Test channel locales query with GraphQL
- [ ] Verify options/modifiers still work (using old API)
- [ ] Verify custom fields still work (using old API)
- [ ] Test app extension authentication (bug fix preserved)
- [ ] Test error scenarios (new API fails, old API fails, both fail)
- [ ] Test with products that have no translations
- [ ] Test with products that have partial translations
- [ ] Performance test (verify parallel calls work correctly)

### Local Testing

See `LOCAL_TESTING_GUIDE.md` and `QUICK_START_TESTING.md` for detailed testing instructions.

## Breaking Changes

**None** - This maintains full backward compatibility. The implementation uses a hybrid approach where:
- Old methods are preserved for options/modifiers/customFields
- New methods are used for basic product fields
- Graceful fallback ensures no breaking changes

## Code Review Status

✅ **Code Review Complete**

All critical issues have been addressed:
- ✅ Error handling for new API call
- ✅ Complete return data in PUT handler
- ✅ Partial update failure handling
- ✅ Field removal strategy (uses new API)
- ✅ Client method pattern consistency
- ✅ Input validation

See `PR_CODE_REVIEW.md` for detailed review findings.

## Next Steps

1. ✅ Code review completed
2. ✅ **Implementation** - All changes from `SUGGESTED_CHANGES.md` have been applied
3. ⏳ **Testing** - Test with real BigCommerce store (see `LOCAL_TESTING_GUIDE.md`)
4. ⏳ **Deploy** - Deploy to staging environment
5. ⏳ **Production** - Deploy to production

## Related Issues

- Addresses migration to new Translations Admin GraphQL API
- Preserves app extension authentication bug fix
- Maintains backward compatibility

## Documentation

- [BigCommerce Translations API Docs](https://developer.bigcommerce.com/docs/store-operations/translations/product)
- [BigCommerce Locales API Docs](https://developer.bigcommerce.com/docs/store-operations/settings/locales)

---

**Status**: ✅ **All implementation complete** - This PR includes both the implementation plan/documentation AND the actual code changes. All changes have been reviewed, implemented, and are ready for testing.

