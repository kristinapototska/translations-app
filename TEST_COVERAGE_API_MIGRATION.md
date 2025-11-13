# Test Coverage for API Migration

## Overview

This document describes the functional tests added for the migration to the new BigCommerce Translations Admin GraphQL API.

## Test Files

### 1. `app/api/product/[pid]/route.test.ts`

Tests for the product translation API route (GET and PUT handlers).

#### GET Handler Tests
- ✅ Fetch product translations using new API
- ✅ Graceful fallback to old API if new API fails
- ✅ Handle products with no translations
- ✅ Parallel API calls for better performance
- ✅ Hybrid approach: combine new API (basic fields) with old API (options/modifiers)

#### PUT Handler Tests
- ✅ Update basic fields using new API
- ✅ Handle partial updates gracefully
- ✅ Delete basic fields using new API `deleteTranslations`
- ✅ Handle multiple field deletions
- ✅ Delete custom fields using new API with `PRODUCT_CUSTOM_FIELDS`
- ✅ Handle multiple custom field deletions
- ✅ Error handling: new API failure graceful handling
- ✅ Error handling: deletion failure graceful handling
- ✅ Complete return data including options/modifiers/customFields

### 2. `app/api/channels/route.test.ts`

Tests for the channels API route using GraphQL locales query.

#### Tests
- ✅ Fetch locales using new GraphQL API
- ✅ Handle empty locales array
- ✅ Include locale titles from hardcoded list
- ✅ Handle GraphQL API failure gracefully
- ✅ Return locales with correct structure

### 3. `lib/graphql-client/src/client.test.ts`

Tests for GraphQL client methods.

#### Product Translations Methods
- ✅ `getProductTranslations`: Fetch with correct parameters
- ✅ `getProductTranslations`: Error handling when data is missing
- ✅ `updateProductTranslations`: Update with correct parameters
- ✅ `updateProductTranslations`: Error handling when update fails
- ✅ `deleteProductTranslations`: Delete with correct parameters
- ✅ `deleteProductTranslations`: Error handling when deletion fails

#### Custom Field Methods
- ✅ `deleteCustomFieldTranslations`: Delete with `PRODUCT_CUSTOM_FIELDS`
- ✅ `deleteCustomFieldTranslations`: Handle multiple custom field deletions

#### Locales Methods
- ✅ `getChannelLocales`: Fetch using GraphQL
- ✅ `getChannelLocales`: Map `isDefault` to `is_default`
- ✅ `getChannelLocales`: Error handling when data is missing

## Test Scenarios Covered

### Success Scenarios
1. ✅ Basic field updates via new API
2. ✅ Basic field deletions via new API
3. ✅ Custom field deletions via new API
4. ✅ Locales query via GraphQL
5. ✅ Hybrid approach (new API + old API)
6. ✅ Complete data return in responses

### Error Scenarios
1. ✅ New API failure with graceful fallback
2. ✅ Old API failure with graceful handling
3. ✅ Both APIs fail (handled gracefully)
4. ✅ Deletion failures (handled gracefully)
5. ✅ Missing data handling

### Edge Cases
1. ✅ Products with no translations
2. ✅ Products with partial translations
3. ✅ Empty locales array
4. ✅ Multiple field deletions
5. ✅ Multiple custom field deletions
6. ✅ Partial updates

### Performance
1. ✅ Parallel API calls verification
2. ✅ Efficient data transformation

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test app/api/product/[pid]/route.test.ts

# Run with coverage
npm test -- --coverage
```

## Test Framework

- **Framework**: Vitest
- **Assertions**: Vitest expect API
- **Mocks**: Vitest vi.mock()
- **Pattern**: Follows existing test patterns in codebase

## Coverage Goals

- ✅ All new API methods tested
- ✅ All error scenarios covered
- ✅ All edge cases handled
- ✅ Integration tests for API routes
- ✅ Unit tests for client methods

## Notes

- Tests use mocks for external dependencies (GraphQL client, auth, etc.)
- Tests verify both success and failure paths
- Tests ensure backward compatibility
- Tests verify graceful degradation
- Tests check complete data return

