# Order Management & Status - Comprehensive TODO List

> **Purpose**: This document serves as a comprehensive TODO list and implementation guide for the Order Management system in a multi-vendor e-commerce marketplace built with Next.js, Payload CMS, tRPC, and Stripe.
>
> **For LLMs**: This file contains detailed task breakdowns, technical implementation details, and code references. Each task includes completion status, technical details, and file paths. Use this document to understand the current state of the order management implementation and to implement new features following the established patterns.

## System Overview

**Tech Stack:**
- **Frontend**: Next.js 16 (App Router), React, TypeScript, shadcn/ui components
- **Backend**: Payload CMS, tRPC for type-safe APIs
- **Database**: MongoDB (via Payload)
- **Payment**: Stripe (checkout sessions, webhooks)
- **State Management**: Zustand for cart state, React Query for server state
- **Routing**: Next.js route groups (`(app)/(home)` for customer pages, `(app)/(vendor)` for vendor pages)

**Key Concepts:**
- **Cart Management**: Zustand store with localStorage persistence for client-side cart state
- **Checkout Flow**: Cart → Checkout View → Stripe Checkout → Webhook → Order Creation
- **Buy Now**: Direct purchase flow bypassing cart, single product checkout
- **Order Creation**: Stripe webhook (`checkout.session.completed`) creates orders and updates inventory
- **Shipping Address**: Required during checkout, validated in frontend and webhook
- **Order Status**: Workflow from pending → payment_done → processing → complete
- **Vendor Isolation**: Orders linked to vendors, vendors can only see their own orders

**File Structure:**
- Cart store: `src/modules/checkout/store/use-cart-store.ts`
- Checkout procedures: `src/modules/checkout/server/procedures.ts`
- Checkout UI: `src/modules/checkout/ui/views/checkout-view.tsx`
- Orders collection: `src/collections/Orders.ts`
- Order procedures: `src/modules/orders/server/procedures.ts`
- Stripe webhook: `src/app/api/stripe/webhook/route.ts`
- Order pages: `src/app/(app)/orders/*`

---

## Table of Contents

