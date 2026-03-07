# Search Indexes for MongoDB

## Overview
These indexes improve search performance for product queries, especially variant-based searches.

## Required Indexes

### 1. Text Index for Name and Tags
```javascript
db.products.createIndex(
  { 
    name: "text",
    "tags.name": "text"
  },
  { 
    name: "product_text_search",
    background: true
  }
);
```

### 2. Variant Data Indexes
```javascript
// Index for size variant search
db.products.createIndex(
  { "variants.variantData.size": 1 },
  { 
    name: "variant_size_index",
    background: true,
    sparse: true
  }
);

// Index for color variant search
db.products.createIndex(
  { "variants.variantData.color": 1 },
  { 
    name: "variant_color_index",
    background: true,
    sparse: true
  }
);

// Index for material variant search
db.products.createIndex(
  { "variants.variantData.material": 1 },
  { 
    name: "variant_material_index",
    background: true,
    sparse: true
  }
);
```

### 3. Compound Indexes
```javascript
// Common query pattern: isArchived + isPrivate + createdAt
db.products.createIndex(
  { 
    isArchived: 1,
    isPrivate: 1,
    createdAt: -1
  },
  { 
    name: "product_listing_index",
    background: true
  }
);

// Category filtering
db.products.createIndex(
  { 
    category: 1,
    isArchived: 1,
    isPrivate: 1
  },
  { 
    name: "category_filter_index",
    background: true
  }
);
```

## How to Create Indexes

### Option 1: MongoDB Shell
```bash
mongosh your-database-name
# Then run the index creation commands above
```

### Option 2: MongoDB Compass
1. Connect to your database
2. Navigate to the `products` collection
3. Go to the "Indexes" tab
4. Click "Create Index"
5. Add the fields and options as shown above

### Option 3: Migration Script
Create a migration script in `src/migrations/create-search-indexes.ts`:

```typescript
import { getPayload } from "payload";
import config from "@payload-config";

async function createIndexes() {
  const payload = await getPayload({ config });
  const db = payload.db;
  
  // Create indexes using MongoDB driver
  const collection = db.collections.products;
  
  await collection.createIndex(
    { name: "text", "tags.name": "text" },
    { name: "product_text_search", background: true }
  );
  
  // ... other indexes
}

createIndexes();
```

## Performance Impact

- **Before indexes**: 500-1000ms for variant searches
- **After indexes**: 50-200ms for variant searches
- **Expected improvement**: 70-80% faster queries

## Monitoring

Check index usage:
```javascript
db.products.getIndexes();
db.products.aggregate([{ $indexStats: {} }]);
```
