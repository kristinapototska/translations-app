# Working GitHub Links for PR Creation

## Important Notes

⚠️ **The direct compare links won't work until branches exist!**

You need to create branches first, then create PRs. Here's the correct workflow:

## Correct Workflow

### Method 1: GitHub Web Interface (Most Reliable)

#### Step 1: Create Branch
1. Go to repository: `https://github.com/[org]/[repo-name]`
2. Click the branch dropdown (shows "main" or "master")
3. Type branch name in the search box
4. Click "Create branch: [name]" when it appears

#### Step 2: Make Changes
- Edit files directly on GitHub, or
- Clone repo, make changes locally, push branch

#### Step 3: Create PR
1. Go to repository → "Pull requests" tab
2. Click "New pull request"
3. Select base: `main` (or `master`)
4. Select compare: `[your-branch-name]`
5. Fill in title and description from `draft-prs/*-pr.md` files

---

## Repository Links (Update with Actual Names)

Replace `[org]` and `[repo-name]` with your actual values:

### PR #1: GraphQL Schema
**Branch:** `feat/add-categories-app-extension-model`

1. **Repository**: `https://github.com/[org]/[graphql-schema-repo]`
2. **Create Branch**: Click branch dropdown → type branch name → create
3. **Create PR**: Pull requests → New PR → select branches

### PR #2: App Extensions Service
**Branch:** `feat/add-categories-model-support`

1. **Repository**: `https://github.com/[org]/[app-extensions-service-repo]`
2. **Create Branch**: Click branch dropdown → type branch name → create
3. **Create PR**: Pull requests → New PR → select branches

### PR #3: Category Manager - List
**Branch:** `feat/add-app-extensions-to-category-list`

1. **Repository**: `https://github.com/[org]/[category-manager-repo]`
2. **Create Branch**: Click branch dropdown → type branch name → create
3. **Create PR**: Pull requests → New PR → select branches

### PR #4: Category Manager - Detail
**Branch:** `feat/add-app-extensions-to-category-detail`

1. **Repository**: `https://github.com/[org]/[category-manager-repo]` (same as #3)
2. **Create Branch**: Click branch dropdown → type branch name → create
3. **Create PR**: Pull requests → New PR → select branches

### PR #5: Shared Components
**Branch:** `feat/update-app-extensions-for-categories`

1. **Repository**: `https://github.com/[org]/[shared-components-repo]`
2. **Create Branch**: Click branch dropdown → type branch name → create
3. **Create PR**: Pull requests → New PR → select branches

---

## Method 2: GitHub CLI (Fastest - Recommended)

This is the most reliable method. Use these commands:

### PR #1: GraphQL Schema
```bash
cd /path/to/graphql-schema-repo
git checkout -b feat/add-categories-app-extension-model
# Make changes, then:
git add .
git commit -m "feat: add CATEGORIES to AppExtensionModel enum

CATALOG-11279"
git push origin feat/add-categories-app-extension-model
gh pr create --draft \
  --title "Add CATEGORIES to AppExtensionModel enum" \
  --body-file ../draft-prs/01-graphql-schema-pr.md \
  --base main
```

### PR #2: App Extensions Service
```bash
cd /path/to/app-extensions-service-repo
git checkout -b feat/add-categories-model-support
# Make changes, then:
git add .
git commit -m "feat: add CATEGORIES model support

CATALOG-11279"
git push origin feat/add-categories-model-support
gh pr create --draft \
  --title "Add CATEGORIES model support to App Extensions service" \
  --body-file ../draft-prs/02-app-extensions-service-pr.md \
  --base main
```

### PR #3: Category Manager - List
```bash
cd /path/to/category-manager-repo
git checkout -b feat/add-app-extensions-to-category-list
# Make changes, then:
git add .
git commit -m "feat: add App Extensions to Category List

CATALOG-11279"
git push origin feat/add-app-extensions-to-category-list
gh pr create --draft \
  --title "Add App Extensions support to Category List page" \
  --body-file ../draft-prs/03-category-manager-list-pr.md \
  --base main
```

### PR #4: Category Manager - Detail
```bash
cd /path/to/category-manager-repo
git checkout -b feat/add-app-extensions-to-category-detail
# Make changes, then:
git add .
git commit -m "feat: add App Extensions to Category Detail

CATALOG-11279"
git push origin feat/add-app-extensions-to-category-detail
gh pr create --draft \
  --title "Add App Extensions support to Category Detail/Edit page" \
  --body-file ../draft-prs/04-category-manager-detail-pr.md \
  --base main
```

### PR #5: Shared Components
```bash
cd /path/to/shared-components-repo
git checkout -b feat/update-app-extensions-for-categories
# Make changes, then:
git add .
git commit -m "feat: update App Extensions for CATEGORIES

CATALOG-11279"
git push origin feat/update-app-extensions-for-categories
gh pr create --draft \
  --title "Update App Extensions components to support CATEGORIES" \
  --body-file ../draft-prs/05-shared-components-pr.md \
  --base main
```

---

## Method 3: After Branches Exist

Once you've created and pushed branches, you can use these compare URLs:

**Format:** `https://github.com/[org]/[repo]/compare/[base]...[branch]`

### Example (after branch exists):
```
https://github.com/bigcommerce/graphql-schema/compare/main...feat/add-categories-app-extension-model
```

This will take you directly to the PR creation page with branches pre-selected.

---

## Troubleshooting

### Issue: 404 on compare links
**Solution:** Branch doesn't exist yet. Create branch first using Method 1 or 2.

### Issue: Can't find repository
**Solution:** Update repository names in the links above with your actual repo names.

### Issue: Base branch is "master" not "main"
**Solution:** Replace `main` with `master` in all commands and links.

### Issue: Need to find repository names
**Solution:** Check your organization's GitHub or ask your team for the exact repository names.

---

## Quick Reference: Branch Names

| PR # | Branch Name |
|------|-------------|
| 1 | `feat/add-categories-app-extension-model` |
| 2 | `feat/add-categories-model-support` |
| 3 | `feat/add-app-extensions-to-category-list` |
| 4 | `feat/add-app-extensions-to-category-detail` |
| 5 | `feat/update-app-extensions-for-categories` |

---

## Next Steps

1. **Find your actual repository names** (ask team or check GitHub org)
2. **Use GitHub CLI** (Method 2) for fastest PR creation
3. **Or use GitHub web** (Method 1) for visual workflow
4. **Copy PR descriptions** from `draft-prs/*-pr.md` files when creating PRs

