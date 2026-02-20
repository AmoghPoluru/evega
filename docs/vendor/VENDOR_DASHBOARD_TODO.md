# Vendor Dashboard TODO List

This document tracks all tasks and features for the Vendor Dashboard system.

---

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
   - [Vendor Admin Route Group & Layout](#1-vendor-admin-route-group--layout)
   - [Dashboard Stats & Overview](#2-dashboard-stats--overview)
2. [Product Management](#product-management)
3. [Order Management](#order-management)
4. [Customer Management](#customer-management)
5. [Analytics & Reports](#analytics--reports)
6. [Payouts & Finance](#payouts--finance)
7. [Notifications](#notifications)
8. [Settings](#settings)
9. [UI/UX Improvements](#uiux-improvements)
10. [Technical Tasks](#technical-tasks)

---

## Dashboard Overview

### Accessing the Vendor Dashboard

**Entry Points:**
- Profile Dropdown (`src/components/profile-dropdown.tsx`) - Shows "Vendor Dashboard" link when approved vendor
- Mobile Sidebar (`src/app/(app)/(home)/navbar/navbar-sidebar.tsx`) - Same link in hamburger menu
- Uses `trpc.vendor.getStatus.useQuery()` with 30s polling to detect approval status changes
- Route: `/vendor/dashboard`
- All `/vendor/*` routes protected by `requireVendor()` middleware in layout

### 1. Vendor Admin Route Group & Layout
- [x] **Task 1.1**: Create route group `src/app/(app)/vendor/layout.tsx` ✅
- [x] **Task 1.2**: Add vendor authentication check in layout using `requireVendor()` ✅
- [x] **Task 1.3**: Create vendor admin sidebar navigation component (`VendorSidebar.tsx`) ✅
- [x] **Task 1.4**: Create vendor admin header component (`VendorHeader.tsx`) ✅
- [x] **Task 1.5**: Add vendor logo/name display in header ✅
- [x] **Task 1.6**: Add logout button in vendor header ✅
- [x] **Task 1.7**: Create vendor dashboard page `/vendor/dashboard` ✅
- [x] **Task 1.8**: Add route protection (only vendors can access) ✅
- [ ] **Task 1.9**: Add loading states for vendor data
- [ ] **Task 1.10**: Add error handling for unauthorized access

**Technical Details:**
- Layout uses `requireVendor()` middleware from `src/lib/middleware/vendor-auth.ts`
- Middleware checks: auth → vendor exists → vendor approved & active
- Sidebar: Light gray (`bg-gray-100`), active route highlighting, navigation items array
- Header: Dark gray (`bg-gray-800`), search bar, notifications bell, user dropdown
- Main navbar hidden on `/vendor/*` routes via pathname check in `Navbar.tsx`
*****************************************************************************************
### 2. Dashboard Stats & Overview
- [ ] **Task 2.1**: Create dashboard stats cards component
- [ ] **Task 2.2**: Add total revenue stat (sum of vendor orders)
- [ ] **Task 2.3**: Add total orders count stat
- [ ] **Task 2.4**: Add total products count stat
- [ ] **Task 2.5**: Add pending orders count stat
- [ ] **Task 2.6**: Add low stock alerts count
- [ ] **Task 2.7**: Create recent orders table component
- [ ] **Task 2.8**: Create top selling products component
- [ ] **Task 2.9**: Add chart for revenue over time (last 30 days)
- [ ] **Task 2.10**: Add quick actions section (add product, view orders, etc.)
- [ ] **Task 2.11**: Add loading states for dashboard data
- [ ] **Task 2.12**: Add error handling for dashboard data fetching

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
- [x] **Task 3.2**: Create products list table component with pagination ✅
- [x] **Task 3.3**: Add product search functionality (search by product name) ✅
- [x] **Task 3.4**: Add filter by status (all, published, draft, archived) ✅
- [x] **Task 3.5**: Add product filter by category ✅
- [x] **Task 3.6**: Add bulk actions (publish, archive, delete) ✅
- [x] **Task 3.7**: Add product status badges ✅
- [x] **Task 3.8**: Add product image thumbnails in table ✅
- [x] **Task 3.9**: Add product stock quantity display ✅
- [x] **Task 3.10**: Add sorting by name, price, stock, date ✅

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
- [x] **Task 3.12**: Create `/vendor/products/[productId]/edit` page ✅
- [x] **Task 3.13**: Add product form with all required fields (name, description, price, category) ✅
- [x] **Task 3.14**: Add product image upload functionality ✅
- [ ] **Task 3.15**: Add multiple image upload support (currently supports main image and cover)
- [x] **Task 3.16**: Add product description rich text editor (basic textarea, can be enhanced with Tiptap) ✅
- [x] **Task 3.17**: Add product variants management (sizes, colors, stock per variant) ✅
- [x] **Task 3.18**: Add inventory management (stock, SKU) ✅
- [x] **Task 3.19**: Add pricing fields (price, compare at price) ✅
- [x] **Task 3.20**: Add product categories selection ✅
- [ ] **Task 3.21**: Add product tags management (tags field exists but UI not implemented)
- [ ] **Task 3.22**: Add SEO fields (meta title, description) - not in current schema
- [x] **Task 3.23**: Add product visibility settings (draft/published) ✅
- [x] **Task 3.24**: Add form validation (Zod schema, react-hook-form) ✅
- [x] **Task 3.25**: Add save as draft functionality ✅
- [x] **Task 3.26**: Add product preview functionality ✅
- [x] **Task 3.27**: Add bulk product import via CSV ✅
  - [x] **Task 3.27.1**: Create tRPC procedure `vendor.products.bulkImport` ✅
  - [x] **Task 3.27.2**: Install and configure CSV parsing library (`csv-parse`) ✅
  - [x] **Task 3.27.3**: Create `/vendor/products/import` page ✅
  - [x] **Task 3.27.4**: Create `ProductImportView` component ✅
  - [x] **Task 3.27.5**: Add CSV template download functionality ✅
  - [x] **Task 3.27.6**: Add drag-and-drop file upload UI (react-dropzone) ✅
  - [x] **Task 3.27.7**: Add file validation (CSV only, max 5MB) ✅
  - [x] **Task 3.27.8**: Add CSV preview (first 5 rows) before import ✅
  - [x] **Task 3.27.9**: Add client-side validation feedback ✅
  - [x] **Task 3.27.10**: Add progress indicator during import ✅
  - [x] **Task 3.27.11**: Add import results display (success/failed counts) ✅
  - [x] **Task 3.27.12**: Add error list showing failed rows with reasons ✅
  - [x] **Task 3.27.13**: Add "Import CSV" button to products list page ✅
  - [x] **Task 3.27.14**: Add URL parameter support for status filter (`?status=draft`) ✅
  - [x] **Task 3.27.15**: Add query invalidation after import to refresh list ✅
  - [x] **Task 3.27.16**: Add "View Imported Products" button (redirects to drafts) ✅
  - [x] **Task 3.27.17**: Auto-assign vendor to imported products (from authenticated session) ✅

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

---

## Order Management

### Orders List Page (`/vendor/orders`)
- [ ] **Task 4.1**: Create `/vendor/orders` page
- [ ] **Task 4.2**: Create orders table component
- [ ] **Task 4.3**: Add order search functionality (search by order number or customer name)
- [ ] **Task 4.4**: Add filter by status (all, pending, processing, shipped, delivered, cancelled)
- [ ] **Task 4.5**: Add date range filter
- [ ] **Task 4.6**: Add order sorting (by date, amount, status)
- [ ] **Task 4.7**: Display order number, customer, items, total, status, date
- [ ] **Task 4.8**: Add order status badges (color-coded)
- [ ] **Task 4.9**: Add pagination for orders
- [ ] **Task 4.10**: Add export orders functionality (CSV, PDF)

**Technical Details:**
- Create tRPC procedure `vendor.orders.list` (filtered by vendor, supports status/date/search filters, pagination)
- Create tRPC procedure `vendor.orders.getOne` (verify vendor ownership, depth 2 for relationships)
- Create tRPC procedure `vendor.orders.updateStatus` (verify ownership, update status/tracking/notes, send email notification)
- Search: Order number, customer name, or email (case-insensitive)
- Date filter: ISO date strings, greater_than_equal/less_than_equal queries
- Table: Use shadcn/ui Table, status badges with color coding

### Order Detail Page (`/vendor/orders/[id]`)
- [ ] **Task 4.11**: Create order detail page
- [ ] **Task 4.12**: Display order information (number, date, status)
- [ ] **Task 4.13**: Display customer information
- [ ] **Task 4.14**: Display shipping address
- [ ] **Task 4.15**: Display order items with quantities and prices
- [ ] **Task 4.16**: Display order totals (subtotal, shipping, tax, total)
- [ ] **Task 4.17**: Add update order status functionality
- [ ] **Task 4.18**: Add add tracking number functionality
- [ ] **Task 4.19**: Add mark as fulfilled functionality
- [ ] **Task 4.20**: Add print invoice functionality
- [ ] **Task 4.21**: Add order notes/comments section
- [ ] **Task 4.22**: Add refund functionality

---

## Inventory Management

### Inventory Overview Page (`/vendor/inventory`)
- [ ] **Task 4.23**: Create `/vendor/inventory` page
- [ ] **Task 4.24**: Create inventory table component (product name, variants, stock levels, status)
- [ ] **Task 4.25**: Display low stock alerts (products with stock below threshold)
- [ ] **Task 4.26**: Add filter by stock status (all, in stock, low stock, out of stock)
- [ ] **Task 4.27**: Add search functionality (by product name or SKU)
- [ ] **Task 4.28**: Display variant-level inventory (size/color combinations)
- [ ] **Task 4.29**: Add bulk inventory update functionality
- [ ] **Task 4.30**: Add inventory export (CSV)
- [ ] **Task 4.31**: Add inventory value calculation (total stock value)

**Technical Details:**
- Create tRPC procedure `vendor.inventory.list` (filtered by vendor, supports stock status/search filters)
- Stock status: `in_stock` (stock > threshold), `low_stock` (0 < stock <= threshold), `out_of_stock` (stock = 0)
- Low stock threshold: Configurable per vendor (default: 10 units)
- Variant inventory: Display nested variants with size/color and stock levels
- Bulk update: Update multiple products/variants at once via CSV or form

### Inventory Detail & Adjustments
- [ ] **Task 4.32**: Add quick stock adjustment (increment/decrement) from inventory list
- [ ] **Task 4.33**: Create inventory adjustment modal/form
- [ ] **Task 4.34**: Add adjustment reason/notes field
- [ ] **Task 4.35**: Track inventory adjustment history (who, when, why, before/after)
- [ ] **Task 4.36**: Add set stock level functionality (absolute value)
- [ ] **Task 4.37**: Add stock transfer between variants (if applicable)
- [ ] **Task 4.38**: Display inventory history/transactions per product

**Technical Details:**
- Create tRPC procedure `vendor.inventory.adjust` (verify vendor ownership, update stock, log adjustment)
- Create tRPC procedure `vendor.inventory.getHistory` (fetch adjustment logs for a product)
- Adjustment types: `manual`, `sale`, `return`, `damage`, `transfer`, `restock`
- Store adjustments in separate collection or product metadata
- Validate stock cannot go below 0

### Low Stock Alerts & Notifications
- [ ] **Task 4.39**: Add low stock threshold setting per product/variant
- [ ] **Task 4.40**: Display low stock badge/indicator in inventory list
- [ ] **Task 4.41**: Add email notification for low stock products
- [ ] **Task 4.42**: Add dashboard widget showing low stock count
- [ ] **Task 4.43**: Add out of stock product hiding option (auto-hide when stock = 0)

**Technical Details:**
- Low stock check: Run on inventory updates, display in real-time
- Email notifications: Send when stock drops below threshold (configurable frequency)
- Dashboard widget: Query products with stock <= threshold, display count
- Auto-hide: Option to set `isPrivate: true` when stock reaches 0

### Inventory Reports
- [ ] **Task 4.44**: Create inventory value report (total value of all stock)
- [ ] **Task 4.45**: Create stock movement report (in/out over time period)
- [ ] **Task 4.46**: Create top selling products report (by quantity sold)
- [ ] **Task 4.47**: Create slow-moving inventory report (products with no sales in X days)
- [ ] **Task 4.48**: Add inventory aging report (products in stock for X days)

**Technical Details:**
- Inventory value: Sum of (stock * cost_price) or (stock * selling_price) per product
- Stock movement: Track additions/subtractions with timestamps
- Reports: Use tRPC procedures with date range filters, export to CSV/PDF
- Slow-moving: Query products with no orders in last N days (configurable)

---

## Customer Management

### Customers List Page (`/vendor/customers`)
- [ ] **Task 5.1**: Create `/vendor/customers` page
- [ ] **Task 5.2**: Create customers table component
- [ ] **Task 5.3**: Add customer search functionality (search by name or email)
- [ ] **Task 5.4**: Display customer name, email, total orders, total spent
- [ ] **Task 5.5**: Add customer detail view
- [ ] **Task 5.6**: Display customer order history
- [ ] **Task 5.7**: Add customer tags/segments
- [ ] **Task 5.8**: Add export customers functionality (CSV)

**Technical Details:**
- Create tRPC procedure `vendor.customers.list` (aggregate from orders, group by user, calculate totals)
- Customer data: Derived from orders collection, join with users collection
- Search: Case-insensitive name/email search
- Totals: Sum order totals and count orders per customer from vendor's orders

---

## Analytics & Reports

### Analytics Page (`/vendor/analytics`)
- [ ] **Task 6.1**: Create `/vendor/analytics` page
- [ ] **Task 6.2**: Add revenue chart (line chart for last 30/90/365 days)
- [ ] **Task 6.3**: Add orders chart (bar chart, orders over time)
- [ ] **Task 6.4**: Add top products table (by revenue)
- [ ] **Task 6.5**: Add top products table (by quantity sold)
- [ ] **Task 6.6**: Add sales by category chart (pie chart)
- [ ] **Task 6.7**: Add conversion rate metric
- [ ] **Task 6.8**: Add average order value metric
- [ ] **Task 6.9**: Add date range selector (last 7/30/90/365 days, custom)
- [ ] **Task 6.10**: Add export reports functionality (CSV, PDF)

**Technical Details:**
- Create tRPC procedure `vendor.analytics.revenue` (group by day/week/month, exclude cancelled orders)
- Create tRPC procedure `vendor.analytics.orders` (count orders by date)
- Create tRPC procedure `vendor.analytics.topProducts` (aggregate from order items, sort by revenue/quantity)
- Create tRPC procedure `vendor.analytics.metrics` (total revenue, AOV, conversion rate)
- Charts: Use recharts or chart.js library, line chart for revenue, bar chart for orders
- Date grouping: Day (YYYY-MM-DD), week (week start date), month (YYYY-MM)
- Product aggregation: Map productId to stats, sum quantity and revenue from order items

---

## Payouts & Finance

### Payouts Page (`/vendor/payouts`)
- [ ] **Task 7.1**: Create payouts page
- [ ] **Task 7.2**: Display payout history table
- [ ] **Task 7.3**: Display pending payouts
- [ ] **Task 7.4**: Display payout status (pending, processing, completed, failed)
- [ ] **Task 7.5**: Add payout details view
- [ ] **Task 7.6**: Add payout schedule information
- [ ] **Task 7.7**: Add bank account/payment method management
- [ ] **Task 7.8**: Add payout request functionality
- [ ] **Task 7.9**: Display earnings breakdown

**Technical Details:**
- Create tRPC procedure `vendor.stripeConnect.createAccount` (create Stripe Express account, generate onboarding link)
- Save `stripeAccountId` to vendor record after account creation
- Account link: Redirect to Stripe onboarding, return to `/vendor/settings/payment`
- Payout calculation: Order total - commission rate, store in order record
- Payout schedule: Weekly/bi-weekly/monthly, automatic processing via cron job
- Display payout history: Filter by vendor, show status (pending/processing/completed/failed)

---

## Notifications

### Notifications Page (`/vendor/notifications`)
- [ ] **Task 8.1**: Create `/vendor/notifications` page
- [ ] **Task 8.2**: Display notification list
- [ ] **Task 8.3**: Add notification types (order, product, payout, system)
- [ ] **Task 8.4**: Add mark as read functionality
- [ ] **Task 8.5**: Add mark all as read functionality
- [ ] **Task 8.6**: Add notification filters (by type, read/unread)
- [ ] **Task 8.7**: Add real-time notification updates (WebSocket or polling)
- [ ] **Task 8.8**: Add notification preferences settings

**Technical Details:**
- Create notifications collection (vendor, type, message, read status, createdAt)
- Create tRPC procedure `vendor.notifications.list` (filtered by vendor, sorted by createdAt desc)
- Create tRPC procedure `vendor.notifications.markRead` (update read status)
- Create tRPC procedure `vendor.notifications.markAllRead` (bulk update)
- Notification bell: Show unread count badge, dropdown with recent notifications
- Real-time: Polling (30s interval) or WebSocket for instant updates

---

## Settings

### Settings Page (`/vendor/settings`)
- [ ] **Task 9.1**: Create `/vendor/settings` page
- [ ] **Task 9.2**: Create settings tabs (Profile, Payment, Shipping, Notifications)
- [ ] **Task 9.3**: Add vendor profile settings form (name, description, logo, cover image)
- [ ] **Task 9.4**: Add contact information form (email, phone, website, address)
- [ ] **Task 9.5**: Add shipping settings (zones, rates, free shipping threshold)
- [ ] **Task 9.6**: Add tax settings
- [ ] **Task 9.7**: Add payment method settings (Stripe Connect integration)
- [ ] **Task 9.8**: Add notification preferences (email toggles for orders, low stock, etc.)
- [ ] **Task 9.9**: Add account security settings
- [ ] **Task 9.10**: Add API keys management (if applicable)

**Technical Details:**
- Create tRPC procedure `vendor.settings.updateProfile` (update vendor collection fields)
- Create tRPC procedure `vendor.settings.updateShipping` (update shipping zones/rates)
- Create tRPC procedure `vendor.settings.updateNotifications` (update notification preferences)
- Settings page: Use Tabs component from shadcn/ui, separate components for each tab
- Profile: Image upload for logo/cover using Payload media collection
- Payment: Stripe Connect account creation and onboarding flow
- Form validation: Zod schemas, react-hook-form for each settings section

---

## UI/UX Improvements

### General Improvements
- [ ] **Task 10.1**: Add loading skeletons for all pages
- [ ] **Task 10.2**: Add error boundaries
- [ ] **Task 10.3**: Add empty states for all lists
- [ ] **Task 10.4**: Add toast notifications for actions
- [ ] **Task 10.5**: Add confirmation dialogs for destructive actions
- [ ] **Task 10.6**: Improve mobile responsiveness
- [ ] **Task 10.7**: Add keyboard shortcuts
- [ ] **Task 10.8**: Add dark mode support (optional)
- [ ] **Task 10.9**: Add accessibility improvements (ARIA labels, keyboard navigation)
- [ ] **Task 10.10**: Add tooltips for complex features

### Search Functionality
- [ ] **Task 10.11**: Implement global search in header
- [ ] **Task 10.12**: Add search suggestions
- [ ] **Task 10.13**: Add search history
- [ ] **Task 10.14**: Add keyboard shortcut for search (Cmd/Ctrl + K)

### Performance
- [ ] **Task 10.15**: Optimize image loading
- [ ] **Task 10.16**: Add pagination for large lists
- [ ] **Task 10.17**: Implement virtual scrolling for large tables
- [ ] **Task 10.18**: Add data caching strategies
- [ ] **Task 10.19**: Optimize API calls

---

## Technical Tasks

### Backend/API
- [ ] **Task 11.1**: Create tRPC procedures for vendor products (list, getOne, create, update, delete, bulkUpdate)
- [ ] **Task 11.2**: Create tRPC procedures for vendor orders (list, getOne, updateStatus)
- [ ] **Task 11.3**: Create tRPC procedures for vendor analytics (revenue, orders, topProducts, metrics)
- [ ] **Task 11.4**: Create tRPC procedures for vendor payouts (list, getOne, requestPayout)
- [ ] **Task 11.5**: Add vendor data filtering in all queries (always filter by `vendor: { equals: vendorId }`)
- [ ] **Task 11.6**: Add vendor permissions checks (verify ownership before update/delete)
- [ ] **Task 11.7**: Implement file upload for product images (Payload media collection)
- [ ] **Task 11.8**: Add image optimization/resizing (sharp or imagekit)
- [ ] **Task 11.9**: Implement order status update workflow (status transitions, email notifications)
- [ ] **Task 11.10**: Add payout calculation logic (order total - commission, store in order record)

**Technical Details:**
- All tRPC procedures use `vendorProcedure` middleware (ensures vendor is approved & active)
- Vendor ID: Always use `ctx.session.vendor.id || ctx.session.vendor` (handles string/object)
- Ownership verification: Check vendor field matches authenticated vendor before updates
- Image upload: Use Payload's upload field, relationTo: "media", support multiple images array

### Database
- [ ] **Task 11.11**: Ensure proper indexing for vendor queries (index on `vendor` field in products/orders)
- [ ] **Task 11.12**: Add database migrations if needed (for new fields/collections)
- [ ] **Task 11.13**: Optimize database queries (use depth appropriately, pagination for large datasets)

**Technical Details:**
- Indexes: Add index on `vendor` field in products and orders collections
- Query depth: Use depth 0 for counts, depth 1 for basic relations, depth 2 for nested relations
- Pagination: Always use pagination for list queries, default limit 20, max 100

### Testing
- [ ] **Task 11.14**: Add unit tests for vendor components (React Testing Library)
- [ ] **Task 11.15**: Add integration tests for vendor flows (tRPC procedure testing)
- [ ] **Task 11.16**: Add E2E tests for critical paths (Playwright/Cypress)
- [ ] **Task 11.17**: Test vendor permissions and access control (verify data isolation)

**Technical Details:**
- Unit tests: Test components with mocked tRPC queries
- Integration tests: Test tRPC procedures with test database, verify vendor filtering
- E2E tests: Test full flows (login → dashboard → create product → view orders)
- Security tests: Verify vendors can't access other vendors' data

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
