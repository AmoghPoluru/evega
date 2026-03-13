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

## Summary

**Total Tasks Documented: 305**

**Completed: ~210 tasks (69%)**
**Pending: ~95 tasks (31%)**

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
- ✅ Hero banners with carousel functionality
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
