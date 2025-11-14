# Branch Strategy Guide: Multi-Repository PRs for Single Jira Task

## When to Create a New Branch

### ✅ **Create a New Branch When:**

1. **Starting a new feature or task**
   - Each distinct feature/task should have its own branch
   - Even if part of a larger epic, create separate branches for logical units of work

2. **Making changes that will become a PR**
   - If you're going to open a pull request, you need a branch
   - Never commit directly to `main`/`master` in shared repositories

3. **Working on a different repository**
   - Each repository needs its own branch, even for the same Jira task
   - Example: `feat/add-categories-support` in `repo-a` and `feat/add-categories-support` in `repo-b`

4. **Making independent changes within the same repo**
   - If changes can be reviewed/merged independently, use separate branches
   - Example: List page changes vs. Detail page changes in the same repo

5. **Experimenting or trying different approaches**
   - Use feature branches to isolate experimental work
   - Can be deleted if approach doesn't work out

### ❌ **Don't Create a New Branch When:**

1. **Small, unrelated fixes** (use existing branch or hotfix branch)
2. **Documentation-only changes** (often can go directly to main, but check team policy)
3. **You're already on a branch that covers the work** (just commit to existing branch)

---

## Multi-Repository PR Strategy for Single Jira Task

When working on a single Jira task that requires changes across multiple repositories, follow this structure:

### **Principle: One Branch Per Repository, One PR Per Branch**

Each repository gets its own branch, and each branch becomes its own PR. This allows:
- Independent review and merging
- Clear dependency tracking
- Easier rollback if needed
- Parallel development when possible

---

## Branch Naming Convention

### **Format:**
```
<type>/<short-description>
```

### **Types:**
- `feat/` - New feature
- `fix/` - Bug fix
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### **Examples for Multi-Repo Task:**

**Jira Task: CATALOG-11279 - Add Categories App Extensions**

| Repository | Branch Name | Purpose |
|------------|-------------|---------|
| `graphql-schema` | `feat/add-categories-app-extension-model` | Add enum value |
| `app-extensions-service` | `feat/add-categories-model-support` | Backend support |
| `category-manager` | `feat/add-app-extensions-to-category-list` | List page UI |
| `category-manager` | `feat/add-app-extensions-to-category-detail` | Detail page UI |
| `shared-components` | `feat/update-app-extensions-for-categories` | Shared components |

**Note:** Same repo (`category-manager`) has two branches because the changes are independent and can be reviewed separately.

---

## Commit Structure

### **Commit Message Format:**

Use conventional commits with Jira reference:

```
<type>: <short description>

<optional longer description>

<JIRA-TASK-KEY>
```

### **Examples:**

```bash
# Single logical change
git commit -m "feat: add CATEGORIES to AppExtensionModel enum

CATALOG-11279"

# Multiple related changes in one commit
git commit -m "feat: add CATEGORIES model support to App Extensions service

- Add CATEGORIES to model registry
- Update validation logic
- Add unit tests

CATALOG-11279"
```

### **Commit Granularity Guidelines:**

1. **One logical change per commit**
   - Each commit should represent a complete, reviewable unit
   - Avoid "WIP" or "fix typo" commits in final PR

2. **Group related changes**
   - If you're updating a file and its tests, commit together
   - If you're adding a feature and its documentation, commit together

3. **Keep commits focused**
   - Don't mix unrelated changes in one commit
   - Example: Don't commit "Add feature X and fix bug Y" together

4. **Use meaningful commit messages**
   - Future you (and reviewers) will thank you
   - Include context: what, why (if not obvious)

---

## Workflow for Multi-Repo PRs

### **Step 1: Plan Dependencies**

Identify the order of PRs based on dependencies:

```
PR #1: graphql-schema (foundation)
  ↓
PR #2: app-extensions-service (depends on #1)
PR #5: shared-components (depends on #1)
  ↓
PR #3: category-manager-list (depends on #1, #2, #5)
PR #4: category-manager-detail (depends on #1, #2, #5)
```

### **Step 2: Create Branches in Order**

1. **Create all branches first** (before making changes)
   ```bash
   # Repo 1
   cd /path/to/graphql-schema
   git checkout -b feat/add-categories-app-extension-model
   
   # Repo 2
   cd /path/to/app-extensions-service
   git checkout -b feat/add-categories-model-support
   
   # Repo 3 (first branch)
   cd /path/to/category-manager
   git checkout -b feat/add-app-extensions-to-category-list
   
   # Repo 3 (second branch)
   git checkout main
   git checkout -b feat/add-app-extensions-to-category-detail
   
   # Repo 4
   cd /path/to/shared-components
   git checkout -b feat/update-app-extensions-for-categories
   ```

2. **Make changes and commit to each branch**
   - Work on one branch at a time
   - Commit logical units of work
   - Push branches as you complete them

### **Step 3: Create PRs with Dependencies**

When creating PRs, explicitly state dependencies:

**PR #1 (GraphQL Schema):**
```markdown
## Related Jira
- Story: CATALOG-11279

## Description
Adds CATEGORIES to AppExtensionModel enum.
```

**PR #2 (Service):**
```markdown
## Related Jira
- Story: CATALOG-11279

## Dependencies
- Depends on: #<PR_NUMBER> in bigcommerce/graphql-schema

## Description
Adds backend support for CATEGORIES model.
```

**PR #3 (Category List):**
```markdown
## Related Jira
- Story: CATALOG-11279

## Dependencies
- Depends on: #<PR_NUMBER_1> in bigcommerce/graphql-schema
- Depends on: #<PR_NUMBER_2> in bigcommerce/app-extensions-service
- Depends on: #<PR_NUMBER_5> in bigcommerce/shared-components

## Description
Adds App Extensions UI to Category List page.
```

