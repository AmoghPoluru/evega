# Vendor Admin System - Comprehensive TODO List
## Multi-Vendor Marketplace Implementation

> **Architecture Decision**: Same Application with Route Groups
> - Vendor admin pages: `/vendor/*` (route group: `(app)/(vendor)`)
> - Customer pages: `/` (route group: `(app)/(home)`)
> - Shared authentication, components, and database
> - Single deployment, easier maintenance

---

## Phase 1: Foundation & Data Model (Tasks 1-25)

### 0. Create Roles Collection (Prerequisite)
- [x] **Task 0.1**: Create `src/collections/Roles.ts` file ✅
- [x] **Task 0.2**: Add `name`, `slug`, `type` (app/vendor), `description`, `permissions` fields ✅
- [x] **Task 0.3**: Register Roles collection in `src/payload.config.ts` ✅
- [x] **Task 0.4**: Generate TypeScript types ✅

**Technical Details:**
- Roles collection supports two types: "app" (application-level roles like app-admin, customer) and "vendor" (vendor organization roles like vendor-owner, vendor-manager)
- Each role has permissions array for granular access control, slug auto-generation, and isActive flag
- This collection is prerequisite for Users collection which references roles via relationships

******************************************************************************************

### 1. Create Vendors Collection
- [x] **Task 1.1**: Create `src/collections/Vendors.ts` file ✅
- [x] **Task 1.2**: Add `name` field (text, required) ✅
- [x] **Task 1.3**: Add `slug` field (text, unique, auto-generated from name) ✅
- [x] **Task 1.4**: Add `description` field (richText, optional) ✅
- [x] **Task 1.5**: Add `logo` field (upload, relationTo: media) ✅
- [x] **Task 1.6**: Add `coverImage` field (upload, relationTo: media) ✅
- [x] **Task 1.7**: Add `email` field (email, required) ✅
- [x] **Task 1.8**: Add `phone` field (text, optional) ✅
- [x] **Task 1.9**: Add `website` field (text, optional) ✅
- [x] **Task 1.10**: Add `address` group field (street, city, state, zipcode, country) ✅
- [x] **Task 1.11**: Add `status` field (select: pending, approved, suspended, rejected) ✅
- [x] **Task 1.12**: Add `isActive` checkbox (default: false) ✅
- [x] **Task 1.13**: Add `stripeAccountId` field (text, for Stripe Connect) ✅
- [x] **Task 1.14**: Add `commissionRate` field (number, default: 10%, platform fee) ✅
- [x] **Task 1.15**: Add `verificationDocuments` array field (uploads for business verification) ✅
- [x] **Task 1.16**: Add `createdAt` and `updatedAt` timestamps (auto) ✅
- [x] **Task 1.17**: Add access control (read: public, create: authenticated, update: vendor owner or super-admin) ✅
- [x] **Task 1.18**: Add hooks for slug auto-generation ✅
- [x] **Task 1.19**: Register Vendors collection in `src/payload.config.ts` ✅
- [x] **Task 1.20**: Generate TypeScript types (`npm run generate:types`) ✅
**Technical Details:**
- Created `Vendors` collection with 20 fields including business info, status workflow, Stripe Connect integration, and verification documents
- Implemented access control: public read, authenticated create, vendor owner/super-admin update, super-admin delete
- Auto-generated slug from name using `beforeValidate` hook with regex sanitization
- Registered in `payload.config.ts` and generated TypeScript types for full type safety

******************************************************************************************

### 2. Create Roles Collection & Update Users Collection
- [x] **Task 2.1**: Create `src/collections/Roles.ts` with type field (app/vendor) ✅
- [x] **Task 2.2**: Add `vendor` relationship field to Users (relationTo: vendors, optional) ✅
- [x] **Task 2.3**: Add `vendorRole` relationship field (relationTo: roles, filtered by type="vendor") ✅
- [x] **Task 2.4**: Add `appRole` relationship field (relationTo: roles, filtered by type="app") ✅
- [x] **Task 2.5**: Add conditional field visibility (vendor field hidden for app-admin, vendorRole only shown if vendor exists) ✅
- [x] **Task 2.6**: Update access control helpers in `src/lib/access.ts` (isAppAdmin, hasVendor, belongsToVendor, etc.) ✅
- [x] **Task 2.7**: Register Roles collection in `src/payload.config.ts` ✅
- [x] **Task 2.8**: Generate TypeScript types ✅

