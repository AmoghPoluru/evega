# Order Management & Status - Detailed Implementation Tasks

## Overview

This document provides detailed implementation tasks for the Order Management & Status features listed in `BOUTIQUE_ECOMMERCE_TODO.md` (lines 41-46).

---

## Current Status

✅ **Completed:**
- Order status workflow (Pending → Payment Done → Processing → Complete → Canceled → Refunded)
- Order number generation (ORD-2024-0001 format)
- Orders collection updated with all fields
- Stripe webhook integration for status updates
- tRPC procedures for order management
- **Order history page for users (`/orders`)** ✅

⏳ **Remaining Tasks:**
- Admin order management dashboard (`/admin/orders`)
- Order tracking UI components (`/orders/[id]/track`)

---

# 🎯 Task 1: Add Order Status Workflow ✅ COMPLETED


**Status:** ✅ **DONE**

**What was implemented:**
- Added `status` field to Orders collection with 6 statuses:
  - `pending` - Order created, waiting for Stripe payment
  - `payment_done` - Payment successful (automatically set by Stripe webhook)
  - `processing` - **Manually set by admin** - Order is being processed/fulfilled
  - `complete` - **Manually set by admin** - Order fulfillment complete
  - `canceled` - Payment failed or order canceled
  - `refunded` - Payment refunded
- Added `statusHistory` array to track all status changes
- Stripe webhook handlers for automatic status updates:
  - `checkout.session.completed` → `payment_done` (payment successful)
  - `payment_intent.processing` → `processing`
  - `payment_intent.payment_failed` → `canceled`
  - `charge.refunded` → `refunded`
- **Workflow**: Pending → Payment Done (automatic) → Processing (manual) → Complete (manual)

**Files modified:**
- ✅ `src/collections/Orders.ts` - Added status and statusHistory fields
- ✅ `src/app/api/stripe/webhook/route.ts` - Added status update handlers
- ✅ `src/modules/orders/server/procedures.ts` - Added updateStatus procedure

---

# 🎯 Task 2: Add Order Number Generation ✅ COMPLETED


**Status:** ✅ **DONE**

**What was implemented:**
- Created `generateOrderNumber()` function in `src/lib/order-number.ts`
- Generates unique order numbers: `ORD-2024-0001`, `ORD-2024-0002`, etc.
- Auto-increments per year
- Automatically called when orders are created

**Files created:**
- ✅ `src/lib/order-number.ts` - Order number generator utility

**Files modified:**
- ✅ `src/collections/Orders.ts` - Added orderNumber field with auto-generation hook
- ✅ `src/app/api/stripe/webhook/route.ts` - Generates order number on order creation

---

# 🎯 Task 3: Create Order History Page for Users ✅ COMPLETED


**Status:** ✅ **COMPLETED**

**What was implemented:**
A complete order history page where logged-in users can view all their past orders, see order details, status, and tracking information. Users can access their orders from the profile dropdown or directly at `/orders`.

**Implementation Summary:**

### Files Created (New):

1. **`src/app/(app)/orders/page.tsx`** ✅ **NEW FILE**
   - **Type:** Next.js Server Component
   - **Purpose:** Entry point for order history page (`/orders` route)
   - **Authentication:** Uses Payload CMS `payload.auth({ headers })` to check user session
   - **Redirect Logic:** Redirects to `/sign-in?redirect=/orders` if not authenticated (preserves redirect URL)
   - **Data Passing:** Passes `userId` prop to `OrdersView` client component
   - **Imports:** `redirect` from Next.js, `getPayload`, `headers` from Next.js, `OrdersView` component
   - **Code Pattern:** Standard Next.js App Router server component pattern

