# How the 3 AI Agents Are Implemented

> **Technical documentation on how the CTO, Architect, and QA agents are implemented in the Evega project**

## Overview

The multi-agent system uses **Cursor AI** with role-specific configuration files (`.cursorrules.*`) to create three specialized AI agents:

1. **CTO Agent** - Strategic oversight, planning, risk management
2. **Architect/Developer Agent** - Technical implementation, code architecture
3. **QA Agent** - Testing, quality assurance, bug detection

---

## Implementation Architecture

### Core Mechanism

The agents are implemented using **Cursor's `.cursorrules` system**:

- Each agent has a dedicated `.cursorrules.*` configuration file
- Cursor reads `.cursorrules` from the project root to determine AI behavior
- Switching agents = copying the appropriate `.cursorrules.*` file to `.cursorrules`
- Cursor reloads the configuration when the window is reloaded

### File Structure

```
evega/
├── .cursorrules              # Active agent configuration (switched dynamically)
├── .cursorrules.cto         # CTO agent configuration
├── .cursorrules.architect   # Architect agent configuration
├── .cursorrules.qa          # QA agent configuration
├── .cursor/
│   └── agents/
│       ├── cto/
│       │   └── prompts.md   # Ready-to-use CTO prompts
│       ├── architect/
│       │   └── prompts.md   # Ready-to-use Architect prompts
│       └── qa/
│           └── prompts.md  # Ready-to-use QA prompts
└── scripts/
    └── switch-agent.sh      # Quick agent switching script
```

---

## Agent 1: CTO Agent

### Configuration File: `.cursorrules.cto`

**Purpose**: Strategic oversight, planning, risk management, go/no-go decisions

**Key Components**:

1. **Role Definition**
   - Chief Technology Officer
   - Oversees Evega project with March 15th launch deadline
   - Strategic decision maker

2. **Responsibilities**
   - Strategic Planning (roadmap, timeline, priorities)
   - Resource Management (allocation, velocity)
   - Risk Assessment (technical risks, security, performance)
   - Quality Oversight (code quality, architecture, testing)
   - Communication (status updates, escalations)

3. **Decision Framework**
   - Critical Path focus
   - Risk vs. Reward balance
   - Technical debt management
   - Quality standards

4. **Output Format**
   - Executive Summary
   - Key Metrics
   - Risks and Blockers
   - Recommendations
   - Action Items

**Implementation Details**:
- File: `.cursorrules.cto` (project root)
- Prompts: `.cursor/agents/cto/prompts.md`
- Context: Reviews `docs/DETAILED_TASKS.md` and `docs/launch-strategy/LAUNCH_ROADMAP.md`

---

## Agent 2: Architect/Developer Agent

### Configuration File: `.cursorrules.architect`

**Purpose**: Technical implementation, architecture design, code quality

**Key Components**:

1. **Role Definition**
   - Technical Architect & Senior Developer
   - Lead developer for Evega project

2. **Responsibilities**
   - Architecture Design (system architecture, scalability)
   - Implementation (production-ready code, best practices)
   - Code Review (quality, consistency, security)
   - Technical Problem Solving (debugging, optimization)

3. **Technical Standards**
   - TypeScript strict mode (no `any` types)
   - Next.js App Router patterns (Server Components first)
   - tRPC for all APIs (type-safe)
   - Payload CMS collections for data models
   - shadcn/ui components for UI
   - Proper error handling everywhere
   - Access control enforcement (vendor isolation)

4. **Architecture Principles**
   - Server Components First
   - Type Safety (full TypeScript coverage)
   - Data Isolation (vendor scoping)
   - Security First
   - Performance optimization
   - Scalability

5. **Output Format**
   - Technical Approach
   - Implementation Details
   - Code Examples
   - Testing Strategy
   - Performance Considerations

**Implementation Details**:
- File: `.cursorrules.architect` (project root)
- Prompts: `.cursor/agents/architect/prompts.md`
- Context: Understands project structure, patterns, and conventions

---

## Agent 3: QA Agent

### Configuration File: `.cursorrules.qa`

**Purpose**: Testing, quality assurance, bug detection

**Key Components**:

1. **Role Definition**
   - Quality Assurance Engineer
   - Ensures quality and testing for Evega project

2. **Responsibilities**
   - Test Planning (test plans, test cases, scenarios)
   - Test Implementation (unit, integration, E2E tests)
   - Bug Detection (identify, reproduce, document)
   - Quality Metrics (coverage, bug rates, quality status)

3. **Testing Standards**
   - Unit tests for business logic (critical paths)
   - Integration tests for workflows
   - E2E tests for critical user journeys
   - Test coverage >80% for critical code
   - All tests must pass before merge
   - No skipped tests in production code

4. **Test Types & Focus**
   - Unit Tests (functions, components, business logic)
   - Integration Tests (workflows, module interactions)
   - E2E Tests (user journeys)
   - Performance Tests (API, page load, database)
   - Security Tests (access control, input validation)

5. **Output Format**
   - Test Results Summary
   - Bugs Found (severity, reproduction, impact)
   - Test Coverage Report
   - Quality Metrics
   - Recommendations

**Implementation Details**:
- File: `.cursorrules.qa` (project root)
- Prompts: `.cursor/agents/qa/prompts.md`
- Context: Understands testing infrastructure (Vitest, Playwright, React Testing Library)