**Technical Details:**
- Created `Roles` collection with type discrimination: "app" (application-level) vs "vendor" (vendor organization-level) roles
- Users now have three role relationships: `vendor` (required except for app-admin), `vendorRole` (role within vendor org), `appRole` (application-level role)
- Implemented conditional field visibility using `admin.condition` - vendor field hidden when appRole is "app-admin", vendorRole only visible when vendor exists
- Updated access control with 6 new helper functions: `isAppAdmin()`, `hasVendor()`, `belongsToVendor()`, `getVendorId()`, `hasVendorRole()`, `hasAppRole()`
 subbu: Access control helpers: src/lib/access.ts (lines 7-96)
 
- Legacy `roles` field marked as deprecated but kept for backward compatibility during migration

******************************************************************************************

### 3. Update Products Collection for Vendor Support
- [x] **Task 3.1**: Add `vendor` relationship field to `src/collections/Products.ts` (relationTo: vendors, required, single vendor per product) ✅
- [x] **Task 3.2**: Update access control: vendors can only create/update/delete their own products ✅
- [x] **Task 3.3**: Update read access: public can see all published products from all vendors ✅
- [x] **Task 3.4**: Add hook to auto-assign vendor when vendor user creates product ✅
- [x] **Task 3.5**: Add hook to prevent vendors from changing vendor field ✅
- [x] **Task 3.6**: Update product queries to include vendor relationship (depth: 2) ✅
- [x] **Task 3.7**: Add vendor filtering in product search/filter functionality ✅
- [x] **Task 3.8**: Update product card component to display vendor name/logo ✅
- [x] **Task 3.9**: Add vendor slug to product URLs (optional: `/vendor/[vendorSlug]/products/[productId]`) ✅
- [x] **Task 3.10**: Update product detail page to show vendor information ✅

**Technical Details:**
- Added `vendor` relationship field (required) to Products collection with access control: vendors can only manage their own products, public can read all published products
- Implemented `beforeChange` hook with auto-assignment logic: vendor automatically assigned from user's vendor on create, vendor field locked on update for vendor users
- Updated product queries to include vendor at depth 2, added vendor filter parameter to `getMany` procedure for vendor-specific product listings
- Enhanced ProductCard component to display vendor logo and name with link to vendor store page, added vendor section to ProductView detail page
- Updated all ProductCard usages across codebase (product-list, products-list) to pass vendor data from queries

******************************************************************************************

### 4. Update Orders Collection for Vendor Support
- [x] **Task 4.1**: Add `vendor` relationship field to `src/collections/Orders.ts` (relationTo: vendors, required, single vendor per order) ✅
- [x] **Task 4.2**: Update access control: vendors can only see orders for their products ✅
- [x] **Task 4.3**: Add hook to auto-assign vendor from product when order is created ✅
- [x] **Task 4.4**: Add vendor payout tracking fields (amount, status, payout date) ✅
- [x] **Task 4.5**: Update order status workflow to include vendor-specific statuses ✅
- [x] **Task 4.6**: Update checkout flow to ensure cart items are from single vendor (validate before checkout) ✅

**Technical Details:**
- Added `vendor` relationship field (required) to Orders collection with vendor-scoped access control: vendors can read/update only their orders, customers see only their orders
- Implemented `beforeChange` hook to auto-assign vendor from product relationship on order creation, ensuring vendor is always set from the product's vendor
- Added `vendorPayout` group field with payout tracking: amount, commissionAmount, status (pending/processing/completed/failed), payoutDate, transactionId for Stripe Connect integration
- Updated checkout validation in `checkout.purchase` procedure: validates all cart items belong to same vendor before creating Stripe session, throws error if multiple vendors detected
- Order status workflow remains unchanged but now vendor-aware, allowing vendors to update status of their orders

---

## Phase 2: Vendor Authentication & Onboarding (Tasks 26-40)

