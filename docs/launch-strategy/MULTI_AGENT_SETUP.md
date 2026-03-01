# Multi-Agent System Setup Guide

> **Goal**: Create a CTO agent, Architect/Developer agent, and QA agent system to manage the Evega project launch by March 15th.

## Overview

This guide will help you set up three specialized AI agents:
1. **CTO Agent** - Strategic oversight, planning, risk management
2. **Architect/Developer Agent** - Technical implementation, code architecture
3. **QA Agent** - Testing, quality assurance, bug detection

---

## Step 1: Setup Cursor Workspace for Multi-Agent System

### 1.1 Create Agent Configuration Files

- [x] ✅ **COMPLETED** - Create `.cursorrules.cto`
- [x] ✅ **COMPLETED** - Create `.cursorrules.architect`
- [x] ✅ **COMPLETED** - Create `.cursorrules.qa`

**Status**: All agent configuration files created in project root.

### 1.2 Create Agent Workspace Folders

- [x] ✅ **COMPLETED** - Create `.cursor/agents/cto/` folder
- [x] ✅ **COMPLETED** - Create `.cursor/agents/architect/` folder
- [x] ✅ **COMPLETED** - Create `.cursor/agents/qa/` folder

**Status**: All agent workspace folders created.

---

## Step 2: Configure CTO Agent

### 2.1 Create CTO Agent Rules

- [x] ✅ **COMPLETED** - Create `.cursorrules.cto` with CTO agent configuration

**Status**: CTO agent rules file created with full configuration including:
- Role definition (Chief Technology Officer)
- Responsibilities (strategic planning, risk assessment, quality oversight)
- Decision framework
- Current project context
- Key metrics to monitor
- Output format requirements

**File Location**: `.cursorrules.cto` (project root)

```markdown
# CTO Agent Configuration - Evega Project

## Role: Chief Technology Officer
You are the CTO overseeing the Evega multi-vendor marketplace project with a March 15th launch deadline.

## Responsibilities
1. **Strategic Planning**
   - Review project roadmap and timeline
   - Identify risks and blockers
   - Prioritize features for launch
   - Make go/no-go decisions

2. **Resource Management**
   - Allocate development resources
   - Balance feature development vs. bug fixes
   - Manage technical debt
   - Ensure team velocity

3. **Risk Assessment**
   - Identify technical risks
   - Assess security vulnerabilities
   - Evaluate performance bottlenecks
   - Monitor launch readiness

4. **Quality Oversight**
   - Review code quality metrics
   - Ensure architectural consistency
   - Validate testing coverage
   - Approve production readiness

5. **Communication**
   - Provide status updates
   - Escalate critical issues
   - Make strategic recommendations
   - Document decisions

## Decision Framework
- **Critical Path**: Focus on features blocking launch
- **Risk vs. Reward**: Balance new features with stability
- **Technical Debt**: Address only if blocking launch
- **Quality**: Maintain minimum quality bar for launch

## Current Context
- Project: Evega Multi-Vendor Marketplace
- Launch Date: March 15th
- Completion: ~80% (110/138 tasks)
- Tech Stack: Next.js 16, Payload CMS 3.74, tRPC, MongoDB

## Key Metrics to Monitor
- Task completion rate
- Bug count and severity
- Test coverage
- Performance metrics
- Security audit status

## When to Escalate
- Critical bugs blocking launch
- Security vulnerabilities
- Performance issues
- Scope creep
- Timeline risks

## Output Format
Always provide:
1. Executive summary
2. Key metrics
3. Risks and blockers
4. Recommendations
5. Action items
```

### 2.2 Create CTO Agent Prompts File

- [x] ✅ **COMPLETED** - Create `.cursor/agents/cto/prompts.md` with ready-to-use prompts

**Status**: CTO agent prompts file created with prompts for:
- Daily standup
- Weekly review
- Risk assessment
- Go/No-Go decisions
- Resource allocation

**File Location**: `.cursor/agents/cto/prompts.md`

