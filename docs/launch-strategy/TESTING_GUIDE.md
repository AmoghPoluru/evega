# Multi-Agent System Testing Guide

> **Quick guide to test your CTO, Architect, and QA agents**

## Pre-Testing Checklist

Before testing, verify all files are in place:

- [x] ✅ `.cursorrules.cto` exists
- [x] ✅ `.cursorrules.architect` exists
- [x] ✅ `.cursorrules.qa` exists
- [x] ✅ `.cursor/agents/cto/prompts.md` exists
- [x] ✅ `.cursor/agents/architect/prompts.md` exists
- [x] ✅ `.cursor/agents/qa/prompts.md` exists
- [x] ✅ `scripts/switch-agent.sh` exists and is executable
- [x] ✅ `docs/launch-strategy/AGENT_SWITCHING.md` exists
- [x] ✅ `docs/launch-strategy/AGENT_COLLABORATION.md` exists

**Status**: ✅ All files are in place and ready for testing!

---

## Test 1: CTO Agent

### Step 1: Switch to CTO Agent

```bash
cd /Users/anu/Desktop/Projects/evega
./scripts/switch-agent.sh cto
```

**Expected Output**:
```
✅ Switched to CTO Agent
   Role: Chief Technology Officer
   Focus: Strategic planning, risk assessment, launch readiness

📝 Next steps:
   1. Reload Cursor window (Cmd+Shift+P > 'Reload Window')
   2. Open Cursor Chat (Cmd+L) and verify agent role
   3. Use agent-specific prompts from .cursor/agents/cto/prompts.md
```

### Step 2: Reload Cursor

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type "Reload Window"
3. Press Enter

### Step 3: Test CTO Agent

Open Cursor Chat (`Cmd+L` or `Ctrl+L`) and ask:

```
"CTO Agent: Conduct morning standup. Review the project status and identify 
the top 3 priorities for today to stay on track for March 15th launch."
```

**What to Look For**:
- ✅ Agent responds as CTO
- ✅ Provides strategic overview
- ✅ Identifies priorities
- ✅ Assesses launch readiness
- ✅ Provides actionable recommendations

**Success Criteria**: Agent provides executive-level strategic analysis.

---

## Test 2: Architect Agent

### Step 1: Switch to Architect Agent

```bash
./scripts/switch-agent.sh architect
```

### Step 2: Reload Cursor

Press `Cmd+Shift+P` > "Reload Window"

### Step 3: Test Architect Agent

Open Cursor Chat and ask:

```
"Architect Agent: Review the priority tasks from CTO and provide a technical 
implementation approach for the next feature. Include architecture design, 
data model, and API structure."
```

**What to Look For**:
- ✅ Agent responds as Technical Architect
- ✅ Provides technical design
- ✅ Suggests implementation approach
- ✅ Considers architecture patterns
- ✅ Includes code structure recommendations

**Success Criteria**: Agent provides detailed technical implementation guidance.

---

## Test 3: QA Agent

### Step 1: Switch to QA Agent

```bash
./scripts/switch-agent.sh qa
```

### Step 2: Reload Cursor

Press `Cmd+Shift+P` > "Reload Window"

### Step 3: Test QA Agent

Open Cursor Chat and ask:

```
"QA Agent: Generate comprehensive tests for a product creation feature. 
Include unit tests, integration tests, and edge cases. Focus on vendor 
data isolation and access control."
```

**What to Look For**:
- ✅ Agent responds as QA Engineer
- ✅ Provides test plan
- ✅ Suggests test cases
- ✅ Includes edge cases
- ✅ Considers quality metrics

**Success Criteria**: Agent provides comprehensive testing strategy.

---

## Test 4: Agent Collaboration Workflow

Test the full collaboration between agents:

### Step 1: CTO Agent - Planning

```bash
./scripts/switch-agent.sh cto
# Reload Cursor
```

Ask in Cursor Chat:
```
"CTO Agent: Review DETAILED_TASKS.md and identify the next critical feature 
to implement for March 15th launch. Provide prioritization and risk assessment."
```

**Note the feature identified by CTO**

### Step 2: Architect Agent - Design

```bash
./scripts/switch-agent.sh architect
# Reload Cursor
```

Ask in Cursor Chat:
```
"Architect Agent: Design the technical implementation for [feature from CTO]. 
Include architecture, data model, API design, and implementation approach."
```

**Note the technical design**

### Step 3: QA Agent - Testing

```bash
./scripts/switch-agent.sh qa
# Reload Cursor
```