1. [Cart Management](#cart-management)
2. [Checkout Flow](#checkout-flow)
3. [Buy Now Functionality](#buy-now-functionality)
4. [Shipping Address Management](#shipping-address-management)
5. [Stripe Integration](#stripe-integration)
6. [Order Creation & Webhooks](#order-creation--webhooks)
7. [Order Status Workflow](#order-status-workflow)
8. [Order Number Generation](#order-number-generation)
9. [Inventory Updates](#inventory-updates)
10. [Order History (Customer)](#order-history-customer)
11. [Order Detail Page (Customer)](#order-detail-page-customer)
12. [Order Tracking](#order-tracking)
13. [Admin Order Management](#admin-order-management)
14. [Vendor Order Management](#vendor-order-management)
15. [Email Notifications](#email-notifications)
16. [Order Validation & Hooks](#order-validation--hooks)
17. [Error Handling & Edge Cases](#error-handling--edge-cases)
18. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Cart Management

### Cart Store & State
- [x] **Task 1.1**: Create Zustand cart store with localStorage persistence ✅
  - Create `use-cart-store.ts` with Zustand store, persist to localStorage, store product IDs array
- [x] **Task 1.2**: Add `addProduct(productId)` method to cart store ✅
  - Add product ID to cart array, update localStorage, trigger store update
- [x] **Task 1.3**: Add `removeProduct(productId)` method to cart store ✅
  - Remove product ID from cart array, update localStorage, trigger store update
- [x] **Task 1.4**: Add `toggleProduct(productId)` method to cart store ✅
  - Toggle product in/out of cart, add if not present, remove if present
- [x] **Task 1.5**: Add `clearCart()` method to cart store ✅
  - Clear all products from cart array, reset localStorage, trigger store update
- [x] **Task 1.6**: Add `getCartCount()` method to return total items ✅
  - Return length of productIds array from cart store
- [x] **Task 1.7**: Add `isProductInCart(productId)` method to check membership ✅
  - Check if productId exists in cart array, return boolean
- [x] **Task 1.8**: Create React hook `useCart()` for component access ✅
  - Create hook that returns cart store methods and state for component usage
- [ ] **Task 1.9**: Add cart item quantity management (increment/decrement)
  - Store quantity per product ID in cart state, update quantity methods
- [ ] **Task 1.10**: Add cart item variant storage (size, color per product)
  - Store variant information (size, color) with each product ID in cart
- [ ] **Task 1.11**: Add cart expiration (clear cart after X days of inactivity)
  - Add timestamp to cart state, check on load, clear if expired
- [ ] **Task 1.12**: Add cart sync across browser tabs (BroadcastChannel API)
  - Use BroadcastChannel to sync cart changes across tabs in real-time

**Technical Details:**
- Cart store uses Zustand with `persist` middleware for localStorage persistence
- Store structure: `{ productIds: string[] }` - simple array of product IDs
- Hook provides: `addProduct`, `removeProduct`, `toggleProduct`, `clearCart`, `getCartCount`, `isProductInCart`
- LocalStorage key: `"cart-store"` (configurable)
- Cart state is client-side only, no server-side cart storage

---

## Checkout Flow

### Checkout Page & UI
- [x] **Task 2.1**: Create checkout page route `/checkout` ✅
  - Create `src/app/(app)/checkout/page.tsx` as server component with auth check
- [x] **Task 2.2**: Create `CheckoutView` client component ✅
  - Create `checkout-view.tsx` with tRPC hooks, loading states, error handling
- [x] **Task 2.2.1**: Add checkout view responsibilities (display cart items, product details, subtotal) ✅
  - Implement component to display cart items with images, names, prices, calculate subtotal
- [x] **Task 2.2.2**: Add checkout view purchase mutation handling ✅
  - Handle purchase mutation, redirect to Stripe on success, show errors on failure
- [x] **Task 2.3**: Fetch product details for cart items via tRPC ✅
  - Use `trpc.checkout.getProducts.useQuery()` with product IDs from cart store
- [x] **Task 2.4**: Display cart items with product images, names, prices ✅
  - Map products to cart item cards with Next.js Image, product name, formatted price
- [x] **Task 2.5**: Display cart subtotal calculation ✅
  - Sum all product prices, display formatted currency total
- [x] **Task 2.6**: Create checkout sidebar with order summary ✅
  - Create `CheckoutSidebar` component with subtotal, shipping, tax, total
- [x] **Task 2.6.1**: Add checkout sidebar responsibilities (order summary, checkout button) ✅
  - Display order summary with subtotal, shipping, tax, total, and proceed to checkout button
- [x] **Task 2.7**: Add "Proceed to checkout" button ✅
  - Button triggers `trpc.checkout.purchase.useMutation()` with cart items
- [x] **Task 2.8**: Handle checkout success redirect from Stripe ✅
  - Check URL params for `success=true`, show success message, clear cart
- [x] **Task 2.9**: Handle checkout cancel redirect from Stripe ✅
  - Check URL params for `cancel=true`, show cancel message, keep cart
- [ ] **Task 2.10**: Add loading state during Stripe redirect
  - Show spinner and "Redirecting to payment..." message during mutation
- [ ] **Task 2.11**: Add empty cart state with "Continue Shopping" button
  - Show empty state when cart is empty, link to homepage or products page
- [ ] **Task 2.12**: Add remove item button for each cart item
  - Add remove button per cart item, calls `removeProduct()` from cart store
- [ ] **Task 2.13**: Add quantity selector for each cart item
  - Add increment/decrement buttons or number input for item quantity
- [ ] **Task 2.14**: Add product variant display (size, color) in cart
  - Display selected size and color for each cart item if variants exist
- [ ] **Task 2.15**: Add shipping cost calculation display
  - Calculate and display shipping cost based on address and order total
- [ ] **Task 2.16**: Add tax calculation display (US sales tax)
  - Calculate and display sales tax based on shipping address state
- [ ] **Task 2.17**: Add coupon/discount code input field
  - Add input field and apply button for discount code application
- [ ] **Task 2.18**: Add order notes/comments textarea
  - Add optional textarea for customer to add special instructions
- [ ] **Task 2.19**: Validate cart items before checkout (stock, availability)
  - Check product availability and stock levels before allowing checkout
- [ ] **Task 2.20**: Add cart item error states (out of stock, removed product)
  - Show error badges for items that are out of stock or no longer available
- [ ] **Task 2.21**: Create `CheckoutItem` component for individual cart items
  - Create reusable component to display product image, name, price, remove button
- [ ] **Task 2.22**: Create `CheckoutSidebar` component for order summary
  - Create sidebar component with subtotal, shipping, tax, total, and checkout button
- [ ] **Task 2.23**: Add product image optimization in checkout items
  - Use Next.js Image component with proper sizing and lazy loading
- [ ] **Task 2.24**: Add checkout page authentication check
  - Redirect unauthenticated users to sign-in with redirect URL
- [ ] **Task 2.25**: Add checkout page server component wrapper
  - Create server component that checks auth before rendering client component
- [ ] **Task 2.26**: Add checkout success page state management
  - Use URL query params to detect success state and show appropriate message
- [ ] **Task 2.27**: Add checkout cancel page state management
  - Use URL query params to detect cancel state and show appropriate message
- [ ] **Task 2.28**: Add query invalidation after successful checkout
  - Invalidate cart and product queries after successful order creation
- [ ] **Task 2.29**: Add checkout page responsive design
  - Ensure checkout page works well on mobile, tablet, and desktop
- [ ] **Task 2.30**: Add checkout page accessibility improvements
  - Add ARIA labels, keyboard navigation, and screen reader support

**Technical Details:**
- Checkout page uses server component for auth, client component for UI
- Product fetching: `trpc.checkout.getProducts.useQuery({ productIds })` with depth 2 for images
- Purchase mutation: `trpc.checkout.purchase.useMutation()` returns Stripe checkout URL
- Redirect: `window.location.href = checkout.url` to redirect to Stripe
- Success/Cancel: Check URL query params, show toast notifications

---

## Buy Now Functionality

### Buy Now Flow
- [x] **Task 3.1**: Add "Buy Now" button on product detail page ✅
  - Add button next to "Add to Cart", triggers buy now flow
- [x] **Task 3.1.1**: Add buy now button in `CartButton` or `ProductView` component ✅
  - Add button in product detail page component, calls buy now handler function
- [x] **Task 3.1.2**: Add buy now handler function with loading state ✅
  - Create handler that sets loading state, calls purchase mutation with buyNow flag
- [x] **Task 3.2**: Create buy now mutation with `buyNow` flag ✅
  - Add `buyNow: boolean` to `checkout.purchase` input schema
- [x] **Task 3.3**: Pass `buyNow` flag to Stripe checkout session metadata ✅
  - Store `buyNow: input.buyNow.toString()` in Stripe session metadata
- [x] **Task 3.4**: Include cartItems in success URL for buy now purchases ✅
  - Build success URL with `buyNow=true&cartItems=...` query params
- [x] **Task 3.5**: Handle buy now success redirect with cart items ✅
  - Extract cartItems from URL params, create order without adding to cart
- [ ] **Task 3.6**: Skip cart addition for buy now purchases
  - Don't add product to cart store when buy now is used
- [ ] **Task 3.7**: Add buy now variant selection (size, color)
  - Allow variant selection before triggering buy now checkout
- [ ] **Task 3.8**: Add buy now quantity selector
  - Allow quantity selection before buy now checkout
- [ ] **Task 3.9**: Validate product availability before buy now
  - Check stock and availability before allowing buy now checkout
- [ ] **Task 3.10**: Add buy now loading state
  - Show loading spinner during buy now checkout session creation
- [ ] **Task 3.11**: Add buy now button loading state management
  - Set `isBuyNowLoading` state to true during mutation, false on completion
- [ ] **Task 3.12**: Add buy now success URL parsing in checkout page
  - Parse `buyNow=true` and `cartItems` from URL params on success redirect
- [ ] **Task 3.13**: Add buy now cart removal logic (remove only purchased product)
  - Call `removeProduct(productId)` instead of `clearCart()` when buyNow detected
- [ ] **Task 3.14**: Add buy now success toast message
  - Show "Purchase completed! Item removed from cart." message for buy now
- [ ] **Task 3.15**: Add buy now redirect to homepage after success
  - Redirect to homepage after removing product from cart on buy now success
- [ ] **Task 3.16**: Add buy now error handling (product not found, archived)
  - Show appropriate error messages when buy now fails due to product issues
- [ ] **Task 3.17**: Add buy now authentication check
  - Redirect to sign-in if user not authenticated when clicking buy now
- [ ] **Task 3.18**: Add buy now stock validation before checkout
  - Check product stock availability before creating buy now checkout session
- [ ] **Task 3.19**: Add buy now vendor validation (ensure product has vendor)
  - Validate product has vendor assigned before allowing buy now checkout

**Technical Details:**
- Buy now bypasses cart, goes directly to Stripe checkout
- `buyNow` flag stored in Stripe metadata, passed back in success URL
- Webhook handles buy now same as regular checkout (creates order)
- Success page can differentiate buy now vs regular checkout via URL params

---

## Shipping Address Management

### Address Collection & Validation
- [x] **Task 4.1**: Require shipping address in Stripe checkout session ✅
  - Add `shipping_address_collection: { allowed_countries: ['US'] }` to Stripe session
- [x] **Task 4.2**: Extract shipping address from Stripe session in webhook ✅
  - Extract from `session.shipping_details.address` or `session.customer_details.shipping.address`
- [x] **Task 4.3**: Map Stripe address to Orders collection format ✅
  - Map to `shippingAddress` group: fullName, street, city, state, zipcode, country
- [x] **Task 4.4**: Validate shipping address fields in webhook ✅
  - Check all required fields (fullName, street, city, state, zipcode) are present
- [x] **Task 4.5**: Add shipping address validation in checkout frontend ✅
  - Check if user has shipping address before allowing checkout, redirect if missing
- [x] **Task 4.6**: Add shipping address fields to Orders collection ✅
  - Add `shippingAddress` group field with all required sub-fields
- [x] **Task 4.7**: Store shipping address in order record ✅
  - Include `shippingAddress` in order data when creating orders in webhook
- [ ] **Task 4.8**: Add address validation using USPS API or similar
  - Validate US addresses using address validation service before order creation
- [ ] **Task 4.9**: Add address autocomplete (Google Places API)
  - Integrate address autocomplete for faster address entry
- [ ] **Task 4.10**: Add multiple shipping addresses support
  - Allow users to save multiple addresses, select during checkout
- [ ] **Task 4.11**: Add address selection dropdown in checkout
  - Show saved addresses dropdown, allow selection or add new address
- [ ] **Task 4.12**: Add address editing in checkout flow
  - Allow editing selected address or adding new address during checkout
- [ ] **Task 4.13**: Add shipping address display in order detail page
  - Display complete shipping address in order detail view
- [ ] **Task 4.14**: Add address format validation (US format)
  - Validate zipcode format (5 digits or ZIP+4), state codes (2 letters)

**Technical Details:**
- Stripe collects shipping address during checkout, validates format
- Webhook extracts address from `session.shipping_details.address` object
- Address mapping: Stripe fields → Orders collection `shippingAddress` group
- Validation: Check required fields, throw error if missing, prevent order creation
- Frontend: Check `trpc.addresses.getUserAddresses.useQuery()` before checkout

---

## Stripe Integration

### Stripe Checkout Session
- [x] **Task 5.1**: Create Stripe instance with API key ✅
  - Create `src/lib/stripe.ts` with Stripe client, use `STRIPE_SECRET_KEY` env var
- [x] **Task 5.2**: Create Stripe checkout session in `checkout.purchase` procedure ✅
  - Call `stripe.checkout.sessions.create()` with line items, success/cancel URLs
- [x] **Task 5.3**: Add line items from cart products to Stripe session ✅
  - Build line items array with product data, prices, quantities, metadata
- [x] **Task 5.4**: Add customer email to Stripe session ✅
  - Set `customer_email: ctx.session.user.email` in session creation
- [x] **Task 5.5**: Add success and cancel URLs to Stripe session ✅
  - Set `success_url` and `cancel_url` with app base URL and query params
- [x] **Task 5.6**: Add metadata to Stripe session (userId, cartItems) ✅
  - Store `userId`, `cartItems` JSON, `buyNow` flag in session metadata
- [x] **Task 5.7**: Enable invoice creation in Stripe session ✅
  - Set `invoice_creation: { enabled: true }` for automatic invoice generation
- [x] **Task 5.8**: Require shipping address collection in Stripe session ✅
  - Set `shipping_address_collection: { allowed_countries: ['US'] }`
- [ ] **Task 5.9**: Add payment method types configuration
  - Configure allowed payment methods (card, Apple Pay, Google Pay)
- [ ] **Task 5.10**: Add billing address collection option
  - Optionally collect billing address if different from shipping
- [ ] **Task 5.11**: Add tax calculation in Stripe (automatic tax)
  - Enable Stripe automatic tax calculation based on shipping address
- [ ] **Task 5.12**: Add coupon/discount code support in Stripe
  - Allow applying Stripe coupons or promotion codes during checkout
- [ ] **Task 5.13**: Add customer creation/linking in Stripe
  - Create or link Stripe Customer object for recurring customers
- [ ] **Task 5.14**: Add payment intent metadata for tracking
  - Store additional metadata in payment intent for order tracking

**Technical Details:**
- Stripe instance: `new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-01-28.clover" })`
- Checkout session: `mode: "payment"` for one-time payments
- Line items: `price_data` with `unit_amount` in cents, `currency: "usd"`
- Metadata: JSON stringified cart items, userId, buyNow flag for webhook processing
- Success URL: Includes query params for success handling and buy now flow

---

## Order Creation & Webhooks

### Webhook Endpoint & Processing
- [x] **Task 6.1**: Create Stripe webhook endpoint `/api/stripe/webhook` ✅
  - Create `src/app/api/stripe/webhook/route.ts` with POST handler
- [x] **Task 6.2**: Verify webhook signature using webhook secret ✅
  - Use `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET` for verification
- [x] **Task 6.3**: Handle `checkout.session.completed` event ✅
  - Process completed checkout sessions, extract metadata, create orders
- [x] **Task 6.4**: Extract cart items from session metadata ✅
  - Parse `session.metadata.cartItems` JSON string to array of cart items
- [x] **Task 6.5**: Extract userId from session metadata ✅
  - Get `session.metadata.userId` to link order to user
- [x] **Task 6.6**: Extract shipping address from session ✅
  - Get address from `session.shipping_details.address` or `session.customer_details.shipping.address`
- [x] **Task 6.7**: Create order record for each cart item ✅
  - Loop through cart items, create order in Orders collection for each item
- [x] **Task 6.8**: Parse cartItems JSON from session metadata ✅
  - Parse `session.metadata.cartItems` JSON string to array of cart item objects
- [x] **Task 6.8**: Link order to user (userId relationship) ✅
  - Set `user: userId` relationship field when creating order
- [x] **Task 6.9**: Link order to product (productId relationship) ✅
  - Set `product: productId` relationship field when creating order
- [x] **Task 6.10**: Link order to vendor (from product vendor) ✅
  - Extract vendor from product, set `vendor: vendorId` relationship field
- [x] **Task 6.11**: Set order status to "pending" on creation ✅
  - Set `status: "pending"` as default status for new orders
- [x] **Task 6.12**: Calculate order total from product price and quantity ✅
  - Calculate `total: finalPrice * quantity` and store in order
- [x] **Task 6.13**: Store product variants (size, color) in order ✅
  - Store `size` and `color` fields from cart item in order record
- [x] **Task 6.14**: Store order quantity in order record ✅
  - Store `quantity` field from cart item in order record
- [ ] **Task 6.15**: Handle webhook idempotency (prevent duplicate orders)
  - Check if order already exists for session ID, skip if duplicate
- [ ] **Task 6.16**: Add webhook retry handling for failed orders
  - Implement retry logic for failed order creation attempts
- [ ] **Task 6.17**: Add webhook event logging for debugging
  - Log all webhook events to database or logging service
- [ ] **Task 6.18**: Handle partial order creation (some items fail)
  - Create orders for successful items, log failures, notify user
- [ ] **Task 6.19**: Add webhook error notifications (email/Slack)
  - Send notifications when webhook processing fails
- [ ] **Task 6.20**: Add webhook event replay functionality
  - Allow replaying webhook events for testing or recovery
- [ ] **Task 6.21**: Add webhook signature verification error handling
  - Return 400 error with clear message if signature verification fails
- [ ] **Task 6.22**: Add webhook missing metadata error handling
  - Return 400 error if userId or cartItems missing from session metadata
- [ ] **Task 6.23**: Add webhook product not found error handling
  - Log error and skip order creation if product not found, continue with other items
- [ ] **Task 6.24**: Add webhook variant matching logic
  - Match cart item size/color to product variant, use variant price if found
- [ ] **Task 6.25**: Add webhook final price calculation
  - Calculate final price: variant price if exists, else variantPrice from cart, else product price
- [ ] **Task 6.26**: Add webhook order total calculation
  - Calculate order total as finalPrice * quantity for each order
- [ ] **Task 6.27**: Add webhook vendor tracking for customer update
  - Track unique vendor IDs from all products for customer record update
- [ ] **Task 6.28**: Add webhook customer creation/update after orders
  - Create or update customer record after all orders created, link to vendors
- [ ] **Task 6.29**: Add webhook error logging for debugging
  - Log all webhook errors with session ID, error details, and stack trace
- [ ] **Task 6.30**: Add webhook return 200 OK even on errors
  - Return 200 OK to Stripe even if order creation fails to prevent retries

**Technical Details:**
- Webhook route: `POST /api/stripe/webhook` with signature verification
- Signature verification: `stripe.webhooks.constructEvent(body, signature, webhookSecret)`
- Event handling: Switch statement on `event.type`, handle `checkout.session.completed`
- Order creation: Loop through cart items, create order per item with relationships
- Error handling: Try-catch blocks, return 200 to Stripe even on errors (prevents retries)

---

## Order Status Workflow

### Status Management
- [x] **Task 7.1**: Add status field to Orders collection ✅
  - Add `status` select field with 6 options: pending, payment_done, processing, complete, canceled, refunded
- [x] **Task 7.2**: Add statusHistory array to track status changes ✅
  - Add `statusHistory` array field with `{ status, timestamp, note? }` structure
- [x] **Task 7.3**: Auto-update status to "payment_done" on webhook ✅
  - Set `status: "payment_done"` when `checkout.session.completed` event received
- [x] **Task 7.4**: Create `updateStatus` tRPC procedure ✅
  - Create `orders.updateStatus` mutation with status and optional note
- [x] **Task 7.5**: Add status transition validation ✅
  - Validate allowed status transitions, prevent invalid transitions
- [x] **Task 7.6**: Add status history tracking hook ✅
  - Add `beforeChange` hook in Orders collection to track status changes
- [x] **Task 7.7**: Handle payment failure status (canceled) ✅
  - Set `status: "canceled"` when payment fails or is canceled
- [x] **Task 7.8**: Handle refund status (refunded) ✅
  - Set `status: "refunded"` when charge is refunded via Stripe
- [ ] **Task 7.9**: Add status change email notifications
  - Send email to customer when order status changes
- [ ] **Task 7.10**: Add status change webhook notifications
  - Send webhook to external systems when status changes
- [ ] **Task 7.11**: Add status change audit log
  - Log all status changes with user ID, timestamp, reason
- [ ] **Task 7.12**: Add bulk status update functionality
  - Allow updating status for multiple orders at once
- [ ] **Task 7.13**: Add status change permissions (admin/vendor only)
  - Restrict status updates to authorized users only

**Technical Details:**
- Status field: Select with 6 enum values, default "pending"
- Status history: Array of objects with status, timestamp, optional note
- Hook: `beforeChange` hook checks if status changed, adds to history array
- Validation: Check valid transitions (e.g., can't go from canceled to processing)
- tRPC: `orders.updateStatus` mutation verifies ownership, updates status, triggers hook

---

## Order Number Generation

### Order Number System
- [x] **Task 8.1**: Create order number generator utility ✅
  - Create `src/lib/order-number.ts` with `generateOrderNumber()` function
- [x] **Task 8.2**: Generate order numbers in format ORD-YYYY-NNNN ✅
  - Format: `ORD-2024-0001`, `ORD-2024-0002`, auto-increment per year
- [x] **Task 8.3**: Auto-increment order numbers per year ✅
  - Reset counter each year, start from 0001 for new year
- [x] **Task 8.4**: Add orderNumber field to Orders collection ✅
  - Add `orderNumber` text field, unique, required
- [x] **Task 8.5**: Auto-generate order number on order creation ✅
  - Call `generateOrderNumber()` in `beforeChange` hook when creating order
- [x] **Task 8.6**: Store order number in order record ✅
  - Set `orderNumber` field when creating order in webhook
- [ ] **Task 8.7**: Add order number prefix configuration
  - Make order number prefix configurable (default "ORD")
- [ ] **Task 8.8**: Add order number format customization
  - Allow custom format (e.g., ORD-YYYY-MM-NNNN for monthly reset)
- [ ] **Task 8.9**: Add order number collision detection
  - Check for duplicate order numbers, retry if collision occurs
- [ ] **Task 8.10**: Add order number search functionality
  - Allow searching orders by order number in admin/vendor dashboards

**Technical Details:**
- Generator: Function queries existing orders, finds max number, increments
- Format: `ORD-{YEAR}-{PADDED_NUMBER}` where number is 4 digits with leading zeros
- Uniqueness: Check existing orders, ensure no duplicates
- Hook: `beforeChange` hook generates number only on create (when id doesn't exist)
- Storage: Store in `orderNumber` field, display in order lists and detail pages

---

## Inventory Updates

### Stock Management
- [x] **Task 9.1**: Update product stock on order creation ✅
  - Decrement product stock when order is created in webhook
- [x] **Task 9.2**: Update variant stock if variant exists ✅
  - Decrement variant stock if order has size/color variant
- [x] **Task 9.3**: Prevent negative stock (validate before update) ✅
  - Check stock >= quantity before decrementing, throw error if insufficient
- [x] **Task 9.4**: Update base product stock if no variant ✅
  - Decrement base product stock if order has no variant
- [ ] **Task 9.5**: Add stock reservation system (hold stock during checkout)
  - Reserve stock when checkout starts, release if checkout fails
- [ ] **Task 9.6**: Add stock restoration on order cancellation
  - Restore stock to product/variant when order is canceled
- [ ] **Task 9.7**: Add stock restoration on order refund
  - Restore stock when order is refunded
- [ ] **Task 9.8**: Add low stock alerts when stock reaches threshold
  - Send alert when stock falls below configured threshold
- [ ] **Task 9.9**: Add out of stock product hiding
  - Automatically hide products from public view when stock = 0
- [ ] **Task 9.10**: Add stock history tracking (audit log)
  - Track all stock changes with reason, timestamp, order ID

**Technical Details:**
- Stock update: Decrement `product.stock` or `variant.stock` by order quantity
- Validation: Check `stock >= quantity` before update, throw error if insufficient
- Variant logic: Update variant stock if size/color match, else update base stock
- Atomic operation: Use Payload `update()` to ensure atomic stock decrement
- Error handling: If stock insufficient, log error, don't create order

---

## Order History (Customer)

### Customer Order List
- [x] **Task 10.1**: Create order history page `/orders` ✅
  - Create `src/app/(app)/orders/page.tsx` with server component auth check
- [x] **Task 10.2**: Create `OrdersView` client component ✅
  - Create `orders-view.tsx` with tRPC hooks, loading/error/empty states
- [x] **Task 10.3**: Fetch user orders via tRPC `orders.getByUser` ✅
  - Use `trpc.orders.getByUser.useQuery()` to fetch orders for logged-in user
- [x] **Task 10.4**: Display orders in card layout ✅
  - Map orders to `OrderCard` components with product image, details, status
- [x] **Task 10.5**: Add order status badges with color coding ✅
  - Display status using Badge component with color mapping from utilities
- [x] **Task 10.6**: Add "View Details" link to order detail page ✅
  - Link to `/orders/[id]` for each order card
- [x] **Task 10.7**: Add "Track Package" link (if tracking available) ✅
  - Conditionally show link if `status === "complete"` and `trackingNumber` exists
- [x] **Task 10.8**: Add "Buy Again" button for each order ✅
  - Button adds product to cart and redirects to checkout
- [x] **Task 10.9**: Add empty state when no orders exist ✅
  - Show "No orders yet" message with "Start Shopping" button
- [x] **Task 10.10**: Add loading skeleton state ✅
  - Show skeleton loaders while fetching orders
- [x] **Task 10.11**: Add error state with retry button ✅
  - Show error message with retry button on fetch failure
- [ ] **Task 10.12**: Add order filtering (by status, date range)
  - Add filter dropdowns for status and date range selection
- [ ] **Task 10.13**: Add order sorting (by date, total, status)
  - Add sort dropdown to sort orders by various criteria
- [ ] **Task 10.14**: Add pagination for order list
  - Add pagination controls for large order lists
- [ ] **Task 10.15**: Add order search functionality
  - Add search input to search orders by order number or product name

**Technical Details:**
- Page: Server component checks auth, redirects to sign-in if not authenticated
- View: Client component uses tRPC React Query hooks for data fetching
- Cards: Display product image, name, order number, date, total, status badge
- Actions: Conditional action links based on order status and tracking availability
- States: Loading skeleton, error message, empty state with CTA button

---

## Order Detail Page (Customer)

### Order Detail View
- [ ] **Task 11.1**: Create order detail page `/orders/[id]`
  - Create `src/app/(app)/orders/[id]/page.tsx` with server component auth and ownership check
- [ ] **Task 11.2**: Fetch order details via tRPC `orders.getOne`
  - Use `trpc.orders.getOne.useQuery({ id })` to fetch single order with depth 2
- [ ] **Task 11.3**: Display order number and date prominently
  - Show order number as heading, formatted date below
- [ ] **Task 11.4**: Display order status badge
  - Show status badge with color coding and status label
- [ ] **Task 11.5**: Display product information (image, name, variants)
  - Show product image, name, size, color, quantity in card layout
- [ ] **Task 11.6**: Display order totals (subtotal, shipping, tax, total)
  - Show breakdown of order costs in summary card
- [ ] **Task 11.7**: Display shipping address
  - Show complete shipping address in formatted card
- [ ] **Task 11.8**: Display tracking information (if available)
  - Show tracking number, carrier, tracking URL link if tracking exists
- [ ] **Task 11.9**: Add "Track Package" button (if tracking available)
  - Button links to tracking page or external carrier tracking
- [ ] **Task 11.10**: Add "Print Invoice" button
  - Button triggers print dialog with invoice layout
- [ ] **Task 11.11**: Add "Buy Again" button
  - Button adds product to cart and redirects to checkout
- [ ] **Task 11.12**: Add "Write Review" button (if order complete)
  - Button links to review form for completed orders
- [ ] **Task 11.13**: Add "Cancel Order" button (if status allows)
  - Button allows canceling orders in pending/payment_done status
- [ ] **Task 11.14**: Add order timeline/status history display
  - Show timeline of status changes with dates and notes
- [ ] **Task 11.15**: Add loading and error states
  - Show skeleton loader and error message with retry

**Technical Details:**
- Page: Server component verifies order ownership, redirects if not owner
- Detail: Client component fetches order with relationships (product, user, vendor)
- Layout: Card-based layout with sections for info, product, totals, shipping, tracking
- Actions: Conditional buttons based on order status and available data
- Print: CSS `@media print` styles for invoice printing

---

## Order Tracking

### Tracking System
- [x] **Task 12.1**: Add tracking fields to Orders collection ✅
  - Add `trackingNumber`, `carrier`, `trackingUrl`, `estimatedDelivery` fields
- [x] **Task 12.2**: Create `updateTracking` tRPC procedure ✅
  - Create `orders.updateTracking` mutation for vendors to add tracking info
- [x] **Task 12.3**: Auto-generate tracking URL based on carrier ✅
  - Generate carrier-specific tracking URLs (USPS, FedEx, UPS, DHL)
- [x] **Task 12.4**: Display tracking info in order detail page ✅
  - Show tracking number, carrier, tracking URL link in shipping section
- [ ] **Task 12.5**: Create tracking page `/orders/[id]/track`
  - Create dedicated tracking page with tracking details and status
- [ ] **Task 12.6**: Add tracking status updates (in transit, delivered, etc.)
  - Integrate carrier API to get real-time tracking status updates
- [ ] **Task 12.7**: Add tracking email notifications
  - Send email to customer when tracking is added or status updates
- [ ] **Task 12.8**: Add tracking webhook from carriers
  - Receive webhooks from carriers for automatic status updates
- [ ] **Task 12.9**: Add tracking history timeline
  - Show timeline of tracking events (label created, in transit, delivered)
- [ ] **Task 12.10**: Add estimated delivery date calculation
  - Calculate estimated delivery based on carrier and shipping method

**Technical Details:**
- Fields: `trackingNumber` (text), `carrier` (select: usps, fedex, ups, dhl, other)
- URL generation: Map carrier to tracking URL template, insert tracking number
- Procedure: `orders.updateTracking` verifies vendor ownership, updates fields
- Display: Show tracking info conditionally, link to carrier tracking page
- Integration: Can integrate carrier APIs for real-time status updates

---

## Admin Order Management

### Admin Dashboard
- [ ] **Task 13.1**: Create admin orders page `/admin/orders`
  - Create `src/app/(app)/admin/orders/page.tsx` with super-admin auth check
- [ ] **Task 13.2**: Create admin orders view component
  - Create `admin-orders-view.tsx` with filters, table, stats
- [ ] **Task 13.3**: Fetch all orders via tRPC `orders.getMany`
  - Use `trpc.orders.getMany.useQuery()` with filters, pagination, sorting
- [ ] **Task 13.4**: Display orders in table layout
  - Show orders in sortable table with columns: number, customer, product, total, status, date
- [ ] **Task 13.5**: Add order filters (status, date range, customer, vendor)
  - Add filter dropdowns and date pickers for order filtering
- [ ] **Task 13.6**: Add order search (by order number, customer email)
  - Add search input to search orders by various criteria
- [ ] **Task 13.7**: Add order sorting (by date, total, status)
  - Add sortable table headers for column sorting
- [ ] **Task 13.8**: Add pagination for order list
  - Add pagination controls with page numbers and items per page
- [ ] **Task 13.9**: Add order status update functionality
  - Add dropdown or modal to update order status with note
- [ ] **Task 13.10**: Add bulk order actions (update status, export)
  - Allow selecting multiple orders and performing bulk actions
- [ ] **Task 13.11**: Add order statistics dashboard
  - Show stats: total orders, revenue, pending orders, etc.
- [ ] **Task 13.12**: Add order export functionality (CSV, PDF)
  - Export filtered orders to CSV or generate PDF reports
- [ ] **Task 13.13**: Add order detail modal/view
  - Show full order details in modal or side panel
- [ ] **Task 13.14**: Add order notes/comments management
  - Allow adding internal notes to orders for admin reference
- [ ] **Task 13.15**: Add order refund functionality
  - Process refunds through Stripe API and update order status

**Technical Details:**
- Page: Server component with `isSuperAdmin()` check, redirect if not authorized
- View: Client component with tRPC hooks, filters, table, pagination
- Table: Sortable columns, row actions, bulk selection, export options
- Filters: Status dropdown, date range picker, customer/vendor search
- Actions: Update status, add notes, process refunds, export data

---

## Vendor Order Management

### Vendor Dashboard
- [x] **Task 14.1**: Create vendor orders page `/vendor/orders` ✅
  - Create `src/app/(app)/vendor/orders/page.tsx` with vendor auth check
- [x] **Task 14.2**: Create vendor orders view component ✅
  - Create `vendor-orders-view.tsx` with filters, table, stats
- [x] **Task 14.3**: Fetch vendor orders via tRPC `vendor.orders.list` ✅
  - Use `trpc.vendor.orders.list.useQuery()` filtered by vendor ID
- [x] **Task 14.4**: Display orders in table with vendor filtering ✅
  - Show only orders for authenticated vendor, filter by vendor in query
- [x] **Task 14.5**: Add order status update for vendors ✅
  - Allow vendors to update status of their orders via `vendor.orders.updateStatus`
- [x] **Task 14.6**: Add tracking update for vendors ✅
  - Allow vendors to add/update tracking info via `vendor.orders.updateTracking`
- [ ] **Task 14.7**: Add vendor order statistics
  - Show vendor-specific stats: total orders, revenue, pending count
- [ ] **Task 14.8**: Add vendor order export
  - Export vendor orders to CSV with filtering options
- [ ] **Task 14.9**: Add vendor order detail page
  - Show full order details for vendor with customer info
- [ ] **Task 14.10**: Add vendor order notes
  - Allow vendors to add notes to orders for internal reference

**Technical Details:**
- Page: Uses `requireVendor()` middleware, redirects if not approved vendor
- View: Client component with vendor-scoped tRPC queries
- Filtering: All queries automatically filter by `vendor: { equals: vendorId }`
- Access: Vendors can only see and manage their own orders
- Procedures: All vendor order procedures use `vendorProcedure` middleware

---

## Email Notifications

### Order Emails
- [ ] **Task 15.1**: Send order confirmation email on order creation
  - Send email to customer when order is created with order details
- [ ] **Task 15.2**: Send payment confirmation email
  - Send email when payment is successful (payment_done status)
- [ ] **Task 15.3**: Send order status update emails
  - Send email to customer when order status changes (processing, complete, etc.)
- [ ] **Task 15.4**: Send tracking update email
  - Send email when tracking number is added or updated
- [ ] **Task 15.5**: Send order cancellation email
  - Send email when order is canceled with cancellation reason
- [ ] **Task 15.6**: Send refund confirmation email
  - Send email when order is refunded with refund amount and reason
- [ ] **Task 15.7**: Create email templates for each notification type
  - Create HTML email templates with order details, branding, links
- [ ] **Task 15.8**: Add email preference settings
  - Allow customers to opt-in/out of specific email notifications
- [ ] **Task 15.9**: Add vendor notification emails
  - Send email to vendor when new order is received
- [ ] **Task 15.10**: Add admin notification emails
  - Send email to admin for high-value orders or failed payments

**Technical Details:**
- Service: Use email service (SendGrid, Resend, etc.) for sending emails
- Templates: HTML email templates with order data, product images, links
- Triggers: Send emails on order creation, status changes, tracking updates
- Preferences: Store email preferences in user record, respect opt-outs
- Async: Send emails asynchronously to avoid blocking order creation

---

## Order Validation & Hooks

### Validation & Business Logic
- [x] **Task 16.1**: Validate cart items belong to same vendor ✅
  - Check all products have same vendor before allowing checkout
- [x] **Task 16.2**: Validate product availability before checkout ✅
  - Check products exist, not archived, have stock before checkout
- [x] **Task 16.3**: Validate stock availability in webhook ✅
  - Check stock >= quantity before creating order and updating inventory
- [x] **Task 16.4**: Validate shipping address in webhook ✅
  - Check all required address fields are present before order creation
- [x] **Task 16.5**: Add beforeChange hook for order number generation ✅
  - Generate order number automatically when creating new order
- [x] **Task 16.6**: Add beforeChange hook for status history tracking ✅
  - Track status changes in statusHistory array when status updates
- [ ] **Task 16.7**: Add afterChange hook for email notifications
  - Trigger email notifications after order status changes
- [ ] **Task 16.8**: Add validation hook for status transitions
  - Validate allowed status transitions before allowing status update
- [ ] **Task 16.9**: Add validation for order ownership (vendor/user)
  - Verify user/vendor owns order before allowing updates
- [ ] **Task 16.10**: Add validation for order cancellation eligibility
  - Check if order can be canceled based on current status and time

**Technical Details:**
- Validation: Check vendor match, stock availability, address completeness
- Hooks: `beforeChange` for auto-generation, `afterChange` for notifications
- Ownership: Verify user ID matches order user, vendor ID matches order vendor
- Transitions: Validate status transitions (e.g., can't go from canceled to processing)
- Errors: Throw TRPCError with appropriate codes (BAD_REQUEST, FORBIDDEN, etc.)

---

## Error Handling & Edge Cases

### Error Scenarios
- [x] **Task 17.1**: Handle missing shipping address in webhook ✅
  - Throw error if shipping address is missing, prevent order creation
- [x] **Task 17.2**: Handle product not found in webhook ✅
  - Log error, skip order creation for missing products
- [x] **Task 17.3**: Handle insufficient stock in webhook ✅
  - Throw error if stock insufficient, prevent order creation
- [ ] **Task 17.4**: Handle webhook signature verification failure
  - Return 400 error if signature verification fails, log attempt
- [ ] **Task 17.5**: Handle duplicate order creation (idempotency)
  - Check for existing order with session ID, skip if duplicate
- [ ] **Task 17.6**: Handle partial order creation failures
  - Create orders for successful items, log failures, notify user
- [ ] **Task 17.7**: Handle Stripe checkout session expiration
  - Handle expired sessions, show error, allow retry
- [ ] **Task 17.8**: Handle payment failure scenarios
  - Handle payment failures, update order status, notify user
- [ ] **Task 17.9**: Handle order cancellation edge cases
  - Handle cancellation of orders in various statuses, restore stock
- [ ] **Task 17.10**: Handle refund processing errors
  - Handle Stripe refund failures, log errors, retry mechanism
- [ ] **Task 17.11**: Add checkout procedure product validation
  - Validate all products exist, not archived, have vendor before creating session
- [ ] **Task 17.12**: Add checkout procedure vendor validation
  - Validate all cart items belong to same vendor, throw error if multiple vendors
- [ ] **Task 17.13**: Add checkout procedure stock validation
  - Check stock availability for all products before creating checkout session
- [ ] **Task 17.14**: Add checkout procedure line item building
  - Build Stripe line items with product data, variants, prices, quantities, metadata
- [ ] **Task 17.15**: Add checkout procedure success URL building
  - Build success URL with base URL, success=true, buyNow flag, and cartItems if buyNow
- [ ] **Task 17.16**: Add checkout procedure cancel URL building
  - Build cancel URL with base URL and cancel=true query param
- [ ] **Task 17.17**: Add checkout procedure metadata building
  - Build Stripe session metadata with userId, cartItems JSON, buyNow flag
- [ ] **Task 17.18**: Add checkout procedure error handling for Stripe API failures
  - Handle Stripe API errors, return appropriate TRPC error codes
- [ ] **Task 17.19**: Add checkout procedure missing checkout URL error
  - Throw error if Stripe checkout session created but URL is missing
- [ ] **Task 17.20**: Add webhook state code conversion (full name to 2-letter code)
  - Convert Stripe state names (e.g., "California") to 2-letter codes (e.g., "CA")

**Technical Details:**
- Error handling: Try-catch blocks, error logging, user-friendly error messages
- Idempotency: Check for existing orders, prevent duplicates
- Partial failures: Create successful orders, log failures, continue processing
- Notifications: Notify users of failures via email or in-app notifications
- Retry: Implement retry logic for transient failures (network, API errors)

---

## Testing & Quality Assurance

### Local Development Testing
- [ ] **Task 18.1**: Set up Stripe CLI for local webhook testing
  - Install Stripe CLI, run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] **Task 18.2**: Test add to cart functionality
  - Verify products can be added to cart, persist in localStorage, appear in checkout
- [ ] **Task 18.3**: Test checkout page product display
  - Verify products fetched correctly, images load, prices display, subtotal calculated
- [ ] **Task 18.4**: Test regular checkout flow with Stripe test card
  - Use test card `4242 4242 4242 4242`, complete payment, verify order creation
- [ ] **Task 18.5**: Test buy now flow with Stripe test card
  - Click buy now, use test card, complete payment, verify only purchased product removed
- [ ] **Task 18.6**: Test checkout success redirect and cart clearing
  - Verify cart cleared after successful regular checkout, success message shown
- [ ] **Task 18.7**: Test checkout cancel redirect
  - Verify cart preserved after cancel, cancel message shown, user can retry
- [ ] **Task 18.8**: Test webhook order creation
  - Verify orders created in database with correct user, product, vendor, shipping address
- [ ] **Task 18.9**: Test webhook inventory updates
  - Verify product/variant stock decremented correctly after order creation
- [ ] **Task 18.10**: Test webhook shipping address extraction
  - Verify shipping address extracted correctly from Stripe session and stored in order
- [ ] **Task 18.11**: Test error scenarios (archived product, multiple vendors, out of stock)
  - Verify appropriate errors shown for each error scenario
- [ ] **Task 18.12**: Test webhook signature verification failure
  - Verify webhook rejects requests with invalid signatures, logs error
- [ ] **Task 18.13**: Test missing shipping address in webhook
  - Verify webhook throws error and prevents order creation if address missing
- [ ] **Task 18.14**: Test order number generation
  - Verify unique order numbers generated in format ORD-YYYY-NNNN, auto-increment works
- [ ] **Task 18.15**: Test order status workflow
  - Verify status transitions work correctly, status history tracked

### Production Testing
- [ ] **Task 18.16**: Configure Stripe webhook in production dashboard
  - Set webhook URL, select events, copy signing secret to environment variables
- [ ] **Task 18.17**: Test production checkout with test mode
  - Use Stripe test mode in production, verify complete flow works
- [ ] **Task 18.18**: Test production webhook event processing
  - Verify webhook receives and processes events correctly in production
- [ ] **Task 18.19**: Test production order creation and inventory updates
  - Verify orders created and inventory updated correctly in production database
- [ ] **Task 18.20**: Monitor production webhook logs for errors
  - Set up monitoring and alerting for webhook failures in production

### Integration Testing
- [ ] **Task 18.21**: Test complete checkout flow end-to-end
  - Test full flow from add to cart through order creation and inventory update
- [ ] **Task 18.22**: Test buy now flow end-to-end
  - Test full buy now flow from button click through order creation and cart removal
- [ ] **Task 18.23**: Test multi-item checkout flow
  - Test checkout with multiple products, verify all orders created correctly
- [ ] **Task 18.24**: Test checkout with product variants
  - Test checkout with size/color variants, verify variant stock updated correctly
- [ ] **Task 18.25**: Test checkout error recovery
  - Test that errors are handled gracefully and user can retry checkout

**Technical Details:**
- Local testing: Use Stripe CLI to forward webhooks to localhost
- Test cards: Use Stripe test cards (4242 4242 4242 4242 for success, 4000 0000 0000 0002 for decline)
- Webhook testing: Use Stripe CLI to trigger test events or Stripe Dashboard webhook testing
- Production: Configure webhook in Stripe Dashboard, use test mode first before live mode
- Monitoring: Set up error logging and alerting for webhook failures

---

## Summary

### ✅ Completed Tasks (Foundation)
1. **Cart Management** - Zustand store with localStorage persistence
2. **Checkout Flow** - Checkout page, product fetching, Stripe integration
3. **Buy Now** - Direct purchase flow with buyNow flag
4. **Shipping Address** - Required in Stripe, validated in webhook
5. **Stripe Integration** - Checkout session creation, webhook handling
6. **Order Creation** - Webhook creates orders, links to user/product/vendor
7. **Order Status** - Status workflow with history tracking
8. **Order Numbers** - Auto-generated unique order numbers
9. **Inventory Updates** - Stock decrement on order creation
10. **Order History** - Customer order list page with cards
11. **Vendor Orders** - Vendor order management page and procedures

### ⏳ Remaining Tasks (Enhancements)
1. **Cart Enhancements** - Quantity, variants, expiration, cross-tab sync
2. **Checkout Enhancements** - Shipping/tax calculation, coupons, notes
3. **Buy Now Enhancements** - Variant selection, quantity, validation
4. **Address Enhancements** - Validation, autocomplete, multiple addresses
5. **Stripe Enhancements** - Payment methods, tax, coupons, customer linking
6. **Webhook Enhancements** - Idempotency, retry, logging, notifications
7. **Order Detail** - Full order detail page for customers
8. **Order Tracking** - Tracking page, status updates, carrier integration
9. **Admin Orders** - Admin dashboard with filters, export, bulk actions
10. **Email Notifications** - Order confirmation, status updates, tracking
11. **Validation & Hooks** - Enhanced validation, email hooks, ownership checks
12. **Error Handling** - Comprehensive error handling, retry logic, notifications

---

**Last Updated**: 2024-01-30
**Status**: Foundation Complete, Enhancements In Progress
