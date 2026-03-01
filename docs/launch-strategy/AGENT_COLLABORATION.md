# Agent Collaboration Workflow

> **How CTO, Architect, and QA agents work together to deliver features**

## Typical Feature Implementation Workflow

### Phase 1: CTO Agent - Strategic Planning

**Goal**: Identify and prioritize the feature

**CTO Agent Tasks**:
1. Review `DETAILED_TASKS.md` for pending features
2. Assess feature priority for March 15th launch
3. Evaluate risks and dependencies
4. Approve feature for implementation

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

### Phase 2: Architect Agent - Technical Design

**Goal**: Design the technical implementation

**Architect Agent Tasks**:
1. Review feature requirements
2. Design architecture and data model
3. Plan API structure (tRPC procedures)
4. Design UI components
5. Consider vendor data isolation
6. Plan error handling and validation

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

### Phase 3: Architect Agent - Implementation

**Goal**: Write production-ready code

**Architect Agent Tasks**:
1. Implement Payload collections (if needed)
2. Create tRPC procedures
3. Build UI components
4. Add error handling
5. Implement access control
6. Add loading states
7. Write code comments

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

### Phase 4: QA Agent - Test Generation

**Goal**: Create comprehensive test suite

**QA Agent Tasks**:
1. Review implementation
2. Create unit tests
3. Create integration tests
4. Create E2E tests (if applicable)
5. Test edge cases and error scenarios

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

### Phase 5: QA Agent - Quality Check

**Goal**: Identify bugs and quality issues

**QA Agent Tasks**:
1. Review code for bugs
2. Check security issues
3. Assess code quality
4. Verify test coverage
5. Test manually (if needed)
6. Document findings

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

### Phase 6: Architect Agent - Fix Issues

**Goal**: Address bugs and quality issues

**Architect Agent Tasks**:
1. Review QA findings
2. Fix identified bugs
3. Address security issues
4. Improve code quality
5. Update tests if needed

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

### Phase 7: QA Agent - Verification

**Goal**: Verify fixes and final quality check

**QA Agent Tasks**:
1. Re-run tests
2. Verify bug fixes
3. Check quality improvements
4. Final quality assessment
5. Approve or request more fixes

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

### Phase 8: CTO Agent - Final Approval

**Goal**: Approve feature for launch

**CTO Agent Tasks**:
1. Review implementation
2. Review test coverage
3. Review quality metrics
4. Assess launch readiness
5. Approve or request changes

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

## Daily Collaboration Workflow

### Morning Routine

**1. CTO Agent - Daily Standup** (9:00 AM)
```
"CTO Agent: Conduct morning standup:
- Review yesterday's progress
- Assess current status
- Identify today's top 3 priorities
- Flag blockers
- Provide strategic direction"
```

**2. Architect Agent - Technical Planning** (9:15 AM)
```
"Architect Agent: Review CTO priorities and plan technical approach:
- Break down tasks into implementation steps
- Identify technical dependencies
- Plan code structure
- Estimate effort"
```

**3. QA Agent - Test Planning** (9:30 AM)
```
"QA Agent: Plan testing for today's work:
- Identify test scenarios
- Plan test coverage
- Prepare test data
- Set quality goals"
```

### Development Session

**Architect Agent** works on implementation, **QA Agent** creates tests in parallel.

### End of Day

**1. QA Agent - Quality Check** (5:00 PM)
```
"QA Agent: Run end-of-day quality checks:
- Test today's implementations
- Check for bugs
- Assess quality metrics
- Generate quality report"
```

**2. Architect Agent - Code Review** (5:15 PM)
```
"Architect Agent: Review today's code:
- Check code quality
- Verify best practices
- Assess architecture compliance
- Document any concerns"
```

**3. CTO Agent - Status Review** (5:30 PM)
```
"CTO Agent: Review end-of-day status:
- Summarize accomplishments
- Assess progress toward launch
- Identify risks
- Plan tomorrow's priorities"
```

---

## Example: Implementing "Bulk Product Import"

### Step 1: CTO Agent
```
"CTO Agent: Assess if bulk product import is critical for March 15th launch. 
Review task #363 in DETAILED_TASKS.md and provide go/no-go decision."
```
**Output**: ✅ Approved - Critical for vendor onboarding

### Step 2: Architect Agent - Design
```
"Architect Agent: Design bulk product import feature:
- CSV parsing approach
- Validation strategy
- tRPC endpoint design
- UI component structure
- Error handling
- Progress tracking"
```
**Output**: Technical design document

### Step 3: Architect Agent - Implementation
```
"Architect Agent: Implement bulk product import following the design:
- Create tRPC bulkImport mutation
- Build CSV parser
- Add validation
- Create UI component
- Add progress indicator
- Handle errors gracefully"
```
**Output**: Complete implementation

### Step 4: QA Agent - Testing
```
"QA Agent: Create tests for bulk product import:
- Unit tests for CSV parsing
- Unit tests for validation
- Integration tests for import flow
- E2E tests for UI
- Test error scenarios
- Test edge cases"
```
**Output**: Test suite

### Step 5: QA Agent - Quality Check
```
"QA Agent: Review bulk product import for quality:
- Check for bugs
- Verify security
- Assess performance
- Check error handling
- Provide quality report"
```
**Output**: Quality report

### Step 6: Architect Agent - Fixes
```
"Architect Agent: Fix issues from QA report:
- Address validation bugs
- Improve error messages
- Optimize performance
- Enhance security"
```
**Output**: Fixed implementation

### Step 7: QA Agent - Verification
```
"QA Agent: Verify fixes for bulk product import:
- Re-run tests
- Verify bug fixes
- Final quality check
- Approve for launch"
```
**Output**: ✅ Approved

### Step 8: CTO Agent - Final Approval
```
"CTO Agent: Review bulk product import:
- Check implementation quality
- Verify test coverage
- Assess launch readiness
- Approve for production"
```
**Output**: ✅ Approved for launch

---

## Communication Between Agents

### Handoff Format

When one agent hands off to another, include:
1. **Summary** - What was done
2. **Status** - Current state
3. **Next Steps** - What needs to happen next
4. **Concerns** - Any issues or risks
5. **Context** - Relevant information

### Example Handoff

**Architect → QA**:
```
"Architect Agent: Handing off [feature] to QA Agent.

Summary: Implemented bulk product import with CSV parsing, validation, 
and progress tracking.

Status: Code complete, ready for testing.

Next Steps: 
- Create unit tests for CSV parsing
- Create integration tests for import flow
- Test error scenarios

Concerns: 
- Large file handling needs performance testing
- Validation edge cases need thorough testing

Context: 
- Uses papaparse for CSV parsing
- tRPC endpoint: vendors.products.bulkImport
- UI component: ProductImportView.tsx
- Auto-assigns products to authenticated vendor
"
```

---

## Best Practices

1. **Clear Handoffs** - Always provide context when switching agents
2. **Document Decisions** - Have CTO agent document important decisions
3. **Parallel Work** - Architect and QA can work in parallel when possible
4. **Quality Gates** - Don't skip QA verification
5. **CTO Approval** - Get CTO approval for critical features
6. **Update Tasks** - Update DETAILED_TASKS.md when features complete

---

**Remember**: Each agent has a specific role. Use them appropriately and let them collaborate effectively to deliver quality features for the March 15th launch.
