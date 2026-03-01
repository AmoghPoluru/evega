# B2B Supplier Marketplace TODO List

> **Purpose**: This document serves as a comprehensive TODO list for building a B2B supplier marketplace (Alibaba-style) using the existing multi-vendor e-commerce codebase as a foundation.
>
> **For LLMs**: This file contains detailed task breakdowns, technical implementation details, and code references. Each task includes completion status, technical details, and file paths. Use this document to understand what needs to be built, modified, or removed from the existing codebase.

## System Overview

**Target Platform**: B2B Supplier Marketplace (like Alibaba, Global Sources, TradeIndia)
- **Buyers**: Companies/Businesses looking to source products in bulk
- **Suppliers**: **ONLY vendors from existing evega platform** (vendors from evega become suppliers)
- **Focus**: B2B transactions, bulk orders, MOQ (Minimum Order Quantity), RFQ (Request for Quote)

**Key Requirement**: 
- **Access Control**: Only vendors from the existing evega platform can access the supplier marketplace
- **Shared Authentication**: Vendors use the same login credentials from evega
- **Shared Database**: Uses the same MongoDB database and Payload CMS instance
- **Vendor-to-Supplier Mapping**: Existing evega vendors automatically become suppliers in the marketplace

**Current Codebase Assessment:**
- ✅ **Can Reuse**: Payload CMS, Next.js, tRPC, MongoDB, Stripe, Vendor system, Product system
- ✅ **Shared Access**: Same database, same authentication, same vendors
- ⚠️ **Needs Modification**: Add B2B features to existing vendors (vendors = suppliers), Customer → Buyer, Orders → B2B Orders
- ❌ **Needs to Build**: RFQ system, Inquiry system, Trade assurance, Bulk pricing, Company profiles

**Tech Stack (Reusing Current):**
- **Frontend**: Next.js 16 (App Router), React, TypeScript, shadcn/ui components
- **Backend**: Payload CMS, tRPC for type-safe APIs
- **Database**: MongoDB (via Payload)
- **Payment**: Stripe (for deposits, trade assurance)
- **State Management**: React Query, Zustand

**Key Differences from B2C:**
1. **Bulk Orders**: MOQ (Minimum Order Quantity), tiered pricing
2. **RFQ System**: Buyers request quotes, suppliers respond
3. **Company Profiles**: Detailed company info, certifications, factory details
4. **Trade Assurance**: Escrow, payment protection
5. **Inquiry System**: Direct messaging between buyers and suppliers
6. **Product Catalogs**: Supplier catalogs, not just individual products
7. **Verification**: Company verification, trade assurance badges

---

## Table of Contents