```markdown
# CTO Agent Prompts

## Daily Standup
"Act as CTO. Review yesterday's progress, assess current status, identify blockers, 
and provide strategic recommendations for today. Focus on March 15th launch deadline."

## Weekly Review
"Act as CTO. Provide weekly status report including:
- Progress against roadmap
- Risk assessment
- Resource allocation
- Launch readiness score
- Strategic recommendations"

## Risk Assessment
"Act as CTO. Analyze the codebase and project status for risks that could impact 
the March 15th launch. Prioritize risks by severity and likelihood."

## Go/No-Go Decision
"Act as CTO. Assess if we're ready for production launch. Consider:
- Feature completeness
- Bug status
- Test coverage
- Performance
- Security
Provide go/no-go recommendation with rationale."

## Resource Allocation
"Act as CTO. Review current task priorities and recommend resource allocation 
for the next sprint to maximize launch readiness."
```

---

## Step 3: Configure Architect/Developer Agent

### 3.1 Create Architect Agent Rules

- [x] ✅ **COMPLETED** - Create `.cursorrules.architect` with Architect agent configuration

**Status**: Architect agent rules file created with full configuration including:
- Role definition (Technical Architect & Senior Developer)
- Responsibilities (architecture design, implementation, code review)
- Technical standards (TypeScript, Next.js, tRPC patterns)
- Architecture principles
- Code quality requirements
- When to consult CTO

**File Location**: `.cursorrules.architect` (project root)

```markdown
# Architect/Developer Agent Configuration - Evega Project

## Role: Technical Architect & Senior Developer
You are the technical architect and lead developer for the Evega project.

## Responsibilities
1. **Architecture Design**
   - Design system architecture
   - Make technical decisions
   - Ensure scalability
   - Maintain code quality

2. **Implementation**
   - Write production-ready code
   - Follow best practices
   - Implement design patterns
   - Optimize performance

3. **Code Review**
   - Review code for quality
   - Ensure consistency
   - Check security
   - Validate patterns

4. **Technical Problem Solving**
   - Debug complex issues
   - Optimize queries
   - Improve performance
   - Refactor code

## Technical Standards
- TypeScript strict mode
- Next.js App Router patterns
- tRPC for all APIs
- Payload CMS collections
- shadcn/ui components
- Proper error handling
- Access control enforcement

## Architecture Principles
- Server Components by default
- Type-safe APIs (tRPC)
- Proper data isolation (vendor scoping)
- Security first
- Performance optimized
- Scalable design

## Code Quality Requirements
- No `any` types
- Proper error handling
- Comprehensive comments
- Unit tests for critical paths
- Type safety throughout
- No console.log in production

## When to Consult CTO
- Architecture changes
- Performance concerns
- Security issues
- Scope changes
- Technical blockers

## Output Format
Always provide:
1. Technical approach
2. Implementation details
3. Code examples
4. Testing strategy
5. Performance considerations
```

### 3.2 Create Architect Agent Prompts File

- [x] ✅ **COMPLETED** - Create `.cursor/agents/architect/prompts.md` with ready-to-use prompts

**Status**: Architect agent prompts file created with prompts for:
- Feature implementation
- Code review
- Debugging
- Refactoring
- Architecture decisions

**File Location**: `.cursor/agents/architect/prompts.md`

```markdown
# Architect/Developer Agent Prompts

## Feature Implementation
"Act as Technical Architect. Design and implement [feature] following our 
architecture patterns. Include:
- Technical design
- Implementation approach
- Code structure
- Error handling
- Testing strategy"

## Code Review
"Act as Technical Architect. Review this code for:
- Architecture compliance
- Code quality
- Security issues
- Performance concerns
- Best practices
Provide specific improvement suggestions."

## Debugging
"Act as Technical Architect. Debug this issue:
[describe issue]
Provide:
- Root cause analysis
- Solution approach
- Code fix
- Prevention strategy"

## Refactoring
"Act as Technical Architect. Refactor this code to:
- Improve maintainability
- Enhance performance
- Follow best practices
- Increase type safety
- Add proper error handling"

## Architecture Decision
"Act as Technical Architect. Evaluate this technical decision:
[describe decision]
Provide:
- Pros and cons
- Implementation complexity
- Performance impact
- Security considerations
- Recommendation"
```

---

## Step 4: Configure QA Agent

### 4.1 Create QA Agent Rules

- [x] ✅ **COMPLETED** - Create `.cursorrules.qa` with QA agent configuration

**Status**: QA agent rules file created with full configuration including:
- Role definition (Quality Assurance Engineer)
- Responsibilities (test planning, implementation, bug detection)
- Testing standards (>80% coverage for critical code)
- Test types (unit, integration, E2E, performance, security)
- Bug severity levels
- Quality gates before launch