2. **`src/modules/orders/ui/views/orders-view.tsx`** ✅ **NEW FILE**
   - **Type:** Client Component (`"use client"`)
   - **Purpose:** Main view component for displaying user orders list
   - **Data Fetching:** Uses tRPC `orders.getByUser.useQuery({})` hook (automatically filters by logged-in user)
   - **State Management:**
     - `isLoading` - Shows loading spinner
     - `error` - Displays error message
     - `data` - Contains orders array and pagination info
   - **UI States:**
     - **Loading:** Centered spinner with "Loading your orders..." message, gray background
     - **Error:** Red-bordered container with error message display
     - **Empty:** Package icon (16x16), "No orders yet" heading, descriptive text, "Start Shopping" button (orange)
     - **Success:** Order count header, list of OrderCard components, pagination buttons
   - **Features:**
     - Displays total order count: "You have X order(s)"
     - Maps orders to `OrderCard` components with unique keys
     - Pagination UI with Previous/Next buttons (ready for cursor-based implementation)
   - **Styling:** Gray background (`bg-gray-100`), max-width container (`max-w-7xl`), responsive padding

3. **`src/modules/orders/ui/components/order-card.tsx`** ✅ **NEW FILE**
   - **Type:** Client Component (`"use client"`)
   - **Purpose:** Individual order display card component
   - **Props:** `order: Order` (from Payload CMS types)
   - **Key Features:**
     - **Product Image:** 
       - 96x96px fixed size (`w-24 h-24`)
       - Next.js `Image` component with `fill` and `object-contain`
       - Fallback: Gray background with "No Image" text if missing
       - Border and rounded corners
     - **Product Name:** 
       - Large, bold text (`text-lg font-medium`)
       - Clickable link to product page (`/products/[id]`)
       - Gray-900 color
     - **Order Number:** 
       - Small gray text (`text-sm text-gray-600`)
       - Format: "Order #[orderNumber]"
     - **Order Date:** 
       - Formatted with `toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })`
       - Example: "January 30, 2024"
     - **Variant Details:** 
       - Conditionally displays size, color, quantity if present
       - Small gray text format
     - **Price:** 
       - Large, bold (`text-lg font-bold`)
       - Formatted with `formatCurrency` utility
       - Positioned top-right
     - **Status Badge:** 
       - Rounded pill (`rounded-full`)
       - Dynamic colors from `getStatusColor()` utility
       - Small text (`text-xs font-medium`)
       - Positioned top-right next to price
   - **Action Links (Conditional):**
     - **"View Details"** - Always visible, links to `/orders/[id]`
     - **"Track Package"** - Only if `status === "complete"` AND `trackingNumber` exists
     - **"Write Review"** - Only if `status === "complete"` AND `product?.id` exists
     - **"Buy Again"** - Always visible if `product?.id` exists
   - **Layout:**
     - Flexbox: `flex flex-col md:flex-row` (stacks on mobile, side-by-side on desktop)
     - Gap: `gap-6` between image and details
     - Border-top separator above action links
   - **Styling:**
     - White background, gray border, rounded corners
     - Hover effect: Shadow appears (`hover:shadow-md transition-shadow`)
     - Padding: `p-6`
     - Responsive: Proper spacing on mobile and desktop

4. **`src/modules/orders/ui/utils/order-status.ts`** ✅ **NEW FILE**
   - **Type:** Utility module (TypeScript)
   - **Purpose:** Status formatting and styling utilities
   - **Exports:**
     - `getStatusLabel(status: string): string` - Converts status enum to human-readable label
     - `getStatusColor(status: string): string` - Returns Tailwind CSS class string
   - **Status Support:** All 6 statuses with proper mapping
   - **Color Mapping (Tailwind CSS classes):**
     - `pending`: `bg-yellow-100 text-yellow-800`
     - `payment_done`: `bg-blue-100 text-blue-800`
     - `processing`: `bg-purple-100 text-purple-800`
     - `complete`: `bg-green-100 text-green-800`
     - `canceled`: `bg-red-100 text-red-800`
     - `refunded`: `bg-gray-100 text-gray-800`
   - **Fallback:** Returns original status or default gray if status not found

### Files Modified (Existing):

5. **`src/components/profile-dropdown.tsx`** ✅ **MODIFIED**
   - **File Type:** Client Component (existing file)
   - **Changes Made:**
     - **Added Import:** `Package` icon from `lucide-react` (line 3)
     - **Added Menu Item:** New `DropdownMenuItem` for "My Orders" link (lines 89-94)
   - **Code Added:**
     ```typescript
     <DropdownMenuItem asChild>
       <Link href="/orders" className="flex items-center cursor-pointer">
         <Package className="mr-2 h-4 w-4" />
         My Orders
       </Link>
     </DropdownMenuItem>
     ```
   - **Position:** Between "Shipping Addresses" and logout separator
   - **Icon:** Package icon (4x4 size, margin-right)
   - **Link:** `/orders` route
   - **Impact:** Users can now access order history directly from profile dropdown in navbar
   - **Accessibility:** Same styling and behavior as other dropdown items

