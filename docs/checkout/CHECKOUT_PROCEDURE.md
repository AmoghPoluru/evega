# Checkout Process Procedure Document

## Overview

This document explains the complete checkout process in the Evega e-commerce application, from adding items to cart through order completion and fulfillment.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [User Journey](#user-journey)
3. [Component Flow](#component-flow)
4. [Technical Implementation](#technical-implementation)
5. [Stripe Integration](#stripe-integration)
6. [Order Creation](#order-creation)
7. [Error Handling](#error-handling)

---

## Architecture Overview

The checkout process consists of several key components:

```
┌─────────────────┐
│   Cart Store    │  (Zustand - Client-side state)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Checkout View  │  (UI Component)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Purchase Button │  (Triggers Stripe Checkout)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Stripe Checkout │  (External Payment Processing)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Stripe Webhook  │  (Order Creation)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Orders Table   │  (Database)
└─────────────────┘
```

---

## User Journey

### Step 1: Add to Cart
- **Location**: Product detail page (`/products/[productId]`)
- **Component**: `CartButton` (`src/modules/products/ui/components/cart-button.tsx`)
- **Action**: User clicks "Add to cart"
- **Result**: Product ID is stored in Zustand cart store (`use-cart-store.ts`)

### Step 2: View Cart
- **Location**: Checkout page (`/checkout`)
- **Component**: `CheckoutView` (`src/modules/checkout/ui/views/checkout-view.tsx`)
- **Action**: User navigates to checkout page
- **Result**: 
  - Fetches product details via `trpc.checkout.getProducts.useQuery()`
  - Displays cart items with prices
  - Shows subtotal

### Step 3: Proceed to Checkout
- **Location**: Checkout page sidebar
- **Component**: `CheckoutSidebar` (`src/modules/checkout/ui/components/checkout-sidebar.tsx`)
- **Action**: User clicks "Proceed to checkout" button
- **Result**: 
  - Calls `trpc.checkout.purchase.useMutation()`
  - Redirects to Stripe Checkout page

### Step 4: Payment Processing
- **Location**: Stripe hosted checkout page
- **Action**: User enters payment details and completes payment
- **Result**: 
  - Stripe processes payment
  - Stripe sends webhook event to our server

### Step 5: Order Creation
- **Location**: Webhook endpoint (`/api/stripe/webhook`)
- **Action**: Stripe webhook handler processes `checkout.session.completed` event
- **Result**: 
  - Order(s) created in database
  - User redirected back to success page

---

## Component Flow

### 1. Cart Management

**File**: `src/modules/checkout/store/use-cart-store.ts`

```typescript
// Cart state stored in Zustand with localStorage persistence
{
  productIds: string[]  // Array of product IDs in cart
}
```

**Key Methods**:
- `addProduct(productId)` - Add product to cart
- `removeProduct(productId)` - Remove product from cart
- `toggleProduct(productId)` - Toggle product in/out of cart
- `clearCart()` - Empty cart
- `getCartCount()` - Get total items in cart
- `isProductInCart(productId)` - Check if product is in cart

**Hook**: `src/modules/checkout/hooks/use-cart.ts`
- Provides React hook interface to cart store
- Used by components to interact with cart

### 2. Checkout View

**File**: `src/modules/checkout/ui/views/checkout-view.tsx`

**Responsibilities**:
- Display cart items
- Show product details (image, name, price)
- Calculate and display subtotal
- Handle purchase mutation
- Redirect to Stripe checkout

**Key Features**:
- Fetches products via `trpc.checkout.getProducts.useQuery()`
- Displays loading state
- Shows empty cart message
- Handles purchase mutation with redirect to Stripe

### 3. Purchase Procedure

**File**: `src/modules/checkout/server/procedures.ts`

**Procedure**: `purchase`

**Input**:
```typescript
{
  productIds: string[]  // Array of product IDs to purchase
  buyNow?: boolean     // Optional flag for "Buy Now" purchases
}
```

**Process**:
1. Validates products exist and are not archived
2. Creates Stripe line items from products
3. Creates Stripe checkout session with:
   - Customer email (from authenticated user)
   - Success URL: `/checkout?success=true` (or with buyNow params)
   - Cancel URL: `/checkout?cancel=true`
   - Metadata: `userId`, `productIds`, and `buyNow` flag
4. Returns Stripe checkout URL

**Output**:
```typescript
{
  url: string  // Stripe checkout session URL
}
```

### 4. Stripe Checkout Session

**Configuration**:
- **Mode**: `payment` (one-time payment)
- **Currency**: `usd`
- **Invoice Creation**: Enabled
- **Metadata**: 
  - `userId`: Authenticated user ID
  - `productIds`: Comma-separated list of product IDs
  - `buyNow`: "true" or "false" string

**Line Items**:
- Each product becomes a line item
- Price converted from dollars to cents (Stripe requirement)
- Product metadata includes: `id`, `name`, `price`

---

## Technical Implementation

### Frontend Flow

```typescript
// 1. User clicks "Proceed to checkout"
const purchase = trpc.checkout.purchase.useMutation({
  onSuccess: (data) => {
    if (data.url) {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    }
  }
});

// 2. Trigger mutation
purchase.mutate({ productIds: cart.productIds });
```

### Backend Flow

```typescript
// 1. Validate products
const products = await ctx.db.find({
  collection: "products",
  where: {
    id: { in: input.productIds },
    isArchived: { not_equals: true }
  }
});

// 2. Create Stripe line items
const lineItems = products.docs.map((product) => ({
  quantity: 1,
  price_data: {
    unit_amount: Math.round(product.price * 100),
    currency: "usd",
    product_data: {
      name: product.name,
      metadata: { id, name, price }
    }
  }
}));

// 3. Create Stripe checkout session
const checkout = await stripe.checkout.sessions.create({
  customer_email: ctx.session.user.email,
  success_url: `${APP_URL}/checkout?success=true`,
  cancel_url: `${APP_URL}/checkout?cancel=true`,
  mode: "payment",
  line_items: lineItems,
  metadata: { userId, productIds }
});

// 4. Return checkout URL
return { url: checkout.url };
```

---

## Stripe Integration

### Environment Variables

```bash
STRIPE_SECRET_KEY=sk_...          # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...    # Webhook signing secret
```

### Stripe Instance

**File**: `src/lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});
```

### Webhook Endpoint

**File**: `src/app/api/stripe/webhook/route.ts`

**Route**: `POST /api/stripe/webhook`

**Process**:
1. Receive webhook event from Stripe
2. Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
3. Handle event based on type:
   - `checkout.session.completed` → Create orders
   - `payment_intent.succeeded` → Log success
   - `payment_intent.payment_failed` → Log failure

**Security**:
- Signature verification prevents unauthorized requests
- Only processes events from Stripe

---

## Order Creation

### Webhook Handler

When `checkout.session.completed` event is received:

```typescript
// 1. Extract metadata from session
const userId = session.metadata?.userId;
const productIds = session.metadata?.productIds?.split(",") || [];

// 2. Create order for each product
for (const productId of productIds) {
  const product = await payload.findByID({
    collection: "products",
    id: productId
  });

  await payload.db.create({
    collection: "orders",
    data: {
      name: `Order for ${product.name}`,
      user: userId,
      product: productId,
      stripeCheckoutSessionId: session.id,
      stripeAccountId: session.account || null,
    }
  });
}
```

### Order Schema

**Collection**: `src/collections/Orders.ts`

**Fields**:
- `name`: Order name (e.g., "Order for Product Name")
- `user`: Relationship to Users collection
- `product`: Relationship to Products collection
- `stripeCheckoutSessionId`: Stripe checkout session ID
- `stripeAccountId`: Stripe account ID (optional)

---

## Error Handling

### Frontend Errors

**Checkout View** (`checkout-view.tsx`):
```typescript
const purchase = trpc.checkout.purchase.useMutation({
  onError: (error) => {
    if (error.data?.code === "UNAUTHORIZED") {
      router.push("/sign-in");
    }
    toast.error(error.message);
  }
});
```

### Backend Errors

**Purchase Procedure**:
- `NOT_FOUND`: Products not found or archived
- `INTERNAL_SERVER_ERROR`: Failed to create checkout session
- `UNAUTHORIZED`: User not authenticated

**Webhook Handler**:
- `400`: Invalid signature or missing metadata
- `500`: Failed to create orders

### Common Issues

1. **Products not found**
   - Cause: Product IDs don't exist or products are archived
   - Solution: Validate products before creating checkout session

2. **Webhook signature verification fails**
   - Cause: Wrong webhook secret or request not from Stripe
   - Solution: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

3. **Orders not created**
   - Cause: Webhook handler error or missing metadata
   - Solution: Check webhook logs and verify session metadata

---

## Testing the Checkout Process

### Local Development

1. **Start Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Add products to cart**:
   - Navigate to product page
   - Click "Add to cart"

3. **Go to checkout**:
   - Navigate to `/checkout`
   - Verify products are displayed

4. **Test purchase**:
   - Click "Proceed to checkout"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Complete payment

5. **Verify order creation**:
   - Check webhook logs
   - Verify order in database

### Production

1. **Configure webhook in Stripe Dashboard**:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

2. **Test with real payment**:
   - Use test mode first
   - Verify orders are created
   - Check error handling

---

## Related Files

### Frontend
- `src/modules/checkout/store/use-cart-store.ts` - Cart state management
- `src/modules/checkout/hooks/use-cart.ts` - Cart React hook
- `src/modules/checkout/ui/views/checkout-view.tsx` - Checkout page
- `src/modules/checkout/ui/components/checkout-item.tsx` - Cart item component
- `src/modules/checkout/ui/components/checkout-sidebar.tsx` - Checkout sidebar
- `src/modules/products/ui/components/cart-button.tsx` - Add to cart button

### Backend
- `src/modules/checkout/server/procedures.ts` - Checkout tRPC procedures
- `src/app/api/stripe/webhook/route.ts` - Stripe webhook handler
- `src/collections/Orders.ts` - Orders collection schema
- `src/lib/stripe.ts` - Stripe client instance

### Types
- `src/modules/checkout/types.ts` - Checkout-related TypeScript types
- `src/payload-types.ts` - Auto-generated Payload types (includes Order)

---

## Summary

The checkout process follows this flow:

1. **Cart Management**: Products added to Zustand store (persisted in localStorage)
2. **Checkout Display**: Products fetched and displayed on checkout page
3. **Stripe Checkout**: Purchase mutation creates Stripe session and redirects user
4. **Payment Processing**: User completes payment on Stripe hosted page
5. **Webhook Processing**: Stripe sends webhook, orders are created in database
6. **Order Fulfillment**: Orders available via tRPC `orders` router

The entire process is type-safe, uses proper error handling, and follows security best practices with webhook signature verification.