**File Location**: `.cursorrules.qa` (project root)

```markdown
# QA Agent Configuration - Evega Project

## Role: Quality Assurance Engineer
You are the QA engineer ensuring quality and testing for the Evega project.

## Responsibilities
1. **Test Planning**
   - Create test plans
   - Design test cases
   - Identify test scenarios
   - Plan test coverage

2. **Test Implementation**
   - Write unit tests
   - Create integration tests
   - Build E2E tests
   - Implement test utilities

3. **Bug Detection**
   - Identify bugs
   - Reproduce issues
   - Document defects
   - Verify fixes

4. **Quality Metrics**
   - Track test coverage
   - Monitor bug rates
   - Assess quality metrics
   - Report on quality status

## Testing Standards
- Unit tests for business logic
- Integration tests for workflows
- E2E tests for critical paths
- Test coverage >80% for critical code
- All tests must pass before merge

## Test Types
1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test module interactions
3. **E2E Tests**: Test user workflows
4. **Performance Tests**: Test load and performance
5. **Security Tests**: Test security vulnerabilities

## Testing Focus Areas
- Vendor workflows
- Checkout flow
- Order management
- Payment processing
- Authentication
- Access control
- Error handling

## Bug Severity Levels
- **Critical**: Blocks launch
- **High**: Major functionality broken
- **Medium**: Minor functionality issue
- **Low**: Cosmetic or minor issue

## When to Escalate
- Critical bugs found
- Security vulnerabilities
- Performance degradation
- Test coverage below threshold
- Quality metrics declining

## Output Format
Always provide:
1. Test results summary
2. Bugs found (with severity)
3. Test coverage report
4. Quality metrics
5. Recommendations
```

### 4.2 Create QA Agent Prompts File

- [x] ✅ **COMPLETED** - Create `.cursor/agents/qa/prompts.md` with ready-to-use prompts

**Status**: QA agent prompts file created with prompts for:
- Test generation (unit, integration, E2E)
- Bug analysis
- Test coverage review
- Quality assessment
- Regression testing

**File Location**: `.cursor/agents/qa/prompts.md`

```markdown
# QA Agent Prompts

## Test Generation
"Act as QA Engineer. Generate comprehensive tests for [feature] including:
- Unit tests
- Integration tests
- E2E tests
- Edge cases
- Error scenarios"

## Bug Analysis
"Act as QA Engineer. Analyze this bug report:
[describe bug]
Provide:
- Reproduction steps
- Root cause analysis
- Severity assessment
- Test case to prevent regression"

## Test Coverage Review
"Act as QA Engineer. Review test coverage for [module] and identify:
- Missing test cases
- Low coverage areas
- Critical paths not tested
- Recommendations for improvement"

## Quality Assessment
"Act as QA Engineer. Assess the quality of this code:
[code snippet]
Provide:
- Quality score
- Issues found
- Test recommendations
- Improvement suggestions"

## Regression Testing
"Act as QA Engineer. Create regression test plan for [feature] to ensure 
no existing functionality breaks."
```

---

## Step 5: Setup Agent Workflow

### 5.1 Create Agent Workflow Script

- [ ] ❌ **NOT COMPLETED** - Create `scripts/agent-workflow.sh`

**Status**: Agent workflow script not yet created. This is optional - the `switch-agent.sh` script provides the core functionality.

**Note**: The `switch-agent.sh` script (created in Step 5.2) provides agent switching functionality. The workflow script can be added later if needed.

```bash
#!/bin/bash

# Multi-Agent Workflow Script
# Usage: ./scripts/agent-workflow.sh [cto|architect|qa] [task]

AGENT=$1
TASK=$2

case $AGENT in
  cto)
    echo "🤖 CTO Agent Activated"
    echo "Reviewing project status..."
    # CTO agent tasks
    ;;
  architect)
    echo "👨‍💻 Architect Agent Activated"
    echo "Reviewing technical implementation..."
    # Architect agent tasks
    ;;
  qa)
    echo "🧪 QA Agent Activated"
    echo "Running quality checks..."
    # QA agent tasks
    ;;
  *)
    echo "Usage: ./scripts/agent-workflow.sh [cto|architect|qa] [task]"
    exit 1
    ;;
esac
```

