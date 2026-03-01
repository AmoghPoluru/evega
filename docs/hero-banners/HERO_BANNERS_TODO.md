# Hero Banners TODO List

> **Purpose**: This document serves as a comprehensive TODO list and implementation guide for the Hero Banners system in an Indian dress e-commerce site built with Next.js, Payload CMS, tRPC, and React.
>
> **For LLMs**: This file contains detailed task breakdowns, technical implementation details, and code references. Each task includes completion status, technical details, and file paths. Use this document to understand the current state of the hero banners implementation and to implement new features following the established patterns.

## System Overview

**Tech Stack:**
- **Frontend**: Next.js 16 (App Router), React, TypeScript, shadcn/ui components
- **Backend**: Payload CMS, tRPC for type-safe APIs
- **Database**: MongoDB (via Payload)
- **Image Optimization**: Next.js Image component with responsive sizes
- **State Management**: React Query (@tanstack/react-query) for server state

**Key Concepts:**
- **Template-Based System**: Multiple banner templates (Image+Text, Image+Text+Products, Slider, Split Layout)
- **CMS-Driven**: All banners managed through Payload CMS admin panel
- **Scheduling**: Auto-activate/deactivate banners based on start/end dates
- **Placement Control**: Show banners on homepage, category pages, or both
- **Theme Tags**: Organize banners by festival/season (Diwali, Navratri, Wedding, etc.)
- **Responsive Images**: Separate desktop and mobile images for optimal UX

**File Structure:**
- Hero banner pages: `src/app/(app)/(home)/page.tsx` (homepage with hero section)
- Hero banner components: `src/components/hero-banners-section.tsx`
- Hero banner templates: `src/components/hero-banners/templates/*`
- Hero banner collection: `src/collections/HeroBanners.ts`
- tRPC procedures: `src/trpc/routers/_app.ts` (heroBanners query)
- Seed script: `src/seed/seed-hero-banners.ts`

---

## Table of Contents

