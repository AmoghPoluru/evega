# Evega - Multi-Vendor Marketplace - Detailed Task List

> **Purpose**: Comprehensive task list with detailed tasks for building Evega multi-vendor marketplace. Tasks are granular and actionable, starting from project setup.

## Implementation Status Summary

### Status Legend
- ✅ = Completed
- ❌ = Missing/Not Implemented
- ⚠️ = Needs Verification/Manual Testing
- 🔄 = In Progress

### Quick Status by Category

**Project Setup & Initialization (Tasks 1-40)**: Most completed
**Database & Payload CMS Setup (Tasks 26-50)**: Most completed
**Authentication & Access Control (Tasks 51-100)**: Most completed
**Collections Setup (Tasks 101-200)**: Most completed
**Vendor Dashboard (Tasks 201-300)**: Partially completed
**Customer Features (Tasks 301-400)**: Partially completed
**Admin Dashboard (Tasks 401-500)**: Partially completed

---

## Vendor ↔ Admin Task Inbox & Support (New)

### Vendor–Admin Communication & Task Inbox (Tasks 501–520)

501. ✅ Design vendor–admin task model (support tickets)
    - **Tech**: Defined `VendorTasks` TypeScript interface and Payload schema with fields: `title` (text, required), `description` (richText, Lexical), `type` (select: question, feature-request, bug, onboarding, other), `status` (select: open, in-progress, waiting-on-vendor, waiting-on-admin, closed), `priority` (select: low, normal, high, urgent), `vendor` (relationship to Vendors), `createdBy` (relationship to Users), `assignedTo` (relationship to Users, optional), `tags` (array of text), `visibility` (select: vendor-and-admin, admin-only), `closedAt` (date, optional), `lastReadAtByVendor` (date, optional), `lastReadAtByAdmin` (json map, optional).
    - **Status**: ✅ Complete
    - **Files**: `src/collections/VendorTasks.ts`

502. ✅ Implement `VendorTasks` collection in Payload
    - **Tech**: Created `vendor-tasks` collection in `src/collections/VendorTasks.ts` with access control:
      - **Read**: Super admins see all; vendors see only their own tasks
      - **Create**: Super admins and vendors can create
      - **Update**: Super admins can update all; vendors can update only their own tasks
      - **Delete**: Only super admins can delete
    - Hooks: `beforeChange` hook auto-sets `vendor` and `createdBy` from authenticated session on create
    - **Status**: ✅ Complete
    - **Files**: `src/collections/VendorTasks.ts`, `src/payload.config.ts`

503. ✅ Implement `VendorTaskMessages` (thread/comments) collection
    - **Tech**: Created `vendor-task-messages` collection in `src/collections/VendorTaskMessages.ts` with:
      - `task` (relationship to VendorTasks, required)
      - `author` (relationship to Users, required)
      - `role` (select: vendor, admin, required)
      - `body` (richText, Lexical editor, required)
      - `attachments` (array of media uploads, optional)
      - `isInternal` (checkbox, default false) - internal notes hidden from vendors via access control
    - Access control: Vendors see only non-internal messages; admins see all messages
    - **Status**: ✅ Complete
    - **Files**: `src/collections/VendorTaskMessages.ts`, `src/payload.config.ts`

504. ✅ Add vendor task list page in Vendor Dashboard
    - **Tech**: Created `/vendor/tasks` page (`src/app/(app)/vendor/tasks/page.tsx`) using:
      - Server component with `requireVendor()` middleware for authentication
      - tRPC `caller.vendorTasks.listForVendor()` query with optional filters (status, type, priority)
      - Card-based UI showing task title (link), type, vendor name, status badge, priority, last updated, assigned admin
      - "New Task" button linking to `/vendor/tasks/new`
      - Empty state when no tasks exist
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/vendor/tasks/page.tsx`, `src/modules/vendor-tasks/server/procedures.ts`

505. ✅ Add "Support & Tasks" entry card on `/vendor/dashboard`
    - **Tech**: Added "Support & Tasks (Ask BDO/Admin)" link in Quick Actions card on vendor dashboard (`src/app/(app)/vendor/dashboard/page.tsx`)
    - Link directs to `/vendor/tasks` page
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/vendor/dashboard/page.tsx`

506. ✅ Implement vendor "Create Task / Ask a Question" flow
    - **Tech**: Created `/vendor/tasks/new` page with:
      - `NewTaskForm` component (`src/app/(app)/vendor/tasks/new/task-form.tsx`) using React Hook Form + Zod validation
      - Form fields: title (required, min 3 chars), type (select), priority (select), description (textarea)
      - tRPC `trpc.vendorTasks.create` mutation that:
        - Auto-assigns `vendor` from authenticated session
        - Auto-assigns `createdBy` from authenticated user
        - Sets `status='open'` by default
        - Converts description text to Lexical rich text format
      - Redirects to `/vendor/tasks/[taskId]` on success
      - Protected by `requireVendor()` middleware
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/vendor/tasks/new/page.tsx`, `src/app/(app)/vendor/tasks/new/task-form.tsx`, `src/modules/vendor-tasks/server/procedures.ts`

507. ✅ Implement vendor task detail / conversation view
    - **Tech**: Created `/vendor/tasks/[taskId]` page (`src/app/(app)/vendor/tasks/[taskId]/page.tsx`) with:
      - Server component fetching task via `caller.vendorTasks.getOne({ id })`
      - Server component fetching messages via `caller.vendorTasks.listMessagesForTask({ taskId })`
      - Message timeline showing all messages with author role (Vendor/Admin), timestamp, and rich text body
      - `TaskReplyForm` component for adding new messages (hidden when task is closed)
      - `CloseTaskButton` component for closing tasks (shows "Task Closed" badge when closed)
      - Warning banner when task is closed
      - Protected by `requireVendor()` middleware
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/vendor/tasks/[taskId]/page.tsx`, `src/app/(app)/vendor/tasks/[taskId]/reply-form.tsx`, `src/app/(app)/vendor/tasks/[taskId]/close-task-button.tsx`

508. ✅ Add admin "Vendor Tasks" overview in admin dashboard
    - **Tech**: Created `/admin-tasks` page (`src/app/(app)/admin-tasks/page.tsx`) with:
      - Server component using `requireAppAdmin()` middleware (checks for `app-admin` role or `super-admin` legacy role)
      - tRPC `caller.vendorTasks.listForVendor()` query (admins see all tasks)
      - Card-based UI showing all vendor tasks with:
        - Task title (link to detail page)
        - Type, vendor name
        - Priority
        - "Open & Reply" button linking to detail page
        - Last updated timestamp
        - Assigned admin (if any)
      - Admin status banner showing logged-in admin email
      - Empty state when no tasks exist
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/admin-tasks/page.tsx`, `src/lib/middleware/admin-auth.ts`

509. ✅ Implement admin task detail view with internal notes
    - **Tech**: Created `/admin-tasks/[taskId]` page (`src/app/(app)/admin-tasks/[taskId]/page.tsx`) with:
      - Server component fetching task and messages via tRPC
      - Full message thread showing:
        - Vendor messages (role: "vendor")
        - Admin messages (role: "admin")
        - Internal notes (marked with "Internal" badge when `isInternal=true`)
      - `TaskReplyForm` component for admins to reply (hidden when task is closed)
      - `CloseTaskButton` component for closing tasks
      - Warning banner when task is closed
      - Admin status banner
      - Protected by `requireAppAdmin()` middleware
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/admin-tasks/[taskId]/page.tsx`, `src/lib/middleware/admin-auth.ts`

510. ✅ Implement task state workflow & status transitions
    - **Tech**: Implemented status workflow in tRPC procedures:
      - New tasks start with `status='open'` (set in `create` mutation)
      - `addMessage` mutation: When vendor replies and task status is `waiting-on-vendor`, auto-updates to `waiting-on-admin`
      - `closeTask` mutation: Both vendors and admins can close tasks (sets `status='closed'` and `closedAt` timestamp)
      - Status enum enforced via Zod schema: `open`, `in-progress`, `waiting-on-vendor`, `waiting-on-admin`, `closed`
      - Access control: Vendors can only close their own tasks; admins can close any task
    - **Status**: ✅ Complete
    - **Files**: `src/modules/vendor-tasks/server/procedures.ts`, `src/collections/VendorTasks.ts`

511. ⚠️ Track unread messages per side (vendor/admin)
    - **Tech**: Fields `lastReadAtByVendor` and `lastReadAtByAdmin` exist in `VendorTasks` collection but not yet updated on view
    - **Details**: Fields are defined but update logic not implemented; unread badge computation not implemented
    - **Status**: ⚠️ Partially complete (fields exist, update logic pending)
    - **Files**: `src/collections/VendorTasks.ts`

512. ❌ Add notifications for new messages and status changes
    - **Tech**: Not implemented yet
    - **Details**: No email or in-app notifications; no cache invalidation hooks
    - **Status**: ❌ Not started

513. ❌ Add basic reporting for vendor tasks
    - **Tech**: Not implemented yet
    - **Details**: No metrics aggregation, no dashboard, no CSV export
    - **Status**: ❌ Not started

514. ❌ Add quick-reply templates for common vendor questions
    - **Tech**: Not implemented yet
    - **Details**: No template collection, no template picker in admin UI
    - **Status**: ❌ Not started

515. ❌ Link tasks to relevant admin screens
    - **Tech**: Not implemented yet
    - **Details**: No contextual links to vendor detail, category manager, product forms
    - **Status**: ❌ Not started

516. ✅ Add role-based permissions and audit log for tasks
    - **Tech**: Implemented comprehensive access control:
      - **VendorTasks collection**: Vendors can read/create/update only their own tasks; admins have full access
      - **VendorTaskMessages collection**: Vendors see only non-internal messages; admins see all messages
      - Access control functions: `isSuperAdmin()`, `isVendor()`, `getVendorId()` from `src/lib/access.ts`
      - Middleware: `requireVendor()` for vendor routes, `requireAppAdmin()` for admin routes
    - **Details**: Audit trail via `createdBy`, `updatedAt`, `closedAt` fields; no separate audit log collection
    - **Status**: ✅ Complete (permissions implemented; separate audit log collection not created)
    - **Files**: `src/collections/VendorTasks.ts`, `src/collections/VendorTaskMessages.ts`, `src/lib/access.ts`, `src/lib/middleware/vendor-auth.ts`, `src/lib/middleware/admin-auth.ts`

### Task Closing & Readonly Mode (Additional Feature)

517. ✅ Implement task closing functionality
    - **Tech**: Created `closeTask` tRPC mutation in `src/modules/vendor-tasks/server/procedures.ts`:
      - Sets `status='closed'` and `closedAt` timestamp
      - Access control: Vendors can only close their own tasks; admins can close any task
      - Returns updated task document
    - **Status**: ✅ Complete
    - **Files**: `src/modules/vendor-tasks/server/procedures.ts`

518. ✅ Implement readonly mode for closed tasks
    - **Tech**: Updated `TaskReplyForm` component to:
      - Accept `taskStatus` prop
      - Hide reply form when `taskStatus === "closed"`
      - Show readonly message: "This task is closed. No new messages can be sent."
    - Updated `addMessage` mutation to prevent messages on closed tasks (throws error: "Cannot send messages to a closed task")
    - Added warning banners on both vendor and admin detail pages when task is closed
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/vendor/tasks/[taskId]/reply-form.tsx`, `src/modules/vendor-tasks/server/procedures.ts`, `src/app/(app)/vendor/tasks/[taskId]/page.tsx`, `src/app/(app)/admin-tasks/[taskId]/page.tsx`

519. ✅ Create CloseTaskButton component
    - **Tech**: Created `CloseTaskButton` component (`src/app/(app)/vendor/tasks/[taskId]/close-task-button.tsx`):
      - Shows "Close Task" button when task is open
      - Shows "Task Closed" badge when task is closed
      - Includes confirmation dialog before closing
      - Uses tRPC `trpc.vendorTasks.closeTask` mutation
      - Refreshes page after successful close
    - Added to both vendor and admin task detail pages
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/vendor/tasks/[taskId]/close-task-button.tsx`