### 5. Vendor Registration Flow
- [x] **Task 5.1**: Create vendor registration page `/become-vendor` ✅
- [x] **Task 5.2**: Create vendor registration form component ✅
- [x] **Task 5.3**: Add form fields: business name, email, phone ✅
- [ ] **Task 5.4**: Add file upload for business documents
- [ ] **Task 5.5**: Add terms & conditions checkbox
- [x] **Task 5.6**: Create tRPC procedure `vendor.register` for vendor signup ✅
- [x] **Task 5.7**: Auto-create vendor record with status "pending" ✅
- [ ] **Task 5.8**: Auto-assign "vendor" role to user (vendorRole set on approval)
- [x] **Task 5.9**: Link user to vendor record ✅
- [ ] **Task 5.10**: Send confirmation email to vendor
- [ ] **Task 5.11**: Send notification email to super-admin for approval
- [x] **Task 5.12**: Create pending approval page `/vendor/pending-approval` ✅
- [x] **Task 5.13**: Add redirect logic (become-vendor shows "Request pending" when status pending) ✅
- [x] **Task 5.14**: Add vendor approval workflow (super-admin approves via Payload Admin) ✅
- [x] **Task 5.15**: Add "Become Vendor" link in profile dropdown and mobile sidebar ✅
- [x] **Task 5.16**: Fix "Become Vendor" button visibility after vendor approval (add query refetching and polling) ✅

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

******************************************************************************************

### 6. Vendor Authentication & Access Control
- [x] **Task 6.1**: Create `isVendor` helper function in `src/lib/access.ts` ✅
- [x] **Task 6.2**: Create `isVendorOwner` helper function (checks if user owns vendor) ✅
- [x] **Task 6.3**: Create `vendorProcedure` tRPC middleware (requires vendor + approved & active vendor) ✅
- [x] **Task 6.4**: Add vendor authentication check in vendor admin routes (vendorProcedure ready to use) ✅
- [x] **Task 6.5**: Create vendor middleware for Next.js routes (redirect pending vendors) ✅
- [x] **Task 6.6**: Add redirect to pending page if vendor not approved ✅
- [x] **Task 6.7**: Add redirect to vendor dashboard if vendor approved ✅

**Technical Details:**
- **Task 6.1** ✅: `isVendor()` exists in `src/lib/access.ts` - checks if user has vendor relationship
- **Task 6.2** ✅: `isVendorOwner(user, vendorId)` - verifies user owns specific vendor; `isApprovedVendor(user)` - checks if vendor is approved & active
- **Task 6.3** ✅: `vendorProcedure` in `src/trpc/init.ts` - tRPC middleware wrapping `protectedProcedure`; requires authenticated user with approved & active vendor; throws FORBIDDEN with specific messages for pending/rejected/suspended vendors; adds `vendor` to context
- **Task 6.4** ✅: `vendorProcedure` ready to use in vendor admin tRPC routes (e.g., `vendorProcedure.query(...)` or `vendorProcedure.mutation(...)`)
- **Task 6.5** ✅: `requireVendor()` in `src/lib/middleware/vendor-auth.ts` - Next.js server-side middleware; redirects to sign-in if not authenticated; redirects to `/become-vendor` if no vendor; redirects to `/vendor/pending-approval` if pending/rejected; redirects to `/vendor/suspended` if suspended; returns user & vendor if approved
- **Task 6.6** ✅: Auto-redirect implemented in `requireVendor()` - pending/rejected vendors → `/vendor/pending-approval`
- **Task 6.7** ✅: Vendor layout at `src/app/(app)/vendor/layout.tsx` uses `requireVendor()`; vendor dashboard at `/vendor/dashboard` shows stats (placeholder); suspended page at `/vendor/suspended` for suspended vendors

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

******************************************************************************************

---

## Phase 3: Vendor Admin Dashboard Structure

> **Note**: Dashboard-related tasks have been moved to `VENDOR_DASHBOARD_TODO.md` for better organization.
> 
> See: [Vendor Dashboard TODO](./VENDOR_DASHBOARD_TODO.md) for:
> - Vendor Admin Route Group & Layout (Tasks 1.1-1.10)
> - Dashboard Stats & Overview (Tasks 2.1-2.12)
> - All dashboard-related features and improvements

---

## Phase 4: Vendor Product Management (Tasks 56-75)

### 9. Vendor Products List Page
- [ ] **Task 9.1**: Create `/vendor/products` page
- [ ] **Task 9.2**: Create products list table component
- [ ] **Task 9.3**: Add columns: image, name, price, stock, status, actions
- [ ] **Task 9.4**: Add filter by status (all, published, draft, archived)
- [ ] **Task 9.5**: Add search functionality (search by product name)
- [ ] **Task 9.6**: Add pagination
- [ ] **Task 9.7**: Add bulk actions (publish, archive, delete)
- [ ] **Task 9.8**: Create tRPC procedure `vendor.products.list` (filtered by vendor)
- [ ] **Task 9.9**: Add loading skeleton
- [ ] **Task 9.10**: Add empty state (no products message)