Ask in Cursor Chat:
```
"QA Agent: Create comprehensive tests for [feature from CTO]. Include unit tests, 
integration tests, and edge cases."
```

**Note the test plan**

### Step 4: CTO Agent - Approval

```bash
./scripts/switch-agent.sh cto
# Reload Cursor
```

Ask in Cursor Chat:
```
"CTO Agent: Review the completed [feature] including implementation design and 
tests. Assess if it meets launch requirements and approve or request changes."
```

**Success Criteria**: All agents work together in a cohesive workflow.

---

## Quick Test Script

Run this to verify all agents are set up correctly:

```bash
#!/bin/bash
cd /Users/anu/Desktop/Projects/evega

echo "Testing Multi-Agent System Setup..."
echo ""

# Check files exist
echo "1. Checking agent rules files..."
[ -f .cursorrules.cto ] && echo "   ✅ .cursorrules.cto" || echo "   ❌ .cursorrules.cto missing"
[ -f .cursorrules.architect ] && echo "   ✅ .cursorrules.architect" || echo "   ❌ .cursorrules.architect missing"
[ -f .cursorrules.qa ] && echo "   ✅ .cursorrules.qa" || echo "   ❌ .cursorrules.qa missing"

echo ""
echo "2. Checking agent prompt files..."
[ -f .cursor/agents/cto/prompts.md ] && echo "   ✅ CTO prompts" || echo "   ❌ CTO prompts missing"
[ -f .cursor/agents/architect/prompts.md ] && echo "   ✅ Architect prompts" || echo "   ❌ Architect prompts missing"
[ -f .cursor/agents/qa/prompts.md ] && echo "   ✅ QA prompts" || echo "   ❌ QA prompts missing"

echo ""
echo "3. Checking switch script..."
[ -f scripts/switch-agent.sh ] && echo "   ✅ switch-agent.sh exists" || echo "   ❌ switch-agent.sh missing"
[ -x scripts/switch-agent.sh ] && echo "   ✅ switch-agent.sh is executable" || echo "   ❌ switch-agent.sh not executable"

echo ""
echo "4. Checking documentation..."
[ -f docs/launch-strategy/AGENT_SWITCHING.md ] && echo "   ✅ AGENT_SWITCHING.md" || echo "   ❌ AGENT_SWITCHING.md missing"
[ -f docs/launch-strategy/AGENT_COLLABORATION.md ] && echo "   ✅ AGENT_COLLABORATION.md" || echo "   ❌ AGENT_COLLABORATION.md missing"

echo ""
echo "✅ Setup verification complete!"
echo ""
echo "Next: Test each agent individually using the steps above."
```

---

## Troubleshooting

### Issue: Agent doesn't respond correctly

**Solution**:
1. Make sure you reloaded Cursor after switching
2. Verify `.cursorrules` file exists (check: `ls -la .cursorrules`)
3. Check that the correct rules file was copied (compare with `.cursorrules.cto`)

### Issue: Switch script doesn't work

**Solution**:
```bash
chmod +x scripts/switch-agent.sh
./scripts/switch-agent.sh cto
```

### Issue: Agent doesn't understand its role

**Solution**:
1. Explicitly state the agent role in your prompt:
   ```
   "Act as CTO. [your question]"
   ```
2. Or reference the agent rules:
   ```
   "Following your role as CTO, [your question]"
   ```

---

## Expected Behavior

### CTO Agent Should:
- Think strategically
- Focus on launch readiness
- Provide executive summaries
- Identify risks and priorities
- Make go/no-go decisions

### Architect Agent Should:
- Think technically
- Focus on implementation
- Provide code examples
- Consider architecture patterns
- Suggest best practices

### QA Agent Should:
- Think about quality
- Focus on testing
- Provide test plans
- Identify bugs
- Assess quality metrics

---

## Success Indicators

✅ **Agents are working correctly if**:
- Each agent responds according to its role
- CTO provides strategic insights
- Architect provides technical solutions
- QA provides testing strategies
- Agents can collaborate on a feature

❌ **Agents need adjustment if**:
- Responses are generic (not role-specific)
- Agent doesn't understand its responsibilities
- Agent doesn't follow project context
- Agent doesn't reference project files

---

## Next Steps After Testing

1. ✅ Verify all agents work correctly
2. ✅ Test agent collaboration
3. ✅ Use agents for actual development tasks
4. ✅ Refine agent prompts based on results
5. ✅ Document any issues or improvements needed

---

**Ready to test?** Start with Test 1 (CTO Agent) and work through each test sequentially.