### Detailed Implementation:

#### Order Card Component (`order-card.tsx`) - Key Features:

**Layout Structure:**
- Flexbox layout: `flex flex-col md:flex-row` (stacks on mobile, side-by-side on desktop)
- Product image: 24x24 (96px) fixed size with border and rounded corners
- Order details: Flexible width with proper spacing
- Responsive gap: `gap-6` between image and details

**Product Information Display:**
- Product image with Next.js Image component (optimized)
- Fallback: Gray placeholder with "No Image" text if image missing
- Product name: Large, bold, clickable (links to product page)
- Order number: Small gray text with "#" prefix
- Order date: Formatted using `toLocaleDateString` with full month name
- Variant details: Conditionally shows size, color, quantity if present
- Price: Large, bold, formatted with currency symbol

**Status Badge:**
- Rounded pill shape (`rounded-full`)
- Dynamic colors based on status
- Small text (`text-xs`) with medium font weight
- Positioned in top-right corner on desktop

**Action Links:**
- Horizontal flex layout with gap
- Blue links that turn orange on hover
- Conditional rendering:
  - "Track Package" only if `status === "complete"` AND `trackingNumber` exists
  - "Write Review" only if `status === "complete"` AND product exists
  - "Buy Again" always shows if product exists
- Border-top separator above action links

**Styling Details:**
- Card: White background, gray border, rounded corners
- Hover effect: Shadow appears on hover (`hover:shadow-md`)
- Transition: Smooth shadow transition
- Spacing: Consistent padding (`p-6`)

#### Orders View Component (`orders-view.tsx`) - Key Features:

**State Management:**
- Uses tRPC `orders.getByUser.useQuery()` hook
- Automatically filters orders by logged-in user (handled by tRPC procedure)
- No manual userId filtering needed

**Loading State:**
- Centered spinner with message
- Full-height container (`min-h-[400px]`)
- Gray background matching page theme

**Empty State:**
- Package icon (lucide-react)
- Large heading: "No orders yet"
- Descriptive message
- Call-to-action button: "Start Shopping" (orange, links to homepage)

**Error State:**
- Red border on error container
- Error message display
- User-friendly error text

**Order List:**
- Vertical spacing between cards (`space-y-4`)
- Renders OrderCard for each order
- Shows total order count in header

**Pagination:**
- UI ready (Previous/Next buttons)
- Uses `hasNextPage`, `hasPrevPage`, `nextPage`, `prevPage` from tRPC response
- Functionality can be added later with cursor-based pagination

#### Status Utilities (`order-status.ts`) - Implementation:

**getStatusLabel Function:**
- Maps status enum values to human-readable labels
- Fallback: Returns original status if not found
- Used in OrderCard for status badge text

**getStatusColor Function:**
- Returns Tailwind CSS class strings
- Format: `bg-{color}-100 text-{color}-800`
- Provides consistent color scheme across app
- Used in OrderCard for status badge styling

### Features Implemented:

✅ **Authentication** - Server-side auth check, redirects to sign-in if not logged in, then back to orders  
✅ **Order Fetching** - Uses tRPC `orders.getByUser` procedure (automatically filters by logged-in user)  
✅ **Loading States** - Centered spinner with message while fetching orders  
✅ **Empty State** - Package icon, helpful message, and "Start Shopping" button when no orders exist  
✅ **Error Handling** - Displays error messages gracefully with red border  
✅ **Status Display** - Color-coded status badges for all 6 statuses with proper styling  
✅ **Order Details** - Shows all order information (product, variants, price, date, order number)  
✅ **Action Links** - Conditional action links (View Details, Track Package, Write Review, Buy Again)  
✅ **Responsive Design** - Mobile-first design, works on mobile and desktop  
✅ **Navigation** - Accessible from profile dropdown with Package icon  
✅ **Order Count** - Displays total number of orders in page header  
✅ **Image Optimization** - Uses Next.js Image component for optimized product images  
✅ **Type Safety** - Full TypeScript support with Payload CMS generated types  

