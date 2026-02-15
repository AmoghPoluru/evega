# Payload CMS - Complete Guide

## Table of Contents

1. [What is Payload CMS?](#what-is-payload-cms)
2. [Installation](#installation)
3. [Creating Collections](#creating-collections)
4. [CRUD Operations via tRPC](#crud-operations-via-trpc)
5. [CRUD Operations via Direct Payload API](#crud-operations-via-direct-payload-api)
6. [Why Use Direct Payload API?](#why-use-direct-payload-api)
7. [REST & GraphQL APIs](#rest--graphql-apis)
8. [Summary & Best Practices](#summary--best-practices)

---

## What is Payload CMS?

**Payload CMS** is a headless Content Management System built with TypeScript and Node.js. It provides:

- **Database Layer** - MongoDB integration via Mongoose adapter
- **Admin Panel** - Auto-generated admin UI at `/admin`
- **Type Safety** - Auto-generated TypeScript types
- **Access Control** - Built-in authentication and authorization
- **File Uploads** - Media management with image processing
- **REST & GraphQL APIs** - Auto-generated API endpoints
- **Local API** - Direct database access in server-side code

In this project, Payload serves as the **backend database and admin panel** for managing products, categories, users, and orders.

---

## Installation

### Step 1: Install Payload and Dependencies

```bash
npm install payload @payloadcms/db-mongodb @payloadcms/next @payloadcms/richtext-lexical
npm install sharp  # For image processing
```

### Step 2: Install Database Adapter

For MongoDB (used in this project):

```bash
npm install @payloadcms/db-mongodb
```

For other databases:
- PostgreSQL: `@payloadcms/db-postgres`
- MySQL: `@payloadcms/db-mysql`

### Step 3: Environment Variables

Create `.env.local`:

```bash
# Database
DATABASE_URL=mongodb://localhost:27017/evega

# Payload
PAYLOAD_SECRET=your-secret-key-here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Create Payload Config

**File**: `src/payload.config.ts`

```typescript
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import path from "path";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Products } from "./collections/Products";
// ... other collections

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Products, /* ... */],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || "",
  }),
  sharp,
});
```

### Step 5: Generate Types

```bash
npm run generate:types
```

This creates `src/payload-types.ts` with TypeScript types for all collections.

---

## Creating Collections

### Step 1: Create Collection File

**File**: `src/collections/Products.ts`

```typescript
import type { CollectionConfig } from "payload";
import { isSuperAdmin } from "@/lib/access";

export const Products: CollectionConfig = {
  slug: "products",  // Collection name (used in URLs and API)
  access: {
    read: () => true,  // Public read access
    create: ({ req }) => Boolean(req.user),  // Authenticated users can create
    update: ({ req }) => isSuperAdmin(req.user),  // Only admins can update
    delete: ({ req }) => isSuperAdmin(req.user),  // Only admins can delete
  },
  admin: {
    useAsTitle: "name",  // Field to display in admin panel
    description: "Product catalog items",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "price",
      type: "number",
      required: true,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
  ],
};
```

### Step 2: Register Collection

**File**: `src/payload.config.ts`

```typescript
import { Products } from "./collections/Products";

export default buildConfig({
  collections: [
    Users,
    Products,  // Add here
    // ... other collections
  ],
});
```

### Step 3: Generate Types

```bash
npm run generate:types
```

### Step 4: Access in Code

Now you can access the collection via:
- tRPC procedures
- Direct Payload API
- REST API (auto-generated)
- GraphQL API (auto-generated)

---

## CRUD Operations via tRPC

**tRPC is the primary method** used in this project for all API operations.

### Setup

**File**: `src/trpc/init.ts`

```typescript
import { getPayload } from "payload";
import config from "@payload-config";

export const baseProcedure = t.procedure.use(async ({ next }) => {
  const payload = await getPayload({ config });
  return next({ ctx: { db: payload } });
});
```

Payload is injected into tRPC context as `ctx.db`.

### GET Operations (Read)

#### Find Multiple Documents

**File**: `src/modules/products/server/procedures.ts`

```typescript
export const productsRouter = createTRPCRouter({
  getAll: baseProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        page: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.find({
        collection: "products",
        where: {
          isArchived: { not_equals: true },
        },
        limit: input.limit || 10,
        page: input.page || 1,
        depth: 2,  // Populate relationships
        sort: "-createdAt",
      });
      
      return {
        docs: products.docs,
        totalDocs: products.totalDocs,
        hasNextPage: products.hasNextPage,
      };
    }),
});
```

**Frontend Usage**:

```typescript
import { trpc } from "@/trpc/client";

