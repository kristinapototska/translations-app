#!/bin/bash

# Script to quickly create all draft PRs for CATEGORIES App Extensions
# Usage: ./create-prs.sh [repo-base-path]
# Example: ./create-prs.sh ~/repos

set -e

# Configuration
REPO_BASE="${1:-/path/to/repos}"  # Default path, override with first argument
PR_DESCRIPTIONS="$(cd "$(dirname "$0")" && pwd)"  # Directory containing this script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Creating Draft PRs for CATEGORIES${NC}"
echo -e "${BLUE}Story: CATALOG-11279${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Function to create PR
create_pr() {
    local repo_name=$1
    local branch_name=$2
    local pr_title=$3
    local pr_file=$4
    local repo_path="${REPO_BASE}/${repo_name}"
    
    echo -e "${YELLOW}Processing: ${pr_title}${NC}"
    
    if [ ! -d "$repo_path" ]; then
        echo -e "${RED}  ✗ Repository not found: ${repo_path}${NC}"
        echo -e "    Update REPO_BASE or clone the repository first"
        return 1
    fi
    
    cd "$repo_path"
    
    # Check if branch exists
    if git show-ref --verify --quiet refs/heads/"${branch_name}"; then
        echo -e "${YELLOW}  ⚠ Branch ${branch_name} already exists${NC}"
        read -p "  Continue with existing branch? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    else
        git checkout -b "${branch_name}" 2>/dev/null || {
            echo -e "${RED}  ✗ Failed to create branch${NC}"
            return 1
        }
        echo -e "${GREEN}  ✓ Branch created: ${branch_name}${NC}"
    fi
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}  ⚠ Uncommitted changes detected${NC}"
        echo -e "    Make your code changes, then commit them"
        echo -e "    Then run this script again or create PR manually"
        return 1
    fi
    
    # Push branch if not already pushed
    if ! git ls-remote --heads origin "${branch_name}" | grep -q "${branch_name}"; then
        git push -u origin "${branch_name}" 2>/dev/null || {
            echo -e "${YELLOW}  ⚠ No commits to push. Make changes and commit first${NC}"
            return 1
        }
        echo -e "${GREEN}  ✓ Branch pushed${NC}"
    fi
    
    # Create PR
    if gh pr view "${branch_name}" &> /dev/null; then
        echo -e "${YELLOW}  ⚠ PR already exists for this branch${NC}"
    else
        gh pr create --draft \
            --title "${pr_title}" \
            --body-file "${PR_DESCRIPTIONS}/${pr_file}" \
            --base main 2>/dev/null && {
            echo -e "${GREEN}  ✓ Draft PR created${NC}"
        } || {
            echo -e "${RED}  ✗ Failed to create PR${NC}"
            return 1
        }
    fi
    
    echo ""
    return 0
}

# PR #1: GraphQL Schema
create_pr \
    "graphql-schema" \
    "feat/add-categories-app-extension-model" \
    "Add CATEGORIES to AppExtensionModel enum" \
    "01-graphql-schema-pr.md"

# PR #2: App Extensions Service
create_pr \
    "app-extensions-service" \
    "feat/add-categories-model-support" \
    "Add CATEGORIES model support to App Extensions service" \
    "02-app-extensions-service-pr.md"

# PR #3: Category Manager - List
create_pr \
    "category-manager" \
    "feat/add-app-extensions-to-category-list" \
    "Add App Extensions support to Category List page" \
    "03-category-manager-list-pr.md"

# PR #4: Category Manager - Detail
create_pr \
    "category-manager" \
    "feat/add-app-extensions-to-category-detail" \
    "Add App Extensions support to Category Detail/Edit page" \
    "04-category-manager-detail-pr.md"

# PR #5: Shared Components
create_pr \
    "shared-components" \
    "feat/update-app-extensions-for-categories" \
    "Update App Extensions components to support CATEGORIES" \
    "05-shared-components-pr.md"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Done!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Make code changes in each repository"
echo "2. Commit changes to the branches"
echo "3. Push commits (PRs will update automatically)"
echo "4. Update Jira task keys in PR descriptions"

