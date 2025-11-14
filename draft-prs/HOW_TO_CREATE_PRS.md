# How to Create PRs from Draft PRs

This guide explains how to create actual GitHub PRs from the draft PR files.

## Option 1: Using GitHub CLI

### Prerequisites
```bash
# Install GitHub CLI if not already installed
brew install gh  # macOS
# or
# Download from https://cli.github.com/

# Authenticate
gh auth login
```

### Create PR #1: GraphQL Schema

```bash
# Navigate to GraphQL schema repository
cd /path/to/graphql-schema-repo

# Create and checkout new branch
git checkout -b feat/add-categories-app-extension-model

# Make changes (copy from draft-prs/code-changes/01-graphql-schema-changes.graphql)
# Edit schema/app-extension.graphql and add CATEGORIES to enum

# Commit changes
git add schema/app-extension.graphql
git commit -m "feat: add CATEGORIES to AppExtensionModel enum"

# Push branch
git push origin feat/add-categories-app-extension-model

# Create draft PR
gh pr create --draft \
  --title "Add CATEGORIES to AppExtensionModel enum" \
  --body-file ../draft-prs/01-graphql-schema-pr.md \
  --base main
```

### Create PR #2: App Extensions Service

```bash
# Navigate to service repository
cd /path/to/app-extensions-service-repo

# Create branch
git checkout -b feat/add-categories-model-support

# Apply changes from code-changes/02-service-*.ts files
# Commit and push

# Create draft PR
gh pr create --draft \
  --title "Add CATEGORIES model support to App Extensions service" \
  --body-file ../draft-prs/02-app-extensions-service-pr.md \
  --base main
```

### Create PR #3: Category List Page

```bash
# Navigate to category-manager repository
cd /path/to/category-manager-repo

# Create branch
git checkout -b feat/add-app-extensions-to-category-list

# Apply changes from code-changes/03-category-*.tsx files
# Commit and push

# Create draft PR
gh pr create --draft \
  --title "Add App Extensions support to Category List page" \
  --body-file ../draft-prs/03-category-manager-list-pr.md \
  --base main
```

### Create PR #4: Category Detail Page

```bash
# In same category-manager repository
git checkout -b feat/add-app-extensions-to-category-detail

# Apply changes from code-changes/04-category-detail-page.tsx
# Commit and push

# Create draft PR
gh pr create --draft \
  --title "Add App Extensions support to Category Detail/Edit page" \
  --body-file ../draft-prs/04-category-manager-detail-pr.md \
  --base main
```

### Create PR #5: Shared Components

```bash
# Navigate to shared components repository
cd /path/to/shared-components-repo

# Create branch
git checkout -b feat/update-app-extensions-for-categories

# Apply changes from code-changes/05-*.ts and 05-*.tsx files
# Commit and push

# Create draft PR
gh pr create --draft \
  --title "Update App Extensions components to support CATEGORIES" \
  --body-file ../draft-prs/05-shared-components-pr.md \
  --base main
```

## Option 2: Using GitHub Web Interface

### Steps for Each PR

1. **Create Branch**
   ```bash
   git checkout -b feat/add-categories-support
   ```

2. **Make Changes**
   - Copy code from `draft-prs/code-changes/` files
   - Apply to your repository files
   - Commit changes

3. **Push Branch**
   ```bash
   git push origin feat/add-categories-support
   ```

4. **Create PR on GitHub**
   - Go to repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Copy PR description from corresponding `draft-prs/*-pr.md` file
   - Mark as "Draft"
   - Create PR

## PR Dependencies

When creating PRs, add dependency links:

### PR #2 (Service)
Add to PR description:
```
Depends on: #<PR_NUMBER_1> (GraphQL Schema)
```

### PR #5 (Shared Components)
Add to PR description:
```
Depends on: #<PR_NUMBER_1> (GraphQL Schema)
```

### PR #3 (Category List)
Add to PR description:
```
Depends on: #<PR_NUMBER_1> (GraphQL Schema)
Depends on: #<PR_NUMBER_2> (Service)
Depends on: #<PR_NUMBER_5> (Shared Components)
```

### PR #4 (Category Detail)
Add to PR description:
```
Depends on: #<PR_NUMBER_1> (GraphQL Schema)
Depends on: #<PR_NUMBER_2> (Service)
Depends on: #<PR_NUMBER_5> (Shared Components)
```

## Converting Draft PRs to Ready for Review

Once all dependencies are merged:

```bash
# Mark PR as ready for review
gh pr ready <PR_NUMBER>

# Or via web interface: Click "Ready for review" button
```

## PR Review Checklist

Before marking PRs as ready:

- [ ] All code changes applied
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] PR description complete
- [ ] Dependencies listed
- [ ] Code reviewed by author
- [ ] Linting passes
- [ ] Build passes

## Quick Reference: Repository Mapping

| PR # | Repository | Branch Name | Files Changed |
|------|-----------|-------------|---------------|
| 1 | graphql-schema | `feat/add-categories-app-extension-model` | `schema/app-extension.graphql` |
| 2 | app-extensions-service | `feat/add-categories-model-support` | Service files |
| 3 | category-manager | `feat/add-app-extensions-to-category-list` | List component files |
| 4 | category-manager | `feat/add-app-extensions-to-category-detail` | Detail page files |
| 5 | shared-components | `feat/update-app-extensions-for-categories` | Hook and component files |