### **Step 4: Link PRs in Jira**

1. Add PR links to Jira task
2. Use GitHub's "Linked Issues" feature to link PRs to Jira
3. Update PR descriptions with actual PR numbers after creation

---

## Best Practices

### **1. Branch Lifecycle**

```bash
# Create branch from latest main
git checkout main
git pull origin main
git checkout -b feat/my-feature

# Make changes, commit
git add .
git commit -m "feat: my changes

JIRA-123"

# Push and create PR
git push origin feat/my-feature
gh pr create --draft --title "..." --body "..."
```

### **2. Keep Branches Up to Date**

If working on a branch for a while, periodically rebase on main:

```bash
git checkout feat/my-feature
git fetch origin
git rebase origin/main
git push --force-with-lease  # Only if already pushed
```

### **3. Use Draft PRs**

- Create PRs as drafts initially
- Mark as "Ready for Review" when all changes are complete
- This signals to reviewers the PR is still in progress

### **4. Atomic Commits**

Each commit should:
- ✅ Compile/build successfully
- ✅ Pass tests (if applicable)
- ✅ Represent a logical unit of work
- ✅ Have a clear, descriptive message

### **5. Cross-Repository Testing**

When PRs have dependencies:
- Test locally with all changes together
- Document in PR description how to test the full feature
- Consider creating a temporary integration branch if needed

---

## Common Patterns

### **Pattern 1: Sequential Dependencies**

```
Repo A → Repo B → Repo C
```

**Strategy:** Create and merge PRs in order. Each PR can reference the merged PR.

### **Pattern 2: Parallel Dependencies**

```
        Repo A
       /      \
   Repo B    Repo C
       \      /
        Repo D
```

**Strategy:** 
- Create PRs for A, B, C in parallel
- Merge A first, then B and C can merge independently
- D waits for both B and C

### **Pattern 3: Independent Changes**

```
Repo A (independent)
Repo B (independent)
Repo C (independent)
```

**Strategy:** Create all PRs in parallel. No dependency management needed.

---

## Example: Complete Workflow

### **Scenario:** Add Categories App Extensions (CATALOG-11279)

**Step 1: Create branches**
```bash
# Terminal 1: GraphQL Schema
cd ~/repos/graphql-schema
git checkout main && git pull
git checkout -b feat/add-categories-app-extension-model

# Terminal 2: App Extensions Service
cd ~/repos/app-extensions-service
git checkout main && git pull
git checkout -b feat/add-categories-model-support

# Terminal 3: Category Manager (List)
cd ~/repos/category-manager
git checkout main && git pull
git checkout -b feat/add-app-extensions-to-category-list

# Terminal 4: Category Manager (Detail)
cd ~/repos/category-manager
git checkout main && git pull
git checkout -b feat/add-app-extensions-to-category-detail

# Terminal 5: Shared Components
cd ~/repos/shared-components
git checkout main && git pull
git checkout -b feat/update-app-extensions-for-categories
```

**Step 2: Make changes and commit**

```bash
# In graphql-schema branch
# Edit schema/app-extension.graphql
git add schema/app-extension.graphql
git commit -m "feat: add CATEGORIES to AppExtensionModel enum

CATALOG-11279"
git push origin feat/add-categories-app-extension-model
```

**Step 3: Create PRs**

```bash
# PR #1
gh pr create --draft \
  --title "Add CATEGORIES to AppExtensionModel enum" \
  --body "Related to CATALOG-11279" \
  --repo bigcommerce/graphql-schema

# After PR #1 is created, note the PR number (e.g., #123)
# Then create PR #2 with dependency
gh pr create --draft \
  --title "Add CATEGORIES model support" \
  --body "Related to CATALOG-11279

Depends on: bigcommerce/graphql-schema#123" \
  --repo bigcommerce/app-extensions-service
```

**Step 4: Update PR descriptions**

After all PRs are created, update each PR description with:
- Actual PR numbers for dependencies
- Complete testing instructions
- Links to related PRs

---

## Troubleshooting

### **Q: Should I use the same branch name across repos?**

**A:** It's fine to use the same name (e.g., `feat/add-categories-support`) across different repositories since branches are repository-scoped. However, using descriptive names that indicate the specific change in that repo is clearer.

### **Q: Can I have multiple commits in one PR?**

**A:** Yes! Multiple commits in a PR are normal and often preferred. Each commit should represent a logical unit of work. Squash commits only if requested during review.

### **Q: What if I need to make changes after PR is created?**

**A:** Simply commit to the same branch and push. The PR will automatically update.

```bash
git checkout feat/my-feature
# Make changes
git add .
git commit -m "fix: address review feedback"
git push origin feat/my-feature
```

### **Q: How do I handle merge conflicts with main?**

**A:** Rebase your branch on main:

```bash
git checkout feat/my-feature
git fetch origin
git rebase origin/main
# Resolve conflicts if any
git push --force-with-lease
```

### **Q: What if I need to test all changes together locally?**

**A:** You can temporarily check out multiple branches or use a monorepo tool. Alternatively, create a temporary integration branch that merges all your feature branches for local testing.

---

## Summary

✅ **Create a new branch for:**
- Each repository you're modifying
- Each independent feature/change
- Each PR you plan to create

✅ **Commit structure:**
- One logical change per commit
- Include Jira task key in commit message
- Use conventional commit format

✅ **Multi-repo workflow:**
- One branch per repository
- One PR per branch
- Document dependencies clearly
- Link all PRs to Jira task

✅ **Best practices:**
- Use descriptive branch names
- Create draft PRs early
- Keep branches up to date with main
- Test cross-repo changes together

