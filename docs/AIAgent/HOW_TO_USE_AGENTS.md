# How to Use the AI Agents

> **User guide for using the CTO, Architect, and QA agents in the Evega project**

## Quick Start

### Switch to an Agent

```bash
# Switch to CTO Agent
./scripts/switch-agent.sh cto

# Switch to Architect Agent
./scripts/switch-agent.sh architect

# Switch to QA Agent
./scripts/switch-agent.sh qa
```

**Then reload Cursor**: `Cmd+Shift+P` > "Reload Window"

---

## Agent Overview

| Agent | Role | When to Use |
|-------|------|-------------|
| **CTO** | Strategic planning, risk assessment, go/no-go decisions | Planning, prioritization, status reviews, launch decisions |
| **Architect** | Code implementation, architecture design | Writing code, designing features, technical decisions |
| **QA** | Testing, quality assurance, bug detection | Creating tests, quality checks, bug finding |

---

## Method 1: Switch Rules File (Recommended)

### Step-by-Step

1. **Run the switch script**:
   ```bash
   ./scripts/switch-agent.sh [cto|architect|qa]
   ```

2. **Reload Cursor window**:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Type "Reload Window"
   - Press Enter

3. **Verify agent is active**:
   - Open Cursor Chat (`Cmd+L` or `Ctrl+L`)
   - Ask: "What is your role?"
   - Agent should respond with their role

### Quick Switch Commands

```bash
# CTO Agent
./scripts/switch-agent.sh cto

# Architect Agent
./scripts/switch-agent.sh architect

# QA Agent
./scripts/switch-agent.sh qa
```

---

## Method 2: Explicit Agent Declaration

You can explicitly tell Cursor which agent to act as in your prompts:

### CTO Agent
```
"Act as CTO. Review the project status and provide strategic recommendations 
for the March 15th launch."
```

### Architect Agent
```
"Act as Technical Architect. Design the implementation for [feature] following 
our architecture patterns."
```

### QA Agent
```
"Act as QA Engineer. Generate comprehensive tests for [feature] including 
unit, integration, and E2E tests."
```

**Note**: This method works but is less effective than switching the rules file.

---

## Method 3: Using Cursor Composer

In Cursor Composer (`Cmd+I` or `Ctrl+I`), start your request with the agent role:

### CTO Agent
```
"CTO Agent: Assess launch readiness and identify blockers for March 15th launch."
```

### Architect Agent
```
"Architect Agent: Implement [feature] following our codebase patterns. Include 
proper error handling and access control."
```

### QA Agent
```
"QA Agent: Create comprehensive test suite for [module] including unit tests, 
integration tests, and edge cases."
```

---

## Common Use Cases

### Daily Workflow

#### Morning (CTO Agent)
```bash
./scripts/switch-agent.sh cto
# Reload Cursor
```
**Prompt**:
```
"CTO Agent: Conduct morning standup:
- Review yesterday's progress
- Assess current status
- Identify today's top 3 priorities
- Flag blockers
- Provide strategic direction"
```

#### Development (Architect Agent)
```bash
./scripts/switch-agent.sh architect
# Reload Cursor
```
**Prompt**:
```
"Architect Agent: Implement [feature] following our codebase patterns:
- Use Server Components by default
- Implement proper TypeScript types (no `any`)
- Add access control (vendor scoping)
- Include comprehensive error handling
- Add loading states
- Follow existing code patterns"
```

#### End of Day (QA Agent)
```bash
./scripts/switch-agent.sh qa
# Reload Cursor
```
**Prompt**:
```
"QA Agent: Run quality checks on today's work:
- Test today's implementations
- Check for bugs
- Assess quality metrics
- Generate quality report"
```

---

## Feature Implementation Workflow

### Step 1: CTO Agent - Strategic Planning

**Switch to CTO**:
```bash
./scripts/switch-agent.sh cto
```

**Prompt**:
```
"CTO Agent: Review DETAILED_TASKS.md and identify the next critical feature 
to implement for March 15th launch. Assess:
- Priority level (critical/nice-to-have)
- Dependencies
- Risks
- Estimated effort
Provide go/no-go decision with rationale."
```

**Output**: Feature specification, priority, risks, approval

---

### Step 2: Architect Agent - Technical Design

