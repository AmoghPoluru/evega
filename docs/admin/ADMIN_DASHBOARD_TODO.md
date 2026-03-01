# Admin Dashboard TODO List

> **Purpose**: This document serves as a comprehensive TODO list and implementation guide for the Admin Dashboard system in an Indian dress e-commerce site built with Next.js, Payload CMS, tRPC, and React.
>
> **For LLMs**: This file contains detailed task breakdowns, technical implementation details, and code references. Each task includes completion status, technical details, and file paths. Use this document to understand the current state of the admin dashboard implementation and to implement new features following the established patterns.

## System Overview

**Tech Stack:**
- **Frontend**: Next.js 16 (App Router), React, TypeScript, shadcn/ui components
- **Backend**: Payload CMS, tRPC for type-safe APIs
- **Database**: MongoDB (via Payload)
- **State Management**: React Query (@tanstack/react-query) for server state
- **Access Control**: Role-based access control (app-admin role)

**Key Concepts:**
- **Admin-Only Access**: Dashboard accessible only to users with `app-admin` role
- **CMS-Driven**: All data managed through Payload CMS collections
- **Multi-Vendor Management**: Admins can manage all vendors, products, orders, and customers
- **Analytics & Reporting**: Dashboard provides overview statistics and insights
- **Role-Based UI**: Admin features visible only to authorized users

**File Structure:**
- Admin dashboard pages: `src/app/(app)/admin/*`
- Admin components: `src/app/(app)/admin/components/*`
- Admin middleware: `src/lib/middleware/admin-auth.ts`
- Admin tRPC procedures: `src/modules/admin/server/procedures.ts`
- Access control: `src/lib/access.ts` (isAppAdmin function)

---

## Table of Contents

