# Indian Boutique E-Commerce - TODO List
## For US Market (Selling Indian Products in USA)

> **Note**: This platform is for selling Indian boutique products to US customers

## ✅ Completed Features

The following features have been implemented:
- ✅ Product Variants & Inventory (sizes, colors, stock tracking, out-of-stock prevention, inventory updates)
- ✅ Shipping Address Management (US addresses, validation, multiple addresses, address selection)
- ✅ Order Management & Status (status workflow, order history page, order number generation, order tracking)
- ✅ Stripe Payment Integration (webhooks, payment processing)

---

## Priority 1: Core E-Commerce Features (Must Have)

### 1. Admin Order Management Dashboard
- [ ] Create admin order management dashboard (`/admin/orders`)
- [ ] Add order filtering and search
- [ ] Add bulk order status updates
- [ ] Add order export functionality

**Files to create:**
- `src/app/(app)/admin/orders/page.tsx` - Admin order management dashboard
- `src/modules/admin/ui/components/order-management-table.tsx` - Order table component

---

### 2. Additional Payment Methods
- [ ] Add Apple Pay option (popular in US)
- [ ] Add Google Pay option
- [ ] Add PayPal option (optional, many US customers prefer it)

**Files to create/modify:**
- `src/modules/checkout/ui/components/payment-methods.tsx` - Payment method selector
- `src/lib/stripe.ts` - Enhance with Apple Pay/Google Pay support

---

## Priority 2: User Experience Features (Should Have)

### 3. Reviews & Ratings
- [ ] Create Reviews collection (product, user, rating, comment, images)
- [ ] Add review submission form (only for purchased products)
- [ ] Display reviews on product page
- [ ] Calculate and show average rating
- [ ] Add review moderation (admin approval)

**Files to create:**
- `src/collections/Reviews.ts` - New collection
- `src/modules/reviews/ui/components/review-form.tsx` - New component
- `src/modules/reviews/ui/components/review-list.tsx` - New component
- `src/modules/products/server/procedures.ts` - Add review aggregation

---

### 4. Wishlist/Favorites
- [ ] Add wishlist field to Users collection
- [ ] Create wishlist page (`/wishlist`)
- [ ] Add "Add to Wishlist" button on product page
- [ ] Show wishlist count in navbar
- [ ] Quick add to cart from wishlist

**Files to create/modify:**
- `src/collections/Users.ts` - Add wishlist array field
- `src/app/(app)/wishlist/page.tsx` - Wishlist page
- `src/modules/products/ui/components/wishlist-button.tsx` - New component
- `src/modules/wishlist/server/procedures.ts` - Wishlist tRPC procedures

---

### 5. Coupon & Discount System
- [ ] Create Coupons collection (code, discount type, value, expiry, usage limit)
- [ ] Add coupon code input at checkout
- [ ] Apply discount to order total
- [ ] Validate coupon codes
- [ ] Track coupon usage per user

**Files to create:**
- `src/collections/Coupons.ts` - New collection
- `src/modules/checkout/ui/components/coupon-input.tsx` - New component
- `src/modules/checkout/server/procedures.ts` - Add coupon validation

---

### 6. Email Notifications
- [ ] Order confirmation email
- [ ] Order shipped notification
- [ ] Order delivered confirmation
- [ ] Password reset emails
- [ ] Welcome email for new users

**Files to create:**
- `src/lib/email.ts` - Email service (using Resend, SendGrid, or similar)
- `src/app/api/orders/[id]/notify/route.ts` - Order notification endpoint
- Email templates in `src/templates/emails/`

---

## Priority 3: Business Features (Nice to Have)

### 7. US Sales Tax Calculation
- [ ] Integrate tax calculation API (TaxJar, Avalara, or Stripe Tax)
- [ ] Calculate sales tax based on shipping address (state-specific)
- [ ] Handle tax-exempt states (if applicable)
- [ ] Show itemized breakdown (subtotal, tax, shipping, total)
- [ ] Store tax amount with each order
- [ ] Handle tax for different product categories (if rates differ)

**Files to create/modify:**
- `src/lib/tax-calculation.ts` - Tax calculation service
- `src/collections/Orders.ts` - Add tax fields (if not already present)
- `src/modules/checkout/server/procedures.ts` - Add tax calculation
- `src/modules/checkout/ui/views/checkout-view.tsx` - Show tax breakdown (currently using placeholder 8%)

---

### 8. US Shipping Cost Calculation
- [ ] Add US shipping zones (based on state/zipcode)
- [ ] Integrate shipping API (USPS, FedEx, UPS) or use flat rates
- [ ] Calculate shipping cost based on weight/distance
- [ ] Express delivery option (2-day, overnight)
- [ ] International shipping option (if needed)
- [ ] Show estimated delivery dates
- [ ] Note: Free shipping threshold ($75) already implemented

**Files to create:**
- `src/collections/ShippingZones.ts` - US shipping zones collection
- `src/lib/shipping.ts` - Shipping cost calculator (US-focused)
- `src/modules/checkout/server/procedures.ts` - Add shipping calculation
- `src/modules/checkout/ui/components/shipping-options.tsx` - Shipping method selector