### 10. Vendor Product Create/Edit Page
- [ ] **Task 10.1**: Create `/vendor/products/new` page
- [ ] **Task 10.2**: Create `/vendor/products/[productId]/edit` page
- [ ] **Task 10.3**: Create product form component (reusable for create/edit)
- [ ] **Task 10.4**: Add form fields: name, description, price, category, images
- [ ] **Task 10.5**: Add variants management (sizes, colors, stock per variant)
- [ ] **Task 10.6**: Add inventory tracking fields
- [ ] **Task 10.7**: Add product status selector (draft, published)
- [ ] **Task 10.8**: Add form validation (required fields, price > 0, etc.)
- [ ] **Task 10.9**: Create tRPC procedure `vendor.products.create`
- [ ] **Task 10.10**: Create tRPC procedure `vendor.products.update`
- [ ] **Task 10.11**: Add auto-assign vendor on create
- [ ] **Task 10.12**: Add validation (vendor can only edit own products)
- [ ] **Task 10.13**: Add image upload functionality
- [ ] **Task 10.14**: Add image gallery (multiple images)
- [ ] **Task 10.15**: Add form submission with loading states
- [ ] **Task 10.16**: Add success/error toast notifications
- [ ] **Task 10.17**: Add redirect to products list after create
- [ ] **Task 10.18**: Add "Save as Draft" and "Publish" buttons
- [ ] **Task 10.19**: Add product preview functionality
- [ ] **Task 10.20**: Add duplicate product functionality

### 11. Vendor Product Bulk Operations
- [ ] **Task 11.1**: Add checkbox selection in products table
- [ ] **Task 11.2**: Add "Select All" checkbox
- [ ] **Task 11.3**: Create bulk publish action
- [ ] **Task 11.4**: Create bulk archive action
- [ ] **Task 11.5**: Create bulk delete action
- [ ] **Task 11.6**: Add confirmation dialog for bulk delete
- [ ] **Task 11.7**: Create tRPC procedure `vendor.products.bulkUpdate`
- [ ] **Task 11.8**: Add loading states for bulk operations
- [ ] **Task 11.9**: Add success/error feedback

---

## Phase 5: Vendor Order Management (Tasks 76-90)

### 12. Vendor Orders List Page
- [ ] **Task 12.1**: Create `/vendor/orders` page
- [ ] **Task 12.2**: Create orders table component
- [ ] **Task 12.3**: Add columns: order number, customer, items, total, status, date
- [ ] **Task 12.4**: Add filter by status (all, pending, confirmed, processing, shipped, delivered)
- [ ] **Task 12.5**: Add date range filter
- [ ] **Task 12.6**: Add search by order number or customer name
- [ ] **Task 12.7**: Add pagination
- [ ] **Task 12.8**: Create tRPC procedure `vendor.orders.list` (filtered by vendor)
- [ ] **Task 12.9**: Add order status badges (color-coded)
- [ ] **Task 12.10**: Add click to view order details

### 13. Vendor Order Detail Page
- [ ] **Task 13.1**: Create `/vendor/orders/[orderId]` page
- [ ] **Task 13.2**: Display order information (number, date, customer, shipping address)
- [ ] **Task 13.3**: Display order items table (product, quantity, price, subtotal)
- [ ] **Task 13.4**: Display order totals (subtotal, shipping, tax, total)
- [ ] **Task 13.5**: Add order status update dropdown
- [ ] **Task 13.6**: Add tracking number input field
- [ ] **Task 13.7**: Create tRPC procedure `vendor.orders.getOne`
- [ ] **Task 13.8**: Create tRPC procedure `vendor.orders.updateStatus`
- [ ] **Task 13.9**: Add validation (vendor can only update own orders)
- [ ] **Task 13.10**: Add email notification when order status changes
- [ ] **Task 13.11**: Add print invoice button
- [ ] **Task 13.12**: Add download invoice PDF functionality
- [ ] **Task 13.13**: Add order notes/comments section
- [ ] **Task 13.14**: Add customer contact information display