0. [Foundation & Collection Setup](#foundation--collection-setup)
   - [HeroBanners Collection](#herobanners-collection)
   - [Template System](#template-system)
   - [Field Definitions](#field-definitions)
1. [Template 1: Image + Text Overlay](#template-1-image--text-overlay)
   - [Collection Schema](#collection-schema)
   - [Frontend Component](#frontend-component)
   - [Backend Query](#backend-query)
2. [Template 2: Image + Text + Products](#template-2-image--text--products)
   - [Collection Schema](#collection-schema-1)
   - [Frontend Component](#frontend-component-1)
   - [Product Carousel](#product-carousel)
3. [Template 3: Multiple Images Slider](#template-3-multiple-images-slider)
   - [Collection Schema](#collection-schema-2)
   - [Frontend Component](#frontend-component-2)
   - [Auto-Slide Functionality](#auto-slide-functionality)
4. [Template 4: Split Layout](#template-4-split-layout)
   - [Collection Schema](#collection-schema-3)
   - [Frontend Component](#frontend-component-3)
5. [Template 5: Video Background (Advanced)](#template-5-video-background-advanced)
   - [Collection Schema](#collection-schema-4)
   - [Frontend Component](#frontend-component-4)
6. [Admin UI & Utilities](#admin-ui--utilities)
   - [Template Selection](#template-selection)
   - [Conditional Fields](#conditional-fields)
   - [Live Preview](#live-preview)
7. [Scheduling & Control](#scheduling--control)
   - [Date-Based Scheduling](#date-based-scheduling)
   - [Placement Control](#placement-control)
   - [Priority System](#priority-system)
8. [CTA & Linking](#cta--linking)
   - [CTA Link Types](#cta-link-types)
   - [Link Building Logic](#link-building-logic)
9. [Performance & Optimization](#performance--optimization)
   - [Image Optimization](#image-optimization)
   - [Lazy Loading](#lazy-loading)
   - [Caching](#caching)
10. [Analytics & Tracking](#analytics--tracking)
    - [Impression Tracking](#impression-tracking)
    - [Click Tracking](#click-tracking)
    - [Conversion Tracking](#conversion-tracking)
11. [Testing & Quality Assurance](#testing--quality-assurance)
    - [Component Testing](#component-testing)
    - [Integration Testing](#integration-testing)
    - [E2E Testing](#e2e-testing)

---

## Current Implementation Status

### ✅ Completed Features

**Collection & Backend:**
- ✅ HeroBanners collection created (`src/collections/HeroBanners.ts`)
- ✅ Collection registered in Payload config
- ✅ TypeScript types generated
- ✅ Access control: Public read, super-admin write
- ✅ Basic fields: title, subtitle, backgroundImage, products, isActive, order
- ✅ tRPC query: `heroBanners` procedure fetching active banners

**Frontend Components:**
- ✅ HeroBannersSection component (`src/components/hero-banners-section.tsx`)
- ✅ Homepage integration (`src/app/(app)/(home)/page.tsx`)
- ✅ Slider/carousel functionality with auto-play (3 seconds)
- ✅ Navigation arrows (prev/next)
- ✅ Dots indicator for slide navigation
- ✅ Product carousel at bottom of banner
- ✅ Responsive product layout (flex for ≤6, scroll for >6)
- ✅ Product card component (`HeroBannerProductCard`)
- ✅ Loading states and error handling
- ✅ Empty state with helpful message

**Product Carousel:**
- ✅ Horizontal scroll for many products (>6)
- ✅ Flex layout for few products (≤6)
- ✅ Product image optimization (Next.js Image)
- ✅ Placeholder handling for missing images
- ✅ Responsive sizing and gaps

### ❌ Missing Features (To Be Implemented)

**Template System:**
- ❌ Template selector field (currently all banners use same layout)
- ❌ Template-specific components (ImageTextTemplate, etc.)
- ❌ Template renderer component
- ❌ Conditional field visibility based on template

**CTA & Linking:**
- ❌ CTA button text field
- ❌ CTA link type selector
- ❌ CTA link value fields (product, category, collection, URL)
- ❌ CTA button in frontend component
- ❌ Link building logic in tRPC query

**Images:**
- ❌ Mobile-specific image field (currently only backgroundImage)
- ❌ Responsive image switching (desktop vs mobile)
- ❌ Background color fallback field

**Scheduling & Control:**
- ❌ Start date field (scheduling)
- ❌ End date field (scheduling)
- ❌ Date-based filtering in query
- ❌ Placement control (home, category, both)
- ❌ Placement filtering in query
- ❌ Theme tags (diwali, navratri, wedding, etc.)
- ❌ Priority field (currently using "order")

**Design Options:**
- ❌ Text alignment options (left, center, right)
- ❌ Configurable overlay strength (currently hardcoded)
- ❌ Background color fallback

**Additional Templates:**
- ❌ Template 3: Multiple Images Slider
- ❌ Template 4: Split Layout
- ❌ Template 5: Video Background

**Analytics:**
- ❌ Tracking ID field
- ❌ Impression tracking
- ❌ Click tracking
- ❌ Conversion tracking

### 📋 Current Implementation Details

**Collection Schema (Current):**
```typescript
{
  title: string (required)
  subtitle: string (optional)
  backgroundImage: upload (optional, relationTo: media)
  products: relationship[] (required, hasMany: true)
  isActive: boolean (default: true)
  order: number (default: 0)
}
```

**Frontend Component (Current):**
- Single component handles all banners
- Always shows products (required field)
- Hardcoded overlay: `bg-gradient-to-r from-black/40 to-transparent`
- Always left-aligned text
- No CTA button
- No mobile-specific images

**tRPC Query (Current):**
- Filters by `isActive: true`
- Sorts by `order` field
- Returns: id, title, subtitle, backgroundImage, products
- No template field, no CTA fields, no scheduling

### 🎯 Recommended Next Steps

1. **Phase 1: Enhance Current Implementation**
   - Make products field optional
   - Add CTA fields (ctaText, ctaLinkType, ctaLinkValue)
   - Add mobile image field
   - Add CTA button to frontend component

2. **Phase 2: Add Scheduling & Control**
   - Add startDate and endDate fields
   - Add placement and themeTag fields
   - Update query with date-based filtering
   - Update query with placement filtering

3. **Phase 3: Template System**
   - Add template selector field
   - Create template renderer component
   - Refactor current component to Template 2
   - Add Template 1 (Image + Text only, no products)

4. **Phase 4: Additional Templates**
   - Template 3: Multiple Images Slider
   - Template 4: Split Layout
   - Template 5: Video Background

---

## Foundation & Collection Setup

### HeroBanners Collection
- [x] **Task 0.1**: Create `src/collections/HeroBanners.ts` file ✅
  - Created HeroBanners collection to store banner content and configuration
  - Location: `src/collections/HeroBanners.ts`
- [ ] **Task 0.2**: Add template selector field (select: image-text, image-text-products, image-slider, split-layout, video)
  - Add template field as first field in collection for easy selection
  - Options: Image+Text, Image+Text+Products, Multiple Images Slider, Split Layout, Video Background
  - **Current State**: No template selector - all banners use same layout (Image + Text + Products)
- [x] **Task 0.3**: Add common fields (title, subtitle) ✅
  - Title: text, required ✅
  - Subtitle: text, optional ✅
  - **Missing**: ctaText, ctaLinkType, ctaLinkValue (CTA fields not yet implemented)
- [x] **Task 0.4**: Add basic control fields (isActive, order) ✅
  - isActive: checkbox, default true ✅
  - order: number, default 0 ✅
  - **Missing**: startDate, endDate (scheduling), priority (using order instead), placement, themeTag
- [ ] **Task 0.5**: Add UX enhancement fields (textAlignment, overlayStrength, backgroundColor, trackingId)
  - textAlignment: select (left, center, right)
  - overlayStrength: select (none, light, medium, dark)
  - backgroundColor: text (hex code fallback)
  - trackingId: text (analytics tracking)
  - **Current State**: Hardcoded overlay (bg-gradient-to-r from-black/40), no alignment options
- [x] **Task 0.6**: Register HeroBanners collection in `src/payload.config.ts` ✅
  - Collection registered and accessible
- [x] **Task 0.7**: Generate TypeScript types (`npm run generate:types`) ✅
  - Types generated and available
- [x] **Task 0.8**: Add access control (read: public, create/update/delete: super-admin only) ✅
  - Public read access for frontend display ✅
  - Super-admin only for create/update/delete operations ✅

**Technical Details:**
- Collection slug: `hero-banners`
- Admin title: Use `title` field as display name
- Hidden from non-super-admin users in admin panel
- Access control: Public read, super-admin write operations

### Template System
- [ ] **Task 0.9**: Implement template selector with visual previews
  - Create template selection UI in admin panel
  - Show thumbnail previews for each template type
  - Add descriptions for each template
- [ ] **Task 0.10**: Create template renderer component (`HeroBannerRenderer.tsx`)
  - Switch component that renders based on template type
  - Located at `src/components/hero-banners/HeroBannerRenderer.tsx`
- [ ] **Task 0.11**: Implement conditional field visibility using `admin.condition`
  - Show/hide fields based on selected template
  - Example: `admin: { condition: (data) => data.template === "image-text" }`

**Technical Details:**
- Template renderer uses switch statement on `banner.template`
- Each template has its own component in `src/components/hero-banners/templates/`
- Conditional fields use Payload's `admin.condition` function

### Field Definitions
- [ ] **Task 0.12**: Define desktop image field (upload, relationTo: media, required for templates 1,2,4,5)
  - Required for image-based templates
  - Recommended size: 1920x500px
- [ ] **Task 0.13**: Define mobile image field (upload, relationTo: media, optional)
  - Optional but recommended for better mobile UX
  - Recommended size: 768x500px
  - Falls back to desktop image if not provided
- [ ] **Task 0.14**: Define products field (relationship, hasMany, optional, for template 2)
  - Only shown when template is "image-text-products"
  - Supports 4-6 products for carousel
- [ ] **Task 0.15**: Define slides array field (for template 3)
  - Array of slide objects with image, mobileImage, title, subtitle, ctaText, ctaLink
  - Supports 2-4 slides

**Technical Details:**
- Image fields use Payload's upload field type with relationTo: "media"
- Products field uses relationship with hasMany: true
- Slides array uses Payload's array field type with nested fields

---

## Template 1: Image + Text Overlay

### Collection Schema
- [x] **Task 1.1**: Add backgroundImage field (currently named backgroundImage, not desktopImage) ✅
  - Upload field, relationTo: "media" ✅
  - **Current State**: Field exists as `backgroundImage` (not template-specific)
  - **Note**: Should be renamed to `desktopImage` and made template-specific
- [ ] **Task 1.2**: Add mobileImage field (optional when template is "image-text")
  - Upload field, relationTo: "media"
  - Condition: `data.template === "image-text"`
  - **Current State**: Not implemented - only backgroundImage exists
- [ ] **Task 1.3**: Add textAlignment field (select: left, center, right)
  - Default: "left"
  - Condition: `data.template === "image-text"`
  - **Current State**: Hardcoded to left alignment
- [x] **Task 1.4**: Basic overlay implemented (hardcoded) ✅
  - **Current State**: Hardcoded overlay `bg-gradient-to-r from-black/40 to-transparent`
  - **Missing**: Configurable overlay strength (none, light, medium, dark)

**Technical Details:**
- Current implementation: Single `backgroundImage` field (not template-specific)
- Overlay: Hardcoded gradient overlay, not configurable
- Text: Always left-aligned, no alignment options

### Frontend Component
- [x] **Task 1.5**: Create hero banner component ✅
  - Location: `src/components/hero-banners-section.tsx` ✅
  - **Current State**: Single component handles all banners (no template system yet)
- [x] **Task 1.6**: Implement image display ✅
  - Uses Next.js Image component ✅
  - **Current State**: Shows backgroundImage, no mobile-specific image
  - **Missing**: Responsive desktop/mobile image switching
- [x] **Task 1.7**: Implement text overlay ✅
  - Title and subtitle displayed ✅
  - **Current State**: Always left-aligned, no alignment options
- [x] **Task 1.8**: Basic overlay implemented ✅
  - **Current State**: Hardcoded `bg-gradient-to-r from-black/40 to-transparent`
  - **Missing**: Configurable overlay strength
- [ ] **Task 1.9**: Implement CTA button with link support
  - Show button if ctaText and ctaLink are provided
  - Use Next.js Link component for navigation
  - Style with yellow background (brand color)
  - **Current State**: No CTA button - only title/subtitle displayed
- [ ] **Task 1.10**: Add background color fallback
  - Show backgroundColor while image loads
  - Use inline style with backgroundColor prop
  - **Current State**: Gray gradient fallback when no image

**Technical Details:**
- Component: `HeroBannersSection` in `src/components/hero-banners-section.tsx`
- Image: Uses Next.js Image with `fill` and `object-cover` ✅
- Overlay: Hardcoded gradient, not configurable
- Text: Absolute positioned, always left-aligned

### Backend Query
- [x] **Task 1.11**: Basic tRPC `heroBanners` query exists ✅
  - Location: `src/trpc/routers/_app.ts` ✅
  - Returns: id, title, subtitle, backgroundImage, products ✅
  - **Missing**: template field, CTA fields, mobile image
- [ ] **Task 1.12**: Build CTA link based on ctaLinkType
  - Product: `/products/${productId}`
  - Category: `/${categorySlug}`
  - Collection: `/search?category=${collectionSlug}`
  - URL: Use ctaLinkUrl directly (handle relative/absolute)
  - **Current State**: No CTA link building - CTA fields don't exist
- [x] **Task 1.13**: Return background image URL ✅
  - Extracts from `banner.backgroundImage?.url` ✅
  - **Missing**: Mobile image URL (field doesn't exist)
- [ ] **Task 1.14**: Return text alignment and overlay strength
  - Include in banner response object
  - Default values if not set
  - **Current State**: Not in schema or query response

**Technical Details:**
- Query uses depth: 2 to populate image relationships
- CTA link building happens in tRPC procedure
- Image URLs extracted from populated media objects

---

## Template 2: Image + Text + Products

### Collection Schema
- [x] **Task 2.1**: Add products field (relationship, hasMany) ✅
  - RelationTo: "products" ✅
  - HasMany: true ✅
  - Required: true ✅
  - **Current State**: Products field exists and is required (not template-specific)
  - **Note**: Should be made optional and template-specific

**Technical Details:**
- Products field currently required for all banners
- Not template-specific - all banners must have products
- Should be optional for Template 1 (Image + Text only)

### Frontend Component
- [x] **Task 2.2**: Product carousel implemented ✅
  - Location: `src/components/hero-banners-section.tsx` ✅
  - **Current State**: All banners show products (no template system)
- [x] **Task 2.3**: Image and text logic implemented ✅
  - Image display ✅
  - Text overlay ✅
  - **Current State**: Combined in single component
- [x] **Task 2.4**: Product carousel at bottom of banner ✅
  - Horizontal scrollable carousel ✅
  - Display product images and names ✅
  - Clickable to product detail page ✅
- [x] **Task 2.5**: Responsive product carousel ✅
  - Flex layout for ≤6 products ✅
  - Scroll layout for >6 products ✅
  - Responsive gap spacing ✅
- [x] **Task 2.6**: Product card component exists ✅
  - Component: `HeroBannerProductCard` in `hero-banners-section.tsx` ✅
  - Displays product image and name ✅
  - Links to product detail page ✅

**Technical Details:**
- Carousel uses flexbox with gap spacing
- Products displayed in grid or flex layout
- Product cards use Next.js Image for optimization
- Scrollable on mobile with overflow-x-auto

### Product Carousel
- [x] **Task 2.7**: Implement horizontal scroll for many products (>6) ✅
  - Uses overflow-x-auto with scrollbar-hide ✅
  - Fixed width cards (200-300px) ✅
  - **Current State**: Implemented in `hero-banners-section.tsx` lines 168-180
- [x] **Task 2.8**: Implement flex layout for few products (≤6) ✅
  - Uses flex-1 to distribute evenly ✅
  - Full width utilization ✅
  - **Current State**: Implemented in `hero-banners-section.tsx` lines 150-162
- [x] **Task 2.9**: Add product image optimization ✅
  - Uses Next.js Image with proper sizes ✅
  - **Current State**: Implemented in `HeroBannerProductCard` component
- [x] **Task 2.10**: Handle missing product images ✅
  - Shows placeholder image (`/placeholder.png`) ✅
  - Graceful degradation ✅
  - **Current State**: Implemented in `HeroBannerProductCard` component line 28

**Technical Details:**
- Conditional rendering: flex for ≤6 products, scroll for >6
- Product cards: Fixed height, responsive width
- Image sizes: "(max-width: 768px) 50vw, 25vw"

---

## Current Implementation Summary

**What's Already Working:**
- ✅ HeroBanners collection created and registered
- ✅ Basic fields: title, subtitle, backgroundImage, products, isActive, order
- ✅ Frontend component: `HeroBannersSection` with slider functionality
- ✅ Product carousel with responsive layout (flex for ≤6, scroll for >6)
- ✅ Auto-play carousel (3 seconds)
- ✅ Navigation arrows and dots indicator
- ✅ tRPC query fetching active banners
- ✅ Homepage integration with Suspense

**What Needs to Be Added:**
- ❌ Template selector system (currently all banners use same layout)
- ❌ CTA button and link functionality
- ❌ Mobile-specific images
- ❌ Date-based scheduling (startDate, endDate)
- ❌ Placement control (home, category, both)
- ❌ Theme tags (diwali, navratri, etc.)
- ❌ Text alignment options
- ❌ Configurable overlay strength
- ❌ Additional templates (slider, split layout, video)
- ❌ Priority system (currently using "order" field)

**Next Steps:**
1. Add template selector field to collection
2. Make products field optional (currently required)
3. Add CTA fields (ctaText, ctaLinkType, ctaLinkValue)
4. Add mobile image field
5. Add scheduling fields (startDate, endDate)
6. Add placement and themeTag fields
7. Refactor component to support templates

---

## Template 3: Multiple Images Slider

### Collection Schema
- [ ] **Task 3.1**: Add slides array field (for template 3)
  - Condition: `data.template === "image-slider"`
  - Array of slide objects
  - Fields: image, mobileImage, title, subtitle, ctaText, ctaLink
- [ ] **Task 3.2**: Define slide object structure
  - image: upload, required
  - mobileImage: upload, optional
  - title: text, optional
  - subtitle: text, optional
  - ctaText: text, optional
  - ctaLink: text, optional

**Technical Details:**
- Slides array supports 2-4 slides
- Each slide can have its own content and CTA
- Slides are independent banner units

### Frontend Component
- [ ] **Task 3.3**: Create `ImageSliderTemplate.tsx` component
  - Location: `src/components/hero-banners/templates/ImageSliderTemplate.tsx`
  - Props: banner object with slides array
- [ ] **Task 3.4**: Implement slide rendering
  - Map over slides array
  - Render each slide with image and optional text
- [ ] **Task 3.5**: Implement auto-slide functionality
  - Auto-advance every 3-5 seconds
  - Pause on hover
  - Resume on mouse leave
- [ ] **Task 3.6**: Add navigation arrows (prev/next)
  - Left/right arrow buttons
  - Positioned absolutely
  - Only show if multiple slides
- [ ] **Task 3.7**: Add slide indicators (dots)
  - Show dots for each slide
  - Active dot highlighted
  - Clickable to jump to slide
- [ ] **Task 3.8**: Implement slide transitions
  - Smooth fade or slide animation
  - CSS transitions for performance
- [ ] **Task 3.9**: Add touch/swipe support for mobile
  - Detect touch events
  - Swipe left/right to change slides
  - Prevent default scroll during swipe

**Technical Details:**
- Auto-slide: setInterval with cleanup on unmount
- Transitions: CSS opacity or transform animations
- Touch: Use touchstart, touchmove, touchend events
- State: Track current slide index with useState

### Auto-Slide Functionality
- [ ] **Task 3.10**: Implement auto-advance timer
  - 3-5 second interval between slides
  - Clear interval on component unmount
- [ ] **Task 3.11**: Pause on user interaction
  - Pause on hover
  - Pause on arrow click
  - Pause on dot click
- [ ] **Task 3.12**: Resume after interaction
  - Resume after mouse leave
  - Resume after manual navigation
- [ ] **Task 3.13**: Disable auto-slide for single slide
  - Only enable if slides.length > 1

**Technical Details:**
- Use useEffect with setInterval
- Clear interval with cleanup function
- Track pause state with useState

---

## Template 4: Split Layout

### Collection Schema
- [ ] **Task 4.1**: Add split layout specific fields
  - leftImage: upload, optional (for left side)
  - rightImage: upload, required (for right side)
  - description: textarea, optional (longer text content)
  - Condition: `data.template === "split-layout"`

**Technical Details:**
- Split layout: Text on left, image on right
- More space for detailed copy
- Optional left image for visual balance

### Frontend Component
- [ ] **Task 4.2**: Create `SplitLayoutTemplate.tsx` component
  - Location: `src/components/hero-banners/templates/SplitLayoutTemplate.tsx`
  - Props: banner object with split layout fields
- [ ] **Task 4.3**: Implement two-column layout
  - Left column: Text content (title, subtitle, description, CTA)
  - Right column: Large product/image
  - 50/50 split on desktop
- [ ] **Task 4.4**: Implement responsive stacking
  - Stack vertically on mobile
  - Text first, then image
- [ ] **Task 4.5**: Add description field support
  - Display longer text content
  - Proper typography and spacing
- [ ] **Task 4.6**: Style left column content
  - Vertical centering
  - Proper spacing between elements
  - Readable typography

**Technical Details:**
- Layout: CSS Grid or Flexbox
- Desktop: `grid-cols-2` or `flex-row`
- Mobile: `flex-col` for stacking
- Content: Use flexbox for vertical centering

---

## Template 5: Video Background (Advanced)

### Collection Schema
- [ ] **Task 5.1**: Add video fields (for template 5)
  - videoUrl: text, optional (video file URL or YouTube/Vimeo embed)
  - videoPoster: upload, required (fallback image)
  - Condition: `data.template === "video"`
- [ ] **Task 5.2**: Add video playback controls
  - autoplay: checkbox, default true
  - loop: checkbox, default true
  - muted: checkbox, default true (required for autoplay)

**Technical Details:**
- Video: Support MP4, WebM formats
- Poster: Required fallback image
- Autoplay: Must be muted for browser compatibility

### Frontend Component
- [ ] **Task 5.3**: Create `VideoTemplate.tsx` component
  - Location: `src/components/hero-banners/templates/VideoTemplate.tsx`
  - Props: banner object with video fields
- [ ] **Task 5.4**: Implement video element
  - Use HTML5 video tag
  - Set autoplay, loop, muted attributes
  - Fallback to poster image
- [ ] **Task 5.5**: Add video loading states
  - Show poster while loading
  - Handle video load errors
- [ ] **Task 5.6**: Implement text overlay on video
  - Same text overlay as Template 1
  - Ensure readability over video
- [ ] **Task 5.7**: Add video controls (optional)
  - Play/pause button
  - Volume control
  - Fullscreen option

**Technical Details:**
- Video: Use `<video>` element with source tags
- Poster: Set poster attribute for fallback
- Overlay: Same overlay logic as Template 1
- Performance: Lazy load video, optimize file size

---

## Admin UI & Utilities

### Template Selection
- [ ] **Task 6.1**: Create template selection UI in admin panel
  - Visual cards for each template
  - Icons or thumbnails
  - Descriptions
- [ ] **Task 6.2**: Add template preview thumbnails
  - Show example layout for each template
  - Help users choose appropriate template
- [ ] **Task 6.3**: Position template selector prominently
  - First field in form
  - Sidebar position for easy access
  - Clear labeling

**Technical Details:**
- Use Payload's select field with custom options
- Add descriptions to each option
- Consider custom admin component for visual selection

### Conditional Fields
- [ ] **Task 6.4**: Implement conditional field visibility
  - Use `admin.condition` for all template-specific fields
  - Show only relevant fields based on template
- [ ] **Task 6.5**: Group fields by section
  - Content section (title, subtitle, CTA)
  - Images section (desktop, mobile)
  - Design section (alignment, overlay)
  - Scheduling section (dates, priority)
- [ ] **Task 6.6**: Add field descriptions and help text
  - Clear descriptions for each field
  - Recommended image sizes
  - Usage examples

**Technical Details:**
- Conditional logic: `admin: { condition: (data) => data.template === "..." }`
- Field groups: Use Payload's group field type
- Help text: Use `admin.description` property

### Live Preview
- [ ] **Task 6.7**: Create preview component for admin
  - Show real-time preview as user types
  - Desktop and mobile views
- [ ] **Task 6.8**: Implement preview toggle
  - Switch between desktop/mobile preview
  - Update in real-time
- [ ] **Task 6.9**: Add preview refresh button
  - Manual refresh if needed
  - Show latest changes

**Technical Details:**
- Preview: Use same template components
- Real-time: React state updates
- Responsive: Show both desktop and mobile views

---

## Scheduling & Control

### Date-Based Scheduling
- [ ] **Task 7.1**: Implement start date filtering
  - Banner shows only after startDate (if set)
  - Query: `startDate <= now OR startDate is null`
- [ ] **Task 7.2**: Implement end date filtering
  - Banner stops showing after endDate (if set)
  - Query: `endDate >= now OR endDate is null`
- [ ] **Task 7.3**: Update tRPC query with date logic
  - Build where clause with date conditions
  - Combine with isActive check
- [ ] **Task 7.4**: Add timezone handling
  - Use UTC for date comparisons
  - Display dates in user's timezone
- [ ] **Task 7.5**: Add date validation
  - End date must be after start date
  - Show validation errors in admin

**Technical Details:**
- Date queries: Use Payload's date operators
- Timezone: Store dates in UTC, convert for display
- Validation: Zod schema validation in tRPC

### Placement Control
- [ ] **Task 7.6**: Implement placement filtering in query
  - Filter by placement: home, category, both
  - Pass placement param from page component
- [ ] **Task 7.7**: Update homepage to fetch home banners
  - Call `heroBanners.useQuery({ placement: "home" })`
  - Or placement: "both"
- [ ] **Task 7.8**: Update category pages to fetch category banners
  - Call `heroBanners.useQuery({ placement: "category" })`
  - Or placement: "both"
- [ ] **Task 7.9**: Add placement selector in admin
  - Dropdown with options
  - Default: "home"

**Technical Details:**
- Query: Add placement to tRPC input schema
- Filter: `where: { or: [{ placement: input.placement }, { placement: "both" }] }`
- Pages: Pass placement from page context

### Priority System
- [ ] **Task 7.10**: Implement priority sorting
  - Sort by priority field (ascending)
  - Lower numbers = higher priority
- [ ] **Task 7.11**: Update tRPC query to sort by priority
  - Add `sort: "priority"` to Payload query
- [ ] **Task 7.12**: Add priority input in admin
  - Number input field
  - Default: 0
  - Help text: "Lower numbers appear first"

**Technical Details:**
- Sorting: Payload sort parameter
- Priority: Number field, negative for highest priority
- Display: Banners shown in priority order

---

## CTA & Linking

### CTA Link Types
- [ ] **Task 8.1**: Implement product link type
  - Store product relationship
  - Build link: `/products/${productId}`
- [ ] **Task 8.2**: Implement category link type
  - Store category relationship
  - Build link: `/${categorySlug}`
- [ ] **Task 8.3**: Implement collection link type
  - Store category slug as text
  - Build link: `/search?category=${slug}`
- [ ] **Task 8.4**: Implement custom URL link type
  - Store URL as text
  - Handle relative and absolute URLs
  - Validate URL format

**Technical Details:**
- Link types: Conditional fields based on ctaLinkType
- Relationships: Use Payload relationship fields
- URL handling: Check if starts with "http" for absolute

### Link Building Logic
- [ ] **Task 8.5**: Create link builder function
  - Takes banner object
  - Returns link URL or null
  - Handles all link types
- [ ] **Task 8.6**: Implement in tRPC query
  - Build links server-side
  - Return ctaLink in response
- [ ] **Task 8.7**: Handle missing relationships
  - Return null if product/category not found
  - Log warnings for debugging
- [ ] **Task 8.8**: Validate URLs
  - Check URL format
  - Ensure relative URLs start with "/"

**Technical Details:**
- Builder: Function in tRPC procedure
- Validation: Zod schema for URL validation
- Errors: Return null on invalid links

---

## Performance & Optimization

### Image Optimization
- [ ] **Task 9.1**: Use Next.js Image component
  - Replace img tags with Image component
  - Proper sizing and optimization
- [ ] **Task 9.2**: Add responsive image sizes
  - Desktop: 1920px width
  - Mobile: 768px width
  - Use sizes attribute
- [ ] **Task 9.3**: Implement WebP/AVIF support
  - Next.js handles automatically
  - Ensure proper image formats
- [ ] **Task 9.4**: Optimize image file sizes
  - Compress images before upload
  - Target <300KB for first banner
- [ ] **Task 9.5**: Add image lazy loading
  - Lazy load non-first slides
  - Use loading="lazy" for below-fold images

**Technical Details:**
- Next.js Image: Automatic optimization
- Sizes: "(max-width: 768px) 100vw, 1920px"
- Priority: Set priority={true} for first banner

### Lazy Loading
- [ ] **Task 9.6**: Implement lazy loading for slider
  - Load images on slide change
  - Preload next slide
- [ ] **Task 9.7**: Add intersection observer
  - Load banner when in viewport
  - Reduce initial load time
- [ ] **Task 9.8**: Optimize product carousel loading
  - Lazy load product images
  - Load on scroll into view

**Technical Details:**
- Intersection Observer: Use for viewport detection
- Preloading: Use link rel="preload" for next slide
- Lazy: Use loading="lazy" attribute

### Caching
- [ ] **Task 9.9**: Add React Query caching
  - Cache banner queries
  - Set appropriate stale time
- [ ] **Task 9.10**: Implement cache invalidation
  - Invalidate on banner update
  - Refresh on admin changes
- [ ] **Task 9.11**: Add CDN caching for images
  - Use CDN for media files
  - Set cache headers

**Technical Details:**
- React Query: Use staleTime and cacheTime
- Invalidation: Use queryClient.invalidateQueries
- CDN: Configure in Next.js or Payload

---

## Analytics & Tracking

### Impression Tracking
- [ ] **Task 10.1**: Add impression tracking
  - Track when banner is viewed
  - Use trackingId if provided
- [ ] **Task 10.2**: Implement viewport detection
  - Track when banner enters viewport
  - Use Intersection Observer
- [ ] **Task 10.3**: Send impression events to analytics
  - Google Analytics or custom endpoint
  - Include trackingId in event

**Technical Details:**
- Observer: Intersection Observer API
- Analytics: Send to analytics service
- Events: Custom event with banner data

### Click Tracking
- [ ] **Task 10.4**: Add click tracking to CTA button
  - Track CTA button clicks
  - Include trackingId
- [ ] **Task 10.5**: Track product carousel clicks
  - Track product clicks in carousel
  - Link to product detail
- [ ] **Task 10.6**: Send click events to analytics
  - Google Analytics events
  - Custom analytics endpoint

**Technical Details:**
- Click handlers: onClick events on buttons/links
- Analytics: Send events with banner context
- Tracking: Include trackingId in events

### Conversion Tracking
- [ ] **Task 10.7**: Track banner to collection conversion
  - Track when user clicks banner → views collection
  - Measure conversion rate
- [ ] **Task 10.8**: Track banner to add to cart
  - Track when user adds product from banner
  - Measure purchase funnel
- [ ] **Task 10.9**: Create analytics dashboard
  - Show banner performance metrics
  - Click-through rates
  - Conversion rates

**Technical Details:**
- Funnel: Track user journey from banner
- Events: Custom analytics events
- Dashboard: Aggregate and display metrics

---

## Testing & Quality Assurance

### Component Testing
- [ ] **Task 11.1**: Write unit tests for ImageTextTemplate
  - Test rendering with different props
  - Test responsive behavior
- [ ] **Task 11.2**: Write unit tests for ImageTextProductsTemplate
  - Test product carousel rendering
  - Test with different product counts
- [ ] **Task 11.3**: Write unit tests for ImageSliderTemplate
  - Test slide navigation
  - Test auto-slide functionality
- [ ] **Task 11.4**: Write unit tests for HeroBannerRenderer
  - Test template switching
  - Test with different template types

**Technical Details:**
- Testing: React Testing Library
- Mock: Mock tRPC queries
- Coverage: Aim for 80%+ coverage

### Integration Testing
- [ ] **Task 11.5**: Test tRPC heroBanners query
  - Test date filtering
  - Test placement filtering
  - Test priority sorting
- [ ] **Task 11.6**: Test CTA link building
  - Test all link types
  - Test invalid links
- [ ] **Task 11.7**: Test scheduling logic
  - Test start date filtering
  - Test end date filtering
  - Test active banners

**Technical Details:**
- Integration: Test tRPC procedures
- Database: Use test database
- Coverage: Test all query paths

### E2E Testing
- [ ] **Task 11.8**: Test banner display on homepage
  - Verify banner shows correctly
  - Test responsive behavior
- [ ] **Task 11.9**: Test banner display on category pages
  - Verify placement filtering
  - Test category-specific banners
- [ ] **Task 11.10**: Test CTA button navigation
  - Test all link types
  - Verify correct navigation
- [ ] **Task 11.11**: Test scheduling
  - Create banner with future start date
  - Verify it doesn't show
  - Update date and verify it shows

**Technical Details:**
- E2E: Playwright or Cypress
- Scenarios: Full user flows
- Coverage: Critical paths

---

## Priority Legend

- **P0**: Critical - Must have for MVP (Template 1, basic scheduling)
- **P1**: High - Important for launch (Template 2, placement control)
- **P2**: Medium - Nice to have (Template 3, analytics)
- **P3**: Low - Future enhancement (Template 4, Template 5, advanced features)

---

## Best Practices & Tips

### 1. Template Selection
- Start with Template 1 (Image + Text) - simplest and most common
- Add Template 2 (Products) for product showcases
- Use Template 3 (Slider) for multiple campaigns
- Template 4 (Split) for detailed messaging
- Template 5 (Video) for premium campaigns

### 2. Image Optimization
- Always provide both desktop and mobile images
- Compress images before upload (<300KB)
- Use WebP/AVIF formats when possible
- Test image loading on slow connections

### 3. Scheduling
- Set start dates 1-2 days before festival
- Set end dates 1-2 days after festival
- Create default banner with no dates
- Use priority for important banners

### 4. CTA Best Practices
- Use action-based text ("Shop Now", "Explore")
- Keep CTA text short (2-4 words)
- Test different CTA texts
- Ensure CTA is visible and clickable

### 5. Performance
- Lazy load non-first banners
- Optimize images before upload
- Use Next.js Image component
- Cache banner queries appropriately

---

## Notes

- All banners should be CMS-driven (no hardcoded banners)
- Templates make it easy for marketing to create banners
- Scheduling enables automatic festival campaigns
- Placement control allows targeted banner display
- Analytics help measure banner effectiveness

---

**Last Updated**: [Current Date]
**Status**: Planning Phase