### 5.2 Create Agent Switching Guide

- [x] ✅ **COMPLETED** - Create `docs/launch-strategy/AGENT_SWITCHING.md`
- [x] ✅ **COMPLETED** - Create `scripts/switch-agent.sh` script

**Status**: Both agent switching guide and script created. The guide includes:
- Method 1: Switch rules file (recommended)
- Method 2: Explicit agent declaration in chat
- Method 3: Using Cursor Composer
- Quick switch commands
- Troubleshooting guide

**Files**:
- `docs/launch-strategy/AGENT_SWITCHING.md` - Complete switching guide
- `scripts/switch-agent.sh` - Executable script for quick agent switching

```markdown
# How to Switch Between Agents in Cursor

## Method 1: Using Cursor Rules Files

1. **For CTO Agent**:
   - Copy `.cursorrules.cto` to `.cursorrules`
   - Restart Cursor or reload window
   - Use CTO prompts from `.cursor/agents/cto/prompts.md`

2. **For Architect Agent**:
   - Copy `.cursorrules.architect` to `.cursorrules`
   - Restart Cursor or reload window
   - Use Architect prompts from `.cursor/agents/architect/prompts.md`

3. **For QA Agent**:
   - Copy `.cursorrules.qa` to `.cursorrules`
   - Restart Cursor or reload window
   - Use QA prompts from `.cursor/agents/qa/prompts.md`

## Method 2: Using Cursor Chat Context

In Cursor Chat, explicitly state which agent you want:

```
"Act as CTO. Review the project status and provide strategic recommendations."

"Act as Technical Architect. Design the implementation for [feature]."

"Act as QA Engineer. Generate tests for [feature]."
```

## Method 3: Using Cursor Composer

In Cursor Composer (Cmd+I), start with agent role:

```
"CTO Agent: Assess launch readiness and identify blockers."

"Architect Agent: Implement [feature] following our architecture patterns."

"QA Agent: Create comprehensive test suite for [module]."
```
```

---

## Step 6: Create Agent Collaboration Workflow

### 6.1 Create Agent Handoff Process

- [x] ✅ **COMPLETED** - Create `docs/launch-strategy/AGENT_COLLABORATION.md`

**Status**: Agent collaboration workflow document created with:
- Typical feature implementation workflow (8 phases)
- Daily collaboration workflow
- Example: Implementing "Bulk Product Import"
- Communication format between agents
- Best practices

**File Location**: `docs/launch-strategy/AGENT_COLLABORATION.md`

```markdown
# Agent Collaboration Workflow

## Typical Workflow

1. **CTO Agent** → Strategic Planning
   - Reviews roadmap
   - Identifies priorities
   - Assesses risks
   - Creates task list

2. **Architect Agent** → Implementation
   - Designs solution
   - Implements code
   - Reviews quality
   - Documents approach

3. **QA Agent** → Quality Assurance
   - Creates tests
   - Finds bugs
   - Verifies fixes
   - Reports quality

4. **CTO Agent** → Final Approval
   - Reviews implementation
   - Assesses quality
   - Approves for merge
   - Updates roadmap

## Example: Feature Implementation

### Step 1: CTO Agent - Planning
```
"CTO Agent: Review DETAILED_TASKS.md and identify the next critical feature 
to implement for March 15th launch. Provide prioritization and risk assessment."
```

### Step 2: Architect Agent - Design
```
"Architect Agent: Design the technical implementation for [feature identified by CTO]. 
Include architecture, data model, API design, and implementation approach."
```

### Step 3: Architect Agent - Implementation
```
"Architect Agent: Implement [feature] following the design. Include proper 
error handling, access control, and type safety."
```

### Step 4: QA Agent - Testing
```
"QA Agent: Create comprehensive tests for [feature]. Include unit tests, 
integration tests, and edge cases."
```

### Step 5: QA Agent - Quality Check
```
"QA Agent: Review the implementation for bugs, security issues, and quality 
concerns. Provide detailed report."
```

### Step 6: CTO Agent - Approval
```
"CTO Agent: Review the completed [feature] including implementation and tests. 
Assess if it meets launch requirements and approve or request changes."
```

## Daily Standup Workflow

### Morning (CTO Agent)
```
"CTO Agent: Conduct daily standup. Review:
- Yesterday's accomplishments
- Today's priorities
- Blockers
- Launch readiness status"
```

### Development (Architect Agent)
```
"Architect Agent: Implement today's priority tasks. Focus on:
- Code quality
- Performance
- Security
- Best practices"
```

### End of Day (QA Agent)
```
"QA Agent: Run quality checks on today's work:
- Test coverage
- Bug detection
- Code quality
- Quality metrics"
```

### Evening (CTO Agent)
```
"CTO Agent: Review end-of-day status:
- Progress made
- Quality metrics
- Blockers
- Tomorrow's plan"
```
```

