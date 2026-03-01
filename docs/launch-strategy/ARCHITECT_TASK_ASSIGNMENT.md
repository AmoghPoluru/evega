# Architect/Developer Agent - Task Assignment

## Quick Start: Switch to Architect Agent

### Step 1: Switch Agent
```bash
cd /Users/anu/Desktop/Projects/evega
./scripts/switch-agent.sh architect
```

### Step 2: Reload Cursor
Press `Cmd+Shift+P` → Type "Reload Window" → Press Enter

### Step 3: Open Cursor Chat
Press `Cmd+L` to open Cursor Chat

### Step 4: Copy and Paste This Prompt

---

## Ready-to-Use Prompt for Architect Agent

Copy this entire prompt and paste it into Cursor Chat:

```
Architect Agent: I need you to work on the critical tasks identified by the CTO Agent for the March 15th launch deadline. 

Please review the following documents:
1. docs/launch-strategy/CTO_CRITICAL_TASKS.md - Contains detailed analysis of critical tasks
2. docs/DETAILED_TASKS.md - Contains all 170 tasks (updated from 138)

Priority Focus: Complete all P0 (Critical) tasks first:

**P0 Tasks to Complete:**
1. Task #129: Comprehensive Testing Suite (5-7 days)
   - Setup Jest or Vitest with TypeScript
   - Create unit tests for all collections (Products, Orders, Vendors, Users)
   - Create unit tests for all tRPC procedures (auth, checkout, orders, products)
   - Create integration tests for critical workflows (checkout, order creation, vendor approval)
   - Create E2E tests for key user flows (signup → browse → add to cart → checkout → order)
   - Achieve >80% test coverage for critical paths
   - Ensure all tests pass in CI/CD pipeline

2. Task #133: Production Environment Setup (2-3 days)
   - Create .env.production template
   - Setup environment variable validation
   - Configure production Payload settings
   - Test production build locally
   - Document all required environment variables

3. Task #135: Email Service Configuration (1-2 days)
   - Configure SendGrid or AWS SES
   - Create email templates (order confirmation, password reset, vendor approval)
   - Integrate with NextAuth for password reset
   - Add email sending to order webhook
   - Add email sending to vendor approval workflow
   - Test all email functionality

4. Task #137: CI/CD Pipeline Setup (2-3 days)
   - Setup GitHub Actions workflows
   - Configure build and test steps
   - Setup deployment to Vercel/Netlify/Railway
   - Configure environment variables in CI/CD
   - Add deployment approval gates
   - Document rollback procedures

5. Task #138: Monitoring & Error Tracking (2-3 days)
   - Setup Sentry or similar error tracking
   - Add error boundaries in React
   - Add error logging in tRPC
   - Setup performance monitoring
   - Configure alerts for critical errors
   - Create monitoring dashboard

**Additional High Priority Tasks (P1):**
- Task #130: Unit tests for tRPC procedures
- Task #131: Unit tests for components
- Task #132: Integration tests
- Task #134: Production database setup
- Task #136: Production Stripe configuration

**Workflow:**
1. Start with Task #129 (Testing Suite) - This unblocks other tasks
2. Work on Tasks #135 and #138 in parallel (can be done simultaneously)
3. Then complete Task #133 (Production Environment)
4. Finally complete Task #137 (CI/CD Pipeline)

For each task:
- Provide technical implementation approach
- Create necessary files and code
- Follow existing codebase patterns
- Ensure TypeScript types are correct
- Add proper error handling
- Document any new setup required

Please start with Task #129 and provide:
1. Testing framework recommendation (Jest vs Vitest)
2. Test setup configuration
3. Test utilities for Payload and tRPC
4. Initial test structure
5. First set of tests for critical collections

Let me know when you're ready to start!
```

---

## Alternative: Step-by-Step Approach

If you prefer to work on one task at a time, use these individual prompts:

### For Task #129 (Testing Suite):
```
Architect Agent: Review Task #129 in DETAILED_TASKS.md and CTO_CRITICAL_TASKS.md. 
Set up the testing infrastructure for the Evega project. I need:
1. Testing framework setup (Jest or Vitest recommendation)
2. Test configuration files
3. Test utilities for Payload CMS and tRPC
4. Initial test structure
5. First test examples for Products collection

Start implementing the testing suite now.
```

### For Task #135 (Email Service):
```
Architect Agent: Review Task #135 in DETAILED_TASKS.md. Set up email service 
configuration for the Evega project. I need:
1. SendGrid or AWS SES configuration
2. Email templates for order confirmation, password reset, vendor approval
3. Integration with NextAuth
4. Email sending in order webhook
5. Email sending in vendor approval workflow

Start implementing the email service now.
```

### For Task #138 (Monitoring):
```
Architect Agent: Review Task #138 in DETAILED_TASKS.md. Set up monitoring and 
error tracking for the Evega project. I need:
1. Sentry or similar error tracking setup
2. Error boundaries in React components
3. Error logging in tRPC procedures
4. Performance monitoring configuration
5. Alert setup for critical errors

Start implementing monitoring now.
```

---

## Tips for Best Results

1. **Be Specific**: Reference task numbers from DETAILED_TASKS.md
2. **Provide Context**: Mention March 15th launch deadline
3. **Request Step-by-Step**: Ask for implementation approach first, then code
4. **Review Before Implementing**: Ask architect to review existing code patterns
5. **Test as You Go**: Request tests for each feature implemented

---

## Expected Workflow

1. **Architect Reviews Tasks** → Provides implementation approach
2. **Architect Creates Code** → Implements features
3. **Switch to QA Agent** → Verify implementation
4. **Switch Back to CTO** → Get approval

---

**Ready to start?** Run the switch command and paste the prompt!
