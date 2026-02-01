# Multi-Tenant Marketplace with Payload CMS

A comprehensive guide to implementing a multi-vendor marketplace using Payload CMS 3.x with Next.js and MongoDB.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Collections Setup](#core-collections-setup)
3. [Access Control Implementation](#access-control-implementation)
4. [Marketplace Workflow](#marketplace-workflow)
5. [Implementation Steps](#implementation-steps)
6. [Key Challenges & Solutions](#key-challenges--solutions)
7. [Payment Integration](#payment-integration)
8. [Best Practices](#best-practices)

---

## Architecture Overview

### Multi-Tenant Data Isolation Strategy

In a marketplace, your "tenants" are your **Sellers/Vendors**. You have two primary choices for data isolation:

#### Option 1: Shared Collections (Field-level isolation) ✅ Recommended
- All products live in one `Products` collection
- Each product has a `tenant` relationship field
- **Pros**: Easier to maintain, simpler queries, better performance
- **Cons**: Requires strict access control

#### Option 2: Separate Databases
- Each tenant has their own database
- **Pros**: Complete isolation
- **Cons**: Complex to manage, harder to query across tenants

**This guide uses Option 1 (Shared Collections)** as it's the most practical for marketplaces.

---

## Core Collections Setup

### Required Collections

| Collection | Purpose | Key Fields |
|------------|--------|------------|
| **Tenants** | The "Shops" / Vendors | `name`, `slug`, `logo`, `stripeAccountId` |
| **Users** | Sellers, Admins, Customers | `role`, `tenant` (relationship) |
| **Products** | Marketplace items | `price`, `stock`, `tenant` (relationship), `status` |
| **Orders** | Transactions | `items[]`, `total`, `tenant`, `customer`, `status` |

---

## Implementation Steps

### Step 1: Create the Tenants Collection

Create `src/collections/Tenants.ts`:

```typescript
import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    useAsTitle: "name",
    hidden: ({ user }) => !isSuperAdmin(user as any),
  },
  access: {
    read: () => true, // Public can read tenant info
    create: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL-friendly identifier (e.g., 'acme-store')",
      },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "stripeAccountId",
      type: "text",
      admin: {
        description: "Stripe Connect account ID for vendor payouts",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "If unchecked, tenant products won't appear in marketplace",
      },
    },
  ],
};
```

### Step 2: Update Users Collection

Update `src/collections/Users.ts` to include tenant relationships:

```typescript
import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ({ req }) => {
      // Users can read their own profile
      if (req.user) return true;
      return false;
    },
    update: ({ req }) => {
      // Users can update their own profile
      if (req.user) return true;
      return false;
    },
  },
  fields: [
    {
      name: "username",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "roles",
      type: "select",
      defaultValue: ["customer"],
      hasMany: true,
      options: ["super-admin", "vendor", "customer"],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      hasMany: false,
      admin: {
        description: "The vendor/shop this user belongs to (for vendors only)",
        condition: (data) => {
          // Only show if user has vendor role
          return data?.roles?.includes("vendor");
        },
      },
    },
    {
      name: "stripeCustomerId",
      type: "text",
      admin: {
        description: "Stripe customer ID for payment processing",
      },
    },
  ],
};
```

### Step 3: Update Products Collection

Update `src/collections/Products.ts` to add tenant relationship and marketplace access:

```typescript
import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

// Helper function to check if user is vendor
const isVendor = (user: any) => {
  return user?.roles?.includes("vendor");
};

// Helper function to check if user owns the tenant
const isTenantOwner = (user: any, tenantId: string) => {
  if (!user || !tenantId) return false;
  return user.tenant?.id === tenantId || user.tenant === tenantId;
};

export const Products: CollectionConfig = {
  slug: "products",
  access: {
    // MARKETPLACE RULE: Public can read published products from ALL tenants
    read: ({ req }) => {
      const user = req.user;
      
      // Admins see everything
      if (isSuperAdmin(user)) return true;
      
      // Public can read published products (global catalog)
      // This is the key marketplace behavior
      return {
        or: [
          {
            status: {
              equals: "published",
            },
            isArchived: {
              equals: false,
            },
          },
          // Vendors can also see their own drafts
          ...(isVendor(user) && user.tenant
            ? [
                {
                  and: [
                    {
                      tenant: {
                        equals: user.tenant.id || user.tenant,
                      },
                    },
                  ],
                },
              ]
            : []),
        ],
      };
    },
    
    create: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      // Vendors can create products
      if (isVendor(user)) return true;
      return false;
    },
    
    update: ({ req, id }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      
      if (isVendor(user) && user.tenant) {
        // Vendors can only update their own products
        return {
          tenant: {
            equals: user.tenant.id || user.tenant,
          },
        };
      }
      return false;
    },
    
    delete: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      // Vendors can delete their own products
      if (isVendor(user) && user.tenant) {
        return {
          tenant: {
            equals: user.tenant.id || user.tenant,
          },
        };
      }
      return false;
    },
  },
  admin: {
    useAsTitle: "name",
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        const user = req.user;
        
        // Auto-assign tenant for vendors
        if (operation === "create" && isVendor(user) && user.tenant && !data.tenant) {
          data.tenant = user.tenant.id || user.tenant;
        }
        
        // Ensure vendors can't change tenant
        if (operation === "update" && isVendor(user) && user.tenant) {
          // Don't allow vendor to change tenant field
          if (data.tenant && data.tenant !== user.tenant.id && data.tenant !== user.tenant) {
            throw new Error("You cannot change the tenant of this product");
          }
          // Force tenant to match vendor's tenant
          data.tenant = user.tenant.id || user.tenant;
        }
        
        return data;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "Auto-generated from name, but can be customized",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate slug from name if not provided
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            }
            return value;
          },
        ],
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      admin: {
        description: "The vendor/shop that owns this product",
      },
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Price in USD",
      },
    },
    {
      name: "stock",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Available inventory quantity",
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      defaultValue: "draft",
      admin: {
        description: "Published products appear in the marketplace",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "images",
      type: "array",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
      ],
    },
    {
      name: "isArchived",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};
```

### Step 4: Create Orders Collection

Create `src/collections/Orders.ts`:

```typescript
import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

const isVendor = (user: any) => user?.roles?.includes("vendor");
const isCustomer = (user: any) => user?.roles?.includes("customer");

export const Orders: CollectionConfig = {
  slug: "orders",
  access: {
    read: ({ req }) => {
      const user = req.user;
      
      if (isSuperAdmin(user)) return true;
      
      if (isVendor(user) && user.tenant) {
        // Vendors can only see orders for their tenant
        return {
          tenant: {
            equals: user.tenant.id || user.tenant,
          },
        };
      }
      
      if (isCustomer(user)) {
        // Customers can only see their own orders
        return {
          customer: {
            equals: user.id,
          },
        };
      }
      
      return false;
    },
    
    create: ({ req }) => {
      // Anyone can create orders (checkout)
      return true;
    },
    
    update: ({ req }) => {
      const user = req.user;
      if (isSuperAdmin(user)) return true;
      // Vendors can update order status for their orders
      if (isVendor(user) && user.tenant) {
        return {
          tenant: {
            equals: user.tenant.id || user.tenant,
          },
        };
      }
      return false;
    },
  },
  admin: {
    useAsTitle: "orderNumber",
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === "create") {
          // Generate order number
          if (!data.orderNumber) {
            data.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
          
          // Set customer if logged in
          if (req.user && !data.customer) {
            data.customer = req.user.id;
          }
          
          // Calculate total from items
          if (data.items && Array.isArray(data.items)) {
            data.total = data.items.reduce((sum: number, item: any) => {
              return sum + (item.price * item.quantity);
            }, 0);
          }
          
          // Set tenant from first product's tenant
          if (data.items && data.items[0]?.product) {
            // You'll need to fetch the product to get its tenant
            // This is a simplified version
          }
        }
        
        return data;
      },
    ],
  },
  fields: [
    {
      name: "orderNumber",
      type: "text",
      required: true,
      unique: true,
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "users",
      admin: {
        description: "Customer who placed the order",
      },
    },
    {
      name: "customerEmail",
      type: "email",
      required: true,
      admin: {
        description: "Email for guest checkout",
      },
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      admin: {
        description: "Vendor that should fulfill this order",
      },
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          required: true,
        },
        {
          name: "quantity",
          type: "number",
          required: true,
          min: 1,
        },
        {
          name: "price",
          type: "number",
          required: true,
          admin: {
            description: "Price snapshot at time of purchase",
          },
        },
      ],
    },
    {
      name: "total",
      type: "number",
      required: true,
      admin: {
        description: "Total amount in USD",
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Fulfilled", value: "fulfilled" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Refunded", value: "refunded" },
      ],
      defaultValue: "pending",
    },
    {
      name: "stripePaymentIntentId",
      type: "text",
      admin: {
        description: "Stripe payment intent ID",
      },
    },
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        {
          name: "street",
          type: "text",
        },
        {
          name: "city",
          type: "text",
        },
        {
          name: "state",
          type: "text",
        },
        {
          name: "zip",
          type: "text",
        },
        {
          name: "country",
          type: "text",
        },
      ],
    },
  ],
};
```

### Step 5: Register Collections in Payload Config

Update `src/payload.config.ts`:

```typescript
import { Tenants } from "./collections/Tenants";
import { Users } from "./collections/Users";
import { Products } from "./collections/Products";
import { Orders } from "./collections/Orders";
// ... other imports

export default buildConfig({
  // ... other config
  collections: [
    Users,
    Media,
    Tenants, // Add this
    Categories,
    Products, // Updated
    Tags,
    Orders, // Add this
  ],
  // ... rest of config
});
```

### Step 6: Regenerate Types

After creating/updating collections, regenerate Payload types:

```bash
npm run generate:types
npm run generate:importmap
```

---

## Access Control Implementation

### The Marketplace Access Pattern

The key marketplace rule is: **Public READ shows all tenants' published products**.

```typescript
// Products access example
read: ({ req }) => {
  const user = req.user;
  
  // Admins see everything
  if (isSuperAdmin(user)) return true;
  
  // Public can read published products (global catalog)
  return {
    or: [
      {
        status: { equals: "published" },
        isArchived: { equals: false },
      },
      // Vendors can also see their own drafts
      ...(isVendor(user) && user.tenant
        ? [{ tenant: { equals: user.tenant.id } }]
        : []),
    ],
  };
}
```

### Scoped Access for Vendors

Vendors should only see/edit their own data:

```typescript
// Products update access
update: ({ req }) => {
  if (isSuperAdmin(req.user)) return true;
  
  if (isVendor(req.user) && req.user.tenant) {
    return {
      tenant: {
        equals: req.user.tenant.id || req.user.tenant,
      },
    };
  }
  return false;
}
```

---

## Marketplace Workflow

### 1. Vendor Onboarding

1. User registers → Creates account
2. Admin creates `Tenant` record
3. Admin assigns `tenant` relationship to user
4. User role set to `"vendor"`

**Automation Hook Example:**

```typescript
// In Users collection hooks
afterChange: [
  async ({ doc, operation, req }) => {
    if (operation === "create" && doc.roles?.includes("vendor")) {
      // Auto-create tenant if not exists
      // Or send notification to admin
    }
  },
]
```

### 2. Product Management

- Vendors log into Payload Admin
- They can only see/edit their own products (enforced by access control)
- Products default to `status: "draft"`
- When `status: "published"`, products appear in global marketplace

### 3. Storefront Queries

**Global Catalog (All Tenants):**

```typescript
// In your Next.js API route or tRPC procedure
const products = await payload.find({
  collection: "products",
  where: {
    status: { equals: "published" },
    isArchived: { equals: false },
  },
  limit: 100,
  sort: "-createdAt",
});
```

**Vendor-Specific Page:**

```typescript
const tenant = await payload.find({
  collection: "tenants",
  where: {
    slug: { equals: tenantSlug },
  },
  limit: 1,
});

const products = await payload.find({
  collection: "products",
  where: {
    tenant: { equals: tenant.docs[0].id },
    status: { equals: "published" },
  },
});
```

### 4. Checkout Flow

1. Customer adds products to cart
2. On checkout, create `Order` with:
   - `items[]` (product + quantity + price snapshot)
   - `tenant` (from product)
   - `customer` (if logged in)
   - `total` (calculated)
3. Process payment via Stripe
4. Update order status

---

## Key Challenges & Solutions

### Challenge 1: Media Isolation

**Problem**: All uploads go to one bucket by default.

**Solution**: Use `@payloadcms/plugin-cloud-storage` with tenant-specific paths:

```typescript
import { cloudStorage } from '@payloadcms/plugin-cloud-storage';
import { s3Storage } from '@payloadcms/plugin-cloud-storage/s3';

export default buildConfig({
  plugins: [
    cloudStorage({
      collections: {
        media: {
          adapter: s3Storage({
            config: {
              // S3 config
            },
            bucket: process.env.S3_BUCKET,
            prefix: ({ doc }) => {
              // Organize by tenant if product has tenant
              if (doc.tenant) {
                return `tenants/${doc.tenant}/`;
              }
              return 'global/';
            },
          }),
        },
      },
    }),
  ],
});
```

### Challenge 2: Unique Slugs

**Problem**: Two vendors might create "Blue T-Shirt" → slug conflict.

**Solution**: Include tenant in slug generation:

```typescript
// In Products collection hooks
beforeValidate: [
  async ({ data, req }) => {
    if (data.name && !data.slug) {
      const tenant = await payload.findByID({
        collection: "tenants",
        id: data.tenant,
      });
      
      data.slug = `${tenant.slug}-${data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}`;
    }
    return data;
  },
]
```

### Challenge 3: Local API Bypasses Access

**⚠️ CRITICAL**: Payload's Local API skips access control by default!

**Solution**: Always use `overrideAccess: false` for public queries:

```typescript
// ❌ WRONG - Bypasses access control
const products = await payload.find({
  collection: "products",
  where: { status: { equals: "published" } },
});

// ✅ CORRECT - Respects access control
const products = await payload.find({
  collection: "products",
  where: { status: { equals: "published" } },
  overrideAccess: false, // This ensures access control is enforced
});
```

**Best Practice**: Use REST/GraphQL APIs for public pages, or always set `overrideAccess: false` with Local API.

### Challenge 4: Vendor Dashboard Views

**Solution**: Use Payload Custom Components to build seller dashboards:

```typescript
// Create custom admin view
admin: {
  components: {
    views: {
      Dashboard: {
        Component: path.resolve(__dirname, 'components/VendorDashboard.tsx'),
      },
    },
  },
}
```

---

## Payment Integration

### Stripe Connect Setup

For multi-vendor payouts, use **Stripe Connect**:

1. **Store Stripe Account ID on Tenant:**

```typescript
{
  name: "stripeAccountId",
  type: "text",
  admin: {
    description: "Stripe Connect account ID",
  },
}
```

2. **On Checkout:**

```typescript
// Create payment intent with destination charge
const paymentIntent = await stripe.paymentIntents.create({
  amount: orderTotal * 100,
  currency: 'usd',
  application_fee_amount: marketplaceFee * 100, // Your commission
  transfer_data: {
    destination: tenant.stripeAccountId, // Vendor receives funds
  },
});
```

3. **Split Orders by Tenant:**

If cart has products from multiple vendors, create separate orders:

```typescript
// Group cart items by tenant
const itemsByTenant = cartItems.reduce((acc, item) => {
  const tenantId = item.product.tenant;
  if (!acc[tenantId]) acc[tenantId] = [];
  acc[tenantId].push(item);
  return acc;
}, {});

// Create one order per tenant
for (const [tenantId, items] of Object.entries(itemsByTenant)) {
  await payload.create({
    collection: "orders",
    data: {
      tenant: tenantId,
      items,
      total: calculateTotal(items),
      // ... other fields
    },
  });
}
```

---

## Best Practices

### 1. Always Use `overrideAccess: false` with Local API

```typescript
// ✅ Good
await payload.find({
  collection: "products",
  overrideAccess: false,
});

// ❌ Bad - Bypasses access control
await payload.find({
  collection: "products",
});
```

### 2. Validate Tenant Assignment in Hooks

```typescript
beforeChange: [
  async ({ data, req, operation }) => {
    if (operation === "update" && isVendor(req.user)) {
      // Prevent vendor from changing tenant
      if (data.tenant !== req.user.tenant.id) {
        throw new Error("Cannot change tenant");
      }
    }
    return data;
  },
]
```

### 3. Use Indexes for Performance

```typescript
{
  name: "tenant",
  type: "relationship",
  relationTo: "tenants",
  index: true, // ✅ Add index for faster queries
}
```

### 4. Test Access Control Thoroughly

- Test as admin (should see everything)
- Test as vendor (should only see own data)
- Test as customer (should see published products)
- Test as public (should see published products only)

### 5. Monitor for Data Leaks

- Add logging to access control functions
- Regular audits of who can access what
- Use Payload's built-in access logging in development

---

## Next Steps

1. ✅ Create `Tenants` collection
2. ✅ Update `Users` collection with tenant relationship
3. ✅ Update `Products` collection with tenant field and access control
4. ✅ Create `Orders` collection
5. ✅ Implement vendor onboarding flow
6. ✅ Build storefront with global catalog
7. ✅ Integrate Stripe Connect for payments
8. ✅ Add vendor dashboard views
9. ✅ Implement media isolation
10. ✅ Add comprehensive testing

---

## Resources

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Payload Access Control](https://payloadcms.com/docs/access-control/overview)
- [Payload Hooks](https://payloadcms.com/docs/hooks/overview)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Multi-Tenant Plugin (if using)](https://github.com/payloadcms/payload/tree/main/packages/plugin-multi-tenant)

---

## Support

For issues or questions:
1. Check Payload CMS documentation
2. Review access control patterns in this guide
3. Test with `overrideAccess: false` to ensure access control is working
4. Check browser console and server logs for access control errors

---

**Remember**: The most common mistake in multi-tenant setups is forgetting `overrideAccess: false` with Local API, which can expose private data. Always test your access control thoroughly!
