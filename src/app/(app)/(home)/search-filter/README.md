# Search Filter Components

This folder contains all the components and utilities related to product search and filtering functionality in the application.

## 📁 Folder Structure

```
search-filter/
├── README.md                    # This file - documentation
├── search-input.tsx             # Search input with category dropdown
├── categories.tsx               # Categories display component
├── category-dropdown.tsx        # Individual category dropdown with subcategories
├── subcategory-menu.tsx         # Subcategory menu popup
├── categories-sidebar.tsx       # Mobile sidebar for categories
├── breadcrumb-navigation.tsx    # Breadcrumb navigation component
└── use-dropdown-position.ts     # Utility hook for dropdown positioning
```

## 🎯 Components Overview

### 1. `SearchInput` (`search-input.tsx`)

**Purpose**: Main search input component with integrated category filter dropdown.

**Features**:
- Text input for search queries
- Category dropdown selector (defaults to "All")
- Search button with orange-to-yellow gradient
- Enter key support for quick search
- Navigation to `/search` page with query parameters

**Props**:
```typescript
interface Props {
  disabled?: boolean;
  defaultValue?: string | undefined;
  onChange?: (value: string) => void;
  categories?: Category[];
}
```

**Key Functionality**:
- When a category is selected (not "All"), search is scoped to that category
- Navigates to `/search?search={term}&category={slug}` format
- Syncs with URL query parameters via `useProductFilters` hook
- Only triggers search on button click or Enter key (not on every keystroke)

**Usage Example**:
```tsx
<SearchInput 
  categories={categoriesData} 
  defaultValue={searchTerm}
  onChange={(value) => console.log(value)}
/>
```

---

### 2. `Categories` (`categories.tsx`)

**Purpose**: Displays all top-level categories as clickable dropdown buttons.

**Features**:
- Renders category dropdowns in a flex wrap layout
- Highlights active category based on current route
- Uses `CategoryDropdown` component for each category

**Props**:
```typescript
interface Props {
  data: Category[];
}
```

**Usage Example**:
```tsx
<Categories data={categoriesData} />
```

---

### 3. `CategoryDropdown` (`category-dropdown.tsx`)

**Purpose**: Individual category button with hover-triggered subcategory menu.

**Features**:
- Clickable category button that links to category page
- Hover to reveal subcategory menu
- Visual indicator (triangle) when subcategories are available
- Active state styling when on category page

**Props**:
```typescript
interface Props {
  category: Category;
  isActive?: boolean;
  isNavigationHovered?: boolean;
}
```

**Behavior**:
- Opens subcategory menu on mouse enter (if subcategories exist)
- Closes on mouse leave
- Links to `/{category.slug}` route

---

### 4. `SubcategoryMenu` (`subcategory-menu.tsx`)

**Purpose**: Popup menu displaying subcategories for a parent category.

**Features**:
- Appears on hover over parent category
- Displays subcategories in a styled menu
- Links to `/{categorySlug}/{subcategorySlug}` routes

---

### 5. `CategoriesSidebar` (`categories-sidebar.tsx`)

**Purpose**: Mobile-friendly sidebar for category navigation.

**Features**:
- Uses Sheet component for mobile overlay
- Displays categories and subcategories in a collapsible format
- Optimized for touch interactions

---

### 6. `BreadcrumbNavigation` (`breadcrumb-navigation.tsx`)

**Purpose**: Breadcrumb trail showing current category/subcategory location.

**Features**:
- Shows category and subcategory hierarchy
- Links back to parent category
- Only renders when on a category page

**Props**:
```typescript
interface Props {
  activeCategoryName?: string | null;
  activeCategory?: string | null;
  activeSubcategoryName?: string | null;
}
```

---

## 🔄 Search Flow

### 1. User Interaction
```
User types "kitchen" → Selects "Hotelmart" category → Clicks search button
```

### 2. Navigation
```
Navigates to: /search?search=kitchen&category=hotelmart
```

### 3. Search Page Processing
- Reads `search` and `category` from URL parameters
- Fetches category name from database for display
- Passes `categorySlug` to `ProductListView`
- `ProductListView` passes it to `ProductList`
- `ProductList` includes category in tRPC query