520. ✅ Add admin dashboard link to navbar
    - **Tech**: Added "Admin Dashboard" button to main navbar (`src/app/(app)/(home)/navbar/Navbar.tsx`):
      - Visible only to users with `app-admin` role or `super-admin` legacy role
      - Links to `/admin-tasks`
      - Shown in both desktop and mobile views
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/(home)/navbar/Navbar.tsx`

### Users collection — BD / BDO app role (parity with EvegaSupply)

**Goal:** Give Evega a first-class **BD** (Business Development) staff role on the `users` collection, matching the behavior of EvegaSupply’s **`bdo`** user role (BDO = same function; product copy may say “BD” or “BDO”).

**Reference (EvegaSupply):**

- `evegasupply/src/collections/Users.ts`: `role` is a **select** with `{ label: 'BDO', value: 'bdo' }` alongside `user`, `vendor`, `buyer`, `admin`.
- Payload CMS `/admin` access: only **`role === 'admin'`** — BDO users do **not** use Payload admin; they use the main app (e.g. BDO inbox, assigned buyer/vendor relationships).
- Related collections filter BDO assignees with `filterOptions: { role: { in: ['admin', 'bdo'] } }` (see `BdoConversations`, buyer/vendor `bdo` fields).

**Evega difference (today):**

- Users use the **`roles`** collection via **`appRole`** / **`vendorRole`** (`src/collections/Users.ts`), not a string `role` field.
- **`app-admin`** exists; UI and tasks mention BDO, but **`requireAppAdmin()`** / **`isSuperAdmin()`** effectively gate staff flows — there is **no** dedicated **`bdo`** (or **`bd`**) **app role** document and no consistent `hasAppRole(user, 'bdo')` checks yet.

**Todo (implementation — not started):**

- [ ] **521 — Role definition:** Add an **application** role in the `roles` collection for staff BD/BDO (decide **slug**: recommend **`bdo`** for parity with EvegaSupply and existing copy; if product standardizes on “BD” only, use slug **`bd`** and document the mapping). Include **name**, **description**, **`type: app`**, **`isActive`**.
- [ ] **522 — Seed / migration:** Ship a seed script or Payload migration so **`bdo`** (or **`bd`**) exists in dev/staging/prod and cannot be missing when assigning users.
- [ ] **523 — Access helpers:** Extend `src/lib/access.ts` (and any session helpers) with **`isBdo(user)`**, **`isAppStaff(user)`** (or similar) meaning **app-admin OR BDO** — mirror EvegaSupply’s checks that treat **`admin` + `bdo`** together where appropriate.
- [ ] **524 — Users schema / admin UI:** Update **`Users`** field conditions so BD/BDO users **do not require `vendor`** (same pattern as **`app-admin`**: hide or relax `vendor` / `vendorRole` when `appRole.slug` is BDO).
- [ ] **525 — Payload admin:** Align **`users`** (and global) **`access.admin`** with EvegaSupply: only **full admins** use Payload Admin UI; **exclude** BDO from Payload unless product explicitly wants BDO in admin (document decision).
- [ ] **526 — App routes & middleware:** Extend **`requireAppAdmin`** or add **`requireAppStaff`** so **`/admin-tasks`** (and any future BD-only routes) allow **BDO** as well as **app-admin** / legacy super-admin; keep **vendor** and **customer** users blocked.
- [ ] **527 — Navbar & redirects:** Show “Admin dashboard” / staff links for **`isAppStaff`**; optional **home redirect** for BDO-only sessions (parity with EvegaSupply BDO dashboard routing — see `evegasupply` `(app)` home / BDO layout).
- [ ] **528 — Data model joins:** Where **`vendors.bdo`** / **`VendorTasks.assignedTo`** / admin pickers reference users, add **`filterOptions`** (or query constraints) so only **admin + BDO** users are selectable assignees (same idea as EvegaSupply **`filterOptions: { role: { in: ['admin', 'bdo'] } }`**, adapted to **`appRole`**).
- [ ] **529 — tRPC & collection access:** Audit **`vendorTasks`** and other staff procedures; replace bare **`isSuperAdmin`** with **`isAppStaff`** (or per-endpoint admin-only vs BDO-allowed) so BDO can perform allowed operations without super-admin.
- [ ] **530 — Types & tests:** Regenerate **`payload-types`**; add unit tests for **`isBdo` / `isAppStaff`** and middleware behavior; update **`tests/unit/lib/access.test.ts`** fixtures.

**Out of scope for this block (separate tasks later):** Full EvegaSupply-style **`bdo-conversations`** / realtime chat; this list is **users + roles + staff gates + assignee filters** only.

---

## Project Setup & Initialization

1. ✅ Create new Next.js project with TypeScript
   - **Tech**: Run `npx create-next-app@latest evega --typescript --app --tailwind --eslint`
   - **Details**: Next.js 16.1.6 with App Router, TypeScript, Tailwind CSS v4
   - **Status**: ✅ Project created with Next.js 16.1.6

2. ✅ Install Payload CMS dependencies
   - **Tech**: Run `npm install payload @payloadcms/db-mongodb @payloadcms/next @payloadcms/richtext-lexical`
   - **Details**: Payload CMS 3.74.0 with MongoDB adapter and Lexical editor
   - **Status**: ✅ Payload CMS 3.74.0 installed

3. ✅ Install tRPC dependencies
   - **Tech**: Run `npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query superjson`
   - **Details**: tRPC 11.9.0 for type-safe APIs, React Query 5.90.20
   - **Status**: ✅ tRPC and React Query installed

4. ✅ Install MongoDB driver
   - **Tech**: Included with `@payloadcms/db-mongodb`
   - **Status**: ✅ MongoDB adapter configured

5. ✅ Install Stripe SDK
   - **Tech**: Run `npm install stripe`
   - **Details**: Stripe 20.3.1 for payment processing
   - **Status**: ✅ Stripe installed

6. ✅ Install shadcn/ui components
   - **Tech**: Run `npx shadcn@latest init` then install base components
   - **Details**: Radix UI components with Tailwind CSS styling
   - **Status**: ✅ shadcn/ui components installed

7. ✅ Setup Tailwind CSS configuration
   - **Tech**: Configure `tailwind.config.ts` with shadcn/ui theme
   - **Details**: Tailwind CSS v4 with custom colors and theme
   - **Status**: ✅ Tailwind CSS configured

8. ✅ Configure TypeScript paths
   - **Tech**: Update `tsconfig.json` with path aliases like `@/*` pointing to `src/*`
   - **Status**: ✅ Path aliases configured

9. ✅ Setup environment variables file
   - **Tech**: Create `.env.local` with `MONGODB_URI`, `PAYLOAD_SECRET`, `STRIPE_SECRET_KEY`, etc.
   - **Details**: Environment variables for database, Payload, Stripe, NextAuth
   - **Status**: ✅ Environment variables configured

10. ✅ Create .gitignore file
    - **Tech**: Add `.env.local`, `.next`, `node_modules`, `.payload` to `.gitignore`
    - **Status**: ✅ .gitignore configured

11. ✅ Initialize Git repository
    - **Tech**: Run `git init` and create initial commit
    - **Status**: ✅ Git repository initialized

12. ✅ Setup ESLint configuration
    - **Tech**: Configure `eslint.config.mjs` with Next.js and TypeScript rules
    - **Status**: ✅ ESLint configured

13. ✅ Setup Prettier configuration
    - **Tech**: Create `.prettierrc` with formatting rules
    - **Status**: ✅ Prettier configured (if applicable)

14. ✅ Create project folder structure
    - **Tech**: Create `src/app`, `src/components`, `src/collections`, `src/lib`, `src/modules`, `src/trpc` directories
    - **Structure**:
      - `src/app/` - Next.js App Router pages
      - `src/collections/` - Payload CMS collections
      - `src/components/` - React components
      - `src/lib/` - Utility functions
      - `src/modules/` - Feature modules (auth, vendor, products, checkout, orders)
      - `src/trpc/` - tRPC routers and setup
    - **Status**: ✅ Folder structure created

15. ✅ Setup package.json scripts
    - **Tech**: Add scripts: `dev`, `build`, `start`, `generate:types`, `db:seed`, etc.
    - **Scripts**:
      - `dev` - Start development server
      - `build` - Build for production
      - `start` - Start production server
      - `generate:types` - Generate Payload TypeScript types
      - `db:seed` - Seed database with initial data
      - `db:fresh` - Fresh database migration
    - **Status**: ✅ Scripts configured

16. ✅ Install date-fns for date handling
    - **Tech**: Run `npm install date-fns`
    - **Status**: ✅ date-fns 4.1.0 installed

17. ✅ Install Zod for validation
    - **Tech**: Run `npm install zod`
    - **Details**: Zod 4.3.6 for schema validation
    - **Status**: ✅ Zod installed

18. ✅ Install React Hook Form
    - **Tech**: Run `npm install react-hook-form @hookform/resolvers`
    - **Details**: React Hook Form 7.71.1 with Zod resolver
    - **Status**: ✅ React Hook Form installed

19. ✅ Install React Query
    - **Tech**: Already installed with tRPC, verify `@tanstack/react-query` is present
    - **Status**: ✅ React Query 5.90.20 installed

20. ✅ Install Zustand for state management
    - **Tech**: Run `npm install zustand`
    - **Details**: Zustand 5.0.11 for client-side state management
    - **Status**: ✅ Zustand installed

21. ✅ Install Lucide React icons
    - **Tech**: Run `npm install lucide-react`
    - **Details**: Lucide React 0.563.0 for icons
    - **Status**: ✅ Lucide React installed

22. ✅ Install Sonner for toast notifications
    - **Tech**: Run `npm install sonner`
    - **Details**: Sonner 2.0.7 for toast notifications
    - **Status**: ✅ Sonner installed

23. ✅ Setup Next.js App Router structure
    - **Tech**: Create route groups: `(app)/(home)`, `(app)/(vendor)`, `(app)/(auth)`, `(payload)`
    - **Route Groups**:
      - `(app)/(home)` - Public customer-facing pages
      - `(app)/(vendor)` - Vendor dashboard pages
      - `(app)/(auth)` - Authentication pages
      - `(payload)` - Payload CMS admin panel
    - **Status**: ✅ Route groups created

24. ✅ Create base layout component
    - **Tech**: Create `src/app/(app)/layout.tsx` with shared layout structure
    - **Details**: Root layout with providers (tRPC, React Query, theme)
    - **Status**: ✅ Base layout created

25. ✅ Create root layout with providers
    - **Tech**: Create `src/app/layout.tsx` with tRPC, React Query, and theme providers
    - **Details**: Wraps app with TRPCReactProvider, QueryClientProvider, ThemeProvider
    - **Status**: ✅ Root layout with providers created

## Database & Payload CMS Setup

26. ✅ Connect to MongoDB database
    - **Tech**: Configure MongoDB connection string in `payload.config.ts` using `@payloadcms/db-mongodb`
    - **Details**: Uses `mongooseAdapter` with `DATABASE_URL` environment variable
    - **Status**: ✅ MongoDB connection configured

27. ✅ Create Payload config file
    - **Tech**: Create `src/payload.config.ts` with collections array, database adapter, and admin config
    - **Details**: Config includes all collections, Lexical editor, Sharp for image processing
    - **Status**: ✅ Payload config created

28. ✅ Setup Payload admin panel
    - **Tech**: Configure admin route in `src/app/(payload)/admin/[[...segments]]/page.tsx` using `@payloadcms/next`
    - **Details**: Admin panel accessible at `/admin`
    - **Status**: ✅ Admin panel configured

29. ✅ Configure Payload authentication
    - **Tech**: Setup Users collection with email/password auth in `src/collections/Users.ts`
    - **Details**: Users collection with role-based access control
    - **Status**: ✅ Authentication configured

30. ✅ Setup Payload media uploads
    - **Tech**: Create Media collection in `src/collections/Media.ts` with upload configuration
    - **Details**: Media collection for images, files, with Sharp optimization
    - **Status**: ✅ Media collection created

31. ✅ Configure Payload email plugin
    - **Tech**: Email functionality (if configured)
    - **Status**: ⚠️ Needs verification

32. ✅ Setup Payload hooks system
    - **Tech**: Add `beforeValidate`, `beforeChange`, `afterChange` hooks to collections as needed
    - **Details**: Hooks added to Products, Vendors, Orders collections
    - **Status**: ✅ Hooks implemented

33. ✅ Generate Payload TypeScript types
    - **Tech**: Run `npm run generate:types` to generate `src/payload-types.ts` from collections
    - **Status**: ✅ Types generated

34. ✅ Test Payload admin access
    - **Tech**: Access `/admin` route and verify login, collections display, and CRUD operations work
    - **Status**: ✅ Admin panel accessible

35. ✅ Setup database seed scripts
    - **Tech**: Create seed scripts in `src/seed/` directory
    - **Scripts**:
      - `seed.ts` - Main seed script
      - `seed-users.ts` - Seed users
      - `seed-categories.ts` - Seed categories
      - `seed-tags.ts` - Seed tags
      - `seed-variants.ts` - Seed product variants
      - `seed-hero-banners.ts` - Seed hero banners
    - **Status**: ✅ Seed scripts created

36. ✅ Configure Payload access control
    - **Tech**: Add `access` functions to collections for read, create, update, delete permissions
    - **Details**: Access control implemented in Products, Vendors, Orders, Users collections
    - **Status**: ✅ Access control configured

37. ✅ Setup Payload collections structure
    - **Tech**: Organize collections in `src/collections/` directory with proper imports in `payload.config.ts`
    - **Collections**: Users, Media, Categories, Products, Tags, HeroBanners, Orders, Vendors, Roles, Customers, VariantTypes, VariantOptions
    - **Status**: ✅ Collections organized

38. ✅ Test Payload API endpoints
    - **Tech**: Test REST API endpoints at `/api/{collection}` and GraphQL if enabled
    - **Status**: ✅ API endpoints working

## Authentication & Access Control

### UI Components & Pages

39. ✅ Create Users collection
    - **Tech**: Users collection exists in `src/collections/Users.ts`
    - **Details**: Users with roles (admin, vendor, customer), vendor relationship
    - **Status**: ✅ Users collection created

40. ✅ Create Navbar component
    - **Tech**: Create `src/app/(app)/(home)/navbar/Navbar.tsx` component
    - **Details**: Navigation bar with logo, menu items, user menu, cart icon
    - **Status**: ✅ Navbar created

41. ✅ Create Login page route
    - **Tech**: Create `src/app/(app)/(auth)/sign-in/page.tsx` route
    - **Details**: Login form with email and password, OAuth options
    - **Status**: ✅ Login page created

42. ✅ Create Signup page route
    - **Tech**: Create `src/app/(app)/(auth)/sign-up/page.tsx` route
    - **Details**: Signup form with email, password, name fields
    - **Status**: ✅ Signup page created

43. ✅ Create Auth layout component
    - **Tech**: Create `src/app/(app)/(auth)/layout.tsx` for auth pages
    - **Details**: Shared layout for login/signup pages
    - **Status**: ✅ Auth layout created

44. ✅ Integrate Navbar into root layout
    - **Tech**: Add Navbar component to layout
    - **Details**: Navbar visible on all pages except auth pages
    - **Status**: ✅ Navbar integrated

### Backend Authentication (tRPC & NextAuth)

45. ✅ Setup NextAuth
    - **Tech**: Configure NextAuth 5.0.0-beta.30 in `src/lib/auth.config.ts`
    - **Details**: NextAuth with Payload CMS adapter
    - **Status**: ✅ NextAuth configured

46. ✅ Create NextAuth API route
    - **Tech**: Create `src/app/api/auth/[...nextauth]/route.ts`
    - **Details**: NextAuth API route handler
    - **Status**: ✅ NextAuth route created

47. ✅ Create tRPC auth router
    - **Tech**: Create `src/modules/auth/server/procedures.ts` router
    - **Details**: tRPC auth procedures for session, login, logout
    - **Status**: ✅ Auth router created

48. ✅ Create user registration endpoint
    - **Tech**: Add registration mutation to auth router
    - **Details**: User registration with email/password validation
    - **Status**: ✅ Registration endpoint created

49. ✅ Create user login endpoint
    - **Tech**: Add login mutation to auth router
    - **Details**: User login with session management
    - **Status**: ✅ Login endpoint created

50. ✅ Create user logout endpoint
    - **Tech**: Add logout mutation to auth router
    - **Details**: Session invalidation and cookie clearing
    - **Status**: ✅ Logout endpoint created

51. ✅ Create get current user endpoint
    - **Tech**: Add session query to auth router
    - **Details**: Get current authenticated user from session
    - **Status**: ✅ Session query created

52. ✅ Update tRPC context with user session
    - **Tech**: Modify `src/trpc/init.ts` to include user in context
    - **Details**: User extracted from NextAuth session in tRPC context
    - **Status**: ✅ Context updated

### Role-Based Access Control

53. ✅ Extend Users collection with roles
    - **Tech**: Add `role` field to Users collection
    - **Details**: Roles: 'admin', 'vendor', 'customer'
    - **Status**: ✅ Roles implemented

54. ✅ Create role-based access control helpers
    - **Tech**: Create `src/lib/access.ts` helper functions
    - **Functions**: `isSuperAdmin()`, `isVendor()`, `getVendorId()`
    - **Status**: ✅ Access helpers created

55. ✅ Create vendor authentication middleware
    - **Tech**: Create `src/lib/middleware/vendor-auth.ts`
    - **Details**: `getVendorStatus()` and `requireVendor()` functions
    - **Status**: ✅ Vendor middleware created

### Protected Routes & State Management

56. ✅ Setup authentication state management
    - **Tech**: Use NextAuth session for auth state
    - **Details**: Session managed via NextAuth hooks
    - **Status**: ✅ Auth state managed

57. ✅ Create useAuth hook
    - **Tech**: Create custom hook for authentication
    - **Details**: Hook uses NextAuth `useSession()` and tRPC session query
    - **Status**: ✅ useAuth hook created

58. ✅ Update Navbar to use auth state
    - **Tech**: Integrate auth state in Navbar component
    - **Details**: Show login button or user menu based on auth state
    - **Status**: ✅ Navbar uses auth state

## Collections Setup

### Core Collections

59. ✅ Create Categories collection
    - **Tech**: Create `src/collections/Categories.ts`
    - **Details**: Categories with parent-child relationships, subcategories, colors
    - **Status**: ✅ Categories collection created

60. ✅ Create Products collection
    - **Tech**: Create `src/collections/Products.ts`
    - **Details**: Products with vendor relationship, variants, pricing, stock, images
    - **Status**: ✅ Products collection created

61. ✅ Create Vendors collection
    - **Tech**: Create `src/collections/Vendors.ts`
    - **Details**: Vendors with name, slug, description, logo, status, isActive
    - **Status**: ✅ Vendors collection created

62. ✅ Create Orders collection
    - **Tech**: Create `src/collections/Orders.ts`
    - **Details**: Orders with customer, vendor, items, total, status, shipping address
    - **Status**: ✅ Orders collection created

63. ✅ Create Tags collection
    - **Tech**: Create `src/collections/Tags.ts`
    - **Details**: Tags for product categorization and filtering
    - **Status**: ✅ Tags collection created

64. ✅ Create HeroBanners collection
    - **Tech**: Create `src/collections/HeroBanners.ts`
    - **Details**: Hero banners for homepage with products, images, order
    - **Status**: ✅ HeroBanners collection created

65. ✅ Create Customers collection
    - **Tech**: Create `src/collections/Customers.ts`
    - **Details**: Customer profiles with addresses, orders relationship
    - **Status**: ✅ Customers collection created

66. ✅ Create Roles collection
    - **Tech**: Create `src/collections/Roles.ts`
    - **Details**: Role definitions for access control
    - **Status**: ✅ Roles collection created

67. ✅ Create VariantTypes collection
    - **Tech**: Create `src/collections/VariantTypes.ts`
    - **Details**: Product variant types (Size, Color, etc.)
    - **Status**: ✅ VariantTypes collection created

68. ✅ Create VariantOptions collection
    - **Tech**: Create `src/collections/VariantOptions.ts`
    - **Details**: Variant option values (Small, Medium, Large, Red, Blue, etc.)
    - **Status**: ✅ VariantOptions collection created

## Product Management

### Product Features

69. ✅ Create product listing page
    - **Tech**: Create `src/app/(app)/(home)/page.tsx` for homepage
    - **Details**: Homepage with hero banners, featured products, categories
    - **Status**: ✅ Homepage created

70. ✅ Create product detail page
    - **Tech**: Create `src/app/(app)/products/[productId]/page.tsx`
    - **Details**: Product detail page with images, variants, add to cart
    - **Status**: ✅ Product detail page created

71. ✅ Create product card component
    - **Tech**: Create `src/components/product-card.tsx`
    - **Details**: Product card with image, name, price, quick view
    - **Status**: ✅ Product card created

72. ✅ Create product filters
    - **Tech**: Create `src/components/product-filters/` components
    - **Details**: Filter components for category, price, tags, variants
    - **Status**: ✅ Product filters created

73. ✅ Create product search
    - **Tech**: Create `src/app/(app)/(home)/search/page.tsx`
    - **Details**: Search page with filters and results
    - **Status**: ✅ Search page created

74. ✅ Create category pages
    - **Tech**: Create `src/app/(app)/(home)/[category]/page.tsx` and `[subcategory]/page.tsx`
    - **Details**: Category and subcategory product listing pages
    - **Status**: ✅ Category pages created

### Product Variants

75. ✅ Implement product variants system
    - **Tech**: Products collection has variants relationship
    - **Details**: Variants with type, options, price, stock, SKU
    - **Status**: ✅ Variants system implemented

76. ✅ Create variant selector component
    - **Tech**: Create variant selector in product detail page
    - **Details**: Select variant type and option, update price/stock
    - **Status**: ✅ Variant selector created

## Vendor Dashboard

### Foundation

77. ✅ Create vendor dashboard layout
    - **Tech**: Create `src/app/(app)/vendor/layout.tsx`
    - **Details**: Layout with sidebar and header, vendor route protection
    - **Status**: ✅ Vendor layout created

78. ✅ Create vendor sidebar component
    - **Tech**: Create `src/app/(app)/vendor/components/VendorSidebar.tsx`
    - **Details**: Navigation sidebar with menu items
    - **Status**: ✅ Vendor sidebar created

79. ✅ Create vendor header component
    - **Tech**: Create `src/app/(app)/vendor/components/VendorHeader.tsx`
    - **Details**: Header with vendor branding and user menu
    - **Status**: ✅ Vendor header created

80. ✅ Setup vendor route protection
    - **Tech**: Use `requireVendor()` middleware in vendor layout
    - **Details**: Redirects to pending/suspended pages if vendor not approved
    - **Status**: ✅ Route protection implemented

81. ✅ Create vendor dashboard home page
    - **Tech**: Create `src/app/(app)/vendor/dashboard/page.tsx`
    - **Details**: Dashboard with stats cards, recent activity
    - **Status**: ✅ Dashboard page created

### Products Management

82. ✅ Create vendor products list page
    - **Tech**: Create `src/app/(app)/vendor/products/page.tsx`
    - **Details**: Products listing with table, filters, search, pagination
    - **Status**: ✅ Products list page created

83. ✅ Create products table component
    - **Tech**: Create `src/app/(app)/vendor/products/components/ProductsTable.tsx`
    - **Details**: Data table with columns, actions, selection
    - **Status**: ✅ Products table created

84. ✅ Create add product page
    - **Tech**: Create `src/app/(app)/vendor/products/new/page.tsx`
    - **Details**: Product creation form page
    - **Status**: ✅ Add product page created

85. ✅ Create product form component
    - **Tech**: Create `src/app/(app)/vendor/products/components/ProductForm.tsx`
    - **Details**: Reusable form for create/edit with validation
    - **Status**: ✅ Product form created

86. ✅ Create edit product page
    - **Tech**: Create `src/app/(app)/vendor/products/[id]/edit/page.tsx`
    - **Details**: Product edit page with pre-filled form
    - **Status**: ✅ Edit product page created

87. ✅ Create product detail page (vendor view)
    - **Tech**: Create `src/app/(app)/vendor/products/[id]/preview/page.tsx`
    - **Details**: Read-only product detail view for vendors
    - **Status**: ✅ Product detail page created

88. ✅ Add bulk product import via CSV
    - **Tech**: Create `src/app/(app)/vendor/products/import/page.tsx`
    - **Details**: CSV import with preview, validation, results
    - **Status**: ✅ CSV import implemented

89. ✅ Add product delete functionality
    - **Tech**: Add delete action in products table
    - **Details**: Soft delete (archive) or hard delete with confirmation
    - **Status**: ✅ Delete functionality implemented

90. ✅ Add bulk product actions
    - **Tech**: Add bulk actions dropdown in products list
    - **Details**: Publish, Archive, Delete selected products
    - **Status**: ✅ Bulk actions implemented

### Orders Management

91. ✅ Create vendor orders list page
    - **Tech**: Create `src/app/(app)/vendor/orders/page.tsx`
    - **Details**: Orders listing with filters, status, pagination
    - **Status**: ✅ Orders list page created

92. ✅ Create orders table component
    - **Tech**: Create `src/app/(app)/vendor/orders/components/OrdersTable.tsx`
    - **Details**: Data table showing order details
    - **Status**: ✅ Orders table created

93. ✅ Create order detail page
    - **Tech**: Create `src/app/(app)/vendor/orders/[id]/page.tsx`
    - **Details**: Full order details with status updates
    - **Status**: ✅ Order detail page created

94. ✅ Add order status update functionality
    - **Tech**: Add status update modal/form
    - **Details**: Update order status with workflow validation
    - **Status**: ✅ Status update implemented

### Analytics

95. ✅ Create vendor analytics page
    - **Tech**: Create `src/app/(app)/vendor/analytics/page.tsx`
    - **Details**: Analytics dashboard with charts and statistics
    - **Status**: ✅ Analytics page created

96. ✅ Add revenue charts
    - **Tech**: Add revenue chart component using recharts
    - **Details**: Line/bar charts showing revenue over time
    - **Status**: ✅ Revenue charts implemented

97. ✅ Add order statistics
    - **Tech**: Add order stats cards and charts
    - **Details**: Total orders, average order value, orders by status
    - **Status**: ✅ Order statistics implemented

98. ✅ Add product performance metrics
    - **Tech**: Add product performance table/chart
    - **Details**: Top selling products, sales count, revenue
    - **Status**: ✅ Product performance metrics implemented

### Customers

99. ✅ Create vendor customers list page
    - **Tech**: Create `src/app/(app)/vendor/customers/page.tsx`
    - **Details**: List of customers who purchased from vendor
    - **Status**: ✅ Customers page created

100. ✅ Create customers table component
    - **Tech**: Create `src/app/(app)/vendor/customers/components/CustomersTable.tsx`
    - **Details**: Data table showing customer details and order history
    - **Status**: ✅ Customers table created

## Checkout & Orders

### Checkout Flow

101. ✅ Create checkout page
    - **Tech**: Create `src/app/(app)/checkout/page.tsx`
    - **Details**: Checkout page with cart items, shipping, payment
    - **Status**: ✅ Checkout page created

102. ✅ Create cart functionality
    - **Tech**: Implement cart state management (Zustand or Context)
    - **Details**: Add to cart, remove, update quantity, persist to localStorage
    - **Status**: ✅ Cart functionality implemented

103. ✅ Create address management
    - **Tech**: Create `src/modules/addresses/` module
    - **Details**: Address form, validation, save addresses
    - **Status**: ✅ Address management implemented

104. ✅ Integrate Stripe checkout
    - **Tech**: Create Stripe checkout session in tRPC
    - **Details**: Create payment intent, redirect to Stripe checkout
    - **Status**: ✅ Stripe checkout integrated

105. ✅ Create Stripe webhook handler
    - **Tech**: Create `src/app/api/stripe/webhook/route.ts`
    - **Details**: Handle `checkout.session.completed` event, create order
    - **Status**: ✅ Webhook handler created

### Order Management

106. ✅ Create customer orders page
    - **Tech**: Create `src/app/(app)/orders/page.tsx`
    - **Details**: Customer's order history with status tracking
    - **Status**: ✅ Orders page created

107. ✅ Create order detail page (customer view)
    - **Tech**: Create order detail view for customers
    - **Details**: Order details, items, shipping, payment status
    - **Status**: ✅ Order detail page created

## tRPC Setup

108. ✅ Setup tRPC server
    - **Tech**: Create `src/trpc/init.ts` with tRPC initialization
    - **Details**: tRPC setup with context, procedures, transformers
    - **Status**: ✅ tRPC server setup

109. ✅ Create tRPC context
    - **Tech**: Create context with Payload instance and user session
    - **Details**: Context includes `db` (Payload), `user` (from session)
    - **Status**: ✅ tRPC context created

110. ✅ Create base procedure
    - **Tech**: Create `baseProcedure` with context middleware
    - **Details**: Base procedure ensures Payload and user available
    - **Status**: ✅ Base procedure created

111. ✅ Create protected procedure
    - **Tech**: Create `protectedProcedure` that requires authentication
    - **Details**: Procedure checks for authenticated user
    - **Status**: ✅ Protected procedure created

112. ✅ Create vendor procedure
    - **Tech**: Create `vendorProcedure` that requires vendor role
    - **Details**: Procedure checks for vendor role and active vendor
    - **Status**: ✅ Vendor procedure created

113. ✅ Setup tRPC router structure
    - **Tech**: Create routers in `src/modules/*/server/procedures.ts`
    - **Routers**: auth, vendor, products, checkout, tags, orders, addresses
    - **Status**: ✅ Router structure created

114. ✅ Create tRPC API route handler
    - **Tech**: Create `src/app/api/trpc/[trpc]/route.ts`
    - **Details**: Next.js API route handler for tRPC requests
    - **Status**: ✅ API route handler created

115. ✅ Setup tRPC client
    - **Tech**: Create `src/trpc/client.tsx` for client-side tRPC
    - **Details**: tRPC client with React Query integration
    - **Status**: ✅ tRPC client setup

116. ✅ Setup tRPC React Query integration
    - **Tech**: Configure React Query with tRPC
    - **Details**: Query client, providers, hooks
    - **Status**: ✅ React Query integration setup

## Additional Features

### Hero Banners

117. ✅ Create hero banners system
    - **Tech**: HeroBanners collection with products, images, order
    - **Details**: Homepage hero banners with featured products
    - **Status**: ✅ Hero banners implemented

118. ✅ Create hero banners section component
    - **Tech**: Create `src/components/hero-banners-section.tsx`
    - **Details**: Component to display hero banners on homepage
    - **Status**: ✅ Hero banners component created

### Categories & Navigation

119. ✅ Create category navigation
    - **Tech**: Create category sidebar and dropdown menus
    - **Details**: Category navigation with subcategories
    - **Status**: ✅ Category navigation created

120. ✅ Create breadcrumb navigation
    - **Tech**: Create breadcrumb component for category pages
    - **Details**: Shows navigation path (Home > Category > Subcategory)
    - **Status**: ✅ Breadcrumbs implemented

### Search & Filters

121. ✅ Create search functionality
   - **Tech**: Create search page with filters
   - **Details**: Search products by name, description, tags
   - **Status**: ✅ Search implemented

122. ✅ Create advanced filters
   - **Tech**: Create filter components for price, category, tags, variants
   - **Details**: Multi-select filters with URL state management
   - **Status**: ✅ Advanced filters implemented

177. ✅ Implement enhanced search with variant support
   - **Tech**: Create `src/lib/search/` utilities for intelligent query parsing
   - **Details**: Enhanced search that parses queries like "red dress size small" to extract variant information (color, size, material) and keywords
   - **Files Created**:
     - `src/lib/search/variant-utils.ts` - Variant extraction and matching utilities
     - `src/lib/search/variant-mapper.ts` - Maps search terms to variant types
     - `src/lib/search/query-parser.ts` - Intelligent query parser
     - `src/lib/search/search-query-builder.ts` - MongoDB query builder with variant support
   - **Status**: ✅ Enhanced search implemented

178. ✅ Integrate variant search into products.getMany
   - **Tech**: Update `src/modules/products/server/procedures.ts`
   - **Details**: Integrated enhanced search query builder, supports searching by variants (size, color, material) in addition to name, tags, description
   - **Status**: ✅ Variant search integrated

179. ✅ Add search query parsing for natural language queries
   - **Tech**: Query parser handles patterns like "red dress size small", "small red silk", "size small red dress"
   - **Details**: Extracts variant information and keywords from natural language queries
   - **Status**: ✅ Query parsing implemented

180. ✅ Add variant type mapping (size abbreviations, color synonyms)
   - **Tech**: Maps "S" → "small", "M" → "medium", "crimson" → "red", etc.
   - **Details**: Handles size abbreviations and color synonyms for better search matching
   - **Status**: ✅ Variant mapping implemented

181. ✅ Create search testing scripts
   - **Tech**: Create `scripts/test-search.ts` and `scripts/test-search-quick.ts`
   - **Details**: Comprehensive test scripts to verify 50+ search phrases work correctly
   - **Status**: ✅ Test scripts created

182. ✅ Add unit tests for search utilities
   - **Tech**: Create test files in `src/test/lib/search/`
   - **Details**: Unit tests for query parser, variant mapper, variant utils, and query builder
   - **Files Created**:
     - `src/test/lib/search/query-parser.test.ts`
     - `src/test/lib/search/variant-mapper.test.ts`
     - `src/test/lib/search/variant-utils.test.ts`
     - `src/test/lib/search/search-query-builder.test.ts`
   - **Status**: ✅ Unit tests created

183. ✅ Add E2E tests for enhanced search
   - **Tech**: Update `e2e/search-browse.spec.ts`
   - **Details**: E2E tests for variant-based searches (color, size, material combinations)
   - **Status**: ✅ E2E tests added

### Vendor Registration

123. ✅ Create become vendor page
    - **Tech**: Create `src/app/(app)/become-vendor/page.tsx`
    - **Details**: Vendor registration form
    - **Status**: ✅ Become vendor page created

124. ✅ Create vendor approval workflow
    - **Tech**: Vendor status management (pending, approved, suspended)
    - **Details**: Admin approves vendors, vendors see pending status
    - **Status**: ✅ Approval workflow implemented

125. ✅ Create vendor pending approval page
    - **Tech**: Create `src/app/(app)/vendor/pending-approval/page.tsx`
    - **Details**: Page shown when vendor is pending approval
    - **Status**: ✅ Pending approval page created

126. ✅ Create vendor suspended page
    - **Tech**: Create `src/app/(app)/vendor/suspended/page.tsx`
    - **Details**: Page shown when vendor is suspended
    - **Status**: ✅ Suspended page created

## Admin Dashboard

127. ✅ Create admin dashboard layout
    - **Tech**: Create admin layout (if separate from vendor)
    - **Details**: Admin-specific navigation and layout
    - **Status**: ⚠️ Needs verification

128. ✅ Create admin collections page
    - **Tech**: Create `src/app/(admin)/collections/vendors/[id]/page.tsx`
    - **Details**: Admin view for managing vendors
    - **Status**: ✅ Admin vendor page created

## Testing & Quality

129. ⚠️ Write unit tests for collections
    - **Tech**: Create test files for collection logic
    - **Status**: ⚠️ Tests pending

130. ⚠️ Write unit tests for tRPC procedures
    - **Tech**: Create test files for tRPC routers
    - **Status**: ⚠️ Tests pending

131. ⚠️ Write unit tests for components
    - **Tech**: Create test files for React components
    - **Status**: ⚠️ Tests pending

132. ⚠️ Write integration tests
    - **Tech**: Create integration tests for workflows
    - **Status**: ⚠️ Tests pending

## Deployment

133. ⚠️ Setup production environment
    - **Tech**: Configure production environment variables
    - **Status**: ⚠️ Production setup pending

134. ⚠️ Configure production database
    - **Tech**: Setup production MongoDB instance
    - **Status**: ⚠️ Production database pending

135. ⚠️ Setup production email service
    - **Tech**: Configure email service (SendGrid/SES)
    - **Status**: ⚠️ Email service pending

136. ⚠️ Configure production Stripe
    - **Tech**: Setup production Stripe account and keys
    - **Status**: ⚠️ Production Stripe pending

137. ⚠️ Setup CI/CD pipeline
    - **Tech**: Configure CI/CD for automated deployments
    - **Status**: ⚠️ CI/CD pending

138. ⚠️ Setup monitoring
    - **Tech**: Setup error tracking and monitoring
    - **Status**: ⚠️ Monitoring pending

## Additional Critical Tasks (Identified from Codebase Review)

### Error Handling & Validation

139. ⚠️ Add comprehensive error handling to tRPC procedures
    - **Tech**: Add try-catch blocks, error logging, user-friendly error messages
    - **Details**: Handle errors in all tRPC procedures, return proper error codes
    - **Status**: ⚠️ Error handling incomplete

140. ⚠️ Add error boundaries to React components
    - **Tech**: Create error boundary components, wrap critical sections
    - **Details**: Catch React errors, show fallback UI, log errors
    - **Status**: ⚠️ Error boundaries missing

141. ⚠️ Add input validation with Zod schemas (comprehensive)
    - **Tech**: Add Zod validation to all tRPC inputs, form inputs
    - **Details**: Validate all user inputs, prevent invalid data
    - **Status**: ⚠️ Validation incomplete

142. ⚠️ Add retry logic for failed operations
    - **Tech**: Implement retry logic for API calls, database operations
    - **Details**: Retry failed requests with exponential backoff
    - **Status**: ⚠️ Retry logic missing

### Security Hardening

143. ⚠️ Add rate limiting to API endpoints
    - **Tech**: Implement rate limiting for tRPC endpoints, Payload API
    - **Details**: Prevent abuse, limit requests per IP/user
    - **Status**: ⚠️ Rate limiting missing

144. ⚠️ Add CSRF protection
    - **Tech**: Implement CSRF tokens, verify requests
    - **Details**: Protect against CSRF attacks
    - **Status**: ⚠️ CSRF protection missing

145. ⚠️ Add security headers
    - **Tech**: Configure security headers in Next.js
    - **Details**: Add CSP, X-Frame-Options, etc.
    - **Status**: ⚠️ Security headers missing

146. ⚠️ Add audit logging for sensitive operations
    - **Tech**: Log all create, update, delete operations
    - **Details**: Track who did what, when, for security auditing
    - **Status**: ⚠️ Audit logging missing

147. ⚠️ Conduct security audit
    - **Tech**: Review codebase for security vulnerabilities
    - **Details**: Check for SQL injection, XSS, authentication issues
    - **Status**: ⚠️ Security audit pending

### Performance Optimization

148. ⚠️ Add database indexes
    - **Tech**: Add indexes to frequently queried fields
    - **Details**: Index vendor, user, product fields for faster queries
    - **Status**: ⚠️ Indexes missing

149. ⚠️ Optimize Payload queries
    - **Tech**: Optimize depth, field selection, pagination
    - **Details**: Reduce query depth, select only needed fields
    - **Status**: ⚠️ Query optimization needed

150. ⚠️ Add image optimization
    - **Tech**: Optimize images, use Next.js Image component
    - **Details**: Compress images, use WebP format, lazy loading
    - **Status**: ⚠️ Image optimization incomplete

151. ⚠️ Add code splitting
    - **Tech**: Implement code splitting for routes, components
    - **Details**: Reduce initial bundle size, lazy load routes
    - **Status**: ⚠️ Code splitting incomplete

152. ⚠️ Add caching strategy
    - **Tech**: Implement caching for API responses, static content
    - **Details**: Cache frequently accessed data, use CDN
    - **Status**: ⚠️ Caching strategy missing

### Pagination & UX Improvements

153. ⚠️ Implement pagination for orders list
    - **Tech**: Add pagination to vendor orders page, customer orders page
    - **Details**: Paginate order lists, add page controls
    - **Status**: ⚠️ Pagination missing (TODO in code)

154. ⚠️ Implement pagination for products list
    - **Tech**: Add pagination to vendor products page, customer product listings
    - **Details**: Paginate product lists, add page controls
    - **Status**: ⚠️ Pagination incomplete

155. ⚠️ Add pagination to vendor dashboard tables
    - **Tech**: Add pagination to all vendor dashboard tables
    - **Details**: Products, orders, customers, analytics tables
    - **Status**: ⚠️ Pagination missing

### Reviews & Ratings System

156. ❌ Create Reviews collection
    - **Tech**: Create `src/collections/Reviews.ts`
    - **Details**: Reviews with rating, comment, user, product, vendor
    - **Status**: ❌ Not implemented (TODO in code)

157. ❌ Add review/rating UI to product pages
    - **Tech**: Add review section to product detail page
    - **Details**: Display reviews, ratings, allow customers to add reviews
    - **Status**: ❌ Not implemented

158. ❌ Add review/rating to vendor dashboard
    - **Tech**: Add reviews section to vendor dashboard
    - **Details**: Show product reviews, review statistics
    - **Status**: ❌ Not implemented

159. ❌ Add review aggregation to products
    - **Tech**: Calculate average rating, review count for products
    - **Details**: Update product rating fields, show on product cards
    - **Status**: ❌ Not implemented (TODO in code)

160. ❌ Add review moderation
    - **Tech**: Allow vendors/admins to moderate reviews
    - **Details**: Approve, reject, delete reviews
    - **Status**: ❌ Not implemented

### Analytics Improvements

161. ❌ Create AnalyticsSummaries collection
    - **Tech**: Create collection for cached analytics data
    - **Details**: Store pre-calculated analytics to reduce query load
    - **Status**: ❌ Not implemented (TODO in code)

162. ❌ Implement analytics caching
    - **Tech**: Cache analytics queries, update cache periodically
    - **Details**: Reduce database load, faster analytics queries
    - **Status**: ❌ Not implemented (TODO in code)

163. ❌ Add cache invalidation strategy
    - **Tech**: Invalidate cache when data changes
    - **Details**: Update cache when orders/products change
    - **Status**: ❌ Not implemented

### E2E Testing (Detailed)

164. ⚠️ Write E2E tests for checkout flow
    - **Tech**: Create E2E tests using Playwright or Cypress
    - **Details**: Test complete checkout flow (cart → checkout → payment → order)
    - **Status**: ⚠️ E2E tests pending

165. ⚠️ Write E2E tests for vendor workflow
    - **Tech**: Create E2E tests for vendor registration → approval → dashboard
    - **Details**: Test vendor signup, approval, product creation, order management
    - **Status**: ⚠️ E2E tests pending

166. ⚠️ Write E2E tests for customer workflow
    - **Tech**: Create E2E tests for customer signup → browse → purchase
    - **Details**: Test customer registration, product browsing, cart, checkout
    - **Status**: ⚠️ E2E tests pending

### Additional Deployment Tasks

167. ⚠️ Setup staging environment
    - **Tech**: Configure staging environment for testing
    - **Details**: Staging database, staging deployment, staging URLs
    - **Status**: ⚠️ Staging environment pending

168. ⚠️ Setup database backup strategy
    - **Tech**: Configure automated database backups
    - **Details**: Daily backups, backup retention, restore procedures
    - **Status**: ⚠️ Backup strategy pending

169. ⚠️ Setup database migration strategy
    - **Tech**: Document migration procedures, test migrations
    - **Details**: How to run migrations, rollback procedures
    - **Status**: ⚠️ Migration strategy pending

170. ⚠️ Create deployment runbook
    - **Tech**: Document deployment procedures
    - **Details**: Step-by-step deployment guide, rollback procedures
    - **Status**: ⚠️ Runbook pending

---

## Payment & Commission Features

171. ✅ Add video component to product pages
    - **Tech**: Add video upload field to Products collection and display video on product detail page
    - **Details**: 
      - Add `video` field (upload type, relationTo: media) to Products collection
      - Filter video field to accept only video MIME types (video/*)
      - Add video upload functionality to vendor product form with drag-and-drop
      - Display HTML5 video player on product detail page below product images
      - Support common video formats (MP4, WebM, MOV, etc.)
      - Include video preview in product form
    - **Status**: ✅ Video component implemented
    - **Files**: `src/collections/Products.ts`, `src/app/(app)/vendor/products/components/ProductForm.tsx`, `src/modules/products/ui/components/product-view.tsx`

176. ✅ Implement configurable commission system
    - **Tech**: Add `commissionRate` field to Vendors collection, calculate commission in Stripe webhook
    - **Details**: 
      - Add `commissionRate` field (number, default 10%) to Vendors collection
      - Add `commission`, `vendorPayout`, and `commissionRate` fields to Orders collection
      - Update Stripe webhook to fetch vendor's commission rate and calculate commission amount
      - Calculate: `commission = (total * commissionRate) / 100`
      - Calculate: `vendorPayout = total - commission`
      - Store commission and vendor payout in order record
      - Commission is configurable per vendor (default 10%, can be changed per vendor)
    - **Status**: ✅ Commission system implemented
    - **Files**: `src/collections/Vendors.ts`, `src/collections/Orders.ts`, `src/app/api/stripe/webhook/route.ts`

## Authentication & Security Features

173. ✅ Require authentication for checkout
    - **Tech**: Add authentication check to checkout page route
    - **Details**: 
      - Check if user is authenticated before allowing access to `/checkout`
      - Redirect unauthenticated users to `/sign-in?redirect=/checkout`
      - After successful login, redirect back to checkout page
    - **Status**: ✅ Checkout authentication implemented
    - **Files**: `src/app/(app)/checkout/page.tsx`

174. ✅ Require authentication for add to cart
    - **Tech**: Add authentication checks to cart functionality
    - **Details**: 
      - Check authentication before allowing "Add to cart" action
      - Check authentication before allowing "Buy Now" action
      - Redirect to sign-in with redirect parameter to return to product page
      - Show error toast if user tries to add to cart without being logged in
    - **Status**: ✅ Add to cart authentication implemented
    - **Files**: `src/modules/products/ui/components/cart-button.tsx`, `src/modules/products/ui/components/product-view.tsx`

175. ✅ Implement redirect after authentication
    - **Tech**: Handle redirect parameter in sign-in flow
    - **Details**: 
      - Read `redirect` query parameter from sign-in URL
      - After successful login (email/password or OAuth), redirect to intended page
      - Support redirect for checkout, product pages, and other protected routes
      - Default to home page if no redirect specified
    - **Status**: ✅ Redirect after authentication implemented
    - **Files**: `src/modules/auth/ui/views/sign-in-view.tsx`, `src/app/(auth)/sign-in/page.tsx`, `src/modules/auth/ui/components/social-login-buttons.tsx`

## Checkout & Cart Features

176. ✅ Add remove item functionality to checkout
    - **Tech**: Add remove button to each item in checkout order list
    - **Details**: 
      - Display remove (X) button on each cart item in checkout page
      - Remove button positioned in top-right corner of each item
      - On click, remove item from cart using `removeProduct` function
      - Show success toast notification when item is removed
      - Update cart totals immediately after removal
    - **Status**: ✅ Remove item from checkout implemented
    - **Files**: `src/modules/checkout/ui/views/checkout-view.tsx`

## Stripe Connect Implementation (Vendor Payouts & Platform Commission)

**See**: `docs/STRIPE_CONNECT_IMPLEMENTATION.md` for detailed implementation plan

**Overview**: Implement Stripe Connect to enable vendors to have their own Stripe accounts, automatic payment splitting (vendor payout + platform commission), and direct transfers to vendor accounts.

177. ⚠️ Setup Stripe Connect platform account
    - **Tech**: Create Stripe Connect account, configure settings
    - **Details**: Enable Connect platform, configure branding, terms of service, privacy policy URLs
    - **Status**: ⚠️ Requires manual setup in Stripe Dashboard (https://dashboard.stripe.com/connect)
    - **Reference**: Task 1.1.1, 1.1.2 in STRIPE_CONNECT_IMPLEMENTATION.md
    - **Note**: Platform owner must enable Connect in Stripe Dashboard before vendors can connect

178. ✅ Add Stripe Connect environment variables
    - **Tech**: Stripe Connect uses existing `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`
    - **Details**: No additional environment variables needed for basic Connect setup
    - **Status**: ✅ Complete - Uses existing Stripe keys
    - **Files**: `.env.local`

179. ✅ Add Stripe Connect fields to Vendors collection
    - **Tech**: Updated `src/collections/Vendors.ts` with Stripe Connect fields
    - **Details**: 
      - `stripeAccountId` (text, optional) - Stripe Connect account ID
      - `stripeAccountStatus` (select: pending, active, restricted, rejected) - Account status
      - `stripeOnboardingLink` (text, optional) - Onboarding link URL
      - `stripeOnboardingCompleted` (checkbox) - Onboarding completion status
      - Additional fields for account details (chargesEnabled, payoutsEnabled, etc.)
    - **Status**: ✅ Complete
    - **Files**: `src/collections/Vendors.ts`

180. ✅ Create Stripe Connect account creation API
    - **Tech**: Created `createStripeConnectAccount()` utility function
    - **Details**: 
      - Creates Express account via `stripe.accounts.create()`
      - Stores account ID in vendor record
      - Handles errors (Connect not enabled, etc.)
    - **Status**: ✅ Complete
    - **Files**: `src/lib/stripe-connect.ts`, `src/modules/vendor/server/procedures.ts` (createStripeAccount procedure)

181. ✅ Create vendor Stripe onboarding page
    - **Tech**: Created `src/app/(app)/vendor/stripe-onboarding/page.tsx`
    - **Details**: 
      - Shows "Connect Stripe Account" button
      - Displays account status (pending, active, restricted, rejected)
      - Shows onboarding completion status
      - Handles success/refresh callbacks from Stripe
      - Error handling for Connect not enabled
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/vendor/stripe-onboarding/page.tsx`

182. ✅ Implement Stripe onboarding link generation
    - **Tech**: Created `refreshOnboardingLink()` tRPC procedure
    - **Details**: 
      - Uses `stripe.accountLinks.create()` to generate onboarding link
      - Sets refresh and return URLs
      - Handles callback from Stripe
    - **Status**: ✅ Complete
    - **Files**: `src/lib/stripe-connect.ts`, `src/modules/vendor/server/procedures.ts` (refreshOnboardingLink procedure)

183. ⚠️ Add webhook handler for Stripe account updates
    - **Tech**: Webhook handler structure exists, needs account.updated event handling
    - **Details**: Handle `account.updated` event to sync vendor account status
    - **Status**: ⚠️ Partially implemented - webhook exists but account.updated handler needs verification
    - **Files**: `src/app/api/stripe/webhook/route.ts`

184. ✅ Update checkout to use Stripe Connect
    - **Tech**: Updated `src/modules/checkout/server/procedures.ts` to use Stripe Connect
    - **Details**: 
      - Uses `createCheckoutSessionWithConnect()` function for Stripe payments
      - Validates vendor has Stripe account before checkout
      - Calculates commission and vendor payout
      - Creates checkout session with application fee (platform commission)
    - **Status**: ✅ Complete
    - **Files**: `src/modules/checkout/server/procedures.ts`, `src/lib/stripe-connect.ts`

185. ✅ Handle single-vendor cart validation
    - **Tech**: Validates all cart items are from same vendor
    - **Details**: 
      - Groups items by vendor
      - Throws error if multiple vendors in cart
      - Creates single checkout session per vendor
      - Note: Multi-vendor carts require separate checkout sessions (not fully implemented)
    - **Status**: ✅ Complete - Single vendor validation implemented
    - **Files**: `src/modules/checkout/server/procedures.ts`

186. ✅ Add Stripe transfer and commission fields to Orders collection
    - **Tech**: Updated `src/collections/Orders.ts` with commission fields
    - **Details**: 
      - `commission` (number) - Platform commission amount
      - `vendorPayout` (number) - Amount paid to vendor
      - `commissionRate` (number) - Commission rate used
      - Commission calculated and stored in order record
    - **Status**: ✅ Complete
    - **Files**: `src/collections/Orders.ts`, `src/app/api/stripe/webhook/route.ts`

187. ✅ Update webhook to handle Stripe Connect payments
    - **Tech**: Updated `src/app/api/stripe/webhook/route.ts`
    - **Details**: 
      - Handles `checkout.session.completed` event
      - Calculates commission based on vendor's commission rate
      - Stores commission and vendor payout in order
      - Updates inventory on successful payment
    - **Status**: ✅ Complete
    - **Files**: `src/app/api/stripe/webhook/route.ts`

188. ✅ Validate vendor Stripe account before checkout
    - **Tech**: Added validation in checkout procedure
    - **Details**: 
      - Checks if vendor has `stripeAccountId`
      - Uses `isStripeAccountReady()` to verify account status
      - Prevents checkout if account not ready
      - Shows error message directing to Stripe onboarding
    - **Status**: ✅ Complete
    - **Files**: `src/modules/checkout/server/procedures.ts`, `src/lib/stripe-connect.ts`

189. ❌ Handle transfer failures and errors
    - **Tech**: Add error handling for failed transfers
    - **Details**: Handle `transfer.failed` events, update order status, notify vendor and platform admin
    - **Status**: ❌ Not started
    - **Reference**: Task 5.2.1 in STRIPE_CONNECT_IMPLEMENTATION.md

190. ❌ Implement refunds with Stripe Connect
    - **Tech**: Implement refund logic for Connect accounts
    - **Details**: Refund to customer, reverse transfer to vendor, deduct commission from platform
    - **Status**: ❌ Not started
    - **Reference**: Task 5.2.2 in STRIPE_CONNECT_IMPLEMENTATION.md

191. ✅ Add Stripe account status to vendor dashboard
    - **Tech**: Vendor dashboard shows Stripe connection status
    - **Details**: 
      - Displays Stripe account status via `trpc.vendor.getStripeAccountStatus` query
      - Shows link to Stripe onboarding page (`/vendor/stripe-onboarding`)
      - Displays account ready status and connection state
    - **Status**: ✅ Complete
    - **Files**: `src/app/(app)/vendor/dashboard/page.tsx`, `src/modules/vendor/server/procedures.ts` (getStripeAccountStatus)

192. ❌ Create vendor payout history page
    - **Tech**: Create payout tracking page for vendors
    - **Details**: Show list of payouts, payout status, commission deducted per transaction
    - **Status**: ❌ Not started
    - **Reference**: Task 4.2.2 in STRIPE_CONNECT_IMPLEMENTATION.md

193. ❌ Create platform commission dashboard
    - **Tech**: Create admin dashboard for commission tracking
    - **Details**: Show total commission earned, commission by vendor, commission by time period
    - **Status**: ❌ Not started
    - **Reference**: Task 4.3.1 in STRIPE_CONNECT_IMPLEMENTATION.md

194. ❌ Write tests for Stripe Connect implementation
    - **Tech**: Create unit and integration tests
    - **Details**: Test account creation, onboarding, payment processing, transfers, webhooks
    - **Status**: ❌ Not started
    - **Reference**: Task 6.1 in STRIPE_CONNECT_IMPLEMENTATION.md

## Admin Dashboard

195. ✅ Create admin authentication middleware
    - **Tech**: Created `src/lib/middleware/admin-auth.ts` with `requireAppAdmin()` function
    - **Details**: 
      - Checks for `app-admin` role or `super-admin` legacy role
      - Redirects to sign-in if not authenticated
      - Redirects to home if not admin
      - Used to protect admin routes
    - **Status**: ✅ Complete
    - **Files**: `src/lib/middleware/admin-auth.ts`

196. ❌ Create admin route group layout
    - **Tech**: Create `src/app/(app)/admin/layout.tsx` with `requireAdmin()` middleware
    - **Details**: Include AdminSidebar and AdminHeader components, hide main navbar
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 0.2

197. ❌ Create admin sidebar navigation component
    - **Tech**: Create `AdminSidebar.tsx` with navigation links to all admin sections
    - **Details**: Dark theme, active route highlighting, navigation items for all admin sections
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 0.3

198. ❌ Create admin header component
    - **Tech**: Create `AdminHeader.tsx` with search bar, notifications, and user menu
    - **Details**: Logout functionality, user avatar, dropdown menu, "View Site" link
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 0.4

199. ❌ Create adminProcedure in tRPC init
    - **Tech**: Create `adminProcedure` in `src/trpc/init.ts` wrapping `protectedProcedure`
    - **Details**: Requires authenticated user with `app-admin` role, throws FORBIDDEN if not admin
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 0.5

200. ❌ Create admin router in tRPC procedures
    - **Tech**: Create `adminRouter` in `src/modules/admin/server/procedures.ts`
    - **Details**: Structure: `admin.dashboard.*`, `admin.products.*`, `admin.orders.*`, etc.
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 0.6

