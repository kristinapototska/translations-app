# Add Functional Tests for API Migration

## Summary

This PR adds comprehensive functional tests for the API migration to the new BigCommerce Translations Admin GraphQL API. The tests cover all new functionality, error scenarios, edge cases, and ensure backward compatibility.

## Test Files Added

### 1. `app/api/product/[pid]/route.test.ts`
Comprehensive tests for the product translation API route:
- **GET Handler Tests**: New API integration, graceful fallback, parallel calls, hybrid approach
- **PUT Handler Tests**: Basic field updates/deletions, custom field deletions, error handling, complete return data

### 2. `app/api/channels/route.test.ts`
Tests for the channels API route using GraphQL:
- GraphQL locales query
- Error handling and fallbacks
- Data structure validation

### 3. `lib/graphql-client/src/client.test.ts`
Unit tests for GraphQL client methods:
- `getProductTranslations()`
- `updateProductTranslations()`
- `deleteProductTranslations()`
- `deleteCustomFieldTranslations()` (with `PRODUCT_CUSTOM_FIELDS`)
- `getChannelLocales()`

### 4. `TEST_COVERAGE_API_MIGRATION.md`
Documentation of test coverage and scenarios

## Test Coverage

### ✅ Success Scenarios
- Basic field updates via new API
- Basic field deletions via new API
- Custom field deletions via new API (`PRODUCT_CUSTOM_FIELDS`)
- Locales query via GraphQL
- Hybrid approach (new API + old API)
- Complete data return in responses

### ✅ Error Scenarios
- New API failure with graceful fallback
- Old API failure with graceful handling
- Both APIs fail (handled gracefully)
- Deletion failures (handled gracefully)
- Missing data handling

### ✅ Edge Cases
- Products with no translations
- Products with partial translations
- Empty locales array
- Multiple field deletions
- Multiple custom field deletions
- Partial updates

### ✅ Performance
- Parallel API calls verification
- Efficient data transformation

## Test Framework

- **Framework**: Vitest
- **Assertions**: Vitest expect API
- **Mocks**: Vitest vi.mock()
- **Pattern**: Follows existing test patterns in codebase

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test app/api/product/[pid]/route.test.ts

# Run with coverage
npm test -- --coverage
```

## Test Statistics

- **Total Test Files**: 3
- **Total Test Cases**: 30+
- **Coverage Areas**: API routes, GraphQL client, error handling, edge cases

## Related PR

This PR complements the main implementation PR:
- **Implementation PR**: `feat/migrate-to-new-translations-api`
- **Tests PR**: `feat/add-functional-tests-for-api-migration` (this PR)

## Benefits

1. ✅ **Confidence**: Comprehensive test coverage ensures the migration works correctly
2. ✅ **Regression Prevention**: Tests catch breaking changes
3. ✅ **Documentation**: Tests serve as usage examples
4. ✅ **Quality Assurance**: Validates error handling and edge cases
5. ✅ **Performance Verification**: Tests verify parallel API calls

## Next Steps

1. ✅ Tests created and committed
2. ⏳ Run tests in CI/CD pipeline
3. ⏳ Verify test coverage meets requirements
4. ⏳ Review and merge after implementation PR

---

**Status**: ✅ **Ready for Review** - All tests implemented and ready for CI/CD integration

