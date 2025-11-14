# Draft PRs: Adding CATEGORIES Support to App Extensions

## Related Jira
- Story: [CATALOG-11279](https://bigcommercecloud.atlassian.net/browse/CATALOG-11279)

## Overview

This document lists all draft PRs needed to add CATEGORIES model support to BigCommerce App Extensions. Each PR targets a specific repository and includes the necessary code changes.

See [JIRA_TASK_MAPPING.md](./JIRA_TASK_MAPPING.md) for task breakdown and dependencies.

## PRs to Create

### 1. GraphQL Schema Repository
**Repository:** `bigcommerce/graphql-schema` (or equivalent)
**PR:** `draft-prs/01-graphql-schema-pr.md`
**Jira Task:** CATALOG-XXXXX (GraphQL Schema Update - to be created)
**Changes:** Add CATEGORIES to AppExtensionModel enum

### 2. App Extensions Service Repository
**Repository:** `bigcommerce/app-extensions-service` (or equivalent backend service)
**PR:** `draft-prs/02-app-extensions-service-pr.md`
**Jira Task:** CATALOG-XXXXX (Backend Service Updates - to be created)
**Changes:** Backend model registration, validation, and query logic

### 3. Category Manager - List Page Integration
**Repository:** `bigcommerce/category-manager`
**PR:** `draft-prs/03-category-manager-list-pr.md`
**Jira Task:** CATALOG-XXXXX (Category List Page Integration - to be created)
**Changes:** Add App Extensions to category list/table component

### 4. Category Manager - Detail/Edit Page Integration
**Repository:** `bigcommerce/category-manager`
**PR:** `draft-prs/04-category-manager-detail-pr.md`
**Jira Task:** CATALOG-XXXXX (Category Detail/Edit Page Integration - to be created)
**Changes:** Add App Extensions to category detail/edit page

### 5. Shared Components - Hooks and Renderers
**Repository:** `bigcommerce/shared-components` (or equivalent)
**PR:** `draft-prs/05-shared-components-pr.md`
**Jira Task:** CATALOG-XXXXX (Shared Components Update - to be created)
**Changes:** Update useAppExtensions hook and AppExtensionRenderer component

## Implementation Order

1. **GraphQL Schema** (PR #1) - Must be merged first
2. **App Extensions Service** (PR #2) - Depends on PR #1
3. **Shared Components** (PR #5) - Can be done in parallel with PR #2
4. **Category Manager - List** (PR #3) - Depends on PR #5
5. **Category Manager - Detail** (PR #4) - Depends on PR #5

## Testing Checklist

- [ ] GraphQL schema validates with CATEGORIES enum
- [ ] Backend accepts and processes CATEGORIES extensions
- [ ] Extensions appear on category list page
- [ ] Extensions appear on category detail/edit page
- [ ] PANEL context opens side panel correctly
- [ ] LINK context navigates correctly
- [ ] URL templating works with category IDs
- [ ] Context parameter encoding/decoding works