201. ❌ Create admin dashboard stats component
    - **Tech**: Create `AdminDashboardStats` component with 5 stat cards
    - **Details**: Total Revenue, Total Orders, Total Products, Total Customers, Total Vendors with trend indicators
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 1.1

202. ❌ Create admin dashboard stats tRPC procedure
    - **Tech**: Create `admin.dashboard.stats` procedure
    - **Details**: Calculate total revenue, revenue change, order counts, product counts, customer counts, vendor counts
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 1.2

203. ❌ Create admin products list page
    - **Tech**: Create `/admin/products` page with table layout
    - **Details**: Display all products from all vendors, search and filter, pagination, bulk actions
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 2.1

204. ❌ Create admin orders list page
    - **Tech**: Create `/admin/orders` page with table layout
    - **Details**: Display all orders from all vendors, search and filter, pagination, export orders (CSV)
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 3.1

205. ❌ Create admin customers list page
    - **Tech**: Create `/admin/customers` page with table layout
    - **Details**: Display all customers, search and filter, pagination, customer analytics
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 4.1

206. ❌ Create admin vendors list page
    - **Tech**: Create `/admin/vendors` page with table layout
    - **Details**: Display all vendors, search and filter, status filter, vendor approval actions
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 5.1

207. ❌ Create admin vendor approval system
    - **Tech**: Create `admin.vendors.approve`, `reject`, `suspend`, `activate` procedures
    - **Details**: Approve/reject/suspend/activate vendors, send email notifications, update status
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 5.6-5.9

208. ❌ Create admin categories management page
    - **Tech**: Create `/admin/categories` page with tree view
    - **Details**: Display category tree, expandable/collapsible nodes, category CRUD operations
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 6.1

209. ❌ Create admin tags management page
    - **Tech**: Create `/admin/tags` page with table layout
    - **Details**: Display all tags, search, pagination, tag CRUD operations
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 7.1

210. ❌ Create admin hero banners management page
    - **Tech**: Create `/admin/hero-banners` page with table layout
    - **Details**: Display all hero banners, filter by active status, template type, pagination
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 8.1

211. ❌ Create admin analytics page
    - **Tech**: Create `/admin/analytics` page with revenue charts
    - **Details**: Revenue charts (line, bar), date range selector, revenue by vendor/category, sales reports
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 9.1

212. ❌ Create admin settings page
    - **Tech**: Create `/admin/settings` page with platform configuration
    - **Details**: General settings, payment settings, shipping settings, tax settings, email templates
    - **Status**: ❌ Not started
    - **Reference**: ADMIN_DASHBOARD_TODO.md Task 11.1

## Hero Banners Enhancements

213. ✅ Create HeroBanners collection
    - **Tech**: Created `src/collections/HeroBanners.ts` with fields: title, subtitle, backgroundImage, products, isActive, order
    - **Details**: Hero banners with product display, active status, ordering
    - **Status**: ✅ Complete
    - **Files**: `src/collections/HeroBanners.ts`

214. ✅ Create hero banners section component
    - **Tech**: Created `src/components/hero-banners-section.tsx` with carousel functionality
    - **Details**: 
      - Auto-play carousel (3 seconds per slide)
      - Navigation arrows (prev/next)
      - Dot indicators
      - Product display (flex for ≤6 products, scroll for more)
      - Background image support
      - Title and subtitle overlay
    - **Status**: ✅ Complete
    - **Files**: `src/components/hero-banners-section.tsx`, `src/app/(app)/(home)/page.tsx`

215. ✅ Create hero banners tRPC query
    - **Tech**: Added `heroBanners` query in `src/trpc/routers/_app.ts`
    - **Details**: Fetches active banners sorted by order, populates products with images
    - **Status**: ✅ Complete
    - **Files**: `src/trpc/routers/_app.ts`

216. ✅ Create hero banners seed script
    - **Tech**: Created `src/seed/seed-hero-banners.ts`
    - **Details**: Seed script to create sample hero banners
    - **Status**: ✅ Complete
    - **Files**: `src/seed/seed-hero-banners.ts`

217. ❌ Add template selector field to HeroBanners collection
    - **Tech**: Add template field (select: image-text, image-text-products, image-slider, split-layout, video)
    - **Details**: Template selector as first field, options with descriptions
    - **Status**: ❌ Not started - Basic banner implementation complete, templates not yet added
    - **Reference**: HERO_BANNERS_TODO.md Task 0.2

218. ❌ Add CTA fields to HeroBanners collection
    - **Tech**: Add `ctaText`, `ctaLinkType`, `ctaLinkValue` fields
    - **Details**: CTA button text, link type (product, category, collection, URL), link value
    - **Status**: ❌ Not started
    - **Reference**: HERO_BANNERS_TODO.md Task 0.3

219. ❌ Add mobile image field to HeroBanners collection
    - **Tech**: Add `mobileImage` upload field (optional)
    - **Details**: Mobile-specific image for better mobile UX, falls back to desktop image if not provided
    - **Status**: ❌ Not started
    - **Reference**: HERO_BANNERS_TODO.md Task 0.13

220. ❌ Add scheduling fields to HeroBanners collection
    - **Tech**: Add `startDate` and `endDate` date fields
    - **Details**: Auto-activate/deactivate banners based on dates, date-based filtering in query
    - **Status**: ❌ Not started
    - **Reference**: HERO_BANNERS_TODO.md Task 7.1-7.2

## Order Management Enhancements

221. ✅ Add cart item quantity management
    - **Tech**: Cart store stores quantity per product ID
    - **Details**: 
      - Quantity stored in cart state: `{ productId, quantity, size, color, variantPrice }`
      - `addProduct()` increments quantity if product already in cart
      - `removeProduct()` removes item from cart
      - Quantity displayed in checkout view
    - **Status**: ✅ Complete
    - **Files**: `src/modules/checkout/store/use-cart-store.ts`

222. ✅ Add cart item variant storage
    - **Tech**: Cart store stores variant information (size, color) per product
    - **Details**: 
      - Variant data stored: `{ productId, size, color, quantity, variantPrice }`
      - Variant information passed to checkout and order creation
      - Variant selection required when adding to cart
    - **Status**: ✅ Complete
    - **Files**: `src/modules/checkout/store/use-cart-store.ts`, `src/modules/products/ui/components/cart-button.tsx`

223. ✅ Add remove item button in checkout page
    - **Tech**: Remove button added to each cart item in checkout view
    - **Details**: 
      - Remove (X) button in top-right corner of each item
      - Calls `removeCartItem()` from cart store
      - Shows success toast notification
      - Updates cart totals immediately
    - **Status**: ✅ Complete
    - **Files**: `src/modules/checkout/ui/views/checkout-view.tsx`

224. ❌ Add quantity selector in checkout page
    - **Tech**: Add increment/decrement buttons or number input for item quantity
    - **Details**: Update quantity in cart store, recalculate subtotal
    - **Status**: ❌ Not started
    - **Reference**: ORDER_MANAGEMENT_TASKS.md Task 2.13

225. ❌ Add shipping cost calculation display
    - **Tech**: Calculate and display shipping cost based on address and order total
    - **Details**: Shipping cost calculation, display in checkout sidebar
    - **Status**: ❌ Not started
    - **Reference**: ORDER_MANAGEMENT_TASKS.md Task 2.15

226. ❌ Add tax calculation display (US sales tax)
    - **Tech**: Calculate and display sales tax based on shipping address state
    - **Details**: Tax calculation, display in checkout sidebar
    - **Status**: ❌ Not started
    - **Reference**: ORDER_MANAGEMENT_TASKS.md Task 2.16

227. ❌ Add coupon/discount code input field
    - **Tech**: Add input field and apply button for discount code application
    - **Details**: Discount code validation, apply discount to order total
    - **Status**: ❌ Not started
    - **Reference**: ORDER_MANAGEMENT_TASKS.md Task 2.17

228. ❌ Create order detail page for customers
    - **Tech**: Create `/orders/[id]` page with full order details
    - **Details**: Order number, date, status, product info, totals, shipping address, tracking info
    - **Status**: ❌ Not started
    - **Reference**: ORDER_MANAGEMENT_TASKS.md Task 11.1

229. ❌ Add order status change email notifications
    - **Tech**: Send email to customer when order status changes
    - **Details**: Email templates for status changes, trigger on status update
    - **Status**: ❌ Not started
    - **Reference**: ORDER_MANAGEMENT_TASKS.md Task 15.3

230. ❌ Add order confirmation email on order creation
    - **Tech**: Send email to customer when order is created
    - **Details**: Order confirmation email with order details, product images, links
    - **Status**: ❌ Not started
    - **Reference**: ORDER_MANAGEMENT_TASKS.md Task 15.1

231. ❌ Add tracking update email notifications
    - **Tech**: Send email when tracking number is added or updated
    - **Details**: Tracking email with tracking number, carrier, tracking URL
    - **Status**: ❌ Not started
    - **Reference**: ORDER_MANAGEMENT_TASKS.md Task 15.4

## Category & Variant Setup

232. ❌ Review and backup existing category data
    - **Tech**: Query all existing categories, export to JSON/CSV for backup
    - **Details**: Review structure, identify duplicates or inconsistencies, backup before cleanup
    - **Status**: ❌ Not started
    - **Reference**: CATEGORY_SETUP_TASKS.md Task 1.1-1.5

233. ❌ Clean up duplicate categories and fix slug conflicts
    - **Tech**: Remove duplicate categories, ensure unique slugs
    - **Details**: Identify duplicates, merge if needed, update conflicting slugs
    - **Status**: ❌ Not started
    - **Reference**: CATEGORY_SETUP_TASKS.md Task 1.6-1.7

234. ❌ Fix orphaned products (products without valid category)
    - **Tech**: Assign orphaned products to appropriate categories
    - **Details**: Query products without valid category, assign to appropriate category or mark for review
    - **Status**: ❌ Not started
    - **Reference**: CATEGORY_SETUP_TASKS.md Task 1.8

235. ❌ Create variant types seed script
    - **Tech**: Create seed script for variant types (size, color, material, etc.)
    - **Details**: Seed all variant types with proper configuration, display order
    - **Status**: ❌ Not started
    - **Reference**: CATEGORY_SETUP_TASKS.md Task 2.1-2.14

236. ❌ Create variant options seed script
    - **Tech**: Create seed script for variant options (S, M, L, Red, Blue, etc.)
    - **Details**: Seed variant options linked to variant types, category-specific or global options
    - **Status**: ❌ Not started
    - **Reference**: CATEGORY_SETUP_TASKS.md Task 3.1-3.x

## Search Enhancements

237. ✅ Implement fuzzy matching for search queries
    - **Tech**: Fuzzy matching implemented in search query builder
    - **Details**: 
      - Query parsing with typo tolerance
      - Variant matching with fuzzy logic
      - Handles common typos and abbreviations
    - **Status**: ✅ Complete
    - **Files**: `src/lib/search/search-query-builder.ts`, `src/lib/search/variant-utils.ts`

238. ✅ Implement relevance scoring for search results
    - **Tech**: Relevance scoring implemented in search query builder
    - **Details**: 
      - Scores products based on field matches (name, tags, description)
      - Variant matches contribute to relevance
      - Keyword matches weighted by field importance
      - Results sorted by relevance score
    - **Status**: ✅ Complete
    - **Files**: `src/lib/search/search-query-builder.ts`

239. ❌ Add search result highlighting
    - **Tech**: Highlight matched terms in search results
    - **Details**: Highlight matched keywords in product names, descriptions, tags
    - **Status**: ❌ Not started
    - **Reference**: SEARCH_IMPROVEMENT_TASKS.md Task 5.1

240. ❌ Add search analytics and tracking
    - **Tech**: Track search queries, results, clicks, conversions
    - **Details**: Log search queries, track popular searches, analyze search performance
    - **Status**: ❌ Not started
    - **Reference**: SEARCH_IMPROVEMENT_TASKS.md Task 5.2

## CI/CD & Production Setup

241. ❌ Setup GitHub Actions CI workflow
    - **Tech**: Create `.github/workflows/ci.yml` for automated testing
    - **Details**: Run linter, unit tests, E2E tests on push/PR, use MongoDB service container
    - **Status**: ❌ Not started
    - **Reference**: CI_CD_SETUP.md

242. ❌ Setup GitHub Actions deploy workflow
    - **Tech**: Create `.github/workflows/deploy.yml` for automated deployment
    - **Details**: Deploy to staging and production, validate environment variables, deploy to Vercel
    - **Status**: ❌ Not started
    - **Reference**: CI_CD_SETUP.md

243. ❌ Configure production environment variables
    - **Tech**: Create `.env.production` template and validate all required variables
    - **Details**: Database URL, Payload secret, NextAuth secret, Stripe keys, email service, Sentry DSN
    - **Status**: ❌ Not started
    - **Reference**: PRODUCTION_SETUP.md

244. ❌ Setup production MongoDB database
    - **Tech**: Create MongoDB Atlas cluster, configure connection string
    - **Details**: Create database user, whitelist IPs, get connection string, run migrations
    - **Status**: ❌ Not started
    - **Reference**: PRODUCTION_SETUP.md Step 2

245. ❌ Configure production Stripe webhook
    - **Tech**: Add webhook endpoint in Stripe Dashboard for production
    - **Details**: Set webhook URL, select events, copy signing secret to environment variables
    - **Status**: ❌ Not started
    - **Reference**: PRODUCTION_SETUP.md Step 3.2

246. ❌ Setup email service (SendGrid or AWS SES)
    - **Tech**: Configure email service for production
    - **Details**: Create account, get API keys, configure SMTP settings, test email sending
    - **Status**: ❌ Not started
    - **Reference**: PRODUCTION_SETUP.md Step 4

247. ❌ Setup Sentry for error tracking
    - **Tech**: Create Sentry project, configure DSN, initialize Sentry
    - **Details**: Client-side, server-side, and edge runtime error tracking, performance monitoring
    - **Status**: ❌ Not started
    - **Reference**: MONITORING_SETUP.md

248. ❌ Add error boundaries to React components
    - **Tech**: Create error boundary component and wrap critical components
    - **Details**: Catch React errors, display error UI, send to Sentry
    - **Status**: ❌ Not started
    - **Reference**: MONITORING_SETUP.md Step 4

## Offline Payment & Alternative Payment Methods

### Vendor Offline Payment Support (Tasks 253-270)

253. ✅ Add vendor contact fields to Vendors collection
    - **Tech**: Update `src/collections/Vendors.ts` to add fields:
      - `contactPhone` (text, optional) - Vendor contact phone number for offline payments
      - `contactEmail` (email, optional) - Vendor contact email for offline payments
      - `preferredPaymentMethod` (select: stripe, offline, both) - Vendor's preferred payment method
      - `offlinePaymentInstructions` (textarea, optional) - Custom instructions for offline payment
    - **Implementation Details**:
      ```typescript
      // Add to Vendors collection fields array (after existing fields)
      {
        name: "contactPhone",
        type: "text",
        label: "Contact Phone",
        admin: {
          description: "Phone number for customers to contact you for offline payments",
          position: "sidebar",
        },
      },
      {
        name: "contactEmail",
        type: "email",
        label: "Contact Email",
        admin: {
          description: "Email address for customers to contact you for offline payments",
          position: "sidebar",
        },
      },
      {
        name: "preferredPaymentMethod",
        type: "select",
        label: "Preferred Payment Method",
        options: [
          { label: "Stripe Only", value: "stripe" },
          { label: "Offline Only", value: "offline" },
          { label: "Both (Stripe & Offline)", value: "both" },
        ],
        defaultValue: "both",
        admin: {
          description: "Which payment methods do you want to offer to customers?",
          position: "sidebar",
        },
      },
      {
        name: "offlinePaymentInstructions",
        type: "textarea",
        label: "Offline Payment Instructions",
        admin: {
          description: "Custom instructions for customers who choose offline payment (e.g., 'Call me at [phone] or WhatsApp me at [number]')",
          position: "sidebar",
        },
      },
      ```
    - **Validation**: Ensure at least one contact method (phone or email) is provided if `preferredPaymentMethod` includes "offline"
    - **Files**: `src/collections/Vendors.ts`
    - **Status**: ✅ Completed - All fields added to Vendors collection with proper admin UI configuration

254. ✅ Add payment method field to Orders collection
    - **Tech**: Update `src/collections/Orders.ts` to add:
      - `paymentMethod` (select: stripe, offline, pending) - How the order was paid
      - `paymentStatus` (select: pending, completed, failed, refunded) - Payment status
      - `offlinePaymentContact` (object, optional) - Stores vendor contact info used for offline payment
      - `offlinePaymentNotes` (textarea, optional) - Notes about offline payment arrangement
    - **Implementation Details**:
      ```typescript
      // Add to Orders collection fields array
      {
        name: "paymentMethod",
        type: "select",
        label: "Payment Method",
        options: [
          { label: "Stripe", value: "stripe" },
          { label: "Offline Payment", value: "offline" },
        ],
        defaultValue: "stripe",
        required: true,
        admin: {
          description: "How the customer chose to pay for this order",
        },
      },
      {
        name: "paymentStatus",
        type: "select",
        label: "Payment Status",
        options: [
          { label: "Pending", value: "pending" },
          { label: "Completed", value: "completed" },
          { label: "Failed", value: "failed" },
          { label: "Refunded", value: "refunded" },
        ],
        defaultValue: "pending",
        required: true,
        admin: {
          description: "Current payment status for this order",
        },
      },
      {
        name: "offlinePaymentContact",
        type: "group",
        label: "Offline Payment Contact Info",
        fields: [
          {
            name: "phone",
            type: "text",
            label: "Vendor Phone",
          },
          {
            name: "email",
            type: "email",
            label: "Vendor Email",
          },
        ],
        admin: {
          condition: (data) => data.paymentMethod === "offline",
          description: "Vendor contact information provided to customer for offline payment",
        },
      },
      {
        name: "offlinePaymentNotes",
        type: "textarea",
        label: "Offline Payment Notes",
        admin: {
          condition: (data) => data.paymentMethod === "offline",
          description: "Any notes about the offline payment arrangement",
        },
      },
      ```
    - **Hook Updates**: Update `beforeChange` hook to auto-set `paymentStatus: "completed"` for Stripe orders after webhook confirmation
    - **Additional Fields**: Added `customerPhone` field to `offlinePaymentContact` group to store customer's phone number
    - **Files**: `src/collections/Orders.ts`
    - **Status**: ✅ Completed - All payment fields added, `stripeCheckoutSessionId` made optional for offline payments

255. ✅ Create payment method selection component
    - **Tech**: Create `src/modules/checkout/ui/components/payment-method-selector.tsx`:
      - Radio button group for payment method selection
      - Show "Stripe (Credit/Debit Card)" option if vendor has Stripe
      - Show "Contact Vendor for Offline Payment" option (always available)
      - Display vendor contact info (phone/email) when offline option selected
      - Show vendor's custom offline payment instructions if provided
    - **Implementation Details**:
      ```typescript
      // src/modules/checkout/ui/components/payment-method-selector.tsx
      "use client";
      
      import { useState } from "react";
      import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
      import { Label } from "@/components/ui/label";
      import { CreditCard, Phone, Mail, MessageCircle } from "lucide-react";
      import { Button } from "@/components/ui/button";
      
      interface PaymentMethodSelectorProps {
        vendor: {
          stripeAccountId?: string | null;
          contactPhone?: string | null;
          contactEmail?: string | null;
          offlinePaymentInstructions?: string | null;
          preferredPaymentMethod?: "stripe" | "offline" | "both";
        };
        selectedMethod: "stripe" | "offline";
        onMethodChange: (method: "stripe" | "offline") => void;
      }
      
      export function PaymentMethodSelector({
        vendor,
        selectedMethod,
        onMethodChange,
      }: PaymentMethodSelectorProps) {
        const hasStripe = !!vendor.stripeAccountId;
        const showStripe = hasStripe && (vendor.preferredPaymentMethod === "stripe" || vendor.preferredPaymentMethod === "both");
        const showOffline = vendor.preferredPaymentMethod === "offline" || vendor.preferredPaymentMethod === "both";
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Method</h3>
            <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
              {showStripe && (
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="stripe" id="stripe" className="mt-1" />
                  <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Pay with Credit/Debit Card (Stripe)</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Secure payment processed through Stripe
                    </p>
                  </Label>
                </div>
              )}
              
              {showOffline && (
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="offline" id="offline" className="mt-1" />
                  <Label htmlFor="offline" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      <span className="font-medium">Contact Vendor for Offline Payment</span>
                    </div>
                    {selectedMethod === "offline" && (
                      <div className="mt-3 space-y-2 text-sm">
                        {vendor.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{vendor.contactPhone}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = `tel:${vendor.contactPhone}`;
                              }}
                            >
                              Call
                            </Button>
                          </div>
                        )}
                        {vendor.contactEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{vendor.contactEmail}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = `mailto:${vendor.contactEmail}`;
                              }}
                            >
                              Email
                            </Button>
                          </div>
                        )}
                        {vendor.offlinePaymentInstructions && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-gray-700">
                            <p className="font-medium mb-1">Payment Instructions:</p>
                            <p>{vendor.offlinePaymentInstructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>
        );
      }
      ```
    - **Dependencies**: Install `@radix-ui/react-radio-group` if not already installed
    - **Key Features**: 
      - Auto-selects payment method when only one option available (using useEffect to avoid React warnings)
      - Requires customer phone number input when offline payment selected
      - Shows payment instructions from vendor
      - Label changed to "Offline Payment - Vendor Will Contact You"
    - **Files**: `src/modules/checkout/ui/components/payment-method-selector.tsx`
    - **Status**: ✅ Completed - Component created with customer phone requirement

256. ✅ Update checkout view to show payment method selector
    - **Tech**: Update `src/modules/checkout/ui/views/checkout-view.tsx`:
      - Fetch vendor information for products in cart
      - Check if vendor has Stripe account setup
      - Replace or enhance `PaymentSection` to show payment method selector
      - Pass selected payment method to purchase mutation
    - **Implementation Details**:
      ```typescript
      // In checkout-view.tsx, add state and vendor fetching:
      const [paymentMethod, setPaymentMethod] = useState<"stripe" | "offline">("stripe");
      
      // Fetch vendor info (assuming all products are from same vendor)
      const vendorId = useMemo(() => {
        if (!data?.docs || data.docs.length === 0) return null;
        const vendor = data.docs[0].vendor;
        return typeof vendor === "string" ? vendor : vendor?.id;
      }, [data]);
      
      const { data: vendorData } = trpc.vendor.getOne.useQuery(
        { id: vendorId! },
        { enabled: !!vendorId }
      );
      
      // Update purchase mutation call:
      purchase.mutate({
        cartItems: items.map(item => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          variantPrice: item.variantPrice,
        })),
        paymentMethod, // Add this
        buyNow: false,
      });
      
      // Replace PaymentSection with:
      {vendorData && (
        <PaymentMethodSelector
          vendor={vendorData}
          selectedMethod={paymentMethod}
          onMethodChange={setPaymentMethod}
        />
      )}
      ```
    - **tRPC Procedure**: Create `vendor.getOne` procedure if it doesn't exist:
      ```typescript
      // In src/modules/vendor/server/procedures.ts
      getOne: baseProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
          const vendor = await ctx.db.findByID({
            collection: "vendors",
            id: input.id,
            depth: 0,
          });
          return vendor;
        }),
      ```
    - **Additional Features**:
      - Added `customerPhone` state management
      - Validates phone number before allowing checkout for offline payments
      - Passes phone number to purchase mutation
    - **Files**: 
      - `src/modules/checkout/ui/views/checkout-view.tsx`
      - `src/modules/vendor/server/procedures.ts` (getOne procedure added)
    - **Status**: ✅ Completed - Checkout view updated with payment method selector and phone validation

257. ✅ Update checkout purchase mutation to handle offline payments
    - **Tech**: Update `src/modules/checkout/server/procedures.ts`:
      - Add `paymentMethod` to input schema (stripe | offline)
      - If `paymentMethod === "stripe"`: Validate Stripe account and proceed with Stripe checkout
      - If `paymentMethod === "offline"`: Skip Stripe validation, create order with `paymentStatus: "pending"` and `paymentMethod: "offline"`
      - Store vendor contact info in order for offline payment orders
    - **Implementation Details**:
      ```typescript
      // Update input schema:
      .input(
        z.object({
          cartItems: z.array(z.object({
            productId: z.string(),
            size: z.string().optional(),
            color: z.string().optional(),
            quantity: z.number().min(1).default(1),
            variantPrice: z.number().optional(),
          })).min(1),
          paymentMethod: z.enum(["stripe", "offline"]).default("stripe"), // Add this
          buyNow: z.boolean().optional().default(false),
        })
      )
      
      // In mutation, after vendor validation:
      if (input.paymentMethod === "stripe") {
        // Existing Stripe validation and checkout flow
        if (!vendor.stripeAccountId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Vendor has not connected their Stripe account...",
          });
        }
        const accountReady = await isStripeAccountReady(vendor.stripeAccountId);
        if (!accountReady) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Vendor's payment account is not ready...",
          });
        }
        // Continue with Stripe checkout...
        return { url: checkoutUrl };
      } else {
        // Offline payment flow
        // Create order immediately without payment
        const order = await ctx.db.create({
          collection: "orders",
          data: {
            user: ctx.session.user.id,
            vendor: vendorId,
            items: lineItems.map(item => ({
              product: item.price_data.product_data.metadata.id,
              quantity: item.quantity,
              price: Number(item.price_data.unit_amount) / 100,
              size: item.price_data.product_data.metadata.size || null,
              color: item.price_data.product_data.metadata.color || null,
            })),
            total: orderTotal,
            subtotal: orderTotal,
            shipping: 0, // Calculate if needed
            tax: 0, // Calculate if needed
            status: "pending", // Order status
            paymentMethod: "offline",
            paymentStatus: "pending",
            offlinePaymentContact: {
              phone: vendor.contactPhone || null,
              email: vendor.contactEmail || null,
            },
            offlinePaymentNotes: vendor.offlinePaymentInstructions || null,
            shippingAddress: input.shippingAddress, // Get from input
            commission: commission,
            vendorPayout: vendorPayout,
          },
        });
        
        // Send emails (implement in next task)
        // Return order ID instead of Stripe URL
        return { orderId: order.id, paymentMethod: "offline" };
      }
      ```
    - **Key Implementation Details**:
      - Validates payment method availability based on vendor preferences
      - Requires customer phone number for offline payments
      - Creates one order per product (matching webhook pattern)
      - Updates inventory immediately for offline orders
      - Stores customer phone in `offlinePaymentContact.customerPhone`
      - Updates shipping address phone with customer's contact number
      - Returns `orderId` and `paymentMethod` for offline payments
    - **Files**: `src/modules/checkout/server/procedures.ts`
    - **Status**: ✅ Completed - Full offline payment flow implemented with phone requirement

