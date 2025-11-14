# [Draft] Add CATEGORIES to AppExtensionModel enum

## Related Jira
- Story: [CATALOG-11279](https://bigcommercecloud.atlassian.net/browse/CATALOG-11279)
- Task: [CATALOG-XXXXX](https://bigcommercecloud.atlassian.net/browse/CATALOG-XXXXX) (GraphQL Schema Update - to be created)

## Description

This PR adds `CATEGORIES` as a new supported model type in the App Extensions GraphQL schema, enabling apps to register extensions that appear on category-related pages in the BigCommerce control panel.

## Changes

### GraphQL Schema Update

**File:** `schema/app-extension.graphql` (or equivalent schema file)

```graphql
enum AppExtensionModel {
  CUSTOMERS
  ORDERS
  PRODUCTS
  PRODUCT_DESCRIPTION
  CATEGORIES  # NEW
}
```

## Implementation Details

- Added `CATEGORIES` to the `AppExtensionModel` enum
- This enum value will be used by apps to register extensions for category pages
- The extension will appear on both category list and detail/edit pages

## Testing

- [ ] Verify GraphQL schema validates correctly
- [ ] Test that `CATEGORIES` can be used in `createAppExtension` mutation
- [ ] Test that `CATEGORIES` can be queried in `getAppExtensions` query
- [ ] Verify backward compatibility with existing models (PRODUCTS, CUSTOMERS, ORDERS)

## Related Issues

- Related to: [Issue #XXX - Add CATEGORIES support to App Extensions]

## Checklist

- [ ] GraphQL schema updated
- [ ] Schema validation passes
- [ ] Documentation updated (if applicable)
- [ ] Migration/version bump (if applicable)

