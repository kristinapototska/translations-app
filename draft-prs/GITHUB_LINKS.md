# GitHub Quick Links for PR Creation

## Step 1: Create Branches First

**Important:** You must create the branches first before creating PRs. Use these links to create branches:

### PR #1: GraphQL Schema
**Repository:** `bigcommerce/graphql-schema` (update if different)  
**Branch:** `feat/add-categories-app-extension-model`

**Step 1a: Create Branch (if repository uses 'main'):**
```
https://github.com/bigcommerce/graphql-schema/new/feat/add-categories-app-extension-model?filename=README.md
```

**Step 1b: Create Branch (if repository uses 'master'):**
```
https://github.com/bigcommerce/graphql-schema/new/feat/add-categories-app-extension-model?filename=README.md&base=master
```

**Step 2: After branch exists, create PR:**
```
https://github.com/bigcommerce/graphql-schema/compare/main...feat/add-categories-app-extension-model?expand=1&title=Add%20CATEGORIES%20to%20AppExtensionModel%20enum
```

**Alternative: Direct PR Creation Page:**
```
https://github.com/bigcommerce/graphql-schema/compare
```
Then select `main` → `feat/add-categories-app-extension-model` from dropdowns

---

### PR #2: App Extensions Service
**Repository:** `bigcommerce/app-extensions-service` (update if different)  
**Branch:** `feat/add-categories-model-support`

**Step 1: Create Branch:**
```
https://github.com/bigcommerce/app-extensions-service/new/feat/add-categories-model-support?filename=README.md
```

**Step 2: After branch exists, create PR:**
```
https://github.com/bigcommerce/app-extensions-service/compare/main...feat/add-categories-model-support?expand=1&title=Add%20CATEGORIES%20model%20support%20to%20App%20Extensions%20service
```

**Alternative: Direct PR Creation Page:**
```
https://github.com/bigcommerce/app-extensions-service/compare
```

---

### PR #3: Category Manager - List Page
**Repository:** `bigcommerce/category-manager` (update if different)  
**Branch:** `feat/add-app-extensions-to-category-list`

**Step 1: Create Branch:**
```
https://github.com/bigcommerce/category-manager/new/feat/add-app-extensions-to-category-list?filename=README.md
```

**Step 2: After branch exists, create PR:**
```
https://github.com/bigcommerce/category-manager/compare/main...feat/add-app-extensions-to-category-list?expand=1&title=Add%20App%20Extensions%20support%20to%20Category%20List%20page
```

**Alternative: Direct PR Creation Page:**
```
https://github.com/bigcommerce/category-manager/compare
```

---

### PR #4: Category Manager - Detail Page
**Repository:** `bigcommerce/category-manager` (update if different)  
**Branch:** `feat/add-app-extensions-to-category-detail`

**Step 1: Create Branch:**
```
https://github.com/bigcommerce/category-manager/new/feat/add-app-extensions-to-category-detail?filename=README.md
```

**Step 2: After branch exists, create PR:**
```
https://github.com/bigcommerce/category-manager/compare/main...feat/add-app-extensions-to-category-detail?expand=1&title=Add%20App%20Extensions%20support%20to%20Category%20Detail/Edit%20page
```

**Alternative: Direct PR Creation Page:**
```
https://github.com/bigcommerce/category-manager/compare
```

---

### PR #5: Shared Components
**Repository:** `bigcommerce/shared-components` (update if different)  
**Branch:** `feat/update-app-extensions-for-categories`

**Step 1: Create Branch:**
```
https://github.com/bigcommerce/shared-components/new/feat/update-app-extensions-for-categories?filename=README.md
```

**Step 2: After branch exists, create PR:**
```
https://github.com/bigcommerce/shared-components/compare/main...feat/update-app-extensions-for-categories?expand=1&title=Update%20App%20Extensions%20components%20to%20support%20CATEGORIES
```

**Alternative: Direct PR Creation Page:**
```
https://github.com/bigcommerce/shared-components/compare
```

---

## Quick Copy-Paste Commands

### For GitHub CLI Users

Copy and paste these commands (update repo paths first):

