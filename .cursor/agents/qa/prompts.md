# QA Agent - Ready-to-Use Prompts

## Test Generation

### Generate Unit Tests
```
Act as QA Engineer. Generate unit tests for [function/component]:
- Test success cases
- Test error cases
- Test edge cases
- Test boundary conditions
- Use Jest/Vitest
- Follow project test patterns
- Aim for >80% coverage
```

### Generate Integration Tests
```
Act as QA Engineer. Create integration tests for [workflow]:
- Test module interactions
- Test data flow
- Test error handling
- Test access control
- Use appropriate testing framework
- Include setup/teardown
- Test real-world scenarios
```

### Generate E2E Tests
```
Act as QA Engineer. Create E2E tests for [user workflow]:
- Test complete user journey
- Test critical paths
- Test error scenarios
- Test on different browsers
- Use Playwright/Cypress
- Include assertions
- Test vendor isolation
```

## Quality Assessment

### Review Code Quality
```
Act as QA Engineer. Assess code quality:
[paste code]
- Check for bugs
- Identify security issues
- Evaluate test coverage needs
- Assess error handling
- Review type safety
- Check performance concerns
- Provide quality score (0-100%)
```

### Test Coverage Analysis
```
Act as QA Engineer. Analyze test coverage for [module]:
- Calculate current coverage
- Identify uncovered code
- Prioritize test gaps
- Recommend test cases
- Set coverage goals
- Provide coverage report
```

### Bug Detection
```
Act as QA Engineer. Review this code for bugs:
[paste code]
- Identify potential bugs
- Assess bug severity
- Provide reproduction steps
- Suggest fixes
- Recommend test cases to prevent regression
```

## Testing Workflows

### Test Vendor Workflow
```
Act as QA Engineer. Create test plan for vendor workflow:
- Vendor registration
- Product creation
- Product management
- Order viewing
- Analytics access
- Test vendor data isolation
- Test access control
```

### Test Checkout Flow
```
Act as QA Engineer. Create comprehensive tests for checkout:
- Add to cart
- Cart management
- Address entry
- Payment processing
- Order creation
- Error handling
- Edge cases
```

### Test Order Management
```
Act as QA Engineer. Test order management:
- Order creation
- Order status updates
- Order viewing (vendor and customer)
- Order filtering
- Order search
- Access control
- Error scenarios
```

## Quality Reporting

### Quality Report
```
Act as QA Engineer. Generate quality report:
- Test coverage by module
- Bugs found (with severity)
- Test results summary
- Quality metrics
- Risk assessment
- Recommendations
- Launch readiness from QA perspective
```

### Regression Test Plan
```
Act as QA Engineer. Create regression test plan for [feature]:
- Identify affected areas
- List test cases to run
- Prioritize test execution
- Document expected results
- Plan test automation
- Schedule test execution
```

### Security Test
```
Act as QA Engineer. Conduct security testing:
- Test access control
- Test input validation
- Test authentication
- Test authorization
- Test data exposure
- Test API security
- Report vulnerabilities
```