### 4. Backend Filtering
- Backend receives `category` slug and `search` term
- Filters products by category (and subcategories)
- Searches within filtered products for matching name, tags, or description

---

## 🎨 Styling

### Search Input
- **Container**: White card with shadow-xl, rounded-xl
- **Category Dropdown**: Gray gradient background (from-gray-50 to-gray-100)
- **Input Field**: White background, gray text
- **Search Button**: Orange-to-yellow gradient (from-orange-500 via-orange-400 to-yellow-400)
- **Hover States**: Enhanced gradients and shadows

### Categories
- **Container**: Flex wrap layout with gap-2
- **Category Buttons**: Transparent background, hover to white with border
- **Active State**: White background with primary border
- **Open State**: Shadow effect with translate transform

---

## 🔌 Dependencies

### External Libraries
- `next/navigation` - For routing and navigation
- `lucide-react` - For icons (SearchIcon, ChevronDown)
- `@/components/ui/*` - Shadcn UI components (Button, Sheet, Breadcrumb)

### Internal Modules
- `@/modules/products/hooks/use-product-filters` - URL state management
- `@/payload-types` - TypeScript types for Payload CMS
- `@/lib/utils` - Utility functions (cn for className merging)

---

## 📝 Key Features

### 1. Category-Scoped Search
When a category is selected:
- Search is limited to products in that category (and its subcategories)
- URL includes both `search` and `category` parameters
- Search page title shows category name

### 2. URL State Management
- Uses `nuqs` library for URL query parameter management
- Search term and filters are synced with URL
- Browser back/forward buttons work correctly
- Shareable search URLs

### 3. Search Triggering
- **Button Click**: Triggers search immediately
- **Enter Key**: Triggers search on Enter key press
- **No Auto-Search**: Does NOT search on every keystroke (better UX and performance)

### 4. Search Scope
Backend searches across:
- Product `name` (contains match)
- Product `tags.name` (contains match)
- Product `description` (contains match)

---

## 🚀 Usage Examples

### Basic Search Input
```tsx
import { SearchInput } from "@/app/(app)/(home)/search-filter/search-input";

<SearchInput 
  categories={categories} 
/>
```

### In Navbar
```tsx
// src/app/(app)/(home)/navbar/Navbar.tsx
{categoriesData && (
  <div className="w-full bg-white rounded-xl shadow-xl p-1">
    <SearchInput categories={categoriesData as any} />
  </div>
)}
```

---

## 🔧 Configuration

### Search Page Route
The search functionality navigates to `/search` page located at:
```
src/app/(app)/(home)/search/page.tsx
```

### URL Format
- **All Categories**: `/search?search=kitchen`
- **Specific Category**: `/search?search=kitchen&category=hotelmart`

### Category Filtering
The backend automatically includes subcategories when filtering by a parent category. For example, searching in "Retail" will also search in all its subcategories.

---

## 🐛 Troubleshooting

### Search Not Working
1. Check that `categories` prop is passed correctly
2. Verify URL parameters are being set: `/search?search=...&category=...`
3. Check browser console for errors
4. Verify tRPC query is receiving correct parameters

### Category Dropdown Not Showing
1. Ensure `categories` array is not empty
2. Check that category data includes `name` and `slug` fields
3. Verify `Category` type matches Payload CMS schema

### Search Results Not Filtered by Category
1. Verify category slug is in URL: `?category=hotelmart`
2. Check backend `productsRouter.getMany` procedure
3. Ensure category exists in database with matching slug

---

## 📚 Related Files

- **Search Page**: `src/app/(app)/(home)/search/page.tsx`
- **Product Filters**: `src/modules/products/ui/components/product-filters.tsx`
- **Product List**: `src/modules/products/ui/components/product-list.tsx`
- **Product Filters Hook**: `src/modules/products/hooks/use-product-filters.ts`
- **Search Params**: `src/modules/products/search-params.ts`
- **Backend Procedures**: `src/modules/products/server/procedures.ts`

---

## 🔄 Future Enhancements

Potential improvements:
- [ ] Search suggestions/autocomplete
- [ ] Recent searches history
- [ ] Search analytics
- [ ] Advanced filters (price range, tags) in search input
- [ ] Voice search support
- [ ] Search result highlighting

---

## 📄 License

Part of the Evega e-commerce application.
