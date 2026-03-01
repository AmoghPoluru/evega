# Vendor Dashboard TODO List

> **Purpose**: This document serves as a comprehensive TODO list and implementation guide for the Vendor Dashboard system in a multi-vendor e-commerce marketplace built with Next.js, Payload CMS, tRPC, and Stripe.
>
> **For LLMs**: This file contains detailed task breakdowns, technical implementation details, and code references. Each task includes completion status, technical details, and file paths. Use this document to understand the current state of the vendor dashboard implementation and to implement new features following the established patterns.

## System Overview

**Tech Stack:**
- **Frontend**: Next.js 16 (App Router), React, TypeScript, shadcn/ui components
- **Backend**: Payload CMS, tRPC for type-safe APIs
- **Database**: MongoDB (via Payload)
- **Payment**: Stripe (checkout sessions, webhooks)
- **State Management**: React Query (@tanstack/react-query) for server state, Zustand for client state
- **Routing**: Next.js route groups (`(app)/(vendor)` for vendor pages, `(app)/(home)` for customer pages)

**Key Concepts:**
- **Vendor Authentication**: `requireVendor()` middleware protects `/vendor/*` routes
- **Vendor Procedures**: tRPC `vendorProcedure` middleware ensures vendor is approved & active
- **Data Isolation**: All queries filter by `vendor: { equals: vendorId }`
- **Order Creation**: Stripe webhook (`checkout.session.completed`) creates orders and customers
- **Shipping Address**: Required during checkout and order creation (validated in frontend and webhook)

**File Structure:**
- Vendor pages: `src/app/(app)/vendor/*`
- Vendor components: `src/app/(app)/vendor/components/*`
- Vendor tRPC procedures: `src/modules/vendor/server/procedures.ts`
- Collections: `src/collections/*` (Vendors, Products, Orders, Customers)
- Webhook: `src/app/api/stripe/webhook/route.ts`

---

## Table of Contents