### Access Points:

- **Profile Dropdown** → "My Orders" link (Package icon)
- **Direct URL**: `/orders`
- **Redirect Flow**: If not authenticated → `/sign-in?redirect=/orders` → back to `/orders` after login

### Technical Details:

- Uses Next.js App Router with Server and Client Components
- tRPC for type-safe API calls
- Tailwind CSS for styling
- Responsive design with mobile-first approach
- Error boundaries and loading states
- Type-safe with Payload CMS generated types
- Image optimization with Next.js Image component

---

# 🎯 Task 4: Create Admin Order Management Dashboard ⏳ TODO

**Status:** ⏳ **TODO**

**What needs to be implemented:**
An admin-only page where store administrators can:
- View all orders
- Filter by status, date, customer
- Update order status
- Add tracking numbers
- View order details
- Cancel/refund orders

**Implementation steps:**

### Step 1: Create Admin Orders Page

**File**: `src/app/(app)/admin/orders/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import { AdminOrdersView } from "@/modules/orders/ui/views/admin-orders-view";
import { isSuperAdmin } from "@/lib/access";

export default async function AdminOrdersPage() {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const user = await payload.auth({ headers: headersList });

  if (!user?.user || !isSuperAdmin(user.user)) {
    redirect("/");
  }

  return <AdminOrdersView />;
}
```

### Step 2: Create Admin Orders View

**File**: `src/modules/orders/ui/views/admin-orders-view.tsx`

```typescript
"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { OrderTable } from "../components/order-table";
import { OrderFilters } from "../components/order-filters";
import { OrderStatusStats } from "../components/order-status-stats";

export function AdminOrdersView() {
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    dateFrom: undefined as string | undefined,
    dateTo: undefined as string | undefined,
  });

  const { data, isLoading } = trpc.orders.getMany.useQuery({
    status: filters.status as any,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      
      <OrderStatusStats />
      
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <OrderFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      <OrderTable orders={data?.docs || []} isLoading={isLoading} />
    </div>
  );
}
```

### Step 3: Create Order Table Component

**File**: `src/modules/orders/ui/components/order-table.tsx`

```typescript
"use client";

import { Order } from "@/payload-types";
import { formatCurrency } from "@/lib/utils";
import { OrderStatusBadge } from "./order-status-badge";
import { UpdateStatusDialog } from "./update-status-dialog";
import { useState } from "react";

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {typeof order.user === "object" ? order.user.email : "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {typeof order.product === "object" ? order.product.name : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {formatCurrency(order.total || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-orange-600 hover:underline"
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <UpdateStatusDialog
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}
```

**Files to create:**
- `src/app/(app)/admin/orders/page.tsx` - Admin orders page
- `src/modules/orders/ui/views/admin-orders-view.tsx` - Admin view component
- `src/modules/orders/ui/components/order-table.tsx` - Orders table
- `src/modules/orders/ui/components/order-filters.tsx` - Filter component
- `src/modules/orders/ui/components/order-status-badge.tsx` - Status badge
- `src/modules/orders/ui/components/update-status-dialog.tsx` - Status update dialog
- `src/modules/orders/ui/components/order-status-stats.tsx` - Status statistics

---

# 🎯 Task 5: Add Order Tracking ⏳ TODO


**Status:** ⏳ **TODO**

**What needs to be implemented:**
Allow customers and admins to track shipped orders using tracking numbers and carrier information.

**Note:** The backend is already implemented! The Orders collection has:
- ✅ `trackingNumber` field
- ✅ `carrier` field (USPS, FedEx, UPS, DHL)
- ✅ `trackingUrl` field (auto-generated)
- ✅ `estimatedDelivery` field

**What's needed:**
- UI components to display tracking information
- Tracking page for customers
- Admin UI to add/update tracking information

**Implementation steps:**

### Step 1: Create Tracking Page

