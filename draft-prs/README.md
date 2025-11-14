# Draft PRs for CATEGORIES App Extensions Support

This directory contains draft PR descriptions and code changes for adding CATEGORIES model support to BigCommerce App Extensions.

## Structure

```
draft-prs/
├── README.md                          # This file
├── PR_SUMMARY.md                      # Overview of all PRs
├── 01-graphql-schema-pr.md            # PR #1: GraphQL Schema
├── 02-app-extensions-service-pr.md    # PR #2: Backend Service
├── 03-category-manager-list-pr.md     # PR #3: Category List Page
├── 04-category-manager-detail-pr.md   # PR #4: Category Detail/Edit Page
├── 05-shared-components-pr.md        # PR #5: Shared Components
└── code-changes/                      # Example code files
    ├── 01-graphql-schema-changes.graphql
    ├── 02-service-model-registry.ts
    ├── 02-service-validation.ts
    ├── 03-category-list-component.tsx
    ├── 03-category-table-row.tsx
    ├── 04-category-detail-page.tsx
    ├── 05-use-app-extensions-hook.ts
    ├── 05-app-extension-renderer.tsx
    └── 05-types-app-extension.ts
```

## How to Use

### 1. Review PR Descriptions

Each PR file (e.g., `01-graphql-schema-pr.md`) contains:
- Description of changes
- Implementation details
- Testing requirements
- Checklist

### 2. Review Code Changes

The `code-changes/` directory contains example code files showing the actual changes needed. These are reference implementations that should be adapted to your actual codebase structure.

### 3. Create PRs

1. **PR #1 - GraphQL Schema**: Create PR in GraphQL schema repository
   - Use `01-graphql-schema-pr.md` as PR description
   - Apply changes from `code-changes/01-graphql-schema-changes.graphql`

2. **PR #2 - App Extensions Service**: Create PR in backend service repository
   - Use `02-app-extensions-service-pr.md` as PR description
   - Apply changes from `code-changes/02-service-*.ts` files

3. **PR #3 - Category List**: Create PR in category-manager repository
   - Use `03-category-manager-list-pr.md` as PR description
   - Apply changes from `code-changes/03-category-*.tsx` files

4. **PR #4 - Category Detail**: Create PR in category-manager repository
   - Use `04-category-manager-detail-pr.md` as PR description
   - Apply changes from `code-changes/04-category-detail-page.tsx`

5. **PR #5 - Shared Components**: Create PR in shared components repository
   - Use `05-shared-components-pr.md` as PR description
   - Apply changes from `code-changes/05-*.ts` and `05-*.tsx` files

## Implementation Order

1. **PR #1** (GraphQL Schema) - Must be merged first
2. **PR #2** (Service) - Depends on PR #1
3. **PR #5** (Shared Components) - Can be done in parallel with PR #2
4. **PR #3** (Category List) - Depends on PR #5
5. **PR #4** (Category Detail) - Depends on PR #5

## Key Features

- ✅ Supports both PANEL and LINK contexts automatically
- ✅ Works on both category list and detail/edit pages
- ✅ URL templating replaces `${id}` with category ID
- ✅ Context parameter encoding for app authentication
- ✅ Backward compatible with existing models

## Testing Checklist

- [ ] GraphQL schema validates with CATEGORIES enum
- [ ] Backend accepts and processes CATEGORIES extensions
- [ ] Extensions appear on category list page
- [ ] Extensions appear on category detail/edit page
- [ ] PANEL context opens side panel correctly
- [ ] LINK context navigates correctly
- [ ] URL templating works with category IDs
- [ ] Context parameter encoding/decoding works

## Notes

- File paths in code examples are suggestions - adjust to match your actual repository structure
- Some components may need additional props or configuration
- Context encoding/decoding implementation depends on your auth system
- Panel and link components may need additional styling or configuration

