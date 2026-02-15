# Buy Now Feature - Process Flow Diagram

## Overview

This document illustrates the complete process flow for the "Buy Now" feature, from user interaction to order creation and cart management.

---

## Sequence Diagram - Buy Now Feature

This sequence diagram shows the complete flow of the "Buy Now" feature, from user click to order creation and cart management.

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant ProductPage as Product Page<br/>(product-view.tsx)
    participant tRPC as tRPC API<br/>(checkout.purchase)
    participant Stripe as Stripe Checkout
    participant Webhook as Stripe Webhook<br/>(/api/stripe/webhook)
    participant PayloadDB as Payload Database<br/>(Orders Collection)
    participant CheckoutPage as Checkout Page<br/>(checkout-view.tsx)
    participant CartStore as Cart Store<br/>(Zustand)

    User->>ProductPage: 1. Clicks "Buy Now" button
    activate ProductPage
    ProductPage->>ProductPage: 2. Set isBuyNowLoading = true
    ProductPage->>tRPC: 3. purchase.mutate({<br/>  productIds: [productId],<br/>  buyNow: true<br/>})
    activate tRPC
    
    Note over tRPC: 4. Validate product exists<br/>Check if archived
    
    tRPC->>tRPC: 5. Find product in database
    tRPC->>tRPC: 6. Build Stripe line items
    tRPC->>tRPC: 7. Build success URL:<br/>/checkout?success=true<br/>&buyNow=true<br/>&productIds=...
    
    tRPC->>Stripe: 8. Create checkout session<br/>(with metadata: userId,<br/>productIds, buyNow)
    activate Stripe
    Stripe-->>tRPC: 9. Return checkout URL
    deactivate Stripe
    tRPC-->>ProductPage: 10. Return { url: checkoutUrl }
    deactivate tRPC
    
    ProductPage->>ProductPage: 11. Set isBuyNowLoading = false
    ProductPage->>Stripe: 12. window.location.href = checkoutUrl<br/>(Redirect to Stripe)
    deactivate ProductPage
    
    Note over User,Stripe: 13. User on Stripe Checkout Page<br/>Product still in cart
    
    User->>Stripe: 14. Enters payment details
    User->>Stripe: 15. Completes payment
    
    activate Stripe
    Stripe->>Stripe: 16. Process payment
    Stripe->>Stripe: 17. Payment successful
    Stripe->>Webhook: 18. POST /api/stripe/webhook<br/>Event: checkout.session.completed<br/>(with signature)
    deactivate Stripe
    activate Webhook
    
    Webhook->>Webhook: 19. Verify webhook signature
    Webhook->>Webhook: 20. Extract metadata:<br/>- userId<br/>- productIds<br/>- buyNow flag
    
    Webhook->>PayloadDB: 21. Find product by ID
    activate PayloadDB
    PayloadDB-->>Webhook: 22. Return product data
    deactivate PayloadDB
    
    Webhook->>PayloadDB: 23. Create order<br/>(payload.db.create)
    activate PayloadDB
    Note over PayloadDB: Order created with:<br/>- name: "Order for {product.name}"<br/>- user: userId<br/>- product: productId<br/>- stripeCheckoutSessionId
    PayloadDB-->>Webhook: 24. Order created successfully
    deactivate PayloadDB
    
    Webhook-->>Stripe: 25. Webhook processed (200 OK)
    deactivate Webhook
    
    Note over Stripe: 26. Order created in database
    
    Stripe->>CheckoutPage: 27. Redirect to success URL:<br/>/checkout?success=true<br/>&buyNow=true<br/>&productIds=...
    activate CheckoutPage
    
    CheckoutPage->>CheckoutPage: 28. useEffect detects<br/>states.success = true
    CheckoutPage->>CheckoutPage: 29. Parse URL parameters:<br/>- buyNow = true<br/>- productIds = "123"
    
    alt Buy Now Purchase Detected
        CheckoutPage->>CartStore: 30. removeProduct(productId)
        activate CartStore
        CartStore->>CartStore: 31. Remove product from<br/>productIds array
        CartStore->>CartStore: 32. Update localStorage
        CartStore-->>CheckoutPage: 33. Cart updated
        deactivate CartStore
        CheckoutPage->>User: 34. Show toast:<br/>"Purchase completed!<br/>Item removed from cart."
    else Regular Checkout
        CheckoutPage->>CartStore: clearCart()
        CartStore->>CartStore: Clear entire cart
        CheckoutPage->>User: Show success message
    end
    
    CheckoutPage->>CheckoutPage: 35. Invalidate queries
    CheckoutPage->>User: 36. Redirect to homepage (/)
    deactivate CheckoutPage
    
    Note over User: 37. Purchase complete<br/>Product removed from cart<br/>Order exists in database