**File**: `src/app/(app)/orders/[id]/track/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";
import { TrackingView } from "@/modules/orders/ui/views/tracking-view";

export default async function TrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const user = await payload.auth({ headers: headersList });

  if (!user?.user) {
    redirect("/sign-in");
  }

  const order = await payload.findByID({
    collection: "orders",
    id: params.id,
    depth: 2,
  });

  // Verify order belongs to user
  if (typeof order.user === "string" && order.user !== user.user.id) {
    redirect("/orders");
  }

  return <TrackingView order={order} />;
}
```

### Step 2: Create Tracking View Component

**File**: `src/modules/orders/ui/views/tracking-view.tsx`

```typescript
"use client";

import { Order } from "@/payload-types";
import { Package, MapPin, Calendar } from "lucide-react";

interface TrackingViewProps {
  order: Order;
}

export function TrackingView({ order }: TrackingViewProps) {
  const getTrackingUrl = () => {
    if (order.trackingUrl) return order.trackingUrl;
    
    const trackingNumber = order.trackingNumber;
    const carrier = order.carrier;
    
    const urls: Record<string, string> = {
      usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    };
    
    return urls[carrier as string] || "#";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>
      
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Package className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-lg font-medium">{order.orderNumber}</p>
          </div>
        </div>

        {order.trackingNumber && (
          <>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center gap-4 mb-4">
                <MapPin className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="text-lg font-medium">{order.trackingNumber}</p>
                </div>
              </div>

              {order.carrier && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Carrier</p>
                  <p className="font-medium">{order.carrier.toUpperCase()}</p>
                </div>
              )}

              <a
                href={getTrackingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Track on {order.carrier?.toUpperCase() || "Carrier"} Website
              </a>
            </div>
          </>
        )}

        {order.estimatedDelivery && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-medium">
                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Files to create:**
- `src/app/(app)/orders/[id]/track/page.tsx` - Tracking page
- `src/modules/orders/ui/views/tracking-view.tsx` - Tracking view component

---

## Summary

### ✅ Completed Tasks
1. **Order status workflow** - 6 statuses with automatic and manual updates
2. **Order number generation** - Auto-generated unique order numbers (ORD-YYYY-NNNN)
3. **Order history page for users** - Complete UI with order cards, status badges, and actions

### ⏳ Remaining Tasks
1. Admin order management dashboard (`/admin/orders`)
2. Order tracking UI components (`/orders/[id]/track`)

### Files Already Created (Backend)
- ✅ `src/collections/Orders.ts` - Complete with all fields (status, orderNumber, tracking, etc.)
- ✅ `src/lib/order-number.ts` - Order number generator
- ✅ `src/app/api/stripe/webhook/route.ts` - Status updates (payment_done, canceled, refunded)
- ✅ `src/modules/orders/server/procedures.ts` - tRPC procedures (getMany, getByUser, updateStatus, updateTracking)

### Files Created (Frontend - User Order History) ✅
- ✅ `src/app/(app)/orders/page.tsx` - Order history page
- ✅ `src/modules/orders/ui/views/orders-view.tsx` - Orders list view
- ✅ `src/modules/orders/ui/components/order-card.tsx` - Individual order card
- ✅ `src/modules/orders/ui/utils/order-status.ts` - Status utilities
- ✅ `src/components/profile-dropdown.tsx` - Added "My Orders" link

### Files to Create (Frontend - Admin & Tracking)
- `src/app/(app)/admin/orders/page.tsx` - Admin orders page
- `src/modules/orders/ui/views/admin-orders-view.tsx` - Admin view component
- `src/modules/orders/ui/components/order-table.tsx` - Orders table
- `src/modules/orders/ui/components/order-filters.tsx` - Filter component
- `src/modules/orders/ui/components/order-status-badge.tsx` - Status badge
- `src/modules/orders/ui/components/update-status-dialog.tsx` - Status update dialog
- `src/modules/orders/ui/components/order-status-stats.tsx` - Status statistics
- `src/app/(app)/orders/[id]/track/page.tsx` - Tracking page
- `src/modules/orders/ui/views/tracking-view.tsx` - Tracking view component

---

**Last Updated**: 2024-01-30
