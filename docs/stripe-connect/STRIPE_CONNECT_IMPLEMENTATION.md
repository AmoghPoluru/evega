# Stripe Connect Implementation - Vendor Payouts & Platform Commission

## Overview

This document outlines the implementation plan for Stripe Connect, which enables:
- **Vendors** to have their own Stripe accounts (connected accounts)
- **Payments** to be split between vendor and platform automatically
- **Platform commission** to be collected on every transaction
- **Vendor payouts** to go directly to their Stripe account

## Architecture

### Payment Flow
1. Customer purchases product(s)
2. Payment is processed through Stripe Connect
3. Platform commission is deducted automatically
4. Remaining amount is transferred to vendor's Stripe account
5. Both platform and vendor receive funds in their respective accounts

### Stripe Connect Models
- **Direct Charges**: Platform charges customer, then transfers to vendor (simpler, recommended)
- **Destination Charges**: Charge goes directly to vendor, platform takes application fee (more complex)

**Recommended**: Direct Charges (easier to implement and manage)

---

## Implementation Tasks

### Phase 1: Stripe Connect Setup & Configuration

#### 1.1 Stripe Account Setup
- [ ] **Task 1.1.1**: Create Stripe Connect account for platform
  - **Tech**: Sign up for Stripe Connect at https://dashboard.stripe.com/connect
  - **Details**: Enable Connect platform, get platform account ID
  - **Status**: ❌ Not started

- [ ] **Task 1.1.2**: Configure Stripe Connect settings
  - **Tech**: Set up Connect settings in Stripe Dashboard
  - **Details**: Configure branding, terms of service, privacy policy URLs
  - **Status**: ❌ Not started

- [ ] **Task 1.1.3**: Add Stripe Connect environment variables
  - **Tech**: Add to `.env.local` and `.env.production`
  - **Details**: 
    ```env
    STRIPE_SECRET_KEY=sk_... (existing)
    STRIPE_PUBLISHABLE_KEY=pk_... (existing)
    STRIPE_WEBHOOK_SECRET=whsec_... (existing)
    STRIPE_CONNECT_CLIENT_ID=ca_... (new - for OAuth)
    STRIPE_PLATFORM_ACCOUNT_ID=acct_... (new - platform account)
    ```
  - **Status**: ❌ Not started

#### 1.2 Vendor Collection Updates
- [ ] **Task 1.2.1**: Add Stripe Connect fields to Vendors collection
  - **Tech**: Update `src/collections/Vendors.ts`
  - **Details**: Add fields:
    ```typescript
    {
      name: "stripeAccountId",
      type: "text",
      label: "Stripe Account ID",
      admin: {
        description: "Stripe Connect account ID for this vendor",
        readOnly: true,
      },
    },
    {
      name: "stripeAccountStatus",
      type: "select",
      label: "Stripe Account Status",
      options: [
        { label: "Not Connected", value: "not_connected" },
        { label: "Pending", value: "pending" },
        { label: "Active", value: "active" },
        { label: "Restricted", value: "restricted" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "not_connected",
    },
    {
      name: "stripeOnboardingLink",
      type: "text",
      label: "Stripe Onboarding Link",
      admin: {
        description: "Link for vendor to complete Stripe onboarding",
        readOnly: true,
      },
    },
    {
      name: "stripeOnboardingCompleted",
      type: "checkbox",
      label: "Stripe Onboarding Completed",
      defaultValue: false,
    },
    ```
  - **Status**: ❌ Not started

- [ ] **Task 1.2.2**: Add access control for Stripe fields
  - **Tech**: Update Vendors collection access control
  - **Details**: Only super admins can view/edit Stripe account details
  - **Status**: ❌ Not started

#### 1.3 Platform Configuration
- [ ] **Task 1.3.1**: Create platform Stripe account configuration
  - **Tech**: Create `src/lib/stripe-connect.ts`
  - **Details**: Export Stripe instance with Connect configuration
  - **Status**: ❌ Not started

- [ ] **Task 1.3.2**: Add platform commission configuration
  - **Tech**: Store platform commission rate (default 10%)
  - **Details**: Can be overridden per vendor via `commissionRate` field (already exists)
  - **Status**: ⚠️ Partially done (vendor commissionRate exists)

---

### Phase 2: Vendor Onboarding to Stripe Connect

