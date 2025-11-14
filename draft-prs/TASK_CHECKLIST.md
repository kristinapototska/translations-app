# Task Creation Checklist for CATALOG-11279

Use this checklist to verify which tasks exist and which need to be created.

## Required Tasks

### ✅ Task 1: GraphQL Schema Update
- [ ] Task exists in Jira
- [ ] Task is linked to CATALOG-11279
- [ ] Task has acceptance criteria
- [ ] Task is assigned
- [ ] Task key: `CATALOG-XXXXX`

**If missing, create task with:**
- **Title**: "Add CATEGORIES to AppExtensionModel enum in GraphQL schema"
- **Type**: Task
- **Description**: Add CATEGORIES as a new supported model type in the App Extensions GraphQL schema
- **Acceptance Criteria**: See JIRA_TASK_MAPPING.md Task 1

---

### ✅ Task 2: Backend Service Updates
- [ ] Task exists in Jira
- [ ] Task is linked to CATALOG-11279
- [ ] Task has dependency on Task 1
- [ ] Task has acceptance criteria
- [ ] Task is assigned
- [ ] Task key: `CATALOG-XXXXX`

**If missing, create task with:**
- **Title**: "Update App Extensions service to support CATEGORIES model"
- **Type**: Task
- **Description**: Update backend service to support CATEGORIES model (model registry, validation, query logic)
- **Dependencies**: Task 1 (GraphQL Schema)
- **Acceptance Criteria**: See JIRA_TASK_MAPPING.md Task 2

---

### ✅ Task 3: Category List Page Integration
- [ ] Task exists in Jira
- [ ] Task is linked to CATALOG-11279
- [ ] Task has dependencies on Tasks 1, 2, 5
- [ ] Task has acceptance criteria
- [ ] Task is assigned
- [ ] Task key: `CATALOG-XXXXX`

**If missing, create task with:**
- **Title**: "Add App Extensions support to Category List page"
- **Type**: Task
- **Description**: Add App Extensions support to category list/table component
- **Dependencies**: Task 1 (GraphQL Schema), Task 2 (Backend Service), Task 5 (Shared Components)
- **Acceptance Criteria**: See JIRA_TASK_MAPPING.md Task 3

---

### ✅ Task 4: Category Detail/Edit Page Integration
- [ ] Task exists in Jira
- [ ] Task is linked to CATALOG-11279
- [ ] Task has dependencies on Tasks 1, 2, 5
- [ ] Task has acceptance criteria
- [ ] Task is assigned
- [ ] Task key: `CATALOG-XXXXX`

**If missing, create task with:**
- **Title**: "Add App Extensions support to Category Detail/Edit page"
- **Type**: Task
- **Description**: Add App Extensions support to category detail and edit pages
- **Dependencies**: Task 1 (GraphQL Schema), Task 2 (Backend Service), Task 5 (Shared Components)
- **Acceptance Criteria**: See JIRA_TASK_MAPPING.md Task 4

---

### ✅ Task 5: Shared Components Update
- [ ] Task exists in Jira
- [ ] Task is linked to CATALOG-11279
- [ ] Task has dependency on Task 1
- [ ] Task has acceptance criteria
- [ ] Task is assigned
- [ ] Task key: `CATALOG-XXXXX`

**If missing, create task with:**
- **Title**: "Update shared App Extensions components to support CATEGORIES"
- **Type**: Task
- **Description**: Update shared App Extensions hooks and components to support CATEGORIES model
- **Dependencies**: Task 1 (GraphQL Schema)
- **Acceptance Criteria**: See JIRA_TASK_MAPPING.md Task 5

---

## Task Creation Template

When creating tasks, use this template:

```
Title: [Task Title from above]
Type: Task
Parent: CATALOG-11279
Description: [Description from above]
Acceptance Criteria:
- [Copy from JIRA_TASK_MAPPING.md]
Dependencies: [List dependent tasks]
Labels: app-extensions, categories
Components: [Add relevant components]
```

## After Creating Tasks

1. Update `JIRA_TASK_MAPPING.md` with actual task keys
2. Update PR descriptions with actual task links
3. Link tasks to story CATALOG-11279
4. Set up task dependencies in Jira
5. Assign tasks to appropriate team members

## Verification

After all tasks are created:
- [ ] All 5 tasks exist
- [ ] All tasks are linked to CATALOG-11279
- [ ] Task dependencies are set correctly
- [ ] PR descriptions reference correct task keys
- [ ] Tasks have acceptance criteria
- [ ] Tasks are assigned