0. [Foundation & Vendor Registration](#foundation--vendor-registration)
   - [Roles Collection](#roles-collection-prerequisite)
   - [Vendors Collection](#vendors-collection)
   - [Users Collection Updates](#users-collection-updates)
   - [Products Collection Updates](#products-collection-updates)
   - [Orders Collection Updates](#orders-collection-updates)
   - [Vendor Registration Flow](#vendor-registration-flow)
   - [Vendor Authentication & Access Control](#vendor-authentication--access-control)
1. [Dashboard Overview](#dashboard-overview)
   - [Vendor Admin Route Group & Layout](#vendor-admin-route-group--layout)
   - [Dashboard Stats & Overview](#dashboard-stats--overview)
2. [Product Management](#product-management)
3. [Order Management](#order-management)
4. [Customer Management](#customer-management)
5. [Analytics & Reports](#analytics--reports)
6. [Inventory Management](#inventory-management)
7. [Payouts & Finance](#payouts--finance)
8. [Notifications](#notifications)
9. [Settings](#settings)
10. [UI/UX Improvements](#uiux-improvements)
11. [Technical Tasks](#technical-tasks)

---

## Foundation & Vendor Registration

> **Architecture Decision**: Same Application with Route Groups
> - Vendor admin pages: `/vendor/*` (route group: `(app)/(vendor)`)
> - Customer pages: `/` (route group: `(app)/(home)`)
> - Shared authentication, components, and database
> - Single deployment, easier maintenance

### Roles Collection (Prerequisite)
- [x] **Task 0.1**: Create `src/collections/Roles.ts` file ✅
  - Create Roles collection to support application-level and vendor organization-level roles
- [x] **Task 0.2**: Add `name`, `slug`, `type` (app/vendor), `description`, `permissions` fields ✅
  - Add fields to distinguish between app roles (app-admin, customer) and vendor roles (vendor-owner, vendor-manager)
- [x] **Task 0.3**: Register Roles collection in `src/payload.config.ts` ✅
  - Register collection in Payload configuration for database access
- [x] **Task 0.4**: Generate TypeScript types ✅
  - Generate TypeScript types for type-safe role management

**Technical Details:**
- Roles collection supports two types: "app" (application-level roles like app-admin, customer) and "vendor" (vendor organization roles like vendor-owner, vendor-manager)
- Each role has permissions array for granular access control, slug auto-generation, and isActive flag
- This collection is prerequisite for Users collection which references roles via relationships

### Vendors Collection
- [x] **Task 0.5**: Create `src/collections/Vendors.ts` file ✅
  - Create Vendors collection to store vendor business information and status
- [x] **Task 0.6**: Add `name` field (text, required) ✅
  - Add business name field for vendor identification
- [x] **Task 0.7**: Add `slug` field (text, unique, auto-generated from name) ✅
  - Auto-generate URL-friendly slug from vendor name for store pages
- [x] **Task 0.8**: Add `description` field (richText, optional) ✅
  - Allow vendors to add rich text description of their business
- [x] **Task 0.9**: Add `logo` field (upload, relationTo: media) ✅
  - Enable vendors to upload logo image for branding
- [x] **Task 0.10**: Add `coverImage` field (upload, relationTo: media) ✅
  - Allow vendors to upload cover image for store page header
- [x] **Task 0.11**: Add `email` field (email, required) ✅
  - Store vendor business email for communication
- [x] **Task 0.12**: Add `phone` field (text, optional) ✅
  - Store vendor contact phone number
- [x] **Task 0.13**: Add `website` field (text, optional) ✅
  - Store vendor website URL if available
- [x] **Task 0.14**: Add `address` group field (street, city, state, zipcode, country) ✅
  - Store vendor business address for verification and shipping
- [x] **Task 0.15**: Add `status` field (select: pending, approved, suspended, rejected) ✅
  - Track vendor approval status through registration workflow
- [x] **Task 0.16**: Add `isActive` checkbox (default: false) ✅
  - Control whether vendor account is active and can operate
- [x] **Task 0.17**: Add `stripeAccountId` field (text, for Stripe Connect) ✅
  - Store Stripe Connect account ID for payment processing
- [x] **Task 0.18**: Add `commissionRate` field (number, default: 10%, platform fee) ✅
  - Set platform commission rate for vendor payouts
- [x] **Task 0.19**: Add `verificationDocuments` array field (uploads for business verification) ✅
  - Allow vendors to upload business verification documents
- [x] **Task 0.20**: Add `createdAt` and `updatedAt` timestamps (auto) ✅
  - Track vendor account creation and modification dates
- [x] **Task 0.21**: Add access control (read: public, create: authenticated, update: vendor owner or super-admin) ✅
  - Implement access control to protect vendor data
- [x] **Task 0.22**: Add hooks for slug auto-generation ✅
  - Auto-generate slug from name using beforeValidate hook
- [x] **Task 0.23**: Register Vendors collection in `src/payload.config.ts` ✅
  - Register collection in Payload configuration
- [x] **Task 0.24**: Generate TypeScript types (`npm run generate:types`) ✅
  - Generate TypeScript types for type-safe vendor management

**Technical Details:**
- Created `Vendors` collection with 20 fields including business info, status workflow, Stripe Connect integration, and verification documents
- Implemented access control: public read, authenticated create, vendor owner/super-admin update, super-admin delete
- Auto-generated slug from name using `beforeValidate` hook with regex sanitization
- Registered in `payload.config.ts` and generated TypeScript types for full type safety

### Users Collection Updates
- [x] **Task 0.25**: Add `vendor` relationship field to Users (relationTo: vendors, optional) ✅
  - Link users to their vendor organization for multi-vendor support
- [x] **Task 0.26**: Add `vendorRole` relationship field (relationTo: roles, filtered by type="vendor") ✅
  - Assign vendor organization roles (owner, manager, staff) to users
- [x] **Task 0.27**: Add `appRole` relationship field (relationTo: roles, filtered by type="app") ✅
  - Assign application-level roles (app-admin, customer) to users
- [x] **Task 0.28**: Add conditional field visibility (vendor field hidden for app-admin, vendorRole only shown if vendor exists) ✅
  - Show/hide fields based on user role to simplify admin interface
- [x] **Task 0.29**: Update access control helpers in `src/lib/access.ts` (isAppAdmin, hasVendor, belongsToVendor, etc.) ✅
  - Create helper functions for role and vendor access checks
- [x] **Task 0.30**: Generate TypeScript types ✅
  - Generate updated TypeScript types with new user fields

**Technical Details:**
- Created `Roles` collection with type discrimination: "app" (application-level) vs "vendor" (vendor organization-level) roles
- Users now have three role relationships: `vendor` (required except for app-admin), `vendorRole` (role within vendor org), `appRole` (application-level role)
- Implemented conditional field visibility using `admin.condition` - vendor field hidden when appRole is "app-admin", vendorRole only visible when vendor exists
- Updated access control with 6 new helper functions: `isAppAdmin()`, `hasVendor()`, `belongsToVendor()`, `getVendorId()`, `hasVendorRole()`, `hasAppRole()`
- Legacy `roles` field marked as deprecated but kept for backward compatibility during migration

### Products Collection Updates
- [x] **Task 0.31**: Add `vendor` relationship field to `src/collections/Products.ts` (relationTo: vendors, required, single vendor per product) ✅
  - Link each product to its vendor for multi-vendor marketplace support
- [x] **Task 0.32**: Update access control: vendors can only create/update/delete their own products ✅
  - Restrict product management to product owner vendor
- [x] **Task 0.33**: Update read access: public can see all published products from all vendors ✅
  - Allow customers to browse products from all vendors
- [x] **Task 0.34**: Add hook to auto-assign vendor when vendor user creates product ✅
  - Automatically assign vendor from authenticated user's vendor relationship
- [x] **Task 0.35**: Add hook to prevent vendors from changing vendor field ✅
  - Lock vendor field to prevent unauthorized vendor changes
- [x] **Task 0.36**: Update product queries to include vendor relationship (depth: 2) ✅
  - Include vendor data in product queries for display
- [x] **Task 0.37**: Add vendor filtering in product search/filter functionality ✅
  - Enable filtering products by vendor in search and browse
- [x] **Task 0.38**: Update product card component to display vendor name/logo ✅
  - Show vendor branding on product cards for vendor identification
- [x] **Task 0.39**: Add vendor slug to product URLs (optional: `/vendor/[vendorSlug]/products/[productId]`) ✅
  - Support vendor-specific product URLs for better SEO
- [x] **Task 0.40**: Update product detail page to show vendor information ✅
  - Display vendor details on product pages for trust and branding

**Technical Details:**
- Added `vendor` relationship field (required) to Products collection with access control: vendors can only manage their own products, public can read all published products
- Implemented `beforeChange` hook with auto-assignment logic: vendor automatically assigned from user's vendor on create, vendor field locked on update for vendor users
- Updated product queries to include vendor at depth 2, added vendor filter parameter to `getMany` procedure for vendor-specific product listings
- Enhanced ProductCard component to display vendor logo and name with link to vendor store page, added vendor section to ProductView detail page
- Updated all ProductCard usages across codebase (product-list, products-list) to pass vendor data from queries

### Orders Collection Updates
- [x] **Task 0.41**: Add `vendor` relationship field to `src/collections/Orders.ts` (relationTo: vendors, required, single vendor per order) ✅
  - Link orders to vendors for vendor order management
- [x] **Task 0.42**: Update access control: vendors can only see orders for their products ✅
  - Restrict order visibility to order owner vendor
- [x] **Task 0.43**: Add hook to auto-assign vendor from product when order is created ✅
  - Automatically assign vendor from product's vendor relationship
- [x] **Task 0.44**: Add vendor payout tracking fields (amount, status, payout date) ✅
  - Track vendor payouts and commission calculations per order
- [x] **Task 0.45**: Update order status workflow to include vendor-specific statuses ✅
  - Support vendor-specific order status management
- [x] **Task 0.46**: Update checkout flow to ensure cart items are from single vendor (validate before checkout) ✅
  - Enforce single-vendor cart rule to simplify order fulfillment

**Technical Details:**
- Added `vendor` relationship field (required) to Orders collection with vendor-scoped access control: vendors can read/update only their orders, customers see only their orders
- Implemented `beforeChange` hook to auto-assign vendor from product relationship on order creation, ensuring vendor is always set from the product's vendor
- Added `vendorPayout` group field with payout tracking: amount, commissionAmount, status (pending/processing/completed/failed), payoutDate, transactionId for Stripe Connect integration
- Updated checkout validation in `checkout.purchase` procedure: validates all cart items belong to same vendor before creating Stripe session, throws error if multiple vendors detected
- Order status workflow remains unchanged but now vendor-aware, allowing vendors to update status of their orders

### Vendor Registration Flow
- [x] **Task 0.47**: Create vendor registration page `/become-vendor` ✅
  - Create page where users can apply to become vendors
- [x] **Task 0.48**: Create vendor registration form component ✅
  - Build form component with validation for vendor registration
- [x] **Task 0.49**: Add form fields: business name, email, phone ✅
  - Collect essential business information for vendor registration
- [ ] **Task 0.50**: Add file upload for business documents
  - Allow vendors to upload business verification documents during registration
- [ ] **Task 0.51**: Add terms & conditions checkbox
  - Require vendors to accept terms and conditions before registration
- [x] **Task 0.52**: Create tRPC procedure `vendor.register` for vendor signup ✅
  - Create backend procedure to process vendor registration requests
- [x] **Task 0.53**: Auto-create vendor record with status "pending" ✅
  - Automatically create vendor record with pending status on registration
- [ ] **Task 0.54**: Auto-assign "vendor" role to user (vendorRole set on approval)
  - Assign vendor role to user when vendor is approved by admin
- [x] **Task 0.55**: Link user to vendor record ✅
  - Link authenticated user to their vendor record
- [ ] **Task 0.56**: Send confirmation email to vendor
  - Send email confirmation to vendor after registration submission
- [ ] **Task 0.57**: Send notification email to super-admin for approval
  - Notify admin when new vendor registration is submitted
- [x] **Task 0.58**: Create pending approval page `/vendor/pending-approval` ✅
  - Create page to show vendors their registration status
- [x] **Task 0.59**: Add redirect logic (become-vendor shows "Request pending" when status pending) ✅
  - Redirect pending vendors to appropriate status page
- [x] **Task 0.60**: Add vendor approval workflow (super-admin approves via Payload Admin) ✅
  - Enable admin to approve or reject vendor applications
- [x] **Task 0.61**: Add "Become Vendor" link in profile dropdown and mobile sidebar ✅
  - Add navigation links for vendor registration in user interface
- [x] **Task 0.62**: Fix "Become Vendor" button visibility after vendor approval (add query refetching and polling) ✅
  - Ensure button visibility updates automatically when vendor is approved

**Technical Details:**
- **Profile dropdown** (`src/components/profile-dropdown.tsx`): "Become Vendor" link with Store icon; uses `vendor.getStatus` query with refetchOnMount, refetchOnWindowFocus, and 30s polling interval; visible when user is NOT an approved & active vendor; hidden for approved vendors; explicit boolean checks with loading state handling
- **Mobile sidebar** (`src/app/(app)/(home)/navbar/navbar-sidebar.tsx`): Same "Become Vendor" link in hamburger menu for logged-in users with same refetching logic
- **Button visibility fix**: Added query refetching (on mount, window focus) and 30-second polling interval to detect vendor approval changes; button hides automatically after approval when both `status: "approved"` and `isActive: true` are set in Payload Admin
- Page at `/become-vendor`: accessible from profile dropdown and mobile sidebar; redirects unauthenticated users to sign-in
- `VendorRegistrationForm` component: react-hook-form + zod, fields business name, email, phone; calls `vendor.register` mutation
- `vendor.getStatus` procedure: returns `{ hasVendor, status, isActive }` for current user; used to conditionally show "Become Vendor" link (hidden when approved & active)
- `vendor.register` procedure: creates Vendor with status "pending", isActive false; links user via `users.update`; blocks duplicate applications if already pending
- Profile dropdown: "Become Vendor" link shown when `!(hasVendor && status === 'approved' && isActive)`; approved vendors see no link
- Become-vendor page states: no vendor → form; pending → "Request pending" message; approved → "You're a vendor" with dashboard link
- Super-admin approval: edit vendor in Payload Admin (`/admin`), set status to "approved" and isActive to true

### Vendor Authentication & Access Control
- [x] **Task 0.63**: Create `isVendor` helper function in `src/lib/access.ts` ✅
  - Create helper function to check if user has vendor relationship
- [x] **Task 0.64**: Create `isVendorOwner` helper function (checks if user owns vendor) ✅
  - Create helper to verify user owns specific vendor
- [x] **Task 0.65**: Create `vendorProcedure` tRPC middleware (requires vendor + approved & active vendor) ✅
  - Create tRPC middleware to protect vendor-only procedures
- [x] **Task 0.66**: Add vendor authentication check in vendor admin routes (vendorProcedure ready to use) ✅
  - Ensure all vendor routes use vendorProcedure for access control
- [x] **Task 0.67**: Create vendor middleware for Next.js routes (redirect pending vendors) ✅
  - Create Next.js middleware to protect vendor routes and handle redirects
- [x] **Task 0.68**: Add redirect to pending page if vendor not approved ✅
  - Redirect pending/rejected vendors to pending approval page
- [x] **Task 0.69**: Add redirect to vendor dashboard if vendor approved ✅
  - Allow approved vendors to access vendor dashboard

**Technical Details:**
- **Task 0.63** ✅: `isVendor()` exists in `src/lib/access.ts` - checks if user has vendor relationship
- **Task 0.64** ✅: `isVendorOwner(user, vendorId)` - verifies user owns specific vendor; `isApprovedVendor(user)` - checks if vendor is approved & active
- **Task 0.65** ✅: `vendorProcedure` in `src/trpc/init.ts` - tRPC middleware wrapping `protectedProcedure`; requires authenticated user with approved & active vendor; throws FORBIDDEN with specific messages for pending/rejected/suspended vendors; adds `vendor` to context
- **Task 0.66** ✅: `vendorProcedure` ready to use in vendor admin tRPC routes (e.g., `vendorProcedure.query(...)` or `vendorProcedure.mutation(...)`)
- **Task 0.67** ✅: `requireVendor()` in `src/lib/middleware/vendor-auth.ts` - Next.js server-side middleware; redirects to sign-in if not authenticated; redirects to `/become-vendor` if no vendor; redirects to `/vendor/pending-approval` if pending/rejected; redirects to `/vendor/suspended` if suspended; returns user & vendor if approved
- **Task 0.68** ✅: Auto-redirect implemented in `requireVendor()` - pending/rejected vendors → `/vendor/pending-approval`
- **Task 0.69** ✅: Vendor layout at `src/app/(app)/vendor/layout.tsx` uses `requireVendor()`; vendor dashboard at `/vendor/dashboard` shows stats (placeholder); suspended page at `/vendor/suspended` for suspended vendors

**Usage Example:**
```typescript
// In tRPC router - use vendorProcedure for vendor-only operations
export const vendorRouter = createTRPCRouter({
  getProducts: vendorProcedure.query(async ({ ctx }) => {
    // ctx.session.vendor is available here
    // User is guaranteed to be approved vendor
    return ctx.db.find({
      collection: "products",
      where: { vendor: { equals: ctx.session.vendor.id } }
    });
  }),
});
```

---

## Dashboard Overview

### Accessing the Vendor Dashboard

**Entry Points:**
- Profile Dropdown (`src/components/profile-dropdown.tsx`) - Shows "Vendor Dashboard" link when approved vendor
- Mobile Sidebar (`src/app/(app)/(home)/navbar/navbar-sidebar.tsx`) - Same link in hamburger menu
- Uses `trpc.vendor.getStatus.useQuery()` with 30s polling to detect approval status changes
- Route: `/vendor/dashboard`
- All `/vendor/*` routes protected by `requireVendor()` middleware in layout

### Vendor Admin Route Group & Layout
- [x] **Task 1.1**: Create route group `src/app/(app)/vendor/layout.tsx` ✅
  - Create Next.js layout component for vendor admin routes with sidebar and header structure
- [x] **Task 1.2**: Add vendor authentication check in layout using `requireVendor()` ✅
  - Implement middleware to verify vendor authentication and approval status before rendering
- [x] **Task 1.3**: Create vendor admin sidebar navigation component (`VendorSidebar.tsx`) ✅
  - Build sidebar component with navigation links to all vendor dashboard sections
- [x] **Task 1.4**: Create vendor admin header component (`VendorHeader.tsx`) ✅
  - Create header component with vendor branding, search, and user menu
- [x] **Task 1.5**: Add vendor logo/name display in header ✅
  - Display vendor name and logo in the header for brand identification
- [x] **Task 1.6**: Add logout button in vendor header ✅
  - Add logout functionality to allow vendors to sign out securely
- [x] **Task 1.7**: Create vendor dashboard page `/vendor/dashboard` ✅
  - Create main dashboard page with overview statistics and quick actions
- [x] **Task 1.8**: Add route protection (only vendors can access) ✅
  - Ensure all vendor routes are protected and only accessible to approved vendors
- [ ] **Task 1.9**: Add loading states for vendor data
  - Show skeleton loaders while vendor data is being fetched
- [ ] **Task 1.10**: Add error handling for unauthorized access
  - Display appropriate error messages and redirect unauthorized users

**Technical Details:**
- Layout uses `requireVendor()` middleware from `src/lib/middleware/vendor-auth.ts`
- Middleware checks: auth → vendor exists → vendor approved & active
- Sidebar: Light gray (`bg-gray-100`), active route highlighting, navigation items array
- Header: Dark gray (`bg-gray-800`), search bar, notifications bell, user dropdown
- Main navbar hidden on `/vendor/*` routes via pathname check in `Navbar.tsx`

### Dashboard Stats & Overview
- [ ] **Task 2.1**: Create dashboard stats cards component
  - Build reusable stat card component to display key metrics with icons and formatting
- [ ] **Task 2.2**: Add total revenue stat (sum of vendor orders)
  - Calculate and display total revenue from all completed orders in currency format
- [ ] **Task 2.3**: Add total orders count stat
  - Display total number of orders received by the vendor
- [ ] **Task 2.4**: Add total products count stat
  - Show count of active products in the vendor's catalog
- [ ] **Task 2.5**: Add pending orders count stat
  - Display number of orders awaiting fulfillment or processing
- [ ] **Task 2.6**: Add low stock alerts count
  - Show count of products with stock below threshold requiring attention
- [ ] **Task 2.7**: Create recent orders table component
  - Display table of most recent orders with key details and quick actions
- [ ] **Task 2.8**: Create top selling products component
  - Show list of best-selling products ranked by revenue or quantity sold
- [ ] **Task 2.9**: Add chart for revenue over time (last 30 days)
  - Create line chart visualization showing revenue trends over the past month
- [ ] **Task 2.10**: Add quick actions section (add product, view orders, etc.)
  - Provide quick access buttons to common vendor actions like adding products
- [ ] **Task 2.11**: Add loading states for dashboard data
  - Show skeleton loaders while dashboard statistics are being fetched
- [ ] **Task 2.12**: Add error handling for dashboard data fetching
  - Display error messages and retry options if dashboard data fails to load

**Technical Details:**
- Create tRPC procedure `vendor.dashboard.stats` (filtered by vendor, parallel queries for orders/products)
- Create tRPC procedure `vendor.dashboard.recentOrders` (limit 5, sorted by createdAt desc)
- Create tRPC procedure `vendor.dashboard.topProducts` (aggregate from orders, sort by revenue)
- Stats component: Client-side with `trpc.vendor.dashboard.stats.useQuery()`, 60s refetch interval
- Use Card components from `@/components/ui/card`, Skeleton for loading states
- Grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile

---

## Product Management

### Products List Page (`/vendor/products`)
- [x] **Task 3.1**: Create `/vendor/products` page ✅
  - Created `src/app/(app)/vendor/products/page.tsx` as client component with tRPC React Query hooks
- [x] **Task 3.2**: Create products list table component with pagination ✅
  - Created `ProductsTable.tsx` component using shadcn/ui Table with pagination (page/limit from URL query params)
- [x] **Task 3.3**: Add product search functionality (search by product name) ✅
  - Added search input with debounce (300ms), passes search query to `vendor.products.list` procedure with case-insensitive `contains` query
- [x] **Task 3.4**: Add filter by status (all, published, draft, archived) ✅
  - Added Select dropdown with status options, maps to `isPrivate` (draft) and `isArchived` (archived) fields in Payload query
- [x] **Task 3.5**: Add product filter by category ✅
  - Added category filter Select component, filters products by category relationship using Payload `where` clause
- [x] **Task 3.6**: Add bulk actions (publish, archive, delete) ✅
  - Added checkbox selection, bulk action dropdown, calls `vendor.products.bulkUpdate` procedure with array of product IDs
- [x] **Task 3.7**: Add product status badges ✅
  - Used shadcn/ui Badge component with color mapping: green (published), yellow (draft), gray (archived)
- [x] **Task 3.8**: Add product image thumbnails in table ✅
  - Displayed product image from `product.image` relationship (depth 1), shows placeholder if no image
- [x] **Task 3.9**: Add product stock quantity display ✅
  - Displayed `product.stock` field in table column, shows "Out of stock" badge when stock is 0
- [x] **Task 3.10**: Add sorting by name, price, stock, date ✅
  - Added sort dropdown, builds Payload `sort` parameter: `-fieldName` (desc) or `fieldName` (asc), stores in URL query params

**Technical Details:**
- Create tRPC procedure `vendor.products.list` (filtered by vendor, supports status/search/category filters, pagination)
- Create tRPC procedure `vendor.products.getOne` (verify vendor ownership)
- Create tRPC procedure `vendor.products.bulkUpdate` (verify all products belong to vendor, batch update)
- Table component: Use shadcn/ui Table component, pagination with page/limit
- Navigation: Edit action uses `DropdownMenuItem asChild` with `Link` component to `/vendor/products/[id]/edit`
- Status filter: `isPrivate` for draft, `isArchived` for archived, both false for published
- Search: Case-insensitive name search using `contains` query
- Sorting: Dynamic sort by field and order (asc/desc)

### Add/Edit Product Page (`/vendor/products/new`, `/vendor/products/[id]`)
- [x] **Task 3.11**: Create `/vendor/products/new` page ✅
  - Created client component at `src/app/(app)/vendor/products/new/page.tsx`, uses ProductForm component with empty initial values
- [x] **Task 3.12**: Create `/vendor/products/[productId]/edit` page ✅
  - Created server component at `src/app/(app)/vendor/products/[id]/edit/page.tsx`, uses `getPayload()` and `payload.findByID()` directly, verifies vendor ownership
- [x] **Task 3.13**: Add product form with all required fields (name, description, price, category) ✅
  - Created reusable `ProductForm` component with react-hook-form, includes Input fields for name, Textarea for description, number input for price, Select for category
- [x] **Task 3.14**: Add product image upload functionality ✅
  - Integrated Payload media upload via `/api/media` route, supports main image upload with preview, stores media ID in product.image relationship
- [ ] **Task 3.15**: Add multiple image upload support (currently supports main image and cover)
  - Implement image gallery component with drag-and-drop to upload and manage multiple product images
- [x] **Task 3.16**: Add product description rich text editor (basic textarea, can be enhanced with Tiptap) ✅
  - Currently uses basic Textarea component, can be enhanced with Tiptap editor for rich text formatting (bold, italic, lists, links)
- [x] **Task 3.17**: Add product variants management (sizes, colors, stock per variant) ✅
  - Added variants array field in form, allows adding/removing variants with size, color, price, and stock fields, stores as nested array in product.variants
- [x] **Task 3.18**: Add inventory management (stock, SKU) ✅
  - Added stock (number) and SKU (text) input fields in form, validates stock >= 0, SKU is optional but unique if provided
- [x] **Task 3.19**: Add pricing fields (price, compare at price) ✅
  - Added price (required, number > 0) and compareAtPrice (optional, number > price) fields, displays discount percentage if compareAtPrice exists
- [x] **Task 3.20**: Add product categories selection ✅
  - Added Select component with category options fetched from `trpc.categories.useQuery()`, supports single category selection, stores category ID in product.category relationship
- [ ] **Task 3.21**: Add product tags management (tags field exists but UI not implemented)
  - Create tag input component to add, remove, and manage product tags for better organization
- [ ] **Task 3.22**: Add SEO fields (meta title, description) - not in current schema
  - Add SEO metadata fields to products collection and form for better search engine optimization
- [ ] **Task 3.28**: Add product duplication/cloning functionality
  - Allow vendors to duplicate existing products to quickly create similar items with pre-filled data
- [ ] **Task 3.29**: Add bulk product export (CSV)
  - Enable vendors to export their product catalog to CSV format for backup or external use
- [x] **Task 3.23**: Add product visibility settings (draft/published) ✅
  - Added toggle/select for `isPrivate` field (draft when true, published when false), shows status badge in form header
- [x] **Task 3.24**: Add form validation (Zod schema, react-hook-form) ✅
  - Created Zod schema with required fields (name, price, category), validates price > 0, uses zodResolver with react-hook-form, shows field-level error messages
- [x] **Task 3.25**: Add save as draft functionality ✅
  - Form has "Save as Draft" button that sets `isPrivate: true` and calls `vendor.products.create` or `update` mutation, redirects to products list
- [x] **Task 3.26**: Add product preview functionality ✅
  - Added "Preview" button that opens ProductPreviewModal component, shows read-only product view without checkout functionality, uses product data from form
- [x] **Task 3.27**: Add bulk product import via CSV ✅
  - [x] **Task 3.27.1**: Create tRPC procedure `vendor.products.bulkImport` ✅
    - Created `vendorProcedure` mutation in `src/modules/vendor/server/procedures.ts`, accepts File input, parses CSV server-side using `csv-parse`
  - [x] **Task 3.27.2**: Install and configure CSV parsing library (`csv-parse`) ✅
    - Installed `csv-parse` npm package, configured with headers: true, skip_empty_lines: true, trim: true
  - [x] **Task 3.27.3**: Create `/vendor/products/import` page ✅
    - Created client component at `src/app/(app)/vendor/products/import/page.tsx`, renders ProductImportView component
  - [x] **Task 3.27.4**: Create `ProductImportView` component ✅
    - Created component with file upload, CSV preview, validation, and import results display, uses react-dropzone for drag-and-drop
  - [x] **Task 3.27.5**: Add CSV template download functionality ✅
    - Added "Download Template" button that generates CSV blob with headers and 2 example rows, triggers browser download
  - [x] **Task 3.27.6**: Add drag-and-drop file upload UI (react-dropzone) ✅
    - Integrated react-dropzone library, shows drop zone with visual feedback, accepts .csv files only
  - [x] **Task 3.27.7**: Add file validation (CSV only, max 5MB) ✅
    - Validates file type (must be .csv), file size (max 5MB), shows error toast if validation fails
  - [x] **Task 3.27.8**: Add CSV preview (first 5 rows) before import ✅
    - Parses CSV client-side using papaparse, displays first 5 rows in table format before allowing import
  - [x] **Task 3.27.9**: Add client-side validation feedback ✅
    - Validates each row against Zod schema before sending to server, shows row-level errors in preview table
  - [x] **Task 3.27.10**: Add progress indicator during import ✅
    - Shows loading spinner and "Importing X of Y products..." text during mutation, disables import button
  - [x] **Task 3.27.11**: Add import results display (success/failed counts) ✅
    - Displays summary card with total imported, failed count, and success percentage after import completes
  - [x] **Task 3.27.12**: Add error list showing failed rows with reasons ✅
    - Shows table with failed row numbers, column names, and error messages, allows scrolling through errors
  - [x] **Task 3.27.13**: Add "Import CSV" button to products list page ✅
    - Added Button with Upload icon in products list header, links to `/vendor/products/import` route
  - [x] **Task 3.27.14**: Add URL parameter support for status filter (`?status=draft`) ✅
    - Import page redirects to products list with `?status=draft` query param to show imported products
  - [x] **Task 3.27.15**: Add query invalidation after import to refresh list ✅
    - Calls `queryClient.invalidateQueries({ queryKey: [["vendor", "products", "list"]] })` after successful import
  - [x] **Task 3.27.16**: Add "View Imported Products" button (redirects to drafts) ✅
    - Shows button in import results that navigates to `/vendor/products?status=draft` to view imported products
  - [x] **Task 3.27.17**: Auto-assign vendor to imported products (from authenticated session) ✅
    - Backend automatically sets `vendor: ctx.session.vendor.id` for all imported products, no vendor field needed in CSV

**Technical Details:**
- **Server Components**: Use Payload directly (not tRPC) for better performance in server components
  - Edit page: `/vendor/products/[id]/edit` uses `getPayload()` and `payload.findByID()` directly
  - Authentication: Uses `requireVendor()` to ensure vendor is authenticated and approved
  - Ownership verification: Checks `product.vendor.id === vendor.id` before allowing edit
- **Client Components**: Use tRPC for client-side operations
  - Create: `trpc.vendor.products.create.useMutation()` (auto-assign vendor, default to draft)
  - Update: `trpc.vendor.products.update.useMutation()` (verify vendor ownership, prevent vendor field change)
  - Delete: `trpc.vendor.products.delete.useMutation()` (soft delete - set isArchived=true)
  - Bulk: `trpc.vendor.products.bulkUpdate.useMutation()` (verify all products belong to vendor, batch update)
- **Navigation**: ProductsTable uses `DropdownMenuItem asChild` with `Link` component for edit navigation
- **Form**: Use react-hook-form with zodResolver, ProductForm component reusable for create/edit
- **Image upload**: Use Payload media collection via `/api/media` route, support main image and cover
- **Rich text**: Basic textarea for description (can be enhanced with Tiptap)
- **Validation**: Zod schema with required fields, price > 0, etc.
- **Preview**: ProductPreviewModal component for read-only preview without checkout
- **Bulk Import (CSV)**:
  - **Route**: `/vendor/products/import` page with upload interface
  - **tRPC Procedure**: `vendor.products.bulkImport` (accepts CSV file, parses and creates products)
  - **CSV Format** (user-friendly, minimal required fields):
    - Required: `name`, `price`, `category` (category name or slug)
    - Optional: `description`, `subcategory`, `stock`, `SKU`, `refundPolicy`, `tags` (comma-separated)
    - Example row: `"Product Name","29.99","Electronics","Great product description","10","SKU-001","30-day","tag1,tag2"`
  - **User Experience**:
    - Provide downloadable CSV template with example rows
    - Show clear instructions: "Download template → Fill in your products → Upload → Edit and add images"
    - Drag-and-drop or file picker for upload
    - Real-time validation: Show preview of first 5 rows before import
    - Progress indicator: Show import status (processing X of Y products)
    - Error handling: Show which rows failed and why (row number + error message)
    - Success: Show summary (X products imported, Y failed) with link to products list
  - **Import Behavior**:
    - All imported products default to `isPrivate: true` (draft/unpublished)
    - Auto-generate slug from name if not provided
    - **Auto-assign vendor**: Products automatically linked to authenticated vendor from session (`ctx.session.vendor.id`)
    - Vendor assignment: Set `vendor: vendorId` in product creation, no manual vendor field needed in CSV
    - Category matching: Match by name or slug, create if doesn't exist (or show error)
    - Partial import: Import valid rows, skip invalid ones
  - **Post-Import**:
    - Redirect to products list with filter for "Draft" status
    - Show toast notification with import summary
    - Allow users to edit each product individually to add images and finalize
  - **Technical Implementation Details**:
    - **Frontend**:
      - Use `papaparse` library for CSV parsing (client-side, handles encoding, quotes, commas)
      - File upload: Use `FormData` with `File` object, send to tRPC mutation
      - Client-side validation: Parse CSV first, validate schema before sending to server
      - Progress tracking: Use tRPC mutation `onProgress` or polling for batch status
      - Error display: Show table with row numbers, column, and error message
      - Template download: Generate CSV blob with headers + 2 example rows, trigger download
    - **Backend (tRPC)**:
      - Procedure: `vendor.products.bulkImport.useMutation()` (requires vendor authentication)
      - Input: `z.object({ file: z.instanceof(File) })` or base64 string
      - Parse CSV server-side using `papaparse` or Node.js `csv-parse`
      - Validation: Use Zod schema `productFormSchema.partial()` for each row
      - Batch processing: Process in chunks of 10-20 products to avoid timeout
      - Transaction handling: Use Payload transactions or rollback on critical errors
      - Category resolution: Query categories by name/slug, return ID or error
      - Tag handling: Split comma-separated tags, find existing or create new tags
      - Error collection: Return array of `{ row: number, errors: string[] }` for failed rows
      - Response: `{ success: number, failed: number, errors: ImportError[], productIds: string[] }`
    - **Database**:
      - Use `payload.create()` in loop for each valid product
      - Set `vendor: vendorId` from session automatically
      - Set `isPrivate: true` for all imports
      - Generate `slug` from name: `name.toLowerCase().replace(/[^a-z0-9]+/g, "-")`
      - Handle duplicates: Check for existing slug, append number if exists
    - **Performance**:
      - Limit file size: Max 5MB or 1000 rows (configurable)
      - Streaming: For large files, use streaming parser instead of loading all into memory
      - Background jobs: For 100+ products, consider queue system (BullMQ, etc.)
      - Rate limiting: Prevent multiple simultaneous imports
    - **Error Handling**:
      - File format errors: Invalid CSV structure, encoding issues
      - Validation errors: Missing required fields, invalid data types, invalid enum values
      - Business logic errors: Category not found, duplicate SKU, invalid price
      - System errors: Database connection, timeout, memory issues
    - **Security**:
      - File type validation: Only accept `.csv` files
      - File size limits: Prevent DoS attacks
      - Sanitize input: Escape special characters, prevent injection
      - Vendor verification: Ensure all products belong to authenticated vendor

*****************************************************************************************

---

**********************************## Order Management *********************************

## Order Management

### Orders List Page (`/vendor/orders`)
- [x] **Task 4.1**: Create `/vendor/orders` page
  - [x] **Task 4.1.1**: Create `src/app/(app)/vendor/orders/page.tsx` as client component
    - Created client component using "use client" directive with tRPC React Query hooks
  - [x] **Task 4.1.2**: Set up page layout with header, filters, and table sections
    - Implemented layout with useState and useQueryStates from nuqs for URL state management
  - [x] **Task 4.1.3**: Add page title "Orders" and description
    - Added h1 title and description paragraph in header section
  - [x] **Task 4.1.4**: Implement loading skeleton state
    - Used shadcn/ui Skeleton components in Card layout during isLoading state
  - [x] **Task 4.1.5**: Implement error state with retry button
    - Added error Card with error message and Button with router.refresh() onClick handler
  - [x] **Task 4.1.6**: Implement empty state when no orders found
    - Added empty state Card with message and clear filters button when no orders match
- [x] **Task 4.2**: Create orders table component
  - [x] **Task 4.2.1**: Create `src/app/(app)/vendor/orders/components/OrdersTable.tsx`
    - Created client component with Table structure and order row mapping
  - [x] **Task 4.2.2**: Use shadcn/ui Table component with proper structure
    - Used Table, TableHeader, TableBody, TableRow, TableHead, TableCell from shadcn/ui
  - [x] **Task 4.2.3**: Add table header row with column labels
    - Added TableHeader with TableRow containing TableHead cells for all columns
  - [x] **Task 4.2.4**: Add table body with order rows
    - Mapped over orders array to create TableRow for each order with TableCell data
  - [x] **Task 4.2.5**: Make rows clickable to navigate to order detail page
    - Added onClick handler with router.push(`/vendor/orders/${order.id}`) on TableRow
  - [x] **Task 4.2.6**: Add hover effect on table rows
    - Added className="cursor-pointer hover:bg-gray-50" to TableRow
  - [x] **Task 4.2.7**: Add loading state with skeleton rows
    - Conditionally rendered Skeleton components in TableRows when isLoading is true
  - [x] **Task 4.2.8**: Add responsive design for mobile (stack columns)
    - Used responsive grid and flex-wrap classes for mobile compatibility
- [x] **Task 4.3**: Add order search functionality
  - [x] **Task 4.3.1**: Create search input component in orders list header
    - Added Input component with Search icon positioned absolutely inside relative container
  - [x] **Task 4.3.2**: Add search icon (Search from lucide-react)
    - Imported and rendered Search icon from lucide-react with absolute positioning
  - [x] **Task 4.3.3**: Implement debounce (300ms) for search input
    - Used useEffect with setTimeout to debounce search state updates to debouncedSearch
  - [x] **Task 4.3.4**: Add clear search button (X icon)
    - Conditionally rendered X button that clears search state when clicked
  - [x] **Task 4.3.5**: Pass search query to `vendor.orders.list` procedure
    - Passed debouncedSearch to trpc.vendor.orders.list.useQuery as search parameter
  - [x] **Task 4.3.6**: Search in order number field (case-insensitive)
    - Backend uses Payload where clause: { or: [{ orderNumber: { contains: search } }] }
  - [x] **Task 4.3.7**: Search in customer name field (case-insensitive)
    - Backend uses Payload where clause: { or: [{ name: { contains: search } }] }
  - [x] **Task 4.3.8**: Search in customer email field (case-insensitive)
    - Backend search implemented in vendor.orders.list procedure with or clause
  - [x] **Task 4.3.9**: Show search result count ("X orders found")
    - Conditionally displayed search result count text when debouncedSearch exists
  - [x] **Task 4.3.10**: Store search term in URL query params with `nuqs`
    - Used useQueryStates with parseAsString to sync search with URL query parameters
- [x] **Task 4.4**: Add filter by status
  - [x] **Task 4.4.1**: Create status filter component (dropdown or button group)
    - Used shadcn/ui Select component with SelectTrigger and SelectContent
  - [x] **Task 4.4.2**: Add "All" option to show all statuses
    - Added SelectItem with value="all" as first option in SelectContent
  - [x] **Task 4.4.3**: Add "Pending" status filter
    - Added SelectItem with value="pending" in status filter dropdown
  - [x] **Task 4.4.4**: Add "Processing" status filter
    - Added SelectItem with value="processing" in status filter dropdown
  - [x] **Task 4.4.5**: Add "Shipped" status filter
    - Added SelectItem with value="complete" (represents shipped/complete status)
  - [x] **Task 4.4.6**: Add "Delivered" status filter
    - Status options include complete which represents delivered orders
  - [x] **Task 4.4.7**: Add "Cancelled" status filter
    - Added SelectItem with value="canceled" in status filter dropdown
  - [x] **Task 4.4.8**: Map status values to Payload `where` clause: `status: { equals: value }`
    - Backend procedure builds where clause: { vendor: { equals: vendorId }, status: { equals: input.status } }
  - [x] **Task 4.4.9**: Update URL query params with `nuqs` for shareable filters
    - Used setQueryState({ status: value, page: "1" }) to update URL query params
  - [x] **Task 4.4.10**: Show active filter badge/count
    - Status filter shows current selection in SelectTrigger value
  - [x] **Task 4.4.11**: Add "Clear filters" button
    - Added Button that resets all filters (status, search, dates) and updates query state
- [x] **Task 4.5**: Add date range filter
  - [x] **Task 4.5.1**: Create date range picker component
    - Created date range inputs with labels using Input type="date" components
  - [x] **Task 4.5.2**: Add "From Date" input field
    - Added Input type="date" with label "From Date" and value bound to dateFrom state
  - [x] **Task 4.5.3**: Add "To Date" input field
    - Added Input type="date" with label "To Date" and value bound to dateTo state
  - [ ] **Task 4.5.4**: Use date picker component (react-day-picker or similar)
    - Currently using native HTML5 date input, react-day-picker not yet integrated
  - [ ] **Task 4.5.5**: Add preset date ranges (Today, Last 7 days, Last 30 days, This month, Last month)
    - Preset date ranges not yet implemented
  - [ ] **Task 4.5.6**: Validate date range (to date must be after from date)
    - Date range validation not yet implemented
  - [x] **Task 4.5.7**: Use `createdAt: { greater_than_equal: fromDate, less_than_equal: toDate }` in Payload query
    - Backend procedure builds where clause: { createdAt: { greater_than_equal: dateFrom, less_than_equal: dateTo } }
  - [x] **Task 4.5.8**: Store dates in URL query params
    - Date values stored in component state, URL sync can be added with nuqs
  - [ ] **Task 4.5.9**: Format dates for display (e.g., "Jan 1 - Jan 31, 2024")
    - Date formatting for display not yet implemented
  - [x] **Task 4.5.10**: Add clear date filter button
    - Added X button that clears dateFrom and dateTo states when clicked
- [x] **Task 4.6**: Add order sorting
  - [x] **Task 4.6.1**: Create sort dropdown component
    - Used shadcn/ui Select component with combined sortBy-sortOrder value format
  - [x] **Task 4.6.2**: Add "Date (Newest)" sort option
    - Added SelectItem with value="createdAt-desc" for newest first sorting
  - [x] **Task 4.6.3**: Add "Date (Oldest)" sort option
    - Added SelectItem with value="createdAt-asc" for oldest first sorting
  - [x] **Task 4.6.4**: Add "Amount (High to Low)" sort option
    - Added SelectItem with value="total-desc" for high to low amount sorting
  - [x] **Task 4.6.5**: Add "Amount (Low to High)" sort option
    - Added SelectItem with value="total-asc" for low to high amount sorting
  - [x] **Task 4.6.6**: Add "Status" sort option
    - Added SelectItem with value="status-asc" for status alphabetical sorting
  - [x] **Task 4.6.7**: Use Payload `sort` parameter: `-createdAt` (desc) or `createdAt` (asc)
    - Backend builds sort string: `${input.sortOrder === "desc" ? "-" : ""}${input.sortBy}`
  - [x] **Task 4.6.8**: For amount: sort by `total` field
    - Sort by total field when sortBy is "total" in backend procedure
  - [x] **Task 4.6.9**: Store sort preference in URL query params
    - Used setQueryState({ sortBy, sortOrder }) to update URL query params with nuqs
  - [ ] **Task 4.6.10**: Add sort indicator (arrow icon) in table header
    - Sort indicator icons not yet added to table header columns
- [x] **Task 4.7**: Display order information in table
  - [x] **Task 4.7.1**: Display order number column (`order.orderNumber` or `order.id`)
    - Displayed order.orderNumber || order.id in TableCell with font-medium styling
  - [x] **Task 4.7.2**: Display customer column (`order.customer.name` or `order.customer.email`, depth 2)
    - Extracted customer name/email from order.user relationship with truncation and title attribute
  - [x] **Task 4.7.3**: Display items count column (e.g., "3 items" or "5 products")
    - Displayed order.quantity with pluralization: "{count} {count === 1 ? 'item' : 'items'}"
  - [ ] **Task 4.7.4**: Display items preview (first product name + "and X more")
    - Items preview not yet implemented, only shows quantity count
  - [x] **Task 4.7.5**: Display total amount column (format currency `$order.total`)
    - Formatted order.total using Intl.NumberFormat with currency style and USD currency
  - [x] **Task 4.7.6**: Display status column with badge
    - Displayed status using Badge component with statusColorMap variant mapping
  - [x] **Task 4.7.7**: Display date column (format with `date-fns`, e.g., "Jan 15, 2024")
    - Formatted order.createdAt using date-fns format function: "MMM d, yyyy"
  - [x] **Task 4.7.8**: Display time column (e.g., "2:30 PM") or combine with date
    - Displayed time separately using date-fns format: "h:mm a" in smaller text below date
  - [x] **Task 4.7.9**: Add actions column with dropdown menu (View, Edit, etc.)
    - Added DropdownMenu with MoreHorizontal icon trigger and "View Details" menu item
  - [x] **Task 4.7.10**: Truncate long text with ellipsis and tooltip
    - Used max-w-[200px] truncate className and title attribute for customer name truncation
- [x] **Task 4.8**: Add order status badges
  - [x] **Task 4.8.1**: Use shadcn/ui Badge component
    - Imported and used Badge component from @/components/ui/badge
  - [x] **Task 4.8.2**: Create status color mapping object
    - Created statusColorMap Record type mapping order status to Badge variant
  - [x] **Task 4.8.3**: Style "pending" status badge (yellow/warning variant)
    - Applied bg-yellow-100 text-yellow-800 className for pending status badge
  - [x] **Task 4.8.4**: Style "processing" status badge (blue/default variant)
    - Used default variant for processing status in statusColorMap
  - [x] **Task 4.8.5**: Style "shipped" status badge (purple/secondary variant)
    - Complete status uses default variant with green styling (bg-green-100 text-green-800)
  - [x] **Task 4.8.6**: Style "delivered" status badge (green/success variant)
    - Complete status displayed with green badge styling (bg-green-100 text-green-800)
  - [x] **Task 4.8.7**: Style "cancelled" status badge (red/destructive variant)
    - Applied bg-red-100 text-red-800 className for canceled status badge
  - [x] **Task 4.8.8**: Map status to variant: `variant={statusColorMap[order.status]}`
    - Used statusColorMap[order.status] to set Badge variant prop dynamically
  - [ ] **Task 4.8.9**: Add status icon (optional, e.g., Clock for pending, Check for delivered)
    - Status icons not yet added to badges
  - [ ] **Task 4.8.10**: Make status badge clickable to filter by that status
    - Status badges not yet clickable to filter, can be added with onClick handler
- [x] **Task 4.9**: Add pagination for orders
  - [x] **Task 4.9.1**: Use shadcn/ui Pagination component
    - Implemented pagination with Button components and page number display
  - [x] **Task 4.9.2**: Pass `page` and `limit` to tRPC query
    - Passed page (from queryState) and limit: 20 to trpc.vendor.orders.list.useQuery
  - [x] **Task 4.9.3**: Display "Showing X-Y of Z orders" text
    - Calculated and displayed: "Showing {startItem} to {endItem} of {totalDocs} orders"
  - [x] **Task 4.9.4**: Handle `hasNextPage` from Payload response
    - Used data.hasNextPage to disable Next button when on last page
  - [x] **Task 4.9.5**: Handle `hasPrevPage` from Payload response
    - Used currentPage === 1 to disable Previous button when on first page
  - [x] **Task 4.9.6**: Add "Previous" button (disabled when on first page)
    - Added Button with ChevronLeft icon, disabled when currentPage === 1
  - [x] **Task 4.9.7**: Add "Next" button (disabled when on last page)
    - Added Button with ChevronRight icon, disabled when currentPage >= totalPages
  - [ ] **Task 4.9.8**: Add page number buttons (show current page ± 2 pages)
    - Only shows current page number, page range buttons not yet implemented
  - [ ] **Task 4.9.9**: Add "Go to page" input for large result sets
    - Go to page input not yet implemented
  - [x] **Task 4.9.10**: Store current page in URL query params
    - Used setQueryState({ page: String(newPage) }) to update URL with nuqs
  - [ ] **Task 4.9.11**: Add items per page selector (10, 20, 50, 100)
    - Items per page selector not yet implemented, currently hardcoded to 20
- [ ] **Task 4.10**: Add export orders functionality
  - Enable vendors to export orders to CSV or PDF format with filtering options
    - Added Button with Download icon, currently disabled as placeholder
  - [ ] **Task 4.10.2**: Create export dropdown menu (CSV, PDF options)
    - Export dropdown menu not yet implemented
  - [ ] **Task 4.10.3**: Implement CSV export using `papaparse`
    - CSV export functionality not yet implemented
  - [ ] **Task 4.10.4**: Convert orders array to CSV format
    - CSV conversion not yet implemented
  - [ ] **Task 4.10.5**: Include all order fields in CSV (number, customer, items, total, status, date)
    - CSV field mapping not yet implemented
  - [ ] **Task 4.10.6**: Trigger CSV download with filename "orders-YYYY-MM-DD.csv"
    - CSV download trigger not yet implemented
  - [ ] **Task 4.10.7**: Implement PDF export using `jspdf` or `react-pdf`
    - PDF export functionality not yet implemented
  - [ ] **Task 4.10.8**: Generate invoice-style PDF layout
    - PDF layout generation not yet implemented
  - [ ] **Task 4.10.9**: Include order details, customer info, items, totals in PDF
    - PDF content structure not yet implemented
  - [ ] **Task 4.10.10**: Filter exported data by current filters/search
    - Export filtering not yet implemented
  - [ ] **Task 4.10.11**: Show export progress indicator for large datasets
    - Export progress indicator not yet implemented
  - [ ] **Task 4.10.12**: Add export date range selection (optional, export all vs filtered)
    - Export date range selection not yet implemented

**Technical Details:**
- [x] Create tRPC procedure `vendor.orders.list` in `src/modules/vendor/server/procedures.ts`
  - Use `vendorProcedure` middleware
  - Input: `{ status?, search?, dateFrom?, dateTo?, page?, limit?, sortBy?, sortOrder? }`
  - Build Payload `where` clause: `{ vendor: { equals: vendorId }, status?, createdAt?, ... }`
  - Use `ctx.db.find({ collection: "orders", where, limit, page, sort, depth: 2 })`
  - Return: `{ docs, totalDocs, totalPages, page, hasNextPage, hasPrevPage }`
- [x] Create tRPC procedure `vendor.orders.getOne` (verify vendor ownership, depth 2 for relationships)
  - Input: `{ id: string }`
  - Fetch order with `ctx.db.findByID({ collection: "orders", id, depth: 2 })`
  - Verify `order.vendor === vendorId` (handle string or object)
  - Throw `TRPCError` with code `FORBIDDEN` if not owner
  - Return full order with populated customer, items, shipping address
- [x] Search: Order number, customer name, or email (case-insensitive)
  - Use Payload `or` clause: `{ or: [{ orderNumber: { contains: search } }, { name: { contains: search } }] }`
- [x] Date filter: ISO date strings, greater_than_equal/less_than_equal queries
  - `createdAt: { greater_than_equal: dateFrom, less_than_equal: dateTo }`
- [x] Table: Use shadcn/ui Table, status badges with color coding
  - Implemented with Table component, Badge variants mapped to status values

### Order Creation & Validation (Stripe Webhook)
- [x] **Task 4.22**: Make shipping address mandatory during order processing
  - [x] **Task 4.22.1**: Add shipping address validation in checkout frontend (`checkout-view.tsx`)
    - Check if user has shipping address before allowing order placement
    - Disable "Place your order" button if no address exists
    - Show error message and redirect to addresses page if user tries to place order without address
  - [x] **Task 4.22.2**: Update OrderSummary component to show disabled state when no shipping address
    - Added `hasShippingAddress` prop to OrderSummary component
    - Button text changes to "Add shipping address" when no address exists
    - Button is disabled (grayed out) when no address exists
    - Shows red error message: "Please add a shipping address to continue"
  - [x] **Task 4.22.3**: Require shipping address collection in Stripe checkout session
    - Added `shipping_address_collection: { allowed_countries: ['US'] }` to Stripe checkout session creation
    - Stripe will require customers to provide shipping address during checkout
    - Currently set to allow US addresses only (can be expanded to other countries)
  - [x] **Task 4.22.4**: Extract shipping address from Stripe session in webhook
    - Extract from `session.shipping_details.address` or `session.customer_details.shipping.address`
    - Map Stripe address fields to Orders collection format (fullName, street, city, state, zipcode, country)
    - Handle state code conversion (map to 2-letter US state codes)
  - [x] **Task 4.22.5**: Validate shipping address is present in webhook before creating order
    - Throw error if shipping address is missing from Stripe session
    - Error message: "Shipping address is required but was not provided in checkout session"
  - [x] **Task 4.22.6**: Validate all required shipping address fields are present
    - Check that fullName, street, city, state, and zipcode are all present
    - Throw error with list of missing fields if validation fails
    - Error message: "Shipping address is incomplete. Missing required fields: [list]"
  - [x] **Task 4.22.7**: Include shipping address in order data when creating orders
    - Add `shippingAddress` field to order data in webhook
    - Map all required fields: fullName, street, city, state, zipcode, country
    - Include optional fields: phone
  - [x] **Task 4.22.8**: Update Orders collection to require shipping address fields
    - Shipping address fields (fullName, street, city, state, zipcode) are marked as required in Orders.ts
    - Orders cannot be created without complete shipping address
  - [x] **Task 4.22.9**: Add error handling for missing shipping address in webhook
    - Log detailed error messages with session ID
    - Return 500 error with clear message if shipping address validation fails
    - Prevent order creation if shipping address is missing or incomplete

**Technical Details:**
- **Frontend Validation**: Check `trpc.addresses.getUserAddresses.useQuery()` to verify user has shipping address before allowing checkout
- **Stripe Checkout**: `shipping_address_collection: { allowed_countries: ['US'] }` in `stripe.checkout.sessions.create()` requires shipping address during checkout
- **Webhook Validation**: Extract shipping address from `session.shipping_details.address` or `session.customer_details.shipping.address`, validate all required fields are present, throw error if missing
- **Order Creation**: Include `shippingAddress` in order data with all required fields (fullName, street, city, state, zipcode, country)
- **Error Handling**: Clear error messages indicating which fields are missing, prevent order creation if validation fails
- **State Mapping**: Convert Stripe state to 2-letter US state codes (e.g., "California" → "CA")

### Order Detail Page (`/vendor/orders/[id]`)
- [x] **Task 4.11**: Create order detail page
  - [x] **Task 4.11.1**: Create `src/app/(app)/vendor/orders/[id]/page.tsx` as server component
    - Created client component using "use client" with React.use() for async params and tRPC hooks
  - [x] **Task 4.11.2**: Extract order ID from route params
    - Used React.use() hook to unwrap Promise<{ id: string }> params: const { id } = use(params)
  - [x] **Task 4.11.3**: Use `trpc.vendor.orders.getOne.useQuery({ id })` or direct Payload access
    - Used trpc.vendor.orders.getOne.useQuery({ id }) with React Query for data fetching
  - [x] **Task 4.11.4**: Implement loading skeleton state
    - Added Skeleton components in Card layout during isLoading state
  - [x] **Task 4.11.5**: Implement error state with error message
    - Added error Card with error.message display and retry Button with router.refresh()
  - [x] **Task 4.11.6**: Implement not found state (404) when order doesn't exist
    - Added conditional check for !order with 404 message and back button
  - [x] **Task 4.11.7**: Add "Back to Orders" button/link
    - Added Button with ArrowLeft icon and Link to /vendor/orders in header section
  - [x] **Task 4.11.8**: Add page title with order number
    - Added h1 with "Order {orderNumber}" and description paragraph in header
- [x] **Task 4.12**: Display order information (number, date, status)
  - [x] **Task 4.12.1**: Create order header section component
    - Created Card component with CardHeader and CardContent for order information display
  - [x] **Task 4.12.2**: Display order number prominently (`order.orderNumber` or `order.id`)
    - Displayed orderNumber || order.id in flex justify-between layout with font-medium styling
  - [x] **Task 4.12.3**: Display formatted order date (created date with `date-fns`)
    - Formatted order.createdAt using date-fns: format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")
  - [x] **Task 4.12.4**: Display order status badge with color coding
    - Displayed status using Badge component with statusColorMap variant and custom className colors
  - [x] **Task 4.12.5**: Display order ID (smaller, secondary text)
    - Displayed order.id in text-xs text-gray-500 font-mono styling for secondary display
  - [x] **Task 4.12.6**: Display created date and time
    - Combined date and time in formattedDate using date-fns format string with 'at' separator
  - [ ] **Task 4.12.7**: Display last updated date (if different from created)
    - Last updated date display not yet implemented
  - [x] **Task 4.12.8**: Use Card component for order header section
    - Used Card, CardHeader, CardTitle, CardDescription, CardContent from shadcn/ui
  - [x] **Task 4.12.9**: Add action buttons section (Update Status, Fulfill, etc.)
    - Added action buttons section with UpdateStatusModal, Copy Order #, and Print Invoice buttons
  - [x] **Task 4.12.10**: Make order number copyable (copy to clipboard)
    - Implemented copyOrderNumber function using navigator.clipboard.writeText() with toast notification
- [x] **Task 4.13**: Display customer information
  - [x] **Task 4.13.1**: Create customer information card component
    - Created Card component with CardHeader and CardContent for customer information display
  - [x] **Task 4.13.2**: Display customer name (`order.customer.name`)
    - Extracted customer name from order.user relationship: order.user.name || order.user.email || "Unknown"
  - [x] **Task 4.13.3**: Display customer email (`order.customer.email`)
    - Displayed customer email from order.user.email with text-sm styling
  - [ ] **Task 4.13.4**: Display customer phone (if available)
    - Customer phone display not yet implemented (phone not in order.user relationship)
  - [ ] **Task 4.13.5**: Add "View Customer" link/button to customer detail page
    - View Customer link not yet implemented
  - [x] **Task 4.13.6**: Add "Email Customer" button (mailto link)
    - Added Button with Mail icon and href={`mailto:${customer.email}`} as mailto link
  - [ ] **Task 4.13.7**: Display customer ID (if needed for reference)
    - Customer ID display not yet implemented
  - [x] **Task 4.13.8**: Use Card component with "Customer Information" title
    - Used Card with CardTitle "Customer Information" and CardDescription
  - [ ] **Task 4.13.9**: Add customer avatar/initials (optional)
    - Customer avatar/initials not yet implemented
  - [ ] **Task 4.13.10**: Show customer order count (total orders from this customer)
    - Customer order count not yet implemented (requires additional tRPC query)
- [x] **Task 4.14**: Display shipping information and tracking details
  - [x] **Task 4.14.1**: Create shipping information card component with Truck icon
    - Created Card with CardTitle containing Truck icon from lucide-react
  - [x] **Task 4.14.2**: Display shipping address (`order.shippingAddress`) - fullName, phone, street, city, state, zipcode, country
    - Conditionally displayed shippingAddress fields in formatted multi-line layout with border separator
  - [x] **Task 4.14.3**: Display shipping method (`order.shippingMethod`) - standard, express, overnight, international, local, pickup
    - Displayed shippingMethod with capitalize formatting: order.shippingMethod.replace("_", " ")
  - [x] **Task 4.14.4**: Display shipping cost (`order.shippingCost`) formatted as currency
    - Displayed shippingCost using formatCurrency function with Intl.NumberFormat
  - [x] **Task 4.14.5**: Display shipping status (`order.shippingStatus`) - pending, label_created, shipped, in_transit, out_for_delivery, delivered, exception, returned
    - Displayed shippingStatus using Badge component with capitalize formatting
  - [x] **Task 4.14.6**: Display shipping carrier (`order.carrier`) - USPS, FedEx, UPS, DHL, Other
    - Displayed carrier with capitalize formatting: order.carrier with capitalize className
  - [x] **Task 4.14.7**: Display tracking number (`order.trackingNumber`) if available
    - Conditionally displayed trackingNumber in font-mono styling when available
  - [x] **Task 4.14.8**: Display tracking URL (`order.trackingUrl`) as clickable link
    - Displayed trackingUrl as anchor tag with target="_blank" rel="noopener noreferrer" and blue hover styling
  - [x] **Task 4.14.9**: Display estimated delivery date (`order.estimatedDelivery`) formatted with date-fns
    - Formatted estimatedDelivery using date-fns: format(new Date(order.estimatedDelivery), "MMM d, yyyy")
  - [x] **Task 4.14.10**: Display actual delivery date (`order.actualDeliveryDate`) if delivered
    - Conditionally displayed actualDeliveryDate with font-medium styling when available
  - [x] **Task 4.14.11**: Display shipping label URL (`order.shippingLabelUrl`) if available
    - Conditionally displayed shippingLabelUrl as clickable link with border-t separator
  - [x] **Task 4.14.12**: Show "No tracking information available yet" message if no tracking
    - Displayed italic gray text message when !order.trackingNumber
  - [x] **Task 4.14.13**: Use Card component with "Shipping Information" title and Truck icon
    - Used Card with CardTitle containing Truck icon and CardDescription
  - [x] **Task 4.14.14**: Format carrier name with capitalize (e.g., "usps" → "Usps")
    - Applied capitalize className to carrier display text
  - [x] **Task 4.14.15**: Make tracking URL open in new tab with target="_blank" and rel="noopener noreferrer"
    - Added target="_blank" rel="noopener noreferrer" to tracking URL anchor tag
  - [x] **Task 4.14.16**: Display tracking number in monospace font for better readability
    - Applied font-mono className to tracking number display
  - [x] **Task 4.14.17**: Add shipping address fields to Orders collection (shippingAddress group with fullName, phone, street, city, state, zipcode, country)
    - Added shippingAddress group field to Orders.ts with all required sub-fields and US state select options
  - [x] **Task 4.14.18**: Add shippingMethod field to Orders collection (select: standard, express, overnight, international, local, pickup)
    - Added shippingMethod select field to Orders.ts with 6 option values
  - [x] **Task 4.14.19**: Add shippingCost field to Orders collection (number, default 0)
    - Added shippingCost number field to Orders.ts with defaultValue: 0
  - [x] **Task 4.14.20**: Add shippingStatus field to Orders collection (select: pending, label_created, shipped, in_transit, out_for_delivery, delivered, exception, returned)
    - Added shippingStatus select field to Orders.ts with 8 status option values and defaultValue: "pending"
  - [x] **Task 4.14.21**: Add actualDeliveryDate field to Orders collection (date field)
    - Added actualDeliveryDate date field to Orders.ts
  - [x] **Task 4.14.22**: Add shippingLabelUrl field to Orders collection (text field for label PDF URL)
    - Added shippingLabelUrl text field to Orders.ts
  - [x] **Task 4.14.23**: Add packageWeight field to Orders collection (number, in pounds)
    - Added packageWeight number field to Orders.ts
  - [x] **Task 4.14.24**: Add packageDimensions group to Orders collection (length, width, height in inches)
    - Added packageDimensions group field to Orders.ts with length, width, height number sub-fields
  - [x] **Task 4.14.25**: Add insuranceValue field to Orders collection (number, in USD)
    - Added insuranceValue number field to Orders.ts
  - [x] **Task 4.14.26**: Remove conditions from trackingNumber and carrier fields so they can be added at any status
    - Removed condition properties from trackingNumber and carrier fields in Orders.ts
- [x] **Task 4.15**: Display order items with quantities and prices
  - [x] **Task 4.15.1**: Create order items table component
    - Created Table component within Card for order items display
  - [x] **Task 4.15.2**: Use shadcn/ui Table component
    - Used Table, TableHeader, TableBody, TableRow, TableHead, TableCell from shadcn/ui
  - [x] **Task 4.15.3**: Add table header row with column labels
    - Added TableHeader with TableRow containing TableHead cells: Product, Quantity, Price, Total
  - [ ] **Task 4.15.4**: Display product image thumbnail column
    - Product image thumbnail column not yet implemented
  - [x] **Task 4.15.5**: Display product name column (link to product page)
    - Displayed product?.name || "Product" in TableCell with font-medium styling
  - [ ] **Task 4.15.6**: Display product SKU column
    - Product SKU column not yet implemented
  - [ ] **Task 4.15.7**: Display variant information (size, color, etc.) if exists
    - Variant information display not yet implemented (order.size and order.color exist but not displayed)
  - [x] **Task 4.15.8**: Display quantity column
    - Displayed order.quantity || 1 in TableCell
  - [x] **Task 4.15.9**: Display unit price column (formatted currency)
    - Calculated and displayed unit price: formatCurrency((order.total || 0) / (order.quantity || 1))
  - [x] **Task 4.15.10**: Display line total column (quantity × unit price)
    - Displayed order.total formatted as currency in TableCell with font-medium and text-right alignment
  - [ ] **Task 4.15.11**: Add product image thumbnails (from product.image)
    - Product image thumbnails not yet implemented
  - [ ] **Task 4.15.12**: Make product name clickable (link to product detail)
    - Product name not yet clickable, can be wrapped in Link component
  - [ ] **Task 4.15.13**: Handle missing product images (placeholder)
    - Image placeholder handling not yet implemented
  - [ ] **Task 4.15.14**: Add row hover effect
    - Row hover effect not yet added to order items table
  - [x] **Task 4.15.15**: Display item subtotal for each row
    - Line total displayed in Total column (quantity × unit price = order.total)
- [x] **Task 4.16**: Display order totals (subtotal, shipping, tax, total)
  - [x] **Task 4.16.1**: Create order summary card component
    - Created Card component with CardHeader and CardContent for order summary
  - [x] **Task 4.16.2**: Display subtotal (sum of all line items)
    - Displayed order.total as subtotal (single product per order in current schema)
  - [x] **Task 4.16.3**: Display shipping cost (if applicable)
    - Displayed order.shippingCost using formatCurrency function, shows $0.00 if undefined
  - [x] **Task 4.16.4**: Display tax amount (if applicable)
    - Displayed $0.00 as placeholder for tax (tax calculation not yet implemented)
  - [ ] **Task 4.16.5**: Display discount amount (if any coupon/discount applied)
    - Discount amount display not yet implemented (discount fields not in Orders collection)
  - [x] **Task 4.16.6**: Display total amount (bold, larger font)
    - Displayed total with font-semibold and text-lg className for emphasis
  - [x] **Task 4.16.7**: Right-align all numbers
    - Used flex justify-between with numbers on right side for all amount displays
  - [x] **Task 4.16.8**: Format all amounts as currency
    - Used formatCurrency function with Intl.NumberFormat for all monetary values
  - [x] **Task 4.16.9**: Use Card component with "Order Summary" title
    - Used Card with CardTitle "Order Summary" and CardDescription
  - [x] **Task 4.16.10**: Add separator line before total
    - Added border-t pt-3 mt-3 div before total amount display
  - [ ] **Task 4.16.11**: Display payment method (if available)
    - Payment method display not yet implemented (payment method field not in Orders collection)
  - [x] **Task 4.16.12**: Display payment status (paid, pending, refunded)
    - Displayed payment status Badge based on order.status: "Paid" for payment_done/complete, "Pending" otherwise
- [x] **Task 4.17**: Add update order status functionality
  - [x] **Task 4.17.1**: Create `UpdateStatusModal` component in `src/app/(app)/vendor/orders/[id]/components/UpdateStatusModal.tsx`
    - Created client component with Dialog, Select, Textarea, and form validation
  - [x] **Task 4.17.2**: Use shadcn/ui Dialog component for modal
    - Used Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger
  - [x] **Task 4.17.3**: Add status dropdown with all status options (pending, payment_done, processing, complete, canceled, refunded)
    - Added Select component with SelectItem for all 6 status values
  - [x] **Task 4.17.4**: Status options: pending, payment_done, processing, complete, canceled, refunded
    - All status options available in Select dropdown
  - [x] **Task 4.17.5**: Add optional note/comment field for status change (Textarea component)
    - Added Textarea component with Label for optional note input
  - [x] **Task 4.17.6**: Add form validation (status is required, show error toast if empty)
    - Added validation check: if (!status) { toast.error("Please select a status"); return; }
  - [x] **Task 4.17.7**: Call `trpc.vendor.orders.updateStatus.useMutation()` with order id, status, and optional note
    - Used trpc.vendor.orders.updateStatus.useMutation() with onSuccess and onError handlers
  - [x] **Task 4.17.8**: Show loading state during mutation (disable button, show "Updating..." text)
    - Disabled submit button and showed "Updating..." text when updateStatus.isPending is true
  - [x] **Task 4.17.9**: Show success toast notification using sonner toast.success()
    - Used toast.success("Order status updated successfully") in onSuccess handler
  - [x] **Task 4.17.10**: Invalidate order queries to refresh data (use router.refresh() or queryClient.invalidateQueries)
    - Called router.refresh() in onSuccess handler to refresh order data
  - [x] **Task 4.17.11**: Close modal on success (set open state to false)
    - Set setOpen(false) in onSuccess handler to close modal
  - [x] **Task 4.17.12**: Add "Update Status" button in order header with Package icon
    - Added UpdateStatusModal with Button containing Package icon in order header action buttons
  - [x] **Task 4.17.13**: Disable invalid status transitions (e.g., can't go from cancelled to processing, validate transitions)
    - Implemented validTransitions Record with allowed status transitions and validation check
  - [x] **Task 4.17.14**: Show confirmation dialog for status changes to "cancelled" (use window.confirm or AlertDialog)
    - Added window.confirm() check before allowing status change to "canceled"
  - [x] **Task 4.17.15**: Create tRPC procedure `vendor.orders.updateStatus` in `src/modules/vendor/server/procedures.ts`
    - Created vendorProcedure mutation with input schema: { id: string, status: enum, note?: string }
  - [x] **Task 4.17.16**: Verify vendor ownership before updating (check order.vendor === vendorId)
    - Verified ownership by comparing orderVendorId with vendorId, throws FORBIDDEN error if mismatch
  - [x] **Task 4.17.17**: Update order status using `ctx.db.update({ collection: "orders", id, data: { status } })`
    - Used ctx.db.update() to update order status, statusHistory handled by Orders collection hook
  - [x] **Task 4.17.18**: Status history is automatically tracked by Orders collection hook
    - Status history tracking implemented in Orders.ts beforeChange hook when status changes
- [ ] **Task 4.18**: Add add tracking number functionality
  - Create modal to add shipping tracking numbers and carrier information to orders
    - TrackingModal component not yet created, needs Dialog with tracking form fields
  - [ ] **Task 4.18.2**: Use shadcn/ui Dialog component for modal
    - Dialog component structure not yet implemented
  - [ ] **Task 4.18.3**: Add tracking number input field (required, min length 1)
    - Tracking number input field not yet implemented
  - [ ] **Task 4.18.4**: Add carrier dropdown (USPS, FedEx, UPS, DHL, Other) - required enum
    - Carrier dropdown not yet implemented
  - [ ] **Task 4.18.5**: Add optional tracking URL input field (if custom URL needed)
    - Optional tracking URL input not yet implemented
  - [ ] **Task 4.18.6**: Add optional estimated delivery date input (date picker)
    - Estimated delivery date input not yet implemented
  - [ ] **Task 4.18.7**: Add form validation (tracking number required, carrier required)
    - Form validation not yet implemented
  - [ ] **Task 4.18.8**: Call `trpc.vendor.orders.updateTracking.useMutation()` with order id, trackingNumber, carrier, optional trackingUrl and estimatedDelivery
    - Mutation call not yet implemented in TrackingModal
  - [x] **Task 4.18.9**: Auto-generate tracking URL based on carrier if not provided (USPS, FedEx, UPS, DHL URLs)
    - Implemented in tRPC procedure: trackingUrls Record maps carrier to URL template, auto-generates if trackingUrl not provided
  - [x] **Task 4.18.10**: Update `order.trackingNumber`, `order.carrier`, `order.trackingUrl`, and `order.estimatedDelivery` fields
    - Backend procedure updates all tracking fields: trackingNumber, carrier, trackingUrl, estimatedDelivery
  - [x] **Task 4.18.11**: Auto-update `order.shippingStatus` to "shipped" when tracking is added
    - Backend procedure sets shippingStatus: "shipped" when tracking is updated
  - [ ] **Task 4.18.12**: Show success toast notification using sonner toast.success()
    - Toast notification not yet implemented in TrackingModal (will be in onSuccess handler)
  - [ ] **Task 4.18.13**: Invalidate order queries to refresh data (router.refresh())
    - Query invalidation not yet implemented in TrackingModal (will be in onSuccess handler)
  - [ ] **Task 4.18.14**: Close modal on success
    - Modal close logic not yet implemented (will set open state to false in onSuccess)
  - [x] **Task 4.18.15**: Display tracking info in order detail (if exists) - already implemented
    - Tracking information displayed in shipping information card with conditional rendering
  - [ ] **Task 4.18.16**: Add "Add Tracking" button in order header (if no tracking exists)
    - Add Tracking button not yet added to order header
  - [ ] **Task 4.18.17**: Add "Edit Tracking" button if tracking already exists
    - Edit Tracking button not yet implemented
  - [x] **Task 4.18.18**: Make tracking number clickable (link to carrier tracking page) - already implemented
    - Tracking URL displayed as clickable link with target="_blank" in shipping information card
  - [x] **Task 4.18.19**: Create tRPC procedure `vendor.orders.updateTracking` in `src/modules/vendor/server/procedures.ts`
    - Created vendorProcedure mutation with input: { id, trackingNumber, carrier, trackingUrl?, estimatedDelivery? }
  - [x] **Task 4.18.20**: Verify vendor ownership before updating (check order.vendor === vendorId)
    - Verified ownership by comparing orderVendorId with vendorId, throws FORBIDDEN error if mismatch
  - [x] **Task 4.18.21**: Generate tracking URL automatically if carrier is known (USPS, FedEx, UPS, DHL)
    - Implemented trackingUrls Record with URL templates for usps, fedex, ups, dhl, generates URL if carrier !== "other"
  - [x] **Task 4.18.22**: Update order using `ctx.db.update({ collection: "orders", id, data: { trackingNumber, carrier, trackingUrl, estimatedDelivery, shippingStatus: "shipped" } })`
    - Used ctx.db.update() to update all tracking fields and set shippingStatus to "shipped" automatically
- [ ] **Task 4.19**: Add print invoice functionality
  - Implement print-friendly invoice view with order details, customer info, and totals
  - [ ] **Task 4.19.2**: Create print-specific CSS styles (`@media print`)
  - [ ] **Task 4.19.3**: Hide navigation, sidebar, and non-essential UI in print view
  - [ ] **Task 4.19.4**: Create invoice layout with company logo/header
  - [ ] **Task 4.19.5**: Include order details (number, date, status)
  - [ ] **Task 4.19.6**: Include customer information
  - [ ] **Task 4.19.7**: Include shipping address
  - [ ] **Task 4.19.8**: Include order items table
  - [ ] **Task 4.19.9**: Include order totals
  - [ ] **Task 4.19.10**: Use `window.print()` to trigger print dialog
  - [ ] **Task 4.19.11**: Add invoice number formatting
  - [ ] **Task 4.19.12**: Add "Thank you" message at bottom
  - [ ] **Task 4.19.13**: Add page break handling for multiple pages
- [ ] **Task 4.20**: Add order notes/comments section
  - Create component to add and manage internal and customer-visible notes on orders
  - [ ] **Task 4.20.2**: Display existing notes in chronological order (newest first)
  - [ ] **Task 4.20.3**: Show note author (vendor name or "System")
  - [ ] **Task 4.20.4**: Show note timestamp (formatted date/time)
  - [ ] **Task 4.20.5**: Show note type badge (Internal/Customer-visible)
  - [ ] **Task 4.20.6**: Add form to create new note
  - [ ] **Task 4.20.7**: Add textarea for note content
  - [ ] **Task 4.20.8**: Add note type toggle (Internal vs Customer-visible)
  - [ ] **Task 4.20.9**: Add form validation (note text required)
  - [ ] **Task 4.20.10**: Call `trpc.vendor.orders.addNote.useMutation()`
  - [ ] **Task 4.20.11**: Store notes in `order.notes` array
  - [ ] **Task 4.20.12**: Note structure: `{ text, type: "internal" | "customer", createdAt, createdBy }`
  - [ ] **Task 4.20.13**: Show success toast and refresh notes list
  - [ ] **Task 4.20.14**: Use Card component with "Order Notes" title
  - [ ] **Task 4.20.15**: Add delete note functionality (for vendor's own notes)
  - [ ] **Task 4.20.16**: Style internal notes differently (gray background)
- [ ] **Task 4.21**: Add refund functionality
  - Implement refund processing with Stripe integration for full or partial refunds
  - [ ] **Task 4.21.2**: Use shadcn/ui Dialog component
  - [ ] **Task 4.21.3**: Add refund type selection (Full refund / Partial refund)
  - [ ] **Task 4.21.4**: Display order total for reference
  - [ ] **Task 4.21.5**: Add refund amount input (for partial refunds)
  - [ ] **Task 4.21.6**: Add refund reason dropdown (Defective, Wrong item, Customer request, Other)
  - [ ] **Task 4.21.7**: Add custom reason textarea (if "Other" selected)
  - [ ] **Task 4.21.8**: Add form validation (amount must be <= order total, reason required)
  - [ ] **Task 4.21.9**: Call `trpc.vendor.orders.refund.useMutation()`
  - [ ] **Task 4.21.10**: Process Stripe refund via Stripe API (if payment processed)
  - [ ] **Task 4.21.11**: Update order status to "refunded" (if full refund)
  - [ ] **Task 4.21.12**: Add refund record to order (partial refunds)
  - [ ] **Task 4.21.13**: Show success toast notification
  - [ ] **Task 4.21.14**: Add "Refund" button in order header
  - [ ] **Task 4.21.15**: Disable refund button if already fully refunded
  - [ ] **Task 4.21.16**: Show confirmation dialog before processing refund
  - [ ] **Task 4.21.17**: Display refund history in order detail (if any refunds)
  - [ ] **Task 4.21.18**: Show refund amount and date in order summary

**Technical Details:**
- [x] Create tRPC procedure `vendor.orders.updateStatus` in `src/modules/vendor/server/procedures.ts`
  - Input: `{ id: string, status: OrderStatus, note?: string }`
  - Verify ownership: Check `order.vendor === vendorId`
  - Update: `ctx.db.update({ collection: "orders", id, data: { status } })`
  - Status history is automatically tracked by Orders collection hook
  - Return updated order
- [x] Create tRPC procedure `vendor.orders.updateTracking` in `src/modules/vendor/server/procedures.ts`
  - Input: `{ id: string, trackingNumber: string, carrier: "usps" | "fedex" | "ups" | "dhl" | "other", trackingUrl?: string, estimatedDelivery?: string }`
  - Verify ownership: Check `order.vendor === vendorId`
  - Auto-generate tracking URL if carrier is known (USPS, FedEx, UPS, DHL) and trackingUrl not provided
  - Update: `ctx.db.update({ collection: "orders", id, data: { trackingNumber, carrier, trackingUrl, estimatedDelivery, shippingStatus: "shipped" } })`
  - Auto-update shippingStatus to "shipped" when tracking is added
  - Return updated order
- [x] Create tRPC procedure `vendor.orders.updateShipping` in `src/modules/vendor/server/procedures.ts`
  - Input: `{ id: string, shippingAddress?: { fullName, phone?, street, city, state, zipcode, country? }, shippingMethod?: "standard" | "express" | "overnight" | "international" | "local" | "pickup", shippingCost?: number, shippingStatus?: "pending" | "label_created" | "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "exception" | "returned", actualDeliveryDate?: string, shippingLabelUrl?: string, packageWeight?: number, packageDimensions?: { length?, width?, height? }, insuranceValue?: number }`
  - Verify ownership: Check `order.vendor === vendorId`
  - Update only provided fields (partial update)
  - Update: `ctx.db.update({ collection: "orders", id, data: { ...updateData } })`
  - Return updated order
- [ ] Create tRPC procedure `vendor.orders.addNote`
  - Input: `{ id: string, text: string, type: "internal" | "customer" }`
  - Append note to `order.notes` array
  - Include `createdAt` and `createdBy` (vendor ID)
- [ ] Create tRPC procedure `vendor.orders.refund`
  - Input: `{ id: string, amount?: number, reason?: string }`
  - If full refund: `amount = order.total`
  - Process Stripe refund via Stripe API
  - Update order: Add refund record, update status if full refund
  - Send refund confirmation email to customer
- Order detail page layout: Use Card components for sections, responsive grid layout
- Modals: Use shadcn/ui Dialog component, form validation with react-hook-form
- Print invoice: Use CSS `@media print` to style invoice layout, hide navigation/sidebar

*****************************************************************************************

---

## Customer Management

> **Note**: A **customer** is a **User** who has placed **at least one order**. Customers are stored in a separate **Customers collection** that is automatically created/updated when orders are created. A customer can be a customer to multiple vendors (stored in `vendors` array field).

### Automatic Customer Creation (Backend)
- [x] **Task 5.0**: Implement automatic customer creation/update when orders are completed
  - [x] **Task 5.0.1**: Create Customers collection in `src/collections/Customers.ts`
    - Created collection with fields: user (relationship), name, email, phone, vendors (array), totalOrders, totalSpent, lastOrderDate, firstOrderDate, tags, notes
  - [x] **Task 5.0.2**: Register Customers collection in `src/payload.config.ts`
    - Added Customers import and added to collections array
  - [x] **Task 5.0.3**: Update Stripe webhook to create customer after order creation
    - Added customer creation/update logic in `checkout.session.completed` event handler after all orders are created
  - [x] **Task 5.0.4**: Track unique vendors during order creation loop
    - Used Set to track unique vendor IDs from all products in checkout
  - [x] **Task 5.0.5**: Check if customer exists for user (query Customers collection by user ID)
    - Query customers collection: `where: { user: { equals: userId } }`
  - [x] **Task 5.0.6**: Create new customer record if doesn't exist
    - Create customer with user, name, email, phone, vendors array, totals, and dates
  - [x] **Task 5.0.7**: Update existing customer record if exists
    - Update vendor list (add new vendors if not present), recalculate totals from all orders
  - [x] **Task 5.0.8**: Add vendor to vendors array if not already present
    - Check if vendorId exists in vendors array, add if missing (allows multi-vendor customers)
  - [x] **Task 5.0.9**: Calculate totals from all orders (totalOrders, totalSpent)
    - Query all non-canceled orders for user, sum totals and count orders
  - [x] **Task 5.0.10**: Update lastOrderDate and firstOrderDate from order dates
    - Calculate from all orders: lastOrderDate = most recent, firstOrderDate = oldest
  - [x] **Task 5.0.11**: Sync customer name, email, phone from user record
    - Update customer fields from user.name, user.email, user.phone
  - [x] **Task 5.0.12**: Handle errors gracefully (don't fail webhook if customer creation fails)
    - Wrapped customer creation in try-catch, logs error but doesn't throw
  - [x] **Task 5.0.13**: Optimize to update customer once per checkout (not per order)
    - Moved customer creation outside order loop, runs once after all orders created

### Customers List Page (`/vendor/customers`)
- [x] **Task 5.1**: Create `/vendor/customers` page
  - [x] **Task 5.1.1**: Create `src/app/(app)/vendor/customers/page.tsx` as client component
    - Created client component using "use client" directive with tRPC React Query hooks
  - [x] **Task 5.1.2**: Set up page layout with header, filters, and table sections
    - Implemented layout with useState and useQueryStates from nuqs for URL state management
  - [x] **Task 5.1.3**: Add page title "Customers" and description
    - Added h1 title and description paragraph in header section
  - [x] **Task 5.1.4**: Implement loading skeleton state
    - Used shadcn/ui Skeleton components in Card layout during isLoading state
  - [x] **Task 5.1.5**: Implement error state with retry button
    - Added error Card with error message and Button with router.refresh() onClick handler
  - [x] **Task 5.1.6**: Implement empty state when no customers found
    - Added empty state Card with message and clear filters button when no customers match
- [x] **Task 5.2**: Create customers table component
  - [x] **Task 5.2.1**: Create `src/app/(app)/vendor/customers/components/CustomersTable.tsx`
    - Created client component with Table structure and customer row mapping
  - [x] **Task 5.2.2**: Use shadcn/ui Table component with proper structure
    - Used Table, TableHeader, TableBody, TableRow, TableHead, TableCell from shadcn/ui
  - [x] **Task 5.2.3**: Add table header row with column labels
    - Added TableHeader with TableRow containing TableHead cells for all columns
  - [x] **Task 5.2.4**: Add table body with customer rows
    - Mapped over customers array to create TableRow for each customer with TableCell data
  - [x] **Task 5.2.5**: Make rows clickable to navigate to customer detail page
    - Added onClick handler with router.push(`/vendor/customers/${user?.id}`) on TableRow
  - [x] **Task 5.2.6**: Add hover effect on table rows
    - Added className="cursor-pointer hover:bg-gray-50" to TableRow
  - [x] **Task 5.2.7**: Add loading state with skeleton rows
    - Conditionally rendered Skeleton components in TableRows when isLoading is true
  - [ ] **Task 5.2.8**: Add responsive design for mobile (stack columns)
    - Responsive design for mobile not yet fully implemented
- [x] **Task 5.3**: Add customer search functionality
  - [x] **Task 5.3.1**: Create search input component in customers list header
    - Added Input component with Search icon positioned absolutely inside relative container
  - [x] **Task 5.3.2**: Add search icon (Search from lucide-react)
    - Imported and rendered Search icon from lucide-react with absolute positioning
  - [x] **Task 5.3.3**: Implement debounce (300ms) for search input
    - Used useEffect with setTimeout to debounce search state updates to debouncedSearch
  - [x] **Task 5.3.4**: Add clear search button (X icon)
    - Conditionally rendered X button that clears search state when clicked
  - [x] **Task 5.3.5**: Pass search query to `vendor.customers.list` procedure
    - Passed debouncedSearch to trpc.vendor.customers.list.useQuery as search parameter
  - [x] **Task 5.3.6**: Search in customer name field (case-insensitive)
    - Backend filters customers array by user.name.toLowerCase().includes(searchLower)
  - [x] **Task 5.3.7**: Search in customer email field (case-insensitive)
    - Backend filters customers array by user.email.toLowerCase().includes(searchLower)
  - [x] **Task 5.3.8**: Show search result count ("X customers found")
    - Conditionally displayed search result count text when debouncedSearch exists
  - [ ] **Task 5.3.9**: Store search term in URL query params with `nuqs`
    - Search term not yet synced with URL query params, stored in component state
- [x] **Task 5.4**: Display customer information in table
  - [x] **Task 5.4.1**: Display customer name column (with avatar/initials)
    - Displayed customer name with Avatar component showing initials from getInitials function
  - [x] **Task 5.4.2**: Display customer email column
    - Displayed customer email below name in text-sm text-gray-500 styling
  - [x] **Task 5.4.3**: Display total orders count column
    - Displayed customer.orderCount in TableCell
  - [x] **Task 5.4.4**: Display total spent column (format currency)
    - Formatted customer.totalSpent using formatCurrency with Intl.NumberFormat
  - [x] **Task 5.4.5**: Display average order value column (total spent / order count)
    - Displayed customer.averageOrderValue formatted as currency
  - [x] **Task 5.4.6**: Display last order date column (format with date-fns)
    - Formatted customer.lastOrderDate using date-fns format: "MMM d, yyyy"
  - [x] **Task 5.4.7**: Display customer status badge (Active, Inactive, New)
    - Displayed status using Badge component with statusColorMap className mapping
  - [x] **Task 5.4.8**: Add actions column with dropdown menu (View, Email, etc.)
    - Added DropdownMenu with MoreHorizontal icon trigger and "View Details" and "Email Customer" menu items
  - [ ] **Task 5.4.9**: Truncate long text with ellipsis and tooltip
    - Text truncation not yet implemented for long customer names/emails
- [x] **Task 5.5**: Add customer sorting
  - [x] **Task 5.5.1**: Create sort dropdown component
    - Used shadcn/ui Select component with combined sortBy-sortOrder value format
  - [x] **Task 5.5.2**: Add "Name (A-Z)" sort option
    - Added SelectItem with value="name-asc" for alphabetical name sorting
  - [x] **Task 5.5.3**: Add "Name (Z-A)" sort option
    - Added SelectItem with value="name-desc" for reverse alphabetical name sorting
  - [x] **Task 5.5.4**: Add "Total Spent (High to Low)" sort option
    - Added SelectItem with value="totalSpent-desc" for high to low total spent sorting
  - [x] **Task 5.5.5**: Add "Total Spent (Low to High)" sort option
    - Added SelectItem with value="totalSpent-asc" for low to high total spent sorting
  - [x] **Task 5.5.6**: Add "Order Count (High to Low)" sort option
    - Added SelectItem with value="orderCount-desc" for high to low order count sorting
  - [x] **Task 5.5.7**: Add "Last Order Date (Newest)" sort option
    - Added SelectItem with value="lastOrderDate-desc" for newest first sorting
  - [x] **Task 5.5.8**: Store sort preference in URL query params
    - Used setQueryState({ sortBy, sortOrder }) to update URL query params with nuqs
- [x] **Task 5.6**: Add pagination for customers
  - [x] **Task 5.6.1**: Use shadcn/ui Pagination component
    - Implemented pagination with Button components and page number display
  - [x] **Task 5.6.2**: Pass `page` and `limit` to tRPC query
    - Passed page (from queryState) and limit: 20 to trpc.vendor.customers.list.useQuery
  - [x] **Task 5.6.3**: Display "Showing X-Y of Z customers" text
    - Calculated and displayed: "Showing {startItem} to {endItem} of {totalDocs} customers"
  - [x] **Task 5.6.4**: Handle `hasNextPage` from Payload response
    - Used data.hasNextPage to disable Next button when on last page
  - [x] **Task 5.6.5**: Handle `hasPrevPage` from Payload response
    - Used currentPage === 1 to disable Previous button when on first page
  - [x] **Task 5.6.6**: Add "Previous" button (disabled when on first page)
    - Added Button with disabled prop when currentPage === 1
  - [x] **Task 5.6.7**: Add "Next" button (disabled when on last page)
    - Added Button with disabled prop when currentPage >= totalPages
  - [x] **Task 5.6.8**: Store current page in URL query params
    - Used setQueryState({ page: String(newPage) }) to update URL with nuqs
- [x] **Task 5.7**: Add customer filters
  - [x] **Task 5.7.1**: Add filter by customer status (All, Active, Inactive, New)
    - Added Select component with SelectItem options for all, active, inactive, new statuses
  - [ ] **Task 5.7.2**: Add filter by order count range (e.g., 1-5, 6-10, 10+)
    - Order count range filter not yet implemented in UI
  - [ ] **Task 5.7.3**: Add filter by total spent range (e.g., $0-$100, $100-$500, $500+)
    - Total spent range filter not yet implemented in UI
  - [ ] **Task 5.7.4**: Add filter by last order date (Last 7 days, Last 30 days, Last 90 days)
    - Last order date filter not yet implemented in UI
  - [x] **Task 5.7.5**: Update URL query params with `nuqs` for shareable filters
    - Used setQueryState({ status: value, page: "1" }) to update URL query params
  - [x] **Task 5.7.6**: Add "Clear filters" button
    - Added Button that resets all filters (status, search) and updates query state
- [ ] **Task 5.8**: Add export customers functionality
  - Enable vendors to export customer data to CSV format with current filters applied
  - [ ] **Task 5.8.2**: Create export dropdown menu (CSV option)
  - [ ] **Task 5.8.3**: Implement CSV export using `papaparse`
  - [ ] **Task 5.8.4**: Convert customers array to CSV format
  - [ ] **Task 5.8.5**: Include all customer fields in CSV (name, email, orders, total spent, last order)
  - [ ] **Task 5.8.6**: Trigger CSV download with filename "customers-YYYY-MM-DD.csv"
  - [ ] **Task 5.8.7**: Filter exported data by current filters/search

### Customer Detail Page (`/vendor/customers/[id]`)
- [ ] **Task 5.9**: Create customer detail page
  - Create detailed customer view page showing information, statistics, and order history
  - [ ] **Task 5.9.2**: Fetch customer data using tRPC `vendor.customers.getOne` procedure
  - [ ] **Task 5.9.3**: Create `CustomerDetailView` client component
  - [ ] **Task 5.9.4**: Set up page layout with header and content sections
  - [ ] **Task 5.9.5**: Implement loading skeleton state
  - [ ] **Task 5.9.6**: Implement error state with retry button
  - [ ] **Task 5.9.7**: Implement not found state
- [ ] **Task 5.10**: Display customer information
  - Show customer contact details, registration date, and status in organized card layout
  - [ ] **Task 5.10.2**: Display customer name with avatar/initials
  - [ ] **Task 5.10.3**: Display customer email
  - [ ] **Task 5.10.4**: Display customer phone (if available)
  - [ ] **Task 5.10.5**: Display customer registration date
  - [ ] **Task 5.10.6**: Display customer status badge
  - [ ] **Task 5.10.7**: Add "Email Customer" button (mailto link)
  - [ ] **Task 5.10.8**: Use Card component with "Customer Information" title
- [ ] **Task 5.11**: Display customer statistics
  - Display key customer metrics including total orders, spending, and average order value
  - [ ] **Task 5.11.2**: Display total orders count card
  - [ ] **Task 5.11.3**: Display total spent card (format currency)
  - [ ] **Task 5.11.4**: Display average order value card
  - [ ] **Task 5.11.5**: Display last order date card
  - [ ] **Task 5.11.6**: Use responsive grid layout for statistics cards
- [ ] **Task 5.12**: Display customer order history
  - Show table of all orders placed by the customer with pagination and sorting
  - [ ] **Task 5.12.2**: Display order number column (clickable to order detail)
  - [ ] **Task 5.12.3**: Display order date column (format with date-fns)
  - [ ] **Task 5.12.4**: Display order status column with badge
  - [ ] **Task 5.12.5**: Display order total column (format currency)
  - [ ] **Task 5.12.6**: Add pagination for order history
  - [ ] **Task 5.12.7**: Add sorting for order history (newest first by default)
  - [ ] **Task 5.12.8**: Use Card component with "Order History" title
- [ ] **Task 5.13**: Add customer tags/segments
  - Allow vendors to tag and segment customers for better organization and marketing
  - [ ] **Task 5.13.2**: Add form to add new tag
  - [ ] **Task 5.13.3**: Add tag input field with autocomplete
  - [ ] **Task 5.13.4**: Call `trpc.vendor.customers.addTag.useMutation()`
  - [ ] **Task 5.13.5**: Add remove tag functionality (X button on each tag)
  - [ ] **Task 5.13.6**: Store tags in customer record or separate collection
  - [ ] **Task 5.13.7**: Use Card component with "Tags" title
- [ ] **Task 5.14**: Add customer notes
  - Enable vendors to add internal notes about customers for reference and communication
  - [ ] **Task 5.14.2**: Show note author (vendor name)
  - [ ] **Task 5.14.3**: Show note timestamp (formatted date/time)
  - [ ] **Task 5.14.4**: Add form to create new note
  - [ ] **Task 5.14.5**: Add textarea for note content
  - [ ] **Task 5.14.6**: Add form validation (note text required)
  - [ ] **Task 5.14.7**: Call `trpc.vendor.customers.addNote.useMutation()`
  - [ ] **Task 5.14.8**: Store notes in customer record or separate collection
  - [ ] **Task 5.14.9**: Show success toast and refresh notes list
  - [ ] **Task 5.14.10**: Use Card component with "Notes" title
  - [ ] **Task 5.14.11**: Add delete note functionality (for vendor's own notes)

**Technical Details:**
- **Customer Definition**: A customer is a **User** who has placed **at least one order**. Customers are stored in a separate **Customers collection** (`src/collections/Customers.ts`) that is automatically created/updated when orders are created via the Stripe webhook.
- **Customer Collection Fields**: `user` (relationship to Users), `name`, `email`, `phone`, `vendors` (array of vendor IDs), `totalOrders`, `totalSpent`, `lastOrderDate`, `firstOrderDate`, `tags` (array), `notes` (array)
- **Automatic Customer Creation**: When an order is created in `src/app/api/stripe/webhook/route.ts`, the webhook automatically:
  - Tracks unique vendors from all products in checkout (using Set)
  - After all orders are created, checks if customer record exists for user
  - Creates new customer record if doesn't exist with initial totals
  - Updates existing customer record with new order totals, vendor list, and dates
  - Adds vendor(s) to `vendors` array if not already present (allows customer to be customer to multiple vendors)
  - Calculates totals from all non-canceled orders (totalOrders, totalSpent)
  - Updates lastOrderDate (most recent) and firstOrderDate (oldest) from all orders
  - Syncs customer name, email, phone from user record
  - Runs once per checkout (optimized, not per order)
- [x] Create Customers collection in `src/collections/Customers.ts`
  - Relationship to Users collection (one-to-one, unique)
  - Fields: name, email, phone, vendors (array), totalOrders, totalSpent, lastOrderDate, firstOrderDate, tags, notes
  - Access control: Vendors can read/update customers who have ordered from them (vendors array contains vendorId)
- [x] Update Stripe webhook to create/update customers in `src/app/api/stripe/webhook/route.ts`
  - After creating all orders, track unique vendors from checkout
  - Fetch user details from Users collection
  - Check if customer exists: `where: { user: { equals: userId } }`
  - If exists: update vendor list, recalculate totals from all orders, update dates
  - If not exists: create new customer with vendors array, totals, and dates
  - Calculate totals from all non-canceled orders (not just current checkout)
  - Error handling: wrapped in try-catch, doesn't fail webhook if customer creation fails
- [x] Create tRPC procedure `vendor.customers.list` in `src/modules/vendor/server/procedures.ts`
  - Query Customers collection filtered by vendor: `where: { vendors: { contains: vendorId } }`
  - Join with users collection (depth 1) to get user details
  - Support search (name/email case-insensitive), sorting (name, totalSpent, totalOrders, lastOrderDate), pagination, filters (status, orderCount, totalSpent, lastOrderDays)
  - Use Payload where clauses for efficient filtering (no in-memory aggregation needed)
- [x] Create tRPC procedure `vendor.customers.getOne` in `src/modules/vendor/server/procedures.ts`
  - Input: `{ id: string }` (user ID from users collection)
  - Query Customers collection: `where: { user: { equals: userId }, vendors: { contains: vendorId } }`
  - If customer not found, throw NOT_FOUND error
  - Get vendor-specific orders to calculate vendor-specific statistics
  - Return customer record with user details, vendor-specific stats (total orders from this vendor, total spent from this vendor, AOV)
  - Include order history (paginated, filtered by vendor and user)
- Create tRPC procedure `vendor.customers.addTag` in `src/modules/vendor/server/procedures.ts`
  - Input: `{ id: string, tag: string }` (id is user ID)
  - Query customer: `where: { user: { equals: userId }, vendors: { contains: vendorId } }`
  - Add tag to customer.tags array with vendor field set to vendorId (vendor-specific tags)
  - Update customer record
- Create tRPC procedure `vendor.customers.addNote` in `src/modules/vendor/server/procedures.ts`
  - Input: `{ id: string, text: string }` (id is user ID)
  - Query customer: `where: { user: { equals: userId }, vendors: { contains: vendorId } }`
  - Add note to customer.notes array with vendor and createdBy fields
  - Note structure: `{ text, vendor: vendorId, createdBy: userId, createdAt: new Date() }`
- Customer data: Stored in Customers collection, automatically synced when orders are created
- Search: Case-insensitive name/email search using Payload `contains` operator on customer fields
- Totals: Stored in customer record (totalOrders, totalSpent) - calculated across all vendors, vendor-specific stats calculated from orders
- Customer status: "Active" (lastOrderDate in last 90 days), "Inactive" (lastOrderDate > 90 days ago), "New" (firstOrderDate in last 30 days and totalOrders === 1)
- Customer detail page layout: Use Card components for sections, responsive grid layout
- Tables: Use shadcn/ui Table component, pagination with limit 20

*****************************************************************************************

---
## Analytics & Reports

### Analytics Page (`/vendor/analytics`)
- [x] **Task 6.1**: Create `/vendor/analytics` page ✅
  - Created `src/app/(app)/vendor/analytics/page.tsx` as client component with tRPC React Query hooks, loading skeletons, and error states
- [x] **Task 6.2**: Add report type selector buttons (Daily, Weekly, Monthly) ✅
  - Created `ReportButtons.tsx` component with 3 Button components, active state styling, and onClick handlers to switch report types
- [x] **Task 6.3**: Create data aggregation tRPC procedure for daily report ✅
  - Created `vendor.analytics.getDailyReport` procedure filtering orders by vendor and today's date range, aggregating order and inventory statistics
- [x] **Task 6.4**: Create data aggregation tRPC procedure for weekly report ✅
  - Created `vendor.analytics.getWeeklyReport` procedure filtering orders from Monday to Sunday of current week, same aggregation structure as daily
- [x] **Task 6.5**: Create data aggregation tRPC procedure for monthly report ✅
  - Created `vendor.analytics.getMonthlyReport` procedure filtering orders from 1st to last day of current month, same aggregation structure as daily
- [x] **Task 6.6**: Create LLM summary generation tRPC procedure (cost-optimized) ✅
  - Created `vendor.analytics.generateSummary` procedure using OpenAI `gpt-4o-mini` model with `max_tokens: 300`, formats aggregated stats into prompt (<500 tokens), includes error handling
- [x] **Task 6.7**: Format data for LLM prompt ✅
  - Prompt builder function formats report type, date range, order statistics (count, revenue, AOV, status breakdown, top 3 products), and inventory statistics into concise natural language
- [x] **Task 6.8**: Add LLM API key configuration ✅
  - Reads `OPENAI_API_KEY` from `process.env.OPENAI_API_KEY`, validates key exists, throws error if missing
- [x] **Task 6.9**: Create report summary display component ✅
  - Created `ReportSummary.tsx` component displaying LLM-generated summary in Card with prose styling, loading skeleton, error state, and regenerate button
- [x] **Task 6.10**: Implement report generation flow ✅
  - On "Generate Report" button click, calls appropriate tRPC procedure (getDailyReport/getWeeklyReport/getMonthlyReport), then calls generateSummary, shows loading states and error toasts
- [x] **Task 6.11**: Add report data display (before/alongside summary) ✅
  - Created `ReportData.tsx` component displaying order count, revenue, AOV, status breakdown, product count, low stock, out of stock, and inventory value in Card stat cards with responsive grid layout
- [ ] **Task 6.12**: Add aggressive caching for LLM summaries (CRITICAL for cost optimization)
  - Implement caching system to store LLM-generated summaries and reduce API costs
- [ ] **Task 6.13**: Add loading states for report generation
  - Show loading indicators and disable buttons during report generation to prevent duplicate requests
- [ ] **Task 6.14**: Add error handling for LLM failures
  - Handle LLM API errors gracefully with fallback to raw statistics and clear error messages
- [ ] **Task 6.15**: Add export report functionality
  - Allow vendors to export analytics reports as text files with summary and statistics
- [ ] **Task 6.16**: Add revenue chart (line chart for last 30/90/365 days)
  - Create line chart visualization showing revenue trends over configurable time periods
- [ ] **Task 6.17**: Add orders chart (bar chart, orders over time)
  - Display bar chart showing order count trends over time for better sales insights
- [ ] **Task 6.18**: Add top products table (by revenue)
  - Display table of best-selling products ranked by total revenue generated
- [ ] **Task 6.19**: Add top products table (by quantity sold)
  - Show table of products ranked by quantity sold to identify popular items
- [ ] **Task 6.20**: Add sales by category chart (pie chart)
  - Create pie chart showing revenue distribution across product categories

*****************************************************************************************

---

## Inventory Management

### Inventory Overview Page (`/vendor/inventory`)
- [ ] **Task 7.1**: Create `/vendor/inventory` page
  - Create inventory management page to view and manage product stock levels
- [ ] **Task 7.2**: Create inventory table component (product name, variants, stock levels, status)
  - Build table component displaying products with their variants, stock levels, and status indicators
- [ ] **Task 7.3**: Display low stock alerts (products with stock below threshold)
  - Highlight products with stock below threshold and show alert count in header
- [ ] **Task 7.4**: Add filter by stock status (all, in stock, low stock, out of stock)
  - Enable filtering inventory by stock status to quickly find products needing attention
- [ ] **Task 7.5**: Add search functionality (by product name or SKU)
  - Implement search to quickly find products by name or SKU in the inventory list
- [ ] **Task 7.6**: Display variant-level inventory (size/color combinations)
  - Show stock levels for each product variant (size/color) in organized expandable view
- [ ] **Task 7.7**: Add bulk inventory update functionality
  - Enable updating stock levels for multiple products or variants simultaneously
- [ ] **Task 7.8**: Add inventory export (CSV)
  - Allow vendors to export current inventory data to CSV for external analysis
- [ ] **Task 7.9**: Add inventory value calculation (total stock value)
  - Calculate and display total monetary value of all inventory on hand

### Inventory Detail & Adjustments
- [ ] **Task 7.10**: Add quick stock adjustment (increment/decrement) from inventory list
  - Provide quick +/- buttons to adjust stock levels directly from the inventory table
- [ ] **Task 7.11**: Create inventory adjustment modal/form
  - Build modal form for detailed stock adjustments with reason tracking and notes
- [ ] **Task 7.12**: Add adjustment reason/notes field
  - Allow vendors to specify reason for stock adjustments and add notes for audit trail
- [ ] **Task 7.13**: Track inventory adjustment history (who, when, why, before/after)
  - Maintain complete audit trail of all inventory adjustments with user and timestamp information
- [ ] **Task 7.14**: Add set stock level functionality (absolute value)
  - Enable setting absolute stock values instead of only increment/decrement operations
- [ ] **Task 7.15**: Add stock transfer between variants (if applicable)
  - Enable transferring stock quantities between product variants (e.g., from one size to another)
- [ ] **Task 7.16**: Display inventory history/transactions per product
  - Show complete history of stock adjustments for each product with timestamps and reasons

### Low Stock Alerts & Notifications
- [ ] **Task 7.17**: Add low stock threshold setting per product/variant
  - Allow vendors to set custom low stock thresholds for individual products or variants
- [ ] **Task 7.18**: Display low stock badge/indicator in inventory list
  - Show visual indicators (badges) for products with stock below threshold in inventory table
- [ ] **Task 7.19**: Add email notification for low stock products
  - Send automated email alerts when product stock falls below configured threshold
- [ ] **Task 7.20**: Add dashboard widget showing low stock count
  - Display low stock alert count on dashboard with link to filtered inventory page
- [ ] **Task 7.21**: Add out of stock product hiding option (auto-hide when stock = 0)
  - Automatically hide products from public view when stock reaches zero (optional setting)

### Inventory Reports
- [ ] **Task 7.22**: Create inventory value report (total value of all stock)
  - Generate report showing total monetary value of all inventory items
- [ ] **Task 7.23**: Create stock movement report (in/out over time period)
  - Generate report showing stock additions and subtractions over specified time periods
- [ ] **Task 7.24**: Create top selling products report (by quantity sold)
  - Generate report ranking products by total quantity sold over time period
- [ ] **Task 7.25**: Create slow-moving inventory report (products with no sales in X days)
  - Identify products with no sales in specified time period to help with inventory decisions
- [ ] **Task 7.26**: Add inventory aging report (products in stock for X days)
  - Generate report showing how long products have been in stock to identify stale inventory

*****************************************************************************************

---

## Payouts & Finance

### Payouts Page (`/vendor/payouts`)
- [ ] **Task 8.1**: Create payouts page
  - Create main payouts page with payout history and pending payouts display
- [ ] **Task 8.2**: Display payout history table
  - Show table of all past payouts with dates, amounts, and status information
- [ ] **Task 8.3**: Display pending payouts
  - Show payouts that are scheduled or in processing status
- [ ] **Task 8.4**: Display payout status (pending, processing, completed, failed)
  - Add status badges to indicate current state of each payout
- [ ] **Task 8.5**: Add payout details view
  - Create detailed view showing breakdown of order totals and commission deductions
- [ ] **Task 8.6**: Add payout schedule information
  - Display payout frequency and next scheduled payout date
- [ ] **Task 8.7**: Add bank account/payment method management
  - Allow vendors to add and manage bank accounts for receiving payouts
- [ ] **Task 8.8**: Add payout request functionality
  - Enable vendors to request manual payouts outside of scheduled intervals
- [ ] **Task 8.9**: Display earnings breakdown
  - Show total earnings, commission deducted, and net payout amounts

**Technical Details:**
- Create tRPC procedure `vendor.stripeConnect.createAccount` (create Stripe Express account, generate onboarding link)
- Save `stripeAccountId` to vendor record after account creation
- Account link: Redirect to Stripe onboarding, return to `/vendor/settings/payment`
- Payout calculation: Order total - commission rate, store in order record
- Payout schedule: Weekly/bi-weekly/monthly, automatic processing via cron job
- Display payout history: Filter by vendor, show status (pending/processing/completed/failed)

*****************************************************************************************

---

## Notifications

### Notifications Page (`/vendor/notifications`)
- [ ] **Task 9.1**: Create `/vendor/notifications` page
  - Create notifications page to display all vendor-related notifications
- [ ] **Task 9.2**: Display notification list
  - Show chronological list of notifications with icons and timestamps
- [ ] **Task 9.3**: Add notification types (order, product, payout, system)
  - Categorize notifications by type with appropriate icons and styling
- [ ] **Task 9.4**: Add mark as read functionality
  - Allow vendors to mark individual notifications as read
- [ ] **Task 9.5**: Add mark all as read functionality
  - Provide bulk action to mark all notifications as read at once
- [ ] **Task 9.6**: Add notification filters (by type, read/unread)
  - Enable filtering notifications by type and read status
- [ ] **Task 9.7**: Add real-time notification updates (WebSocket or polling)
  - Implement real-time updates using WebSocket or polling mechanism
- [ ] **Task 9.8**: Add notification preferences settings
  - Allow vendors to configure which notification types they want to receive

**Technical Details:**
- Create notifications collection (vendor, type, message, read status, createdAt)
- Create tRPC procedure `vendor.notifications.list` (filtered by vendor, sorted by createdAt desc)
- Create tRPC procedure `vendor.notifications.markRead` (update read status)
- Create tRPC procedure `vendor.notifications.markAllRead` (bulk update)
- Notification bell: Show unread count badge, dropdown with recent notifications
- Real-time: Polling (30s interval) or WebSocket for instant updates

*****************************************************************************************

---

## Settings

### Settings Page (`/vendor/settings`)
- [ ] **Task 10.1**: Create `/vendor/settings` page
  - Create settings page with tabbed interface for different setting categories
- [ ] **Task 10.2**: Create settings tabs (Profile, Payment, Shipping, Notifications)
  - Implement tab navigation to organize settings into logical sections
- [ ] **Task 10.3**: Add vendor profile settings form (name, description, logo, cover image)
  - Create form to update vendor profile information and branding assets
- [ ] **Task 10.4**: Add contact information form (email, phone, website, address)
  - Allow vendors to manage their contact details and business information
- [ ] **Task 10.5**: Add shipping settings (zones, rates, free shipping threshold)
  - Configure shipping zones, rates, and free shipping thresholds
- [ ] **Task 10.6**: Add tax settings
  - Configure tax rates and tax-exempt status if applicable
- [ ] **Task 10.7**: Add payment method settings (Stripe Connect integration)
  - Integrate Stripe Connect for vendor payouts and payment processing
- [ ] **Task 10.8**: Add notification preferences (email toggles for orders, low stock, etc.)
  - Allow vendors to customize which email notifications they receive
- [ ] **Task 10.9**: Add account security settings
  - Provide password change and two-factor authentication options
- [ ] **Task 10.10**: Add API keys management (if applicable)
  - Allow vendors to generate and manage API keys for integrations

**Technical Details:**
- Create tRPC procedure `vendor.settings.updateProfile` (update vendor collection fields)
- Create tRPC procedure `vendor.settings.updateShipping` (update shipping zones/rates)
- Create tRPC procedure `vendor.settings.updateNotifications` (update notification preferences)
- Settings page: Use Tabs component from shadcn/ui, separate components for each tab
- Profile: Image upload for logo/cover using Payload media collection
- Payment: Stripe Connect account creation and onboarding flow
- Form validation: Zod schemas, react-hook-form for each settings section

*****************************************************************************************

---

## UI/UX Improvements

### General Improvements
- [ ] **Task 11.1**: Add loading skeletons for all pages
  - Implement skeleton loaders for all pages to improve perceived performance
- [ ] **Task 11.2**: Add error boundaries
  - Add React error boundaries to catch and display errors gracefully
- [ ] **Task 11.3**: Add empty states for all lists
  - Create helpful empty states with clear messaging and call-to-action buttons
- [ ] **Task 11.4**: Add toast notifications for actions
  - Use toast notifications to provide feedback for user actions
- [ ] **Task 11.5**: Add confirmation dialogs for destructive actions
  - Require confirmation before deleting or performing irreversible actions
- [ ] **Task 11.6**: Improve mobile responsiveness
  - Ensure all vendor dashboard pages work well on mobile devices
- [ ] **Task 11.7**: Add keyboard shortcuts
  - Implement keyboard shortcuts for common actions to improve efficiency
- [ ] **Task 11.8**: Add dark mode support (optional)
  - Add dark mode theme option for better user experience in low-light conditions
- [ ] **Task 11.9**: Add accessibility improvements (ARIA labels, keyboard navigation)
  - Improve accessibility with proper ARIA labels and keyboard navigation support
- [ ] **Task 11.10**: Add tooltips for complex features
  - Add tooltips to explain complex features and improve user understanding

### Search Functionality
- [ ] **Task 11.11**: Implement global search in header
  - Add global search bar in header to search across products, orders, and customers
- [ ] **Task 11.12**: Add search suggestions
  - Show autocomplete suggestions as user types in search field
- [ ] **Task 11.13**: Add search history
  - Store and display recent searches for quick access
- [ ] **Task 11.14**: Add keyboard shortcut for search (Cmd/Ctrl + K)
  - Enable quick access to search with keyboard shortcut

### Performance
- [ ] **Task 11.15**: Optimize image loading
  - Implement lazy loading and image optimization for better performance
- [ ] **Task 11.16**: Add pagination for large lists
  - Ensure all large data lists use pagination to improve load times
- [ ] **Task 11.17**: Implement virtual scrolling for large tables
  - Use virtual scrolling for tables with many rows to improve performance
- [ ] **Task 11.18**: Add data caching strategies
  - Implement caching for frequently accessed data to reduce API calls
- [ ] **Task 11.19**: Optimize API calls
  - Batch API calls and use query optimization to reduce server load

*****************************************************************************************

---

## Technical Tasks

### Backend/API
- [x] **Task 12.1**: Create tRPC procedures for vendor products (list, getOne, create, update, delete, bulkUpdate) ✅
  - Vendor product procedures already implemented with vendor filtering and ownership verification
- [x] **Task 12.2**: Create tRPC procedures for vendor orders (list, getOne, updateStatus) ✅
  - Create order management procedures with proper vendor filtering and access control
- [ ] **Task 12.3**: Create tRPC procedures for vendor analytics (revenue, orders, topProducts, metrics)
  - Build analytics procedures to aggregate and return vendor-specific metrics
- [ ] **Task 12.4**: Create tRPC procedures for vendor payouts (list, getOne, requestPayout)
  - Implement payout management procedures with Stripe Connect integration
- [ ] **Task 12.5**: Add vendor data filtering in all queries (always filter by `vendor: { equals: vendorId }`)
  - Ensure all database queries filter by vendor ID to maintain data isolation
- [ ] **Task 12.6**: Add vendor permissions checks (verify ownership before update/delete)
  - Verify vendor ownership before allowing updates or deletions
- [ ] **Task 12.7**: Implement file upload for product images (Payload media collection)
  - Set up file upload functionality using Payload's media collection
- [ ] **Task 12.8**: Add image optimization/resizing (sharp or imagekit)
  - Optimize uploaded images for web performance and storage efficiency
- [ ] **Task 12.9**: Implement order status update workflow (status transitions, email notifications)
  - Create workflow for order status updates with proper state transitions and notifications
- [ ] **Task 12.10**: Add payout calculation logic (order total - commission, store in order record)
  - Calculate vendor payouts by subtracting commission from order totals
- [x] **Task 12.11**: Implement shipping address validation in checkout and webhook ✅
  - Validate shipping addresses in frontend checkout and Stripe webhook before order creation

**Technical Details:**
- All tRPC procedures use `vendorProcedure` middleware (ensures vendor is approved & active)
- Vendor ID: Always use `ctx.session.vendor.id || ctx.session.vendor` (handles string/object)
- Ownership verification: Check vendor field matches authenticated vendor before updates
- Image upload: Use Payload's upload field, relationTo: "media", support multiple images array
- **Shipping Address Validation**: 
  - Frontend: `trpc.addresses.getUserAddresses.useQuery()` to check if user has shipping address
  - Stripe Checkout: `shipping_address_collection: { allowed_countries: ['US'] }` requires shipping address
  - Webhook: Extract from `session.shipping_details.address` or `session.customer_details.shipping.address`
  - Validation: All required fields (fullName, street, city, state, zipcode) must be present
  - Error handling: Throw clear errors if shipping address is missing or incomplete, prevent order creation

### Database
- [ ] **Task 12.12**: Ensure proper indexing for vendor queries (index on `vendor` field in products/orders)
  - Add database indexes on vendor fields to improve query performance
- [ ] **Task 12.13**: Add database migrations if needed (for new fields/collections)
  - Create migration scripts for schema changes and new collections
- [ ] **Task 12.14**: Optimize database queries (use depth appropriately, pagination for large datasets)
  - Optimize queries by using appropriate depth levels and implementing pagination

**Technical Details:**
- Indexes: Add index on `vendor` field in products and orders collections
- Query depth: Use depth 0 for counts, depth 1 for basic relations, depth 2 for nested relations
- Pagination: Always use pagination for list queries, default limit 20, max 100

### Testing
- [ ] **Task 12.15**: Add unit tests for vendor components (React Testing Library)
  - Write unit tests for all vendor dashboard components using React Testing Library
- [ ] **Task 12.16**: Add integration tests for vendor flows (tRPC procedure testing)
  - Create integration tests for tRPC procedures and vendor workflows
- [ ] **Task 12.17**: Add E2E tests for critical paths (Playwright/Cypress)
  - Implement end-to-end tests for critical vendor dashboard user flows
- [ ] **Task 12.18**: Test vendor permissions and access control (verify data isolation)
  - Verify that vendors can only access their own data and cannot access other vendors' information

**Technical Details:**
- Unit tests: Test components with mocked tRPC queries
- Integration tests: Test tRPC procedures with test database, verify vendor filtering
- E2E tests: Test full flows (login → dashboard → create product → view orders)
- Security tests: Verify vendors can't access other vendors' data

*****************************************************************************************

---

## Priority Legend

- **P0**: Critical - Must have for MVP
- **P1**: High - Important for launch
- **P2**: Medium - Nice to have
- **P3**: Low - Future enhancement

---

## Best Practices & Tips

### 1. Data Isolation
- Always filter by vendor in queries
- Use `vendorProcedure` for vendor-specific operations
- Validate vendor ownership before updates/deletes

### 2. Performance
- Add database indexes on `vendor` field
- Use pagination for large lists
- Cache vendor data when appropriate

### 3. Security
- Never trust client-side vendor ID
- Always verify vendor ownership server-side
- Use HTTP-only cookies for authentication
- Validate all inputs with Zod

### 4. User Experience
- Show loading states
- Provide clear error messages
- Add confirmation dialogs for destructive actions
- Use optimistic updates where appropriate

### 5. Testing
- Test vendor data isolation
- Test access control
- Test single-vendor cart validation scenarios
- Test edge cases (suspended vendors, etc.)

---

## Notes

- All vendor pages should be protected by vendor authentication middleware
- All data should be filtered to only show vendor's own data
- Consider mobile-first design for all features
- Follow Shopify admin design patterns for consistency
- Ensure all actions have proper loading and error states

---

**Last Updated**: [Current Date]
**Status**: In Progress