0. [Foundation & Planning](#foundation--planning)
   - [Codebase Assessment](#codebase-assessment)
   - [Database Migration Strategy](#database-migration-strategy)
   - [Terminology Mapping](#terminology-mapping)
1. [Core Collections - Suppliers](#core-collections---suppliers)
   - [Suppliers Collection](#suppliers-collection)
   - [Company Profiles](#company-profiles)
   - [Factory Information](#factory-information)
   - [Certifications & Verification](#certifications--verification)
2. [Core Collections - Buyers](#core-collections---buyers)
   - [Buyers Collection](#buyers-collection)
   - [Company Information](#company-information)
   - [Business Verification](#business-verification)
3. [Products & Catalogs](#products--catalogs)
   - [B2B Products Collection](#b2b-products-collection)
   - [Product Catalogs](#product-catalogs)
   - [Bulk Pricing Tiers](#bulk-pricing-tiers)
   - [MOQ (Minimum Order Quantity)](#moq-minimum-order-quantity)
   - [Sample Requests](#sample-requests)
4. [RFQ System](#rfq-system)
   - [RFQ Collection](#rfq-collection)
   - [RFQ Submission](#rfq-submission)
   - [Quote Management](#quote-management)
   - [RFQ Matching](#rfq-matching)
5. [Inquiry & Messaging](#inquiry--messaging)
   - [Inquiries Collection](#inquiries-collection)
   - [Messaging System](#messaging-system)
   - [Inquiry Types](#inquiry-types)
6. [B2B Orders](#b2b-orders)
   - [B2B Orders Collection](#b2b-orders-collection)
   - [Bulk Order Processing](#bulk-order-processing)
   - [Trade Assurance](#trade-assurance)
   - [Payment Terms](#payment-terms)
7. [Supplier Dashboard](#supplier-dashboard)
   - [Supplier Portal](#supplier-portal)
   - [Product Management](#product-management)
   - [RFQ Management](#rfq-management)
   - [Inquiry Management](#inquiry-management)
   - [Order Management](#order-management)
8. [Buyer Dashboard](#buyer-dashboard)
   - [Buyer Portal](#buyer-portal)
   - [RFQ Creation](#rfq-creation)
   - [Product Discovery](#product-discovery)
   - [Order Tracking](#order-tracking)
9. [Search & Discovery](#search--discovery)
   - [Product Search](#product-search)
   - [Supplier Search](#supplier-search)
   - [Category Browsing](#category-browsing)
   - [Filtering & Sorting](#filtering--sorting)
10. [Verification & Trust](#verification--trust)
    - [Company Verification](#company-verification)
    - [Trade Assurance](#trade-assurance-1)
    - [Certification Badges](#certification-badges)
    - [Rating & Reviews](#rating--reviews)
11. [Payment & Finance](#payment--finance)
    - [B2B Payment Terms](#b2b-payment-terms)
    - [Trade Assurance Escrow](#trade-assurance-escrow)
    - [Deposit System](#deposit-system)
    - [Invoice Management](#invoice-management)
12. [Admin Dashboard](#admin-dashboard)
    - [Supplier Approval](#supplier-approval)
    - [Buyer Verification](#buyer-verification)
    - [RFQ Moderation](#rfq-moderation)
    - [Platform Analytics](#platform-analytics)

---

## Foundation & Planning

### Codebase Assessment

- [ ] **Task 0.1**: Audit current codebase
  - List all collections (Vendors, Products, Orders, Customers, etc.)
  - Identify what can be reused vs. what needs modification
  - Document current features and functionality
  - **Verify vendor authentication system** (vendors from evega will access supplier marketplace)
  - Create migration checklist

**Current Collections to Review:**
- `Vendors` → **Keep as is, add B2B fields** (vendors = suppliers, same collection)
- `Products` → Needs B2B modifications (MOQ, bulk pricing)
- `Orders` → Needs B2B modifications (payment terms, trade assurance)
- `Customers` → Will become `Buyers` (new collection or rename)
- `Users` → Needs company/business profile fields (for buyers)
- `Categories` → Can be reused
- `Tags` → Can be reused

**Important**: 
- **Vendors collection stays the same** - existing evega vendors become suppliers
- **No need to rename Vendors → Suppliers** - just add B2B fields
- **Vendor authentication from evega works** - same login system
- **Access control**: Only users with `vendor` relationship can access supplier marketplace

**File Locations:**
- Collections: `src/collections/*`
- Vendor dashboard: `src/app/(app)/vendor/*`
- Admin dashboard: `src/app/(app)/admin/*`

### Database Migration Strategy

- [ ] **Task 0.2**: Plan database migration
  - **Use SAME database** (vendors from evega need access)
  - Create backup strategy
  - **Keep Vendors collection** (add B2B fields, don't rename)
  - Plan field additions/modifications
  - Plan data migration scripts for existing vendors

**Migration Approach:**
- **Use existing database** - vendors from evega must have access
- **Keep Vendors collection** - add B2B fields to existing vendors
- **Add new collections** - RFQs, Quotes, Inquiries, Buyers (if separate from Customers)
- **Extend existing collections** - Products, Orders with B2B fields
- **No renaming needed** - vendors stay as vendors, just add supplier capabilities

**Key Points:**
- Same MongoDB database
- Same Payload CMS instance
- Same authentication system
- Vendors from evega automatically have access
- Add B2B features to existing vendor dashboard

### Terminology Mapping

- [ ] **Task 0.3**: Create terminology mapping document
  - Map B2C terms to B2B terms
  - **Keep "Vendor" terminology** (vendors from evega are familiar with it)
  - Update UI text for B2B context (but keep "vendor" term)
  - Update API endpoints
  - Update documentation

**Terminology Mapping:**
- `Vendor` → **Keep as "Vendor"** (but add B2B supplier capabilities)
- `Customer` → `Buyer` (for B2B marketplace buyers)
- `Store` → `Company Profile` / `Factory` (for vendor profiles)
- `Product` → `Product` (with B2B fields)
- `Order` → `B2B Order` / `Trade Order` (in B2B context)
- `Cart` → `Inquiry Cart` / `Quote Request` (for buyers)
- `Checkout` → `Place Order` / `Request Quote` (for buyers)

**UI Context:**
- In **vendor dashboard**: Keep "Vendor" terminology
- In **buyer-facing marketplace**: Use "Supplier" terminology
- In **admin**: Can use both terms interchangeably

---

## Core Collections - Suppliers (Vendors from Evega)

### Suppliers Collection (Extend Existing Vendors)

- [ ] **Task 1.1**: Extend `Vendors` collection with B2B fields (DO NOT rename)
  - Location: `src/collections/Vendors.ts` (existing file)
  - **Keep existing vendor fields** (name, slug, description, logo, etc.)
  - **Add B2B-specific fields** to existing Vendors collection:
    - `companyType` (manufacturer, trading company, distributor)
    - `yearEstablished` (number)
    - `annualRevenue` (select: ranges)
    - `employeeCount` (select: ranges)
    - `mainMarkets` (array: regions/countries)
    - `mainProducts` (array: product categories)
    - `factoryLocation` (address)
    - `factorySize` (text: square meters)
    - `productionCapacity` (text)
    - `qualityCertifications` (array: ISO, CE, etc.)
    - `tradeAssurance` (boolean)
    - `verifiedSupplier` (boolean)
    - `goldSupplier` (boolean, premium tier)
    - `responseTime` (number: hours)
    - `acceptSampleOrders` (boolean)
    - `acceptCustomOrders` (boolean)
    - `paymentTerms` (array: T/T, L/C, etc.)

**Technical Details:**
- **DO NOT rename Vendors collection** - keep it as `Vendors`
- **Add B2B fields** to existing Vendors collection
- **Keep existing vendor dashboard** - add B2B features to it
- **Access control**: Only users with `vendor` relationship can access B2B features
- **Vendor authentication**: Uses existing evega vendor authentication

**File Reference:**
- Current: `src/collections/Vendors.ts` (modify this file)
- Vendor dashboard: `src/app/(app)/vendor/*` (add B2B features here)
- Vendor auth: `src/lib/middleware/vendor-auth.ts` (reuse existing)

### Company Profiles

- [ ] **Task 1.2**: Enhance company profile fields
  - Business registration number
  - Tax ID / VAT number
  - Business license (upload)
  - Company website
  - Social media links
  - Company description (rich text)
  - Company video (optional)
  - Company photos gallery
  - Key personnel
  - Company history/timeline

**Technical Details:**
- Add fields to Suppliers collection
- Create company profile page template
- Add verification badges display

### Factory Information

- [ ] **Task 1.3**: Add factory details section
  - Factory address (detailed)
  - Factory photos (gallery)
  - Factory size (square meters)
  - Production lines count
  - Production capacity (units per month)
  - Quality control process
  - R&D capability
  - Warehouse information
  - Shipping capabilities

**Technical Details:**
- Add factory fields to Suppliers collection
- Create factory information display component
- Add factory verification process

### Certifications & Verification

- [ ] **Task 1.4**: Create certifications system
  - Certifications collection or array field
  - Certification types: ISO 9001, CE, FDA, etc.
  - Certification upload (PDF/image)
  - Certification expiry date
  - Verification status (pending, verified, expired)
  - Display certification badges

**Technical Details:**
- Create `Certifications` collection or add to Suppliers
- Admin verification workflow
- Badge display on supplier profile

---

## Core Collections - Buyers

### Buyers Collection

- [ ] **Task 2.1**: Create `Buyers` collection (rename from `Customers`)
  - Location: `src/collections/Buyers.ts`
  - Copy from `Customers.ts` as base
  - Add B2B-specific fields:
    - `companyName` (text, required)
    - `companyType` (retailer, distributor, manufacturer, etc.)
    - `businessRegistrationNumber` (text)
    - `taxId` (text)
    - `companyWebsite` (text)
    - `annualPurchaseVolume` (select: ranges)
    - `mainBusiness` (text)
    - `targetMarkets` (array: regions/countries)
    - `verifiedBuyer` (boolean)
    - `preferredPaymentTerms` (array)
    - `shippingPreferences` (array)

**Technical Details:**
- Rename `Customers` collection to `Buyers`
- Update all references in codebase
- Add company/business profile fields
- Create buyer dashboard (similar to vendor dashboard)

**File Reference:**
- Current: `src/collections/Customers.ts`

### Company Information

- [ ] **Task 2.2**: Add company profile fields
  - Company address
  - Company phone
  - Company email
  - Company logo
  - Company description
  - Number of employees
  - Year established
  - Business license (upload)
  - Tax documents (upload)

**Technical Details:**
- Add fields to Buyers collection
- Create buyer profile page
- Add company verification workflow

### Business Verification

- [ ] **Task 2.3**: Create buyer verification system
  - Verification status (unverified, pending, verified)
  - Verification documents (business license, tax ID)
  - Admin approval workflow
  - Verification badge display
  - Benefits for verified buyers (priority support, etc.)

**Technical Details:**
- Add verification fields to Buyers collection
- Admin verification interface
- Badge display on buyer profile

---

## Products & Catalogs

### B2B Products Collection

- [ ] **Task 3.1**: Modify `Products` collection for B2B
  - Location: `src/collections/Products.ts`
  - Add B2B-specific fields:
    - `moq` (Minimum Order Quantity, number, required)
    - `bulkPricingTiers` (array: quantity ranges with prices)
    - `unitPrice` (base price for MOQ)
    - `sampleAvailable` (boolean)
    - `samplePrice` (number, optional)
    - `customizationAvailable` (boolean)
    - `leadTime` (text: "7-15 days", etc.)
    - `packagingOptions` (array)
    - `shippingTerms` (FOB, CIF, EXW, etc.)
    - `paymentTerms` (T/T, L/C, etc.)
    - `productCertifications` (array)
    - `hsCode` (Harmonized System code for customs)
    - `originCountry` (text)
    - `supplier` (relationship, rename from `vendor`)

**Technical Details:**
- Modify existing Products collection
- Add B2B pricing fields
- Update product display to show MOQ and bulk pricing
- Update product search/filter to include B2B fields

**File Reference:**
- Current: `src/collections/Products.ts`

### Product Catalogs

- [ ] **Task 3.2**: Create `ProductCatalogs` collection
  - Location: `src/collections/ProductCatalogs.ts`
  - Supplier can create product catalogs
  - Catalog fields:
    - `name` (text, required)
    - `description` (rich text)
    - `supplier` (relationship)
    - `products` (relationship array)
    - `coverImage` (upload)
    - `category` (relationship)
    - `isPublic` (boolean)
    - `downloadUrl` (PDF catalog, optional)

**Technical Details:**
- New collection for supplier catalogs
- Suppliers can create multiple catalogs
- Buyers can browse/download catalogs
- PDF generation for catalogs (optional)

### Bulk Pricing Tiers

- [ ] **Task 3.3**: Implement bulk pricing system
  - Pricing tiers: MOQ, 100+, 500+, 1000+, 5000+, etc.
  - Price decreases with quantity
  - Display pricing table on product page
  - Calculate price based on quantity in inquiry

**Technical Details:**
- Array field in Products: `bulkPricingTiers`
- Each tier: `minQuantity`, `maxQuantity`, `price`
- Price calculation function
- Display component for pricing tiers

**Example Structure:**
```typescript
bulkPricingTiers: [
  { minQuantity: 1, maxQuantity: 99, price: 10.00 },
  { minQuantity: 100, maxQuantity: 499, price: 9.00 },
  { minQuantity: 500, maxQuantity: 999, price: 8.50 },
  { minQuantity: 1000, maxQuantity: null, price: 8.00 },
]
```

### MOQ (Minimum Order Quantity)

- [ ] **Task 3.4**: Implement MOQ system
  - MOQ field in products (required)
  - MOQ validation in cart/inquiry
  - Display MOQ prominently on product page
  - MOQ-based filtering in search
  - MOQ calculator (show price per unit at different quantities)

**Technical Details:**
- MOQ validation in frontend and backend
- Error message if quantity below MOQ
- MOQ display component
- MOQ filter in product search

### Sample Requests

- [ ] **Task 3.5**: Create sample request system
  - `SampleRequests` collection
  - Buyers can request product samples
  - Sample fields:
    - `product` (relationship)
    - `buyer` (relationship)
    - `supplier` (relationship)
    - `quantity` (number, usually 1-5)
    - `purpose` (text: for testing, evaluation, etc.)
    - `shippingAddress` (address)
    - `status` (pending, approved, shipped, received)
    - `samplePrice` (number, may be free or paid)
    - `paymentStatus` (if sample is paid)

**Technical Details:**
- New collection for sample requests
- Supplier approval workflow
- Sample order processing
- Integration with order system

---

## RFQ System

### RFQ Collection

- [ ] **Task 4.1**: Create `RFQs` (Request for Quote) collection
  - Location: `src/collections/RFQs.ts`
  - RFQ fields:
    - `buyer` (relationship, required)
    - `title` (text, required)
    - `description` (rich text)
    - `category` (relationship)
    - `products` (array: product specifications)
    - `quantity` (number or range)
    - `targetPrice` (number, optional)
    - `deliveryDate` (date)
    - `deliveryLocation` (address)
    - `paymentTerms` (select)
    - `status` (draft, published, closed, awarded)
    - `quotes` (relationship array to Quotes)
    - `selectedQuote` (relationship, optional)
    - `expiryDate` (date)
    - `isPublic` (boolean: public RFQ or private)

**Technical Details:**
- New collection for RFQ system
- Buyers create RFQs
- Suppliers can view and quote
- RFQ matching algorithm (optional)

### RFQ Submission

- [ ] **Task 4.2**: Create RFQ submission form
  - Location: `src/app/(app)/buyer/rfq/new/page.tsx`
  - Multi-step form:
    1. Basic info (title, category, description)
    2. Product specifications
    3. Quantity and delivery
    4. Review and submit
  - Form validation
  - Save as draft functionality

**Technical Details:**
- React Hook Form with Zod validation
- Multi-step form component
- Draft saving (localStorage or database)
- Image uploads for product specs

### Quote Management

- [ ] **Task 4.3**: Create `Quotes` collection
  - Location: `src/collections/Quotes.ts`
  - Quote fields:
    - `rfq` (relationship, required)
    - `supplier` (relationship, required)
    - `products` (array: quoted products with prices)
    - `totalPrice` (number)
    - `unitPrice` (number, if applicable)
    - `quantity` (number)
    - `leadTime` (text)
    - `paymentTerms` (select)
    - `shippingTerms` (select)
    - `validityPeriod` (number: days)
    - `notes` (rich text)
    - `status` (pending, accepted, rejected, expired)
    - `submittedAt` (date)

**Technical Details:**
- New collection for quotes
- Suppliers submit quotes for RFQs
- Buyers can compare quotes
- Quote acceptance workflow

### RFQ Matching

- [ ] **Task 4.4**: Implement RFQ matching (optional)
  - Auto-match RFQs to relevant suppliers
  - Based on category, product type, supplier capabilities
  - Notification system for matched suppliers
  - Supplier can opt-in/opt-out of matching

**Technical Details:**
- Background job or cron for matching
- Algorithm based on supplier profile and RFQ requirements
- Email/notification to suppliers
- Supplier dashboard shows matched RFQs

---

## Inquiry & Messaging

### Inquiries Collection

- [ ] **Task 5.1**: Create `Inquiries` collection
  - Location: `src/collections/Inquiries.ts`
  - Inquiry fields:
    - `buyer` (relationship, required)
    - `supplier` (relationship, required)
    - `product` (relationship, optional)
    - `subject` (text, required)
    - `message` (rich text, required)
    - `inquiryType` (product inquiry, general inquiry, quote request)
    - `status` (new, replied, closed)
    - `attachments` (array: files)
    - `createdAt` (date)
    - `lastRepliedAt` (date)

**Technical Details:**
- New collection for inquiries
- Buyers send inquiries to suppliers
- Suppliers can reply
- Thread-based messaging

### Messaging System

- [ ] **Task 5.2**: Create messaging/chat system
  - Location: `src/collections/Messages.ts`
  - Message fields:
    - `inquiry` (relationship, optional)
    - `sender` (relationship: user)
    - `receiver` (relationship: user)
    - `message` (rich text)
    - `attachments` (array: files)
    - `read` (boolean)
    - `readAt` (date)
    - `createdAt` (date)

**Technical Details:**
- Real-time messaging (WebSocket or polling)
- Thread-based conversations
- File attachments
- Read receipts
- Notification system

**Options:**
1. **Simple**: Database-based messaging (recommended for MVP)
2. **Advanced**: WebSocket for real-time (Socket.io, Pusher)

### Inquiry Types

- [ ] **Task 5.3**: Implement different inquiry types
  - Product inquiry (about specific product)
  - General inquiry (about supplier/company)
  - Quote request (request custom quote)
  - Sample request (request product sample)
  - Order inquiry (about existing order)

**Technical Details:**
- Inquiry type selector in form
- Different forms/templates per type
- Type-specific fields
- Type-based routing in supplier dashboard

---

## B2B Orders

### B2B Orders Collection

- [ ] **Task 6.1**: Modify `Orders` collection for B2B
  - Location: `src/collections/Orders.ts`
  - Add B2B-specific fields:
    - `buyer` (relationship, rename from `user`)
    - `supplier` (relationship, rename from `vendor`)
    - `orderType` (standard order, sample order, custom order)
    - `paymentTerms` (T/T, L/C, credit, etc.)
    - `paymentSchedule` (array: milestone payments)
    - `depositAmount` (number)
    - `depositPaid` (boolean)
    - `tradeAssurance` (boolean)
    - `escrowAmount` (number, if trade assurance)
    - `shippingTerms` (FOB, CIF, EXW, DDP, etc.)
    - `deliveryDate` (date)
    - `inspectionDate` (date, optional)
    - `invoiceNumber` (text)
    - `poNumber` (Purchase Order number from buyer)
    - `status` (pending, confirmed, in_production, ready_to_ship, shipped, delivered, completed, cancelled)

**Technical Details:**
- Modify existing Orders collection
- Add B2B payment and shipping terms
- Update order status workflow
- Add milestone payment tracking

**File Reference:**
- Current: `src/collections/Orders.ts`

### Bulk Order Processing

- [ ] **Task 6.2**: Implement bulk order workflow
  - Order confirmation (supplier confirms order)
  - Production status updates
  - Quality inspection (optional)
  - Shipping preparation
  - Shipping tracking
  - Delivery confirmation
  - Invoice generation

**Technical Details:**
- Order status workflow
- Status update notifications
- Timeline display for order progress
- Document generation (invoices, shipping labels)

### Trade Assurance

- [ ] **Task 6.3**: Implement trade assurance system
  - Escrow payment holding
  - Payment release conditions
  - Dispute resolution
  - Refund process
  - Trade assurance badge display

**Technical Details:**
- Stripe escrow or custom escrow system
- Payment hold/release workflow
- Dispute management
- Integration with order system

### Payment Terms

- [ ] **Task 6.4**: Implement B2B payment terms
  - Payment term options: T/T (Telegraphic Transfer), L/C (Letter of Credit), Credit, etc.
  - Payment schedule (milestone payments)
  - Deposit requirement
  - Payment tracking
  - Invoice generation

**Technical Details:**
- Payment terms field in orders
- Payment schedule array
- Payment status tracking
- Invoice PDF generation

---

## Supplier Dashboard (Extend Existing Vendor Dashboard)

### Supplier Portal (Add B2B Features to Vendor Dashboard)

- [ ] **Task 7.1**: Add B2B features to existing vendor dashboard
  - Location: `src/app/(app)/vendor/*` (keep existing, add new pages)
  - **Keep existing vendor dashboard** structure
  - **Add new B2B pages**: `/vendor/rfqs`, `/vendor/inquiries`, `/vendor/b2b-orders`
  - Update navigation to include B2B features
  - **Keep terminology as "Vendor"** (vendors from evega are familiar with it)

**Technical Details:**
- **Keep route group as `(vendor)`** - don't rename
- **Add new B2B pages** to existing vendor dashboard
- **Reuse existing vendor authentication** (`requireVendor` middleware)
- **Reuse existing vendor tRPC procedures** - add B2B procedures
- **Access control**: Only approved vendors from evega can access

**File Reference:**
- Current: `src/app/(app)/vendor/*` (add B2B pages here)
- Current: `src/lib/middleware/vendor-auth.ts` (reuse existing)
- Current: `src/modules/vendor/server/procedures.ts` (add B2B procedures)

### Product Management

- [ ] **Task 7.2**: Update product management for B2B
  - Add MOQ field
  - Add bulk pricing tiers
  - Add B2B product fields
  - Update product form
  - Update product list/table

**Technical Details:**
- Modify product creation/edit forms
- Add bulk pricing tier editor
- MOQ validation
- B2B field display

### RFQ Management

- [ ] **Task 7.3**: Create RFQ management in supplier dashboard
  - Location: `src/app/(app)/supplier/rfqs/page.tsx`
  - List of RFQs (all, matched, my quotes)
  - RFQ detail page
  - Quote submission form
  - Quote management (edit, withdraw)

**Technical Details:**
- New pages in supplier dashboard
- RFQ listing with filters
- Quote form with pricing calculator
- Quote status tracking

### Inquiry Management

- [ ] **Task 7.4**: Create inquiry management in supplier dashboard
  - Location: `src/app/(app)/supplier/inquiries/page.tsx`
  - List of inquiries (new, replied, closed)
  - Inquiry detail/thread view
  - Reply to inquiries
  - Mark as read/unread

**Technical Details:**
- Inquiry listing page
- Thread view component
- Reply form
- Notification system

### Order Management

- [ ] **Task 7.5**: Update order management for B2B
  - B2B order status workflow
  - Payment tracking
  - Production status updates
  - Shipping management
  - Invoice generation

**Technical Details:**
- Update order management pages
- Add B2B status updates
- Payment milestone tracking
- Document generation

---

## Buyer Dashboard

### Buyer Portal

- [ ] **Task 8.1**: Create buyer dashboard
  - Location: `src/app/(app)/buyer/*`
  - Similar structure to supplier dashboard
  - Buyer-specific features:
    - RFQ creation
    - Product discovery
    - Inquiry management
    - Order tracking
    - Quote comparison

**Technical Details:**
- New route group for buyer dashboard
- Buyer authentication middleware
- Buyer layout with sidebar
- Buyer-specific navigation

### RFQ Creation

- [ ] **Task 8.2**: Create RFQ creation in buyer dashboard
  - Location: `src/app/(app)/buyer/rfqs/new/page.tsx`
  - Multi-step RFQ form
  - Product specification builder
  - Draft saving
  - RFQ publishing

**Technical Details:**
- RFQ creation form
- Product spec builder (dynamic fields)
- Image uploads
- Validation

### Product Discovery

- [ ] **Task 8.3**: Create product discovery for buyers
  - Product search with B2B filters (MOQ, price range, etc.)
  - Supplier search
  - Category browsing
  - Saved products/suppliers
  - Comparison tool

**Technical Details:**
- Enhanced product search
- B2B-specific filters
- Comparison functionality
- Favorites/saved items

### Order Tracking

- [ ] **Task 8.4**: Create order tracking for buyers
  - Order list
  - Order detail with timeline
  - Payment tracking
  - Shipping tracking
  - Document downloads (invoices, etc.)

**Technical Details:**
- Order tracking pages
- Status timeline component
- Payment status display
- Document download

---

## Search & Discovery

### Product Search

- [ ] **Task 9.1**: Enhance product search for B2B
  - B2B filters: MOQ, price range, bulk pricing, lead time
  - Supplier filters: verified, trade assurance, location
  - Category filters
  - Sort by: price, MOQ, supplier rating, etc.

**Technical Details:**
- Update search functionality
- Add B2B filter components
- Update search API/tRPC procedures
- Filter persistence in URL

### Supplier Search

- [ ] **Task 9.2**: Create supplier search
  - Search by company name, location, products
  - Filters: verified, trade assurance, certifications
  - Supplier directory page
  - Supplier profile pages

**Technical Details:**
- Supplier search page
- Supplier listing component
- Supplier profile template
- Filter components

### Category Browsing

- [ ] **Task 9.3**: Enhance category browsing
  - Category pages with B2B context
  - Category-specific filters
  - Supplier count per category
  - Product count per category

**Technical Details:**
- Update category pages
- Add B2B context
- Category statistics

### Filtering & Sorting

- [ ] **Task 9.4**: Implement advanced filtering
  - Price range slider
  - MOQ range
  - Supplier location
  - Certifications
  - Trade assurance
  - Verified suppliers only
  - Sort options

**Technical Details:**
- Filter component library
- URL query parameter management
- Filter state management
- Clear filters functionality

---

## Verification & Trust

### Company Verification

- [ ] **Task 10.1**: Implement company verification system
  - Verification workflow for suppliers and buyers
  - Document upload (business license, tax ID)
  - Admin approval process
  - Verification badge display
  - Benefits for verified companies

**Technical Details:**
- Verification fields in Suppliers/Buyers collections
- Document upload component
- Admin verification interface
- Badge display components

### Trade Assurance

- [ ] **Task 10.2**: Implement trade assurance program
  - Trade assurance enrollment
  - Escrow payment system
  - Dispute resolution
  - Refund protection
  - Trade assurance badge

**Technical Details:**
- Trade assurance enrollment flow
- Escrow integration (Stripe or custom)
- Dispute management system
- Badge display

### Certification Badges

- [ ] **Task 10.3**: Create certification badge system
  - Display supplier certifications
  - Verification badges
  - Trade assurance badge
  - Gold supplier badge
  - Badge display on profiles and product pages

**Technical Details:**
- Badge component library
- Badge display logic
- Badge styling
- Badge tooltips with details

### Rating & Reviews

- [ ] **Task 10.4**: Implement rating and review system
  - `Reviews` collection
  - Buyers can rate suppliers
  - Suppliers can rate buyers (optional)
  - Review display on profiles
  - Rating aggregation (average, count)

**Technical Details:**
- Reviews collection
- Rating component (stars)
- Review form
- Review moderation
- Rating display

---

## Payment & Finance

### B2B Payment Terms

- [ ] **Task 11.1**: Implement B2B payment terms
  - Payment term options: T/T, L/C, Credit, etc.
  - Payment schedule (milestone payments)
  - Deposit requirements
  - Payment tracking
  - Payment history

**Technical Details:**
- Payment terms field in orders
- Payment schedule array
- Payment status tracking
- Payment history display

### Trade Assurance Escrow

- [ ] **Task 11.2**: Implement escrow system
  - Escrow account creation
  - Payment holding
  - Release conditions
  - Dispute handling
  - Refund process

**Technical Details:**
- Stripe Connect or custom escrow
- Escrow workflow
- Dispute management
- Integration with orders

### Deposit System

- [ ] **Task 11.3**: Implement deposit system
  - Deposit requirement (percentage or fixed)
  - Deposit payment processing
  - Deposit tracking
  - Deposit refund (if order cancelled)

**Technical Details:**
- Deposit field in orders
- Deposit payment processing
- Deposit status tracking
- Refund logic

### Invoice Management

- [ ] **Task 11.4**: Create invoice system
  - Invoice generation (PDF)
  - Invoice numbering
  - Invoice status (draft, sent, paid, overdue)
  - Invoice download
  - Invoice history

**Technical Details:**
- Invoice PDF generation (PDFKit, jsPDF, or server-side)
- Invoice template
- Invoice storage
- Invoice download endpoint

---

## Admin Dashboard

### Supplier Approval

- [ ] **Task 12.1**: Enhance supplier approval in admin
  - Supplier verification workflow
  - Document review
  - Approval/rejection
  - Verification badge assignment
  - Trade assurance enrollment approval

**Technical Details:**
- Admin supplier management pages
- Document review interface
- Approval workflow
- Notification system

### Buyer Verification

- [ ] **Task 12.2**: Create buyer verification in admin
  - Buyer verification workflow
  - Document review
  - Approval/rejection
  - Verification badge assignment

**Technical Details:**
- Admin buyer management pages
- Verification workflow
- Badge assignment

### RFQ Moderation

- [ ] **Task 12.3**: Create RFQ moderation
  - RFQ review and approval
  - Inappropriate content moderation
  - RFQ status management
  - RFQ analytics

**Technical Details:**
- Admin RFQ management
- Moderation interface
- Analytics dashboard

### Platform Analytics

- [ ] **Task 12.4**: Create platform analytics
  - Supplier statistics
  - Buyer statistics
  - RFQ statistics
  - Order statistics
  - Revenue analytics
  - Growth metrics

**Technical Details:**
- Analytics dashboard
- Data aggregation
- Charts and graphs
- Export functionality

---

## Priority Levels

**High Priority (Phase 1 - MVP):**
- Foundation & Planning (Tasks 0.1-0.3)
- Suppliers Collection (Tasks 1.1-1.4)
- Buyers Collection (Tasks 2.1-2.3)
- B2B Products (Tasks 3.1-3.4)
- RFQ System (Tasks 4.1-4.3)
- Basic Inquiries (Task 5.1)
- B2B Orders (Tasks 6.1-6.2)
- Supplier Dashboard (Tasks 7.1-7.2)
- Buyer Dashboard (Tasks 8.1-8.2)
- Basic Search (Task 9.1)

**Medium Priority (Phase 2):**
- Product Catalogs (Task 3.2)
- Sample Requests (Task 3.5)
- RFQ Matching (Task 4.4)
- Messaging System (Tasks 5.2-5.3)
- Trade Assurance (Tasks 6.3, 10.2, 11.2)
- Payment Terms (Tasks 6.4, 11.1, 11.3)
- Inquiry Management (Tasks 7.4, 8.3)
- Order Tracking (Tasks 7.5, 8.4)
- Supplier/Buyer Search (Tasks 9.2-9.4)
- Verification (Tasks 10.1, 10.3)

**Low Priority (Phase 3):**
- Advanced Features
- Rating & Reviews (Task 10.4)
- Invoice Management (Task 11.4)
- Advanced Analytics (Task 12.4)
- Optimization & Performance

---

## Migration Checklist

### Step 1: Setup (Use Existing Codebase)
- [ ] **Use existing codebase** (no need to copy)
- [ ] **Use existing MongoDB database** (vendors need access)
- [ ] **Use existing Payload CMS instance**
- [ ] Update environment variables if needed
- [ ] Test existing vendor authentication works

### Step 2: Extend Collections (DO NOT Rename)
- [ ] **Keep `Vendors` collection** - add B2B fields to it
- [ ] Create `Buyers` collection (new, or extend Customers)
- [ ] **Keep existing vendor references** in codebase
- [ ] Update TypeScript types for new B2B fields

### Step 3: Add B2B Fields
- [ ] Add B2B fields to **existing Vendors** collection
- [ ] Add B2B fields to Buyers (or Customers)
- [ ] Add B2B fields to Products
- [ ] Add B2B fields to Orders

### Step 4: Create New Collections
- [ ] Create RFQs collection
- [ ] Create Quotes collection
- [ ] Create Inquiries collection
- [ ] Create Messages collection (if needed)
- [ ] Create SampleRequests collection
- [ ] Create ProductCatalogs collection

### Step 5: Extend Dashboards (DO NOT Rename)
- [ ] **Keep vendor dashboard** - add B2B pages to it
- [ ] Create buyer dashboard (new route group)
- [ ] Update admin dashboard with B2B features
- [ ] Update navigation (add B2B links to vendor dashboard)

### Step 6: Access Control
- [ ] **Verify vendor authentication** works for B2B features
- [ ] **Restrict B2B access** to only approved vendors from evega
- [ ] Add B2B feature flags (optional: enable/disable per vendor)
- [ ] Test access control thoroughly

### Step 7: Update UI/UX
- [ ] **Keep "Vendor" terminology** in vendor dashboard
- [ ] Use "Supplier" terminology in buyer-facing marketplace
- [ ] Update B2B-specific UI text
- [ ] Update branding/colors if needed
- [ ] Update logo and assets if needed

---

## Best Practices

1. **Use Existing Infrastructure**: Keep same database, same authentication, same vendors
2. **Incremental Development**: Build MVP first, then add advanced features
3. **Terminology**: Keep "Vendor" in vendor dashboard, use "Supplier" in buyer marketplace
4. **Access Control**: Only approved vendors from evega can access B2B features
5. **B2B Focus**: Remember B2B is about relationships, trust, and bulk transactions
6. **Verification**: Build trust through verification and trade assurance
7. **Communication**: Enable easy communication between buyers and suppliers
8. **Flexibility**: Support various payment terms and shipping options
9. **Scalability**: Design for high volume of products, suppliers, and orders
10. **Vendor Experience**: Make it seamless for existing evega vendors to use B2B features

---

## Notes

- **Access Control**: **ONLY vendors from existing evega platform can access supplier marketplace**
- **Shared Infrastructure**: Same database, same authentication, same Payload CMS instance
- **Vendors = Suppliers**: Existing evega vendors become suppliers (same collection, add B2B fields)
- **Can Reuse**: Most of the codebase structure can be reused
- **Needs Modification**: Add B2B fields to existing collections (don't rename)
- **Needs to Build**: RFQ system, messaging, trade assurance are new
- **Recommended Approach**: Extend existing codebase, add B2B features incrementally
- **Timeline**: MVP can be built in 2-3 months with focused development
- **Key Differentiator**: B2B focus on bulk orders, RFQs, and supplier-buyer relationships
- **Vendor Experience**: Seamless transition for existing evega vendors to use B2B features
