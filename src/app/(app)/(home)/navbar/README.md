# Navbar Components

This folder contains all the navigation bar components for the Evega e-commerce application.

## 📁 Files

### Core Components

- **`Navbar.tsx`** - Main navigation bar component
  - Primary navigation component rendered on all pages
  - Integrates search, checkout, and authentication features
  - Manages responsive layout for desktop and mobile views
  - Located at: `src/app/(app)/(home)/navbar/Navbar.tsx`

- **`navbar-sidebar.tsx`** - Mobile sidebar navigation component
  - Slide-in drawer for mobile devices
  - Displays navigation items and authentication options
  - Uses Sheet component from shadcn/ui
  - Located at: `src/app/(app)/(home)/navbar/navbar-sidebar.tsx`

- **`Logo.tsx`** - Logo component with navigation
  - Clickable logo that routes to home page
  - Uses Next.js Image component for optimization
  - Client component with router navigation
  - Located at: `src/app/(app)/(home)/navbar/Logo.tsx`

### Assets

- **`Logo.png`** - Evega logo image file
  - PNG format logo image
  - Created in canvas by Venkata Poluru
  - Imported directly in Logo.tsx component
  - Dimensions: 80x80px (display size)
  - Located at: `src/app/(app)/(home)/navbar/Logo.png`

### Documentation

- **`README.md`** - This documentation file
  - Comprehensive guide to navbar components
  - Usage examples and styling information
  - Architecture and dependency documentation 

## 🎯 Components Overview

### Navbar.tsx
The main navigation bar component that appears at the top of all application pages.

**Features:**
- Black background (`bg-black`)
- Responsive design (mobile and desktop)
- Integrated search bar with category dropdown
- Checkout button (desktop and mobile)
- Authentication buttons (Log in / Log out)
- Categories display below the navbar

**Structure:**
```
┌─────────────────────────────────────────────────┐
│ [Logo] [Search Bar] [Checkout] [Auth Buttons] │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ [Categories Dropdown Menu]                     │
└─────────────────────────────────────────────────┘
```

**Key Props/State:**
- Fetches categories via `trpc.categories.useQuery()`
- Manages sidebar open/close state
- Handles user authentication state
- Integrates `SearchInput` and `Categories` components

**Usage:**
```tsx
import { Navbar } from "@/app/(app)/(home)/navbar/Navbar";

// Rendered in layout.tsx to appear on all pages
<Navbar />
```

### navbar-sidebar.tsx
Mobile sidebar component that slides in from the left on mobile devices.

**Features:**
- Sheet component (slide-in drawer) from shadcn/ui
- Authentication links (Log in / Log out / Sign up)
- Admin Dashboard link (for logged-in users)
- "Start selling" link for non-authenticated users
- Scrollable content area using ScrollArea component
- Auto-closes on navigation or logout
- Conditional rendering based on authentication state
- Handles logout mutation with toast notifications

**Props:**
- `items: NavbarItem[]` - Navigation items (currently empty array)
- `open: boolean` - Controls sidebar visibility
- `onOpenChange: (open: boolean) => void` - Callback to toggle sidebar

**Dependencies:**
- Uses `trpc.auth.session.useQuery()` for authentication state
- Uses `trpc.auth.logout.useMutation()` for logout functionality
- Integrates with `@tanstack/react-query` for query invalidation
- Uses `sonner` for toast notifications

**Usage:**
```tsx
<NavbarSidebar
  items={[]}
  open={isSidebarOpen}
  onOpenChange={setIsSidebarOpen}
/>
```

**Note:** Currently receives an empty `items` array, but the component is designed to display navigation links when provided.

### Logo.tsx
Clickable logo component that navigates to the home page.

**Features:**
- 80x80px logo image with max size constraints
- Clickable button that routes to `/` using Next.js router
- Uses Next.js Image component for automatic optimization
- Hover effects disabled (transparent background)
- Client component (`'use client'`) for router functionality
- Object-contain styling to prevent image distortion

**Implementation Details:**
- Imports logo image directly from `./Logo.png`
- Uses `useRouter` from `next/navigation` for programmatic navigation
- Wrapped in Button component with ghost variant
- Includes JSDoc comments for documentation

**Usage:**
```tsx
import Logo from "./Logo";

<Logo />
```

**File Location:** `src/app/(app)/(home)/navbar/Logo.tsx`

## 🎨 Styling

### Navbar Colors
- **Background**: Black (`bg-black`)
- **Text**: White (for contrast on black background)
- **Borders**: Gray-700 (`border-gray-700`)
- **Hover States**: Gray-800 (`hover:bg-gray-800`)

### Search Bar
- White card container (`bg-white rounded-xl shadow-xl`)
- Integrated category dropdown
- Premium depth styling with gradient search button

### Categories Section
- Light gray background (`bg-[#F5F5F5]`)
- Displayed below the main navbar
- Horizontal category navigation with dropdowns

## 🔗 Dependencies

### External Components
- `SearchInput` - From `../search-filter/search-input`
- `Categories` - From `../search-filter/categories`
- `CheckoutButton` - From `@/modules/checkout/ui/components/checkout-button`

### tRPC Queries
- `trpc.categories.useQuery()` - Fetches category data
- `trpc.auth.session.useQuery()` - Gets user session
- `trpc.auth.logout.useMutation()` - Handles user logout

## 📱 Responsive Behavior

### Desktop (lg and above)
- Full navbar with all elements visible
- Checkout button in navbar
- Auth buttons in navbar
- Categories displayed below navbar

### Mobile
- Hamburger menu button
- Checkout button next to menu
- Sidebar slides in from left
- Search bar remains visible in navbar

## 🚀 Key Features

1. **Global Navigation** - Appears on all pages via layout
2. **Search Integration** - Search bar with category filtering
3. **Category Navigation** - Dropdown menus for browsing
4. **Shopping Cart** - Checkout button with item count
5. **Authentication** - Login/logout functionality
6. **Responsive Design** - Mobile-first approach

## 📝 Notes

- The navbar is rendered in `src/app/(app)/layout.tsx` to ensure it appears on all pages
- Categories are fetched server-side and passed to child components
- The search functionality uses URL query parameters via `nuqs`
- Logo image is imported directly from the same folder
