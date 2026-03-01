# AI Agent Implementation TODO - GitHub Issue → Fix → PR

> **Purpose**: This document provides a step-by-step, highly detailed TODO list for building a DIY GitHub Issue → AI Agent Fixes → Opens PR system for the evega e-commerce marketplace.
>
> **Stack Context**: Next.js 16.1.6, TypeScript, Payload CMS 3.x, tRPC, MongoDB, Stripe, npm, ESLint
>
> **Goal**: Create an automated system where labeling an issue with `ai-fix` or commenting `/ai-fix` triggers an AI agent that fixes the issue, runs tests, and opens a PR.

---

## Table of Contents

1. [Phase 0: Decision & Planning](#phase-0-decision--planning)
2. [Phase 1: Repository Preparation](#phase-1-repository-preparation)
3. [Phase 2: GitHub Setup](#phase-2-github-setup)
4. [Phase 3: Agent Infrastructure](#phase-3-agent-infrastructure)
5. [Phase 4: GitHub Actions Workflow](#phase-4-github-actions-workflow)
6. [Phase 5: Agent Core Logic](#phase-5-agent-core-logic)
7. [Phase 6: Safety & Guardrails](#phase-6-safety--guardrails)
8. [Phase 7: Testing & Rollout](#phase-7-testing--rollout)
9. [Phase 8: Enhancements (Optional)](#phase-8-enhancements-optional)

---

## Phase 0: Decision & Planning

### 0.1: Define Trigger Mechanism
- [ ] **Task 0.1.1**: Choose primary trigger method
  - Decide between: Label trigger (`ai-fix` label) OR Comment trigger (`/ai-fix` comment) OR Both
  - Recommendation: Start with label trigger, add comment trigger later
  - Document decision in `docs/ai-agent.md`

- [ ] **Task 0.1.2**: Define trigger conditions
  - Label trigger: Issue gets `ai-fix` label added
  - Comment trigger: Comment contains `/ai-fix` (case-insensitive)
  - Prevent duplicate runs: Only trigger if issue doesn't already have `ai-in-progress` label
  - Document in workflow YAML comments

### 0.2: Define Agent Success Criteria
- [ ] **Task 0.2.1**: Define "done" conditions
  - Must create a PR (draft or ready)
  - Must run `npm run lint` and pass (exit code 0)
  - Must run `npm run test` and pass (if tests exist)
  - Must run `npm run build` and pass (optional but recommended)
  - PR must reference issue number in title/description
  - Document in `AGENTS.md`

- [ ] **Task 0.2.2**: Define PR requirements
  - PR title format: `Fix #<issue-number>: <issue-title>`
  - PR description must include: Summary, What changed, How to test, Risk/rollback notes
  - PR must link to issue with "Fixes #<number>" or "Closes #<number>"
  - PR should be draft if tests fail, ready if all pass
  - Document in agent prompt template

- [ ] **Task 0.2.3**: Define scope limits
  - One issue per PR (no combining multiple issues)
  - Maximum files changed: 15 files per PR
  - Maximum diff size: 800 lines total
  - Maximum iterations: 6 edit loops
  - Maximum execution time: 20 minutes
  - Document in agent constraints

### 0.3: Define Agent Restrictions
- [ ] **Task 0.3.1**: Define forbidden actions
  - No web browsing (or only whitelisted domains like GitHub API, npm registry)
  - No touching files in: `.github/workflows/`, `.env*`, `package-lock.json` (unless issue explicitly requests)
  - No modifying: `next.config.ts`, `payload.config.ts`, `tsconfig.json` (unless issue explicitly requests)
  - No writing to external services (no API calls except GitHub API)
  - No large refactors (unless issue explicitly requests)
  - No changes to payment/checkout code without explicit confirmation
  - Document in `AGENTS.md` as "Restricted Areas"

- [ ] **Task 0.3.2**: Define high-risk areas
  - Payment processing: `src/app/api/stripe/`, `src/modules/checkout/`
  - Authentication: `src/lib/auth.config.ts`, `src/app/(auth)/`
  - Order processing: `src/app/api/stripe/webhook/route.ts`, `src/collections/Orders.ts`
  - Vendor payouts: Any Stripe Connect related code
  - Database migrations: `src/collections/*.ts` (be cautious)
  - Document in `AGENTS.md` as "High-Risk Areas"

- [ ] **Task 0.3.3**: Define secret handling rules
  - Never print secrets in logs
  - Never commit `.env` files
  - Never expose API keys in PR descriptions
  - Use environment variables from GitHub Secrets
  - Document in agent code comments

### 0.4: Define CI Commands
- [ ] **Task 0.4.1**: Document install command
  - Command: `npm install` (or `npm ci` for CI)
  - Expected duration: 1-3 minutes
  - Failure handling: Exit with error if install fails
  - Document in `AGENTS.md`

- [ ] **Task 0.4.2**: Document lint command
  - Command: `npm run lint`
  - Expected output: ESLint results
  - Success: Exit code 0
  - Failure: Exit code non-zero, show errors
  - Document in `AGENTS.md`

- [ ] **Task 0.4.3**: Document test command (if exists)
  - Check if `package.json` has `test` script
  - If missing: Add placeholder test script or document that tests are optional
  - Command: `npm run test` (if exists)
  - Expected output: Test results
  - Document in `AGENTS.md`

- [ ] **Task 0.4.4**: Document build command
  - Command: `npm run build`
  - Expected duration: 2-5 minutes
  - Success: Exit code 0, `.next` folder created
  - Failure: Exit code non-zero, show build errors
  - Document in `AGENTS.md`

**Deliverable**: Decision document with all choices documented, ready to paste into `AGENTS.md`

---

## Phase 1: Repository Preparation

### 1.1: Create Agent Rules File
- [ ] **Task 1.1.1**: Create `AGENTS.md` at repo root
  - Create file: `AGENTS.md`
  - Add frontmatter with description
  - Structure: Overview, Folder Map, Commands, Code Style, Restrictions, High-Risk Areas

- [ ] **Task 1.1.2**: Add project overview section
  - Write 2-5 lines describing the project
  - Include: "Multi-vendor e-commerce marketplace built with Next.js, Payload CMS, tRPC, and Stripe"
  - Include key features: Vendor dashboard, product management, order processing, Stripe payments
  - Format as markdown section

- [ ] **Task 1.1.3**: Add folder structure map
  - Document key directories:
    - `src/app/` - Next.js App Router pages and API routes
    - `src/app/(app)/` - Customer-facing pages
    - `src/app/(app)/vendor/` - Vendor dashboard pages
    - `src/app/api/` - API routes (Stripe webhook, tRPC)
    - `src/collections/` - Payload CMS collections (Products, Orders, Vendors, etc.)
    - `src/modules/` - Feature modules (checkout, vendor, etc.)
    - `src/components/` - Reusable React components
    - `src/lib/` - Utilities and configuration
    - `src/trpc/` - tRPC router setup
  - Add brief description for each directory
  - Format as markdown list or table

- [ ] **Task 1.1.4**: Add commands section
  - Document install: `npm install` or `npm ci`
  - Document lint: `npm run lint` (ESLint)
  - Document test: `npm run test` (if exists, else "Not configured")
  - Document build: `npm run build` (Next.js build)
  - Document dev: `npm run dev` (for reference)
  - Include expected exit codes and failure handling

- [ ] **Task 1.1.5**: Add code style rules
  - TypeScript: Strict mode enabled, use TypeScript for all new files
  - React: Use functional components, hooks for state
  - Naming: camelCase for variables/functions, PascalCase for components
  - File structure: Co-locate components with their pages when possible
  - Imports: Use absolute imports with `@/` alias
  - Formatting: Use ESLint for linting (Prettier if configured)
  - Document any project-specific conventions

- [ ] **Task 1.1.6**: Add required behavior section
  - Small diffs: Keep changes focused, one issue per PR
  - Add tests: For bug fixes, add or update tests
  - No secrets: Never commit secrets, use env vars
  - No external posting: Only interact with GitHub API
  - Update documentation: If changing APIs, update relevant docs
  - Format as bullet list

- [ ] **Task 1.1.7**: Add high-risk areas section
  - List restricted paths:
    - `src/app/api/stripe/` - Payment processing
    - `src/modules/checkout/` - Checkout flow
    - `src/app/(app)/vendor/` - Vendor dashboard (be cautious)
    - `src/collections/Orders.ts` - Order data model
    - `src/app/api/stripe/webhook/route.ts` - Order creation webhook
  - Add rule: Only modify if issue explicitly requests or has `ai-allow-sensitive` label
  - Format as warning callout

- [ ] **Task 1.1.8**: Add testing requirements
  - For bug fixes: Add unit test or update existing test
  - For new features: Add integration test if applicable
  - Test files: Look for `*.test.ts`, `*.test.tsx`, `*.spec.ts` patterns
  - Test location: Co-locate with source or in `__tests__/` folders
  - Document test command and expectations

**Deliverable**: Complete `AGENTS.md` file with all sections filled in

### 1.2: Update README for Agent Context
- [ ] **Task 1.2.1**: Review existing README.md
  - Read current README.md
  - Identify missing information for agents
  - Check if install/lint/test/build commands are documented

- [ ] **Task 1.2.2**: Add "Running Locally" section (if missing)
  - Add section: `## Running Locally`
  - Include: Install dependencies (`npm install`)
  - Include: Run dev server (`npm run dev`)
  - Include: Run lint (`npm run lint`)
  - Include: Run build (`npm run build`)
  - Include: Environment setup (`.env.example` reference)

- [ ] **Task 1.2.3**: Add "Testing" section (if missing)
  - Add section: `## Testing`
  - Document test command: `npm run test` (or note if not configured)
  - Document test framework if exists
  - Document how to run specific tests
  - Add note about test database setup if needed

- [ ] **Task 1.2.4**: Add "Project Structure" section (if missing)
  - Add section: `## Project Structure`
  - Reference folder map from `AGENTS.md`
  - Add brief explanation of key directories
  - Link to `AGENTS.md` for detailed structure

- [ ] **Task 1.2.5**: Add environment variables documentation
  - Check if `.env.example` exists
  - If missing: Create `.env.example` with required vars (without values)
  - Document in README: Required env vars and where to get them
  - Include: Database connection, Stripe keys, NextAuth secret, etc.

**Deliverable**: Updated README.md with agent-friendly documentation

### 1.3: Standardize Package.json Scripts
- [ ] **Task 1.3.1**: Verify `lint` script exists
  - Check `package.json` for `"lint"` script
  - Current: `"lint": "eslint"`
  - Ensure it returns non-zero exit code on failure
  - Test locally: Run `npm run lint` and verify exit code on error
  - If missing or broken: Fix script

- [ ] **Task 1.3.2**: Add or verify `test` script
  - Check `package.json` for `"test"` script
  - If missing: Add placeholder: `"test": "echo 'No tests configured' && exit 0"`
  - Or add real test script if test framework exists
  - Ensure it returns non-zero exit code on failure
  - Document in `AGENTS.md` whether tests are configured

- [ ] **Task 1.3.3**: Verify `build` script exists
  - Check `package.json` for `"build"` script
  - Current: `"build": "next build"`
  - Ensure it returns non-zero exit code on failure
  - Test locally: Run `npm run build` and verify exit code on error

- [ ] **Task 1.3.4**: Verify `install` command works
  - Test: Run `npm ci` (for CI) and verify it works
  - Ensure `package-lock.json` is committed
  - Document in `AGENTS.md`: Use `npm ci` in CI for faster, reliable installs

- [ ] **Task 1.3.5**: Add script validation
  - Create simple test: Run all scripts and verify they don't crash
  - Document expected behavior for each script
  - Add to `AGENTS.md` script section

**Deliverable**: All scripts standardized and documented, exit codes verified

### 1.4: Make CI Runnable Headlessly
- [ ] **Task 1.4.1**: Check environment variable requirements
  - List all required env vars from codebase
  - Check: Database connection string, Stripe keys, NextAuth secret, etc.
  - Document in `.env.example` (create if missing)
  - Document in `AGENTS.md` which vars are needed for tests/build

- [ ] **Task 1.4.2**: Create `.env.example` file (if missing)
  - Create file: `.env.example`
  - Add all required env vars with placeholder values
  - Add comments explaining what each var is for
  - Example format: `DATABASE_URI=mongodb://localhost:27017/evega`
  - Do NOT include actual secrets

- [ ] **Task 1.4.3**: Make tests use safe defaults
  - Check if tests require database connection
  - If yes: Add mock database or test database setup
  - Or: Document that tests require `DATABASE_URI` env var
  - Ensure tests don't fail if env vars are missing (use defaults or skip)

- [ ] **Task 1.4.4**: Document test database strategy
  - If using MongoDB: Document test DB setup
  - Options: Use separate test database, use mocks, use in-memory DB
  - Document in `AGENTS.md` test section
  - Add instructions for CI environment

- [ ] **Task 1.4.5**: Verify build works without secrets
  - Test: Run `npm run build` without sensitive env vars
  - Build should work (Next.js build doesn't need runtime secrets)
  - If build fails: Document which vars are needed and why
  - Update `AGENTS.md` with build requirements

**Deliverable**: CI can run headlessly, `.env.example` exists, tests have safe defaults

---

## Phase 2: GitHub Setup

### 2.1: Create GitHub Labels
- [ ] **Task 2.1.1**: Create `ai-fix` label
  - Go to GitHub repo → Issues → Labels
  - Click "New label"
  - Name: `ai-fix`
  - Color: `0E8A16` (green) or `1D76DB` (blue)
  - Description: "Trigger AI agent to fix this issue"
  - Click "Create label"

- [ ] **Task 2.1.2**: Create `ai-in-progress` label
  - Name: `ai-in-progress`
  - Color: `FBCA04` (yellow)
  - Description: "AI agent is currently working on this issue"
  - Click "Create label"

- [ ] **Task 2.1.3**: Create `ai-blocked` label
  - Name: `ai-blocked`
  - Color: `D93F0B` (red)
  - Description: "AI agent cannot fix this issue (see comments for reason)"
  - Click "Create label"

- [ ] **Task 2.1.4**: Create `ai-draft` label (optional)
  - Name: `ai-draft`
  - Color: `EDEDED` (gray)
  - Description: "PR created by AI agent (draft, needs review)"
  - Click "Create label"

- [ ] **Task 2.1.5**: Create `ai-allow-sensitive` label (optional)
  - Name: `ai-allow-sensitive`
  - Color: `B60205` (red)
  - Description: "Allow AI agent to modify high-risk areas (payments, checkout, auth)"
  - Click "Create label"

- [ ] **Task 2.1.6**: Create `ai-no` label (optional)
  - Name: `ai-no`
  - Color: `000000` (black)
  - Description: "Opt-out: Do not let AI agent work on this issue"
  - Click "Create label"

- [ ] **Task 2.1.7**: Document labels in workflow
  - Add comment in workflow YAML explaining each label
  - Document label usage in `docs/ai-agent.md` (create if needed)
  - Add label descriptions to agent code comments

**Deliverable**: All labels created in GitHub, documented

### 2.2: Configure GitHub Actions Permissions
- [ ] **Task 2.2.1**: Check repository settings
  - Go to repo → Settings → Actions → General
  - Verify "Allow GitHub Actions to create and approve pull requests" is enabled
  - If disabled: Enable it (requires admin access)

- [ ] **Task 2.2.2**: Decide on permissions model
  - Option A: Use `GITHUB_TOKEN` (default, recommended for start)
  - Option B: Create GitHub App or PAT (more control, more setup)
  - Recommendation: Start with `GITHUB_TOKEN`, upgrade later if needed
  - Document decision

- [ ] **Task 2.2.3**: Plan required permissions
  - `contents: write` - Create branches, commit files
  - `pull-requests: write` - Create and update PRs
  - `issues: write` - Add comments, update labels
  - `metadata: read` - Read repo metadata (always available)
  - Document in workflow YAML

- [ ] **Task 2.2.4**: Check organization policies (if applicable)
  - If repo is in an organization: Check org settings
  - Verify Actions are allowed to create PRs
  - Check if there are branch protection rules that might block
  - Document any restrictions

**Deliverable**: Permissions plan documented, settings verified

### 2.3: Create GitHub Secrets (if using external API)
- [ ] **Task 2.3.1**: Decide on LLM provider
  - Option A: OpenAI API (most common, easy setup)
  - Option B: Azure OpenAI (if company policy)
  - Option C: Anthropic Claude API
  - Option D: Local model (harder, not recommended for start)
  - Document decision

- [ ] **Task 2.3.2**: Create OpenAI API key secret (if using OpenAI)
  - Go to repo → Settings → Secrets and variables → Actions
  - Click "New repository secret"
  - Name: `OPENAI_API_KEY`
  - Value: Your OpenAI API key (get from https://platform.openai.com/api-keys)
  - Click "Add secret"
  - Document in workflow comments

- [ ] **Task 2.3.3**: Create other required secrets
  - If using Azure: `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`
  - If using Anthropic: `ANTHROPIC_API_KEY`
  - Document all secrets in `docs/ai-agent.md`

- [ ] **Task 2.3.4**: Document secret usage
  - Add to `AGENTS.md`: Which secrets are needed and why
  - Add to workflow YAML: Comments explaining secret usage
  - Never commit secrets to code

**Deliverable**: Secrets created in GitHub, documented

---

## Phase 3: Agent Infrastructure

### 3.1: Create Agent Directory Structure
- [ ] **Task 3.1.1**: Create agent root directory
  - Create folder: `.github/agents/` (or `scripts/ai-agent/`)
  - Recommendation: Use `.github/agents/` to keep it close to workflows
  - Create `.gitkeep` file to ensure folder is tracked

- [ ] **Task 3.1.2**: Create subdirectories
  - Create: `.github/agents/tools/` - Agent tool functions
  - Create: `.github/agents/prompts/` - LLM prompt templates
  - Create: `.github/agents/utils/` - Utility functions
  - Create: `.github/agents/.agent/` - Runtime files (add to `.gitignore`)

- [ ] **Task 3.1.3**: Create main agent script
  - Create file: `.github/agents/agent.js` (or `agent.ts` if using TypeScript)
  - This will be the main entry point
  - Add basic structure: imports, main function, error handling

- [ ] **Task 3.1.4**: Add to .gitignore
  - Add to `.gitignore`: `.github/agents/.agent/` (runtime files)
  - Add: `.github/agents/.agent/**/*` (all runtime files)
  - Keep source files tracked, ignore generated files

**Deliverable**: Directory structure created, main script skeleton

### 3.2: Choose LLM Integration
- [ ] **Task 3.2.1**: Install LLM SDK
  - If using OpenAI: `npm install openai --save-dev`
  - If using Anthropic: `npm install @anthropic-ai/sdk --save-dev`
  - Add to `package.json` devDependencies
  - Document in `AGENTS.md`

- [ ] **Task 3.2.2**: Create LLM client wrapper
  - Create file: `.github/agents/utils/llm-client.js`
  - Export function: `createLLMClient(apiKey, provider)`
  - Support: OpenAI, Anthropic (or chosen provider)
  - Return: Client instance with `chat()` method
  - Add error handling for API failures

- [ ] **Task 3.2.3**: Create prompt builder utility
  - Create file: `.github/agents/utils/prompt-builder.js`
  - Export function: `buildAgentPrompt(issue, context, rules)`
  - Takes: Issue details, repo context, agent rules from `AGENTS.md`
  - Returns: Formatted prompt string for LLM
  - Include: System message, user message, constraints

- [ ] **Task 3.2.4**: Test LLM connection
  - Create test script: `.github/agents/test-llm.js`
  - Simple test: Send "Hello" message, verify response
  - Run locally: `node .github/agents/test-llm.js`
  - Verify API key works, response format is correct
  - Document expected response format

**Deliverable**: LLM integration working, client wrapper created

### 3.3: Create Agent Tools (File Operations)
- [ ] **Task 3.3.1**: Create file reader tool
  - Create file: `.github/agents/tools/file-reader.js`
  - Export function: `readFile(filePath)`
  - Reads file from repo root
  - Returns: File contents as string
  - Handles: File not found, permission errors
  - Add max file size limit (e.g., 1MB) to prevent memory issues

- [ ] **Task 3.3.2**: Create file writer tool
  - Create file: `.github/agents/tools/file-writer.js`
  - Export function: `writeFile(filePath, content)`
  - Writes file to repo root
  - Validates: File path is within repo (no `../` escapes)
  - Validates: File is not in restricted paths (from `AGENTS.md`)
  - Returns: Success/failure status

- [ ] **Task 3.3.3**: Create file searcher tool
  - Create file: `.github/agents/tools/file-searcher.js`
  - Export function: `searchFiles(query, filePattern)`
  - Uses: `ripgrep` or Node.js `fs` + simple grep
  - Searches file contents for query string
  - Returns: Array of `{ file, line, match }`
  - Limits: Max 100 results to prevent overload

- [ ] **Task 3.3.4**: Create directory lister tool
  - Create file: `.github/agents/tools/directory-lister.js`
  - Export function: `listDirectory(dirPath)`
  - Lists files and subdirectories
  - Returns: Array of file/dir names
  - Handles: Directory not found, permission errors

- [ ] **Task 3.3.5**: Create file validator tool
  - Create file: `.github/agents/tools/file-validator.js`
  - Export function: `validateFileChange(filePath, content)`
  - Checks: File is not in restricted paths
  - Checks: File size is reasonable
  - Checks: File extension is allowed (`.ts`, `.tsx`, `.js`, `.jsx`, `.md`, etc.)
  - Returns: `{ valid: boolean, reason?: string }`

**Deliverable**: All file operation tools created and tested

### 3.4: Create Agent Tools (Command Execution)
- [ ] **Task 3.4.1**: Create command runner tool
  - Create file: `.github/agents/tools/command-runner.js`
  - Export function: `runCommand(command, args, options)`
  - Uses: Node.js `child_process.exec` or `spawn`
  - Returns: `{ stdout, stderr, exitCode }`
  - Handles: Timeout (default 5 minutes), errors
  - Captures: Both stdout and stderr

- [ ] **Task 3.4.2**: Create lint runner
  - Create file: `.github/agents/tools/lint-runner.js`
  - Export function: `runLint()`
  - Runs: `npm run lint`
  - Returns: `{ success: boolean, output: string, errors: string[] }`
  - Parses: ESLint output for errors
  - Extracts: File paths and line numbers of errors

- [ ] **Task 3.4.3**: Create test runner
  - Create file: `.github/agents/tools/test-runner.js`
  - Export function: `runTests(testPattern?)`
  - Runs: `npm run test` (or specific test file)
  - Returns: `{ success: boolean, output: string, failures: string[] }`
  - Parses: Test output for failures
  - Handles: Tests not configured (skip gracefully)

- [ ] **Task 3.4.4**: Create build runner
  - Create file: `.github/agents/tools/build-runner.js`
  - Export function: `runBuild()`
  - Runs: `npm run build`
  - Returns: `{ success: boolean, output: string, errors: string[] }`
  - Parses: Build output for errors
  - Extracts: File paths and error messages

- [ ] **Task 3.4.5**: Create install runner
  - Create file: `.github/agents/tools/install-runner.js`
  - Export function: `runInstall()`
  - Runs: `npm ci` (for CI) or `npm install` (for local)
  - Returns: `{ success: boolean, output: string }`
  - Handles: Network errors, package conflicts

**Deliverable**: All command execution tools created and tested

### 3.5: Create Agent Tools (Git Operations)
- [ ] **Task 3.5.1**: Create branch creator tool
  - Create file: `.github/agents/tools/git-branch.js`
  - Export function: `createBranch(issueNumber, issueTitle)`
  - Creates branch: `ai/issue-<num>-<slug>` (e.g., `ai/issue-123-fix-cart-bug`)
  - Uses: `git checkout -b <branch-name>`
  - Returns: Branch name
  - Handles: Branch already exists (append number)

- [ ] **Task 3.5.2**: Create commit tool
  - Create file: `.github/agents/tools/git-commit.js`
  - Export function: `commitChanges(message, files)`
  - Stages: Specific files or all changes
  - Commits: With message format `Fix #<num>: <title>`
  - Uses: `git add` and `git commit`
  - Returns: Commit hash
  - Handles: No changes to commit

- [ ] **Task 3.5.3**: Create push tool
  - Create file: `.github/agents/tools/git-push.js`
  - Export function: `pushBranch(branchName)`
  - Pushes: Branch to origin
  - Uses: `git push origin <branch>`
  - Returns: Success/failure
  - Handles: Push conflicts, authentication errors

- [ ] **Task 3.5.4**: Create diff calculator tool
  - Create file: `.github/agents/tools/git-diff.js`
  - Export function: `calculateDiff()`
  - Calculates: Diff between current branch and base branch
  - Uses: `git diff --stat` and `git diff`
  - Returns: `{ filesChanged: number, linesAdded: number, linesDeleted: number, diff: string }`
  - Used for: Validating diff size limits

**Deliverable**: All Git operation tools created and tested

### 3.6: Create Agent Tools (GitHub API)
- [ ] **Task 3.6.1**: Install GitHub API client
  - Install: `npm install @octokit/rest --save-dev`
  - Or use: Built-in `@actions/github` (if in Actions context)
  - Document in `AGENTS.md`

- [ ] **Task 3.6.2**: Create PR creator tool
  - Create file: `.github/agents/tools/github-pr.js`
  - Export function: `createPR(issueNumber, branchName, title, body)`
  - Uses: GitHub REST API `POST /repos/{owner}/{repo}/pulls`
  - Creates: PR with title, body, base branch, head branch
  - Links: Issue with "Fixes #<number>"
  - Returns: PR number and URL
  - Handles: PR already exists, API errors

- [ ] **Task 3.6.3**: Create comment tool
  - Create file: `.github/agents/tools/github-comment.js`
  - Export function: `addComment(issueNumber, body)`
  - Uses: GitHub REST API `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`
  - Adds: Comment to issue
  - Returns: Comment ID
  - Handles: API errors

- [ ] **Task 3.6.4**: Create label manager tool
  - Create file: `.github/agents/tools/github-labels.js`
  - Export function: `addLabel(issueNumber, label)`
  - Export function: `removeLabel(issueNumber, label)`
  - Uses: GitHub REST API label endpoints
  - Manages: `ai-in-progress`, `ai-blocked`, `ai-draft` labels
  - Returns: Success/failure

- [ ] **Task 3.6.5**: Create issue reader tool
  - Create file: `.github/agents/tools/github-issue.js`
  - Export function: `getIssue(issueNumber)`
  - Uses: GitHub REST API `GET /repos/{owner}/{repo}/issues/{issue_number}`
  - Returns: Issue object with title, body, labels, etc.
  - Handles: Issue not found, API errors

**Deliverable**: All GitHub API tools created and tested

---

## Phase 4: GitHub Actions Workflow

### 4.1: Create Workflow File
- [ ] **Task 4.1.1**: Create workflow directory
  - Create: `.github/workflows/` (if doesn't exist)
  - Verify: Directory is tracked in git

- [ ] **Task 4.1.2**: Create workflow file
  - Create file: `.github/workflows/ai-issue-fix.yml`
  - Add YAML frontmatter
  - Add name: `AI Issue Fixer`
  - Add description comment

- [ ] **Task 4.1.3**: Add workflow triggers
  - Add trigger: `on.issues.types: [labeled]`
  - Add condition: `if: github.event.label.name == 'ai-fix'`
  - Add trigger: `on.issue_comment.types: [created]` (optional, for later)
  - Add condition: `if: contains(github.event.comment.body, '/ai-fix')`
  - Add concurrency: `concurrency: issue-${{ github.event.issue.number }}`
  - Prevents: Multiple agents working on same issue

- [ ] **Task 4.1.4**: Add job definition
  - Add job: `ai-fix`
  - Set: `runs-on: ubuntu-latest`
  - Set: `timeout-minutes: 20`
  - Add: `permissions:` section with required permissions

- [ ] **Task 4.1.5**: Add permissions
  - Add: `contents: write` - For creating branches and commits
  - Add: `pull-requests: write` - For creating PRs
  - Add: `issues: write` - For adding comments and labels
  - Add: `metadata: read` - Always available

**Deliverable**: Workflow file created with basic structure

### 4.2: Add Workflow Steps
- [ ] **Task 4.2.1**: Add checkout step
  - Add step: `checkout`
  - Uses: `actions/checkout@v4`
  - Add: `fetch-depth: 0` (full history for git operations)
  - Add: `token: ${{ secrets.GITHUB_TOKEN }}`

- [ ] **Task 4.2.2**: Add Node.js setup step
  - Add step: `setup-node`
  - Uses: `actions/setup-node@v4`
  - Add: `node-version: '20'` (or your Node version)
  - Add: `cache: 'npm'` (for faster installs)

- [ ] **Task 4.2.3**: Add install dependencies step
  - Add step: `install`
  - Run: `npm ci`
  - Add: Error handling (fail on error)

- [ ] **Task 4.2.4**: Add agent execution step
  - Add step: `run-agent`
  - Run: `node .github/agents/agent.js`
  - Add: Environment variables (API keys, GitHub token)
  - Add: Input: Issue number, repo info from `github.event`
  - Add: Error handling (continue on error, post failure comment)

- [ ] **Task 4.2.5**: Add result posting step (optional)
  - Add step: `post-results`
  - Condition: `if: always()` (runs even on failure)
  - Uses: Custom script or GitHub API to post results
  - Posts: Success/failure comment to issue
  - Updates: Labels based on result

**Deliverable**: Complete workflow with all steps

### 4.3: Add Environment Variables
- [ ] **Task 4.3.1**: Add GitHub token
  - Add env var: `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`
  - Used for: GitHub API calls
  - Available: Automatically in Actions

- [ ] **Task 4.3.2**: Add LLM API key
  - Add env var: `OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}`
  - Or: `ANTHROPIC_API_KEY` if using Anthropic
  - Used for: LLM API calls
  - Required: Must be set in repo secrets

- [ ] **Task 4.3.3**: Add issue context
  - Add env var: `ISSUE_NUMBER: ${{ github.event.issue.number }}`
  - Add env var: `ISSUE_TITLE: ${{ github.event.issue.title }}`
  - Add env var: `ISSUE_BODY: ${{ github.event.issue.body }}`
  - Add env var: `REPO_OWNER: ${{ github.repository_owner }}`
  - Add env var: `REPO_NAME: ${{ github.event.repository.name }}`
  - Used for: Agent context

- [ ] **Task 4.3.4**: Add base branch
  - Add env var: `BASE_BRANCH: ${{ github.event.repository.default_branch }}`
  - Usually: `main` or `master`
  - Used for: Creating PR against correct branch

**Deliverable**: All environment variables configured

### 4.4: Add Error Handling
- [ ] **Task 4.4.1**: Add try-catch in workflow
  - Wrap agent step in error handling
  - On error: Post failure comment to issue
  - On error: Add `ai-blocked` label
  - On error: Remove `ai-fix` label

- [ ] **Task 4.4.2**: Add timeout handling
  - Set: `timeout-minutes: 20` on job
  - In agent code: Set max iterations (6 loops)
  - On timeout: Stop gracefully, post timeout comment

- [ ] **Task 4.4.3**: Add validation steps
  - Before agent: Check issue has `ai-fix` label
  - Before agent: Check issue doesn't have `ai-no` label
  - Before agent: Check issue doesn't have `ai-in-progress` label
  - Fail early if conditions not met

**Deliverable**: Robust error handling in workflow

---

## Phase 5: Agent Core Logic

### 5.1: Issue Intake & Planning
- [ ] **Task 5.1.1**: Create issue parser
  - Create file: `.github/agents/core/issue-parser.js`
  - Export function: `parseIssue(issueData)`
  - Extracts: Title, body, labels, number, state
  - Returns: Structured issue object
  - Handles: Missing fields, markdown in body

- [ ] **Task 5.1.2**: Create context builder
  - Create file: `.github/agents/core/context-builder.js`
  - Export function: `buildContext(issue, repo)`
  - Collects: Issue details, relevant files, agent rules
  - Reads: `AGENTS.md`, `README.md`, `package.json`
  - Returns: Context object for LLM

- [ ] **Task 5.1.3**: Create planning step
  - Create file: `.github/agents/core/planner.js`
  - Export function: `createPlan(issue, context)`
  - Calls: LLM with planning prompt
  - Prompt: "Summarize problem, propose fix plan, list files, list tests"
  - Returns: Plan object `{ summary, approach, files, tests }`
  - Saves: Plan to `.agent/plan.md` for debugging

- [ ] **Task 5.1.4**: Create file shortlister
  - Create file: `.github/agents/core/file-shortlister.js`
  - Export function: `shortlistFiles(issue, plan)`
  - Finds: Files mentioned in issue (code blocks, paths)
  - Finds: Files in related directories (from issue keywords)
  - Finds: Test files for affected code
  - Returns: Array of file paths to focus on

- [ ] **Task 5.1.5**: Load agent rules
  - Create file: `.github/agents/core/rules-loader.js`
  - Export function: `loadRules()`
  - Reads: `AGENTS.md` from repo root
  - Parses: Sections (overview, commands, restrictions, etc.)
  - Returns: Rules object for agent constraints

**Deliverable**: Issue intake and planning system working

### 5.2: Code Edit Iteration Loop
- [ ] **Task 5.2.1**: Create iteration controller
  - Create file: `.github/agents/core/iteration-controller.js`
  - Export function: `runIterations(plan, context, maxIterations)`
  - Loop: Up to `maxIterations` (default 6)
  - Each iteration: Propose edit → Apply → Test → Validate
  - Stops: On success or max iterations reached
  - Returns: `{ success: boolean, iterations: number, finalState: object }`

- [ ] **Task 5.2.2**: Create edit proposer
  - Create file: `.github/agents/core/edit-proposer.js`
  - Export function: `proposeEdit(issue, plan, currentState, errors)`
  - Calls: LLM with edit prompt
  - Prompt: Issue, plan, current code, previous errors
  - Returns: Edit instructions `{ file, action, content }`
  - Actions: `read`, `write`, `replace`, `delete`

- [ ] **Task 5.2.3**: Create edit applier
  - Create file: `.github/agents/core/edit-applier.js`
  - Export function: `applyEdit(edit)`
  - Applies: File changes from edit instructions
  - Validates: File is allowed, path is safe
  - Returns: `{ success: boolean, error?: string }`
  - Logs: All file changes for debugging

- [ ] **Task 5.2.4**: Create validation step
  - Create file: `.github/agents/core/validator.js`
  - Export function: `validateChanges()`
  - Runs: `npm run lint`
  - Runs: `npm run test` (if exists)
  - Runs: `npm run build` (optional)
  - Returns: `{ lint: {...}, test: {...}, build: {...} }`
  - Extracts: Errors for feedback loop

- [ ] **Task 5.2.5**: Create feedback loop
  - Create file: `.github/agents/core/feedback-loop.js`
  - Export function: `createFeedback(errors, iteration)`
  - Formats: Lint errors, test failures, build errors
  - Creates: Feedback message for LLM
  - Includes: File paths, line numbers, error messages
  - Returns: Feedback string for next iteration

- [ ] **Task 5.2.6**: Add change limits
  - In iteration controller: Track files changed
  - Enforce: Max 15 files per PR
  - Enforce: Max 800 lines diff
  - On limit: Stop iteration, label `ai-blocked`, comment reason

**Deliverable**: Complete edit iteration loop with validation

### 5.3: Commit and PR Creation
- [ ] **Task 5.3.1**: Create branch name generator
  - Create file: `.github/agents/core/branch-namer.js`
  - Export function: `generateBranchName(issueNumber, issueTitle)`
  - Format: `ai/issue-<num>-<slug>`
  - Slug: Lowercase, alphanumeric, hyphens only
  - Max length: 50 characters
  - Handles: Duplicate branch names (append number)

- [ ] **Task 5.3.2**: Create commit message generator
  - Create file: `.github/agents/core/commit-message.js`
  - Export function: `generateCommitMessage(issueNumber, issueTitle, changes)`
  - Format: `Fix #<num>: <title>`
  - Optional: Add brief change summary
  - Returns: Commit message string

- [ ] **Task 5.3.3**: Create PR body generator
  - Create file: `.github/agents/core/pr-body-generator.js`
  - Export function: `generatePRBody(issue, plan, changes, testResults)`
  - Includes: Summary, What changed, How to test, Risk/rollback
  - Uses: LLM to write natural language description
  - Format: Markdown with sections
  - Links: To issue with "Fixes #<number>"

- [ ] **Task 5.3.4**: Create PR creator
  - Create file: `.github/agents/core/pr-creator.js`
  - Export function: `createPR(branchName, title, body, baseBranch)`
  - Uses: GitHub API tool
  - Creates: PR with title, body, base, head
  - Sets: Draft if tests failed, ready if all passed
  - Adds: Labels (`ai-draft` if draft)
  - Returns: PR number and URL

- [ ] **Task 5.3.5**: Create issue comment poster
  - Create file: `.github/agents/core/comment-poster.js`
  - Export function: `postComment(issueNumber, message)`
  - Uses: GitHub API tool
  - Posts: Summary of work done, PR link, test results
  - Format: Markdown with clear sections

**Deliverable**: Complete commit and PR creation flow

### 5.4: Main Agent Orchestrator
- [ ] **Task 5.4.1**: Create main agent function
  - Create file: `.github/agents/agent.js` (main entry)
  - Export function: `main()`
  - Flow: Parse issue → Build context → Create plan → Run iterations → Commit → PR → Comment
  - Handles: All errors gracefully
  - Logs: Progress to console for debugging

- [ ] **Task 5.4.2**: Add CLI argument parsing
  - Parse: Issue number from env var or CLI arg
  - Parse: GitHub token from env var
  - Parse: API key from env var
  - Validate: All required inputs present
  - Exit: With error if missing

- [ ] **Task 5.4.3**: Add logging system
  - Create file: `.github/agents/utils/logger.js`
  - Export function: `log(level, message, data)`
  - Levels: `info`, `warn`, `error`, `debug`
  - Outputs: To console and `.agent/logs.txt`
  - Format: Timestamp, level, message, data

- [ ] **Task 5.4.4**: Add state persistence
  - Create file: `.github/agents/utils/state.js`
  - Export function: `saveState(state)`
  - Export function: `loadState()`
  - Saves: To `.agent/state.json`
  - Used for: Resuming if agent crashes, debugging

- [ ] **Task 5.4.5**: Add cleanup on exit
  - On success: Remove `ai-in-progress` label
  - On success: Add `ai-draft` label if PR is draft
  - On failure: Add `ai-blocked` label
  - On failure: Remove `ai-fix` label
  - Always: Post final comment with results

**Deliverable**: Complete agent orchestrator ready for testing

---

## Phase 6: Safety & Guardrails

### 6.1: Secrets Safety
- [ ] **Task 6.1.1**: Add secret scanner
  - Create file: `.github/agents/safety/secret-scanner.js`
  - Export function: `scanForSecrets(content)`
  - Scans: For common secret patterns (API keys, passwords, tokens)
  - Patterns: `sk_live_`, `AKIA`, `ghp_`, etc.
  - Returns: `{ found: boolean, matches: string[] }`
  - Blocks: Commits with secrets

- [ ] **Task 6.1.2**: Add log sanitizer
  - Create file: `.github/agents/safety/log-sanitizer.js`
  - Export function: `sanitizeLogs(logs)`
  - Removes: Secret patterns from log output
  - Replaces: With `[REDACTED]`
  - Prevents: Secrets in GitHub Actions logs

- [ ] **Task 6.1.3**: Add .env file blocker
  - In file validator: Block commits to `.env` files
  - In file validator: Block commits to `.env.*` files (except `.env.example`)
  - Error message: "Cannot commit .env files"
  - Prevents: Accidental secret commits

- [ ] **Task 6.1.4**: Add secret detection in PR description
  - In PR body generator: Scan description for secrets
  - If found: Remove or redact before posting
  - Prevents: Secrets in PR descriptions

**Deliverable**: Secret scanning and protection implemented

### 6.2: Permissions Hardening
- [ ] **Task 6.2.1**: Review workflow permissions
  - Audit: All permissions in workflow YAML
  - Principle: Least privilege (only what's needed)
  - Remove: Unused permissions
  - Document: Why each permission is needed

- [ ] **Task 6.2.2**: Add path restrictions
  - In file validator: Check against restricted paths from `AGENTS.md`
  - Block: `.github/workflows/` (unless issue explicitly requests)
  - Block: `package-lock.json` (unless issue explicitly requests)
  - Block: Config files (unless issue explicitly requests)
  - Error: Clear message explaining restriction

- [ ] **Task 6.2.3**: Add high-risk area protection
  - In file validator: Check for high-risk paths
  - Paths: Payment, checkout, auth, webhook routes
  - Rule: Only allow if issue has `ai-allow-sensitive` label
  - Error: "High-risk area. Add 'ai-allow-sensitive' label to proceed."

- [ ] **Task 6.2.4**: Add file extension whitelist
  - In file validator: Only allow specific extensions
  - Allowed: `.ts`, `.tsx`, `.js`, `.jsx`, `.md`, `.json`, `.css`, `.scss`
  - Block: Binary files, executables
  - Error: "File type not allowed"

**Deliverable**: Permissions and path restrictions enforced

### 6.3: External Access Restrictions
- [ ] **Task 6.3.1**: Disable web browsing
  - In agent tools: Do not include web browsing tool
  - In LLM prompt: Explicitly state "No web browsing allowed"
  - Exception: GitHub API (whitelisted)
  - Exception: npm registry (if needed for package info)

- [ ] **Task 6.3.2**: Restrict API calls
  - In agent code: Only allow GitHub API calls
  - Block: External HTTP requests (except GitHub, npm)
  - Add: Network request validator
  - Error: "External API calls not allowed"

- [ ] **Task 6.3.3**: Add rate limiting
  - In GitHub API tool: Add rate limit checking
  - Respect: GitHub API rate limits
  - Retry: With exponential backoff
  - Error: Clear message if rate limited

**Deliverable**: External access restricted and controlled

### 6.4: Human Review Requirements
- [ ] **Task 6.4.1**: Configure branch protection (if applicable)
  - In repo settings: Set up branch protection for main branch
  - Require: At least 1 approval before merge
  - Require: Status checks to pass
  - Prevents: Auto-merge of AI PRs

- [ ] **Task 6.4.2**: Make PRs draft by default (optional)
  - In PR creator: Set `draft: true` initially
  - Convert: To ready after all tests pass
  - Or: Always create as draft for human review
  - Label: Add `ai-draft` label

- [ ] **Task 6.4.3**: Add review checklist in PR
  - In PR body: Add review checklist
  - Items: "Code changes look correct", "Tests pass", "No secrets", "Follows style guide"
  - Helps: Human reviewers know what to check

**Deliverable**: Human review process configured

---

## Phase 7: Testing & Rollout

### 7.1: Local Testing
- [ ] **Task 7.1.1**: Create test issue JSON
  - Create file: `.github/agents/test/test-issue.json`
  - Sample: Issue data matching GitHub API format
  - Include: Title, body, labels, number
  - Used for: Local testing without real GitHub issue

- [ ] **Task 7.1.2**: Create local test script
  - Create file: `.github/agents/test/test-local.js`
  - Script: Runs agent with test issue JSON
  - Mocks: GitHub API calls (optional, or use test token)
  - Verifies: Agent creates branch, commits, would create PR
  - Outputs: Test results

- [ ] **Task 7.1.3**: Test file operations
  - Test: File read, write, search tools
  - Test: Path validation (block restricted paths)
  - Test: Secret scanning
  - Verify: All tools work correctly

- [ ] **Task 7.1.4**: Test command execution
  - Test: Lint runner (should pass on clean repo)
  - Test: Build runner (should pass)
  - Test: Test runner (if exists)
  - Verify: Error handling works

- [ ] **Task 7.1.5**: Test Git operations
  - Test: Branch creation
  - Test: Commit creation
  - Test: Diff calculation
  - Verify: All Git commands work

- [ ] **Task 7.1.6**: Test full flow (dry run)
  - Run: Agent with test issue
  - Verify: Creates branch
  - Verify: Makes changes (or simulates)
  - Verify: Would create PR (don't actually create)
  - Check: Logs are clean, no errors

**Deliverable**: Agent tested locally, all components working

### 7.2: GitHub Testing
- [ ] **Task 7.2.1**: Create test issue
  - Create: Simple test issue in GitHub
  - Example: "Fix typo in README: 'evega' should be 'Evega'"
  - Add: `ai-fix` label
  - Monitor: GitHub Actions workflow runs

- [ ] **Task 7.2.2**: Monitor workflow execution
  - Watch: GitHub Actions tab for workflow run
  - Check: All steps complete successfully
  - Review: Agent logs for errors
  - Verify: Branch created, PR opened

- [ ] **Task 7.2.3**: Verify PR quality
  - Check: PR title format is correct
  - Check: PR description is complete
  - Check: PR links to issue
  - Check: Changes are correct
  - Check: Tests pass (if applicable)

- [ ] **Task 7.2.4**: Test error handling
  - Create: Issue that will fail (e.g., modify restricted file)
  - Add: `ai-fix` label
  - Verify: Agent handles error gracefully
  - Verify: `ai-blocked` label added
  - Verify: Error comment posted

- [ ] **Task 7.2.5**: Test label management
  - Verify: `ai-in-progress` added when agent starts
  - Verify: `ai-in-progress` removed when done
  - Verify: `ai-draft` added if PR is draft
  - Verify: `ai-blocked` added on failure

**Deliverable**: Agent tested on real GitHub issues, working correctly

### 7.3: Documentation
- [ ] **Task 7.3.1**: Create usage documentation
  - Create file: `docs/ai-agent.md`
  - Include: How to trigger (label or comment)
  - Include: What the agent does
  - Include: How to stop (remove label, add `ai-no`)
  - Include: How to interpret `ai-blocked`
  - Include: Best practices for issue descriptions

- [ ] **Task 7.3.2**: Document limitations
  - In `docs/ai-agent.md`: List what agent can't do
  - Examples: Large refactors, payment changes (without label), etc.
  - Explain: Why restrictions exist
  - Provide: Alternatives for restricted tasks

- [ ] **Task 7.3.3**: Document troubleshooting
  - In `docs/ai-agent.md`: Common issues and solutions
  - Examples: Agent stuck, tests failing, PR not created
  - Include: How to check logs
  - Include: How to manually clean up (remove labels, close PRs)

- [ ] **Task 7.3.4**: Update main README
  - Add: Section about AI agent in main README
  - Link: To `docs/ai-agent.md`
  - Brief: One-paragraph description
  - Note: It's experimental/optional

**Deliverable**: Complete documentation for users

### 7.4: Rollout Plan
- [ ] **Task 7.4.1**: Start with small issues
  - First: Test on typo fixes, documentation updates
  - Then: Test on small bug fixes
  - Gradually: Increase complexity
  - Monitor: Success rate, PR quality

- [ ] **Task 7.4.2**: Set up monitoring
  - Track: Number of issues processed
  - Track: Success rate
  - Track: Average time to PR
  - Track: PR merge rate
  - Document: In `docs/ai-agent-stats.md` (optional)

- [ ] **Task 7.4.3**: Gather feedback
  - Ask: Team to try it on real issues
  - Collect: Feedback on PR quality
  - Collect: Feedback on agent behavior
  - Iterate: Based on feedback

- [ ] **Task 7.4.4**: Refine based on usage
  - Adjust: Prompt templates based on results
  - Adjust: Restrictions based on needs
  - Add: New features based on requests
  - Update: Documentation as needed

**Deliverable**: Agent rolled out and refined based on real usage

---

## Phase 8: Enhancements (Optional)

### 8.1: Smarter File Selection
- [ ] **Task 8.1.1**: Add code indexing
  - Create: Lightweight code index using ripgrep
  - Index: Function names, class names, exports
  - Use: For smarter file selection based on issue keywords
  - Store: Index in `.agent/index.json` (gitignored)

- [ ] **Task 8.1.2**: Add test selection logic
  - Identify: Test files related to changed code
  - Run: Targeted tests first (faster feedback)
  - Fallback: Run all tests if targeted tests pass
  - Improves: Iteration speed

- [ ] **Task 8.1.3**: Add dependency analysis
  - Analyze: Which files import changed files
  - Suggest: Related files that might need updates
  - Helps: Catch breaking changes early

**Deliverable**: Smarter file and test selection

### 8.2: Enhanced PR Features
- [ ] **Task 8.2.1**: Add auto-formatting step
  - Before commit: Run `npm run lint -- --fix` (if available)
  - Or: Run Prettier if configured
  - Ensures: Code is formatted before PR
  - Reduces: Lint failures

- [ ] **Task 8.2.2**: Add changelog enforcement
  - Check: If changes require changelog update
  - Prompt: LLM to update changelog if needed
  - Ensures: Documentation stays up to date

- [ ] **Task 8.2.3**: Add screenshot generation (for UI changes)
  - Detect: UI-related changes
  - Optionally: Generate screenshots (requires headless browser)
  - Attach: To PR description
  - Helps: Reviewers see visual changes

**Deliverable**: Enhanced PR features

### 8.3: Learning & Memory
- [ ] **Task 8.3.1**: Add success pattern storage
  - Save: Successful fix patterns to `.agent/memory/`
  - Format: `{ issueType, filesChanged, approach, result }`
  - Use: To inform future similar issues
  - Careful: Don't store too much (noise)

- [ ] **Task 8.3.2**: Add failure pattern storage
  - Save: Failure patterns (what didn't work)
  - Use: To avoid repeating mistakes
  - Helps: Agent learn from past failures

- [ ] **Task 8.3.3**: Add issue categorization
  - Categorize: Issues by type (bug, feature, docs, etc.)
  - Use: Different strategies for different types
  - Improves: Agent effectiveness

**Deliverable**: Learning system (optional, advanced)

---

## Quick Reference

### Key Files to Create
- `AGENTS.md` - Agent rules and constraints
- `.github/workflows/ai-issue-fix.yml` - GitHub Actions workflow
- `.github/agents/agent.js` - Main agent script
- `.github/agents/tools/*.js` - Agent tools (file ops, git, GitHub API)
- `.github/agents/core/*.js` - Core logic (planning, iteration, PR creation)
- `.github/agents/safety/*.js` - Safety checks (secrets, permissions)
- `docs/ai-agent.md` - User documentation

### Key Commands
- Install: `npm ci`
- Lint: `npm run lint`
- Test: `npm run test` (if exists)
- Build: `npm run build`

### Key Labels
- `ai-fix` - Trigger agent
- `ai-in-progress` - Agent working
- `ai-blocked` - Agent stuck/failed
- `ai-draft` - PR is draft
- `ai-allow-sensitive` - Allow high-risk changes

### Key Restrictions
- No web browsing
- No secrets in commits/logs
- No high-risk areas without label
- Max 15 files, 800 lines per PR
- Max 6 iterations, 20 minutes

---

**Last Updated**: [Current Date]
**Status**: Ready to Start
**Estimated Total Time**: 20-40 hours (depending on experience level)