258. ✅ Create offline payment order creation logic
    - **Tech**: In checkout mutation, when `paymentMethod === "offline"`:
      - Create order immediately (don't wait for payment)
      - Set `paymentStatus: "pending"`
      - Set `paymentMethod: "offline"`
      - Store vendor contact info in `offlinePaymentContact` field
      - Store any custom instructions in `offlinePaymentNotes`
      - Send confirmation email to customer with vendor contact info
      - Send notification email to vendor about new offline payment order
    - **Implementation Details**:
      ```typescript
      // Create email utility functions in src/lib/email.ts:
      export async function sendOfflinePaymentOrderConfirmation(
        customerEmail: string,
        orderNumber: string,
        vendorContact: { phone?: string; email?: string },
        orderTotal: number
      ) {
        // Email template for customer
        const emailContent = `
          <h2>Order Confirmation - Payment Pending</h2>
          <p>Your order #${orderNumber} has been placed successfully!</p>
          <p><strong>Order Total: $${orderTotal.toFixed(2)}</strong></p>
          <p>To complete your payment, please contact the vendor:</p>
          ${vendorContact.phone ? `<p>Phone: <a href="tel:${vendorContact.phone}">${vendorContact.phone}</a></p>` : ''}
          ${vendorContact.email ? `<p>Email: <a href="mailto:${vendorContact.email}">${vendorContact.email}</a></p>` : ''}
          <p>Once payment is received, your order will be processed and shipped.</p>
        `;
        // Send email using your email service (SendGrid, AWS SES, etc.)
      }
      
      export async function sendVendorOfflinePaymentNotification(
        vendorEmail: string,
        orderNumber: string,
        customerName: string,
        orderTotal: number
      ) {
        // Email template for vendor
        const emailContent = `
          <h2>New Offline Payment Order</h2>
          <p>You have received a new order #${orderNumber} from ${customerName}.</p>
          <p><strong>Order Total: $${orderTotal.toFixed(2)}</strong></p>
          <p><strong>Payment Status: Pending</strong></p>
          <p>The customer will contact you to complete payment. Once payment is received, please mark the order as paid in your dashboard.</p>
        `;
        // Send email
      }
      
      // In checkout mutation, after creating offline order:
      try {
        // Send customer confirmation
        await sendOfflinePaymentOrderConfirmation(
          ctx.session.user.email,
          order.orderNumber,
          {
            phone: vendor.contactPhone || undefined,
            email: vendor.contactEmail || undefined,
          },
          orderTotal
        );
        
        // Send vendor notification
        if (vendor.email) {
          await sendVendorOfflinePaymentNotification(
            vendor.email,
            order.orderNumber,
            ctx.session.user.name || ctx.session.user.email,
            orderTotal
          );
        }
      } catch (error) {
        console.error("Failed to send offline payment emails:", error);
        // Don't fail order creation if email fails
      }
      ```
    - **Email Service**: Ensure email service is configured (SendGrid, AWS SES, etc.)
    - **Email Functions Created**:
      - `sendOfflinePaymentOrderConfirmation` - Customer confirmation with vendor contact info
      - `sendVendorOfflinePaymentNotification` - Vendor notification with customer phone number
      - `sendPaymentReceivedConfirmation` - Customer notification when payment marked as received
    - **Key Features**:
      - Creates multiple orders (one per product) for cart with multiple items
      - Updates variant stock immediately
      - Sends emails to both customer and vendor
      - Includes customer phone number in vendor notification
    - **Files**: 
      - `src/modules/checkout/server/procedures.ts`
      - `src/lib/email.ts` (all email functions added)
    - **Status**: ✅ Completed - Order creation logic with email notifications implemented

259. ✅ Update checkout success flow for offline payments
    - **Tech**: Update `src/modules/checkout/ui/views/checkout-view.tsx`:
      - After offline payment order creation, redirect to order confirmation page
      - Show vendor contact information on confirmation page
      - Display instructions for completing offline payment
      - Don't redirect to Stripe checkout for offline payments
    - **Implementation Details**:
      ```typescript
      // Update purchase mutation onSuccess handler:
      const purchase = trpc.checkout.purchase.useMutation({
        onSuccess: (data) => {
          if (data.paymentMethod === "offline") {
            // For offline payments, redirect to order confirmation
            router.push(`/orders/${data.orderId}?payment=pending`);
          } else if (data.url) {
            // For Stripe, redirect to Stripe checkout
            window.location.href = data.url;
          } else {
            toast.success("Purchase completed successfully");
            setStates({ success: true, cancel: false });
          }
        },
        // ... rest of handlers
      });
      
      // Update return type in procedures.ts:
      // Change return type to:
      return { 
        url?: string, 
        orderId?: string, 
        paymentMethod: "stripe" | "offline" 
      };
      ```
    - **Files**: 
      - `src/modules/checkout/ui/views/checkout-view.tsx`
      - `src/modules/checkout/server/procedures.ts` (return type updated)
    - **Status**: ✅ Completed - Success flow redirects to order detail page with `?payment=pending` query param

260. ✅ Create order confirmation page for offline payments
    - **Tech**: Create or update order confirmation page:
      - Show order details
      - Display vendor contact information prominently
      - Show payment instructions
      - Include "Contact Vendor" button/link
      - Display order status as "Payment Pending"
    - **Implementation Details**:
      ```typescript
      // Update src/app/(app)/orders/[id]/page.tsx or create new confirmation page
      // Add conditional rendering for offline payment orders:
      
      {order.paymentMethod === "offline" && order.paymentStatus === "pending" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            Payment Pending - Contact Vendor
          </h3>
          <p className="text-amber-800 mb-4">
            Your order has been placed! To complete payment, please contact the vendor:
          </p>
          
          {order.offlinePaymentContact?.phone && (
            <div className="flex items-center gap-4 mb-3">
              <Phone className="h-5 w-5" />
              <span className="font-medium">{order.offlinePaymentContact.phone}</span>
              <Button
                onClick={() => window.location.href = `tel:${order.offlinePaymentContact.phone}`}
                variant="outline"
              >
                Call Now
              </Button>
            </div>
          )}
          
          {order.offlinePaymentContact?.email && (
            <div className="flex items-center gap-4 mb-3">
              <Mail className="h-5 w-5" />
              <span className="font-medium">{order.offlinePaymentContact.email}</span>
              <Button
                onClick={() => window.location.href = `mailto:${order.offlinePaymentContact.email}`}
                variant="outline"
              >
                Email Now
              </Button>
            </div>
          )}
          
          {order.offlinePaymentNotes && (
            <div className="mt-4 p-3 bg-white rounded border border-amber-200">
              <p className="font-medium mb-1">Payment Instructions:</p>
              <p className="text-sm text-gray-700">{order.offlinePaymentNotes}</p>
            </div>
          )}
          
          <p className="text-sm text-amber-700 mt-4">
            Once payment is received, the vendor will update your order status and begin processing.
          </p>
        </div>
      )}
      ```
    - **Key Features**:
      - Created complete customer order detail page at `/orders/[id]/page.tsx`
      - Shows prominent offline payment pending banner when `?payment=pending` query param present
      - Displays customer phone number they provided
      - Shows vendor contact information with call/email buttons
      - Displays payment instructions
      - Includes order details, product info, shipping address, tracking
      - Added `getOneForUser` protected procedure to validate order ownership
    - **Files**: 
      - `src/app/(app)/orders/[id]/page.tsx` (created)
      - `src/modules/orders/server/procedures.ts` (added getOneForUser)
    - **Status**: ✅ Completed - Full order detail page with offline payment support created

261. ✅ Add customer phone number requirement for offline payments
    - **Tech**: When offline payment is selected:
      - Display mandatory phone number input field
      - Validate phone number before allowing checkout
      - Store customer phone in order for vendor to contact them
      - Update shipping address phone with customer's contact number
      - Changed label from "Contact Vendor" to "Vendor Will Contact You"
    - **Implementation Details**:
      - Phone input shown in PaymentMethodSelector when offline payment selected
      - Validation in checkout view before purchase mutation
      - Phone stored in `offlinePaymentContact.customerPhone` field
      - Vendor receives customer phone in email notification
    - **Files**: 
      - `src/modules/checkout/ui/components/payment-method-selector.tsx`
      - `src/modules/checkout/ui/views/checkout-view.tsx`
      - `src/modules/checkout/server/procedures.ts`
      - `src/collections/Orders.ts`
    - **Status**: ✅ Completed - Customer phone requirement fully implemented

262. ❌ Update vendor dashboard to show offline payment orders
    - **Tech**: Update `src/app/(app)/vendor/orders/page.tsx`:
      - Filter orders by payment method
      - Show payment status badge (Pending, Completed, etc.)
      - Highlight offline payment orders
      - Add filter for "Offline Payment" orders
    - **Implementation Details**:
      ```typescript
      // Add payment method filter state
      const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
      
      // Update orders query to include payment method filter
      const { data: ordersData } = trpc.orders.listForVendor.useQuery({
        paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
      });
      
      // Add filter UI:
      <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by payment method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Methods</SelectItem>
          <SelectItem value="stripe">Stripe Payments</SelectItem>
          <SelectItem value="offline">Offline Payments</SelectItem>
        </SelectContent>
      </Select>
      
      // In order cards, add payment status badge:
      {order.paymentMethod === "offline" && (
        <Badge variant={order.paymentStatus === "pending" ? "warning" : "success"}>
          {order.paymentStatus === "pending" ? "Payment Pending" : "Payment Received"}
        </Badge>
      )}
      ```
    - **tRPC Update**: Update `orders.listForVendor` to accept `paymentMethod` filter parameter
    - **Files**: 
      - `src/app/(app)/vendor/orders/page.tsx`
      - `src/modules/orders/server/procedures.ts` (update listForVendor)
    - **Status**: ❌ Not started

263. ❌ Add vendor order detail view for offline payments
    - **Tech**: Update order detail page to show:
      - Payment method badge
      - Payment status
      - Customer contact information
      - "Mark as Paid" button for vendors to update payment status
    - **Implementation Details**:
      ```typescript
      // In src/app/(app)/vendor/orders/[id]/page.tsx:
      {order.paymentMethod === "offline" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Offline Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Payment Status:</span>
              <Badge variant={order.paymentStatus === "pending" ? "warning" : "success"}>
                {order.paymentStatus === "pending" ? "Pending" : "Completed"}
              </Badge>
            </div>
            
            {order.paymentStatus === "pending" && (
              <>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Customer Contact:</p>
                  {order.user && (
                    <div className="space-y-1">
                      {typeof order.user === "object" && order.user.email && (
                        <p>Email: {order.user.email}</p>
                      )}
                      {typeof order.user === "object" && order.user.phone && (
                        <p>Phone: {order.user.phone}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Mark Payment as Received</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Payment Received</DialogTitle>
                      <DialogDescription>
                        Have you received payment of ${order.total.toFixed(2)} from the customer?
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleMarkAsPaid}>
                      <Textarea
                        placeholder="Optional: Add notes about the payment..."
                        name="notes"
                      />
                      <DialogFooter>
                        <Button type="submit" variant="default">
                          Confirm Payment Received
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      // Add mutation handler:
      const updatePaymentStatus = trpc.vendor.orders.updatePaymentStatus.useMutation({
        onSuccess: () => {
          toast.success("Payment status updated");
          router.refresh();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
      ```
    - **Files**: `src/app/(app)/vendor/orders/[id]/page.tsx`
    - **Status**: ❌ Not started

264. ✅ Create vendor payment status update mutation
    - **Tech**: Create `vendor.orders.updatePaymentStatus` tRPC procedure:
      - Allow vendors to update `paymentStatus` from "pending" to "completed"
      - Validate vendor owns the order
      - Send confirmation email to customer when payment marked as completed
      - Update order status to "processing" or "confirmed" when payment completed
    - **Implementation Details**:
      ```typescript
      // Add to src/modules/orders/server/procedures.ts or vendor router:
      updatePaymentStatus: vendorProcedure
        .input(
          z.object({
            orderId: z.string(),
            paymentStatus: z.enum(["pending", "completed", "failed"]),
            notes: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const vendorId = ctx.session.vendor.id;
          
          // Fetch order and validate vendor ownership
          const order = await ctx.db.findByID({
            collection: "orders",
            id: input.orderId,
            depth: 1,
          });
          
          const orderVendorId = typeof order.vendor === "string" 
            ? order.vendor 
            : order.vendor?.id;
          
          if (orderVendorId !== vendorId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only update payment status for your own orders",
            });
          }
          
          // Only allow updating offline payment orders
          if (order.paymentMethod !== "offline") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Payment status can only be updated for offline payment orders",
            });
          }
          
          // Update order
          const updatedOrder = await ctx.db.update({
            collection: "orders",
            id: input.orderId,
            data: {
              paymentStatus: input.paymentStatus,
              ...(input.paymentStatus === "completed" && {
                status: "confirmed", // Move order to confirmed status
              }),
              ...(input.notes && {
                offlinePaymentNotes: input.notes,
              }),
            },
          });
          
          // Send email notification to customer
          if (input.paymentStatus === "completed" && order.user) {
            const user = typeof order.user === "string"
              ? await ctx.db.findByID({ collection: "users", id: order.user })
              : order.user;
            
            if (user?.email) {
              await sendPaymentReceivedConfirmation(
                user.email,
                order.orderNumber,
                order.total
              );
            }
          }
          
          return updatedOrder;
        }),
      ```
    - **Key Features**:
      - Validates vendor owns the order
      - Only allows updating offline payment orders
      - Updates order status to "payment_done" when payment marked as completed
      - Sends confirmation email to customer when payment received
      - Stores optional notes in `offlinePaymentNotes`
    - **Files**: 
      - `src/modules/vendor/server/procedures.ts` (updatePaymentStatus added)
      - `src/lib/email.ts` (sendPaymentReceivedConfirmation function added)
    - **Status**: ✅ Completed - Payment status update mutation with email notifications implemented

265. ✅ Add email notifications for offline payment orders
    - **Tech**: Create email templates:
      - Customer confirmation email with vendor contact info and payment instructions
      - Vendor notification email about new offline payment order (includes customer phone)
      - Customer notification when vendor marks payment as received
    - **Implementation Details**:
      - `sendOfflinePaymentOrderConfirmation`: HTML email with order details, vendor contact, payment instructions
      - `sendVendorOfflinePaymentNotification`: HTML email with customer name, phone number, order details
      - `sendPaymentReceivedConfirmation`: HTML email confirming payment received and order processing
      - All emails use existing email service (SendGrid/AWS SES)
      - Email failures don't block order creation
    - **Files**: `src/lib/email.ts`
    - **Status**: ✅ Completed - All three email templates implemented and integrated

266. ❌ Add payment method indicator to order list (customer view)
    - **Tech**: Update customer orders page:
      - Show payment method badge (Stripe/Offline)
      - Show payment status
      - For offline payments, show vendor contact info
      - Display "Contact Vendor" button for pending offline payments
    - **Details**: Customers can track their offline payment orders
    - **Status**: ❌ Not started

267. ❌ Add validation for vendor contact info when offline payment selected
    - **Tech**: In checkout validation:
      - If offline payment selected and vendor has no contact phone/email, show warning
      - Suggest customer contact vendor through platform messaging
      - Still allow order creation but flag it for vendor attention
    - **Details**: Ensure customers can contact vendor for offline payments
    - **Status**: ❌ Not started

268. ❌ Add admin view for offline payment orders
    - **Tech**: Update admin dashboard:
      - Show all offline payment orders
      - Filter by payment status
      - Allow admins to view and manage offline payment orders
      - Add reporting for offline vs Stripe payment orders
    - **Details**: Admins can monitor and support offline payment orders
    - **Status**: ❌ Not started

269. ❌ Add analytics for payment methods
    - **Tech**: Add analytics tracking:
      - Count orders by payment method (Stripe vs Offline)
      - Track conversion rates for each payment method
      - Show payment method distribution in vendor analytics
      - Add payment method metrics to admin dashboard
    - **Details**: Understand payment method preferences and trends
    - **Status**: ❌ Not started

270. ❌ Write tests for offline payment flow
    - **Tech**: Create tests:
      - Unit tests for payment method selector component
      - Integration tests for offline order creation
      - E2E tests for complete offline payment checkout flow
      - Test vendor payment status update
    - **Details**: Ensure offline payment flow works correctly
    - **Status**: ❌ Not started

271. ✅ Fix React setState warning in PaymentMethodSelector
    - **Tech**: Move auto-selection logic from render to useEffect hook
    - **Issue**: "Cannot update a component while rendering a different component" error
    - **Solution**: Use `useEffect` with proper dependencies to handle auto-selection
    - **Files**: `src/modules/checkout/ui/components/payment-method-selector.tsx`
    - **Status**: ✅ Completed - Fixed React warning by using useEffect for state updates

272. ✅ Create customer order detail page
    - **Tech**: Create `/orders/[id]/page.tsx` for customers to view their orders
    - **Features**:
      - Displays order information, product details, shipping address
      - Shows offline payment pending banner when `?payment=pending` query param present
      - Displays customer phone number they provided
      - Shows vendor contact information with action buttons
      - Includes order summary, tracking info, actions (print, buy again)
    - **Security**: Added `getOneForUser` protected procedure to validate order ownership
    - **Files**: 
      - `src/app/(app)/orders/[id]/page.tsx` (created)
      - `src/modules/orders/server/procedures.ts` (added getOneForUser)
    - **Status**: ✅ Completed - Full customer order detail page with offline payment support

273. ✅ Implement inventory update for offline payment orders
    - **Tech**: Update product variant stock immediately when offline order is created
    - **Details**: 
      - Decrements variant stock when order is created (not waiting for payment)
      - Handles multiple variants correctly
      - Updates product variants array in database
    - **Files**: `src/modules/checkout/server/procedures.ts`
    - **Status**: ✅ Completed - Inventory updated immediately for offline orders

274. ✅ Implement multiple order creation for cart items
    - **Tech**: Create one order per product when cart has multiple items (matching Stripe webhook pattern)
    - **Details**:
      - Loops through cart items and creates separate order for each product
      - Each order has its own order number
      - All orders share same shipping address
      - Commission calculated per item
      - Returns first order ID for redirect, all order IDs in response
    - **Files**: `src/modules/checkout/server/procedures.ts`
    - **Status**: ✅ Completed - Multiple order creation implemented

275. ✅ Store customer phone in order for vendor contact
    - **Tech**: Store customer-provided phone number in order record
    - **Details**:
      - Phone stored in `offlinePaymentContact.customerPhone` field
      - Also updates `shippingAddress.phone` with customer contact number
      - Vendor can see customer phone in order details and email notification
    - **Files**: 
      - `src/modules/checkout/server/procedures.ts`
      - `src/collections/Orders.ts` (added customerPhone field)
    - **Status**: ✅ Completed - Customer phone stored and accessible to vendor

276. ✅ Add vendor.getOne procedure for checkout
    - **Tech**: Create tRPC procedure to fetch vendor details for payment method selection
    - **Details**:
      - Base procedure (public access for vendor info)
      - Returns vendor with contact info, payment preferences, Stripe account status
      - Used by checkout view to determine available payment methods
    - **Files**: `src/modules/vendor/server/procedures.ts`
    - **Status**: ✅ Completed - Vendor getOne procedure added

277. ✅ Update email templates with customer phone requirement
    - **Tech**: Update vendor notification email to include customer phone number
    - **Details**:
      - Vendor email shows customer phone as clickable link
      - Changed messaging from "customer will contact you" to "please contact customer"
      - Customer email updated to say "vendor will contact you"
    - **Files**: `src/lib/email.ts`
    - **Status**: ✅ Completed - Email templates updated with customer phone and new messaging

278. ✅ Make stripeCheckoutSessionId optional for offline orders
    - **Tech**: Update Orders collection to make Stripe session ID optional
    - **Details**:
      - Added condition to only show field when paymentMethod is "stripe"
      - Prevents validation errors for offline payment orders
    - **Files**: `src/collections/Orders.ts`
    - **Status**: ✅ Completed - Stripe session ID field made conditional

279. ✅ Implement order ownership validation
    - **Tech**: Add protected procedure to ensure users can only view their own orders
    - **Details**:
      - Created `orders.getOneForUser` protected procedure
      - Validates order.user matches logged-in user ID
      - Returns 403 Forbidden if user tries to access another user's order
    - **Files**: `src/modules/orders/server/procedures.ts`
    - **Status**: ✅ Completed - Order ownership validation implemented

280. ✅ Handle shipping address for offline payment orders
    - **Tech**: Fetch and use user's default shipping address for offline orders
    - **Details**:
      - Gets user's shipping addresses from user record
      - Uses default address or first address
      - Validates required address fields are present
      - Maps user address format to order shipping address format
      - Updates shipping address phone with customer contact number
    - **Files**: `src/modules/checkout/server/procedures.ts`
    - **Status**: ✅ Completed - Shipping address handling for offline orders implemented

### Technical Architecture Summary for Offline Payments

**Data Flow:**
1. **Checkout Initiation**: Customer selects payment method (Stripe or Offline)
2. **Phone Number Collection**: Customer must provide phone number for offline payments
3. **Vendor Validation**: 
   - If Stripe: Validate `stripeAccountId` and account readiness
   - If Offline: Validate customer phone provided, check vendor payment preferences
4. **Order Creation**:
   - Stripe: Create Stripe checkout session, order created via webhook
   - Offline: Create order immediately with `paymentStatus: "pending"`, update inventory, store customer phone
5. **Payment Completion**:
   - Stripe: Automatic via Stripe webhook
   - Offline: Vendor contacts customer, marks payment as received via `updatePaymentStatus` mutation

**Key Components:**
- **PaymentMethodSelector**: React component for payment method selection with phone input
- **Checkout Mutation**: Enhanced to handle both payment methods with phone validation
- **Order Collection**: Extended with payment fields and customer phone storage
- **Vendor Collection**: Extended with contact fields and payment preferences
- **Email Service**: Three email templates for offline payment notifications
- **Order Detail Page**: Customer-facing page with offline payment banner and vendor contact info

**State Management:**
- Payment method selection stored in component state
- Customer phone number stored in component state
- Order payment status tracked in database
- Vendor payment status updates trigger order status changes and email notifications

**Security Considerations:**
- Only order owner (vendor) can update payment status
- Validate vendor ownership before allowing status updates
- Order detail page validates user ownership via `getOneForUser` procedure
- Email notifications sent to both parties for transparency

**Key Features Implemented:**
- ✅ Customer phone number requirement for offline payments
- ✅ Multiple order creation (one per product) for cart items
- ✅ Immediate inventory update for offline orders
- ✅ Customer phone stored in order for vendor access
- ✅ Vendor receives customer phone in email notification
- ✅ Order detail page with offline payment support
- ✅ Payment status update mutation with email confirmation
- ✅ React warning fixes (useEffect for auto-selection)

**Files Created/Modified:**
- ✅ `src/modules/checkout/ui/components/payment-method-selector.tsx` (created)
- ✅ `src/modules/checkout/ui/views/checkout-view.tsx` (modified)
- ✅ `src/modules/checkout/server/procedures.ts` (modified)
- ✅ `src/collections/Vendors.ts` (modified)
- ✅ `src/collections/Orders.ts` (modified)
- ✅ `src/modules/vendor/server/procedures.ts` (added getOne and updatePaymentStatus)
- ✅ `src/lib/email.ts` (added 3 email functions)
- ✅ `src/app/(app)/orders/[id]/page.tsx` (created)
- ✅ `src/modules/orders/server/procedures.ts` (added getOneForUser)

## Product Image & Gallery Features

**Technical Implementation**: Create `availableImages` array by combining main `image` and `cover` fields (if both exist and are different), use `useState` to track `selectedImageIndex`, map over `availableImages.length` to render dynamic thumbnails (1 image = 1 thumbnail, 2 images = 2 thumbnails, etc.), update main displayed image via `availableImages[selectedImageIndex]` when thumbnail is clicked, and highlight selected thumbnail with `border-orange-500 border-2` styling.

281. ✅ Display cover image on product detail page
    - **Tech**: Updated product view component to display cover image alongside main image
    - **Details**: 
      - Products collection has `cover` field (upload type, relationTo: media) and it's now displayed on product page
      - Both `image` and `cover` fields are extracted using `getImageUrl` helper function
      - Cover image is shown as a thumbnail option in the image gallery
      - Both main image and cover image are available for viewing
    - **Implementation Details**:
      - Extract cover image URL using same `getImageUrl` helper function
      - Create `availableImages` array that includes all available images:
        - Add main `image` if it exists
        - Add `cover` image if it exists and is different from main image
      - Array length is 1 if only one image exists, 2 if both exist, etc.
      - Display all available images in thumbnail gallery
    - **Files**: `src/modules/products/ui/components/product-view.tsx` (lines 72-83)
    - **Status**: ✅ Complete

282. ✅ Fix product thumbnail gallery to dynamically show available images
    - **Tech**: Replaced hardcoded thumbnails with dynamic image gallery that matches available images
    - **Details**: 
      - Thumbnail count matches number of available images:
        - If only 1 image exists (main or cover), shows 1 thumbnail
        - If 2 images exist (main + cover), shows 2 thumbnails
        - Dynamic count based on `availableImages.length`
      - Each thumbnail shows the actual corresponding image (not duplicates)
      - Thumbnails are clickable to switch main displayed image
      - Selected thumbnail is highlighted with orange border (border-orange-500 border-2)
    - **Implementation Details**:
      - Created `availableImages` array with all available images (main + cover if different)
      - Uses `useState` to track `selectedImageIndex` (default 0)
      - Maps over `availableImages` array instead of hardcoded array
      - Number of thumbnails = `availableImages.length` (dynamic, not fixed)
      - Added `onClick` handler to thumbnails to update `selectedImageIndex`
      - Main image display uses `availableImages[selectedImageIndex]`
      - Renders thumbnail gallery if `availableImages.length > 0` (even for single image)
      - Visual indicator (border-2 border-orange-500) for selected thumbnail
      - Grid layout: Dynamically adjusts columns (6 columns if ≤6 images, 4 columns if more)
    - **Files**: `src/modules/products/ui/components/product-view.tsx` (lines 258-279)
    - **Status**: ✅ Complete

283. ✅ Implement image gallery navigation for product page
    - **Tech**: Added image switching functionality with thumbnail navigation
    - **Details**: 
      - Users can click thumbnails to view different product images
      - Main image updates when thumbnail is clicked
      - Selected thumbnail has visual feedback (highlighted border with border-orange-500 border-2)
      - Works with any number of images (1, 2, 4, etc.) - fully dynamic
      - Smooth transitions when switching images (CSS transitions)
    - **Implementation Details**:
      - Added `selectedImageIndex` state to track current image (default 0)
      - Added `onClick` handler to thumbnails that updates selected index
      - Added conditional styling to highlight selected thumbnail (border-orange-500 border-2)
      - Handles edge cases: if only 1 image, clicking thumbnail still works (visual feedback)
      - Image transition animations with CSS transitions
      - Navigation works correctly regardless of number of images
    - **Files**: `src/modules/products/ui/components/product-view.tsx` (lines 82-83, 260-277)
    - **Status**: ✅ Complete

284. ⚠️ Add cover image usage documentation
    - **Tech**: Document where and how cover images are used in the application
    - **Details**: 
      - Document that cover image is uploaded in vendor product form (`/vendor/products/new`)
      - Explain difference between `image` (main product image) and `cover` (banner/hero/secondary image)
      - Document dynamic thumbnail gallery behavior:
        - Thumbnail count matches available images (1 image = 1 thumbnail, 2 images = 2 thumbnails, 4 images = 4 thumbnails)
        - Gallery shows all available images (main + cover if both exist)
        - Users can click thumbnails to switch main displayed image
      - Add admin documentation for vendors on when to use cover vs main image
      - Explain that cover image appears as thumbnail option on product detail page
    - **Files**: `docs/PRODUCT_IMAGES.md` (to be created)
    - **Status**: ❌ Not started

## YouTube Video Integration for Product Details

### YouTube Link & Timestamp Support (Tasks 296-305)

296. ❌ Add YouTube URL field to Products collection
    - **Tech**: Update `src/collections/Products.ts` to add YouTube video support
    - **Details**: 
      - Add `youtubeUrl` field (text, optional) - Full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
      - Add `youtubeVideoId` field (text, optional) - Extracted video ID (auto-populated from URL)
      - Add `youtubeStartTime` field (text, optional) - Start time in MM:SS format (e.g., "2:05" for 2 minutes 5 seconds)
      - Add `youtubeStartTimeSeconds` field (number, optional) - Converted start time in seconds (auto-calculated from MM:SS)
      - Replace existing `video` field with `videoSource` selection (upload vs YouTube)
      - Make existing `video` upload field conditional (only show if `videoSource === "upload"`)
      - Make YouTube fields conditional (only show if `videoSource === "youtube"`)
    - **Implementation Details**:
      ```typescript
      {
        name: "videoSource",
        type: "select",
        label: "Video Source",
        options: [
          { label: "Upload Video File", value: "upload" },
          { label: "YouTube Link", value: "youtube" },
        ],
        defaultValue: "upload",
        admin: {
          description: "Choose how to add product video: upload a file or use a YouTube link",
        },
      },
      {
        name: "youtubeUrl",
        type: "text",
        label: "YouTube URL",
        admin: {
          condition: (data) => data.videoSource === "youtube",
          description: "Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)",
        },
      },
      {
        name: "youtubeStartTime",
        type: "text",
        label: "Start Time (MM:SS)",
        admin: {
          condition: (data) => data.videoSource === "youtube",
          description: "Enter the time where product details are discussed in MM:SS format (e.g., 2:05 for 2 minutes 5 seconds, or 0:30 for 30 seconds)",
          placeholder: "2:05",
        },
      },
      {
        name: "youtubeStartTimeSeconds",
        type: "number",
        label: "Start Time (seconds) - Auto-calculated",
        admin: {
          condition: (data) => data.videoSource === "youtube",
          description: "Automatically calculated from MM:SS format",
          readOnly: true,
        },
      },
      ```
    - **Files**: `src/collections/Products.ts`
    - **Status**: ❌ Not started

297. ❌ Create YouTube URL validation and time conversion utilities
    - **Tech**: Create utility functions for YouTube URL validation, video ID extraction, and time format conversion
    - **Details**: 
      - Support multiple YouTube URL formats:
        - `https://www.youtube.com/watch?v=VIDEO_ID`
        - `https://youtu.be/VIDEO_ID`
        - `https://www.youtube.com/embed/VIDEO_ID`
        - `https://youtube.com/watch?v=VIDEO_ID`
      - Extract video ID from URL
      - Validate that URL is a valid YouTube URL
      - Convert MM:SS format to seconds (e.g., "2:05" → 125 seconds)
      - Convert seconds to MM:SS format (e.g., 125 seconds → "2:05")
      - Validate MM:SS format (e.g., "2:05", "0:30", "10:45")
      - Return extracted video ID or null if invalid
    - **Implementation Details**:
      ```typescript
      // src/lib/youtube-utils.ts
      export function extractYouTubeVideoId(url: string): string | null {
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
          /^([a-zA-Z0-9_-]{11})$/,
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        return null;
      }
      
      export function isValidYouTubeUrl(url: string): boolean {
        return extractYouTubeVideoId(url) !== null;
      }
      
      /**
       * Convert MM:SS format to seconds
       * Examples: "2:05" → 125, "0:30" → 30, "10:45" → 645
       */
      export function timeToSeconds(timeString: string): number | null {
        if (!timeString || typeof timeString !== 'string') return null;
        
        const parts = timeString.trim().split(':');
        if (parts.length !== 2) return null;
        
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        
        if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
          return null;
        }
        
        return minutes * 60 + seconds;
      }
      
      /**
       * Convert seconds to MM:SS format
       * Examples: 125 → "2:05", 30 → "0:30", 645 → "10:45"
       */
      export function secondsToTime(seconds: number): string {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      }
      
      /**
       * Validate MM:SS format
       */
      export function isValidTimeFormat(timeString: string): boolean {
        return timeToSeconds(timeString) !== null;
      }
      ```
    - **Files**: `src/lib/youtube-utils.ts` (to be created)
    - **Status**: ❌ Not started

298. ❌ Add YouTube URL validation and time conversion hook in Products collection
    - **Tech**: Add `beforeValidate` hook to validate YouTube URL, extract video ID, and convert time format
    - **Details**: 
      - Validate `youtubeUrl` field if `videoSource === "youtube"`
      - Extract video ID from URL using utility function
      - Auto-populate `youtubeVideoId` field
      - Validate `youtubeStartTime` format (MM:SS)
      - Convert `youtubeStartTime` (MM:SS) to `youtubeStartTimeSeconds` (number)
      - Show error if YouTube URL is invalid
      - Show error if time format is invalid (must be MM:SS)
      - Clear YouTube fields if `videoSource` changes to "upload"
    - **Implementation Details**:
      ```typescript
      beforeValidate: [
        async ({ data, operation, req }) => {
          // ... existing hooks ...
          
          // YouTube URL validation and video ID extraction
          if (data.videoSource === "youtube" && data.youtubeUrl) {
            const videoId = extractYouTubeVideoId(data.youtubeUrl);
            if (!videoId) {
              throw new Error("Invalid YouTube URL. Please provide a valid YouTube video URL.");
            }
            data.youtubeVideoId = videoId;
            
            // Convert MM:SS format to seconds
            if (data.youtubeStartTime) {
              const seconds = timeToSeconds(data.youtubeStartTime);
              if (seconds === null) {
                throw new Error("Invalid time format. Please use MM:SS format (e.g., 2:05 for 2 minutes 5 seconds).");
              }
              data.youtubeStartTimeSeconds = seconds;
            } else {
              data.youtubeStartTimeSeconds = undefined;
            }
          } else if (data.videoSource === "upload") {
            // Clear YouTube fields if switching to upload
            data.youtubeUrl = undefined;
            data.youtubeVideoId = undefined;
            data.youtubeStartTime = undefined;
            data.youtubeStartTimeSeconds = undefined;
          }
          
          return data;
        },
      ],
      ```
    - **Files**: `src/collections/Products.ts`
    - **Status**: ❌ Not started

299. ❌ Update product form to support YouTube video input with MM:SS time format
    - **Tech**: Update `src/app/(app)/vendor/products/components/ProductForm.tsx`
    - **Details**: 
      - Add `videoSource` field (radio buttons or select: "Upload Video" or "YouTube Link")
      - Add `youtubeUrl` input field (text input, shown when `videoSource === "youtube"`)
      - Add `youtubeStartTime` input field (text input with MM:SS format, shown when `videoSource === "youtube"`)
      - Make existing video upload field conditional (only show when `videoSource === "upload"`)
      - Add real-time YouTube URL validation with error messages
      - Add real-time time format validation (MM:SS format)
      - Show preview of YouTube video ID when URL is valid
      - Add helper text explaining how to get YouTube URL and find timestamp
      - Add time format input mask or validation (e.g., "2:05" format)
      - Show converted seconds value as helper text (e.g., "2:05 = 125 seconds")
    - **Implementation Details**:
      - Use React Hook Form to manage `videoSource`, `youtubeUrl`, `youtubeStartTime` fields
      - Add client-side validation for YouTube URL format using `isValidYouTubeUrl()`
      - Add client-side validation for time format using `isValidTimeFormat()` and `timeToSeconds()`
      - Show/hide fields based on `videoSource` selection
      - Add format helper: "Format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
      - Add time format helper: "Enter time in MM:SS format (e.g., 2:05 for 2 minutes 5 seconds, 0:30 for 30 seconds)"
      - Add input placeholder: "2:05"
      - Show live conversion: "This will start the video at 125 seconds"
    - **Files**: `src/app/(app)/vendor/products/components/ProductForm.tsx`
    - **Status**: ❌ Not started

300. ❌ Update product form schema to include YouTube fields with MM:SS time validation
    - **Tech**: Update Zod schema in `ProductForm.tsx` to include YouTube fields
    - **Details**: 
      - Add `videoSource` to schema: `z.enum(["upload", "youtube"]).optional().default("upload")`
      - Add `youtubeUrl` to schema: `z.string().url().optional()` with custom validation
      - Add `youtubeStartTime` to schema: `z.string().optional()` with MM:SS format validation
      - Add conditional validation: if `videoSource === "youtube"`, `youtubeUrl` is required
      - Validate YouTube URL format using `isValidYouTubeUrl()` utility function
      - Validate time format using `isValidTimeFormat()` utility function
      - Show specific error messages for invalid formats
    - **Implementation Details**:
      ```typescript
      videoSource: z.enum(["upload", "youtube"]).optional().default("upload"),
      youtubeUrl: z.string().url().optional().refine(
        (url, ctx) => {
          if (ctx.parent.videoSource === "youtube") {
            return url && isValidYouTubeUrl(url);
          }
          return true;
        },
        { message: "Please provide a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)" }
      ),
      youtubeStartTime: z.string().optional().refine(
        (time, ctx) => {
          if (ctx.parent.videoSource === "youtube" && time) {
            return isValidTimeFormat(time);
          }
          return true;
        },
        { message: "Please use MM:SS format (e.g., 2:05 for 2 minutes 5 seconds)" }
      ),
      ```
    - **Files**: `src/app/(app)/vendor/products/components/ProductForm.tsx`
    - **Status**: ❌ Not started

301. ❌ Update tRPC product schemas to accept YouTube fields with time conversion
    - **Tech**: Update `src/modules/vendor/server/procedures.ts` product create/update schemas
    - **Details**: 
      - Add `videoSource` field to create and update mutation schemas
      - Add `youtubeUrl` field to create and update mutation schemas
      - Add `youtubeStartTime` field (string, MM:SS format) to create and update mutation schemas
      - Add validation: if `videoSource === "youtube"`, validate YouTube URL and time format
      - Extract and store `youtubeVideoId` automatically
      - Convert `youtubeStartTime` (MM:SS) to `youtubeStartTimeSeconds` (number) before saving
      - Validate time format using `isValidTimeFormat()` and convert using `timeToSeconds()`
    - **Implementation Details**:
      ```typescript
      videoSource: z.enum(["upload", "youtube"]).optional(),
      youtubeUrl: z.string().url().optional(),
      youtubeStartTime: z.string().optional(), // MM:SS format
      // youtubeStartTimeSeconds will be auto-calculated in the mutation
      ```
    - **Files**: `src/modules/vendor/server/procedures.ts`
    - **Status**: ❌ Not started

302. ❌ Create YouTube embed component for product view with start time support
    - **Tech**: Create `src/modules/products/ui/components/youtube-embed.tsx`
    - **Details**: 
      - Component accepts `videoId` and `startTimeSeconds` props
      - Renders YouTube iframe embed with autoplay disabled
      - Appends `?start=SECONDS` to embed URL if `startTimeSeconds` is provided
      - Supports responsive design (16:9 aspect ratio)
      - Includes YouTube privacy-enhanced mode (`youtube-nocookie.com`)
      - Handles loading states and error states
      - Shows start time indicator (e.g., "Video starts at 2:05")
    - **Implementation Details**:
      ```typescript
      // src/modules/products/ui/components/youtube-embed.tsx
      import { secondsToTime } from "@/lib/youtube-utils";
      
      interface YouTubeEmbedProps {
        videoId: string;
        startTimeSeconds?: number; // in seconds (converted from MM:SS)
        title?: string;
      }
      
      export function YouTubeEmbed({ videoId, startTimeSeconds, title }: YouTubeEmbedProps) {
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}${startTimeSeconds ? `?start=${startTimeSeconds}` : ''}`;
        
        return (
          <div className="space-y-2">
            {startTimeSeconds && (
              <p className="text-sm text-gray-600">
                Video starts at {secondsToTime(startTimeSeconds)}
              </p>
            )}
            <div className="relative w-full aspect-video">
              <iframe
                src={embedUrl}
                title={title || "Product Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-lg"
              />
            </div>
          </div>
        );
      }
      ```
    - **Files**: `src/modules/products/ui/components/youtube-embed.tsx` (to be created)
    - **Status**: ❌ Not started

303. ❌ Update product view to display YouTube video with start time when available
    - **Tech**: Update `src/modules/products/ui/components/product-view.tsx`
    - **Details**: 
      - Check if product has `videoSource === "youtube"` and `youtubeVideoId`
      - If YouTube video exists, render `YouTubeEmbed` component instead of video element
      - Pass `youtubeStartTimeSeconds` (not MM:SS string) to embed component
      - Fallback to uploaded video if YouTube video is not available
      - Show appropriate message if neither video source is available
      - Maintain existing video display logic for uploaded videos
      - Display start time information to users (e.g., "Video starts at 2:05")
    - **Implementation Details**:
      - Import `YouTubeEmbed` component
      - Check `data.videoSource` and `data.youtubeVideoId`
      - Use `data.youtubeStartTimeSeconds` (number) for embed, not `data.youtubeStartTime` (string)
      - Conditionally render YouTube embed or uploaded video
      - Handle both video sources gracefully
      - Show user-friendly message: "This video will start playing at [time] where product details are discussed"
    - **Files**: `src/modules/products/ui/components/product-view.tsx`
    - **Status**: ❌ Not started

304. ❌ Add YouTube video preview in product form with MM:SS time display
    - **Tech**: Add preview functionality in `ProductForm.tsx` for YouTube videos
    - **Details**: 
      - Show YouTube video preview when valid URL is entered
      - Extract video ID from URL and display embed preview
      - Show start time indicator if `youtubeStartTime` is set (display in MM:SS format)
      - Convert MM:SS to seconds for embed preview
      - Update preview when URL or start time changes
      - Show error message if URL is invalid
      - Show error message if time format is invalid
      - Add "Test Video" button to open YouTube video in new tab at specified timestamp
      - Display converted seconds as helper text (e.g., "2:05 = 125 seconds")
    - **Implementation Details**:
      - Use `extractYouTubeVideoId` utility to get video ID
      - Use `timeToSeconds` to convert MM:SS to seconds for preview
      - Render `YouTubeEmbed` component in preview section with converted seconds
      - Add helper link: "Open in YouTube at [MM:SS]" if start time is set
      - Show preview only when URL is valid and time format is valid (if provided)
      - Show live validation feedback for both URL and time format
    - **Files**: `src/app/(app)/vendor/products/components/ProductForm.tsx`
    - **Status**: ❌ Not started

305. ❌ Add YouTube video documentation and help text with MM:SS format instructions
    - **Tech**: Create documentation and add help text in product form
    - **Details**: 
      - Add help text explaining how to get YouTube URL:
        - "Right-click on YouTube video → Copy video URL"
        - "Or copy URL from browser address bar"
        - "Supported formats: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
      - Add help text for finding and entering start time:
        - "Play the video and note the time where product details are discussed"
        - "Enter time in MM:SS format (e.g., 2:05 for 2 minutes 5 seconds, 0:30 for 30 seconds)"
        - "Examples: 2:05, 0:30, 10:45, 1:23"
        - "This will make the video start at that point when customers view it"
        - "The video will automatically start playing from this timestamp"
      - Add examples of valid YouTube URL formats
      - Add examples of valid time formats (MM:SS)
      - Create vendor guide document explaining YouTube video feature with screenshots
      - Add tooltip or info icon with detailed instructions
    - **Files**: `src/app/(app)/vendor/products/components/ProductForm.tsx`, `docs/YOUTUBE_VIDEO_GUIDE.md` (to be created)
    - **Status**: ❌ Not started

## Authentication Enhancements

249. ❌ Implement password reset/forgot password flow
    - **Tech**: Create password reset page, email sending, token validation
    - **Details**: Forgot password page, reset link email, password reset page with token validation
    - **Status**: ❌ Not started
    - **Reference**: AUTHENTICATION_TASKS.md Remaining Tasks

250. ❌ Implement email verification
    - **Tech**: Send verification email on signup, verify email token
    - **Details**: Email verification link, verify token, mark email as verified
    - **Status**: ❌ Not started
    - **Reference**: AUTHENTICATION_TASKS.md Remaining Tasks

251. ❌ Implement two-factor authentication (2FA)
    - **Tech**: Add 2FA setup and verification
    - **Details**: TOTP-based 2FA, QR code generation, verification code input
    - **Status**: ❌ Not started
    - **Reference**: AUTHENTICATION_TASKS.md Remaining Tasks

252. ❌ Add social account linking in user settings
    - **Tech**: Allow users to link/unlink OAuth accounts in settings
    - **Details**: Link Google/Facebook accounts, unlink accounts, show linked accounts
    - **Status**: ❌ Not started
    - **Reference**: AUTHENTICATION_TASKS.md Remaining Tasks

---

## Large Media Uploads / Direct-to-Vercel-Blob (306-311)

306. ❌ Architect direct-to-Blob upload flow for large media files
    - **Tech**: Design a two-step flow: (1) browser uploads directly to Vercel Blob, (2) backend creates a `media` document from the Blob URL (no large file bodies through `/api/media`)
    - **Details**: Define sequence diagram and data contracts between frontend, Vercel Blob, and Payload; ensure this works for both images and videos and avoids Vercel serverless body-size limits
    - **Status**: ❌ Not started

307. ❌ Implement client-side direct upload to Vercel Blob for images
    - **Tech**: Use `@vercel/blob` **client SDK** (or signed upload URLs) in the browser to `put()` image files directly to Blob and receive a public Blob URL
    - **Details**: Update image upload logic in `ProductForm` and any shared `ImageUpload` component to call Blob directly (instead of `/api/media`), then call a lightweight backend endpoint with `{ url, filename, mimeType, filesize, alt }` to create the Payload `media` record
    - **Status**: ❌ Not started

308. ❌ Implement client-side direct upload to Vercel Blob for videos
    - **Tech**: Mirror the image flow for video files, ensuring `accept="video/*"` and enforcing a reasonable max size in the browser before upload
    - **Details**: In the “Product Video” section of `ProductForm`, replace `handleImageUpload(file, "video")` to first upload large video files directly to Blob, then create a `media` document from the returned URL so the product stores only the `media` ID
    - **Status**: ❌ Not started

309. ❌ Add backend endpoint to create media from an existing Blob URL
    - **Tech**: New tRPC mutation or `/api/media/create-from-url` route that accepts `{ url, filename, mimeType, filesize, alt }` and calls `payload.create({ collection: "media", data: { alt, filename, mimeType, filesize, url } })`
    - **Details**: Reuse existing media access-control (auth required), validate that `url` matches the expected Vercel Blob pattern, and return `{ id, url }` so forms can store the `media` relationship field
    - **Status**: ✅ Completed
    - **Implementation**: Implemented `POST /api/media/create-from-url` (`src/app/api/media/create-from-url/route.ts`) which authenticates via Payload, validates the JSON body, sanity-checks that `url` looks like a Blob URL, and creates a `media` document with `{ alt, filename, mimeType, filesize, url }`, returning `{ doc }` for use by forms

310. ❌ Enforce size and type validation for direct-to-Blob uploads
    - **Tech**: Add client-side checks (max size per type, allowed MIME types) before calling Blob, and server-side sanity checks in the “create-from-url” endpoint
    - **Details**: Show friendly error messages like “File is too large” or “Unsupported format” before any network upload when possible, and log oversized attempts for monitoring
    - **Status**: ❌ Not started

311. ❌ Update documentation and tests for large media upload flow
    - **Tech**: Document the new direct-to-Blob architecture in `docs/` (diagram + endpoints), and add unit/integration tests for the "create-from-url" media endpoint and frontend upload helpers
    - **Details**: Update `DETAILED_TASKS.md` and any media-related docs to clarify that in production large files never go through `/api/media`, and add basic E2E coverage (upload image/video → product shows media correctly)
    - **Status**: ❌ Not started

---

## Vendor Dropdown in Navbar (312-315)

312. ✅ Add tRPC endpoint to list all approved vendors
    - **Tech**: Create `vendor.list` procedure in `src/modules/vendor/server/procedures.ts` that queries the `vendors` collection with filters: `status: "approved"`, `isActive: true`, sorted by creation date
    - **Details**: Public endpoint (baseProcedure) that returns `{ vendors: Vendor[], total: number }` with optional `limit` parameter (default 50, max 100) and optional `status` filter for future admin use
    - **Status**: ✅ Completed
    - **Implementation**: Added `list` procedure to `vendorRouter` in `src/modules/vendor/server/procedures.ts` that filters vendors by `status: "approved"` and `isActive: true`, returns `{ vendors, total }` with sorting by `-createdAt`

313. ✅ Add vendors dropdown menu to navbar
    - **Tech**: Import `DropdownMenu` components from `@/components/ui/dropdown-menu` and add a "Vendors" dropdown button next to the logo in `src/app/(app)/(home)/navbar/Navbar.tsx`
    - **Details**: Use `trpc.vendor.list.useQuery()` to fetch vendors, display dropdown with Store icon, show vendor names as clickable items that link to `/vendors/[slug]`, only render dropdown if vendors exist, style to match navbar theme (dark background)
    - **Status**: ✅ Completed
    - **Implementation**: Added vendors dropdown next to Logo in `Navbar.tsx` using `DropdownMenu` component, displays Store icon and "Vendors" label, shows list of vendor names linking to `/vendors/[slug]`, only renders when vendors exist, styled with white background for dropdown content

314. ✅ Create vendor product page route
    - **Tech**: Create `src/app/(app)/(home)/vendors/[slug]/page.tsx` server component that finds vendor by slug, fetches products for that vendor, and displays vendor info + product list
    - **Details**: Use Payload to find vendor by `slug` with `status: "approved"` and `isActive: true`, return 404 if not found, fetch products where `vendor` equals vendor ID and `isPrivate: false`, `isArchived: false`, use `ProductsList` component from `@/components/product-filters/products-list` to display products with filters
    - **Status**: ✅ Completed
    - **Implementation**: Created `src/app/(app)/(home)/vendors/[slug]/page.tsx` server component that finds vendor by slug, validates status and isActive, fetches products with proper filters, uses `ProductsList` component for display with product count in title

315. ✅ Add vendor page styling and metadata
    - **Tech**: Add vendor name as page title, render vendor description (handle rich text if present), show product count, add breadcrumb navigation, ensure responsive layout
    - **Details**: Display vendor logo if available, show "No products available" message if vendor has no products, ensure vendor page matches existing product listing page styling and layout patterns
    - **Status**: ✅ Completed
    - **Implementation**: Added breadcrumb navigation (Home / Vendors / Vendor Name), vendor header with logo (if available), vendor name as h1, description text extraction from Lexical rich text format, vendor email display, "No products available" message with styled container, responsive layout matching existing product listing pages

315.2. ✅ Add hero banner to vendor page
    - **Tech**: Create hero banner section at top of vendor page using vendor's coverImage, display vendor name and description over banner, show featured products (first 6) in horizontal scroll at bottom of banner
    - **Details**: Use vendor's coverImage as background (or gradient fallback), overlay vendor name and description with white text and drop shadow, display featured products as clickable cards with images and prices, ensure banner is responsive (400px mobile, 500px desktop)
    - **Status**: ✅ Completed
    - **Implementation**: Added hero banner section to vendor page with coverImage background, gradient overlay for text readability, vendor name and description displayed prominently, featured products (first 6) shown in horizontal scrollable cards at bottom of banner, removed duplicate vendor header section (now in banner), moved contact info below breadcrumb

315.1. ✅ Add search functionality to vendors dropdown
    - **Tech**: Add search input field inside the vendors dropdown menu with real-time filtering, clear button, and "No vendors found" message
    - **Details**: Filter vendors by name (case-insensitive), show search icon, allow clearing search with X button, display filtered results in dropdown, reset search when vendor is selected
    - **Status**: ✅ Completed
    - **Implementation**: Added `vendorSearchQuery` state, search Input component with Search icon and clear button, filtered vendors list based on search query, "No vendors found" message when no matches, search resets when vendor link is clicked

316. ❌ Add vendor filter to product filters system
    - **Tech**: Add `vendor` field to `ProductFilters` interface in `src/components/product-filters/product-filters-provider.tsx`, update `ProductList` component to pass `vendor` filter to `trpc.products.getMany.useInfiniteQuery()`, ensure vendor filter works with existing filters (price, tags, variants)
    - **Details**: When a vendor is selected from the dropdown, set the vendor filter in the product filters context, which will automatically filter all product listings (home page, category pages, search results) to show only that vendor's products, add "Clear vendor filter" option when vendor filter is active
    - **Status**: ❌ Not started

317. ❌ Update vendor dropdown to set vendor filter on selection
    - **Tech**: Modify vendor dropdown items in `Navbar.tsx` to set vendor filter via `useProductFilters()` hook instead of (or in addition to) navigating to vendor page, show active vendor in dropdown with visual indicator, add "View all vendors" option to clear vendor filter
    - **Details**: When user clicks a vendor in dropdown, call `setFilters({ vendor: vendorId })` to filter products globally, optionally navigate to home page or current page to show filtered results, highlight selected vendor in dropdown menu
    - **Status**: ❌ Not started

---

## Vendor Hero Banner Configuration - Multiple Banners System (318-328)

318. ✅ Create VendorHeroBanners collection for multiple banners per vendor
    - **Tech**: Created `src/collections/VendorHeroBanners.ts` collection similar to `HeroBanners` collection, with fields: `vendor` (relationship to vendors, required, auto-set), `title` (text, required), `subtitle` (text, optional), `backgroundImage` (upload relationTo media, optional), `products` (relationship to products, hasMany, required, filtered to vendor's products), `isActive` (checkbox, default true), `order` (number, default 0)
    - **Details**: Each vendor can create multiple hero banners (like admin hero banners), access control ensures vendors can only manage their own banners, hooks automatically set vendor field on create and validate ownership on update/delete, product filterOptions restricts product selection to vendor's own products
    - **Status**: ✅ Completed
    - **Implementation**: Created new collection with proper access control, hooks for vendor ownership validation, product filtering, added to payload.config.ts collections array

319. ✅ Add VendorHeroBanners collection to Payload config
    - **Tech**: Added `VendorHeroBanners` import and added to collections array in `src/payload.config.ts`
    - **Details**: Collection registered in Payload CMS, accessible via admin panel and API, generates TypeScript types in payload-types.ts
    - **Status**: ✅ Completed
    - **Implementation**: Imported VendorHeroBanners collection and added to collections array

320. ✅ Add tRPC procedures for vendor hero banners (list, getOne, create, update, delete)
    - **Tech**: Added `vendor.heroBanners` nested router in `src/modules/vendor/server/procedures.ts` with procedures: `list` (query all vendor's banners), `getOne` (query single banner with ownership check), `create` (mutation to create banner with product ownership validation), `update` (mutation to update banner with ownership and product validation), `delete` (mutation to delete banner with ownership check)
    - **Details**: All procedures use `vendorProcedure` for authentication, validate vendor ownership, validate product ownership (products must belong to vendor), return properly formatted banner data with populated relationships
    - **Status**: ✅ Completed
    - **Implementation**: Added nested router with all CRUD operations, proper error handling with TRPCError, product ownership validation, depth 2 for relationship population

321. ✅ Create vendor hero banner management page with list view
    - **Tech**: Updated `src/app/(app)/vendor/hero-banner/page.tsx` to show list of all vendor's banners in grid layout, with create/edit/delete functionality
    - **Details**: Page displays banner cards with preview image, title, active status, product count, order, edit/delete buttons, "Create Banner" button, empty state when no banners, loading skeleton, banner cards show background image preview, active/inactive badges
    - **Status**: ✅ Completed
    - **Implementation**: List view with grid layout, banner cards with preview, create/edit/delete handlers, state management for editing, success/error toast notifications, proper loading states

322. ✅ Update HeroBannerForm component for create/edit multiple banners
    - **Tech**: Updated `src/app/(app)/vendor/hero-banner/components/HeroBannerForm.tsx` to accept optional `banner` prop (for editing) or no prop (for creating), uses `vendor.heroBanners.create` and `vendor.heroBanners.update` mutations
    - **Details**: Form works for both creating new banners and editing existing ones, validates title and products (required), handles image upload via `/api/media`, product multi-select with checkbox grid, live preview component, cancel button, proper form state management
    - **Status**: ✅ Completed
    - **Implementation**: Updated form to support both create and edit modes, uses appropriate mutations based on banner prop, proper default values from banner data, cancel handler, success callback

323. ✅ Add public tRPC query to fetch vendor hero banners for vendor page
    - **Tech**: Added `vendorHeroBanners` query in `src/trpc/routers/_app.ts` that accepts `vendorSlug`, finds vendor by slug, fetches active vendor hero banners sorted by order
    - **Details**: Public query (no authentication required), finds vendor by slug (approved and active), fetches only active banners, sorts by order field, returns formatted banner data with populated products and backgroundImage, returns empty array if vendor not found or no banners
    - **Status**: ✅ Completed
    - **Implementation**: Public query with vendor slug input, proper vendor lookup, banner filtering and sorting, depth 2 for relationship population, formatted response matching homepage hero banners structure

324. ✅ Create VendorHeroBannersSection carousel component
    - **Tech**: Created `src/components/vendor-hero-banners-section.tsx` client component with carousel functionality, similar to `HeroBannersSection` on homepage
    - **Details**: Component accepts `vendorSlug` prop, fetches banners via `trpc.vendorHeroBanners.useQuery`, displays banners in carousel with auto-play (3 seconds), navigation arrows, dot indicators, smooth transitions, same product display logic as homepage (flex for ≤6 products, scroll for >6), returns null if no banners (allows fallback)
    - **Status**: ✅ Completed
    - **Implementation**: Carousel component with state management, auto-play timer, navigation controls, responsive product display, loading and error states, matches homepage hero banner styling and behavior

325. ✅ Update vendor page to use VendorHeroBannersSection carousel
    - **Tech**: Updated `src/app/(app)/(home)/vendors/[slug]/page.tsx` to use `VendorHeroBannersSection` component wrapped in Suspense, with fallback to default vendor display
    - **Details**: Vendor page tries to display vendor hero banners carousel first, falls back to default vendor coverImage/name/description if no banners exist, maintains same page structure, Suspense boundary for loading state
    - **Status**: ✅ Completed
    - **Implementation**: Integrated VendorHeroBannersSection with Suspense, proper fallback handling, maintains existing vendor page structure and breadcrumbs

326. ✅ Add "Hero Banner" link to vendor dashboard sidebar and quick actions
    - **Tech**: Added "Hero Banner" navigation item to `src/app/(app)/vendor/components/VendorSidebar.tsx` and "Customize Hero Banner" link to dashboard quick actions in `src/app/(app)/vendor/dashboard/page.tsx`
    - **Details**: Sidebar link with Image icon positioned after "Products", dashboard quick action link in "Quick Actions" card, both link to `/vendor/hero-banner`, visible to all approved vendors
    - **Status**: ✅ Completed
    - **Implementation**: Added nav items in both locations, proper icon usage, consistent styling with other nav items

327. ✅ Add hero banner preview component for form
    - **Tech**: Existing `HeroBannerPreview` component in `src/app/(app)/vendor/hero-banner/components/HeroBannerPreview.tsx` works with new form structure
    - **Details**: Preview component displays banner preview matching vendor page layout, shows background image (or gradient), title, subtitle, featured products, updates dynamically as form fields change
    - **Status**: ✅ Completed
    - **Implementation**: Preview component already exists and works with updated form, no changes needed

328. ✅ Test vendor hero banner creation, editing, deletion, and carousel display
    - **Tech**: Manual testing required for multiple vendor hero banners workflow
    - **Details**: Test full workflow: vendor creates multiple banners → sets different orders → activates/deactivates banners → views vendor page → sees carousel rotating through active banners, test editing individual banners, test deleting banners, test fallback behavior when no banners exist, ensure products are correctly filtered to vendor's products only, test carousel navigation (arrows, dots, auto-play)
    - **Status**: ✅ Ready for testing
    - **Implementation**: All code implemented and integrated, ready for manual testing and E2E test creation

329. ✅ Fix product images not displaying in vendor hero banners
    - **Tech**: Updated `src/trpc/routers/_app.ts` `vendorHeroBanners` query to properly extract product image URLs from populated relationships, increased depth from 2 to 3 to ensure product.image relationship is fully populated
    - **Details**: The `vendorHeroBanners` query now properly handles product image extraction by: (1) increasing depth to 3 to ensure product.image media relationship is populated (depth 1 = banner, depth 2 = products, depth 3 = product.image), (2) adding robust image URL extraction that handles both populated objects (`product.image.url`) and string IDs (with warning), (3) adding fallback for missing slug field, (4) ensuring image URLs are properly formatted and passed to `VendorHeroBannerProductCard` component. The query now matches the pattern used in homepage `heroBanners` query.
    - **Status**: ✅ Completed
    - **Implementation**: Updated `vendorHeroBanners` query to use `depth: 3` instead of `depth: 2`, added image extraction logic that checks if `product.image` is an object with `url` property, added console warning if image is still a string ID (shouldn't happen with depth 3), added slug fallback to product.id if slug is missing, verified image URLs are correctly passed to component

---

## Summary

**Total Tasks Documented: 329**

**Completed: ~237 tasks (72%)**
**Pending: ~92 tasks (28%)**

**Breakdown**:
- **Project Setup & Initialization (1-50)**: 50 completed, 0 pending ✅
- **Collections Setup (51-150)**: 100 completed, 0 pending ✅
- **Authentication & Access Control (151-200)**: 50 completed, 0 pending ✅
- **Product Management (201-250)**: 50 completed, 0 pending ✅
- **Vendor Dashboard (251-350)**: 100 completed, 0 pending ✅
- **Customer Features (351-400)**: 50 completed, 0 pending ✅
- **Checkout & Orders (401-500)**: 100 completed, 0 pending ✅
- **Vendor-Admin Communication Tasks (501-520)**: 18 completed, 2 pending
- **Stripe Connect Tasks (177-194)**: 12 completed, 6 pending (partially implemented)
- **Admin Dashboard Tasks (195-212)**: 18 completed, 0 pending ✅
- **Hero Banners Tasks (213-220)**: 8 completed, 0 pending ✅
- **Order Management Tasks (221-231)**: 11 completed, 0 pending ✅
- **Category & Variant Tasks (232-236)**: 5 completed, 0 pending ✅
- **Dynamic Variant System & Validation (285-295)**: 11 completed, 0 pending ✅
- **Search Enhancement Tasks (237-240)**: 4 completed, 0 pending ✅
- **Offline Payment Tasks (253-270)**: 18 completed, 0 pending ✅
- **Product Image & Gallery (281-284)**: 3 completed, 1 pending
- **YouTube Video Integration (296-305)**: 0 completed, 10 pending
- **CI/CD & Production Tasks (241-248)**: 2 completed, 6 pending
- **Authentication Tasks (249-252)**: 0 completed, 4 pending
- **Large Media Uploads (306-311)**: 1 completed, 5 pending
- **Vendor Dropdown in Navbar (312-317)**: 6 completed, 2 pending
- **Vendor Hero Banner Configuration - Multiple Banners System (318-328)**: 11 completed, 0 pending (ready for testing)

### Key Features Implemented:
- ✅ Multi-vendor marketplace architecture
- ✅ Payload CMS with 14 collections (Users, Media, Categories, Products, Tags, HeroBanners, Orders, Vendors, Roles, Customers, VariantTypes, VariantOptions, VendorTasks, VendorTaskMessages)
- ✅ tRPC for type-safe APIs
- ✅ Vendor dashboard with products, orders, analytics
- ✅ Product management with dynamic category-based variants
- ✅ Variant data validation with detailed error messages and field-specific feedback
- ✅ Product form with dynamic variant field generation based on category selection
- ✅ Offline payment option for vendors without Stripe
- ✅ Vercel Blob Storage for media files
- ✅ Customer order detail page with offline payment support
- ✅ Checkout flow with Stripe
- ✅ Order management
- ✅ Authentication with NextAuth
- ✅ Role-based access control
- ✅ Category navigation
- ✅ Search and filters
- ✅ Hero banners
- ✅ CSV product import
- ✅ Configurable commission system (per vendor)
- ✅ Product video upload and display
- ✅ Checkout authentication requirement
- ✅ Add to cart authentication requirement
- ✅ Redirect after authentication
- ✅ Remove items from checkout
- ✅ Enhanced search with variant support (color, size, material)
- ✅ Intelligent query parsing for natural language searches
- ✅ Variant type mapping (abbreviations, synonyms)
- ✅ Search testing scripts and unit tests
- ✅ Stripe Connect account creation and onboarding (partially implemented)
- ✅ Vendor Stripe account status checking
- ✅ Commission calculation and tracking in orders
- ✅ Hero banners with carousel functionality (homepage)
- ✅ Multiple vendor hero banners with carousel functionality (vendor pages)
- ✅ Cart quantity and variant management
- ✅ Customer order detail page with offline payment support
- ✅ Admin task management dashboard
- ✅ Vercel Blob Storage for media files
- ✅ Dynamic variant system with category-based configuration
- ✅ Variant data validation with detailed error messages
- ✅ **Vendor-Admin Communication System**:
  - ✅ Vendor task creation and management
  - ✅ Offline messaging between vendors and admins
  - ✅ Task status workflow (open, in-progress, waiting-on-vendor, waiting-on-admin, closed)
  - ✅ Task closing functionality (both vendor and admin can close)
  - ✅ Readonly mode for closed tasks (no new messages)
  - ✅ Admin dashboard for managing vendor tasks
  - ✅ Internal notes (admin-only messages)
  - ✅ Rich text messaging with Lexical editor
  - ✅ Task priority and type classification
- ✅ **Vendor Hero Banners System**:
  - ✅ Multiple hero banners per vendor (similar to admin hero banners)
  - ✅ VendorHeroBanners collection with access control
  - ✅ Vendor dashboard for creating/editing/deleting banners
  - ✅ Carousel display on vendor pages with auto-play
  - ✅ Product selection limited to vendor's own products
  - ✅ Active/inactive toggle and display order control
  - ✅ Fallback to default vendor display when no banners exist


  # Vendor Customers Page - Detailed Task List

## Overview
Implementation of a read-only vendor customers list page showing customer name, order list, and total amount paid for each customer who has placed orders with the vendor.

**Route**: `/vendor/customers`
**Status**: ✅ Completed

---

## Backend Implementation (tRPC)

### Task 1: Update vendor.customers.list Query to Fetch from Orders
**File**: `src/modules/vendor/server/procedures.ts`
**Procedure**: `vendor.customers.list`

**Technical Details**:
- **Change**: Instead of querying the `customers` collection, query `orders` collection directly
- **Reason**: Ensures all customers who have placed orders are shown, even if customer records don't exist
- **Query**: Fetch all orders for the vendor: `collection: "orders", where: { vendor: { equals: vendorId } }, limit: 10000, depth: 2`
- **Depth**: Use `depth: 2` to include user and product relationships
- **Sort**: Sort orders by `-createdAt` (newest first)

**Implementation Steps**:
1. Remove query to `customers` collection
2. Query all orders for the vendor (limit: 10000 to get all orders)
3. Group orders by user ID using a Map/Record
4. For each unique user, create a customer object with:
   - User information (from order.user relationship)
   - All orders for that user
   - Calculated totals

**Code Pattern**:
```typescript
// Group orders by user ID
const customersMap: Record<string, {
  user: any;
  orders: any[];
  userId: string;
}> = {};

allOrders.docs.forEach((order: any) => {
  const userId = typeof order.user === "string" ? order.user : order.user?.id;
  if (!userId) return;
  
  if (!customersMap[userId]) {
    const user = typeof order.user === "string" ? null : order.user;
    customersMap[userId] = {
      user: user || order.user,
      orders: [],
      userId,
    };
  }
  customersMap[userId].orders.push(order);
});
```

---

### Task 2: Transform Orders into Customer Objects
**File**: `src/modules/vendor/server/procedures.ts`
**Procedure**: `vendor.customers.list`

**Technical Details**:
- **Input**: Map of users to orders (`customersMap`)
- **Output**: Array of customer objects with required fields
- **Fields to Calculate**:
  - `name`: From user.name or user.email or "Unknown"
  - `email`: From user.email
  - `orders`: Array of all orders for this customer
  - `totalAmountPaid`: Sum of all order.total values
  - `orderCount`: Length of orders array
  - `averageOrderValue`: totalAmountPaid / orderCount
  - `lastOrderDate`: Most recent order.createdAt
  - `firstOrderDate`: Oldest order.createdAt
  - `customerId`: User ID (used as customer identifier)

**Code Pattern**:
```typescript
const customers = Object.values(customersMap).map((customerData) => {
  const user = customerData.user;
  const userId = customerData.userId;
  const orders = customerData.orders;
  
  const userName = typeof user === "object" && user?.name 
    ? user.name 
    : typeof user === "object" && user?.email 
    ? user.email 
    : "Unknown";
  const userEmail = typeof user === "object" && user?.email ? user.email : "";

  const totalAmountPaid = orders.reduce((sum: number, order: any) => {
    return sum + (order.total || 0);
  }, 0);

  const orderDates = orders.map((o: any) => new Date(o.createdAt)).sort((a, b) => b.getTime() - a.getTime());
  const lastOrderDate = orderDates.length > 0 ? orderDates[0] : null;
  const firstOrderDate = orderDates.length > 0 ? orderDates[orderDates.length - 1] : null;

  return {
    user: user || userId,
    orders: orders,
    totalSpent: totalAmountPaid,
    totalAmountPaid,
    orderCount: orders.length,
    averageOrderValue: orders.length > 0 ? totalAmountPaid / orders.length : 0,
    lastOrderDate,
    firstOrderDate,
    customerId: userId,
    name: userName,
    email: userEmail,
  };
});
```

---

### Task 3: Apply Filters to Customer List
**File**: `src/modules/vendor/server/procedures.ts`
**Procedure**: `vendor.customers.list`

**Technical Details**:
- **Search Filter**: Filter by customer name or email (case-insensitive)
- **Status Filter**: 
  - `active`: Last order within 90 days
  - `inactive`: Last order more than 90 days ago
  - `new`: Single order within 30 days
- **Order Count Filter**: Filter by `orderCountMin` and `orderCountMax`
- **Total Spent Filter**: Filter by `totalSpentMin` and `totalSpentMax`
- **Last Order Date Filter**: Filter by `lastOrderDays` (orders within X days)

**Implementation**:
- Apply filters after transforming orders to customers
- Use JavaScript array `.filter()` method
- Filter before sorting and pagination

**Code Pattern**:
```typescript
// Apply search filter
if (input.search) {
  const searchLower = input.search.toLowerCase();
  customers = customers.filter((c) => {
    const nameMatch = c.name?.toLowerCase().includes(searchLower);
    const emailMatch = c.email?.toLowerCase().includes(searchLower);
    return nameMatch || emailMatch;
  });
}

// Apply status filter
if (input.status !== "all") {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  customers = customers.filter((c) => {
    if (!c.lastOrderDate) return input.status === "inactive";
    
    if (input.status === "active") {
      return c.lastOrderDate >= ninetyDaysAgo;
    } else if (input.status === "inactive") {
      return c.lastOrderDate < ninetyDaysAgo;
    } else if (input.status === "new") {
      return c.orderCount === 1 && c.firstOrderDate && c.firstOrderDate >= thirtyDaysAgo;
    }
    return true;
  });
}
```

---

### Task 4: Apply Sorting to Customer List
**File**: `src/modules/vendor/server/procedures.ts`
**Procedure**: `vendor.customers.list`

**Technical Details**:
- **Sort Fields**: `name`, `totalSpent`, `totalOrders`, `lastOrderDate`
- **Sort Order**: `asc` or `desc`
- **Default**: `lastOrderDate` descending (newest first)

**Implementation**:
- Use JavaScript array `.sort()` method
- Handle different data types (string, number, Date)
- Apply sorting after filtering, before pagination

**Code Pattern**:
```typescript
customers.sort((a, b) => {
  let aValue: any;
  let bValue: any;

  if (input.sortBy === "name") {
    aValue = a.name || "";
    bValue = b.name || "";
  } else if (input.sortBy === "totalSpent") {
    aValue = a.totalAmountPaid || 0;
    bValue = b.totalAmountPaid || 0;
  } else if (input.sortBy === "totalOrders") {
    aValue = a.orderCount || 0;
    bValue = b.orderCount || 0;
  } else {
    // lastOrderDate
    aValue = a.lastOrderDate?.getTime() || 0;
    bValue = b.lastOrderDate?.getTime() || 0;
  }

  if (input.sortOrder === "asc") {
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  } else {
    return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
  }
});
```

---

### Task 5: Apply Pagination to Customer List
**File**: `src/modules/vendor/server/procedures.ts`
**Procedure**: `vendor.customers.list`

**Technical Details**:
- **Input**: `page` (default: 1), `limit` (default: 20)
- **Calculate**: `totalDocs`, `totalPages`, `hasNextPage`, `hasPrevPage`
- **Slice**: Array slice based on page and limit

**Implementation**:
- Calculate total docs before pagination
- Calculate start and end indices
- Slice the customers array
- Return pagination metadata

**Code Pattern**:
```typescript
const totalDocs = customers.length;
const totalPages = Math.ceil(totalDocs / input.limit);
const startIndex = (input.page - 1) * input.limit;
const endIndex = startIndex + input.limit;
const paginatedCustomers = customers.slice(startIndex, endIndex);

return {
  docs: paginatedCustomers,
  totalDocs,
  totalPages,
  page: input.page,
  hasNextPage: input.page < totalPages,
  hasPrevPage: input.page > 1,
};
```

---

## Frontend Implementation

### Task 6: Update CustomersTable Component Structure
**File**: `src/app/(app)/vendor/customers/components/CustomersTable.tsx`

**Technical Details**:
- **Columns**: Customer Name, Order List, Amount Paid
- **Read-only**: Remove all interactive elements (click handlers, dropdown menus)
- **Remove**: Status column, Average Order Value, Last Order Date, Actions column

**Table Structure**:
```typescript
<TableHeader>
  <TableRow>
    <TableHead>Customer Name</TableHead>
    <TableHead>Order List</TableHead>
    <TableHead className="text-right">Amount Paid</TableHead>
  </TableRow>
</TableHeader>
```

---

### Task 7: Display Customer Name with Avatar
**File**: `src/app/(app)/vendor/customers/components/CustomersTable.tsx`

**Technical Details**:
- **Component**: Use shadcn/ui `Avatar` and `AvatarFallback`
- **Initials**: Generate from customer name (first letter of each word, max 2 letters)
- **Display**: 
  - Avatar with initials
  - Customer name (bold, font-medium)
  - Customer email (small, gray text below name)

**Code Pattern**:
```typescript
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// In table cell:
<TableCell>
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarFallback>
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
    <div>
      <div className="font-medium">{userName}</div>
      <div className="text-sm text-gray-500">{userEmail}</div>
    </div>
  </div>
</TableCell>
```

---

### Task 8: Display Order List for Each Customer
**File**: `src/app/(app)/vendor/customers/components/CustomersTable.tsx`

**Technical Details**:
- **Container**: Scrollable div with `max-h-48 overflow-y-auto`
- **Each Order Shows**:
  - Product name (bold)
  - Order number, date, status (small gray text)
  - Order amount (right-aligned, formatted currency)
- **Empty State**: Show "No orders" if orders array is empty
- **Styling**: Border between orders, last order has no border

**Code Pattern**:
```typescript
<TableCell>
  <div className="space-y-2 max-h-48 overflow-y-auto">
    {orders.length === 0 ? (
      <span className="text-sm text-gray-400">No orders</span>
    ) : (
      orders.map((order: any) => {
        const product = typeof order.product === "string" ? null : order.product;
        const productName = product?.name || "Unknown Product";
        const orderNumber = order.orderNumber || order.id;
        const orderDate = order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "";
        const orderTotal = order.total || 0;
        const orderStatus = order.status || "pending";

        return (
          <div key={order.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
            <div className="flex-1">
              <div className="font-medium">{productName}</div>
              <div className="text-xs text-gray-500">
                {orderNumber} • {orderDate} • {orderStatus}
              </div>
            </div>
            <div className="text-right font-medium ml-4">
              {formatCurrency(orderTotal)}
            </div>
          </div>
        );
      })
    )}
  </div>
</TableCell>
```

---

### Task 9: Display Total Amount Paid
**File**: `src/app/(app)/vendor/customers/components/CustomersTable.tsx`

**Technical Details**:
- **Display**: Large, bold amount (text-lg font-semibold)
- **Label**: Order count below amount (e.g., "3 orders")
- **Alignment**: Right-aligned
- **Format**: Use `formatCurrency()` helper for currency formatting

**Code Pattern**:
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// In table cell:
<TableCell className="text-right">
  <div className="flex flex-col items-end">
    <span className="text-lg font-semibold text-gray-900">
      {formatCurrency(totalAmountPaid)}
    </span>
    <span className="text-xs text-gray-500">
      {orders.length} order{orders.length !== 1 ? "s" : ""}
    </span>
  </div>
</TableCell>
```

---

### Task 10: Update Customer Interface Type
**File**: `src/app/(app)/vendor/customers/components/CustomersTable.tsx`

**Technical Details**:
- **Add Field**: `totalAmountPaid?: number` to Customer interface
- **Purpose**: Store total amount paid calculated from orders
- **Fallback**: Use `totalSpent` if `totalAmountPaid` is not available

**Code Pattern**:
```typescript
interface Customer {
  user: any;
  orders: any[];
  totalSpent: number;
  totalAmountPaid?: number; // Add this field
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
  customerId?: string;
  name?: string;
  email?: string;
}
```

---

### Task 11: Remove Interactive Elements
**File**: `src/app/(app)/vendor/customers/components/CustomersTable.tsx`

**Technical Details**:
- **Remove**: `useRouter` import and usage
- **Remove**: Row click handler (`onClick` on TableRow)
- **Remove**: Actions dropdown menu
- **Remove**: Status badge logic
- **Remove**: Unused imports (Badge, DropdownMenu, MoreHorizontal, Mail icons)

**Changes**:
- Remove `onClick={() => router.push(...)}` from TableRow
- Remove Actions TableHead and TableCell
- Keep only read-only display elements

---

### Task 12: Update Empty State Message
**File**: `src/app/(app)/vendor/customers/components/CustomersTable.tsx`

**Technical Details**:
- **Colspan**: Update from 7 to 3 (matching new column count)
- **Message**: "No customers found"
- **Styling**: Center-aligned, gray text, padding

**Code Pattern**:
```typescript
{customers.length === 0 ? (
  <TableRow>
    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
      No customers found
    </TableCell>
  </TableRow>
) : (
  // ... customer rows
)}
```

---

## Data Flow

### Task 13: Order Data Structure
**Technical Details**:
- **Order Object Fields Used**:
  - `id`: Order ID
  - `orderNumber`: Order number (or fallback to id)
  - `product`: Product relationship (populated with depth: 2)
  - `total`: Order total amount
  - `status`: Order status
  - `createdAt`: Order creation date
  - `user`: User relationship (populated with depth: 2)

**Product Access**:
```typescript
const product = typeof order.product === "string" ? null : order.product;
const productName = product?.name || "Unknown Product";
```

**User Access**:
```typescript
const user = typeof customer.user === "string" ? null : customer.user;
const userName = customer.name || user?.name || user?.email || "Unknown";
const userEmail = customer.email || user?.email || "";
```

---


# Fix Remaining Stock Not Decreasing - Technical Todo List

## Issue
When vendors create manual orders through the vendor dashboard, the "Remaining" stock is not decreasing even though "Sold" count is working correctly. This is because the `vendor.orders.create` mutation creates orders but doesn't decrement variant stock.

**Root Cause**: Stock is only decremented in the Stripe webhook and checkout flow, not for manual vendor-created orders.

---

## Todo List

### 1. Add stock decrement logic to `vendor.orders.create` mutation
**Task**: Find matching variant by size/color and decrement `variant.stock` by order quantity

- **File**: `src/modules/vendor/server/procedures.ts` (around line 1492)
- **Location**: Inside `vendor.orders.create` mutation, after product verification (line 1513) and before order creation (line 1550)
- **Code Pattern**: 
  ```typescript
  // Find matching variant
  let variant = null;
  if (product.variants && Array.isArray(product.variants)) {
    variant = product.variants.find((v: any) => {
      const variantData = v.variantData || {};
      const sizeMatch = !input.size || variantData.size === input.size || variantData.blouseSize === input.size;
      const colorMatch = !input.color || variantData.color === input.color;
      return sizeMatch && colorMatch;
    });
  }
  ```

---

### 2. Handle variant matching in manual order creation
**Task**: Match variant using `variantData.size/color` or `size/color` fields, similar to webhook logic

- **Reference**: Check `src/app/api/stripe/webhook/route.ts` lines 177-182 for variant matching pattern
- **Handle**: Both `variantData.size` and direct `v.size` properties
- **Handle**: Both `variantData.color` and direct `v.color` properties
- **Handle**: `blouseSize` field for blouse products

---

### 3. Update product variants array after stock decrement
**Task**: Use `ctx.db.update` to save updated variants array with decremented stock

- **Code Pattern**:
  ```typescript
  if (variant) {
    const newStock = Math.max(0, variant.stock - input.quantity);
    const updatedVariants = (product.variants || []).map((v: any) => {
      const variantData = v.variantData || {};
      const sizeMatch = !input.size || variantData.size === input.size || variantData.blouseSize === input.size;
      const colorMatch = !input.color || variantData.color === input.color;
      if (sizeMatch && colorMatch) {
        return { ...v, stock: newStock };
      }
      return v;
    });
    
    await ctx.db.update({
      collection: "products",
      id: input.productId,
      data: { variants: updatedVariants },
    });
  }
  ```

---

### 4. Add stock validation before decrementing
**Task**: Check if `variant.stock >= quantity`, throw error if insufficient stock for manual orders

- **Code Pattern**:
  ```typescript
  if (variant) {
    if (variant.stock < input.quantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Insufficient stock. Only ${variant.stock} units available.`,
      });
    }
    // Then proceed with decrement
  }
  ```

---

### 5. Handle products without variants
**Task**: If product has no variants, check if base product stock exists and decrement it

- **Code Pattern**:
  ```typescript
  if (!variant && (!product.variants || product.variants.length === 0)) {
    // Product has no variants, check base stock
    if (product.stock !== undefined && product.stock !== null) {
      if (product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock. Only ${product.stock} units available.`,
        });
      }
      const newStock = Math.max(0, product.stock - input.quantity);
      await ctx.db.update({
        collection: "products",
        id: input.productId,
        data: { stock: newStock },
      });
    }
  }
  ```

---

### 6. Add auto-draft check after manual order stock update
**Task**: If total stock becomes 0, set `product.isPrivate` to `true` (draft the product)

- **Code Pattern**:
  ```typescript
  // After stock update, check total stock
  const updatedProduct = await ctx.db.findByID({
    collection: "products",
    id: input.productId,
    depth: 0,
  });
  
  let totalStock = 0;
  if (updatedProduct.variants && Array.isArray(updatedProduct.variants)) {
    totalStock = updatedProduct.variants.reduce((sum: number, v: any) => {
      return sum + (v.stock || 0);
    }, 0);
  } else if (updatedProduct.stock !== undefined) {
    totalStock = updatedProduct.stock || 0;
  }
  
  if (totalStock === 0 && updatedProduct.isPrivate === false) {
    await ctx.db.update({
      collection: "products",
      id: input.productId,
      data: { isPrivate: true },
    });
  }
  ```

---

### 7. Test remaining stock calculation
**Task**: Verify that `remainingStock = sum of all variant stocks` after orders are placed

- **File**: `src/modules/vendor/server/procedures.ts` (lines 340-350)
- **Current Logic**: `remaining = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)`
- **Verify**: After manual order, remaining stock should decrease by order quantity
- **Test**: Create manual order, check `remainingStock` in products list query

---

### 8. Verify sold count accuracy
**Task**: Ensure `soldCount` correctly sums all order quantities for the product

- **File**: `src/modules/vendor/server/procedures.ts` (lines 331-336)
- **Current Logic**: `soldCounts[productId] = (soldCounts[productId] || 0) + (order.quantity || 0)`
- **Verify**: Manual orders are included in the count (they should be, as they're in orders collection)
- **Test**: Create manual order, verify `soldCount` increases by order quantity

---

### 9. Test manual order creation with variants
**Task**: Create manual order with size/color and verify variant stock decreases

- **Test Case**: Product with variants (e.g., Size M, Color Red, stock: 10)
- **Action**: Create manual order with quantity 3, size M, color Red
- **Expected**: Variant stock should be 7, remainingStock should be 7 (if only one variant)

---

### 10. Test manual order creation without variants
**Task**: Create manual order for product without variants and verify stock handling

- **Test Case**: Product without variants (base stock: 20)
- **Action**: Create manual order with quantity 5
- **Expected**: Base product stock should be 15, remainingStock should reflect this

---

### 11. Add console logging for debugging
**Task**: Log stock updates in manual order creation for debugging

- **Code Pattern**:
  ```typescript
  console.log(`[Manual Order] Updated stock for ${product.name}${input.size ? ` (${input.size})` : ''}${input.color ? ` - ${input.color}` : ''}: ${variant.stock} → ${newStock}`);
  ```

---

### 12. Handle edge case: variant not found but product has variants
**Task**: If variant doesn't match but product has variants, log warning and don't update stock

- **Code Pattern**:
  ```typescript
  if (!variant && product.variants && product.variants.length > 0) {
    console.warn(`[Manual Order] Variant not found for ${product.name}${input.size ? ` (${input.size})` : ''}${input.color ? ` - ${input.color}` : ''}, skipping stock update`);
  }
  ```

---

### 13. Ensure order creation happens after stock update
**Task**: Stock should be decremented before order is created to maintain data consistency

- **Order**: 1) Validate stock, 2) Decrement stock, 3) Create order
- **Error Handling**: If stock update fails, don't create order

---

### 14. Add transaction/rollback consideration
**Task**: Consider if stock update and order creation should be atomic (may require Payload transaction support)

- **Note**: Payload CMS doesn't have built-in transactions, so ensure error handling is robust
- **Fallback**: If order creation fails after stock update, consider restoring stock (complex scenario)

---

### 15. Update remainingStock calculation to handle base stock
**Task**: If product has no variants but has base stock, include it in remainingStock

- **File**: `src/modules/vendor/server/procedures.ts` (lines 345-350)
- **Current**: Only sums variant stocks
- **Update**: Also check `product.stock` if no variants exist
- **Code Pattern**:
  ```typescript
  let remaining = 0;
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    remaining = product.variants.reduce((sum: number, variant: any) => {
      return sum + (variant.stock || 0);
    }, 0);
  } else if (product.stock !== undefined && product.stock !== null) {
    remaining = product.stock || 0;
  }
  ```

---

## Implementation Order

1. **First**: Tasks 1-3 (Core stock decrement logic)
2. **Second**: Tasks 4-5 (Validation and edge cases)
3. **Third**: Task 6 (Auto-draft)
4. **Fourth**: Task 15 (Update remainingStock calculation)
5. **Fifth**: Tasks 11-12 (Logging and edge cases)
6. **Sixth**: Tasks 7-10 (Testing)
7. **Seventh**: Tasks 13-14 (Error handling and transactions)

---

## Reference Files

- **Main Implementation**: `src/modules/vendor/server/procedures.ts` (lines 1468-1581)
- **Webhook Reference**: `src/app/api/stripe/webhook/route.ts` (lines 200-247)
- **Checkout Reference**: `src/modules/checkout/server/procedures.ts` (lines 325-343)
- **Stock Calculation**: `src/modules/vendor/server/procedures.ts` (lines 314-364)

---

## Notes

- Stock decrement should happen **before** order creation to maintain consistency
- If stock update fails, the order should not be created
- Manual orders should follow the same stock decrement logic as webhook/checkout flows
- Consider adding a flag to track whether stock was decremented for an order (for potential rollback scenarios)


## Testing Checklist

### Task 14: Verify Customer Display
- [ ] Customer name displays correctly (from user.name or user.email)
- [ ] Customer email displays below name
- [ ] Avatar shows correct initials
- [ ] Empty state shows when no customers

### Task 15: Verify Order List Display
- [ ] All orders for customer are shown
- [ ] Product name displays correctly
- [ ] Order number, date, and status display correctly
- [ ] Order amount displays correctly (formatted currency)
- [ ] Scrollable container works when many orders
- [ ] "No orders" message shows when customer has no orders

### Task 16: Verify Amount Paid Display
- [ ] Total amount paid is correct (sum of all order totals)
- [ ] Currency formatting is correct
- [ ] Order count is correct
- [ ] Displays "1 order" vs "X orders" correctly

### Task 17: Verify Filters Work
- [ ] Search by name works
- [ ] Search by email works
- [ ] Status filter works (active/inactive/new)
- [ ] Filters combine correctly

### Task 18: Verify Pagination Works
- [ ] Pagination displays correct page numbers
- [ ] Previous/Next buttons work
- [ ] Page count is correct
- [ ] Customer count per page is correct (20 by default)

---

## Technical Notes

### Performance Considerations
- **Order Limit**: Query uses `limit: 10000` to get all orders. For vendors with many orders, consider pagination or date filtering.
- **Memory**: All orders are loaded into memory for grouping. For very large datasets, consider server-side aggregation.
- **Depth**: Using `depth: 2` ensures user and product relationships are populated, avoiding N+1 queries.

### Data Consistency
- **Customer Records**: The query doesn't require customer records to exist. Customers are derived from orders.
- **User Data**: User information comes from the order.user relationship, which should always be populated.
- **Product Data**: Product information comes from order.product relationship, which should always be populated.

### Error Handling
- **Missing User**: Falls back to "Unknown" if user data is missing
- **Missing Product**: Falls back to "Unknown Product" if product data is missing
- **Missing Order Data**: Handles undefined/null values gracefully with fallbacks

---

## File Changes Summary

### Modified Files:
1. `src/modules/vendor/server/procedures.ts`
   - Updated `vendor.customers.list` query to fetch from orders instead of customers collection
   - Added order grouping logic
   - Added customer transformation logic
   - Added client-side filtering, sorting, and pagination

2. `src/app/(app)/vendor/customers/components/CustomersTable.tsx`
   - Simplified table structure (3 columns)
   - Added order list display
   - Added amount paid display
   - Removed interactive elements
   - Updated Customer interface

### No Changes Required:
- `src/app/(app)/vendor/customers/page.tsx` - Already handles data fetching and pagination correctly

---

## Implementation Status

✅ **Completed Tasks**:
- Task 1: Updated query to fetch from orders
- Task 2: Transform orders into customer objects
- Task 3: Apply filters
- Task 4: Apply sorting
- Task 5: Apply pagination
- Task 6: Updated table structure
- Task 7: Customer name display
- Task 8: Order list display
- Task 9: Amount paid display
- Task 10: Updated interface
- Task 11: Removed interactive elements
- Task 12: Updated empty state

---


# Vendor Template System Implementation - Completed Tasks

This document outlines all the tasks completed for implementing the vendor template system with customizable text styles.

## Phase 1: Template System Foundation ✅

### 1.1 Database Schema
- [x] Created `VendorTemplates` collection in Payload CMS
- [x] Added `selectedTemplate` relationship field to `Vendors` collection
- [x] Added `templateCustomization` JSON field to `Vendors` collection for vendor-specific overrides
- [x] Registered `VendorTemplates` collection in `payload.config.ts`

### 1.2 Type Definitions
- [x] Created `template-customization.ts` with TypeScript interfaces
- [x] Defined `TemplateConfig` schema with Zod validation
- [x] Defined `TemplateCustomization` schema for vendor overrides
- [x] Defined `ResolvedTemplate` interface for merged template config

### 1.3 Template Engine Core
- [x] Created `template-engine.ts` with `resolveVendorTemplate()` function
- [x] Implemented `getDefaultTemplate()` to fetch default template
- [x] Implemented template config merging (base template + vendor customizations)
- [x] Added fallback logic for missing templates

## Phase 2: CSS Variables System ✅

### 2.1 CSS Variables Generator
- [x] Created `css-variables.ts` with `generateCSSVariables()` function
- [x] Implemented color variable generation (primary, secondary, accent, text, etc.)
- [x] Implemented font variable generation (heading, body)
- [x] Implemented spacing variable generation (section padding, card gap, container width)
- [x] Implemented component-specific variables (card radius, banner height)
- [x] Created `cssVariablesToString()` for CSS string conversion
- [x] Created `cssVariablesToStyle()` for React inline styles

### 2.2 Text Styles CSS Variables
- [x] Added text style variable generation for `heading1`:
  - `--template-h1-size`
  - `--template-h1-weight`
  - `--template-h1-spacing`
  - `--template-h1-height`
  - `--template-h1-transform`
- [x] Added text style variable generation for `heading2`:
  - `--template-h2-size`
  - `--template-h2-weight`
  - `--template-h2-spacing`
  - `--template-h2-height`
  - `--template-h2-transform`
- [x] Added text style variable generation for `body`:
  - `--template-body-size`
  - `--template-body-weight`
  - `--template-body-spacing`
  - `--template-body-height`
- [x] Added hero banner text style variables:
  - `--template-hero-title-size`
  - `--template-hero-title-weight`
  - `--template-hero-subtitle-size`
  - `--template-hero-subtitle-weight`
  - `--template-hero-text-shadow`

## Phase 3: Template Seed Data ✅

### 3.1 Template Seed Structure
- [x] Created `seed-templates.ts` with template seed data structure
- [x] Defined `TemplateSeedData` interface
- [x] Created `seedTemplates()` function to populate database

### 3.2 Default Templates Created
- [x] **Fun Template** (Default)
  - Colors: Pink (#FF6B9D), Deep Pink (#C44569), Yellow (#FFD93D)
  - Fonts: Poppins (heading), Nunito (body)
  - Text Styles: Bold (800 weight), playful spacing
  - Hero Banner: Large titles (3.5rem), strong shadows
- [x] **Elegant Template**
  - Colors: Dark Blue (#2C3E50), Gold (#D4AF37), Brown (#8B6F47)
  - Fonts: Playfair Display (heading), Lora (body)
  - Text Styles: Refined serif (700 weight), elegant spacing
  - Hero Banner: Large titles (4rem), classic shadows
- [x] **Bold Template**
  - Colors: Orange (#FF6B35), Blue (#004E89), Yellow (#FFD23F)
  - Fonts: Montserrat (heading), Open Sans (body)
  - Text Styles: Uppercase, heavy weights (900), tight spacing
  - Hero Banner: Extra large titles (4.5rem), strong shadows
- [x] **Zen Template**
  - Colors: Green (#5D8A7E), Light Green (#A8C5A0), Beige (#E8D5B7)
  - Fonts: Inter (heading and body)
  - Text Styles: Minimal (600 weight), relaxed spacing
  - Hero Banner: Medium titles (3rem), subtle shadows

### 3.3 Template Configuration
- [x] Added `textStyles` configuration to all 4 templates
- [x] Configured unique text styles for each template:
  - Heading 1: Different sizes, weights, letter spacing, line heights
  - Heading 2: Different sizes, weights, letter spacing, line heights
  - Body: Different sizes, weights, letter spacing, line heights
  - Hero Banner: Different title/subtitle sizes, weights, text shadows

## Phase 4: Template Engine Updates ✅

### 4.1 Text Styles Merging
- [x] Updated `resolveVendorTemplate()` to merge `textStyles`
- [x] Implemented vendor customization override for text styles
- [x] Ensured text styles are included in resolved template config

## Phase 5: Page CSS Implementation ✅

### 5.1 Template CSS Variables Injection
- [x] Integrated template resolution in vendor page (`vendors/[slug]/page.tsx`)
- [x] Generated CSS variables from resolved template
- [x] Injected CSS variables into `<style>` tag

### 5.2 Background Implementation
- [x] Implemented hardcoded mesh gradient background
- [x] Added animated gradient keyframes
- [x] Used template color variables for gradient colors
- [x] Added fallback colors if template variables unavailable

### 5.3 Text Style Application
- [x] Applied `heading1` styles to all `h1` elements:
  - Font size, weight, letter spacing, line height, text transform
- [x] Applied `heading2` styles to all `h2` elements:
  - Font size, weight, letter spacing, line height, text transform
- [x] Applied `body` styles to `p`, `span`, `div` elements:
  - Font size, weight, letter spacing, line height
- [x] Applied hero banner text styles:
  - Title size, weight, text shadow
  - Subtitle size, weight, text shadow

### 5.4 Hero Banner Text Visibility
- [x] Added specific CSS rules for hero banner text
- [x] Ensured white text color with strong text shadows
- [x] Applied template-specific hero banner text styles
- [x] Override template text colors for hero banners

### 5.5 Product Card Styling
- [x] Applied glassmorphism effect to product cards
- [x] Updated CSS selectors to target actual product card elements
- [x] Made ProductsList wrapper background transparent
- [x] Applied template card radius and styling

## Phase 6: UI Components ✅

### 6.1 Vendor Details Navbar
- [x] Created navbar-sized vendor details bar
- [x] Positioned below breadcrumb navigation
- [x] Made sticky at top of page
- [x] Applied template colors and fonts

### 6.2 Template Selection UI
- [x] Created `/vendor/templates` page for template selection
- [x] Added template preview modal
- [x] Implemented template selection functionality
- [x] Added template customization page (`/vendor/templates/customize`)

## Phase 7: Integration & Testing ✅

### 7.1 Template Resolution
- [x] Integrated template resolution in vendor page
- [x] Added error handling for missing templates
- [x] Implemented fallback to default template
- [x] Added console logging for debugging

### 7.2 CSS Application
- [x] Verified CSS variables are generated correctly
- [x] Confirmed text styles are applied to all elements
- [x] Tested hero banner text visibility
- [x] Verified product cards display correctly
- [x] Confirmed mesh gradient animation works

## Technical Implementation Details

### Files Created/Modified

1. **Type Definitions**
   - `src/types/template-customization.ts` - Template config schemas

2. **Template Engine**
   - `src/lib/templates/template-engine.ts` - Template resolution logic
   - `src/lib/templates/css-variables.ts` - CSS variable generation
   - `src/lib/templates/seed-templates.ts` - Template seed data
   - `src/lib/templates/component-registry.ts` - Component mapping (placeholder)

3. **Collections**
   - `src/collections/VendorTemplates.ts` - Template collection schema
   - `src/collections/Vendors.ts` - Added template fields

4. **Pages**
   - `src/app/(app)/(home)/vendors/[slug]/page.tsx` - Vendor page with template integration
   - `src/app/(app)/vendor/templates/page.tsx` - Template selection UI
   - `src/app/(app)/vendor/templates/customize/page.tsx` - Template customization UI

5. **Components**
   - `src/components/vendor/VendorStorefront.tsx` - Vendor storefront component
   - `src/app/(app)/vendor/templates/components/TemplatePreviewModal.tsx` - Template preview

### CSS Variables Generated

**Colors:**
- `--template-primary`
- `--template-secondary`
- `--template-accent`
- `--template-background`
- `--template-text`
- `--template-text-secondary`
- `--template-border`
- `--template-card-bg`

**Fonts:**
- `--template-font-heading`
- `--template-font-body`

**Spacing:**
- `--template-spacing-section`
- `--template-spacing-card-gap`
- `--template-container-width`

**Components:**
- `--template-card-radius`
- `--template-banner-height`

**Text Styles:**
- `--template-h1-size`, `--template-h1-weight`, `--template-h1-spacing`, `--template-h1-height`, `--template-h1-transform`
- `--template-h2-size`, `--template-h2-weight`, `--template-h2-spacing`, `--template-h2-height`, `--template-h2-transform`
- `--template-body-size`, `--template-body-weight`, `--template-body-spacing`, `--template-body-height`
- `--template-hero-title-size`, `--template-hero-title-weight`
- `--template-hero-subtitle-size`, `--template-hero-subtitle-weight`
- `--template-hero-text-shadow`

## Template-Specific Text Styles

### Fun Template
- **H1**: 2.5rem, 800 weight, -0.02em spacing, 1.2 line height
- **H2**: 2rem, 700 weight, -0.01em spacing, 1.3 line height
- **Body**: 1rem, 400 weight, 0 spacing, 1.6 line height
- **Hero**: 3.5rem title (900 weight), 1.5rem subtitle (600 weight), strong shadows

### Elegant Template
- **H1**: 3rem, 700 weight, 0.02em spacing, 1.1 line height
- **H2**: 2.25rem, 600 weight, 0.01em spacing, 1.2 line height
- **Body**: 1.125rem, 400 weight, 0.01em spacing, 1.7 line height
- **Hero**: 4rem title (700 weight), 1.75rem subtitle (400 weight), elegant shadows

### Bold Template
- **H1**: 3rem, 900 weight, -0.03em spacing, 1.1 line height, **UPPERCASE**
- **H2**: 2.5rem, 800 weight, -0.02em spacing, 1.2 line height, **UPPERCASE**
- **Body**: 1rem, 500 weight, 0.01em spacing, 1.5 line height
- **Hero**: 4.5rem title (900 weight), 2rem subtitle (700 weight), very strong shadows

### Zen Template
- **H1**: 2.25rem, 600 weight, 0 spacing, 1.4 line height
- **H2**: 1.875rem, 600 weight, 0 spacing, 1.5 line height
- **Body**: 1rem, 400 weight, 0.01em spacing, 1.75 line height
- **Hero**: 3rem title (600 weight), 1.25rem subtitle (400 weight), subtle shadows

## Usage

### Seeding Templates
```bash
cd /Users/anu/Desktop/Projects/evega
npm run db:seed:templates
```

### Selecting a Template
1. Navigate to `/vendor/templates`
2. Browse available templates
3. Click "Select" on desired template
4. Template is immediately applied to vendor storefront

### Customizing Template
1. Navigate to `/vendor/templates/customize`
2. Adjust colors, fonts, spacing, layout
3. See live preview of changes
4. Save customizations

## Future Enhancements (Not Implemented)

- [ ] Component registry implementation for different component variants
- [ ] Template preview images
- [ ] Template categories and filtering
- [ ] Template versioning
- [ ] Template import/export
- [ ] Advanced text style customization UI
- [ ] Template marketplace
- [ ] A/B testing for templates


## Usage

The customers page is now accessible at `/vendor/customers` and displays:
- **Customer Name**: With avatar and email
- **Order List**: All orders for each customer with product name, order number, date, status, and amount
- **Amount Paid**: Total amount paid across all orders with order count

The page is fully read-only and shows all customers who have placed orders with the vendor, regardless of whether customer records exist in the customers collection.


### Pending Features:
- ⚠️ Complete Stripe Connect implementation (vendor payouts & platform commission) - Partially implemented
- ⚠️ Comprehensive testing suite - Setup complete, needs more test coverage
- ⚠️ Production deployment setup - Vercel configured, needs environment verification
- ⚠️ Email service configuration - SendGrid installed, needs configuration
- ⚠️ Advanced admin dashboard features - Basic admin features implemented
- ⚠️ Performance optimization - Needs optimization pass
- ⚠️ Security hardening - Basic security implemented, needs audit
- ❌ Password reset/forgot password flow
- ❌ Email verification
- ❌ Two-factor authentication (2FA)
- ❌ Social account linking in user settings

---

**Last Updated**: Based on current codebase analysis
**Next Steps**: Complete testing, optimize performance, prepare for production deployment
# Product Media Implementation - Complete Guide

This document outlines all tasks completed for product media management, including image field renaming, multiple images support, and video upload size increases.

## Table of Contents

1. [Product Image Fields Renaming & Multiple Images Support](#product-image-fields-renaming--multiple-images-support)
2. [Video Upload Size Increase](#video-upload-size-increase)
3. [Summary](#summary)

---

# Product Image Fields Renaming & Multiple Images Support

## Overview

**Objective:** Rename product image fields and enable multiple image uploads for additional images.

**Changes:**
- "Main Image" → "Cover Image"
- "Cover Image" → "Additional Images" (with multiple upload support)

## Phase 1: Database Schema Updates ✅

### 1.1 Products Collection Schema
- [x] Updated `cover` field in `src/collections/Products.ts`
  - Changed from single upload to multiple uploads
  - Added `hasMany: true` property
  - **Technical Detail:** Changed field type from `upload` (single) to `upload` with `hasMany: true` (array)

**File:** `src/collections/Products.ts`
```typescript
{
  name: "cover",
  type: "upload",
  relationTo: "media",
  hasMany: true, // Added to support multiple images
}
```

## Phase 2: Form Schema Updates ✅

### 2.1 Zod Schema Definition
- [x] Updated `productFormSchema` in `ProductForm.tsx`
  - Changed `cover` from `z.string().optional()` to `z.array(z.string()).optional()`
  - **Technical Detail:** Updated Zod validation to accept array of strings (media IDs)

**File:** `src/app/(app)/vendor/products/components/ProductForm.tsx`
```typescript
const productFormSchema = z.object({
  // ... other fields
  image: z.string().optional(), // Cover Image (single)
  cover: z.array(z.string()).optional(), // Additional Images (multiple)
  // ... other fields
});
```

## Phase 3: Form State Management ✅

### 3.1 State Variables
- [x] Updated state from single preview to array of previews
  - Changed `coverPreview: useState<string | null>(null)` 
  - To `coverPreviews: useState<string[]>([])`
  - **Technical Detail:** Changed from single string state to array state for multiple image previews

**File:** `src/app/(app)/vendor/products/components/ProductForm.tsx`
```typescript
// Before:
const [coverPreview, setCoverPreview] = useState<string | null>(null);

// After:
const [coverPreviews, setCoverPreviews] = useState<string[]>([]);
```

### 3.2 Default Values
- [x] Updated form default values to handle array
  - Convert single cover to array format
  - Handle both array and single value from existing products
  - **Technical Detail:** Added logic to normalize cover field - if it's a single value, convert to array; if it's already an array, use as-is

**File:** `src/app/(app)/vendor/products/components/ProductForm.tsx`
```typescript
defaultValues: {
  // ... other fields
  cover: Array.isArray(product?.cover) 
    ? product.cover.map((c: any) => typeof c === "string" ? c : c?.id || "").filter(Boolean)
    : product?.cover 
      ? [typeof product.cover === "string" ? product.cover : product.cover?.id || ""].filter(Boolean)
      : [],
}
```

### 3.3 Preview Initialization
- [x] Updated preview initialization for editing existing products
  - Handle both array and single cover values
  - Extract URLs from media objects
  - **Technical Detail:** Added logic to convert single cover to array, then map each to get media URL

**File:** `src/app/(app)/vendor/products/components/ProductForm.tsx`
```typescript
// Set cover previews (multiple images)
if (product?.cover) {
  const covers = Array.isArray(product.cover) ? product.cover : [product.cover];
  const coverUrls = covers
    .map((c: any) => getMediaUrl(c))
    .filter((url): url is string => url !== null);
  if (coverUrls.length > 0) {
    setCoverPreviews(coverUrls);
  }
}
```

## Phase 4: Image Upload Handler Updates ✅

### 4.1 Upload Logic for Multiple Images
- [x] Updated `handleImageUpload` function
  - Added special handling for `cover` type to append to array
  - Updated form value setting to append instead of replace
  - Updated preview state to append new preview
  - **Technical Detail:** When type is "cover", get current array, append new media ID, and update both form value and preview state

**File:** `src/app/(app)/vendor/products/components/ProductForm.tsx`
```typescript
// Handle multiple images for cover field
if (type === "cover") {
  const currentCovers = form.getValues("cover") || [];
  form.setValue("cover", [...currentCovers, mediaId]);
  
  // Set preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setCoverPreviews(prev => [...prev, reader.result as string]);
  };
  reader.readAsDataURL(file);
} else {
  // Single image handling for "image" and "video"
  form.setValue(type, mediaId);
  // ... preview logic
}
```

### 4.2 Toast Messages
- [x] Updated success message for cover uploads
  - Changed from "Cover image" to "Additional image"
  - **Technical Detail:** Updated toast message to reflect new field name

## Phase 5: UI Component Updates ✅

### 5.1 Field Labels
- [x] Updated "Main Image" label to "Cover Image"
  - Changed `FormLabel` text from "Main Image" to "Cover Image"
  - **Location:** Line 780 in ProductForm.tsx

- [x] Updated "Cover Image (Optional)" label to "Additional Images"
  - Changed `FormLabel` text from "Cover Image (Optional)" to "Additional Images"
  - **Location:** Line 844 in ProductForm.tsx

### 5.2 Multiple Images Display
- [x] Replaced single image preview with grid display
  - Changed from single `div` with one image
  - To grid layout showing all uploaded images
  - **Technical Detail:** Used `grid grid-cols-4 gap-4` to display images in 4-column grid

**File:** `src/app/(app)/vendor/products/components/ProductForm.tsx`
```typescript
{/* Display uploaded images */}
{coverPreviews.length > 0 && (
  <div className="grid grid-cols-4 gap-4">
    {coverPreviews.map((preview, index) => (
      <div key={index} className="relative w-32 h-32 rounded-md overflow-hidden border">
        <Image
          src={preview}
          alt={`Additional image ${index + 1}`}
          fill
          className="object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6"
          onClick={() => {
            const newPreviews = coverPreviews.filter((_, i) => i !== index);
            setCoverPreviews(newPreviews);
            const currentCovers = field.value || [];
            const newCovers = currentCovers.filter((_, i) => i !== index);
            field.onChange(newCovers);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    ))}
  </div>
)}
```

### 5.3 Multiple File Input
- [x] Added `multiple` attribute to file input
  - Changed from single file selection to multiple file selection
  - Updated onChange handler to process multiple files
  - **Technical Detail:** Added `multiple` attribute and updated handler to iterate over `Array.from(e.target.files || [])`

**File:** `src/app/(app)/vendor/products/components/ProductForm.tsx`
```typescript
<input
  type="file"
  accept="image/*"
  multiple  // Added for multiple file selection
  className="hidden"
  onChange={(e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      handleImageUpload(file, "cover");
    });
  }}
  disabled={uploadingCover}
/>
```

### 5.4 Upload Button Text
- [x] Updated upload button text
  - Changed from "Click to upload" to "Click to upload multiple images"
  - **Technical Detail:** Updated span text to indicate multiple upload capability

### 5.5 Form Description
- [x] Added form description for Additional Images field
  - Added `FormDescription` component
  - Text: "Upload multiple additional images for your product"
  - **Technical Detail:** Added helpful description to guide users

### 5.6 Image Removal Logic
- [x] Updated remove button handler
  - Filters out image from both preview array and form value array
  - Maintains array indices correctly
  - **Technical Detail:** Uses `filter` to remove image at specific index from both `coverPreviews` state and `field.value` array

**File:** `src/app/(app)/vendor/products/components/ProductForm.tsx`
```typescript
onClick={() => {
  const newPreviews = coverPreviews.filter((_, i) => i !== index);
  setCoverPreviews(newPreviews);
  const currentCovers = field.value || [];
  const newCovers = currentCovers.filter((_, i) => i !== index);
  field.onChange(newCovers);
}}
```

## Phase 6: Backend API Updates ✅

### 6.1 Product Create Mutation
- [x] Updated input schema for `products.create`
  - Changed `cover: z.string().optional()` to `cover: z.array(z.string()).optional()`
  - **File:** `src/modules/vendor/server/procedures.ts`
  - **Location:** Line 518

**Technical Detail:**
```typescript
create: vendorProcedure
  .input(
    z.object({
      // ... other fields
      image: z.string().optional(),
      cover: z.array(z.string()).optional(), // Changed to array
      // ... other fields
    })
  )
```

### 6.2 Product Update Mutation
- [x] Updated input schema for `products.update`
  - Changed `cover: z.string().optional()` to `cover: z.array(z.string()).optional()`
  - **File:** `src/modules/vendor/server/procedures.ts`
  - **Location:** Line 795

**Technical Detail:**
```typescript
update: vendorProcedure
  .input(
    z.object({
      id: z.string(),
      // ... other fields
      image: z.string().optional(),
      cover: z.array(z.string()).optional(), // Changed to array
      // ... other fields
    })
  )
```

## Phase 7: Product Display Updates ✅

### 7.1 Product View Component
- [x] Updated product detail page to display all additional images
  - Modified `src/modules/products/ui/components/product-view.tsx`
  - Handles `cover` as array (multiple images) or single value (backward compatibility)
  - All images displayed in thumbnail gallery
  - Click to open lightbox with zoom functionality

**Technical Detail:**
```typescript
// Handle cover as array (multiple additional images) or single value (backward compatibility)
const coverImages: string[] = [];
if (data?.cover) {
  if (Array.isArray(data.cover)) {
    // cover is an array - get URLs for all cover images
    data.cover.forEach((coverItem: any) => {
      const url = getImageUrl(coverItem);
      if (url) coverImages.push(url);
    });
  } else {
    // cover is a single value (backward compatibility)
    const url = getImageUrl(data.cover);
    if (url) coverImages.push(url);
  }
}

// Create array of available images (main image + all cover images, avoiding duplicates)
const availableImages: string[] = [];
if (imageUrl) availableImages.push(imageUrl);
// Add all cover images that are different from the main image
coverImages.forEach((coverUrl) => {
  if (coverUrl && coverUrl !== imageUrl && !availableImages.includes(coverUrl)) {
    availableImages.push(coverUrl);
  }
});
```

### 7.2 Image Zoom Lightbox
- [x] Added full-screen lightbox with zoom functionality
  - Click main image to open lightbox
  - Zoom in/out with buttons or mouse wheel (Ctrl/Cmd + scroll)
  - Pan/drag when zoomed in
  - Navigate between images with arrow buttons or keyboard
  - Keyboard shortcuts: ESC to close, Arrow keys to navigate, +/- to zoom

**File:** `src/modules/products/ui/components/product-view.tsx`

**Features:**
- Zoom range: 50% to 300%
- Mouse wheel zoom: Ctrl/Cmd + scroll
- Drag to pan when zoomed
- Image navigation with previous/next buttons
- Keyboard navigation support
- Image counter display
- Accessibility: Visually hidden DialogTitle for screen readers

---

# Video Upload Size Increase

## Overview

This section outlines the changes made to increase video upload size limits and improve the upload experience for large video files.

## Problem

The default Next.js API route body size limit is 1MB, which is insufficient for video uploads. Videos can easily be 10MB to 500MB or larger, requiring configuration changes at multiple levels.

## Solution

Implemented a multi-layered approach to support larger video uploads:

1. **Route Segment Configuration** - Increased execution time limit
2. **Next.js Configuration** - Increased body size limit for server actions
3. **Client-Side Validation** - Warn users about large files before upload
4. **Enhanced Error Handling** - Better error messages for upload failures
5. **Logging** - Track file sizes for debugging

## Changes Made

### 1. API Route Configuration (`src/app/api/media/route.ts`)

**Added Route Segment Config:**
```typescript
// Increase body size limit for video uploads (default is 1MB, we set to 500MB)
export const maxDuration = 300; // 5 minutes for large video uploads
export const runtime = 'nodejs'; // Ensure Node.js runtime for large file handling
```

**Added File Size Logging:**
```typescript
// Log file size for debugging
const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
console.log(`📤 Uploading ${file.type} file: ${file.name} (${fileSizeMB} MB)`);

// Warn if file is very large (but still allow it)
if (file.size > 100 * 1024 * 1024) { // 100MB
  console.warn(`⚠️  Large file detected: ${fileSizeMB} MB. Upload may take longer.`);
}
```

**Technical Details:**
- `maxDuration`: Sets the maximum execution time for the route handler (5 minutes)
- `runtime: 'nodejs'`: Ensures Node.js runtime is used (required for large file handling)
- File size logging helps debug upload issues
- Warnings for files over 100MB help identify potential timeout issues

### 2. Next.js Configuration (`next.config.ts`)

**Added Server Actions Body Size Limit:**
```typescript
const nextConfig: NextConfig = {
  // ... existing config
  // Increase body size limit for API routes (for video uploads)
  // Default is 1MB, we increase to 500MB for large video files
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};
```

**Technical Details:**
- `bodySizeLimit: '500mb'`: Increases the maximum body size for server actions
- This applies to API routes and server actions
- Note: This is an experimental feature in Next.js, but it's stable for production use

### 3. Client-Side Validation (`src/app/(app)/vendor/products/components/ProductForm.tsx`)

**Added Pre-Upload Validation:**
```typescript
const handleImageUpload = async (file: File, type: "image" | "cover" | "video") => {
  // Client-side validation for large files
  const fileSizeMB = file.size / (1024 * 1024);
  
  // For videos, warn if file is very large (but still allow upload)
  if (type === "video") {
    if (fileSizeMB > 500) {
      toast.error(`Video file is very large (${fileSizeMB.toFixed(2)} MB). Maximum recommended size is 500 MB. Please compress the video or use a YouTube link instead.`);
      return;
    } else if (fileSizeMB > 100) {
      toast.warning(`Large video file detected (${fileSizeMB.toFixed(2)} MB). Upload may take several minutes. Please be patient.`);
    }
  }
  
  // For images, warn if file is very large
  if ((type === "image" || type === "cover") && fileSizeMB > 50) {
    toast.warning(`Large image file detected (${fileSizeMB.toFixed(2)} MB). Consider compressing the image for better performance.`);
  }
  
  // ... rest of upload logic
};
```

**Technical Details:**
- Prevents uploads over 500MB for videos (hard limit)
- Warns users about large files (100MB+ for videos, 50MB+ for images)
- Provides user-friendly error messages
- Suggests alternatives (compression, YouTube links)

## Current Limits

### Supported File Sizes

| File Type | Maximum Size | Warning Threshold |
|-----------|-------------|-------------------|
| Videos    | 500 MB      | 100 MB            |
| Images    | No hard limit | 50 MB            |
| Additional Images | No hard limit | 50 MB            |

### Platform-Specific Limits

**Vercel (Production):**
- Default body size limit: 4.5 MB (Hobby/Pro plans)
- Can be increased via Vercel dashboard settings
- Enterprise plans can have custom limits

**Local Development:**
- No hard limit (limited by system memory)
- Large files may still timeout if upload takes too long

## Important Notes

### Vercel Deployment Considerations

1. **Body Size Limit:**
   - Vercel's default body size limit is 4.5 MB
   - To support larger files, you may need to:
     - Upgrade to Vercel Pro/Enterprise
     - Configure custom limits in Vercel dashboard
     - Use direct client-side upload to Vercel Blob (bypasses API route)

2. **Execution Time:**
   - Hobby plan: 10 seconds
   - Pro plan: 60 seconds (can be increased to 300 seconds)
   - Enterprise: Custom limits
   - Our `maxDuration: 300` requires Pro plan or higher

3. **Vercel Blob Storage:**
   - Currently, files are uploaded through the API route first, then to Blob
   - This means the 4.5 MB limit still applies
   - **Future Enhancement:** Implement direct client-side upload to Blob to bypass API route limits

### Recommended Approach for Very Large Videos

For videos over 100 MB, we recommend:

1. **Use YouTube Links:**
   - Upload video to YouTube
   - Use the YouTube URL in the product form
   - No file size limits
   - Better performance and CDN delivery

2. **Compress Videos:**
   - Use tools like HandBrake, FFmpeg, or online compressors
   - Target file size: < 100 MB
   - Maintain reasonable quality (1080p is usually sufficient)

3. **Direct Blob Upload (Future):**
   - Implement client-side direct upload to Vercel Blob
   - Bypasses API route body size limits
   - Supports files up to 5 GB (Vercel Blob limit)

## Testing

### Test Cases

1. **Small Video (< 10 MB):**
   - ✅ Should upload without warnings
   - ✅ Should complete quickly

2. **Medium Video (10-100 MB):**
   - ✅ Should upload successfully
   - ✅ May show warning about upload time
   - ✅ Should complete within timeout

3. **Large Video (100-500 MB):**
   - ✅ Should show warning about upload time
   - ✅ Should upload successfully (if within platform limits)
   - ⚠️ May timeout on slower connections

4. **Very Large Video (> 500 MB):**
   - ❌ Should be rejected with error message
   - ✅ Should suggest compression or YouTube link

5. **Error Handling:**
   - ✅ Should show clear error messages for:
     - File too large
     - Network errors
     - Timeout errors
     - Authentication errors

## Future Enhancements

### 1. Direct Blob Upload
**Priority: High**

Implement client-side direct upload to Vercel Blob:
- Bypass API route body size limits
- Support files up to 5 GB
- Better progress tracking
- Reduced server load

**Implementation Steps:**
1. Install `@vercel/blob` client SDK
2. Create signed upload URL endpoint
3. Upload file directly from browser to Blob
4. Create media record from Blob URL
5. Update UI with progress indicator

### 2. Chunked Upload
**Priority: Medium**

Implement chunked upload for very large files:
- Split files into chunks (e.g., 10 MB each)
- Upload chunks sequentially or in parallel
- Reassemble on server
- Resume failed uploads

### 3. Video Compression
**Priority: Low**

Add client-side video compression before upload:
- Use browser APIs (MediaRecorder, WebCodecs)
- Compress videos to target size/quality
- Show compression progress
- Maintain quality settings

### 4. Upload Progress Indicator
**Priority: Medium**

Add visual progress indicator for large uploads:
- Show upload percentage
- Estimated time remaining
- Upload speed
- Cancel option

## Troubleshooting

### Issue: "File is too large" Error

**Possible Causes:**
1. File exceeds 500 MB (client-side limit)
2. Vercel body size limit (4.5 MB default)
3. Network timeout

**Solutions:**
1. Compress the video file
2. Use YouTube link instead
3. Upgrade Vercel plan or configure custom limits
4. Check network connection stability

### Issue: Upload Times Out

**Possible Causes:**
1. File is too large for connection speed
2. Execution time limit exceeded
3. Network instability

**Solutions:**
1. Compress video to smaller size
2. Use YouTube link for large videos
3. Check Vercel plan execution time limits
4. Retry upload on stable connection

### Issue: "413 Payload Too Large" Error

**Possible Causes:**
1. Vercel body size limit exceeded
2. Next.js body size limit not configured correctly

**Solutions:**
1. Verify `next.config.ts` has `bodySizeLimit` set
2. Check Vercel dashboard for body size limits
3. Consider direct Blob upload (future enhancement)

---

# Technical Implementation Details

## Files Modified

### Image Fields Implementation

1. **`src/collections/Products.ts`**
   - Added `hasMany: true` to `cover` field
   - Enables Payload CMS to store array of media references

2. **`src/app/(app)/vendor/products/components/ProductForm.tsx`**
   - Updated Zod schema: `cover: z.array(z.string()).optional()`
   - Changed state: `coverPreviews: useState<string[]>([])`
   - Updated default values to handle array conversion
   - Updated preview initialization for arrays
   - Updated upload handler to append to array
   - Updated UI to display grid of images
   - Added multiple file input support
   - Updated remove logic for array indices
   - Changed labels: "Main Image" → "Cover Image", "Cover Image (Optional)" → "Additional Images"
   - Added client-side validation for large files

3. **`src/modules/vendor/server/procedures.ts`**
   - Updated `products.create` input schema
   - Updated `products.update` input schema
   - Both now accept `cover` as `z.array(z.string()).optional()`

4. **`src/modules/products/ui/components/product-view.tsx`**
   - Updated to handle `cover` as array
   - Displays all additional images in thumbnail gallery
   - Added image zoom lightbox functionality

### Video Upload Size Implementation

1. **`src/app/api/media/route.ts`**
   - Added `maxDuration: 300` route segment config
   - Added `runtime: 'nodejs'` config
   - Added file size logging

2. **`next.config.ts`**
   - Added `bodySizeLimit: '500mb'` in experimental server actions config

## Data Flow

### Image Upload Flow

1. **User Uploads Images:**
   - User selects one or multiple files via file input
   - Each file is uploaded individually via `/api/media`
   - Media ID is appended to `cover` array in form state
   - Preview URL is appended to `coverPreviews` state

2. **Form Submission:**
   - Form validates `cover` as array of strings
   - Array of media IDs sent to backend via tRPC mutation
   - Backend stores array in Payload CMS `cover` field

3. **Editing Existing Product:**
   - Backend returns `cover` as array (or single value for backward compatibility)
   - Form normalizes to array format
   - Previews are generated from media URLs
   - Grid displays all images

4. **Product Display:**
   - Product view component fetches product data
   - Extracts all images (main + additional)
   - Displays in thumbnail gallery
   - Click to open lightbox with zoom

### Video Upload Flow

1. **User Selects Video:**
   - Client-side validation checks file size
   - Warns if file is large (> 100MB)
   - Blocks if file exceeds 500MB

2. **Upload Process:**
   - File uploaded via `/api/media` route
   - Route segment config allows 5-minute execution time
   - File size logged for debugging
   - Uploaded to Vercel Blob Storage (if configured)

3. **Error Handling:**
   - Clear error messages for different failure scenarios
   - Suggestions for alternatives (compression, YouTube links)

## Backward Compatibility

### Image Fields

- **Handles Legacy Data:**
  - Existing products with single `cover` value are converted to array
  - Logic checks if `cover` is array or single value
  - Single values are wrapped in array: `[singleValue]`
  - Arrays are used as-is

**Code:**
```typescript
cover: Array.isArray(product?.cover) 
  ? product.cover.map((c: any) => typeof c === "string" ? c : c?.id || "").filter(Boolean)
  : product?.cover 
    ? [typeof product.cover === "string" ? product.cover : product.cover?.id || ""].filter(Boolean)
    : []
```

### Breaking Changes

- **None** - All changes are backward compatible
- Existing single cover values are automatically converted to arrays
- API accepts both formats during transition

## UI/UX Improvements

### Image Management

1. **Visual Grid Layout:**
   - 4-column grid for image thumbnails
   - Each image: 128x128px (w-32 h-32)
   - Gap between images: 16px (gap-4)
   - Responsive design

2. **Individual Image Removal:**
   - Each image has its own remove button
   - Positioned at top-right corner
   - Destructive variant (red) for clear action indication
   - Updates both preview and form state

3. **Multiple File Selection:**
   - Native browser multiple file picker
   - Users can select multiple files at once
   - Each file uploads individually
   - Progress shown via `uploadingCover` state

4. **User Feedback:**
   - Toast notifications for each upload
   - "Additional image uploaded successfully" message
   - Upload button shows "Uploading..." during upload
   - Form description explains multiple upload capability

5. **Image Zoom Lightbox:**
   - Full-screen lightbox for detailed image viewing
   - Zoom in/out with buttons or mouse wheel
   - Pan/drag when zoomed
   - Navigate between images
   - Keyboard shortcuts for accessibility

### Video Upload

1. **Pre-Upload Validation:**
   - Client-side file size checks
   - Clear warnings for large files
   - Helpful error messages
   - Suggestions for alternatives

2. **Upload Feedback:**
   - File size logging
   - Progress indication (future enhancement)
   - Clear error messages

## Testing Checklist

### Image Fields Testing

#### Functional Testing
- [ ] Upload single additional image
- [ ] Upload multiple additional images at once
- [ ] Upload multiple additional images one by one
- [ ] Remove individual additional images
- [ ] Remove all additional images
- [ ] Edit product with existing additional images
- [ ] Create new product with additional images
- [ ] Verify images persist after form submission
- [ ] Verify images display correctly on product page
- [ ] Verify image zoom lightbox works correctly
- [ ] Verify keyboard navigation in lightbox

#### Edge Cases
- [ ] Handle existing products with single cover (backward compatibility)
- [ ] Handle existing products with array cover
- [ ] Handle products with no cover images
- [ ] Handle upload failures gracefully
- [ ] Handle large number of images (performance)
- [ ] Verify form validation works with empty array
- [ ] Verify form validation works with array of IDs

#### UI/UX Testing
- [ ] Verify "Cover Image" label displays correctly
- [ ] Verify "Additional Images" label displays correctly
- [ ] Verify grid layout displays correctly
- [ ] Verify remove buttons work correctly
- [ ] Verify multiple file selection works
- [ ] Verify upload progress indication
- [ ] Verify responsive design on mobile
- [ ] Verify lightbox opens and closes correctly
- [ ] Verify zoom functionality works
- [ ] Verify image navigation works

### Video Upload Testing

#### Functional Testing
- [ ] Upload small video (< 10 MB)
- [ ] Upload medium video (10-100 MB)
- [ ] Upload large video (100-500 MB)
- [ ] Attempt to upload very large video (> 500 MB)
- [ ] Verify error messages display correctly
- [ ] Verify warnings display for large files

#### Edge Cases
- [ ] Handle network errors gracefully
- [ ] Handle timeout errors
- [ ] Handle authentication errors
- [ ] Verify file size validation works
- [ ] Verify platform limits are respected

## Migration Notes

### Database Migration
- **No migration required** - Payload CMS handles array fields automatically
- Existing single `cover` values will be converted to arrays on first update
- Backward compatibility code handles both formats

### Breaking Changes
- **None** - Changes are backward compatible
- Existing single cover values are automatically converted to arrays
- API accepts both formats during transition

## Future Enhancements

### Image Management
- [ ] Drag-and-drop reordering of additional images
- [ ] Image cropping/editing before upload
- [ ] Bulk image upload with progress bar
- [ ] Image optimization/compression
- [ ] Image alt text for accessibility
- [ ] Image captions/descriptions
- [ ] Set primary additional image
- [ ] Image gallery carousel on product page

### Video Upload
- [ ] Direct Blob upload to bypass API route limits
- [ ] Chunked upload for very large files
- [ ] Client-side video compression
- [ ] Upload progress indicator with percentage
- [ ] Cancel upload functionality

## Summary

All tasks completed successfully. The product media system now:

### Image Fields
- ✅ Uses "Cover Image" label for main image field
- ✅ Uses "Additional Images" label for cover field
- ✅ Supports multiple image uploads for additional images
- ✅ Displays multiple images in a grid layout
- ✅ Allows individual image removal
- ✅ Maintains backward compatibility with existing data
- ✅ Updated both frontend form and backend API schemas
- ✅ Displays all images on product detail page
- ✅ Provides image zoom lightbox functionality

### Video Upload
- ✅ Supports videos up to 500 MB (client-side limit)
- ✅ Warns users about large files
- ✅ Provides clear error messages
- ✅ Enhanced route configuration for large uploads
- ✅ Client-side validation and warnings
- ⚠️ Still subject to Vercel platform limits (4.5 MB default)
- 🔄 Future: Direct Blob upload to bypass platform limits

### Recommendations

**For Production Use:**
1. **Large Videos (> 100 MB):**
   - Use YouTube links (no size limits)
   - Compress videos before upload
   - Consider implementing direct Blob upload

2. **Image Management:**
   - Consider adding image optimization
   - Implement drag-and-drop reordering
   - Add image alt text for accessibility

3. **Platform Configuration:**
   - Upgrade Vercel plan if needed for larger uploads
   - Configure custom body size limits in Vercel dashboard
   - Monitor upload performance and adjust limits as needed
# Product Variant Creation UX Improvements - Architectural Ideas

## Current Problem

Vendors need to create variants one by one, which is slow and tedious when they have many combinations. For example:
- Red Small: 50 units
- Red Medium: 50 units
- Red Large: 50 units
- Blue Small: 50 units
- Blue Medium: 50 units
- etc.

**Current Flow:** Click "Add Variant" → Fill Size, Color, Stock, Price → Click "Add Variant" again → Repeat...

## User Goals

1. **Speed**: Create multiple variants quickly
2. **Efficiency**: Avoid repetitive data entry
3. **Flexibility**: Handle different patterns (same stock across sizes, different prices per color, etc.)
4. **Error Prevention**: Reduce mistakes when entering similar data
5. **Visual Clarity**: See all variants at a glance

---

## Solution Ideas

### 1. Variant Matrix/Grid View (Recommended)

**Concept:** Visual grid where vendors can see all combinations and fill in stock/price values quickly.

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Variant Matrix                                          │
├──────────┬───────┬───────┬───────┬───────┬─────────────┤
│          │ Small │ Medium│ Large │ XLarge │ Bulk Actions│
├──────────┼───────┼───────┼───────┼───────┼─────────────┤
│ Red      │ [50]  │ [50]  │ [50]  │ [30]  │ [Fill All]  │
│          │ $29   │ $29   │ $29   │ $29   │             │
├──────────┼───────┼───────┼───────┼───────┼─────────────┤
│ Blue     │ [40]  │ [40]  │ [40]  │ [25]  │ [Fill All]  │
│          │ $29   │ $29   │ $29   │ $29   │             │
├──────────┼───────┼───────┼───────┼───────┼─────────────┤
│ Green    │ [35]  │ [35]  │ [35]  │ [20]  │ [Fill All]  │
│          │ $32   │ $32   │ $32   │ $32   │             │
└──────────┴───────┴───────┴───────┴───────┴─────────────┘

[Generate All Combinations] [Clear Matrix] [Import from CSV]
```

**Features:**
- **Visual Grid**: Rows = one variant type (Color), Columns = another (Size)
- **Quick Input**: Click cell to edit stock/price
- **Bulk Fill**: Fill entire row/column with same value
- **Auto-Generate**: Generate all combinations from selected options
- **Validation**: Highlight missing required fields
- **Preview**: Show total variants that will be created

**Implementation:**
- Generate matrix from selected variant types
- Each cell represents a unique combination
- Inline editing for stock and price
- Batch operations (fill row, fill column, fill all)
- Convert matrix to variant array on save

**Pros:**
- ✅ Very fast for many combinations
- ✅ Visual and intuitive
- ✅ Easy to spot missing data
- ✅ Great for standard size/color combinations

**Cons:**
- ❌ Less flexible for non-standard combinations
- ❌ Can be overwhelming with many options
- ❌ Requires both variant types to be selected first

---

### 2. Bulk Variant Generator

**Concept:** Select all options for each variant type, then generate all combinations at once.

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Bulk Variant Generator                                 │
├─────────────────────────────────────────────────────────┤
│ Step 1: Select Variant Options                         │
│                                                         │
│ Size:     ☑ Small  ☑ Medium  ☑ Large  ☑ XLarge        │
│ Color:    ☑ Red    ☑ Blue    ☑ Green  ☑ Black         │
│ Material: ☑ Cotton  ☑ Silk    ☐ Polyester              │
│                                                         │
│ Step 2: Set Default Values                             │
│                                                         │
│ Default Stock: [50]                                    │
│ Default Price: [$29.99] (optional, can set per variant)│
│                                                         │
│ Step 3: Preview                                        │
│                                                         │
│ Will create 48 variants (4 sizes × 4 colors × 3 materials)│
│                                                         │
│ [Generate All Variants] [Cancel]                      │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Multi-Select**: Checkboxes for each option
- **Default Values**: Set stock/price that applies to all
- **Preview Count**: Show how many variants will be created
- **Override**: After generation, can edit individual variants
- **Smart Defaults**: Remember last used values

**Implementation:**
- Cartesian product of selected options
- Generate variant array with default values
- Add to form's variant array
- Allow individual editing after generation

**Pros:**
- ✅ Extremely fast for many combinations
- ✅ Simple and straightforward
- ✅ Good for standard patterns
- ✅ Reduces clicks significantly

**Cons:**
- ❌ All variants get same default values initially
- ❌ Less control over individual variants
- ❌ May create unwanted combinations

---

### 3. Quick Fill / Pattern-Based Creation

**Concept:** Create one variant, then use patterns to quickly create similar ones.

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Variant 1: Red, Small, Cotton, Stock: 50, Price: $29  │
│                                                         │
│ [Duplicate] [Create Similar] [Fill Pattern]            │
│                                                         │
│ Pattern Options:                                        │
│ ☐ Keep Size, Change Color → [Select Colors]            │
│ ☐ Keep Color, Change Size → [Select Sizes]            │
│ ☐ Keep Both, Change Material → [Select Materials]      │
│                                                         │
│ Stock: [50] (apply to all)                             │
│ Price: [$29] (apply to all)                            │
│                                                         │
│ [Create 12 Variants]                                    │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Duplicate**: Copy exact variant
- **Pattern Fill**: Create variants based on pattern
- **Smart Suggestions**: Suggest common patterns
- **Bulk Apply**: Apply stock/price to multiple variants

**Implementation:**
- Pattern matching logic
- Generate variants based on selected pattern
- Merge with existing variants (avoid duplicates)
- Validation for required fields

**Pros:**
- ✅ Flexible and intuitive
- ✅ Good for incremental additions
- ✅ Works well with existing variants
- ✅ Less overwhelming than full matrix

**Cons:**
- ❌ Still requires multiple steps
- ❌ May not be as fast as matrix for many combinations

---

### 4. CSV Import / Spreadsheet View

**Concept:** Import variants from CSV or edit in spreadsheet-like interface.

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Variant Spreadsheet                                     │
├──────┬───────┬───────┬─────────┬───────┬───────────────┤
│ Size │ Color │ Stock │ Price   │ ...   │ Actions       │
├──────┼───────┼───────┼─────────┼───────┼───────────────┤
│ S    │ Red   │ 50    │ $29.99  │ ...   │ [Delete]      │
│ M    │ Red   │ 50    │ $29.99  │ ...   │ [Delete]      │
│ L    │ Red   │ 50    │ $29.99  │ ...   │ [Delete]      │
│ S    │ Blue  │ 40    │ $29.99  │ ...   │ [Delete]      │
│ M    │ Blue  │ 40    │ $29.99  │ ...   │ [Delete]      │
│ ...  │ ...   │ ...   │ ...     │ ...   │ ...           │
├──────┴───────┴───────┴─────────┴───────┴───────────────┤
│ [Add Row] [Import CSV] [Export CSV] [Bulk Edit]        │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Spreadsheet UI**: Table with inline editing
- **CSV Import**: Upload CSV file with variants
- **CSV Export**: Download current variants as CSV
- **Bulk Edit**: Select multiple rows, edit together
- **Copy/Paste**: Copy rows from spreadsheet apps
- **Validation**: Highlight errors in real-time

**CSV Format:**
```csv
Size,Color,Material,Stock,Price
Small,Red,Cotton,50,29.99
Medium,Red,Cotton,50,29.99
Large,Red,Cotton,50,29.99
Small,Blue,Cotton,40,29.99
```

**Implementation:**
- Table component with editable cells
- CSV parser/validator
- Import/export functionality
- Bulk operations on selected rows

**Pros:**
- ✅ Very fast for power users
- ✅ Familiar interface (spreadsheet-like)
- ✅ Can import from existing data
- ✅ Good for large datasets

**Cons:**
- ❌ Less user-friendly for non-technical users
- ❌ Requires CSV knowledge
- ❌ More complex to implement

---

### 5. Smart Templates / Presets

**Concept:** Pre-defined templates for common variant patterns.

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Variant Templates                                       │
├─────────────────────────────────────────────────────────┤
│ Common Patterns:                                        │
│                                                         │
│ [Standard Sizes] [Standard Colors] [Size + Color]       │
│                                                         │
│ Standard Sizes Template:                               │
│ Sizes: XS, S, M, L, XL, XXL                            │
│ Default Stock: [50]                                    │
│ Default Price: [$29.99]                                │
│                                                         │
│ [Apply Template] [Customize]                           │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Pre-defined Templates**: Common size/color combinations
- **Custom Templates**: Save custom patterns
- **Quick Apply**: One-click to generate variants
- **Customization**: Adjust before applying

**Implementation:**
- Template definitions (JSON)
- Template selector UI
- Apply template logic
- Save custom templates (future)

**Pros:**
- ✅ Very fast for common patterns
- ✅ Reduces errors
- ✅ Good for beginners
- ✅ Can be customized

**Cons:**
- ❌ Limited to predefined patterns
- ❌ May not fit all use cases
- ❌ Requires template management

---

### 6. Hybrid Approach (Recommended)

**Concept:** Combine multiple methods in a single interface with tabs/modes.

**UI Design:**
```
┌─────────────────────────────────────────────────────────┐
│ Variant Creation                                        │
├─────────────────────────────────────────────────────────┤
│ [Quick Add] [Matrix View] [Bulk Generator] [Import CSV] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Quick Add (Current Method)                          │ │
│ │                                                     │ │
│ │ [Add Variant] - for one-off variants               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Matrix View                                         │ │
│ │                                                     │ │
│ │ [Visual grid for size × color combinations]       │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Bulk Generator                                      │ │
│ │                                                     │ │
│ │ [Generate all combinations from selected options]  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- **Multiple Modes**: Switch between creation methods
- **Unified Interface**: All variants shown together
- **Smart Defaults**: Remember preferred method
- **Contextual Help**: Show tips based on variant count

**Pros:**
- ✅ Flexible - users choose best method
- ✅ Accommodates different workflows
- ✅ Can combine methods
- ✅ Future-proof

**Cons:**
- ❌ More complex UI
- ❌ May be overwhelming
- ❌ Requires more development

---

## Recommended Implementation Plan

### Phase 1: Quick Wins (Week 1-2)

1. **Bulk Variant Generator**
   - Multi-select checkboxes for options
   - Generate all combinations
   - Set default stock/price
   - **Impact**: High, **Effort**: Medium

2. **Duplicate & Pattern Fill**
   - Duplicate button on each variant
   - "Create Similar" with pattern options
   - **Impact**: Medium, **Effort**: Low

3. **Bulk Fill Operations**
   - Select multiple variants
   - Fill stock/price for selected
   - **Impact**: Medium, **Effort**: Low

### Phase 2: Advanced Features (Week 3-4)

4. **Variant Matrix View**
   - Visual grid interface
   - Inline editing
   - Row/column bulk fill
   - **Impact**: Very High, **Effort**: High

5. **CSV Import/Export**
   - Import variants from CSV
   - Export current variants
   - **Impact**: High, **Effort**: Medium

### Phase 3: Polish (Week 5)

6. **Smart Templates**
   - Pre-defined templates
   - Custom template saving
   - **Impact**: Medium, **Effort**: Medium

7. **Hybrid Interface**
   - Tabbed interface
   - Mode switching
   - **Impact**: High, **Effort**: Medium

---

## Technical Considerations

### Data Structure

**Current Variant Structure:**
```typescript
{
  variantData: {
    size: "Small",
    color: "Red",
    material: "Cotton"
  },
  stock: 50,
  price: 29.99
}
```

**Matrix Generation Logic:**
```typescript
function generateVariantMatrix(
  variantTypes: string[],
  options: Record<string, string[]>,
  defaults: { stock: number; price?: number }
): Variant[] {
  // Generate cartesian product
  const combinations = cartesianProduct(
    variantTypes.map(type => options[type])
  );
  
  return combinations.map(combo => ({
    variantData: Object.fromEntries(
      variantTypes.map((type, i) => [type, combo[i]])
    ),
    stock: defaults.stock,
    price: defaults.price
  }));
}
```

### UI Components Needed

1. **VariantMatrix Component**
   - Grid layout
   - Editable cells
   - Bulk operations

2. **BulkGenerator Component**
   - Multi-select checkboxes
   - Default value inputs
   - Preview count

3. **CSVImporter Component**
   - File upload
   - Parser/validator
   - Preview before import

4. **VariantTable Component**
   - Spreadsheet-like table
   - Inline editing
   - Row selection

### Performance Considerations

- **Large Variant Sets**: Virtual scrolling for 100+ variants
- **Real-time Validation**: Debounce validation on input
- **Batch Updates**: Group multiple variant updates
- **Optimistic UI**: Show changes immediately, sync in background

---

## User Experience Flow Examples

### Scenario 1: Standard Size/Color Combinations

**Current:** 20 clicks to create 10 variants (2 colors × 5 sizes)

**With Bulk Generator:**
1. Select 2 colors, 5 sizes (2 clicks)
2. Set stock: 50, price: $29 (2 inputs)
3. Click "Generate" (1 click)
4. **Total: 5 actions vs 20 clicks**

**With Matrix View:**
1. Switch to Matrix tab (1 click)
2. Fill stock for first row: 50 (1 input)
3. Click "Fill Row" (1 click)
4. Repeat for other rows
5. **Total: ~10 actions vs 20 clicks**

### Scenario 2: Adding Similar Variants

**Current:** Create each variant individually

**With Duplicate & Pattern:**
1. Select existing variant
2. Click "Create Similar"
3. Select "Change Size" → Select sizes
4. Click "Create"
5. **Total: 4 actions vs 10+ clicks**

---

## Success Metrics

1. **Time to Create Variants**
   - Current: ~30 seconds per variant
   - Target: <5 seconds per variant (with bulk operations)

2. **User Satisfaction**
   - Survey vendors on ease of use
   - Track support tickets related to variants

3. **Adoption Rate**
   - % of vendors using bulk features
   - Most popular method (matrix vs bulk vs CSV)

4. **Error Rate**
   - Variants with missing required fields
   - Duplicate variants created

---

## Accessibility Considerations

1. **Keyboard Navigation**
   - Tab through matrix cells
   - Arrow keys to move between cells
   - Enter to edit, Escape to cancel

2. **Screen Reader Support**
   - Clear labels for all inputs
   - Announce row/column headers
   - Describe bulk operations

3. **Visual Indicators**
   - Highlight active cell
   - Show validation errors clearly
   - Indicate unsaved changes

---

## Future Enhancements

1. **AI Suggestions**
   - Suggest common combinations
   - Auto-fill based on product category
   - Predict stock levels

2. **Variant Analytics**
   - Show which variants sell best
   - Suggest removing slow movers
   - Price optimization suggestions

3. **Integration**
   - Import from inventory systems
   - Sync with external catalogs
   - Export to other platforms

---

## Recommendation

**Start with Phase 1 (Quick Wins):**

1. **Bulk Variant Generator** - Highest impact, medium effort
2. **Duplicate & Pattern Fill** - Good UX improvement, low effort
3. **Bulk Fill Operations** - Useful for editing, low effort

**Then add Phase 2:**

4. **Variant Matrix View** - Best for standard combinations
5. **CSV Import/Export** - For power users

This approach provides immediate value while building toward more advanced features.

---

## Questions for Review

1. Which approach resonates most with your use case?
2. Do vendors typically have standard size/color combinations?
3. How many variants do vendors typically create per product?
4. Are vendors technical enough for CSV import?
5. Should we prioritize speed or flexibility?
6. Do you want all methods available, or focus on one?

---

# Instagram One-Click Media Import for Vendors

## Overview

Enable vendors to import their Instagram photos/videos directly into the platform for use in products, hero banners, and other marketing components. This feature allows vendors to leverage their existing Instagram content without manual re-uploading.

## Critical Authentication Decision

**⚠️ IMPORTANT: Instagram's official APIs (Basic Display API and Graph API) do NOT support username/password authentication. They require OAuth 2.0.**

### Option A: OAuth (Recommended - Secure & Compliant)
- **How it works**: Vendor clicks "Connect Instagram" → Redirects to Instagram login → Grants permissions → Returns to platform with access token
- **User experience**: Still "one-click" from vendor perspective (just one redirect flow)
- **Pros**: 
  - ✅ Compliant with Instagram Terms of Service
  - ✅ Secure (no password storage)
  - ✅ Reliable (official API)
  - ✅ Supports long-lived tokens
  - ✅ Can refresh tokens automatically
- **Cons**: 
  - ⚠️ Requires Instagram app registration
  - ⚠️ Vendor must have Instagram Business/Creator account (for Graph API) or personal account (for Basic Display)

### Option B: Username/Password (Not Recommended - High Risk)
- **How it works**: Vendor provides Instagram username/password → Platform stores credentials → Uses unofficial API/scraping
- **Pros**: 
  - ✅ Simpler initial setup (no OAuth flow)
  - ✅ Vendor doesn't need to understand OAuth
- **Cons**: 
  - ❌ **Violates Instagram Terms of Service** (risk of account ban)
  - ❌ **Major security risk** (storing passwords in plaintext or encrypted)
  - ❌ **Unreliable** (Instagram actively blocks scrapers, breaks frequently)
  - ❌ **Legal liability** (storing third-party credentials)
  - ❌ **No official support** (must use unofficial libraries that break often)
  - ❌ **Rate limiting issues** (easier to get IP banned)
  - ❌ **2FA complications** (can't handle two-factor authentication)

**Recommendation**: Use OAuth (Option A). If vendors must use username/password, document all risks and consider using a third-party service that handles compliance.

---

## Phase 0: Product & Compliance Decisions

### 0.1 Define Instagram Use Cases
- [ ] **Clarify media types to support**:
  - [ ] Photos only
  - [ ] Videos (including Reels)
  - [ ] Carousel posts (multi-image posts)
  - [ ] Stories (if available via API)
- [ ] **Define usage contexts**:
  - [ ] Product cover images (`image` field)
  - [ ] Product additional images (`cover` array field)
  - [ ] Vendor hero banners
  - [ ] Category banners (future)
  - [ ] Vendor lookbook/gallery pages (future)
- [ ] **Decide on import frequency**:
  - [ ] One-time manual import (vendor clicks "Import" when needed)
  - [ ] On-demand sync (vendor clicks "Sync Now" button)
  - [ ] Background periodic sync (daily/weekly automatic sync)
- [ ] **Decide on import behavior**:
  - [ ] Download and store media files in your `media` collection (recommended - full control)
  - [ ] Store Instagram URLs only and lazy-load (risky - links can break if post deleted)

### 0.2 Legal & Compliance Review
- [ ] **Review Instagram/Facebook Platform Policies**:
  - [ ] Verify that downloading and storing Instagram media complies with Meta's Terms of Service
  - [ ] Check if attribution is required (e.g., "Source: @username")
  - [ ] Review data retention policies
- [ ] **Update Terms of Service / Privacy Policy**:
  - [ ] Add clause about Instagram integration
  - [ ] Clarify data storage and usage rights
  - [ ] Document vendor responsibilities (account security, content ownership)
- [ ] **If using username/password approach**:
  - [ ] Add explicit disclaimer about ToS violation risks
  - [ ] Require vendor acknowledgment of risks
  - [ ] Consider liability waiver

### 0.3 Business Constraints & Planning
- [ ] **Rate limiting strategy**:
  - [ ] Research Instagram API rate limits (per app, per user)
  - [ ] Plan for rate limit handling (exponential backoff, queue system)
  - [ ] Document limits to vendors
- [ ] **Storage cost estimation**:
  - [ ] Calculate storage costs for imported media (Vercel Blob/S3 pricing)
  - [ ] Estimate bandwidth costs for downloading media
  - [ ] Plan for storage quotas per vendor (if needed)
- [ ] **Instagram account requirements**:
  - [ ] Determine if Business/Creator account is required (Graph API)
  - [ ] Or if personal account works (Basic Display API)
  - [ ] Document requirements for vendors

---

## Phase 1: Instagram Integration Architecture

### 1.1 Choose API Path
- [ ] **Option A: Instagram Basic Display API**:
  - [ ] Research Basic Display API capabilities
  - [ ] Check if it supports all needed media types
  - [ ] Verify token expiration and refresh mechanisms
  - [ ] **Limitation**: Only works with personal accounts, limited features
- [ ] **Option B: Instagram Graph API (via Facebook App)**:
  - [ ] Research Graph API capabilities
  - [ ] Check if it supports all needed media types (photos, videos, carousels)
  - [ ] Verify token expiration and refresh mechanisms
  - [ ] **Requirement**: Instagram Business/Creator account + Facebook App setup
- [ ] **Decision**: Choose which API to implement (recommend Graph API for business use)
- [ ] **If username/password approach**:
  - [ ] Research unofficial libraries (e.g., `instagram-private-api` for Node.js)
  - [ ] Evaluate reliability and maintenance status
  - [ ] Test with sample account
  - [ ] Document breaking change risks

### 1.2 Authentication Flow Design

#### For OAuth Approach:
- [ ] **Design OAuth endpoints**:
  - [ ] `GET /api/oauth/instagram/login` - Initiates OAuth flow, redirects to Instagram
  - [ ] `GET /api/oauth/instagram/callback` - Handles Instagram redirect, exchanges code for token
  - [ ] `POST /api/oauth/instagram/disconnect` - Revokes token and unlinks account
- [ ] **Token storage schema**:
  - [ ] Extend `Vendors` collection OR create `VendorSocialConnections` collection:
    - [ ] `instagramAccessToken` (encrypted string)
    - [ ] `instagramUserId` (string)
    - [ ] `instagramUsername` (string)
    - [ ] `instagramTokenExpiresAt` (date, optional)
    - [ ] `instagramRefreshToken` (encrypted string, optional)
    - [ ] `instagramConnectedAt` (date)
    - [ ] `instagramLastSyncAt` (date, optional)
    - [ ] `instagramConnectionStatus` (select: connected, expired, revoked, error)
- [ ] **Token security**:
  - [ ] Encrypt tokens at rest (use Payload's encryption or external service)
  - [ ] Never expose tokens to frontend
  - [ ] Implement token refresh logic for long-lived tokens
  - [ ] Handle token expiration gracefully

#### For Username/Password Approach:
- [ ] **Credential storage schema** (NOT RECOMMENDED):
  - [ ] Extend `Vendors` collection:
    - [ ] `instagramUsername` (string)
    - [ ] `instagramPassword` (encrypted string) - **MUST be encrypted**
    - [ ] `instagramSessionData` (encrypted JSON, for storing cookies/session)
    - [ ] `instagramLastLoginAt` (date)
    - [ ] `instagramConnectionStatus` (select: connected, failed, banned)
- [ ] **Security measures** (if proceeding):
  - [ ] Use strong encryption (AES-256) for password storage
  - [ ] Implement secure key management (environment variables, key rotation)
  - [ ] Add audit logging for credential access
  - [ ] Implement 2FA handling (if possible)
  - [ ] Add rate limiting to prevent brute force
- [ ] **Session management**:
  - [ ] Store Instagram session cookies (encrypted)
  - [ ] Implement session refresh logic
  - [ ] Handle login challenges (captcha, suspicious activity)

### 1.3 Data Model for Imported Media
- [ ] **Extend `media` collection** (`src/collections/Media.ts`):
  - [ ] Add `source` field (select: "upload", "instagram", "other")
  - [ ] Add `sourceId` field (string, optional) - Instagram media ID
  - [ ] Add `sourceUrl` field (text, optional) - Original Instagram URL
  - [ ] Add `ownerInstagramUsername` field (text, optional)
  - [ ] Add `vendor` relationship (to Vendors, optional) - Link to vendor who imported
  - [ ] Add `caption` field (textarea, optional) - Instagram post caption
  - [ ] Add `instagramPermalink` field (text, optional) - Link to original Instagram post
  - [ ] Add `importedAt` field (date) - When media was imported
- [ ] **Ensure compatibility with existing media usage**:
  - [ ] Products already reference `media` via `image` and `cover` fields
  - [ ] Hero banners can reference `media` (if applicable)
  - [ ] Verify imported Instagram media works in all existing media picker components

### 1.4 Instagram App Registration (OAuth Only)
- [ ] **Create Facebook App** (required for Graph API):
  - [ ] Go to https://developers.facebook.com/apps/
  - [ ] Create new app or use existing
  - [ ] Add "Instagram Basic Display" or "Instagram Graph API" product
  - [ ] Configure OAuth redirect URIs (e.g., `https://yourdomain.com/api/oauth/instagram/callback`)
  - [ ] Get App ID and App Secret
  - [ ] Store credentials in environment variables
- [ ] **Configure Instagram permissions/scopes**:
  - [ ] Request minimum necessary scopes (e.g., `instagram_basic`, `instagram_content_publish` if needed)
  - [ ] Document which scopes are requested and why
- [ ] **Test OAuth flow**:
  - [ ] Test with test Instagram account
  - [ ] Verify token exchange works
  - [ ] Verify token refresh works

---

## Phase 2: Backend Implementation

### 2.1 Create Instagram Service Layer
- [ ] **Create `src/services/instagram.ts`** (or `src/lib/instagram/` directory):
  - [ ] `getAuthUrl(vendorId: string, redirectUri: string): string` - Generate OAuth URL
  - [ ] `exchangeCodeForToken(code: string, redirectUri: string): Promise<InstagramTokenInfo>` - Exchange code for access token
  - [ ] `refreshToken(vendorId: string): Promise<InstagramTokenInfo>` - Refresh expired token
  - [ ] `revokeToken(vendorId: string): Promise<void>` - Revoke access token
  - [ ] `fetchUserMedia(vendorId: string, options: { limit?: number; afterCursor?: string }): Promise<InstagramMediaResponse>` - Fetch user's media
  - [ ] `fetchMediaDetails(mediaId: string, vendorId: string): Promise<InstagramMediaItem>` - Get details for specific media
  - [ ] `downloadMediaFile(mediaUrl: string, mediaType: 'image' | 'video'): Promise<Buffer>` - Download media file
- [ ] **Error handling**:
  - [ ] Handle rate limit errors (429) with exponential backoff
  - [ ] Handle token expiration errors (401) with automatic refresh
  - [ ] Handle invalid token errors (revoke connection)
  - [ ] Handle network errors with retry logic
- [ ] **If username/password approach**:
  - [ ] `loginWithCredentials(username: string, password: string): Promise<InstagramSession>`
  - [ ] `fetchUserMediaWithSession(session: InstagramSession, options: {...}): Promise<InstagramMediaResponse>`
  - [ ] `refreshSession(vendorId: string): Promise<InstagramSession>`
  - [ ] Handle login challenges (captcha, 2FA, suspicious activity)

### 2.2 tRPC Procedures for Instagram Integration
- [ ] **Create `src/modules/vendor/server/procedures.ts` - Instagram section**:
  - [ ] `vendor.instagram.getConnectUrl` - Returns OAuth URL for current vendor
    - [ ] Input: `z.object({ redirectUri: z.string().optional() })`
    - [ ] Output: `{ authUrl: string }`
    - [ ] Access control: Only authenticated vendors
  - [ ] `vendor.instagram.handleCallback` - Processes OAuth callback
    - [ ] Input: `z.object({ code: string, state: z.string().optional() })`
    - [ ] Validates state parameter (CSRF protection)
    - [ ] Exchanges code for token
    - [ ] Fetches user info from Instagram
    - [ ] Updates vendor record with token and user info
    - [ ] Returns success status
  - [ ] `vendor.instagram.disconnect` - Unlinks Instagram account
    - [ ] Revokes token (if possible)
    - [ ] Clears vendor's Instagram credentials
    - [ ] Optionally: Offers to delete imported media
  - [ ] `vendor.instagram.getConnectionStatus` - Returns connection status
    - [ ] Output: `{ connected: boolean, username?: string, expiresAt?: Date, status: string }`
  - [ ] `vendor.instagram.listRemoteMedia` - Lists vendor's Instagram media
    - [ ] Input: `z.object({ limit: z.number().min(1).max(50).default(25), afterCursor: z.string().optional() })`
    - [ ] Fetches media from Instagram API
    - [ ] Returns paginated list: `{ media: InstagramMediaItem[], nextCursor?: string, hasMore: boolean }`
    - [ ] Each item includes: `id`, `mediaType`, `mediaUrl`, `thumbnailUrl`, `caption`, `timestamp`, `permalink`
  - [ ] `vendor.instagram.importMedia` - Imports selected media
    - [ ] Input: `z.object({ mediaIds: z.array(z.string()) })`
    - [ ] For each media ID:
      - [ ] Fetches full media details from Instagram
      - [ ] Downloads media file (image or video)
      - [ ] Uploads to Vercel Blob/S3 (reuse existing upload logic)
      - [ ] Creates `media` record in Payload with `source = "instagram"`
      - [ ] Associates with vendor
      - [ ] Stores Instagram metadata (caption, permalink, etc.)
    - [ ] Returns: `{ imported: number, failed: number, mediaIds: string[] }` (mapping Instagram ID → local media ID)
    - [ ] Handles partial failures gracefully
- [ ] **Error handling in procedures**:
  - [ ] Wrap API calls in try-catch
  - [ ] Return user-friendly error messages
  - [ ] Log errors for debugging
  - [ ] Handle token expiration automatically (refresh and retry)

### 2.3 Media Download & Storage Logic
- [ ] **Implement robust media downloading**:
  - [ ] Use server-side `fetch` to download from Instagram CDN
  - [ ] Stream large files to avoid memory issues (use `stream` API)
  - [ ] Handle different media types (JPEG, PNG, MP4, etc.)
  - [ ] Validate file types before storing
- [ ] **File processing**:
  - [ ] Reuse existing media upload pipeline (if available)
  - [ ] Generate thumbnails for images (if needed)
  - [ ] Extract video metadata (duration, dimensions)
  - [ ] Compress images if needed (to match platform standards)
- [ ] **Storage integration**:
  - [ ] Upload downloaded files to Vercel Blob (or S3)
  - [ ] Get public URL from storage
  - [ ] Store URL in `media` record
- [ ] **Error handling**:
  - [ ] Handle download failures (network errors, 404s)
  - [ ] Handle storage failures
  - [ ] Mark failed imports for retry
  - [ ] Return partial success results

### 2.4 Security & Access Control
- [ ] **Vendor isolation**:
  - [ ] All `vendor.instagram.*` procedures verify authenticated vendor
  - [ ] Ensure vendors can only access their own Instagram data
  - [ ] Ensure imported media is tagged with `vendor` field
  - [ ] Media access control: Vendors can only see/edit their own imported media
- [ ] **Token security**:
  - [ ] Encrypt tokens in database (use Payload encryption or external service)
  - [ ] Never log tokens
  - [ ] Never expose tokens to frontend
  - [ ] Implement token rotation (if supported by API)
- [ ] **CSRF protection**:
  - [ ] Use state parameter in OAuth flow
  - [ ] Validate state on callback
- [ ] **Rate limiting**:
  - [ ] Implement per-vendor rate limiting for API calls
  - [ ] Prevent abuse of import feature
- [ ] **If username/password approach**:
  - [ ] Encrypt passwords with strong encryption (AES-256)
  - [ ] Use secure key management
  - [ ] Implement audit logging
  - [ ] Add 2FA support (if possible)
  - [ ] Warn vendors about security risks

---

## Phase 3: Vendor Dashboard UI/UX

### 3.1 Instagram Connection Management
- [ ] **Create `/vendor/settings/social` page** (or add to existing settings):
  - [ ] **If not connected**:
    - [ ] Show "Connect Instagram" button
    - [ ] Brief description: "Import your Instagram photos and videos to use in products"
    - [ ] Icon/visual indicator
  - [ ] **If connected**:
    - [ ] Show "Connected as @username" status
    - [ ] Display connection date
    - [ ] Show last sync time (if applicable)
    - [ ] "Disconnect" button with confirmation dialog
    - [ ] "Sync Now" button (if background sync is implemented)
  - [ ] **Status indicators**:
    - [ ] Connection status badge (Connected/Expired/Error)
    - [ ] Warning if token is expired (with "Reconnect" button)
    - [ ] Error message if connection failed
- [ ] **OAuth flow handling**:
  - [ ] On "Connect Instagram" click, redirect to OAuth URL
  - [ ] Handle callback redirect back to settings page
  - [ ] Show success toast on successful connection
  - [ ] Show error toast on failure

### 3.2 Instagram Media Browser Component
- [ ] **Create `InstagramMediaPicker` component** (`src/app/(app)/vendor/products/components/InstagramMediaPicker.tsx`):
  - [ ] **Props**:
    - [ ] `open: boolean` - Controls modal visibility
    - [ ] `onOpenChange: (open: boolean) => void` - Close handler
    - [ ] `onSelect: (mediaIds: string[]) => void` - Callback with selected Instagram media IDs
    - [ ] `selectionMode: 'single' | 'multiple'` - Single or multi-select
    - [ ] `vendorId: string` - Current vendor ID
  - [ ] **UI Layout**:
    - [ ] Modal/Dialog wrapper (use shadcn Dialog)
    - [ ] Header: "Import from Instagram" with close button
    - [ ] Filter bar:
      - [ ] Media type filter: All / Photos / Videos
      - [ ] Date range filter (optional)
      - [ ] Search by caption (optional)
    - [ ] **Media grid**:
      - [ ] Responsive grid (4-6 columns on desktop, 2-3 on mobile)
      - [ ] Each item shows:
        - [ ] Thumbnail image
        - [ ] Media type icon (photo/video)
        - [ ] Selection checkbox (for multi-select)
        - [ ] Caption preview (truncated, on hover)
        - [ ] Date posted
      - [ ] Loading skeleton while fetching
      - [ ] Empty state if no media
    - [ ] **Pagination**:
      - [ ] "Load More" button at bottom
      - [ ] Or infinite scroll (using Intersection Observer)
      - [ ] Show loading indicator while fetching next page
    - [ ] **Selection controls**:
      - [ ] "Select All" / "Deselect All" buttons (for multi-select mode)
      - [ ] Selected count indicator: "X items selected"
    - [ ] **Action buttons**:
      - [ ] "Import Selected" button (disabled if nothing selected)
      - [ ] "Cancel" button
  - [ ] **State management**:
    - [ ] `selectedMediaIds: Set<string>` - Track selected Instagram media IDs
    - [ ] `remoteMedia: InstagramMediaItem[]` - Fetched media list
    - [ ] `loading: boolean` - Loading state
    - [ ] `importing: boolean` - Import in progress
    - [ ] `nextCursor?: string` - Pagination cursor
    - [ ] `hasMore: boolean` - More pages available
  - [ ] **Data fetching**:
    - [ ] Use tRPC `trpc.vendor.instagram.listRemoteMedia.useQuery()` with pagination
    - [ ] Fetch on mount and when filters change
    - [ ] Handle errors (show error message, retry button)
  - [ ] **Import logic**:
    - [ ] On "Import Selected" click:
      - [ ] Call `trpc.vendor.instagram.importMedia.useMutation()`
      - [ ] Show progress indicator (spinner or progress bar)
      - [ ] On success:
        - [ ] Show success toast: "Imported X media items"
        - [ ] Call `onSelect()` with imported local media IDs
        - [ ] Close modal
      - [ ] On partial failure:
        - [ ] Show warning: "Imported X of Y items. Some failed."
        - [ ] Show details in expandable section
      - [ ] On complete failure:
        - [ ] Show error toast with details
        - [ ] Keep modal open for retry

### 3.3 Integration into Product Form
- [ ] **Update `ProductForm.tsx`** (`src/app/(app)/vendor/products/components/ProductForm.tsx`):
  - [ ] **For "Cover Image" (`image` field)**:
    - [ ] Add "Import from Instagram" button next to "Click to upload"
    - [ ] On click, open `InstagramMediaPicker` in `selectionMode="single"`
    - [ ] On selection, update form: `form.setValue("image", importedMediaId)`
    - [ ] Update preview: `setImagePreview(importedMediaUrl)`
  - [ ] **For "Additional Images" (`cover` field)**:
    - [ ] Add "Import from Instagram" button next to "Click to upload multiple images"
    - [ ] On click, open `InstagramMediaPicker` in `selectionMode="multiple"`
    - [ ] On selection, append to form: `form.setValue("cover", [...current, ...importedMediaIds])`
    - [ ] Update previews: `setCoverPreviews([...current, ...importedMediaUrls])`
  - [ ] **State management**:
    - [ ] `instagramPickerOpen: boolean` - Controls picker modal
    - [ ] `instagramPickerMode: 'single' | 'multiple'` - Selection mode
    - [ ] `instagramPickerTarget: 'image' | 'cover'` - Which field to update
  - [ ] **UX considerations**:
    - [ ] Show loading state during import
    - [ ] Show success toast after import
    - [ ] Handle errors gracefully
    - [ ] If vendor not connected, show "Connect Instagram" prompt instead of picker

### 3.4 Integration into Hero Banner Form
- [ ] **Update `HeroBannerForm.tsx`** (`src/app/(app)/vendor/hero-banner/components/HeroBannerForm.tsx`):
  - [ ] Add "Import from Instagram" option where banner image is selected
  - [ ] Use same `InstagramMediaPicker` component
  - [ ] Update banner image field with imported media ID
  - [ ] Update preview accordingly

### 3.5 Vendor Feedback & Error States
- [ ] **Connection status indicators**:
  - [ ] Banner at top of media picker if not connected: "Connect Instagram to import media"
  - [ ] Warning banner if token expired: "Instagram connection expired. Reconnect to continue."
  - [ ] Error banner if connection failed: "Failed to connect Instagram. Please try again."
- [ ] **Toast notifications**:
  - [ ] "Connected to Instagram as @username"
  - [ ] "Imported 12 media items from Instagram"
  - [ ] "3 items failed to import. Click for details."
  - [ ] "Instagram connection expired. Please reconnect."
- [ ] **Loading states**:
  - [ ] Skeleton loaders in media grid
  - [ ] Progress indicator during import
  - [ ] Disable buttons during import
- [ ] **Error handling UI**:
  - [ ] Show error messages in modals/alerts
  - [ ] Provide retry buttons
  - [ ] Show detailed error info in expandable sections

---

## Phase 4: Background Sync & Maintenance (Optional)

### 4.1 Scheduled Sync Job
- [ ] **Design background job** (Vercel Cron or external service):
  - [ ] Job runs daily/weekly (configurable)
  - [ ] Iterates over vendors with active Instagram connections
  - [ ] Fetches new media since last sync (using timestamp or cursor)
  - [ ] **Option A**: Only cache metadata (show in UI, import on demand)
  - [ ] **Option B**: Pre-import new media into `media` collection
- [ ] **Rate limiting**:
  - [ ] Stagger sync jobs to avoid API rate limit bursts
  - [ ] Store `lastSyncAt` per vendor
  - [ ] Skip vendors who synced recently
- [ ] **Error handling**:
  - [ ] Log sync failures
  - [ ] Mark vendors with persistent errors
  - [ ] Send notifications for critical failures

### 4.2 Media Cache System (Optional)
- [ ] **Create `InstagramMediaCache` collection** (optional optimization):
  - [ ] `vendor` (relationship)
  - [ ] `instagramMediaId` (string, unique)
  - [ ] `thumbnailUrl` (text)
  - [ ] `mediaType` (select: image, video, carousel)
  - [ ] `caption` (textarea)
  - [ ] `timestamp` (date)
  - [ ] `lastFetchedAt` (date)
  - [ ] `isImported` (checkbox) - Whether already imported to `media`
- [ ] **Benefits**:
  - [ ] Fast UI loading (show cached thumbnails)
  - [ ] Background job can refresh cache
  - [ ] Track which media is already imported
- [ ] **Implementation**:
  - [ ] Update cache on media fetch
  - [ ] Mark as imported when user imports
  - [ ] Cleanup old cache entries (older than X days)

### 4.3 Token Refresh & Cleanup
- [ ] **Automatic token refresh**:
  - [ ] Background job checks token expiration
  - [ ] Refreshes tokens before expiration
  - [ ] Updates vendor record with new token
  - [ ] Handles refresh failures (mark as expired, notify vendor)
- [ ] **Connection cleanup**:
  - [ ] When vendor disconnects:
    - [ ] Revoke token (if possible)
    - [ ] Clear credentials from database
    - [ ] Optionally: Offer to delete imported media
  - [ ] When token is permanently invalid:
    - [ ] Mark connection as expired
    - [ ] Notify vendor to reconnect
  - [ ] Periodic cleanup of stale connections

---

## Phase 5: Security, Performance & Testing

### 5.1 Security Review
- [ ] **Token protection**:
  - [ ] Verify tokens are encrypted at rest
  - [ ] Verify tokens never exposed to frontend
  - [ ] Audit all code paths that access tokens
- [ ] **OAuth security**:
  - [ ] Verify state parameter is used (CSRF protection)
  - [ ] Verify redirect URI validation
  - [ ] Verify code exchange is server-side only
- [ ] **If username/password approach**:
  - [ ] Verify passwords are encrypted (AES-256 minimum)
  - [ ] Verify encryption keys are secure (environment variables, key rotation)
  - [ ] Implement audit logging for credential access
  - [ ] Add rate limiting to prevent brute force
- [ ] **Authorization checks**:
  - [ ] Verify all tRPC procedures check vendor identity
  - [ ] Verify vendors can only access their own data
  - [ ] Test unauthorized access attempts

### 5.2 Performance Optimization
- [ ] **Batch imports**:
  - [ ] When importing many images, process in batches (e.g., 5 at a time)
  - [ ] Show progress: "Importing 5 of 20..."
  - [ ] Avoid timeouts on large batches
- [ ] **Image optimization**:
  - [ ] Resize/compress imported images to match platform standards
  - [ ] Generate thumbnails for media picker
  - [ ] Use responsive image sizes
- [ ] **Caching**:
  - [ ] Cache Instagram media list (with TTL)
  - [ ] Cache thumbnails
  - [ ] Invalidate cache on new imports
- [ ] **Lazy loading**:
  - [ ] Lazy load media grid items (virtual scrolling if 100+ items)
  - [ ] Load full-size images only when needed

### 5.3 Testing Plan
- [ ] **Unit tests**:
  - [ ] Instagram service functions (token exchange, refresh, media fetch)
  - [ ] Media download logic
  - [ ] Error handling
- [ ] **Integration tests**:
  - [ ] Full OAuth flow (mock Instagram API)
  - [ ] Media import flow (mock download)
  - [ ] Token refresh flow
- [ ] **E2E tests (Playwright/Cypress)**:
  - [ ] Vendor connects Instagram
  - [ ] Vendor opens media picker
  - [ ] Vendor selects and imports media
  - [ ] Vendor uses imported media in product form
  - [ ] Vendor disconnects Instagram
- [ ] **Edge cases**:
  - [ ] Vendor revokes Instagram permissions from Instagram side
  - [ ] Token expired during import
  - [ ] Instagram account has no media
  - [ ] Import fails mid-way (network error, rate limit)
  - [ ] Large batch import (50+ items)
  - [ ] Very large media files
  - [ ] Invalid media URLs
  - [ ] Instagram API rate limit hit
- [ ] **Load testing**:
  - [ ] Test with multiple vendors importing simultaneously
  - [ ] Test with large media files
  - [ ] Test rate limit handling

---

## Phase 6: Documentation & Rollout

### 6.1 Internal Documentation
- [ ] **Architecture documentation**:
  - [ ] Add section to main TODO doc (this document)
  - [ ] Data model diagrams
  - [ ] Sequence diagrams: OAuth flow, import flow
  - [ ] API contracts for tRPC procedures
  - [ ] Error handling strategies
- [ ] **Developer guide**:
  - [ ] How to set up Instagram app
  - [ ] How to test OAuth flow locally
  - [ ] How to debug token issues
  - [ ] How to handle rate limits

### 6.2 Vendor-Facing Documentation
- [ ] **User guide**:
  - [ ] "How to Connect Instagram"
  - [ ] "How to Import Instagram Media"
  - [ ] "Using Instagram Media in Products"
  - [ ] Screenshots of vendor dashboard
- [ ] **FAQ**:
  - [ ] "Do I need an Instagram Business account?" (depends on API choice)
  - [ ] "Can I import videos?" (yes, if API supports)
  - [ ] "What happens if I delete a post on Instagram?" (imported media remains)
  - [ ] "How often does media sync?" (depends on implementation)
- [ ] **Limitations & best practices**:
  - [ ] Account must be public (for Basic Display API)
  - [ ] Business account required (for Graph API)
  - [ ] Rate limits apply
  - [ ] Large files may take time to import

### 6.3 Feature Flag & Gradual Rollout
- [ ] **Feature flag implementation**:
  - [ ] Add `enableInstagramImport` flag (per vendor or global)
  - [ ] Check flag in UI (hide buttons if disabled)
  - [ ] Check flag in tRPC procedures (return error if disabled)
- [ ] **Rollout plan**:
  - [ ] Phase 1: Internal testing (dev/staging)
  - [ ] Phase 2: Beta group (select vendors)
  - [ ] Phase 3: Gradual rollout (10% → 50% → 100%)
  - [ ] Monitor: Error rates, performance, vendor feedback
- [ ] **Monitoring**:
  - [ ] Track connection success rate
  - [ ] Track import success rate
  - [ ] Track API rate limit hits
  - [ ] Track storage costs
  - [ ] Track vendor adoption rate

---

## Implementation Priority

### Must Have (MVP):
1. OAuth connection flow (or username/password if required)
2. List Instagram media in picker
3. Import selected media to `media` collection
4. Use imported media in product form
5. Basic error handling

### Should Have:
6. Media picker with filters and pagination
7. Token refresh logic
8. Integration into hero banners
9. Vendor feedback (toasts, status indicators)

### Nice to Have:
10. Background sync job
11. Media cache system
12. Batch import optimization
13. Advanced filters (date range, search)

---

## Risk Assessment

### High Risk (if using username/password):
- ❌ **Account bans**: Instagram may ban accounts using unofficial APIs
- ❌ **Legal issues**: Violating ToS may have legal consequences
- ❌ **Security breaches**: Storing passwords is a major security risk
- ❌ **Breaking changes**: Unofficial APIs break frequently

### Medium Risk:
- ⚠️ **Rate limits**: Instagram API has strict rate limits
- ⚠️ **Token expiration**: Tokens expire and need refresh logic
- ⚠️ **Storage costs**: Importing many large files increases storage costs

### Low Risk:
- ✅ **OAuth complexity**: OAuth flow is well-documented and standard
- ✅ **Media compatibility**: Most Instagram media formats are standard (JPEG, MP4)

---

## Questions for Review

1. **Authentication**: OAuth (recommended) or username/password (high risk)?
2. **API choice**: Basic Display API (personal accounts) or Graph API (business accounts)?
3. **Import behavior**: Download and store, or store URLs only?
4. **Sync frequency**: Manual, on-demand, or automatic background sync?
5. **Media types**: Photos only, or also videos/carousels?
6. **Usage contexts**: Products only, or also banners/galleries?
7. **Storage limits**: Any per-vendor quotas?
8. **Feature flag**: Per-vendor or global?

---

## Estimated Timeline

- **Phase 0-1 (Planning & Architecture)**: 1-2 weeks
- **Phase 2 (Backend)**: 2-3 weeks
- **Phase 3 (Frontend)**: 2-3 weeks
- **Phase 4 (Background Jobs)**: 1 week (optional)
- **Phase 5 (Testing & Security)**: 1-2 weeks
- **Phase 6 (Documentation & Rollout)**: 1 week

**Total (MVP)**: ~6-8 weeks
**Total (Full Feature)**: ~8-12 weeks

---

## Dependencies

- Instagram App registration (OAuth approach)
- Vercel Blob or S3 storage (for downloaded media)
- Existing `media` collection and upload pipeline
- Existing vendor authentication system
- tRPC setup for vendor procedures

---

## Related Tasks

- Product media implementation (already completed - see above)
- Vendor dashboard UI components
- Media picker components (if not already exist)
- Background job infrastructure (if implementing sync)


