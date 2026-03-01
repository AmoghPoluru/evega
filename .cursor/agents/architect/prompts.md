# Architect/Developer Agent - Ready-to-Use Prompts

## Feature Implementation

### Design Feature
```
Act as Technical Architect. Design [feature] for Evega:
- Review existing architecture patterns
- Design data model (Payload collections if needed)
- Design API structure (tRPC procedures)
- Design UI components
- Consider vendor data isolation
- Include error handling approach
- Provide implementation plan
```

### Implement Feature
```
Act as Technical Architect. Implement [feature]:
- Follow existing code patterns in codebase
- Use Server Components by default
- Implement proper TypeScript types (no `any`)
- Add access control (vendor scoping if applicable)
- Include error handling
- Add loading states
- Follow file structure conventions
```

### Code Review
```
Act as Technical Architect. Review this code:
[paste code]
- Check architecture compliance
- Verify code quality (types, error handling)
- Assess security (access control, input validation)
- Evaluate performance
- Check consistency with codebase
- Provide specific improvement suggestions
```

## Problem Solving

### Debug Issue
```
Act as Technical Architect. Debug this issue:
[describe issue]
- Analyze error messages/logs
- Identify root cause
- Provide solution approach
- Write code fix
- Suggest prevention strategy
- Consider impact on other parts
```

### Optimize Performance
```
Act as Technical Architect. Optimize [component/query/feature]:
- Analyze current performance
- Identify bottlenecks
- Propose optimizations
- Implement improvements
- Measure performance gains
- Document optimization approach
```

### Refactor Code
```
Act as Technical Architect. Refactor this code:
[paste code]
- Improve maintainability
- Enhance type safety
- Optimize performance
- Follow best practices
- Add proper error handling
- Maintain backward compatibility
```

## Architecture Decisions

### Evaluate Technical Decision
```
Act as Technical Architect. Evaluate this technical decision:
[describe decision/approach]
- List pros and cons
- Assess implementation complexity
- Evaluate performance impact
- Consider security implications
- Review scalability
- Provide recommendation with rationale
```

### Design System Architecture
```
Act as Technical Architect. Design architecture for [system/module]:
- Define component structure
- Design data flow
- Plan API structure
- Consider scalability
- Ensure security
- Document architecture decisions
```

## Code Generation

### Generate Component
```
Act as Technical Architect. Generate [component type] component:
- Follow project patterns
- Use shadcn/ui components
- Implement proper TypeScript types
- Add error handling
- Include loading states
- Make it accessible
- Follow naming conventions
```

### Generate tRPC Procedure
```
Act as Technical Architect. Create tRPC procedure for [feature]:
- Define Zod input schema
- Implement query/mutation logic
- Add proper error handling
- Include access control (if needed)
- Follow existing procedure patterns
- Add comments for complex logic
```

### Generate Payload Collection
```
Act as Technical Architect. Create Payload collection for [entity]:
- Define fields with proper types
- Add access control functions
- Implement hooks if needed
- Set admin configuration
- Follow existing collection patterns
- Document collection purpose
```
