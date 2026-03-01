# GitHub Workflow & PR Template Guide

## Pull Request Template

The PR template is located at `.github/pull_request_template.md` and is automatically used by GitHub when creating pull requests.

### Why it stays in `.github/`

The `.github/` folder is a special GitHub directory that must be in the repository root. GitHub automatically recognizes:
- `pull_request_template.md` - PR template
- `issue_template.md` - Issue template
- `workflows/` - GitHub Actions workflows

**Important**: This file must remain in `.github/` for GitHub to use it automatically.

### Using the PR Template

When you create a PR on GitHub, the template will automatically populate with:
- Description section
- Type of change checkboxes
- Testing checklist
- Code quality checklist
- Launch impact assessment

### PR Template Sections Explained

#### 1. Description
Describe what changes are in this PR and why they were made.

#### 2. Type of Change
Select the appropriate type:
- **Bug fix**: Fixes an existing issue
- **New feature**: Adds new functionality
- **Breaking change**: Changes that require migration
- **Documentation**: Updates to docs only
- **Performance**: Performance improvements
- **Refactoring**: Code improvements without functional changes

#### 3. Testing
Check all that apply:
- Unit tests for new/changed code
- Integration tests for workflows
- E2E tests for user flows
- Manual testing completed
- Tested on staging environment

#### 4. Checklist
Critical items to verify before merging:
- Code style compliance (see `.cursorrules`)
- Self-review completed
- Documentation updated
- No TypeScript/linting errors
- No console.log statements
- Tests passing
- Build successful
- Access control implemented (if applicable)
- Error handling added
- Loading states added (if applicable)

#### 5. Launch Impact
Critical for March 15th launch planning:
- **Critical for March 15th launch**: Must be merged before launch
- **Nice to have before launch**: Can be merged if time permits
- **Can be done post-launch**: Safe to defer

### Best Practices

1. **Fill out all sections** - Don't leave sections empty
2. **Be specific** - Describe what changed and why
3. **Link issues** - Use "Closes #123" to link related issues
4. **Add screenshots** - For UI changes, include before/after screenshots
5. **Review checklist** - Verify all items before requesting review

### Example PR Description

```markdown
## Description
Implements bulk product import via CSV for vendors. Allows vendors to upload 
a CSV file with product data, validates the data, and creates products in bulk.

## Type of Change
- [x] New feature (non-breaking change which adds functionality)

## Testing
- [x] Unit tests added/updated
- [x] Integration tests added/updated
- [x] Manual testing completed
- [x] Tested on staging environment

## Checklist
- [x] Code follows project style guidelines (see .cursorrules)
- [x] Self-review completed
- [x] Comments added for complex code
- [x] Documentation updated (if needed)
- [x] No new TypeScript errors
- [x] No new linting errors
- [x] No console.log statements
- [x] All tests pass locally
- [x] Build succeeds locally
- [x] Access control properly implemented (if applicable)
- [x] Error handling added
- [x] Loading states added (if applicable)

## Related Issues
Closes #45

## Launch Impact
- [x] Critical for March 15th launch
```

### AI Agent Integration

You can use AI agents to help fill out PR templates:

```
"Review my recent commits and create a PR description following the template 
at .github/pull_request_template.md. Include:
- Summary of changes
- Type of change
- Testing completed
- Launch impact assessment"
```

### PR Review Process

1. **Create PR** - Use the template
2. **Self-review** - Complete the checklist
3. **Request review** - Assign reviewers
4. **Address feedback** - Make requested changes
5. **Merge** - After approval and CI passes

### Launch-Focused PRs

For PRs critical to the March 15th launch:
- Mark as "Critical for March 15th launch"
- Prioritize review
- Ensure comprehensive testing
- Document any risks

---

**File Location**: `.github/pull_request_template.md` (must stay in root `.github/` folder)
**Last Updated**: March 1, 2025