```

---

## Detailed Step-by-Step Flow

### Step 1: User Initiates Buy Now

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ Clicks "Buy Now" button
       ▼
┌─────────────────────────┐
│   Product Page          │
│  (product-view.tsx)     │
│                         │
│  - productId: "123"    │
│  - buyNow: true        │
└──────┬──────────────────┘
       │
       │ handleBuyNow()
       │ buyNow.mutate({
       │   productIds: [productId],
       │   buyNow: true
       │ })
       ▼
```

### Step 2: API Request to tRPC

```
┌─────────────────────────┐
│   tRPC Procedure       │
│  (checkout.purchase)   │
│                         │
│  1. Validate product   │
│  2. Create Stripe      │
│     checkout session   │
│  3. Build success URL  │
│     with buyNow flag   │
└──────┬──────────────────┘
       │
       │ Success URL:
       │ /checkout?success=true
       │ &buyNow=true
       │ &productIds=123
       ▼
```

### Step 3: Stripe Checkout

```
┌─────────────────────────┐
│   Stripe Checkout      │
│                         │
│  - User enters payment │
│  - Completes payment   │
│  - Payment processed   │
└──────┬──────────────────┘
       │
       │ Payment successful
       │ Triggers webhook
       ▼
```

### Step 4: Webhook Processing

```
┌─────────────────────────┐
│   Stripe Webhook       │
│  /api/stripe/webhook   │
│                         │
│  1. Verify signature   │
│  2. Extract metadata:  │
│     - userId           │
│     - productIds       │
│     - buyNow flag      │
│  3. Create order(s)    │
└──────┬──────────────────┘
       │
       │ payload.db.create({
       │   collection: "orders",
       │   data: { ... }
       │ })
       ▼
┌─────────────────────────┐
│   Payload Database     │
│                         │
│  Order Created:        │
│  - name: "Order for..."│
│  - user: userId        │
│  - product: productId   │
│  - stripeSessionId     │
└─────────────────────────┘
```

### Step 5: Success Redirect & Cart Management

```
┌─────────────────────────┐
│   Checkout Page        │
│  (checkout-view.tsx)   │
│                         │
│  URL Params:           │
│  - success=true        │
│  - buyNow=true         │
│  - productIds=123      │
└──────┬──────────────────┘
       │
       │ useEffect detects
       │ buyNow flag
       ▼
┌─────────────────────────┐
│   Cart Store           │
│  (use-cart-store.ts)   │
│                         │
│  removeProduct(123)    │
│  → Removes from cart   │
└─────────────────────────┘
       │
       │ Redirect to /
       ▼
┌─────────────┐
│  Homepage   │
└─────────────┘
```

---

## State Flow Diagram

```mermaid
stateDiagram-v2
    [*] --> ProductPage: User views product
    
    ProductPage --> Loading: Click "Buy Now"
    Loading --> StripeCheckout: Redirect to Stripe
    Loading --> Error: API Error
    Error --> ProductPage: Show error message
    
    StripeCheckout --> PaymentProcessing: User enters payment
    PaymentProcessing --> PaymentSuccess: Payment succeeds
    PaymentProcessing --> PaymentCancelled: User cancels
    PaymentCancelled --> ProductPage: Return to product
    
    PaymentSuccess --> WebhookTriggered: Stripe sends webhook
    WebhookTriggered --> OrderCreated: Webhook creates order
    OrderCreated --> SuccessRedirect: Redirect with success params
    
    SuccessRedirect --> CartRemoval: Detect buyNow flag
    CartRemoval --> Homepage: Remove product & redirect
    Homepage --> [*]
```

---

## Data Flow Diagram

```mermaid
flowchart TD
    A[User clicks Buy Now] --> B[Product Page]
    B --> C{Is authenticated?}
    C -->|No| D[Redirect to Sign In]
    C -->|Yes| E[Call tRPC purchase mutation]
    
    E --> F[Validate Product]
    F --> G{Product exists?}
    G -->|No| H[Show error]
    G -->|Yes| I[Create Stripe Session]
    
    I --> J[Build Success URL]
    J --> K["/checkout?success=true&buyNow=true&productIds=123"]
    
    K --> L[Redirect to Stripe]
    L --> M[User completes payment]
    
    M --> N[Stripe sends webhook]
    N --> O[Webhook verifies signature]
    O --> P[Extract metadata]
    P --> Q[Create order in database]
    
    Q --> R[Order created successfully]
    R --> S[Stripe redirects to success URL]
    
    S --> T[Checkout page loads]
    T --> U{Check buyNow flag?}
    U -->|Yes| V[Remove product from cart]
    U -->|No| W[Clear entire cart]
    
    V --> X[Show success message]
    W --> X
    X --> Y[Redirect to homepage]
    
    style A fill:#e1f5ff
    style Q fill:#c8e6c9
    style V fill:#fff9c4
    style Y fill:#f3e5f5
```