### 14. Vendor Order Fulfillment
- [ ] **Task 14.1**: Add "Mark as Shipped" button
- [ ] **Task 14.2**: Add tracking number input modal
- [ ] **Task 14.3**: Create tRPC procedure `vendor.orders.ship`
- [ ] **Task 14.4**: Add shipping carrier selection (USPS, FedEx, UPS)
- [ ] **Task 14.5**: Add email notification to customer on shipment
- [ ] **Task 14.6**: Add estimated delivery date calculation

---

## Phase 6: Vendor Analytics & Reports (Tasks 91-105)

### 15. Vendor Analytics Dashboard
- [ ] **Task 15.1**: Create `/vendor/analytics` page
- [ ] **Task 15.2**: Add revenue chart (line chart, last 30/90/365 days)
- [ ] **Task 15.3**: Add orders chart (bar chart, orders over time)
- [ ] **Task 15.4**: Add top products table (by revenue)
- [ ] **Task 15.5**: Add top products table (by quantity sold)
- [ ] **Task 15.6**: Add sales by category chart (pie chart)
- [ ] **Task 15.7**: Add conversion rate metric
- [ ] **Task 15.8**: Add average order value metric
- [ ] **Task 15.9**: Create tRPC procedure `vendor.analytics.revenue`
- [ ] **Task 15.10**: Create tRPC procedure `vendor.analytics.orders`
- [ ] **Task 15.11**: Create tRPC procedure `vendor.analytics.products`
- [ ] **Task 15.12**: Add date range selector (last 7/30/90/365 days, custom)
- [ ] **Task 15.13**: Add export to CSV functionality
- [ ] **Task 15.14**: Add export to PDF functionality

### 16. Vendor Reports
- [ ] **Task 16.1**: Create `/vendor/reports` page
- [ ] **Task 16.2**: Add sales report (date range, product breakdown)
- [ ] **Task 16.3**: Add inventory report (low stock, out of stock)
- [ ] **Task 16.4**: Add customer report (top customers, repeat customers)
- [ ] **Task 16.5**: Add commission report (platform fees, payouts)
- [ ] **Task 16.6**: Add scheduled reports (email weekly/monthly reports)
- [ ] **Task 16.7**: Create tRPC procedure `vendor.reports.sales`
- [ ] **Task 16.8**: Create tRPC procedure `vendor.reports.inventory`
- [ ] **Task 16.9**: Create tRPC procedure `vendor.reports.customers`

---

## Phase 7: Vendor Settings & Profile (Tasks 106-120)

### 17. Vendor Settings Page
- [ ] **Task 17.1**: Create `/vendor/settings` page
- [ ] **Task 17.2**: Create settings tabs (Profile, Payment, Shipping, Notifications)
- [ ] **Task 17.3**: Add profile settings form (name, description, logo, cover image)
- [ ] **Task 17.4**: Add contact information form (email, phone, website, address)
- [ ] **Task 17.5**: Add business information form (tax ID, business type)
- [ ] **Task 17.6**: Create tRPC procedure `vendor.settings.updateProfile`
- [ ] **Task 17.7**: Add image upload for logo and cover
- [ ] **Task 17.8**: Add form validation
- [ ] **Task 17.9**: Add success/error notifications

### 18. Vendor Payment Settings
- [ ] **Task 18.1**: Add Stripe Connect integration section
- [ ] **Task 18.2**: Add "Connect Stripe Account" button
- [ ] **Task 18.3**: Create Stripe Connect onboarding flow
- [ ] **Task 18.4**: Store Stripe account ID in vendor record
- [ ] **Task 18.5**: Display connected Stripe account status
- [ ] **Task 18.6**: Add payout schedule information
- [ ] **Task 18.7**: Add bank account display (masked)
- [ ] **Task 18.8**: Add commission rate display

### 19. Vendor Shipping Settings
- [ ] **Task 19.1**: Add shipping zones configuration
- [ ] **Task 19.2**: Add shipping rates per zone
- [ ] **Task 19.3**: Add free shipping threshold setting
- [ ] **Task 19.4**: Add shipping carrier preferences
- [ ] **Task 19.5**: Add packaging preferences (box size, weight)
- [ ] **Task 19.6**: Create tRPC procedure `vendor.settings.updateShipping`
- [ ] **Task 19.7**: Add shipping settings form validation

### 20. Vendor Notification Settings
- [ ] **Task 20.1**: Add email notification preferences
- [ ] **Task 20.2**: Add order notification toggles (new order, status change)
- [ ] **Task 20.3**: Add low stock alert toggles
- [ ] **Task 20.4**: Add weekly/monthly report toggles
- [ ] **Task 20.5**: Create tRPC procedure `vendor.settings.updateNotifications`

