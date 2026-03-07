# How to Store/Sync Stripe Details Through Admin Dashboard

## Overview

You can now sync vendor Stripe account details directly from the Payload CMS admin dashboard. This allows you to fetch the latest information from Stripe API and update the vendor record with all account details.

---

## How to Use

### Step 1: Access Vendor in Admin Dashboard

1. Go to your admin dashboard: `http://localhost:3000/admin`
2. Navigate to **Collections** → **Vendors**
3. Click on a vendor that has a Stripe account connected

### Step 2: Find the Sync Button

1. In the vendor edit page, look for the **"Sync Stripe Account Details"** section in the **sidebar** (right side)
2. This button only appears if:
   - You are a super admin
   - The vendor has a `stripeAccountId` (Stripe account is created)

### Step 3: Sync Stripe Details

1. Click the **"Sync Stripe Details"** button
2. The button will show "Syncing..." while processing
3. After successful sync, you'll see a success message
4. The page will automatically reload to show updated details

---

## What Gets Synced

When you click "Sync Stripe Details", the following information is fetched from Stripe and stored in the vendor record:

### Account Status
- `stripeAccountStatus` - Current status (pending, active, restricted, rejected)
- `stripeOnboardingCompleted` - Whether onboarding is complete
- `stripeChargesEnabled` - Whether vendor can accept charges
- `stripePayoutsEnabled` - Whether vendor can receive payouts

### Account Information
- `stripeAccountCountry` - Country code (e.g., US, GB)
- `stripeAccountEmail` - Email associated with Stripe account

### Detailed Information (JSON)
- `stripeAccountDetails` - Full account details including:
  - Business type
  - Business profile (name, support email, phone, URL)
  - Capabilities (card payments, transfers)
  - Requirements (currently due, eventually due, past due)
  - Account creation date

---

## Visual Guide

### Before Sync
```
Vendor Edit Page
├── Basic Info
│   ├── Name: "ABC Store"
│   └── Email: "abc@example.com"
└── Sidebar
    ├── Stripe Account ID: acct_1234...
    ├── Stripe Account Status: pending
    └── [Sync Stripe Details] ← Click here
```

### After Sync
```
Vendor Edit Page (Reloaded)
├── Basic Info
│   └── ...
└── Sidebar
    ├── Stripe Account ID: acct_1234...
    ├── Stripe Account Status: active ← Updated
    ├── Charges Enabled: ✓ ← Updated
    ├── Payouts Enabled: ✓ ← Updated
    ├── Stripe Account Country: US ← Updated
    ├── Stripe Account Email: vendor@example.com ← Updated
    └── Stripe Account Details: {...} ← Full JSON updated
```

---

## When to Use

### ✅ Use Sync When:
- Vendor just completed Stripe onboarding
- You want to check current account status
- Account status seems outdated
- You need to verify capabilities (charges/payouts enabled)
- You want to see current requirements

### ⚠️ Automatic Sync Also Happens:
- When vendor checks status via `/vendor/stripe-onboarding`
- When `account.updated` webhook is received from Stripe
- So manual sync is usually not needed unless webhook failed

---

## Troubleshooting

### Button Not Showing?

**Check:**
1. ✅ Are you logged in as a super admin?
2. ✅ Does the vendor have a `stripeAccountId`?
3. ✅ Are you viewing the vendor edit page (not list)?

**Solution:**
- If vendor doesn't have Stripe account, they need to create one first via `/vendor/stripe-onboarding`

### Sync Fails?

**Common Errors:**

1. **"Vendor does not have a Stripe account"**
   - Solution: Vendor needs to create Stripe account first

2. **"Failed to sync Stripe details"**
   - Check Stripe API keys are configured
   - Check vendor's Stripe account still exists
   - Check server logs for detailed error

3. **"Stripe API error"**
   - Verify `STRIPE_SECRET_KEY` is set correctly
   - Check if Stripe account was deleted
   - Verify Stripe Connect is enabled

### Details Not Updating?

1. **Try manual sync again** - Click the button again
2. **Check Stripe Dashboard** - Verify account status in Stripe
3. **Check webhook** - Ensure `account.updated` webhook is configured
4. **Check server logs** - Look for error messages

---

## Technical Details

### API Endpoint

The sync button calls:
```
POST /api/vendors/[id]/sync-stripe
```

### Implementation

1. **Custom Component**: `src/collections/components/SyncStripeDetailsButton.tsx`
   - React component that renders the sync button
   - Handles loading states and error messages
   - Calls the API endpoint

2. **API Route**: `src/app/api/vendors/[id]/sync-stripe/route.ts`
   - Validates vendor exists
   - Checks vendor has Stripe account
   - Calls `syncVendorStripeDetails()` from `stripe-connect.ts`
   - Updates vendor record with synced details

3. **Collection Field**: Added to `Vendors` collection
   - Field name: `syncStripeAction`
   - Only visible to super admins
   - Only shows if vendor has Stripe account

---

## Example Workflow

### Scenario: Vendor Just Completed Onboarding

1. **Vendor completes Stripe onboarding** via `/vendor/stripe-onboarding`
2. **Admin wants to verify details** in admin dashboard
3. **Admin goes to** Collections → Vendors → [Vendor Name]
4. **Admin clicks** "Sync Stripe Details" button
5. **System fetches** latest details from Stripe API
6. **Vendor record updates** with:
   - Status: `pending` → `active`
   - Charges Enabled: `false` → `true`
   - Payouts Enabled: `false` → `true`
   - Business details, capabilities, requirements
7. **Page reloads** showing updated information

---

## Summary

✅ **Easy to Use**: Just click a button in the admin dashboard  
✅ **Comprehensive**: Syncs all Stripe account details  
✅ **Automatic**: Also syncs via webhooks and status checks  
✅ **Safe**: Only super admins can access  
✅ **Reliable**: Handles errors gracefully with clear messages  

You can now easily sync and view vendor Stripe details directly from the admin dashboard! 🎉