0. [Foundation & Setup](#foundation--setup)
   - [Admin Authentication Middleware](#admin-authentication-middleware)
   - [Admin Route Group & Layout](#admin-route-group--layout)
   - [Admin tRPC Procedures](#admin-trpc-procedures)
1. [Dashboard Overview](#dashboard-overview)
   - [Dashboard Stats Cards](#dashboard-stats-cards)
   - [Recent Orders Widget](#recent-orders-widget)
   - [Top Products Widget](#top-products-widget)
   - [Vendor Status Widget](#vendor-status-widget)
2. [Products Management](#products-management)
   - [Products List Page](#products-list-page)
   - [Product Detail/Edit Page](#product-detailedit-page)
   - [Bulk Product Operations](#bulk-product-operations)
3. [Orders Management](#orders-management)
   - [Orders List Page](#orders-list-page)
   - [Order Detail Page](#order-detail-page)
   - [Order Status Management](#order-status-management)
4. [Customers Management](#customers-management)
   - [Customers List Page](#customers-list-page)
   - [Customer Detail Page](#customer-detail-page)
   - [Customer Analytics](#customer-analytics)
5. [Vendors Management](#vendors-management)
   - [Vendors List Page](#vendors-list-page)
   - [Vendor Detail Page](#vendor-detail-page)
   - [Vendor Approval System](#vendor-approval-system)
6. [Categories Management](#categories-management)
   - [Categories Tree View](#categories-tree-view)
   - [Category CRUD Operations](#category-crud-operations)
7. [Tags Management](#tags-management)
   - [Tags List Page](#tags-list-page)
   - [Tag CRUD Operations](#tag-crud-operations)
8. [Hero Banners Management](#hero-banners-management)
   - [Hero Banners List Page](#hero-banners-list-page)
   - [Hero Banner Editor](#hero-banner-editor)
9. [Analytics & Reporting](#analytics--reporting)
   - [Revenue Analytics](#revenue-analytics)
   - [Sales Reports](#sales-reports)
   - [Vendor Performance](#vendor-performance)
10. [Users & Roles Management](#users--roles-management)
    - [Users List Page](#users-list-page)
    - [User Detail/Edit Page](#user-detailedit-page)
    - [Roles Management](#roles-management)
11. [Settings](#settings)
    - [Platform Settings](#platform-settings)
    - [Email Templates](#email-templates)
    - [System Configuration](#system-configuration)

---

## Foundation & Setup

### Admin Authentication Middleware

- [ ] **Task 0.1**: Create `src/lib/middleware/admin-auth.ts` file
  - Create `requireAdmin()` function for Next.js server components
  - Redirects to sign-in if not authenticated
  - Redirects to home if not admin
  - Returns user if admin
  - Create `getAdminStatus()` function for conditional rendering (no redirect)

**Technical Details:**
- Use `isAppAdmin()` from `src/lib/access.ts` to check admin role
- Similar pattern to `requireVendor()` in `src/lib/middleware/vendor-auth.ts`
- Use `getPayload()` and `payload.auth()` to get session
- Use Next.js `redirect()` for navigation

**File Reference:**
- Similar to: `src/lib/middleware/vendor-auth.ts`
- Uses: `src/lib/access.ts` (isAppAdmin function)

### Admin Route Group & Layout

- [ ] **Task 0.2**: Create route group `src/app/(app)/admin/layout.tsx`
  - Create Next.js layout component for admin routes
  - Use `requireAdmin()` middleware to protect all admin routes
  - Include AdminSidebar and AdminHeader components
  - Hide main navbar on admin routes

- [ ] **Task 0.3**: Create admin sidebar navigation component (`AdminSidebar.tsx`)
  - Build sidebar component with navigation links to all admin sections
  - Dark theme (gray-900 background)
  - Active route highlighting
  - Navigation items: Dashboard, Products, Orders, Customers, Vendors, Categories, Tags, Hero Banners, Analytics, Settings, Users & Roles

- [ ] **Task 0.4**: Create admin header component (`AdminHeader.tsx`)
  - Create header component with search bar, notifications, and user menu
  - Logout functionality
  - User avatar and dropdown menu
  - "View Site" link to return to public site

**Technical Details:**
- Layout uses `requireAdmin()` middleware from `src/lib/middleware/admin-auth.ts`
- Sidebar: Dark theme (`bg-gray-900`), active route highlighting
- Header: Dark gray (`bg-gray-800`), search bar, notifications bell, user dropdown
- Main navbar hidden on `/admin/*` routes via pathname check in `Navbar.tsx`

**File Reference:**
- Similar to: `src/app/(app)/vendor/layout.tsx`
- Similar to: `src/app/(app)/vendor/components/VendorSidebar.tsx`
- Similar to: `src/app/(app)/vendor/components/VendorHeader.tsx`

### Admin tRPC Procedures

- [ ] **Task 0.5**: Create `adminProcedure` in `src/trpc/init.ts`
  - Create tRPC middleware wrapping `protectedProcedure`
  - Requires authenticated user with `app-admin` role
  - Throws FORBIDDEN error if not admin
  - Adds admin context to procedures

- [ ] **Task 0.6**: Create admin router in `src/modules/admin/server/procedures.ts`
  - Create `adminRouter` using `createTRPCRouter`
  - Export admin router for use in main app router
  - Structure: `admin.dashboard.*`, `admin.products.*`, `admin.orders.*`, etc.

- [ ] **Task 0.7**: Register admin router in `src/trpc/routers/_app.ts`
  - Import `adminRouter` from `@/modules/admin/server/procedures`
  - Add to `appRouter` as `admin: adminRouter`

**Technical Details:**
- `adminProcedure` uses `isAppAdmin()` from `src/lib/access.ts`
- Similar pattern to `vendorProcedure` in `src/trpc/init.ts`
- Admin router structure mirrors vendor router structure

**File Reference:**
- Similar to: `vendorProcedure` in `src/trpc/init.ts`
- Similar to: `src/modules/vendor/server/procedures.ts`

### Navigation Integration

- [ ] **Task 0.8**: Add admin dashboard link to profile dropdown
  - Update `src/components/profile-dropdown.tsx`
  - Check if user is admin using `isAppAdmin()`
  - Show "Admin Dashboard" link if user is admin
  - Add Shield icon from lucide-react

- [ ] **Task 0.9**: Hide main navbar on admin routes
  - Update `src/app/(app)/(home)/navbar/Navbar.tsx`
  - Check if pathname starts with `/admin`
  - Return null if on admin route (similar to vendor routes)

**Technical Details:**
- Profile dropdown uses `isAppAdmin()` from `src/lib/access.ts`
- Navbar checks pathname using `usePathname()` hook
- Admin link appears above vendor link in dropdown menu

**File Reference:**
- `src/components/profile-dropdown.tsx`
- `src/app/(app)/(home)/navbar/Navbar.tsx`

---

## Dashboard Overview

### Dashboard Stats Cards

- [ ] **Task 1.1**: Create `AdminDashboardStats` component
  - Location: `src/app/(app)/admin/components/AdminDashboardStats.tsx`
  - Display 5 stat cards: Total Revenue, Total Orders, Total Products, Total Customers, Total Vendors
  - Show trend indicators (percentage change)
  - Loading skeleton states
  - Error handling

- [ ] **Task 1.2**: Create `admin.dashboard.stats` tRPC procedure
  - Calculate total revenue (sum of all orders)
  - Calculate revenue change (this month vs last month)
  - Count total orders and pending orders
  - Count total products and active products
  - Count total customers and new customers this month
  - Count total vendors and active vendors
  - Return formatted stats object

**Technical Details:**
- Stat cards use shadcn/ui Card component
- Icons from lucide-react (DollarSign, ShoppingCart, Package, Users, Store)
- Trend indicators show green for positive, red for negative
- Use date-fns for date calculations (startOfMonth, endOfMonth, subMonths)

**File Reference:**
- Similar to: `src/app/(app)/vendor/dashboard/page.tsx` (vendor stats)

### Recent Orders Widget

- [ ] **Task 1.3**: Create `AdminRecentOrders` component
  - Location: `src/app/(app)/admin/components/AdminRecentOrders.tsx`
  - Display list of recent orders (limit: 5)
  - Show order number, customer name, status, total, date
  - Status badges with color coding
  - Link to order detail page
  - "View all" link to orders list page

- [ ] **Task 1.4**: Create `admin.dashboard.recentOrders` tRPC procedure
  - Query orders sorted by createdAt (descending)
  - Limit results (default: 10, max: 50)
  - Populate user/customer relationship
  - Return formatted order data

**Technical Details:**
- Orders displayed in card format with hover effects
- Status color mapping: pending (yellow), payment_done (blue), processing (purple), complete (green), canceled (red), refunded (gray)
- Use date-fns format() for date display
- Currency formatting with Intl.NumberFormat

**File Reference:**
- Similar to: `src/app/(app)/vendor/orders/components/OrdersTable.tsx`

### Top Products Widget

- [ ] **Task 1.5**: Create `AdminTopProducts` component
  - Location: `src/app/(app)/admin/components/AdminTopProducts.tsx`
  - Display top-selling products (limit: 5)
  - Show product image, name, price, total sold, total revenue
  - Link to product detail page
  - "View all" link to products list page

- [ ] **Task 1.6**: Create `admin.dashboard.topProducts` tRPC procedure
  - Aggregate product sales from all orders
  - Calculate total sold and total revenue per product
  - Sort by revenue (descending)
  - Limit results (default: 10, max: 50)
  - Populate product images
  - Return formatted product data with sales metrics

**Technical Details:**
- Products displayed with thumbnail images
- Sales metrics: totalSold (quantity), totalRevenue (sum of order items)
- Use Next.js Image component for product images
- Placeholder for products without images

**File Reference:**
- Similar to: `src/app/(app)/vendor/products/components/ProductsTable.tsx`

### Vendor Status Widget

- [ ] **Task 1.7**: Create `AdminVendorStatus` component
  - Location: `src/app/(app)/admin/components/AdminVendorStatus.tsx`
  - Display vendor status breakdown
  - Show counts for: Pending Approval, Approved & Active, Suspended, Rejected
  - Status badges with color coding
  - Links to filtered vendors list page

- [ ] **Task 1.8**: Create `admin.dashboard.vendorStatus` tRPC procedure
  - Query all vendors
  - Count vendors by status (pending, approved, rejected, suspended)
  - Return status counts object

**Technical Details:**
- Status cards displayed in grid layout (4 columns)
- Status color mapping: pending (yellow), approved (green), rejected (red), suspended (gray)
- Links include query parameters for filtering (e.g., `?status=pending`)

**File Reference:**
- Similar to: `src/app/(app)/vendor/dashboard/page.tsx` (vendor status)

### Dashboard Page

- [ ] **Task 1.9**: Create admin dashboard page (`/admin/dashboard`)
  - Location: `src/app/(app)/admin/dashboard/page.tsx`
  - Combine all dashboard widgets
  - Use Suspense for loading states
  - Responsive grid layout
  - Page header with title and description

**Technical Details:**
- Main content area with padding
- Grid layout: stats cards (full width), recent orders + top products (2 columns), vendor status (full width)
- Loading skeletons for each widget
- Error boundaries for error handling

**File Reference:**
- Similar to: `src/app/(app)/vendor/dashboard/page.tsx`

---

## Products Management

### Products List Page

- [ ] **Task 2.1**: Create products list page (`/admin/products`)
  - Location: `src/app/(app)/admin/products/page.tsx`
  - Display all products from all vendors
  - Table with columns: Image, Name, Vendor, Category, Price, Stock, Status, Actions
  - Search and filter functionality
  - Pagination
  - Bulk actions (archive, delete)

- [ ] **Task 2.2**: Create `admin.products.list` tRPC procedure
  - Query all products (no vendor filter)
  - Support pagination, search, filters
  - Populate vendor, category relationships
  - Return products with vendor info

- [ ] **Task 2.3**: Create `AdminProductsTable` component
  - Location: `src/app/(app)/admin/products/components/AdminProductsTable.tsx`
  - Reusable table component for products
  - Sortable columns
  - Row actions (view, edit, delete)
  - Bulk selection and actions

**Technical Details:**
- Table uses shadcn/ui Table component
- Search filters by product name, vendor name
- Filters: vendor, category, status (active/archived)
- Pagination with page size selector

**File Reference:**
- Similar to: `src/app/(app)/vendor/products/components/ProductsTable.tsx`

### Product Detail/Edit Page

- [ ] **Task 2.4**: Create product detail page (`/admin/products/[id]`)
  - Location: `src/app/(app)/admin/products/[id]/page.tsx`
  - Display full product details
  - Edit product form (admin can edit any product)
  - Product variants management
  - Product images gallery

- [ ] **Task 2.5**: Create `admin.products.getOne` tRPC procedure
  - Query single product by ID
  - Populate all relationships (vendor, category, tags, variants)
  - Return full product data

- [ ] **Task 2.6**: Create `admin.products.update` tRPC procedure
  - Update any product (admin override)
  - Validate input data
  - Update product and variants
  - Return updated product

**Technical Details:**
- Product form similar to vendor product form
- Admin can edit products from any vendor
- Show vendor name prominently
- Audit trail for admin edits

**File Reference:**
- Similar to: `src/app/(app)/vendor/products/[id]/edit/page.tsx`

### Bulk Product Operations

- [ ] **Task 2.7**: Create `admin.products.bulkArchive` tRPC procedure
  - Archive multiple products at once
  - Input: array of product IDs
  - Update isArchived field to true
  - Return count of archived products

- [ ] **Task 2.8**: Create `admin.products.bulkDelete` tRPC procedure
  - Delete multiple products at once
  - Input: array of product IDs
  - Soft delete or hard delete (configurable)
  - Return count of deleted products

**Technical Details:**
- Bulk operations require confirmation modal
- Show progress indicator during bulk operations
- Error handling for partial failures

---

## Orders Management

### Orders List Page

- [ ] **Task 3.1**: Create orders list page (`/admin/orders`)
  - Location: `src/app/(app)/admin/orders/page.tsx`
  - Display all orders from all vendors
  - Table with columns: Order #, Customer, Vendor, Total, Status, Date, Actions
  - Search and filter functionality
  - Pagination
  - Export orders (CSV)

- [ ] **Task 3.2**: Create `admin.orders.list` tRPC procedure
  - Query all orders (no vendor filter)
  - Support pagination, search, filters
  - Populate user, vendor relationships
  - Return orders with customer and vendor info

- [ ] **Task 3.3**: Create `AdminOrdersTable` component
  - Location: `src/app/(app)/admin/orders/components/AdminOrdersTable.tsx`
  - Reusable table component for orders
  - Sortable columns
  - Row actions (view, update status)
  - Status filter dropdown

**Technical Details:**
- Table uses shadcn/ui Table component
- Search filters by order number, customer name, vendor name
- Filters: vendor, status, date range
- Pagination with page size selector

**File Reference:**
- Similar to: `src/app/(app)/vendor/orders/components/OrdersTable.tsx`

### Order Detail Page

- [ ] **Task 3.4**: Create order detail page (`/admin/orders/[id]`)
  - Location: `src/app/(app)/admin/orders/[id]/page.tsx`
  - Display full order details
  - Order items table
  - Customer information
  - Shipping address
  - Order status timeline
  - Admin actions (update status, add note)

- [ ] **Task 3.5**: Create `admin.orders.getOne` tRPC procedure
  - Query single order by ID
  - Populate all relationships (user, vendor, items, products)
  - Return full order data

**Technical Details:**
- Order detail page shows complete order information
- Status timeline shows order history
- Admin can update order status
- Admin can add internal notes

**File Reference:**
- Similar to: `src/app/(app)/vendor/orders/[id]/page.tsx`

### Order Status Management

- [ ] **Task 3.6**: Create `admin.orders.updateStatus` tRPC procedure
  - Update order status
  - Input: order ID, new status, optional note
  - Validate status transition
  - Update order and create status history entry
  - Return updated order

**Technical Details:**
- Status transitions: pending → payment_done → processing → complete
- Admin can override status transitions
- Status history tracked for audit trail

---

## Customers Management

### Customers List Page

- [ ] **Task 4.1**: Create customers list page (`/admin/customers`)
  - Location: `src/app/(app)/admin/customers/page.tsx`
  - Display all customers
  - Table with columns: Name, Email, Total Orders, Total Spent, Last Order, Actions
  - Search and filter functionality
  - Pagination

- [ ] **Task 4.2**: Create `admin.customers.list` tRPC procedure
  - Query all customers
  - Support pagination, search, filters
  - Calculate total orders and total spent per customer
  - Return customers with order statistics

- [ ] **Task 4.3**: Create `AdminCustomersTable` component
  - Location: `src/app/(app)/admin/customers/components/AdminCustomersTable.tsx`
  - Reusable table component for customers
  - Sortable columns
  - Row actions (view, edit)

**Technical Details:**
- Table uses shadcn/ui Table component
- Search filters by customer name, email
- Filters: date range (registration date, last order date)
- Sort by total spent, total orders

**File Reference:**
- Similar to: `src/app/(app)/vendor/customers/components/CustomersTable.tsx`

### Customer Detail Page

- [ ] **Task 4.4**: Create customer detail page (`/admin/customers/[id]`)
  - Location: `src/app/(app)/admin/customers/[id]/page.tsx`
  - Display customer profile
  - Customer orders list
  - Customer addresses
  - Customer statistics (total spent, average order value, etc.)

- [ ] **Task 4.5**: Create `admin.customers.getOne` tRPC procedure
  - Query single customer by ID
  - Populate orders, addresses relationships
  - Calculate customer statistics
  - Return full customer data with statistics

**Technical Details:**
- Customer detail page shows complete customer information
- Orders list with pagination
- Customer statistics cards (total spent, order count, average order value)
- Address management

### Customer Analytics

- [ ] **Task 4.6**: Create customer analytics section
  - Customer lifetime value (CLV)
  - Customer segmentation (new, returning, VIP)
  - Purchase frequency analysis
  - Customer retention metrics

**Technical Details:**
- Analytics calculated from order history
- Charts for customer trends
- Export customer data (CSV)

---

## Vendors Management

### Vendors List Page

- [ ] **Task 5.1**: Create vendors list page (`/admin/vendors`)
  - Location: `src/app/(app)/admin/vendors/page.tsx`
  - Display all vendors
  - Table with columns: Name, Email, Status, Products, Orders, Revenue, Actions
  - Search and filter functionality
  - Status filter (pending, approved, rejected, suspended)
  - Pagination

- [ ] **Task 5.2**: Create `admin.vendors.list` tRPC procedure
  - Query all vendors
  - Support pagination, search, filters
  - Calculate vendor statistics (product count, order count, revenue)
  - Return vendors with statistics

- [ ] **Task 5.3**: Create `AdminVendorsTable` component
  - Location: `src/app/(app)/admin/vendors/components/AdminVendorsTable.tsx`
  - Reusable table component for vendors
  - Sortable columns
  - Row actions (view, approve, reject, suspend)

**Technical Details:**
- Table uses shadcn/ui Table component
- Search filters by vendor name, email
- Filters: status, date range (registration date)
- Status badges with color coding

**File Reference:**
- Similar to: Vendor registration flow

### Vendor Detail Page

- [ ] **Task 5.4**: Create vendor detail page (`/admin/vendors/[id]`)
  - Location: `src/app/(app)/admin/vendors/[id]/page.tsx`
  - Display vendor profile
  - Vendor products list
  - Vendor orders list
  - Vendor statistics
  - Vendor approval actions

- [ ] **Task 5.5**: Create `admin.vendors.getOne` tRPC procedure
  - Query single vendor by ID
  - Populate products, orders relationships
  - Calculate vendor statistics
  - Return full vendor data with statistics

**Technical Details:**
- Vendor detail page shows complete vendor information
- Products and orders lists with pagination
- Vendor statistics cards (total products, total orders, total revenue)
- Approval/rejection/suspension actions

### Vendor Approval System

- [ ] **Task 5.6**: Create `admin.vendors.approve` tRPC procedure
  - Approve vendor application
  - Input: vendor ID, optional notes
  - Update vendor status to "approved"
  - Set isActive to true
  - Send approval email notification
  - Return updated vendor

- [ ] **Task 5.7**: Create `admin.vendors.reject` tRPC procedure
  - Reject vendor application
  - Input: vendor ID, rejection reason
  - Update vendor status to "rejected"
  - Send rejection email notification
  - Return updated vendor

- [ ] **Task 5.8**: Create `admin.vendors.suspend` tRPC procedure
  - Suspend vendor account
  - Input: vendor ID, suspension reason, optional duration
  - Update vendor status to "suspended"
  - Set isActive to false
  - Send suspension email notification
  - Return updated vendor

- [ ] **Task 5.9**: Create `admin.vendors.activate` tRPC procedure
  - Activate suspended vendor
  - Input: vendor ID
  - Update vendor status to "approved"
  - Set isActive to true
  - Send activation email notification
  - Return updated vendor

**Technical Details:**
- Approval actions require confirmation modal
- Email notifications sent via Payload email plugin
- Status changes logged for audit trail
- Vendor products hidden when vendor is suspended/rejected

---

## Categories Management

### Categories Tree View

- [ ] **Task 6.1**: Create categories management page (`/admin/categories`)
  - Location: `src/app/(app)/admin/categories/page.tsx`
  - Display category tree (hierarchical view)
  - Expandable/collapsible tree nodes
  - Category CRUD operations
  - Drag-and-drop reordering (optional)

- [ ] **Task 6.2**: Create `admin.categories.list` tRPC procedure
  - Query all categories with hierarchy
  - Build category tree structure
  - Return categories in tree format

- [ ] **Task 6.3**: Create `AdminCategoriesTree` component
  - Location: `src/app/(app)/admin/categories/components/AdminCategoriesTree.tsx`
  - Recursive tree component
  - Category node with actions (edit, delete, add child)
  - Expand/collapse functionality

**Technical Details:**
- Tree view uses recursive component pattern
- Categories displayed with indentation for hierarchy
- Icons for expand/collapse (ChevronRight, ChevronDown)
- Category color indicators

**File Reference:**
- Similar to: Category hierarchy in `src/seed/seed-categories.ts`

### Category CRUD Operations

- [ ] **Task 6.4**: Create `admin.categories.create` tRPC procedure
  - Create new category
  - Input: name, slug, parent (optional), color (optional)
  - Validate unique slug
  - Return created category

- [ ] **Task 6.5**: Create `admin.categories.update` tRPC procedure
  - Update category
  - Input: category ID, update data
  - Validate slug uniqueness
  - Prevent circular parent references
  - Return updated category

- [ ] **Task 6.6**: Create `admin.categories.delete` tRPC procedure
  - Delete category
  - Input: category ID
  - Check if category has products (prevent deletion if has products)
  - Check if category has children (prevent deletion if has children, or move children)
  - Return deletion result

**Technical Details:**
- Category form modal for create/edit
- Validation: unique slug, no circular references
- Deletion checks: products assigned, child categories
- Option to move products/children before deletion

---

## Tags Management

### Tags List Page

- [ ] **Task 7.1**: Create tags list page (`/admin/tags`)
  - Location: `src/app/(app)/admin/tags/page.tsx`
  - Display all tags
  - Table with columns: Name, Slug, Products Count, Actions
  - Search functionality
  - Pagination

- [ ] **Task 7.2**: Create `admin.tags.list` tRPC procedure
  - Query all tags
  - Support pagination, search
  - Count products per tag
  - Return tags with product counts

- [ ] **Task 7.3**: Create `AdminTagsTable` component
  - Location: `src/app/(app)/admin/tags/components/AdminTagsTable.tsx`
  - Reusable table component for tags
  - Row actions (edit, delete)

**Technical Details:**
- Table uses shadcn/ui Table component
- Search filters by tag name, slug
- Product count shows how many products use the tag

### Tag CRUD Operations

- [ ] **Task 7.4**: Create `admin.tags.create` tRPC procedure
  - Create new tag
  - Input: name, slug (auto-generated from name)
  - Validate unique slug
  - Return created tag

- [ ] **Task 7.5**: Create `admin.tags.update` tRPC procedure
  - Update tag
  - Input: tag ID, update data
  - Validate slug uniqueness
  - Return updated tag

- [ ] **Task 7.6**: Create `admin.tags.delete` tRPC procedure
  - Delete tag
  - Input: tag ID
  - Remove tag from all products
  - Return deletion result

**Technical Details:**
- Tag form modal for create/edit
- Slug auto-generated from name (lowercase, hyphenated)
- Deletion removes tag from all products (no orphaned references)

---

## Hero Banners Management

### Hero Banners List Page

- [ ] **Task 8.1**: Create hero banners list page (`/admin/hero-banners`)
  - Location: `src/app/(app)/admin/hero-banners/page.tsx`
  - Display all hero banners
  - Table with columns: Title, Template, Active, Priority, Start Date, End Date, Actions
  - Filter by active status, template type
  - Pagination

- [ ] **Task 8.2**: Create `admin.heroBanners.list` tRPC procedure
  - Query all hero banners
  - Support pagination, filters
  - Return banners with all fields

- [ ] **Task 8.3**: Create `AdminHeroBannersTable` component
  - Location: `src/app/(app)/admin/hero-banners/components/AdminHeroBannersTable.tsx`
  - Reusable table component for banners
  - Row actions (view, edit, delete, toggle active)

**Technical Details:**
- Table uses shadcn/ui Table component
- Filters: active status, template type, date range
- Preview thumbnail for banner images

### Hero Banner Editor

- [ ] **Task 8.4**: Create hero banner editor page (`/admin/hero-banners/[id]` or `/admin/hero-banners/new`)
  - Location: `src/app/(app)/admin/hero-banners/[id]/page.tsx` and `src/app/(app)/admin/hero-banners/new/page.tsx`
  - Full banner editor form
  - Template selector
  - Image uploads (desktop, mobile)
  - CTA configuration
  - Scheduling (start/end dates)
  - Live preview

- [ ] **Task 8.5**: Create `admin.heroBanners.create` tRPC procedure
  - Create new hero banner
  - Input: all banner fields
  - Validate required fields
  - Return created banner

- [ ] **Task 8.6**: Create `admin.heroBanners.update` tRPC procedure
  - Update hero banner
  - Input: banner ID, update data
  - Validate required fields
  - Return updated banner

- [ ] **Task 8.7**: Create `admin.heroBanners.delete` tRPC procedure
  - Delete hero banner
  - Input: banner ID
  - Return deletion result

**Technical Details:**
- Banner editor uses Payload CMS admin or custom form
- Template selector shows available templates
- Image uploads via Payload media collection
- Date pickers for scheduling
- Preview shows how banner will look on frontend

**File Reference:**
- Hero Banners collection: `src/collections/HeroBanners.ts`
- Hero Banners TODO: `docs/hero-banners/HERO_BANNERS_TODO.md`

---

## Analytics & Reporting

### Revenue Analytics

- [ ] **Task 9.1**: Create analytics page (`/admin/analytics`)
  - Location: `src/app/(app)/admin/analytics/page.tsx`
  - Revenue charts (line chart, bar chart)
  - Date range selector (today, week, month, year, custom)
  - Revenue by vendor
  - Revenue by category
  - Revenue trends

- [ ] **Task 9.2**: Create `admin.analytics.revenue` tRPC procedure
  - Calculate revenue metrics
  - Input: date range, optional filters (vendor, category)
  - Return revenue data points for charting
  - Support daily, weekly, monthly aggregation

**Technical Details:**
- Charts use recharts or similar charting library
- Date range: today, last 7 days, last 30 days, last 12 months, custom range
- Revenue breakdown by vendor, category, product

### Sales Reports

- [ ] **Task 9.3**: Create sales reports section
  - Top-selling products report
  - Top customers report
  - Sales by vendor report
  - Sales by category report
  - Export reports (CSV, PDF)

- [ ] **Task 9.4**: Create `admin.analytics.salesReport` tRPC procedure
  - Generate sales report
  - Input: report type, date range, filters
  - Return formatted report data
  - Support CSV export format

**Technical Details:**
- Reports generated server-side
- CSV export using csv-writer or similar
- PDF export using PDFKit or similar (optional)

### Vendor Performance

- [ ] **Task 9.5**: Create vendor performance analytics
  - Vendor revenue comparison
  - Vendor order volume
  - Vendor product performance
  - Vendor growth metrics

- [ ] **Task 9.6**: Create `admin.analytics.vendorPerformance` tRPC procedure
  - Calculate vendor performance metrics
  - Input: vendor ID (optional), date range
  - Return vendor performance data
  - Compare vendors side-by-side

**Technical Details:**
- Performance metrics: revenue, orders, products, growth rate
- Comparison charts for multiple vendors
- Time-series data for trend analysis

---

## Users & Roles Management

### Users List Page

- [ ] **Task 10.1**: Create users list page (`/admin/users`)
  - Location: `src/app/(app)/admin/users/page.tsx`
  - Display all users
  - Table with columns: Name, Email, Role, Vendor, Status, Actions
  - Search and filter functionality
  - Filter by role, vendor status
  - Pagination

- [ ] **Task 10.2**: Create `admin.users.list` tRPC procedure
  - Query all users
  - Support pagination, search, filters
  - Populate role, vendor relationships
  - Return users with role and vendor info

- [ ] **Task 10.3**: Create `AdminUsersTable` component
  - Location: `src/app/(app)/admin/users/components/AdminUsersTable.tsx`
  - Reusable table component for users
  - Row actions (view, edit, delete, reset password)

**Technical Details:**
- Table uses shadcn/ui Table component
- Search filters by user name, email
- Filters: role, vendor status, account status
- Role badges with color coding

### User Detail/Edit Page

- [ ] **Task 10.4**: Create user detail page (`/admin/users/[id]`)
  - Location: `src/app/(app)/admin/users/[id]/page.tsx`
  - Display user profile
  - Edit user form (name, email, role, vendor assignment)
  - User orders list
  - User activity log

- [ ] **Task 10.5**: Create `admin.users.getOne` tRPC procedure
  - Query single user by ID
  - Populate role, vendor, orders relationships
  - Return full user data

- [ ] **Task 10.6**: Create `admin.users.update` tRPC procedure
  - Update user
  - Input: user ID, update data
  - Validate role assignments
  - Return updated user

- [ ] **Task 10.7**: Create `admin.users.resetPassword` tRPC procedure
  - Reset user password
  - Input: user ID
  - Generate temporary password
  - Send password reset email
  - Return success status

**Technical Details:**
- User form includes role selector (app-admin, vendor roles)
- Vendor assignment for vendor roles
- Password reset sends email with temporary password
- Activity log tracks user actions

### Roles Management

- [ ] **Task 10.8**: Create roles management page (`/admin/users/roles`)
  - Location: `src/app/(app)/admin/users/roles/page.tsx`
  - Display all roles
  - Role CRUD operations
  - Permission management

- [ ] **Task 10.9**: Create `admin.roles.list` tRPC procedure
  - Query all roles
  - Return roles with permission details

- [ ] **Task 10.10**: Create `admin.roles.create` tRPC procedure
  - Create new role
  - Input: name, slug, type (app/vendor), permissions
  - Validate unique slug
  - Return created role

- [ ] **Task 10.11**: Create `admin.roles.update` tRPC procedure
  - Update role
  - Input: role ID, update data
  - Return updated role

- [ ] **Task 10.12**: Create `admin.roles.delete` tRPC procedure
  - Delete role
  - Input: role ID
  - Check if role is assigned to users (prevent deletion if assigned)
  - Return deletion result

**Technical Details:**
- Roles managed via Payload Roles collection
- Permission system: granular permissions per role
- Role types: app (application-level), vendor (vendor-level)

**File Reference:**
- Roles collection: `src/collections/Roles.ts`

---

## Settings

### Platform Settings

- [ ] **Task 11.1**: Create settings page (`/admin/settings`)
  - Location: `src/app/(app)/admin/settings/page.tsx`
  - Platform configuration
  - General settings (site name, logo, etc.)
  - Payment settings (Stripe keys, etc.)
  - Shipping settings
  - Tax settings

- [ ] **Task 11.2**: Create `admin.settings.get` tRPC procedure
  - Get platform settings
  - Return all settings

- [ ] **Task 11.3**: Create `admin.settings.update` tRPC procedure
  - Update platform settings
  - Input: settings object
  - Validate settings
  - Return updated settings

**Technical Details:**
- Settings stored in Payload Global or separate Settings collection
- Settings form with validation
- Save confirmation and success messages

### Email Templates

- [ ] **Task 11.4**: Create email templates management
  - List email templates
  - Edit email templates
  - Preview email templates
  - Test email sending

- [ ] **Task 11.5**: Create `admin.settings.emailTemplates` tRPC procedures
  - Get email templates
  - Update email template
  - Send test email

**Technical Details:**
- Email templates stored in Payload Globals or separate collection
- Template variables (e.g., {{userName}}, {{orderNumber}})
- Rich text editor for template content

### System Configuration

- [ ] **Task 11.6**: Create system configuration section
  - Feature flags
  - Maintenance mode
  - Cache settings
  - Logging configuration

- [ ] **Task 11.7**: Create `admin.settings.systemConfig` tRPC procedures
  - Get system configuration
  - Update system configuration
  - Toggle feature flags
  - Enable/disable maintenance mode

**Technical Details:**
- Configuration stored in environment variables or database
- Feature flags control feature visibility
- Maintenance mode shows maintenance page to non-admins

---

## Testing & Quality Assurance

### Component Testing

- [ ] **Task 12.1**: Write unit tests for admin components
  - Test AdminDashboardStats component
  - Test AdminRecentOrders component
  - Test AdminTopProducts component
  - Test AdminVendorStatus component

### Integration Testing

- [ ] **Task 12.2**: Write integration tests for admin tRPC procedures
  - Test admin.dashboard.stats
  - Test admin.products.list
  - Test admin.orders.list
  - Test admin.vendors.approve

### E2E Testing

- [ ] **Task 12.3**: Write E2E tests for admin dashboard
  - Test admin login flow
  - Test dashboard page load
  - Test vendor approval flow
  - Test product management flow

---

## Priority Levels

**High Priority (Phase 1):**
- Foundation & Setup (Tasks 0.1-0.9)
- Dashboard Overview (Tasks 1.1-1.9)
- Vendors Management (Tasks 5.1-5.9) - Critical for vendor approval workflow

**Medium Priority (Phase 2):**
- Products Management (Tasks 2.1-2.8)
- Orders Management (Tasks 3.1-3.6)
- Customers Management (Tasks 4.1-4.6)

**Low Priority (Phase 3):**
- Categories Management (Tasks 6.1-6.6)
- Tags Management (Tasks 7.1-7.6)
- Hero Banners Management (Tasks 8.1-8.7)
- Analytics & Reporting (Tasks 9.1-9.6)
- Users & Roles Management (Tasks 10.1-10.12)
- Settings (Tasks 11.1-11.7)

---

## Best Practices

1. **Access Control**: Always use `adminProcedure` for admin-only operations
2. **Error Handling**: Provide clear error messages for unauthorized access
3. **Loading States**: Show skeleton loaders while data is fetching
4. **Responsive Design**: Ensure admin dashboard works on all screen sizes
5. **Audit Trail**: Log all admin actions for security and compliance
6. **Performance**: Use pagination and lazy loading for large datasets
7. **User Experience**: Provide clear feedback for all actions (success, error, loading)

---

## Notes

- Admin dashboard should be accessible only to users with `app-admin` role
- All admin routes should be protected by `requireAdmin()` middleware
- Admin can manage all vendors, products, orders, and customers
- Vendor approval workflow is critical for multi-vendor platform
- Analytics and reporting help admins make data-driven decisions
- Settings allow admins to configure platform behavior