function ProductsList() {
  const { data, isLoading } = trpc.products.getAll.useQuery({
    limit: 20,
    page: 1,
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data?.docs.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

#### Find Single Document by ID

```typescript
getOne: baseProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const product = await ctx.db.findByID({
      collection: "products",
      id: input.id,
      depth: 2,  // Populate category, image relationships
    });
    
    return product;
  }),
```

**Frontend Usage**:

```typescript
const { data: product } = trpc.products.getOne.useQuery({ id: "product-id" });
```

#### Find with Filters

```typescript
getByCategory: baseProcedure
  .input(z.object({ categoryId: z.string() }))
  .query(async ({ ctx, input }) => {
    const products = await ctx.db.find({
      collection: "products",
      where: {
        and: [
          { category: { equals: input.categoryId } },
          { isArchived: { not_equals: true } },
        ],
      },
      depth: 2,
    });
    
    return products.docs;
  }),
```

### POST Operations (Create)

```typescript
create: protectedProcedure  // Requires authentication
  .input(
    z.object({
      name: z.string(),
      price: z.number(),
      categoryId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const product = await ctx.db.create({
      collection: "products",
      data: {
        name: input.name,
        price: input.price,
        category: input.categoryId,
      },
    });
    
    return product;
  }),
```

**Frontend Usage**:

```typescript
const createProduct = trpc.products.create.useMutation({
  onSuccess: (data) => {
    console.log("Product created:", data);
  },
});

// Call mutation
createProduct.mutate({
  name: "New Product",
  price: 29.99,
  categoryId: "category-id",
});
```

### UPDATE Operations

```typescript
update: protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      price: z.number().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;
    
    const product = await ctx.db.update({
      collection: "products",
      id,
      data: updateData,
    });
    
    return product;
  }),
```

**Frontend Usage**:

```typescript
const updateProduct = trpc.products.update.useMutation();

updateProduct.mutate({
  id: "product-id",
  price: 39.99,
});
```

### DELETE Operations

```typescript
delete: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.delete({
      collection: "products",
      id: input.id,
    });
    
    return { success: true };
  }),
```

**Frontend Usage**:

```typescript
const deleteProduct = trpc.products.delete.useMutation();

deleteProduct.mutate({ id: "product-id" });
```

---

## CRUD Operations via Direct Payload API

**Direct Payload API** is used in:
- Server Components (Next.js)
- API Routes (webhooks, server actions)
- Seed scripts
- Background jobs

### Setup

```typescript
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });
```

### GET Operations

#### In Server Components

**File**: `src/app/(app)/(home)/[category]/page.tsx`

```typescript
import { getPayload } from "payload";
import config from "@payload-config";

export default async function CategoryPage({ params }: Props) {
  const payload = await getPayload({ config });
  
  // Find category
  const categoryData = await payload.find({
    collection: "categories",
    where: {
      slug: { equals: category },
    },
    limit: 1,
    depth: 1,
  });
  
  // Find products
  const productsData = await payload.find({
    collection: "products",
    where: {
      category: { equals: categoryData.docs[0].id },
      isArchived: { not_equals: true },
    },
    depth: 2,
  });
  
  return <div>{/* render products */}</div>;
}
```

#### In API Routes

**File**: `src/app/api/stripe/webhook/route.ts`

```typescript
export async function POST(req: Request) {
  const payload = await getPayload({ config });
  
  // Find product
  const product = await payload.findByID({
    collection: "products",
    id: productId,
    depth: 0,
  });
  
  // ... use product data
}
```

### POST Operations (Create)

#### Normal Create (Respects Access Control)

```typescript
const product = await payload.create({
  collection: "products",
  data: {
    name: "New Product",
    price: 29.99,
    category: "category-id",
  },
});
```

#### Bypass Access Control (Use Sparingly)

**File**: `src/app/api/stripe/webhook/route.ts`

```typescript
// Use payload.db.create() to bypass access control
// This is necessary in webhooks where there's no user session
await payload.db.create({
  collection: "orders",
  data: {
    name: `Order for ${product.name}`,
    user: userId,
    product: productId,
    stripeCheckoutSessionId: session.id,
  },
});
```

**Why `payload.db.create()`?**
- Webhooks don't have user sessions
- Need to create orders without authentication
- Bypasses access control checks

### UPDATE Operations

#### Normal Update

```typescript
const updated = await payload.update({
  collection: "products",
  id: "product-id",
  data: {
    price: 39.99,
  },
});
```

#### Bypass Access Control

```typescript
await payload.db.update({
  collection: "products",
  id: "product-id",
  data: {
    price: 39.99,
  },
});
```

### DELETE Operations

```typescript
await payload.delete({
  collection: "products",
  id: "product-id",
});
```

### In Seed Scripts

**File**: `src/seed.ts`

```typescript
import { getPayload } from "payload";
import config from "@payload-config";

async function seed() {
  const payload = await getPayload({ config });
  
  // Check if exists
  const existing = await payload.find({
    collection: "products",
    where: { slug: { equals: "my-product" } },
    limit: 1,
  });
  
  if (existing.docs.length === 0) {
    // Create new
    await payload.create({
      collection: "products",
      data: {
        name: "My Product",
        slug: "my-product",
        price: 29.99,
      },
    });
  }
}
```

---

## Why Use Direct Payload API?

### 1. **Server Components (Next.js)**

**Why**: Server components run on the server and need direct database access.

**Example**: `src/app/(app)/(home)/[category]/page.tsx`

```typescript
// Server component - runs on server
export default async function CategoryPage({ params }: Props) {
  const payload = await getPayload({ config });
  
  // Direct database access - no API call needed
  const products = await payload.find({
    collection: "products",
    where: { category: { equals: categoryId } },
  });
  
  return <div>{/* render */}</div>;
}
```

**Benefits**:
- No API round-trip
- Faster page loads
- Direct database access

### 2. **Webhooks (No User Session)**

**Why**: Webhooks come from external services (Stripe) and don't have user sessions.

**Example**: `src/app/api/stripe/webhook/route.ts`

```typescript
export async function POST(req: Request) {
  const payload = await getPayload({ config });
  
  // No user session in webhook
  // Must bypass access control
  await payload.db.create({
    collection: "orders",
    data: {
      user: userId,  // From webhook metadata
      product: productId,
    },
  });
}
```

**Why `payload.db.create()`?**
- Webhooks don't have authenticated user sessions
- Need to create orders from external service
- Must bypass access control

### 3. **Seed Scripts**

**Why**: Seed scripts run outside the application context.

**Example**: `src/seed.ts`

```typescript
// Standalone script - not part of app runtime
const payload = await getPayload({ config });

await payload.create({
  collection: "products",
  data: { /* ... */ },
});
```

**Benefits**:
- Run independently
- No server needed
- Direct database access

### 4. **Background Jobs**

**Why**: Background jobs need direct database access without API overhead.

```typescript
// Background job
async function processOrders() {
  const payload = await getPayload({ config });
  
  const orders = await payload.find({
    collection: "orders",
    where: { status: { equals: "pending" } },
  });
  
  // Process orders...
}
```

---

## REST & GraphQL APIs

Payload automatically generates REST and GraphQL APIs, but **they are not used in this project**.

### REST API

**Endpoint**: `/api/{collection-slug}`

**Available Routes**:
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**File**: `src/app/(payload)/api/[...slug]/route.ts` (auto-generated)

```typescript
export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const PATCH = REST_PATCH(config)
export const DELETE = REST_DELETE(config)
```

**Why Not Used?**
- This project uses tRPC for type-safe APIs
- tRPC provides better TypeScript integration
- tRPC has built-in validation with Zod

### GraphQL API

**Endpoint**: `/api/graphql`

**File**: `src/app/(payload)/api/graphql/route.ts` (auto-generated)

```typescript
export const POST = GRAPHQL_POST(config)
```

**Why Not Used?**
- This project uses tRPC
- tRPC provides better developer experience
- No need for GraphQL complexity

---

## Summary & Best Practices

### When to Use Each Method

| Method | Use Case | Example |
|--------|----------|---------|
| **tRPC** | Client-side API calls, authenticated operations | Frontend components, user actions |
| **Direct Payload API** | Server components, webhooks, seed scripts | `page.tsx`, webhooks, `seed.ts` |
| **REST API** | External integrations, mobile apps | Not used in this project |
| **GraphQL API** | Complex queries, external clients | Not used in this project |

### Access Control

| Method | Access Control | Notes |
|--------|----------------|-------|
| `payload.find()` | ✅ Enforced | Respects collection access rules |
| `payload.create()` | ✅ Enforced | Respects collection access rules |
| `payload.update()` | ✅ Enforced | Respects collection access rules |
| `payload.delete()` | ✅ Enforced | Respects collection access rules |
| `payload.db.find()` | ❌ Bypassed | Use only when necessary |
| `payload.db.create()` | ❌ Bypassed | Use in webhooks, seed scripts |
| `payload.db.update()` | ❌ Bypassed | Use only when necessary |
| `payload.db.delete()` | ❌ Bypassed | Use only when necessary |

### Best Practices

#### 1. Use tRPC for Client-Side Operations

```typescript
// ✅ Good - Type-safe, validated
const { data } = trpc.products.getAll.useQuery();

// ❌ Avoid - Direct REST calls
fetch('/api/products').then(r => r.json());
```

#### 2. Use Direct Payload API in Server Components

```typescript
// ✅ Good - Direct access, no API overhead
export default async function Page() {
  const payload = await getPayload({ config });
  const products = await payload.find({ collection: "products" });
  return <div>{/* render */}</div>;
}

// ❌ Avoid - Unnecessary API call
export default async function Page() {
  const res = await fetch('/api/products');
  const products = await res.json();
  return <div>{/* render */}</div>;
}
```

#### 3. Use `payload.db.*` Only When Necessary

```typescript
// ✅ Good - Webhook without user session
await payload.db.create({
  collection: "orders",
  data: { /* ... */ },
});

// ❌ Avoid - Normal operation should respect access control
await payload.db.create({
  collection: "products",
  data: { /* ... */ },
});
```

#### 4. Always Populate Relationships

```typescript
// ✅ Good - Populate relationships
const product = await ctx.db.findByID({
  collection: "products",
  id: productId,
  depth: 2,  // Populates category, image
});

// ❌ Bad - Returns only IDs
const product = await ctx.db.findByID({
  collection: "products",
  id: productId,
  depth: 0,
});
```

#### 5. Use TypeScript Types

```typescript
// ✅ Good - Type safety
import type { Product } from "@/payload-types";

const product: Product = await ctx.db.findByID({
  collection: "products",
  id: productId,
});
```

### Complete Example: Product CRUD

#### tRPC Router

```typescript
export const productsRouter = createTRPCRouter({
  // GET
  getAll: baseProcedure.query(async ({ ctx }) => {
    return await ctx.db.find({ collection: "products" });
  }),
  
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.findByID({
        collection: "products",
        id: input.id,
      });
    }),
  
  // POST
  create: protectedProcedure
    .input(z.object({ name: z.string(), price: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.create({
        collection: "products",
        data: input,
      });
    }),
  
  // UPDATE
  update: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.update({
        collection: "products",
        id,
        data,
      });
    }),
  
  // DELETE
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete({
        collection: "products",
        id: input.id,
      });
      return { success: true };
    }),
});
```

#### Frontend Usage

```typescript
function ProductsPage() {
  // GET
  const { data: products } = trpc.products.getAll.useQuery();
  const { data: product } = trpc.products.getOne.useQuery({ id: "123" });
  
  // POST
  const create = trpc.products.create.useMutation();
  
  // UPDATE
  const update = trpc.products.update.useMutation();
  
  // DELETE
  const deleteProduct = trpc.products.delete.useMutation();
  
  return (
    <div>
      <button onClick={() => create.mutate({ name: "New", price: 29.99 })}>
        Create
      </button>
      <button onClick={() => update.mutate({ id: "123", name: "Updated" })}>
        Update
      </button>
      <button onClick={() => deleteProduct.mutate({ id: "123" })}>
        Delete
      </button>
    </div>
  );
}
```

---

## Quick Reference

### tRPC (Primary Method)

```typescript
// GET
const { data } = trpc.products.getAll.useQuery();

// POST
const create = trpc.products.create.useMutation();
create.mutate({ name: "Product", price: 29.99 });

// UPDATE
const update = trpc.products.update.useMutation();
update.mutate({ id: "123", price: 39.99 });

// DELETE
const deleteProduct = trpc.products.delete.useMutation();
deleteProduct.mutate({ id: "123" });
```

### Direct Payload API

```typescript
const payload = await getPayload({ config });

// GET
const products = await payload.find({ collection: "products" });
const product = await payload.findByID({ collection: "products", id: "123" });

// POST
const newProduct = await payload.create({
  collection: "products",
  data: { name: "Product", price: 29.99 },
});

// UPDATE
const updated = await payload.update({
  collection: "products",
  id: "123",
  data: { price: 39.99 },
});

// DELETE
await payload.delete({ collection: "products", id: "123" });
```

### Bypass Access Control (Use Sparingly)

```typescript
// Only use in webhooks, seed scripts, background jobs
await payload.db.create({ collection: "orders", data: { /* ... */ } });
await payload.db.update({ collection: "products", id: "123", data: { /* ... */ } });
```

---

This guide covers all methods of using Payload CMS in this project. Use **tRPC for client-side operations** and **Direct Payload API for server-side operations** (server components, webhooks, seed scripts).
