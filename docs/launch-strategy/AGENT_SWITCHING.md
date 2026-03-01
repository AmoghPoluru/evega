# How to Switch Between Agents in Cursor

## Quick Reference

| Agent | Rules File | Use Case |
|-------|-----------|----------|
| **CTO** | `.cursorrules.cto` | Strategic planning, risk assessment, go/no-go decisions |
| **Architect** | `.cursorrules.architect` | Code implementation, architecture design, technical decisions |
| **QA** | `.cursorrules.qa` | Testing, quality assurance, bug detection |

---

## Method 1: Switch Rules File (Recommended)

### Step-by-Step:

1. **Backup current rules** (if you have custom `.cursorrules`):
   ```bash
   cp .cursorrules .cursorrules.backup
   ```

2. **Switch to desired agent**:
   ```bash
   # For CTO Agent
   cp .cursorrules.cto .cursorrules
   
   # For Architect Agent
   cp .cursorrules.architect .cursorrules
   
   # For QA Agent
   cp .cursorrules.qa .cursorrules
   ```

3. **Reload Cursor**:
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
   - Type "Reload Window"
   - Press Enter

4. **Verify agent is active**:
   - Open Cursor Chat (`Cmd+L` or `Ctrl+L`)
   - Ask: "What is your role?"
   - Agent should respond with their role

### Quick Switch Script

Create `scripts/switch-agent.sh`:

```bash
#!/bin/bash

AGENT=$1

case $AGENT in
  cto)
    cp .cursorrules.cto .cursorrules
    echo "✅ Switched to CTO Agent"
    ;;
  architect)
    cp .cursorrules.architect .cursorrules
    echo "✅ Switched to Architect Agent"
    ;;
  qa)
    cp .cursorrules.qa .cursorrules
    echo "✅ Switched to QA Agent"
    ;;
  *)
    echo "Usage: ./scripts/switch-agent.sh [cto|architect|qa]"
    exit 1
    ;;
esac

echo "Please reload Cursor window (Cmd+Shift+P > Reload Window)"
```

Make it executable:
```bash
chmod +x scripts/switch-agent.sh
```

Usage:
```bash
./scripts/switch-agent.sh cto
./scripts/switch-agent.sh architect
./scripts/switch-agent.sh qa
```

---

## Method 2: Explicit Agent Declaration in Chat

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

**Note**: This method works but is less effective than switching the rules file, as the agent won't have the full context of the role.

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

## Method 4: Agent-Specific Workspaces (Advanced)

You can create separate Cursor workspaces for each agent:

1. **Create workspace files**:
   - `evega-cto.code-workspace`
   - `evega-architect.code-workspace`
   - `evega-qa.code-workspace`

2. **Configure each workspace** with appropriate settings and rules

3. **Open desired workspace** in Cursor

---

## Recommended Workflow

### Daily Routine

**Morning (CTO Agent)**:
```bash
./scripts/switch-agent.sh cto
# Reload Cursor
# Ask: "CTO Agent: Conduct morning standup"
```

**Development (Architect Agent)**:
```bash
./scripts/switch-agent.sh architect
# Reload Cursor
# Use for all code implementation
```

**End of Day (QA Agent)**:
```bash
./scripts/switch-agent.sh qa
# Reload Cursor
# Ask: "QA Agent: Run quality checks on today's work"
```

**Evening Review (CTO Agent)**:
```bash
./scripts/switch-agent.sh cto
# Reload Cursor
# Ask: "CTO Agent: Review end-of-day status"
```

---

## Verification

After switching agents, verify by asking:

**For CTO**:
```
"What is your role and what are your primary responsibilities?"
```

**For Architect**:
```
"What are your technical standards and architecture principles?"
```

**For QA**:
```
"What are your testing standards and quality requirements?"
```

Each agent should respond according to their role configuration.

---

## Troubleshooting

### Agent not responding correctly
- Make sure you reloaded Cursor after switching rules
- Verify the rules file was copied correctly
- Check that `.cursorrules` exists and has the right content

### Rules file not found
- Ensure `.cursorrules.cto`, `.cursorrules.architect`, `.cursorrules.qa` exist
- Check file permissions
- Verify you're in the project root directory

### Agent context not working
- Try explicit agent declaration in prompts
- Reload Cursor window
- Clear Cursor cache if needed

---

## Best Practices

1. **Switch agents intentionally** - Don't mix agent roles in one session
2. **Reload after switching** - Always reload Cursor window
3. **Use appropriate agent** - Match agent to task type
4. **Maintain context** - Keep agent-specific context in mind
5. **Document decisions** - Have CTO agent document important decisions

---

**Quick Switch Commands**:
```bash
# CTO Agent
./scripts/switch-agent.sh cto

# Architect Agent  
./scripts/switch-agent.sh architect

# QA Agent
./scripts/switch-agent.sh qa
```
