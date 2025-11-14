# Quick PR Creation Guide

This guide provides GitHub links and commands to quickly create draft PRs for all 5 repositories.

## Prerequisites

1. **GitHub CLI installed and authenticated**
   ```bash
   gh auth login
   ```

2. **Repositories cloned locally** (or use GitHub web interface)

## Method 1: Using GitHub CLI (Fastest)

### PR #1: GraphQL Schema

```bash
# Navigate to repository
cd /path/to/graphql-schema-repo

# Create and checkout branch
git checkout -b feat/add-categories-app-extension-model

# Make changes (add CATEGORIES to enum in schema/app-extension.graphql)
# ... edit file ...

# Commit and push
git add schema/app-extension.graphql
git commit -m "feat: add CATEGORIES to AppExtensionModel enum

CATALOG-11279"
git push origin feat/add-categories-app-extension-model

# Create draft PR
gh pr create --draft \
  --title "Add CATEGORIES to AppExtensionModel enum" \
  --body-file ../draft-prs/01-graphql-schema-pr.md \
  --base main \
  --repo bigcommerce/graphql-schema
```

**Direct PR Link** (after branch is pushed):
```
https://github.com/bigcommerce/graphql-schema/compare/main...feat/add-categories-app-extension-model?quick_pull=1&title=Add%20CATEGORIES%20to%20AppExtensionModel%20enum&body=See%20draft-prs/01-graphql-schema-pr.md
```

---

### PR #2: App Extensions Service

```bash
# Navigate to repository
cd /path/to/app-extensions-service-repo

# Create and checkout branch
git checkout -b feat/add-categories-model-support

# Make changes (update model registry, validation, etc.)
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: add CATEGORIES model support to App Extensions service

CATALOG-11279"
git push origin feat/add-categories-model-support

# Create draft PR
gh pr create --draft \
  --title "Add CATEGORIES model support to App Extensions service" \
  --body-file ../draft-prs/02-app-extensions-service-pr.md \
  --base main \
  --repo bigcommerce/app-extensions-service
```

**Direct PR Link** (after branch is pushed):
```
https://github.com/bigcommerce/app-extensions-service/compare/main...feat/add-categories-model-support?quick_pull=1&title=Add%20CATEGORIES%20model%20support%20to%20App%20Extensions%20service&body=See%20draft-prs/02-app-extensions-service-pr.md
```

---

### PR #3: Category Manager - List Page

```bash
# Navigate to repository
cd /path/to/category-manager-repo

# Create and checkout branch
git checkout -b feat/add-app-extensions-to-category-list

# Make changes (add extensions to category list component)
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: add App Extensions support to Category List page

CATALOG-11279"
git push origin feat/add-app-extensions-to-category-list

# Create draft PR
gh pr create --draft \
  --title "Add App Extensions support to Category List page" \
  --body-file ../draft-prs/03-category-manager-list-pr.md \
  --base main \
  --repo bigcommerce/category-manager
```

**Direct PR Link** (after branch is pushed):
```
https://github.com/bigcommerce/category-manager/compare/main...feat/add-app-extensions-to-category-list?quick_pull=1&title=Add%20App%20Extensions%20support%20to%20Category%20List%20page&body=See%20draft-prs/03-category-manager-list-pr.md
```

---

### PR #4: Category Manager - Detail Page

```bash
# Navigate to repository (same as PR #3)
cd /path/to/category-manager-repo

# Create and checkout branch
git checkout -b feat/add-app-extensions-to-category-detail

# Make changes (add extensions to category detail/edit page)
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: add App Extensions support to Category Detail/Edit page

CATALOG-11279"
git push origin feat/add-app-extensions-to-category-detail

# Create draft PR
gh pr create --draft \
  --title "Add App Extensions support to Category Detail/Edit page" \
  --body-file ../draft-prs/04-category-manager-detail-pr.md \
  --base main \
  --repo bigcommerce/category-manager
```