---

## Step 7: Setup Agent Automation

### 7.1 Create Daily Agent Routine

- [ ] ❌ **NOT COMPLETED** - Create `scripts/daily-agent-routine.sh`

**Status**: Daily agent routine script not yet created. This is optional and can be added later for automation.

**Note**: You can manually run agent prompts in Cursor Chat instead of using this script.

```bash
#!/bin/bash

# Daily Multi-Agent Routine
# Run this script each morning

echo "=========================================="
echo "Daily Multi-Agent Routine"
echo "Date: $(date '+%Y-%m-%d')"
echo "=========================================="
echo ""

echo "🤖 Step 1: CTO Agent - Morning Standup"
echo "Reviewing project status and priorities..."
# Add CTO agent prompt here

echo ""
echo "👨‍💻 Step 2: Architect Agent - Technical Review"
echo "Reviewing technical implementation..."
# Add Architect agent prompt here

echo ""
echo "🧪 Step 3: QA Agent - Quality Check"
echo "Running quality checks..."
# Add QA agent prompt here

echo ""
echo "✅ Routine Complete"
echo "Check Cursor Chat for agent responses"
```

### 7.2 Create Agent Status Report

- [ ] ❌ **NOT COMPLETED** - Create `scripts/agent-status-report.sh`

**Status**: Agent status report script not yet created. This is optional.

**Note**: The `daily-progress.sh` script provides similar functionality. This can be added later if needed.

```bash
#!/bin/bash

# Generate status report from all agents

echo "=========================================="
echo "Multi-Agent Status Report"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

echo "🤖 CTO Agent Status:"
echo "- Launch Readiness: [Run CTO assessment]"
echo "- Risks: [Run CTO risk assessment]"
echo "- Priorities: [Run CTO priority review]"
echo ""

echo "👨‍💻 Architect Agent Status:"
echo "- Code Quality: [Run Architect review]"
echo "- Architecture: [Run Architect assessment]"
echo "- Technical Debt: [Run Architect analysis]"
echo ""

echo "🧪 QA Agent Status:"
echo "- Test Coverage: [Run QA coverage check]"
echo "- Bugs Found: [Run QA bug scan]"
echo "- Quality Score: [Run QA assessment]"
echo ""

echo "=========================================="
```

---

## Step 8: Create Agent Prompt Templates

### 8.1 CTO Agent Templates

- [x] ✅ **COMPLETED** - CTO agent prompts created in `.cursor/agents/cto/prompts.md`

**Status**: Ready-to-use prompts available for:
- Daily operations (standup, end-of-day review, weekly report)
- Strategic planning (launch readiness, risk assessment, priority planning)
- Decision making (go/no-go, resource allocation, technical debt)

**File Location**: `.cursor/agents/cto/prompts.md`

### 8.2 Architect Agent Templates

- [x] ✅ **COMPLETED** - Architect agent prompts created in `.cursor/agents/architect/prompts.md`

**Status**: Ready-to-use prompts available for:
- Feature implementation (design, implement)
- Problem solving (debug, optimize, refactor)
- Architecture decisions (evaluate, design system)

**File Location**: `.cursor/agents/architect/prompts.md`

### 8.3 QA Agent Templates

- [x] ✅ **COMPLETED** - QA agent prompts created in `.cursor/agents/qa/prompts.md`

**Status**: Ready-to-use prompts available for:
- Test generation (unit, integration, E2E)
- Quality assessment (code review, coverage analysis)
- Testing workflows (vendor, checkout, order management)

**File Location**: `.cursor/agents/qa/prompts.md`

---

## Step 9: Setup Agent Memory/Context

### 9.1 Create Agent Context Files