---

## Key Decision Points

### 1. Authentication Check
```
User clicks "Buy Now"
    │
    ├─→ Not authenticated → Redirect to /sign-in
    │
    └─→ Authenticated → Proceed to checkout
```

### 2. Product Validation
```
tRPC receives request
    │
    ├─→ Product not found → Return error
    │
    ├─→ Product archived → Return error
    │
    └─→ Product valid → Create Stripe session
```

### 3. Payment Outcome
```
Stripe payment
    │
    ├─→ Payment succeeds → Webhook triggered
    │
    ├─→ Payment fails → Return to checkout with error
    │
    └─→ User cancels → Return to checkout with cancel=true
```

### 4. Cart Management
```
Success redirect received
    │
    ├─→ buyNow=true → Remove only purchased product
    │
    └─→ buyNow=false → Clear entire cart
```

---

## Error Handling Flow

```mermaid
flowchart TD
    A[Buy Now Clicked] --> B{API Call}
    B -->|Success| C[Redirect to Stripe]
    B -->|Error| D{Error Type}
    
    D -->|UNAUTHORIZED| E[Redirect to Sign In]
    D -->|NOT_FOUND| F[Show error toast]
    D -->|INTERNAL_ERROR| G[Show error toast]
    
    C --> H{Payment}
    H -->|Success| I[Webhook processes]
    H -->|Cancel| J[Return to product]
    H -->|Failed| K[Return to checkout]
    
    I --> L{Webhook Success?}
    L -->|Yes| M[Order created]
    L -->|No| N[Log error, order not created]
    
    M --> O[Remove from cart]
    N --> P[Keep in cart]
    
    style E fill:#ffcdd2
    style F fill:#ffcdd2
    style G fill:#ffcdd2
    style M fill:#c8e6c9
    style N fill:#ffcdd2
```

---

## Component Interaction Diagram

```mermaid
graph TB
    subgraph "Product Page"
        A[BuyNowButton]
        B[handleBuyNow]
        C[buyNow Mutation]
    end
    
    subgraph "API Layer"
        D[tRPC purchase]
        E[Stripe API]
    end
    
    subgraph "Payment"
        F[Stripe Checkout]
        G[Webhook Handler]
    end
    
    subgraph "Database"
        H[Payload Orders]
    end
    
    subgraph "Checkout Page"
        I[CheckoutView]
        J[useEffect Success Handler]
    end
    
    subgraph "State Management"
        K[Cart Store]
        L[removeProduct]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    F --> I
    I --> J
    J --> L
    L --> K
    
    style A fill:#e3f2fd
    style D fill:#f3e5f5
    style F fill:#fff9c4
    style H fill:#c8e6c9
    style K fill:#e1f5ff
```

---

## Timeline View

```
Time    │ Action                          │ State Change
────────┼─────────────────────────────────┼────────────────────────────
T0      │ User clicks "Buy Now"          │ isBuyNowLoading = true
T1      │ API call initiated             │ Mutation pending
T2      │ Stripe session created         │ Returns checkout URL
T3      │ Redirect to Stripe             │ isBuyNowLoading = false
T4      │ User on Stripe checkout        │ Product still in cart
T5      │ User completes payment         │ Payment processing
T6      │ Stripe sends webhook           │ Webhook received
T7      │ Order created in database      │ Order exists
T8      │ Redirect to success URL        │ URL params: buyNow=true
T9      │ Checkout page detects buyNow   │ Parses productIds
T10     │ Remove product from cart       │ Cart updated
T11     │ Redirect to homepage           │ Purchase complete
```

---

## Key URLs and Parameters

### Success URL (Buy Now)
```
/checkout?success=true&buyNow=true&productIds=69848c249fc4f3f2a7848628
```

### Success URL (Regular Checkout)
```
/checkout?success=true
```

### Cancel URL
```
/checkout?cancel=true
```

### Stripe Metadata
```json
{
  "userId": "user_123",
  "productIds": "69848c249fc4f3f2a7848628",
  "buyNow": "true"
}
```

---

## Summary

The "Buy Now" feature follows this flow:

1. **Initiation**: User clicks "Buy Now" → API call with `buyNow: true`
2. **Payment**: Redirect to Stripe → User completes payment
3. **Order Creation**: Webhook receives event → Creates order in database
4. **Cart Management**: Success redirect → Detects `buyNow` flag → Removes only purchased product
5. **Completion**: Redirect to homepage → Purchase complete

**Key Difference from Regular Checkout:**
- Regular checkout clears entire cart
- Buy Now removes only the purchased product(s)

This ensures that if a user has multiple items in their cart and uses "Buy Now" for one item, only that item is removed after successful purchase, while other items remain in the cart.