**Switch to Architect**:
```bash
./scripts/switch-agent.sh architect
```

**Prompt**:
```
"Architect Agent: Design the technical implementation for [feature from CTO]:
- Review existing architecture patterns
- Design data model (Payload collections if needed)
- Design tRPC API structure
- Design UI component structure
- Plan access control (vendor scoping)
- Include error handling approach
- Provide detailed implementation plan"
```

**Output**: Technical design document, architecture diagram, implementation plan

---

### Step 3: Architect Agent - Implementation

**Stay on Architect**:
```bash
# Already on Architect from Step 2
```

**Prompt**:
```
"Architect Agent: Implement [feature] following the design:
- Use Server Components by default
- Implement proper TypeScript types (no `any`)
- Add access control (vendor scoping)
- Include comprehensive error handling
- Add loading states
- Follow existing code patterns
- Add comments for complex logic"
```

**Output**: Complete implementation, code files, documentation

---

### Step 4: QA Agent - Test Generation

**Switch to QA**:
```bash
./scripts/switch-agent.sh qa
```

**Prompt**:
```
"QA Agent: Create comprehensive tests for [feature]:
- Review the implementation
- Generate unit tests for business logic
- Create integration tests for workflows
- Build E2E tests for user journeys
- Test edge cases and error scenarios
- Ensure >80% coverage for critical paths"
```

**Output**: Test files, test coverage report, test execution results

---

### Step 5: QA Agent - Quality Check

**Stay on QA**:
```bash
# Already on QA from Step 4
```

**Prompt**:
```
"QA Agent: Review [feature] implementation for quality:
- Scan code for bugs
- Check for security vulnerabilities
- Assess code quality
- Verify test coverage
- Test error handling
- Provide quality report with findings"
```

**Output**: Quality report, bug list (if any), recommendations

---

### Step 6: Architect Agent - Fix Issues

**Switch to Architect**:
```bash
./scripts/switch-agent.sh architect
```

**Prompt**:
```
"Architect Agent: Fix issues identified by QA:
- Review QA quality report
- Fix all bugs (prioritize by severity)
- Address security issues
- Improve code quality
- Update tests if needed
- Verify fixes work correctly"
```

**Output**: Fixed code, updated tests, verification

---

### Step 7: QA Agent - Verification

**Switch to QA**:
```bash
./scripts/switch-agent.sh qa
```

**Prompt**:
```
"QA Agent: Verify fixes for [feature]:
- Re-run all tests
- Verify bug fixes work
- Check quality improvements
- Perform final quality assessment
- Approve or identify remaining issues"
```

**Output**: Verification report, approval or additional issues

---

### Step 8: CTO Agent - Final Approval

**Switch to CTO**:
```bash
./scripts/switch-agent.sh cto
```

**Prompt**:
```
"CTO Agent: Review and approve [feature] for launch:
- Review implementation quality
- Check test coverage
- Assess quality metrics
- Evaluate launch readiness
- Make go/no-go decision
- Update DETAILED_TASKS.md if approved"
```

**Output**: Approval decision, updated task status, launch readiness update

---

## Agent-Specific Prompts

### CTO Agent Prompts

**Daily Standup**:
```
"CTO Agent: Conduct morning standup:
- Review yesterday's progress
- Assess current status
- Identify today's top 3 priorities
- Flag blockers
- Provide strategic direction"
```

**Weekly Review**:
```
"CTO Agent: Provide weekly status report including:
- Progress against roadmap
- Risk assessment
- Resource allocation
- Launch readiness score
- Strategic recommendations"
```

**Risk Assessment**:
```
"CTO Agent: Analyze the codebase and project status for risks that could impact 
the March 15th launch. Prioritize risks by severity and likelihood."
```

**Go/No-Go Decision**:
```
"CTO Agent: Assess if we're ready for production launch. Consider:
- Feature completeness
- Bug status
- Test coverage
- Performance
- Security
Provide go/no-go recommendation with rationale."
```

**Resource Allocation**:
```
"CTO Agent: Review current task priorities and recommend resource allocation 
for the next sprint to maximize launch readiness."
```

---

### Architect Agent Prompts

**Feature Implementation**:
```
"Architect Agent: Implement [feature] following our codebase patterns:
- Use Server Components by default
- Implement proper TypeScript types (no `any`)
- Add access control (vendor scoping)
- Include comprehensive error handling
- Add loading states
- Follow existing code patterns"
```