#### 2.1 Vendor Stripe Account Creation
- [ ] **Task 2.1.1**: Create API endpoint for Stripe Connect account creation
  - **Tech**: Create `src/app/api/stripe/connect/create-account/route.ts`
  - **Details**: 
    - Create Stripe Connect account for vendor
    - Store `stripeAccountId` in vendor document
    - Return onboarding link
  - **Status**: ❌ Not started

- [ ] **Task 2.1.2**: Create tRPC procedure for account creation
  - **Tech**: Create `src/modules/vendor/server/procedures.ts` (if not exists)
  - **Details**: 
    ```typescript
    createStripeAccount: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Check if vendor exists
        // Create Stripe Connect account
        // Store account ID
        // Generate onboarding link
      })
    ```
  - **Status**: ❌ Not started

- [ ] **Task 2.2.1**: Create vendor onboarding page
  - **Tech**: Create `src/app/(app)/vendor/stripe-onboarding/page.tsx`
  - **Details**: 
    - Show "Connect Stripe Account" button
    - Display onboarding status
    - Redirect to Stripe onboarding if needed
  - **Status**: ❌ Not started

#### 2.2 Stripe Onboarding Flow
- [ ] **Task 2.2.1**: Generate Stripe onboarding link
  - **Tech**: Use `stripe.accountLinks.create()`
  - **Details**: 
    ```typescript
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/vendor/stripe-onboarding?refresh=true`,
      return_url: `${baseUrl}/vendor/stripe-onboarding?success=true`,
      type: 'account_onboarding',
    });
    ```
  - **Status**: ❌ Not started

- [ ] **Task 2.2.2**: Handle Stripe onboarding callback
  - **Tech**: Create callback handler in onboarding page
  - **Details**: 
    - Check `success` query param
    - Verify account status via webhook or API
    - Update vendor `stripeAccountStatus` and `stripeOnboardingCompleted`
  - **Status**: ❌ Not started

- [ ] **Task 2.2.3**: Create webhook handler for account updates
  - **Tech**: Update `src/app/api/stripe/webhook/route.ts`
  - **Details**: Handle `account.updated` event to sync account status
  - **Status**: ❌ Not started

#### 2.3 Vendor Dashboard Integration
- [ ] **Task 2.3.1**: Add Stripe status to vendor dashboard
  - **Tech**: Update vendor dashboard to show Stripe connection status
  - **Details**: 
    - Show "Connected" / "Not Connected" status
    - Display "Complete Onboarding" button if pending
    - Show account restrictions if any
  - **Status**: ❌ Not started

- [ ] **Task 2.3.2**: Add Stripe account management page
  - **Tech**: Create `src/app/(app)/vendor/stripe-account/page.tsx`
  - **Details**: 
    - View Stripe account details
    - View payout schedule
    - View transaction history (link to Stripe Dashboard)
  - **Status**: ❌ Not started

---

### Phase 3: Payment Processing with Stripe Connect

#### 3.1 Update Checkout Flow
- [ ] **Task 3.1.1**: Modify checkout to use Stripe Connect
  - **Tech**: Update `src/modules/checkout/server/procedures.ts`
  - **Details**: 
    - Group cart items by vendor
    - Create separate checkout sessions per vendor (if multiple vendors)
    - OR create single session with application fees
  - **Status**: ❌ Not started

- [ ] **Task 3.1.2**: Implement Direct Charges with Transfers
  - **Tech**: Use `stripe.paymentIntents.create()` with transfers
  - **Details**: 
    ```typescript
    // Option 1: Direct Charges (Recommended)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: 'usd',
      transfer_data: {
        destination: vendor.stripeAccountId,
        amount: vendorPayout * 100, // Amount to vendor
      },
      application_fee_amount: commission * 100, // Platform commission
    });
    ```
  - **Status**: ❌ Not started

- [ ] **Task 3.1.3**: Handle multi-vendor carts
  - **Tech**: Split cart by vendor, create separate payment intents
  - **Details**: 
    - Group items by `product.vendor`
    - Calculate commission per vendor
    - Create separate orders per vendor
    - Create separate payment intents per vendor
  - **Status**: ❌ Not started

#### 3.2 Webhook Updates
- [ ] **Task 3.2.1**: Update webhook to handle Connect transfers
  - **Tech**: Update `src/app/api/stripe/webhook/route.ts`
  - **Details**: 
    - Handle `payment_intent.succeeded` event
    - Verify transfer was successful
    - Update order with transfer ID
  - **Status**: ❌ Not started

- [ ] **Task 3.2.2**: Handle transfer webhook events
  - **Tech**: Add handlers for `transfer.created`, `transfer.paid`, `transfer.failed`
  - **Details**: 
    - Update order status based on transfer status
    - Notify vendor if transfer fails
  - **Status**: ❌ Not started

- [ ] **Task 3.2.3**: Handle account webhook events
  - **Tech**: Add handlers for `account.updated`, `account.application.deauthorized`
  - **Details**: 
    - Sync vendor Stripe account status
    - Handle account deauthorization
  - **Status**: ❌ Not started

#### 3.3 Order Updates
- [ ] **Task 3.3.1**: Add Stripe transfer fields to Orders collection
  - **Tech**: Update `src/collections/Orders.ts`
  - **Details**: Add fields:
    ```typescript
    {
      name: "stripePaymentIntentId",
      type: "text",
      label: "Stripe Payment Intent ID",
    },
    {
      name: "stripeTransferId",
      type: "text",
      label: "Stripe Transfer ID",
    },
    {
      name: "transferStatus",
      type: "select",
      label: "Transfer Status",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Failed", value: "failed" },
        { label: "Canceled", value: "canceled" },
      ],
    },
    ```
  - **Status**: ❌ Not started

- [ ] **Task 3.3.2**: Update order creation to include transfer info
  - **Tech**: Update webhook order creation
  - **Details**: Store `paymentIntentId`, `transferId`, `transferStatus`
  - **Status**: ❌ Not started

---

### Phase 4: Commission & Payout Management

#### 4.1 Commission Calculation
- [ ] **Task 4.1.1**: Verify commission calculation logic
  - **Tech**: Review existing commission calculation in webhook
  - **Details**: 
    - Commission = orderTotal * (vendor.commissionRate / 100)
    - VendorPayout = orderTotal - commission
    - Ensure calculations are correct
  - **Status**: ⚠️ Partially done (exists but needs verification)

- [ ] **Task 4.1.2**: Add platform-level commission override
  - **Tech**: Add platform commission rate configuration
  - **Details**: 
    - Default commission rate (e.g., 10%)
    - Can be overridden per vendor
    - Store in environment variable or config
  - **Status**: ❌ Not started

#### 4.2 Payout Tracking
- [ ] **Task 4.2.1**: Create payout tracking system
  - **Tech**: Create `src/modules/payouts/` module (optional)
  - **Details**: 
    - Track vendor payouts
    - Track platform commissions
    - Generate payout reports
  - **Status**: ❌ Not started

- [ ] **Task 4.2.2**: Add payout history to vendor dashboard
  - **Tech**: Create vendor payout history page
  - **Details**: 
    - Show list of payouts
    - Show payout status
    - Show commission deducted
  - **Status**: ❌ Not started

#### 4.3 Platform Commission Dashboard
- [ ] **Task 4.3.1**: Create platform commission dashboard
  - **Tech**: Create admin dashboard for commission tracking
  - **Details**: 
    - Total commission earned
    - Commission by vendor
    - Commission by time period
  - **Status**: ❌ Not started

---

### Phase 5: Error Handling & Edge Cases

#### 5.1 Vendor Account Validation
- [ ] **Task 5.1.1**: Validate vendor has Stripe account before checkout
  - **Tech**: Add validation in checkout procedure
  - **Details**: 
    - Check if vendor has `stripeAccountId`
    - Check if account status is "active"
    - Prevent checkout if account not ready
  - **Status**: ❌ Not started

- [ ] **Task 5.1.2**: Handle restricted/rejected accounts
  - **Tech**: Add error handling for restricted accounts
  - **Details**: 
    - Show error message to customer
    - Notify vendor of account issues
    - Prevent checkout for restricted accounts
  - **Status**: ❌ Not started

#### 5.2 Transfer Failure Handling
- [ ] **Task 5.2.1**: Handle failed transfers
  - **Tech**: Add webhook handler for `transfer.failed`
  - **Details**: 
    - Update order status
    - Notify vendor
    - Notify platform admin
    - Attempt retry or manual intervention
  - **Status**: ❌ Not started

- [ ] **Task 5.2.2**: Handle refunds with Stripe Connect
  - **Tech**: Implement refund logic for Connect accounts
  - **Details**: 
    - Refund to customer
    - Reverse transfer to vendor
    - Deduct commission from platform
  - **Status**: ❌ Not started

#### 5.3 Multi-Vendor Edge Cases
- [ ] **Task 5.3.1**: Handle partial cart failures
  - **Tech**: Handle case where one vendor's payment fails
  - **Details**: 
    - Process successful vendor payments
    - Cancel failed vendor payments
    - Notify customer of partial failure
  - **Status**: ❌ Not started

- [ ] **Task 5.3.2**: Handle vendor account changes during checkout
  - **Tech**: Validate vendor account status at payment time
  - **Details**: 
    - Check account status before creating payment intent
    - Handle account deauthorization
  - **Status**: ❌ Not started

---

### Phase 6: Testing & Documentation

#### 6.1 Testing
- [ ] **Task 6.1.1**: Create unit tests for Stripe Connect functions
  - **Tech**: Test account creation, onboarding link generation
  - **Details**: Mock Stripe API calls, test error cases
  - **Status**: ❌ Not started

- [ ] **Task 6.1.2**: Create integration tests for payment flow
  - **Tech**: Test complete checkout flow with Connect
  - **Details**: Test commission calculation, transfer creation
  - **Status**: ❌ Not started

- [ ] **Task 6.1.3**: Test webhook handlers
  - **Tech**: Test all webhook event handlers
  - **Details**: Test account updates, transfer events
  - **Status**: ❌ Not started

- [ ] **Task 6.1.4**: Test multi-vendor scenarios
  - **Tech**: Test cart with products from multiple vendors
  - **Details**: Verify separate orders, separate transfers
  - **Status**: ❌ Not started

#### 6.2 Documentation
- [ ] **Task 6.2.1**: Document Stripe Connect setup process
  - **Tech**: Create setup guide
  - **Details**: Step-by-step instructions for enabling Connect
  - **Status**: ❌ Not started

- [ ] **Task 6.2.2**: Document vendor onboarding process
  - **Tech**: Create vendor guide
  - **Details**: How vendors connect their Stripe account
  - **Status**: ❌ Not started

- [ ] **Task 6.2.3**: Document payment flow
  - **Tech**: Create technical documentation
  - **Details**: How payments are processed, commission calculated
  - **Status**: ❌ Not started

---

## Implementation Priority

### High Priority (Must Have)
1. ✅ Vendor Stripe account creation and onboarding
2. ✅ Payment processing with transfers
3. ✅ Commission calculation and tracking
4. ✅ Webhook handling for transfers

### Medium Priority (Should Have)
5. ⚠️ Multi-vendor cart handling
6. ⚠️ Vendor dashboard integration
7. ⚠️ Error handling and edge cases

### Low Priority (Nice to Have)
8. ⚠️ Payout tracking system
9. ⚠️ Platform commission dashboard
10. ⚠️ Advanced refund handling

---

## Technical Considerations

### Stripe Connect Account Types
- **Express Accounts**: Easier onboarding, less control (Recommended for MVP)
- **Standard Accounts**: More control, more complex onboarding
- **Custom Accounts**: Full control, most complex

**Recommendation**: Start with Express Accounts for MVP

### Payment Methods
- **Direct Charges**: Platform charges, transfers to vendor (Recommended)
- **Destination Charges**: Charge directly to vendor, platform takes fee

**Recommendation**: Direct Charges (simpler, better UX)

### Testing
- Use Stripe Test Mode for development
- Test with Stripe test accounts
- Use Stripe CLI for local webhook testing

---

## Environment Variables Required

```env
# Existing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# New for Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_...  # OAuth client ID
STRIPE_PLATFORM_ACCOUNT_ID=acct_...  # Platform account ID (optional)
PLATFORM_COMMISSION_RATE=10  # Default commission rate (%)
```

---

## Estimated Timeline

- **Phase 1**: 2-3 days (Setup & Configuration)
- **Phase 2**: 3-4 days (Vendor Onboarding)
- **Phase 3**: 4-5 days (Payment Processing)
- **Phase 4**: 2-3 days (Commission Management)
- **Phase 5**: 2-3 days (Error Handling)
- **Phase 6**: 2-3 days (Testing & Documentation)

**Total**: ~15-21 days

---

## Next Steps

1. Review this TODO list
2. Set up Stripe Connect account
3. Start with Phase 1 (Setup & Configuration)
4. Implement vendor onboarding (Phase 2)
5. Update payment processing (Phase 3)
6. Test thoroughly before production

---

**Last Updated**: Based on current codebase analysis
**Status**: Ready for review and implementation