---

### 9. Product Size Guide (US/Indian Conversion)
- [ ] Add size chart images for clothing
- [ ] Size guide modal on product page
- [ ] US to Indian size conversion chart
- [ ] Measurement instructions (inches and cm)
- [ ] Size recommendation based on user input
- [ ] Note about Indian sizing vs US sizing

**Files to create:**
- `src/modules/products/ui/components/size-guide.tsx` - New component
- `src/collections/Products.ts` - Add size guide image field
- `src/lib/size-conversion.ts` - US/Indian size conversion utilities

---

### 10. Multiple Product Images Gallery Enhancement
- [ ] Enhance product image gallery with carousel functionality
- [ ] Add zoom functionality on hover
- [ ] Improve thumbnail navigation (currently basic implementation exists)
- [ ] Add image lazy loading
- [ ] Use existing images array from Products collection

**Files to modify:**
- `src/modules/products/ui/components/product-view.tsx` - Enhance image gallery

---

## Priority 4: Admin & Analytics

### 11. Admin Dashboard
- [ ] Sales overview (revenue, orders, customers)
- [ ] Recent orders table
- [ ] Low stock alerts
- [ ] Product performance metrics
- [ ] Customer analytics

**Files to create:**
- `src/app/(app)/admin/dashboard/page.tsx` - Admin dashboard
- `src/modules/admin/ui/components/stats-cards.tsx` - New component
- `src/modules/admin/server/procedures.ts` - Analytics queries

---

### 12. Inventory Management
- [ ] Low stock notifications
- [ ] Bulk stock update
- [ ] Stock history tracking
- [ ] Restock alerts

**Files to create:**
- `src/app/(app)/admin/inventory/page.tsx` - Inventory management page
- `src/modules/admin/server/procedures.ts` - Stock management procedures

---

## Priority 5: Mobile & Performance

### 13. Mobile Optimization
- [ ] Responsive design improvements
- [ ] Mobile-first checkout flow
- [ ] Touch-friendly buttons and inputs
- [ ] Mobile payment optimization

---

### 14. Search & Filters Enhancement
- [ ] Advanced search with filters (price range, size, color, category)
- [ ] Search suggestions/autocomplete
- [ ] Recently viewed products
- [ ] Product recommendations

**Files to modify:**
- `src/modules/products/ui/components/product-filters.tsx` - Enhance existing
- `src/modules/products/server/procedures.ts` - Add advanced filtering

---

## Quick Wins (Can be done quickly)

1. **Enhance product image gallery** - Add carousel and zoom to existing basic gallery
2. **Add US sales tax calculation** - Use Stripe Tax API (easiest)
3. **Add wishlist button** - Simple toggle functionality
4. **Add "Made in India" badge** - Marketing differentiator
5. **Add estimated delivery date** - Show shipping timeline
6. **Add size guide modal** - Quick implementation for product pages

---

## Notes for US Market (Selling Indian Products)

### Payment & Currency
- **Payment**: ✅ Stripe already integrated (perfect for US market)
- **Currency**: ✅ USD already implemented
- **Additional Options**: Apple Pay, Google Pay, PayPal (pending)

### Tax & Compliance
- **Sales Tax**: Varies by state (0% to ~10%), use Stripe Tax API (easiest) or TaxJar
- **Tax Nexus**: Only charge tax in states where you have nexus
- **No GST**: Not applicable for US sales
- **Current**: Placeholder 8% tax in checkout (needs proper calculation)

### Shipping
- **Address Format**: ✅ US format (street, city, state, zipcode) - Implemented
- **Carriers**: USPS (cheapest), FedEx, UPS (faster, more expensive)
- **Options**: Flat rate, weight-based, or carrier API integration
- **Free Shipping**: ✅ $75 threshold implemented
- **International**: If shipping from India, consider customs/duties notice

### Product Information
- **Size Charts**: Include US to Indian size conversion (important!)
- **Product Origin**: Clearly label "Made in India" or "Handcrafted in India" (marketing advantage)
- **Measurements**: Show in both inches and cm
- **Care Instructions**: Important for boutique clothing

### Customer Expectations
- **Return Policy**: 30-day returns standard in US
- **Shipping Speed**: US customers expect 3-7 day shipping
- **Customer Service**: Email/chat support expected
- **Reviews**: Very important for trust in US market

### Legal Considerations
- **Terms of Service**: Required for US e-commerce
- **Privacy Policy**: Required (GDPR-like compliance)
- **Refund Policy**: Must be clearly stated
- **International Orders**: If shipping from India, customs info required

---

## Estimated Timeline

- **Priority 1** (Remaining core features): 1-2 weeks
- **Priority 2** (UX features): 3-4 weeks
- **Priority 3** (Business features): 2-3 weeks
- **Priority 4** (Admin): 2 weeks
- **Priority 5** (Polish): Ongoing

**Total**: ~8-11 weeks for remaining features

---

**Last Updated**: 2024-12-19