**Code Review**:
```
"Architect Agent: Review [file/module] for:
- Code quality
- TypeScript types (no `any`)
- Error handling
- Access control
- Performance
- Security
Provide review with recommendations."
```

**Architecture Design**:
```
"Architect Agent: Design the architecture for [feature]:
- Review existing patterns
- Design data model
- Design API structure
- Design component structure
- Plan access control
- Include error handling approach"
```

**Debugging**:
```
"Architect Agent: Debug [issue]:
- Review error logs
- Identify root cause
- Propose fix
- Test solution
- Verify fix works"
```

---

### QA Agent Prompts

**Test Generation**:
```
"QA Agent: Create comprehensive tests for [feature]:
- Review the implementation
- Generate unit tests for business logic
- Create integration tests for workflows
- Build E2E tests for user journeys
- Test edge cases and error scenarios
- Ensure >80% coverage for critical paths"
```

**Quality Check**:
```
"QA Agent: Review [feature] implementation for quality:
- Scan code for bugs
- Check for security vulnerabilities
- Assess code quality
- Verify test coverage
- Test error handling
- Provide quality report with findings"
```

**Bug Analysis**:
```
"QA Agent: Analyze [bug/error]:
- Reproduce the issue
- Identify root cause
- Assess severity
- Document reproduction steps
- Recommend fix approach"
```

**Test Coverage Review**:
```
"QA Agent: Review test coverage for [module]:
- Check current coverage percentage
- Identify gaps
- Prioritize missing tests
- Recommend test additions
- Provide coverage report"
```

---

## Best Practices

### 1. Switch Agents Intentionally
- Don't mix agent roles in one session
- Use the appropriate agent for each task type
- Switch when moving to a different phase of work

### 2. Always Reload After Switching
- Run `./scripts/switch-agent.sh [agent]`
- Reload Cursor window (`Cmd+Shift+P` > "Reload Window")
- Verify agent is active before proceeding

### 3. Provide Context When Switching
- Summarize what was done before switching
- Explain what needs to happen next
- Include relevant information

### 4. Use Agent-Specific Prompts
- Reference prompts from `.cursor/agents/*/prompts.md`
- Use role-appropriate language
- Be specific about what you need

### 5. Document Important Decisions
- Have CTO agent document strategic decisions
- Update `DETAILED_TASKS.md` when features complete
- Keep documentation up to date

---

## Troubleshooting

### Agent Not Responding Correctly

**Problem**: Agent doesn't seem to be following their role

**Solution**:
1. Verify you reloaded Cursor after switching
2. Check that `.cursorrules` exists and has the right content
3. Try explicit agent declaration in prompts
4. Reload Cursor window again

### Rules File Not Found

**Problem**: Script says rules file not found

**Solution**:
1. Ensure `.cursorrules.cto`, `.cursorrules.architect`, `.cursorrules.qa` exist
2. Check file permissions
3. Verify you're in the project root directory

### Agent Context Not Working

**Problem**: Agent doesn't have project context

**Solution**:
1. Try explicit agent declaration in prompts
2. Reload Cursor window
3. Provide context in your prompt
4. Reference project documentation in prompts

---

## Quick Reference

### Switch Commands
```bash
./scripts/switch-agent.sh cto
./scripts/switch-agent.sh architect
./scripts/switch-agent.sh qa
```

### Verification
Ask in Cursor Chat: "What is your role?"

### Reload Cursor
`Cmd+Shift+P` > "Reload Window"

### Agent Files
- `.cursorrules.cto` - CTO agent config
- `.cursorrules.architect` - Architect agent config
- `.cursorrules.qa` - QA agent config
- `.cursor/agents/*/prompts.md` - Agent prompt libraries

---

## Summary

**To use an agent**:
1. Run `./scripts/switch-agent.sh [agent]`
2. Reload Cursor window
3. Use agent-specific prompts
4. Get role-appropriate responses

**Workflow**:
- **CTO** → Strategic planning and approval
- **Architect** → Implementation and fixes
- **QA** → Testing and quality checks

**Remember**: Each agent has a specific role. Use them appropriately and let them collaborate effectively to deliver quality features for the March 15th launch.
