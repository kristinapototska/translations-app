# Jira Task Mapping for CATALOG-11279

## Story
**CATALOG-11279**: Add CATEGORIES model support to App Extensions

## Recommended Task Structure

Based on the 5 PRs created, here are the recommended tasks to create in Jira:

### Task 1: GraphQL Schema Update
**Task Key**: `CATALOG-XXXXX` (to be created)
**PR**: PR #1 - GraphQL Schema
**Repository**: `bigcommerce/graphql-schema` (or equivalent)
**Description**: Add CATEGORIES to AppExtensionModel enum in GraphQL schema
**Acceptance Criteria**:
- [ ] CATEGORIES added to AppExtensionModel enum
- [ ] GraphQL schema validates correctly
- [ ] CATEGORIES can be used in createAppExtension mutation
- [ ] CATEGORIES can be queried in getAppExtensions query
- [ ] Backward compatibility maintained

---

### Task 2: Backend Service Updates
**Task Key**: `CATALOG-XXXXX` (to be created)
**PR**: PR #2 - App Extensions Service
**Repository**: `bigcommerce/app-extensions-service` (or equivalent backend service)
**Description**: Update backend service to support CATEGORIES model (model registry, validation, query logic)
**Acceptance Criteria**:
- [ ] CATEGORIES added to model registry
- [ ] Validation accepts CATEGORIES model
- [ ] Query/filter logic supports CATEGORIES
- [ ] Type definitions updated
- [ ] Unit tests added
- [ ] Integration tests added

---

### Task 3: Category List Page Integration
**Task Key**: `CATALOG-XXXXX` (to be created)
**PR**: PR #3 - Category Manager List
**Repository**: `bigcommerce/category-manager`
**Description**: Add App Extensions support to category list/table component
**Acceptance Criteria**:
- [ ] Extensions appear on category list page
- [ ] List-level extensions render correctly (if applicable)
- [ ] Per-row extensions render correctly (if implemented)
- [ ] PANEL context opens side panel
- [ ] LINK context navigates correctly
- [ ] URL templating works with category IDs
- [ ] Extensions work with filtered/searched categories

---

### Task 4: Category Detail/Edit Page Integration
**Task Key**: `CATALOG-XXXXX` (to be created)
**PR**: PR #4 - Category Manager Detail
**Repository**: `bigcommerce/category-manager`
**Description**: Add App Extensions support to category detail and edit pages
**Acceptance Criteria**:
- [ ] Extensions appear on category detail page
- [ ] Extensions appear on category edit page
- [ ] PANEL context opens side panel with correct URL
- [ ] LINK context navigates to app with correct URL
- [ ] URL templating works correctly
- [ ] Context parameter is properly encoded
- [ ] Extensions work for both new and existing categories

---

### Task 5: Shared Components Update
**Task Key**: `CATALOG-XXXXX` (to be created)
**PR**: PR #5 - Shared Components
**Repository**: `bigcommerce/shared-components` (or equivalent)
**Description**: Update shared App Extensions hooks and components to support CATEGORIES
**Acceptance Criteria**:
- [ ] useAppExtensions hook supports CATEGORIES model
- [ ] AppExtensionRenderer handles CATEGORIES extensions
- [ ] AppExtensionPanel works with categories
- [ ] AppExtensionLink works with categories
- [ ] Type definitions include CATEGORIES
- [ ] URL templating supports category IDs
- [ ] Context parameter encoding/decoding works

---

## Task Dependencies

```
Story: CATALOG-11279
├── Task 1: GraphQL Schema (No dependencies)
├── Task 2: Backend Service (Depends on Task 1)
├── Task 5: Shared Components (Depends on Task 1, can be parallel with Task 2)
├── Task 3: Category List (Depends on Task 1, Task 2, Task 5)
└── Task 4: Category Detail (Depends on Task 1, Task 2, Task 5)
```

## PR to Task Mapping

| PR # | PR Title | Task | Repository |
|------|----------|------|------------|
| 1 | Add CATEGORIES to AppExtensionModel enum | Task 1 | graphql-schema |
| 2 | Add CATEGORIES model support to App Extensions service | Task 2 | app-extensions-service |
| 3 | Add App Extensions support to Category List page | Task 3 | category-manager |
| 4 | Add App Extensions support to Category Detail/Edit page | Task 4 | category-manager |
| 5 | Update shared App Extensions components to support CATEGORIES | Task 5 | shared-components |

## Missing Tasks Check

If you already have tasks created, please verify:

- [ ] Task for GraphQL Schema changes
- [ ] Task for Backend Service updates
- [ ] Task for Category List page integration
- [ ] Task for Category Detail page integration
- [ ] Task for Shared Components updates

If any of these are missing, create them and link to the story CATALOG-11279.

## How to Link PRs to Tasks

When creating PRs, add to the PR description:

```markdown
## Related Jira
- Story: [CATALOG-11279](https://bigcommercecloud.atlassian.net/browse/CATALOG-11279)
- Task: [CATALOG-XXXXX](https://bigcommercecloud.atlassian.net/browse/CATALOG-XXXXX)
```

Or use Jira smart commits in your commit messages:

```
feat: add CATEGORIES to AppExtensionModel enum

CATALOG-11279 CATALOG-XXXXX
```