---

## Phase 8: Vendor Inventory Management (Tasks 121-135)

### 21. Vendor Inventory Dashboard
- [ ] **Task 21.1**: Create `/vendor/inventory` page
- [ ] **Task 21.2**: Create inventory table (product, variants, stock, status)
- [ ] **Task 21.3**: Add filter by stock status (all, in stock, low stock, out of stock)
- [ ] **Task 21.4**: Add search by product name
- [ ] **Task 21.5**: Add bulk stock update functionality
- [ ] **Task 21.6**: Create tRPC procedure `vendor.inventory.list`
- [ ] **Task 21.7**: Add low stock alerts section
- [ ] **Task 21.8**: Add out of stock products section

### 22. Vendor Stock Management
- [ ] **Task 22.1**: Add quick stock update modal (inline edit)
- [ ] **Task 22.2**: Add bulk stock import (CSV upload)
- [ ] **Task 22.3**: Add stock history tracking
- [ ] **Task 22.4**: Create tRPC procedure `vendor.inventory.updateStock`
- [ ] **Task 22.5**: Create tRPC procedure `vendor.inventory.bulkUpdate`
- [ ] **Task 22.6**: Add stock adjustment reasons (restock, return, damage, etc.)
- [ ] **Task 22.7**: Add stock alerts configuration (low stock threshold)
- [ ] **Task 22.8**: Add automatic reorder point suggestions

---

## Phase 9: Customer-Facing Vendor Features (Tasks 136-150)

### 23. Vendor Storefront Pages
- [ ] **Task 23.1**: Create vendor store page `/vendor/[vendorSlug]`
- [ ] **Task 23.2**: Display vendor information (logo, name, description, cover image)
- [ ] **Task 23.3**: Display vendor products grid
- [ ] **Task 23.4**: Add vendor products filter (category, price range)
- [ ] **Task 23.5**: Add vendor products pagination
- [ ] **Task 23.6**: Create tRPC procedure `vendor.getBySlug` (public)
- [ ] **Task 23.7**: Create tRPC procedure `vendor.products.getByVendor` (public)
- [ ] **Task 23.8**: Add vendor rating/reviews display
- [ ] **Task 23.9**: Add "Follow Vendor" button (if implementing follow feature)
- [ ] **Task 23.10**: Add vendor contact information

### 24. Vendor Badge on Products
- [ ] **Task 24.1**: Update product card to show vendor logo/name
- [ ] **Task 24.2**: Add vendor link on product card
- [ ] **Task 24.3**: Update product detail page to show vendor section
- [ ] **Task 24.4**: Add "View All Products from [Vendor]" link
- [ ] **Task 24.5**: Add vendor verification badge (if verified)

### 25. Vendor Cart & Checkout
- [ ] **Task 25.1**: Add validation to ensure cart contains items from single vendor only
- [ ] **Task 25.2**: Display vendor name/logo in cart
- [ ] **Task 25.3**: Update checkout to show vendor information
- [ ] **Task 25.4**: Update order creation to assign vendor from cart items
- [ ] **Task 25.5**: Validate all cart items belong to same vendor before checkout
- [ ] **Task 25.6**: Update order confirmation to show vendor information
- [ ] **Task 25.7**: Add vendor-specific shipping options
- [ ] **Task 25.8**: Update Stripe checkout to handle vendor orders

---

## Phase 10: Admin Panel for Vendor Management (Tasks 151-165)

### 26. Super-Admin Vendor Management
- [ ] **Task 26.1**: Create `/admin/vendors` page (super-admin only)
- [ ] **Task 26.2**: Create vendors table (name, email, status, products count, revenue)
- [ ] **Task 26.3**: Add vendor status filter (all, pending, approved, suspended)
- [ ] **Task 26.4**: Add vendor search functionality
- [ ] **Task 26.5**: Add "Approve Vendor" action
- [ ] **Task 26.6**: Add "Suspend Vendor" action
- [ ] **Task 26.7**: Add "Reject Vendor" action
- [ ] **Task 26.8**: Create tRPC procedure `admin.vendors.list`
- [ ] **Task 26.9**: Create tRPC procedure `admin.vendors.approve`
- [ ] **Task 26.10**: Create tRPC procedure `admin.vendors.suspend`
- [ ] **Task 26.11**: Add vendor detail view (view all vendor information)
- [ ] **Task 26.12**: Add vendor verification documents viewer
- [ ] **Task 26.13**: Add commission rate adjustment
- [ ] **Task 26.14**: Add vendor analytics view (super-admin can see all vendor stats)