**Direct PR Link** (after branch is pushed):
```
https://github.com/bigcommerce/category-manager/compare/main...feat/add-app-extensions-to-category-detail?quick_pull=1&title=Add%20App%20Extensions%20support%20to%20Category%20Detail/Edit%20page&body=See%20draft-prs/04-category-manager-detail-pr.md
```

---

### PR #5: Shared Components

```bash
# Navigate to repository
cd /path/to/shared-components-repo

# Create and checkout branch
git checkout -b feat/update-app-extensions-for-categories

# Make changes (update hooks and components)
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: update App Extensions components to support CATEGORIES

CATALOG-11279"
git push origin feat/update-app-extensions-for-categories

# Create draft PR
gh pr create --draft \
  --title "Update App Extensions components to support CATEGORIES" \
  --body-file ../draft-prs/05-shared-components-pr.md \
  --base main \
  --repo bigcommerce/shared-components
```

**Direct PR Link** (after branch is pushed):
```
https://github.com/bigcommerce/shared-components/compare/main...feat/update-app-extensions-for-categories?quick_pull=1&title=Update%20App%20Extensions%20components%20to%20support%20CATEGORIES&body=See%20draft-prs/05-shared-components-pr.md
```

---

## Method 2: Using GitHub Web Interface

### Step-by-Step for Each PR

1. **Create Branch on GitHub**
   - Go to repository
   - Click "Branch: main" dropdown
   - Type branch name (e.g., `feat/add-categories-app-extension-model`)
   - Click "Create branch: feat/..."

2. **Create File/Edit Files**
   - Create or edit files using GitHub web editor
   - Copy code from `draft-prs/code-changes/` directory

3. **Commit Changes**
   - Add commit message: `feat: add CATEGORIES support CATALOG-11279`
   - Commit directly to your branch

4. **Create PR**
   - Click "Contribute" → "Open Pull Request"
   - Or use the direct links below (after branch exists)

### Direct PR Creation Links

**Note:** These links work after the branch is created and pushed.

#### PR #1: GraphQL Schema
```
https://github.com/bigcommerce/graphql-schema/compare/main...feat/add-categories-app-extension-model?expand=1&title=Add%20CATEGORIES%20to%20AppExtensionModel%20enum&body=See%20draft-prs/01-graphql-schema-pr.md&labels=draft
```

#### PR #2: App Extensions Service
```
https://github.com/bigcommerce/app-extensions-service/compare/main...feat/add-categories-model-support?expand=1&title=Add%20CATEGORIES%20model%20support%20to%20App%20Extensions%20service&body=See%20draft-prs/02-app-extensions-service-pr.md&labels=draft
```

#### PR #3: Category Manager - List
```
https://github.com/bigcommerce/category-manager/compare/main...feat/add-app-extensions-to-category-list?expand=1&title=Add%20App%20Extensions%20support%20to%20Category%20List%20page&body=See%20draft-prs/03-category-manager-list-pr.md&labels=draft
```

#### PR #4: Category Manager - Detail
```
https://github.com/bigcommerce/category-manager/compare/main...feat/add-app-extensions-to-category-detail?expand=1&title=Add%20App%20Extensions%20support%20to%20Category%20Detail/Edit%20page&body=See%20draft-prs/04-category-manager-detail-pr.md&labels=draft
```

#### PR #5: Shared Components
```
https://github.com/bigcommerce/shared-components/compare/main...feat/update-app-extensions-for-categories?expand=1&title=Update%20App%20Extensions%20components%20to%20support%20CATEGORIES&body=See%20draft-prs/05-shared-components-pr.md&labels=draft
```

---

## Method 3: Automated Script

Save this as `create-all-prs.sh` and run it:

```bash
#!/bin/bash

# Configuration
REPO_BASE="/path/to/repos"  # Update this path
PR_DESCRIPTIONS="../draft-prs"  # Path to PR description files

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating all draft PRs for CATEGORIES App Extensions...${NC}\n"

# PR #1: GraphQL Schema
echo -e "${GREEN}PR #1: GraphQL Schema${NC}"
cd "${REPO_BASE}/graphql-schema"
git checkout -b feat/add-categories-app-extension-model
# Make your changes here
git add .
git commit -m "feat: add CATEGORIES to AppExtensionModel enum

CATALOG-11279"
git push origin feat/add-categories-app-extension-model
gh pr create --draft \
  --title "Add CATEGORIES to AppExtensionModel enum" \
  --body-file "${PR_DESCRIPTIONS}/01-graphql-schema-pr.md" \
  --base main
echo ""

# PR #2: App Extensions Service
echo -e "${GREEN}PR #2: App Extensions Service${NC}"
cd "${REPO_BASE}/app-extensions-service"
git checkout -b feat/add-categories-model-support
# Make your changes here
git add .
git commit -m "feat: add CATEGORIES model support to App Extensions service

CATALOG-11279"
git push origin feat/add-categories-model-support
gh pr create --draft \
  --title "Add CATEGORIES model support to App Extensions service" \
  --body-file "${PR_DESCRIPTIONS}/02-app-extensions-service-pr.md" \
  --base main
echo ""

# PR #3: Category Manager - List
echo -e "${GREEN}PR #3: Category Manager - List${NC}"
cd "${REPO_BASE}/category-manager"
git checkout -b feat/add-app-extensions-to-category-list
# Make your changes here
git add .
git commit -m "feat: add App Extensions support to Category List page

CATALOG-11279"
git push origin feat/add-app-extensions-to-category-list
gh pr create --draft \
  --title "Add App Extensions support to Category List page" \
  --body-file "${PR_DESCRIPTIONS}/03-category-manager-list-pr.md" \
  --base main
echo ""

# PR #4: Category Manager - Detail
echo -e "${GREEN}PR #4: Category Manager - Detail${NC}"
cd "${REPO_BASE}/category-manager"
git checkout -b feat/add-app-extensions-to-category-detail
# Make your changes here
git add .
git commit -m "feat: add App Extensions support to Category Detail/Edit page

CATALOG-11279"
git push origin feat/add-app-extensions-to-category-detail
gh pr create --draft \
  --title "Add App Extensions support to Category Detail/Edit page" \
  --body-file "${PR_DESCRIPTIONS}/04-category-manager-detail-pr.md" \
  --base main
echo ""

# PR #5: Shared Components
echo -e "${GREEN}PR #5: Shared Components${NC}"
cd "${REPO_BASE}/shared-components"
git checkout -b feat/update-app-extensions-for-categories
# Make your changes here
git add .
git commit -m "feat: update App Extensions components to support CATEGORIES

CATALOG-11279"
git push origin feat/update-app-extensions-for-categories
gh pr create --draft \
  --title "Update App Extensions components to support CATEGORIES" \
  --body-file "${PR_DESCRIPTIONS}/05-shared-components-pr.md" \
  --base main
echo ""

echo -e "${GREEN}All PRs created!${NC}"
```

---

## Quick Reference: Branch Names

| PR # | Branch Name | Repository |
|------|-------------|------------|
| 1 | `feat/add-categories-app-extension-model` | graphql-schema |
| 2 | `feat/add-categories-model-support` | app-extensions-service |
| 3 | `feat/add-app-extensions-to-category-list` | category-manager |
| 4 | `feat/add-app-extensions-to-category-detail` | category-manager |
| 5 | `feat/update-app-extensions-for-categories` | shared-components |

---

## Tips

1. **Update Task Keys**: After creating tasks in Jira, update the `CATALOG-XXXXX` placeholders in PR descriptions
2. **Add Labels**: Consider adding labels like `app-extensions`, `categories`, `draft`
3. **Link Dependencies**: Use GitHub's "Linked Issues" feature to link related PRs
4. **Review Order**: Create PRs in order (1 → 2,5 → 3,4) to set up dependencies correctly

---

## Troubleshooting

**Issue**: `gh pr create` fails with "no changes"
- **Solution**: Make sure you've committed changes to the branch

**Issue**: Branch doesn't exist
- **Solution**: Create and push the branch first, then create PR

**Issue**: PR description file not found
- **Solution**: Use absolute path or ensure you're in the correct directory