---

## How It Works Technically

### 1. Cursor Configuration System

Cursor AI reads `.cursorrules` from the project root to understand:
- Project context
- Code style preferences
- Architecture patterns
- Role-specific behavior

### 2. Agent Switching Mechanism

**Method**: Copy agent-specific rules file to `.cursorrules`

```bash
# Switch to CTO Agent
cp .cursorrules.cto .cursorrules

# Switch to Architect Agent
cp .cursorrules.architect .cursorrules

# Switch to QA Agent
cp .cursorrules.qa .cursorrules
```

**Why This Works**:
- Cursor reads `.cursorrules` on window reload
- Each `.cursorrules.*` file contains role-specific instructions
- Copying activates that agent's behavior
- Reloading Cursor applies the new configuration

### 3. Agent Context

Each agent has:
- **Role Definition**: What the agent is
- **Responsibilities**: What the agent does
- **Standards**: How the agent works
- **Output Format**: How the agent responds
- **Project Knowledge**: Context about Evega project

### 4. Prompt Libraries

Each agent has a `prompts.md` file with ready-to-use prompts:
- Pre-formatted prompts for common tasks
- Role-specific language
- Context-aware instructions

---

## Technical Implementation Details

### Configuration File Format

Each `.cursorrules.*` file follows this structure:

```markdown
# [Agent Name] Configuration - Evega Project

## Role: [Role Title]
[Role description]

## Responsibilities
1. [Responsibility 1]
2. [Responsibility 2]
...

## [Agent-Specific Sections]
[Standards, principles, output format, etc.]

## Project-Specific Knowledge
[Context about the project]
```

### Agent Activation Flow

1. **User runs switch script**: `./scripts/switch-agent.sh [agent]`
2. **Script copies rules file**: `.cursorrules.[agent]` → `.cursorrules`
3. **User reloads Cursor**: `Cmd+Shift+P` > "Reload Window"
4. **Cursor reads `.cursorrules`**: Loads agent configuration
5. **Agent is active**: AI responds according to agent role

### Context Preservation

Agents maintain context through:
- Project documentation (`docs/DETAILED_TASKS.md`)
- Codebase structure (file patterns, conventions)
- Existing code (follows established patterns)
- Agent-specific knowledge (role, responsibilities, standards)

---

## Agent-Specific Features

### CTO Agent Features

- **Strategic Thinking**: Focuses on launch readiness, risks, priorities
- **Metrics Tracking**: Monitors task completion, bug count, test coverage
- **Decision Making**: Provides go/no-go recommendations
- **Risk Assessment**: Identifies and prioritizes risks

### Architect Agent Features

- **Code Generation**: Writes production-ready code following patterns
- **Architecture Design**: Designs system architecture and data models
- **Type Safety**: Enforces TypeScript strict mode
- **Pattern Following**: Follows existing codebase patterns

### QA Agent Features

- **Test Generation**: Creates comprehensive test suites
- **Bug Detection**: Identifies bugs and quality issues
- **Coverage Analysis**: Tracks and reports test coverage
- **Quality Assessment**: Provides quality metrics and recommendations

---

## Integration with Cursor AI

### Cursor Chat (`Cmd+L`)

Agents respond in Cursor Chat according to their role:
- **CTO**: Strategic, high-level, decision-focused
- **Architect**: Technical, implementation-focused, code-oriented
- **QA**: Testing, quality-focused, bug-oriented

### Cursor Composer (`Cmd+I`)

Agents can be invoked in Composer:
- Start with agent name: "CTO Agent: ..."
- Agent responds according to role configuration
- Less effective than switching rules file (no full context)

### Code Generation

Agents generate code according to their role:
- **CTO**: Doesn't write code (strategic focus)
- **Architect**: Writes production-ready code
- **QA**: Writes test code

---

## Limitations and Considerations

### Current Limitations

1. **Single Active Agent**: Only one agent active at a time
2. **Manual Switching**: Requires manual agent switching
3. **Context Loss**: Switching agents may lose some context
4. **No Parallel Execution**: Agents can't work simultaneously

### Best Practices

1. **Switch Intentionally**: Don't mix agent roles in one session
2. **Reload After Switch**: Always reload Cursor window
3. **Use Appropriate Agent**: Match agent to task type
4. **Maintain Context**: Provide context when switching
5. **Document Decisions**: Have CTO document important decisions

---

## Future Enhancements

Potential improvements:
- **Agent Orchestration**: Automatic agent handoffs
- **Parallel Execution**: Multiple agents working simultaneously
- **Context Sharing**: Better context preservation between agents
- **Agent Memory**: Persistent memory across sessions
- **Workflow Automation**: Automated agent workflows

---

## Summary

The 3-agent system is implemented using:
- **Cursor's `.cursorrules` system** for agent configuration
- **Role-specific configuration files** (`.cursorrules.cto`, `.cursorrules.architect`, `.cursorrules.qa`)
- **Agent switching script** (`scripts/switch-agent.sh`)
- **Prompt libraries** (`.cursor/agents/*/prompts.md`)
- **Project documentation** for context

Each agent has a specific role, responsibilities, and output format, activated by copying the appropriate configuration file to `.cursorrules` and reloading Cursor.