### 27. Vendor Approval Workflow
- [ ] **Task 27.1**: Add email notification to vendor on approval
- [ ] **Task 27.2**: Add email notification to vendor on rejection
- [ ] **Task 27.3**: Add rejection reason field
- [ ] **Task 27.4**: Add approval/rejection comments
- [ ] **Task 27.5**: Add vendor re-application flow (if rejected)

---

## Phase 11: Payment & Payouts (Tasks 166-180)

### 28. Stripe Connect Integration
- [ ] **Task 28.1**: Install Stripe Connect SDK
- [ ] **Task 28.2**: Create Stripe Connect account creation flow
- [ ] **Task 28.3**: Create vendor onboarding link generation
- [ ] **Task 28.4**: Handle Stripe Connect webhook (account updates)
- [ ] **Task 28.5**: Store Stripe account ID in vendor record
- [ ] **Task 28.6**: Add Stripe account status display (connected, pending, etc.)
- [ ] **Task 28.7**: Create payout calculation logic (order total - commission)
- [ ] **Task 28.8**: Create payout record in database
- [ ] **Task 28.9**: Create tRPC procedure `vendor.payouts.list`
- [ ] **Task 28.10**: Create payout history page `/vendor/payouts`

### 29. Commission & Payout Management
- [ ] **Task 29.1**: Calculate commission on order creation
- [ ] **Task 29.2**: Store commission amount in order record
- [ ] **Task 29.3**: Store vendor payout amount in order record
- [ ] **Task 29.4**: Create payout schedule (weekly, bi-weekly, monthly)
- [ ] **Task 29.5**: Create automatic payout processing (cron job)
- [ ] **Task 29.6**: Add payout status tracking (pending, processing, completed, failed)
- [ ] **Task 29.7**: Add payout transaction history
- [ ] **Task 29.8**: Add payout reports

---

## Phase 12: Notifications & Communication (Tasks 181-195)

### 30. Vendor Email Notifications
- [ ] **Task 30.1**: Create email template for new order notification
- [ ] **Task 30.2**: Create email template for order status change
- [ ] **Task 30.3**: Create email template for low stock alert
- [ ] **Task 30.4**: Create email template for vendor approval
- [ ] **Task 30.5**: Create email template for vendor rejection
- [ ] **Task 30.6**: Create email template for payout notification
- [ ] **Task 30.7**: Integrate email service (Resend, SendGrid, etc.)
- [ ] **Task 30.8**: Add email sending on order creation
- [ ] **Task 30.9**: Add email sending on order status update
- [ ] **Task 30.10**: Add email sending on low stock threshold reached

### 31. In-App Notifications
- [ ] **Task 31.1**: Create notifications collection (vendor, type, message, read status)
- [ ] **Task 31.2**: Create notifications bell icon in vendor header
- [ ] **Task 31.3**: Create notifications dropdown
- [ ] **Task 31.4**: Add notification count badge
- [ ] **Task 31.5**: Create tRPC procedure `vendor.notifications.list`
- [ ] **Task 31.6**: Create tRPC procedure `vendor.notifications.markRead`
- [ ] **Task 31.7**: Add real-time notifications (WebSocket or polling)
- [ ] **Task 31.8**: Add notification preferences (which notifications to receive)

---

## Phase 13: Testing & Quality Assurance (Tasks 196-210)

