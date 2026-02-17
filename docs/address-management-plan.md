# Address Management UI - Implementation Plan

## Standard E-Commerce Approach

### 1. **Account/Profile Page** (`/account`)
   - Main hub for user settings
   - Tabs/Sections:
     - Profile Information
     - **Shipping Addresses** (primary focus)
     - Order History (future)
     - Payment Methods (future)

### 2. **Profile Dropdown in Navbar**
   - Avatar/Profile icon in navbar
   - Dropdown menu with:
     - "My Account" → `/account`
     - "Shipping Addresses" → `/account?tab=addresses`
     - "Orders" → `/orders` (future)
     - "Log out"

### 3. **Address Management Components**
   - `AddressForm` - Reusable form (add/edit)
   - `AddressCard` - Display address with actions
   - `AddressList` - List all addresses with management
   - `AddressSelector` - For checkout (select existing or add new)

### 4. **Checkout Integration**
   - Address selection dropdown
   - "Add new address" button
   - Use default address if available

## File Structure

```
src/
├── app/(app)/account/
│   └── page.tsx                    # Account page with tabs
├── modules/
│   └── addresses/
│       ├── server/
│       │   └── procedures.ts       # tRPC procedures (CRUD)
│       └── ui/
│           ├── components/
│           │   ├── address-form.tsx
│           │   ├── address-card.tsx
│           │   ├── address-list.tsx
│           │   └── address-selector.tsx
│           └── views/
│               └── addresses-view.tsx
└── components/
    └── profile-dropdown.tsx        # Navbar profile dropdown
```

## Implementation Steps

1. ✅ Create account page structure
2. ✅ Add profile dropdown to navbar
3. ✅ Create tRPC procedures for address CRUD
4. ✅ Create AddressForm component
5. ✅ Create AddressCard component
6. ✅ Create AddressList component
7. ✅ Integrate with checkout