```bash
# PR #1: GraphQL Schema
cd /path/to/graphql-schema && \
git checkout -b feat/add-categories-app-extension-model && \
# Make changes, then:
git add . && git commit -m "feat: add CATEGORIES to AppExtensionModel enum

CATALOG-11279" && \
git push origin feat/add-categories-app-extension-model && \
gh pr create --draft --title "Add CATEGORIES to AppExtensionModel enum" --body-file ../draft-prs/01-graphql-schema-pr.md --base main

# PR #2: App Extensions Service
cd /path/to/app-extensions-service && \
git checkout -b feat/add-categories-model-support && \
# Make changes, then:
git add . && git commit -m "feat: add CATEGORIES model support

CATALOG-11279" && \
git push origin feat/add-categories-model-support && \
gh pr create --draft --title "Add CATEGORIES model support to App Extensions service" --body-file ../draft-prs/02-app-extensions-service-pr.md --base main

# PR #3: Category Manager - List
cd /path/to/category-manager && \
git checkout -b feat/add-app-extensions-to-category-list && \
# Make changes, then:
git add . && git commit -m "feat: add App Extensions to Category List

CATALOG-11279" && \
git push origin feat/add-app-extensions-to-category-list && \
gh pr create --draft --title "Add App Extensions support to Category List page" --body-file ../draft-prs/03-category-manager-list-pr.md --base main

# PR #4: Category Manager - Detail
cd /path/to/category-manager && \
git checkout -b feat/add-app-extensions-to-category-detail && \
# Make changes, then:
git add . && git commit -m "feat: add App Extensions to Category Detail

CATALOG-11279" && \
git push origin feat/add-app-extensions-to-category-detail && \
gh pr create --draft --title "Add App Extensions support to Category Detail/Edit page" --body-file ../draft-prs/04-category-manager-detail-pr.md --base main

# PR #5: Shared Components
cd /path/to/shared-components && \
git checkout -b feat/update-app-extensions-for-categories && \
# Make changes, then:
git add . && git commit -m "feat: update App Extensions for CATEGORIES

CATALOG-11279" && \
git push origin feat/update-app-extensions-for-categories && \
gh pr create --draft --title "Update App Extensions components to support CATEGORIES" --body-file ../draft-prs/05-shared-components-pr.md --base main
```

---

## Working Method: Step-by-Step Process

### Recommended Approach

1. **Go to each repository's main page**
2. **Click "Branch: main" dropdown** (or "master" if that's the base branch)
3. **Type the branch name** in the search box
4. **Click "Create branch: [name]"** when it appears
5. **Make your code changes** (or create an empty commit)
6. **Go to "Pull requests" tab** → "New pull request"
7. **Select your branch** from the compare dropdown
8. **Fill in PR details** from the corresponding `draft-prs/*-pr.md` file

### Repository Base URLs

Update these with your actual repository names:

- **GraphQL Schema**: `https://github.com/[org]/[graphql-schema-repo]`
- **App Extensions Service**: `https://github.com/[org]/[app-extensions-service-repo]`
- **Category Manager**: `https://github.com/[org]/[category-manager-repo]`
- **Shared Components**: `https://github.com/[org]/[shared-components-repo]`

### Quick Branch Creation (Alternative)

If the `/new/` links don't work, use the repository's branch creation UI:

1. Go to repository: `https://github.com/[org]/[repo]`
2. Click the branch dropdown (shows current branch name)
3. Type new branch name
4. Press Enter or click "Create branch"

---

## PR Template Body (Copy-Paste Ready)

When creating PRs via web interface, copy this template and fill in the details:

```markdown
## Related Jira
- Story: [CATALOG-11279](https://bigcommercecloud.atlassian.net/browse/CATALOG-11279)
- Task: [CATALOG-XXXXX](https://bigcommercecloud.atlassian.net/browse/CATALOG-XXXXX) (Update with actual task key)

## Description
[Copy from corresponding PR description file in draft-prs/]

## Changes
- [List key changes]

## Testing
- [ ] [Add test checklist from PR description]

## Checklist
- [ ] Code changes complete
- [ ] Tests added
- [ ] Documentation updated
- [ ] Jira task linked
```

---

## Repository Quick Links

- **GraphQL Schema**: https://github.com/bigcommerce/graphql-schema
- **App Extensions Service**: https://github.com/bigcommerce/app-extensions-service
- **Category Manager**: https://github.com/bigcommerce/category-manager
- **Shared Components**: https://github.com/bigcommerce/shared-components

---

## Tips

1. **Bookmark this page** for quick access to all links
2. **Use GitHub CLI** for fastest PR creation
3. **Create branches first**, then use compare links
4. **Copy PR descriptions** from `draft-prs/*-pr.md` files
5. **Update Jira task keys** after creating tasks