### 32. Vendor Admin Testing
- [ ] **Task 32.1**: Test vendor registration flow
- [ ] **Task 32.2**: Test vendor approval workflow
- [ ] **Task 32.3**: Test vendor product creation
- [ ] **Task 32.4**: Test vendor product editing
- [ ] **Task 32.5**: Test vendor order management
- [ ] **Task 32.6**: Test vendor access control (can't access other vendor data)
- [ ] **Task 32.7**: Test single-vendor cart validation and checkout
- [ ] **Task 32.8**: Test vendor analytics
- [ ] **Task 32.9**: Test vendor settings update
- [ ] **Task 32.10**: Test Stripe Connect integration

### 33. Security Testing
- [ ] **Task 33.1**: Test vendor data isolation (vendors can't see other vendors' data)
- [ ] **Task 33.2**: Test vendor can't modify other vendors' products
- [ ] **Task 33.3**: Test vendor can't access admin routes
- [ ] **Task 33.4**: Test SQL injection prevention
- [ ] **Task 33.5**: Test XSS prevention
- [ ] **Task 33.6**: Test CSRF protection
- [ ] **Task 33.7**: Test authentication bypass attempts
- [ ] **Task 33.8**: Test authorization bypass attempts

### 34. Performance Testing
- [ ] **Task 34.1**: Test vendor dashboard load time
- [ ] **Task 34.2**: Test products list pagination performance
- [ ] **Task 34.3**: Test orders list pagination performance
- [ ] **Task 34.4**: Test analytics queries performance
- [ ] **Task 34.5**: Add database indexes for vendor queries
- [ ] **Task 34.6**: Optimize vendor product queries
- [ ] **Task 34.7**: Add caching for vendor data

---

## Phase 14: Documentation & Deployment (Tasks 211-225)

### 35. Documentation
- [ ] **Task 35.1**: Create vendor onboarding guide
- [ ] **Task 35.2**: Create vendor admin user manual
- [ ] **Task 35.3**: Document vendor API endpoints
- [ ] **Task 35.4**: Document vendor data model
- [ ] **Task 35.5**: Create vendor FAQ
- [ ] **Task 35.6**: Document Stripe Connect setup
- [ ] **Task 35.7**: Document commission structure
- [ ] **Task 35.8**: Create vendor support documentation

### 36. Deployment Preparation
- [ ] **Task 36.1**: Add environment variables for vendor features
- [ ] **Task 36.2**: Configure Stripe Connect keys
- [ ] **Task 36.3**: Set up email service credentials
- [ ] **Task 36.4**: Add database migration scripts
- [ ] **Task 36.5**: Create vendor seed data for testing
- [ ] **Task 36.6**: Test deployment on staging
- [ ] **Task 36.7**: Create rollback plan
- [ ] **Task 36.8**: Document deployment process

---

## Phase 15: Additional Features & Polish (Tasks 226-240)

### 37. Vendor Reviews & Ratings
- [ ] **Task 37.1**: Create vendor reviews collection
- [ ] **Task 37.2**: Add vendor rating calculation
- [ ] **Task 37.3**: Display vendor rating on store page
- [ ] **Task 37.4**: Add vendor reviews display
- [ ] **Task 37.5**: Add vendor response to reviews
- [ ] **Task 37.6**: Create tRPC procedure `vendor.reviews.list`

### 38. Vendor SEO & Marketing
- [ ] **Task 38.1**: Add vendor meta tags (title, description)
- [ ] **Task 38.2**: Add vendor Open Graph tags
- [ ] **Task 38.3**: Add vendor structured data (JSON-LD)
- [ ] **Task 38.4**: Add vendor sitemap generation
- [ ] **Task 38.5**: Add vendor social sharing buttons

### 39. Vendor Mobile App (Optional)
- [ ] **Task 39.1**: Design mobile vendor admin UI
- [ ] **Task 39.2**: Create responsive vendor dashboard
- [ ] **Task 39.3**: Optimize vendor forms for mobile
- [ ] **Task 39.4**: Add mobile push notifications

### 40. Advanced Vendor Features
- [ ] **Task 40.1**: Add vendor subscription plans (basic, premium, enterprise)
- [ ] **Task 40.2**: Add vendor feature flags
- [ ] **Task 40.3**: Add vendor API access (for integrations)
- [ ] **Task 40.4**: Add vendor webhooks
- [ ] **Task 40.5**: Add vendor custom domain support

---

## Summary

**Total Tasks**: 240+ micro-tasks

**Estimated Timeline**:
- Phase 1-2 (Foundation): 2-3 weeks
- Phase 3-5 (Core Features): 4-5 weeks
- Phase 6-8 (Advanced Features): 3-4 weeks
- Phase 9-11 (Integration): 2-3 weeks
- Phase 12-15 (Polish & Testing): 2-3 weeks

**Total Estimated Time**: 13-18 weeks (3-4.5 months)

---

**Last Updated**: [Current Date]

**Next Steps**: See `VENDOR_ADMIN_IMPLEMENTATION_GUIDE.md` for detailed implementation instructions for each task.
