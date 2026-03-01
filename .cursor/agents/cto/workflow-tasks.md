# CTO Agent - Task Prioritization Workflow

## Primary Workflow: CTO → Architect/Developer Task Assignment

When you switch to CTO agent and ask for task prioritization, here's what happens:

### Step 1: CTO Agent Analyzes Project

The CTO agent will:
1. **Review `docs/DETAILED_TASKS.md`** - Analyze all 138 tasks
2. **Check completion status** - Identify completed (✅) vs pending (❌) tasks
3. **Assess launch readiness** - Evaluate what's critical for March 15th launch
4. **Prioritize tasks** - Rank by:
   - Critical path (blocks launch)
   - Dependencies (what needs to be done first)
   - Risk level (high risk = higher priority)
   - Effort vs. impact

### Step 2: CTO Agent Generates Task List

The CTO agent will provide:
- **Prioritized task list** - Top tasks for Architect/Developer to work on
- **Task breakdown** - What needs to be done
- **Dependencies** - Order of execution
- **Risk assessment** - Potential blockers
- **Effort estimates** - Time/complexity

### Step 3: Handoff to Architect/Developer

The CTO agent will format tasks ready for Architect/Developer agents to implement.

---

## How to Use This Workflow

### Method 1: Quick Task List Request

After switching to CTO agent (`./scripts/switch-agent.sh cto`), ask:

```
"CTO Agent: Review DETAILED_TASKS.md and provide a prioritized list of 
incomplete tasks for the Architect/Developer agents to work on. Focus on 
critical path items for March 15th launch. Format as actionable tasks with 
priorities (P0 = Critical, P1 = High, P2 = Medium)."
```

### Method 2: Detailed Task Analysis

```
"CTO Agent: Conduct a comprehensive task analysis:
1. Review DETAILED_TASKS.md and identify all incomplete tasks
2. Categorize by priority (Critical/High/Medium/Low)
3. Identify dependencies between tasks
4. Assess risks for each task
5. Create a prioritized sprint backlog for Architect/Developer agents
6. Provide task breakdown with acceptance criteria"
```

### Method 3: Daily Task Assignment

```
"CTO Agent: Based on the March 15th launch deadline, identify the top 5 
most critical tasks for today that Architect/Developer agents should work on. 
For each task, provide:
- Task number and description
- Why it's critical
- Dependencies
- Estimated effort
- Acceptance criteria"
```

---

## Expected CTO Agent Output Format

The CTO agent should provide output like this:

```markdown
## Prioritized Task List for Architect/Developer Agents

### P0 - Critical (Must Complete Before Launch)
1. **Task #129**: Comprehensive testing suite
   - **Why Critical**: Blocks production deployment
   - **Dependencies**: None
   - **Effort**: 3-5 days
   - **Acceptance Criteria**: >80% test coverage, all critical paths tested

2. **Task #130**: Production deployment setup
   - **Why Critical**: Required for launch
   - **Dependencies**: Task #129 (testing)
   - **Effort**: 2-3 days
   - **Acceptance Criteria**: Production environment configured, CI/CD working

### P1 - High Priority (Should Complete Before Launch)
3. **Task #131**: Email service configuration
   - **Why High**: Needed for user notifications
   - **Dependencies**: None
   - **Effort**: 1-2 days
   - **Acceptance Criteria**: SendGrid/SES configured, test emails working

[... more tasks ...]

### Risk Assessment
- **Timeline Risk**: Medium - 15 days remaining, 28 tasks incomplete
- **Critical Blockers**: None currently
- **Recommended Focus**: Complete P0 tasks first, then P1

### Recommendations
1. Start with Task #129 (testing suite) - unblocks other tasks
2. Parallel work possible on Tasks #131 and #132
3. Defer P2 tasks to post-launch if timeline tightens
```

---

## Complete Workflow Example

### 1. Switch to CTO Agent
```bash
cd /Users/anu/Desktop/Projects/evega
./scripts/switch-agent.sh cto
# Reload Cursor window
```

### 2. CTO Analyzes and Provides Tasks
In Cursor Chat, ask:
```
"CTO Agent: Review DETAILED_TASKS.md and create a prioritized task list 
for Architect/Developer agents. Focus on incomplete tasks critical for 
March 15th launch."
```

### 3. Switch to Architect Agent
```bash
./scripts/switch-agent.sh architect
# Reload Cursor window
```

### 4. Architect Receives Tasks
In Cursor Chat, reference the CTO's task list:
```
"Architect Agent: Review the task list provided by CTO Agent. For Task #129 
(Comprehensive testing suite), provide:
1. Technical implementation approach
2. Test framework recommendations
3. Test structure design
4. Implementation steps"
```

### 5. Architect Implements
```
"Architect Agent: Implement Task #129 following the design. Create the test 
infrastructure and write initial test cases."
```

### 6. Switch to QA Agent (for verification)
```bash
./scripts/switch-agent.sh qa
# Reload Cursor window
```

### 7. QA Verifies
```
"QA Agent: Review the test suite implementation for Task #129. Verify:
- Test coverage meets requirements
- All critical paths are tested
- Tests follow best practices
- Provide quality assessment"
```

### 8. Switch Back to CTO for Approval
```bash
./scripts/switch-agent.sh cto
# Reload Cursor window
```

### 9. CTO Approves
```
"CTO Agent: Review the completed Task #129 including implementation and QA 
verification. Assess if it meets launch requirements and approve or request 
changes."
```

---

## Automated Task List Generation

You can also create a script that uses CTO agent to generate task lists:

```bash
#!/bin/bash
# scripts/generate-task-list.sh

echo "🤖 CTO Agent: Generating prioritized task list..."
echo ""
echo "Switch to CTO agent and ask:"
echo ""
echo '"CTO Agent: Review DETAILED_TASKS.md and provide a prioritized list'
echo 'of incomplete tasks for Architect/Developer agents. Format as:'
echo '- Task number and title'
echo '- Priority (P0/P1/P2)'
echo '- Why it'"'"'s important'
echo '- Dependencies'
echo '- Estimated effort'
echo '- Acceptance criteria"'
echo ""
echo "Then copy the output to: docs/launch-strategy/CURRENT_SPRINT_TASKS.md"
```

---

## Tips for Best Results

1. **Be Specific**: Ask CTO to reference `DETAILED_TASKS.md` explicitly
2. **Request Format**: Ask for structured output (priorities, dependencies, etc.)
3. **Set Context**: Mention March 15th launch deadline
4. **Request Breakdown**: Ask for task breakdown with acceptance criteria
5. **Update Tasks**: Have CTO update `DETAILED_TASKS.md` when tasks complete

---

## Quick Reference Prompts

### Get Today's Tasks
```
"CTO Agent: What are the top 3 most critical tasks for Architect/Developer 
to work on today to stay on track for March 15th launch?"
```

### Get This Week's Tasks
```
"CTO Agent: Create a sprint backlog for this week. List all incomplete tasks 
from DETAILED_TASKS.md, prioritize them, and assign to Architect/Developer 
agents."
```

### Get Critical Path Tasks
```
"CTO Agent: Identify all critical path tasks (tasks that block launch) from 
DETAILED_TASKS.md. Provide a prioritized list with dependencies."
```

---

**Remember**: The CTO agent acts as a strategic planner. It analyzes the project, identifies what needs to be done, and creates actionable task lists for the Architect/Developer agents to implement.