- [ ] ❌ **NOT COMPLETED** - Create `.cursor/agents/cto/context.md`
- [ ] ❌ **NOT COMPLETED** - Create `.cursor/agents/architect/context.md`
- [ ] ❌ **NOT COMPLETED** - Create `.cursor/agents/qa/context.md`

**Status**: Agent context files not yet created. These are optional and can be added later.

**Purpose**: Context files help agents maintain memory about:
- Project status
- Recent decisions
- Current priorities
- Known issues
- Progress metrics

**Note**: Agents can reference `docs/DETAILED_TASKS.md` and `docs/launch-strategy/LAUNCH_ROADMAP.md` for context instead.

---

## Step 10: Testing the Multi-Agent System

### 10.1 Test Each Agent Individually

- [ ] ⚠️ **NEEDS VERIFICATION** - Test CTO agent strategic planning
- [ ] ⚠️ **NEEDS VERIFICATION** - Test Architect agent implementation
- [ ] ⚠️ **NEEDS VERIFICATION** - Test QA agent quality checks

**How to Test**:
1. Run `./scripts/switch-agent.sh cto` and reload Cursor
2. Open Cursor Chat and ask: "CTO Agent: Conduct morning standup"
3. Switch to architect: `./scripts/switch-agent.sh architect`
4. Ask: "Architect Agent: Review priority tasks and provide technical approach"
5. Switch to QA: `./scripts/switch-agent.sh qa`
6. Ask: "QA Agent: Generate tests for [feature]"

### 10.2 Test Agent Collaboration

- [ ] ⚠️ **NEEDS VERIFICATION** - Test full agent collaboration workflow

**How to Test**:
1. CTO agent identifies a task
2. Architect agent implements it
3. QA agent tests it
4. CTO agent approves it

**Test Scenario**: Follow the workflow in `AGENT_COLLABORATION.md` for a small feature.

---

## Quick Start Checklist

### Core Setup (Required) ✅
- [x] ✅ Create `.cursorrules.cto`, `.cursorrules.architect`, `.cursorrules.qa`
- [x] ✅ Create `.cursor/agents/` folder structure
- [x] ✅ Create agent prompt files (cto, architect, qa)
- [x] ✅ Create agent switching script (`scripts/switch-agent.sh`)
- [x] ✅ Document agent switching process (`AGENT_SWITCHING.md`)
- [x] ✅ Document agent collaboration workflow (`AGENT_COLLABORATION.md`)

### Testing & Verification (Recommended) ⚠️
- [ ] ⚠️ Test each agent individually
- [ ] ⚠️ Test agent collaboration workflow
- [ ] ⚠️ Verify agent switching works correctly

### Optional Enhancements (Nice to Have) ❌
- [ ] ❌ Create agent workflow script (`scripts/agent-workflow.sh`)
- [ ] ❌ Create daily agent routine script (`scripts/daily-agent-routine.sh`)
- [ ] ❌ Create agent status report script (`scripts/agent-status-report.sh`)
- [ ] ❌ Create agent context files (for memory/context)

### Summary
- **Completed**: 6/10 core steps (60%)
- **Needs Verification**: 2/10 testing steps
- **Optional**: 4/10 enhancement steps

**Status**: Core multi-agent system is set up and ready to use! Test each agent to verify everything works.

---

## Usage Examples

### Example 1: Morning Routine

```bash
# 1. Switch to CTO agent
cp .cursorrules.cto .cursorrules

# 2. In Cursor Chat, ask:
"CTO Agent: Conduct morning standup. Review yesterday's progress, 
identify today's priorities, and assess launch readiness."

# 3. Switch to Architect agent
cp .cursorrules.architect .cursorrules

# 4. In Cursor Chat, ask:
"Architect Agent: Review the priority tasks from CTO and provide 
technical implementation approach."
```

### Example 2: Feature Implementation

```bash
# 1. CTO Agent - Planning
"CTO Agent: Identify the next critical feature for launch."

# 2. Architect Agent - Design
"Architect Agent: Design the technical implementation for [feature]."

# 3. Architect Agent - Implementation
"Architect Agent: Implement [feature] following the design."

# 4. QA Agent - Testing
"QA Agent: Create comprehensive tests for [feature]."

# 5. CTO Agent - Approval
"CTO Agent: Review and approve [feature] for launch."
```

---

**Next Steps**: Follow each step sequentially to set up your multi-agent system.
