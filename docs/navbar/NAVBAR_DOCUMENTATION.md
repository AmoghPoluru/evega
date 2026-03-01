# Navbar System - Comprehensive TODO List

> **Purpose**: This document serves as a comprehensive TODO list and implementation guide for the Navbar system in a multi-vendor e-commerce marketplace built with Next.js, Payload CMS, tRPC, and Stripe.
>
> **For LLMs**: This file contains detailed task breakdowns, technical implementation details, and code references. Each task includes completion status, technical details, and file paths. Use this document to understand the current state of the navbar implementation and to implement new features following the established patterns.

## System Overview

**What is the Navbar System?**
- **Global Navigation** - Primary navigation component appearing on all application pages
- **Search Integration** - Integrated search bar with category filtering
- **Shopping Cart Access** - Checkout button with real-time item count
- **Authentication Controls** - Login/logout functionality with session management
- **Category Navigation** - Category dropdown menus displayed below navbar
- **Responsive Design** - Adapts layout for mobile and desktop devices

**In this project, the Navbar provides:**
- Consistent navigation across all pages
- Search functionality with category filtering
- Shopping cart access with item count
- User authentication controls (login/logout)
- Category navigation with subcategory dropdowns
- Mobile-responsive sidebar menu

**Key Concepts:**
- **Layout Integration**: Navbar rendered in `src/app/(app)/layout.tsx` to appear on all pages
- **tRPC Integration**: Uses tRPC queries for categories, session, and cart data
- **State Management**: Local state for sidebar, tRPC for session/categories, Zustand for cart
- **Responsive Design**: Desktop layout with all elements visible, mobile layout with sidebar
- **Component Composition**: Navbar composed of Logo, SearchInput, CheckoutButton, NavbarSidebar, Categories

**File Structure:**
- Main navbar: `src/app/(app)/(home)/navbar/Navbar.tsx`
- Sidebar: `src/app/(app)/(home)/navbar/navbar-sidebar.tsx`
- Logo: `src/app/(app)/(home)/navbar/Logo.tsx`
- Logo image: `src/app/(app)/(home)/navbar/Logo.png`
- Layout integration: `src/app/(app)/layout.tsx`

---

## Table of Contents

1. [Setup & File Structure](#setup--file-structure)
2. [Navbar Component](#navbar-component)
3. [Logo Component](#logo-component)
4. [NavbarSidebar Component](#navbarsidebar-component)
5. [Search Integration](#search-integration)
6. [Category Integration](#category-integration)
7. [Checkout Integration](#checkout-integration)
8. [Authentication Integration](#authentication-integration)
9. [State Management](#state-management)
10. [Styling & Theming](#styling--theming)
11. [Responsive Design](#responsive-design)
12. [Layout Integration](#layout-integration)
13. [Testing & Quality Assurance](#testing--quality-assurance)
14. [Troubleshooting](#troubleshooting)
15. [Best Practices & Enhancements](#best-practices--enhancements)

---

## Setup & File Structure

### Directory Structure
- [x] **Task 1.1**: Create navbar directory structure ✅
  - Create `src/app/(app)/(home)/navbar/` directory for navbar components
- [x] **Task 1.2**: Create main Navbar component file ✅
  - Create `Navbar.tsx` as main navbar component with "use client" directive
- [x] **Task 1.3**: Create NavbarSidebar component file ✅
  - Create `navbar-sidebar.tsx` for mobile sidebar drawer component
- [x] **Task 1.4**: Create Logo component file ✅
  - Create `Logo.tsx` for clickable logo component with navigation
- [x] **Task 1.5**: Add logo image asset ✅
  - Add `Logo.png` image file (80x80px) to navbar directory
- [ ] **Task 1.6**: Create navbar types file
  - Create `types.ts` for shared TypeScript interfaces (NavbarItem, etc.)
- [ ] **Task 1.7**: Create navbar constants file
  - Create `constants.ts` for navbar configuration (breakpoints, colors, etc.)
- [ ] **Task 1.8**: Create navbar hooks file
  - Create `hooks.ts` for custom hooks (useNavbarState, useNavbarAuth, etc.)

**Technical Details:**
- Directory: `src/app/(app)/(home)/navbar/` contains all navbar-related components
- Components: All components are client components ("use client") for interactivity
- Assets: Logo image stored in same directory as components for easy import

---

## Navbar Component

### Component Setup
- [x] **Task 2.1**: Create Navbar component with "use client" directive ✅
  - Create `Navbar.tsx` as client component for interactivity
- [x] **Task 2.2**: Add navbar container with black background ✅
  - Add main container div with `bg-black` class and fixed height `h-20`
- [x] **Task 2.3**: Add navbar layout structure (flex container) ✅
  - Add flex container with `flex items-center justify-between` for element alignment
- [x] **Task 2.4**: Add navbar padding and spacing ✅
  - Add `px-4` padding and `gap-2` spacing between elements
- [x] **Task 2.5**: Add navbar border styling ✅
  - Add `border-b border-gray-700` for bottom border separation

### Component Integration
- [x] **Task 2.6**: Import and render Logo component ✅
  - Import Logo component and render in navbar container
- [x] **Task 2.7**: Import and render SearchInput component ✅
  - Import SearchInput from `../search-filter/search-input` and pass categories prop
- [x] **Task 2.8**: Import and render CheckoutButton component ✅
  - Import CheckoutButton from `@/modules/checkout/ui/components/checkout-button` and render
- [x] **Task 2.9**: Import and render Categories component ✅
  - Import Categories from `../search-filter/categories` and render below navbar
- [x] **Task 2.10**: Add NavbarSidebar component with state management ✅
  - Import NavbarSidebar, add state `isSidebarOpen`, pass props for open/close control

### State Management
- [x] **Task 2.11**: Add sidebar state with useState ✅
  - Add `const [isSidebarOpen, setIsSidebarOpen] = useState(false)` for sidebar visibility
- [x] **Task 2.12**: Add session query with tRPC ✅
  - Add `trpc.auth.session.useQuery()` to fetch current user session
- [x] **Task 2.13**: Add categories query with tRPC ✅
  - Add `trpc.categories.useQuery()` to fetch category data for navigation
- [x] **Task 2.14**: Add isLoggedIn computed state ✅
  - Add `const isLoggedIn = !!session?.user` to determine authentication status
- [ ] **Task 2.15**: Add loading states for queries
  - Add loading states from queries to show loading indicators during data fetching
- [ ] **Task 2.16**: Add error handling for queries
  - Add error handling for failed queries with error messages or fallback UI

### Authentication UI
- [x] **Task 2.17**: Add login button for unauthenticated users ✅
  - Add "Log in" button that links to `/sign-in` when user is not logged in
- [x] **Task 2.18**: Add logout button for authenticated users ✅
  - Add "Log out" button that triggers logout mutation when user is logged in
- [x] **Task 2.19**: Add logout mutation handler ✅
  - Create logout mutation with `trpc.auth.logout.useMutation()` and success/error handlers
- [x] **Task 2.20**: Add logout success handler (query invalidation, redirect, toast) ✅
  - Add onSuccess handler that invalidates session query, redirects to home, shows success toast
- [x] **Task 2.21**: Add logout error handler (toast notification) ✅
  - Add onError handler that shows error toast with error message
- [ ] **Task 2.22**: Add signup button for unauthenticated users
  - Add "Sign up" button that links to `/sign-up` when user is not logged in
- [ ] **Task 2.23**: Add user profile dropdown for authenticated users
  - Add dropdown menu with user profile link, orders link, settings, logout option

### Responsive Layout
- [x] **Task 2.24**: Add desktop layout (all elements visible) ✅
  - Add `hidden lg:flex` classes to show all elements in single row on desktop
- [x] **Task 2.25**: Add mobile layout (hamburger menu) ✅
  - Add `flex lg:hidden` classes to show hamburger menu button on mobile
- [x] **Task 2.26**: Add hamburger menu button ✅
  - Add Menu icon button that opens sidebar when clicked on mobile
- [ ] **Task 2.27**: Add mobile search bar optimization
  - Optimize search bar display on mobile (smaller size, different layout)
- [ ] **Task 2.28**: Add sticky navbar behavior
  - Add `sticky top-0 z-50` classes to make navbar stick to top on scroll

**Technical Details:**
- Component: Client component with "use client" directive for interactivity
- Layout: Flex container with responsive classes for desktop/mobile layouts
- State: Local state for sidebar, tRPC queries for session and categories
- Styling: Black background, white text, gray borders for brand consistency

---

## Logo Component

### Component Setup
- [x] **Task 3.1**: Create Logo component with "use client" directive ✅
  - Create `Logo.tsx` as client component for navigation interactivity
- [x] **Task 3.2**: Import Next.js Image component ✅
  - Import `Image` from `next/image` for optimized image rendering
- [x] **Task 3.3**: Import useRouter hook ✅
  - Import `useRouter` from `next/navigation` for programmatic navigation
- [x] **Task 3.4**: Import Button component ✅
  - Import `Button` from `@/components/ui/button` for clickable logo wrapper
- [x] **Task 3.5**: Import logo image asset ✅
  - Import `Logo.png` from same directory as component

### Logo Implementation
- [x] **Task 3.6**: Add Button wrapper with ghost variant ✅
  - Wrap Image in Button with `variant="ghost"` for transparent background
- [x] **Task 3.7**: Add onClick handler for home navigation ✅
  - Add `onClick={() => router.push('/')}` to navigate to home page on click
- [x] **Task 3.8**: Add Image component with optimized settings ✅
  - Add Image component with `height={80}`, `width={80}`, `alt="Evega Logo"`
- [x] **Task 3.9**: Add responsive sizing constraints ✅
  - Add `style={{ maxHeight: '80px', maxWidth: '80px' }}` for size constraints
- [x] **Task 3.10**: Add hover state styling ✅
  - Add `hover:bg-transparent` class to prevent background on hover
- [ ] **Task 3.11**: Add logo loading state
  - Add loading placeholder or skeleton while logo image loads
- [ ] **Task 3.12**: Add logo error fallback
  - Add error fallback (text or default image) if logo fails to load

**Technical Details:**
- Image: Uses Next.js Image component for automatic optimization and lazy loading
- Navigation: Uses Next.js router for client-side navigation to home page
- Styling: Ghost button variant for transparent background, hover states disabled
- Size: Fixed 80x80px dimensions with max constraints for responsive behavior

---

## NavbarSidebar Component

### Component Setup
- [x] **Task 4.1**: Create NavbarSidebar component with "use client" directive ✅
  - Create `navbar-sidebar.tsx` as client component for mobile sidebar drawer
- [x] **Task 4.2**: Import Sheet component from shadcn/ui ✅
  - Import `Sheet` from `@/components/ui/sheet` for slide-in drawer functionality
- [x] **Task 4.3**: Import ScrollArea component ✅
  - Import `ScrollArea` from `@/components/ui/scroll-area` for scrollable content
- [x] **Task 4.4**: Define Props interface ✅
  - Define interface with `items: NavbarItem[]`, `open: boolean`, `onOpenChange: (open: boolean) => void`
- [x] **Task 4.5**: Define NavbarItem interface ✅
  - Define interface with `href: string` and `children: React.ReactNode` for navigation items

### Sidebar Implementation
- [x] **Task 4.6**: Add Sheet component with left side positioning ✅
  - Add Sheet with `side="left"` prop for left-side slide-in drawer
- [x] **Task 4.7**: Add Sheet open/onOpenChange props ✅
  - Pass `open` and `onOpenChange` props to Sheet for visibility control
- [x] **Task 4.8**: Add ScrollArea for scrollable content ✅
  - Wrap sidebar content in ScrollArea for long content scrolling
- [x] **Task 4.9**: Add navigation items rendering ✅
  - Map over `items` prop to render navigation links in sidebar
- [x] **Task 4.10**: Add session query for auth state ✅
  - Add `trpc.auth.session.useQuery()` to get current user session
- [x] **Task 4.11**: Add isLoggedIn computed state ✅
  - Add `const isLoggedIn = !!session?.user` for authentication check

### Authentication Links
- [x] **Task 4.12**: Add login link for unauthenticated users ✅
  - Add "Log in" link that navigates to `/sign-in` when user not logged in
- [x] **Task 4.13**: Add signup link for unauthenticated users ✅
  - Add "Sign up" link that navigates to `/sign-up` when user not logged in
- [x] **Task 4.14**: Add logout button for authenticated users ✅
  - Add "Log out" button that triggers logout mutation when user logged in
- [x] **Task 4.15**: Add logout mutation handler ✅
  - Create logout mutation with success handler that closes sidebar and redirects
- [x] **Task 4.16**: Add admin dashboard link for authenticated users ✅
  - Add "Admin Dashboard" link that navigates to `/admin` for logged-in users
- [ ] **Task 4.17**: Add user profile link for authenticated users
  - Add "Profile" link that navigates to user profile page
- [ ] **Task 4.18**: Add orders link for authenticated users
  - Add "My Orders" link that navigates to orders history page

### Sidebar Behavior
- [x] **Task 4.19**: Add auto-close on navigation ✅
  - Add `onClick={() => onOpenChange(false)}` to navigation links to close sidebar
- [x] **Task 4.20**: Add auto-close on logout ✅
  - Close sidebar in logout success handler with `onOpenChange(false)`
- [ ] **Task 4.21**: Add sidebar backdrop click to close
  - Ensure Sheet backdrop click closes sidebar (default Sheet behavior)
- [ ] **Task 4.22**: Add keyboard escape to close
  - Ensure ESC key closes sidebar (default Sheet behavior)
- [ ] **Task 4.23**: Add sidebar animation customization
  - Customize Sheet animation duration and easing for smoother transitions

### Styling
- [x] **Task 4.24**: Add sidebar background styling ✅
  - Add white background and proper padding for sidebar content
- [x] **Task 4.25**: Add navigation link hover states ✅
  - Add hover states with black background and white text for links
- [ ] **Task 4.26**: Add sidebar header section
  - Add header section with logo or title at top of sidebar
- [ ] **Task 4.27**: Add sidebar footer section
  - Add footer section with additional links or information at bottom

**Technical Details:**
- Component: Client component using Sheet from shadcn/ui for drawer functionality
- Props: Receives items array, open state, and onOpenChange callback from parent
- Behavior: Auto-closes on navigation, logout, or backdrop click
- Styling: White background, scrollable content, hover states for links

---

## Search Integration

### SearchInput Integration
- [x] **Task 5.1**: Import SearchInput component ✅
  - Import SearchInput from `../search-filter/search-input` in Navbar component
- [x] **Task 5.2**: Pass categories data to SearchInput ✅
  - Pass `categoriesData` from tRPC query as prop to SearchInput component
- [x] **Task 5.3**: Ensure nuqs provider in layout ✅
  - Verify NuqsAdapter is in layout for URL state management in SearchInput
- [ ] **Task 5.4**: Add search input loading state
  - Show loading indicator in SearchInput while categories are loading
- [ ] **Task 5.5**: Add search input error handling
  - Handle search input errors (failed category fetch, navigation errors)
- [ ] **Task 5.6**: Add search input keyboard shortcuts
  - Add keyboard shortcut (e.g., Ctrl+K) to focus search input
- [ ] **Task 5.7**: Add search input autocomplete
  - Add autocomplete suggestions based on search history or popular searches
- [ ] **Task 5.8**: Add search input recent searches
  - Display recent searches dropdown when search input is focused

**Technical Details:**
- Integration: SearchInput receives categories prop for category filtering
- State: Uses nuqs for URL state management, navigates to `/search` with query params
- Flow: User types search → SearchInput → URL params → Search page renders results

---

## Category Integration

### Categories Component Integration
- [x] **Task 6.1**: Import Categories component ✅
  - Import Categories from `../search-filter/categories` in Navbar component
- [x] **Task 6.2**: Pass categories data to Categories component ✅
  - Pass `categoriesData` from tRPC query as prop to Categories component
- [x] **Task 6.3**: Render Categories below navbar ✅
  - Render Categories component below main navbar container
- [ ] **Task 6.4**: Add categories loading state
  - Show loading skeleton or spinner while categories are loading
- [ ] **Task 6.5**: Add categories error handling
  - Handle categories fetch errors with error message or fallback UI
- [ ] **Task 6.6**: Add categories empty state
  - Show empty state message when no categories are available
- [ ] **Task 6.7**: Add categories scrollable container
  - Make categories section horizontally scrollable on mobile devices
- [ ] **Task 6.8**: Add categories dropdown menus
  - Ensure subcategory dropdown menus work correctly in Categories component

**Technical Details:**
- Integration: Categories component displays below navbar with category navigation
- Data: Receives categories data from tRPC query with subcategories
- Navigation: Handles category and subcategory navigation to category pages

---

## Checkout Integration

### CheckoutButton Integration
- [x] **Task 7.1**: Import CheckoutButton component ✅
  - Import CheckoutButton from `@/modules/checkout/ui/components/checkout-button` in Navbar
- [x] **Task 7.2**: Render CheckoutButton in navbar ✅
  - Render CheckoutButton component in navbar container (desktop and mobile)
- [x] **Task 7.3**: Ensure CheckoutButton displays cart count ✅
  - Verify CheckoutButton displays cart item count from Zustand store
- [ ] **Task 7.4**: Add checkout button loading state
  - Show loading indicator in CheckoutButton while cart count is loading
- [ ] **Task 7.5**: Add checkout button error handling
  - Handle CheckoutButton errors (cart store initialization failures)
- [ ] **Task 7.6**: Add checkout button tooltip
  - Add tooltip showing "View Cart" or cart item details on hover
- [ ] **Task 7.7**: Add checkout button badge animation
  - Add animation to cart count badge when items are added/removed
- [ ] **Task 7.8**: Add checkout button accessibility
  - Add ARIA labels and keyboard navigation support for CheckoutButton

**Technical Details:**
- Integration: CheckoutButton uses Zustand cart store internally for cart state
- Display: Shows cart item count badge, links to checkout page on click
- State: Cart state managed by Zustand store with localStorage persistence

---

## Authentication Integration

### Session Management
- [x] **Task 8.1**: Add session query in Navbar ✅
  - Add `trpc.auth.session.useQuery()` to fetch current user session
- [x] **Task 8.2**: Add session query in NavbarSidebar ✅
  - Add `trpc.auth.session.useQuery()` in sidebar for auth state
- [x] **Task 8.3**: Add isLoggedIn computed state ✅
  - Compute `isLoggedIn = !!session?.user` in both Navbar and NavbarSidebar
- [ ] **Task 8.4**: Add session query caching
  - Configure session query caching to reduce unnecessary refetches
- [ ] **Task 8.5**: Add session query refetch on focus
  - Configure session query to refetch when window regains focus

### Logout Functionality
- [x] **Task 8.6**: Add logout mutation in Navbar ✅
  - Create logout mutation with `trpc.auth.logout.useMutation()` in Navbar
- [x] **Task 8.7**: Add logout mutation in NavbarSidebar ✅
  - Create logout mutation with `trpc.auth.logout.useMutation()` in NavbarSidebar
- [x] **Task 8.8**: Add logout success handler (query invalidation) ✅
  - Add onSuccess handler that invalidates session query with `queryClient.invalidateQueries()`
- [x] **Task 8.9**: Add logout success handler (redirect) ✅
  - Add redirect to home page (`router.push("/")`) in logout success handler
- [x] **Task 8.10**: Add logout success handler (toast notification) ✅
  - Add success toast notification ("Logged out successfully") in logout success handler
- [x] **Task 8.11**: Add logout error handler (toast notification) ✅
  - Add error toast notification with error message in logout error handler
- [ ] **Task 8.12**: Add logout confirmation dialog
  - Add confirmation dialog before logging out to prevent accidental logouts
- [ ] **Task 8.13**: Add logout loading state
  - Show loading indicator on logout button during logout mutation

### Login/Signup Links
- [x] **Task 8.14**: Add login link/button for unauthenticated users ✅
  - Add "Log in" link that navigates to `/sign-in` when user not logged in
- [x] **Task 8.15**: Add signup link for unauthenticated users ✅
  - Add "Sign up" link that navigates to `/sign-up` when user not logged in
- [ ] **Task 8.16**: Add user profile link for authenticated users
  - Add "Profile" link that navigates to user profile page when logged in
- [ ] **Task 8.17**: Add orders link for authenticated users
  - Add "My Orders" link that navigates to orders history page when logged in

**Technical Details:**
- Session: Uses tRPC `auth.session.useQuery()` to get current user session
- Logout: Uses tRPC `auth.logout.useMutation()` with query invalidation and redirect
- State: Computes `isLoggedIn` from session data to conditionally render auth UI

---

## State Management

### Local State
- [x] **Task 9.1**: Add sidebar state with useState ✅
  - Add `const [isSidebarOpen, setIsSidebarOpen] = useState(false)` for sidebar visibility
- [ ] **Task 9.2**: Add search input focus state
  - Add state to track search input focus for keyboard shortcut handling
- [ ] **Task 9.3**: Add navbar scroll state
  - Add state to track navbar scroll position for sticky behavior or shadow effects

### tRPC Queries
- [x] **Task 9.4**: Add categories query ✅
  - Add `trpc.categories.useQuery()` to fetch category data for navigation
- [x] **Task 9.5**: Add session query ✅
  - Add `trpc.auth.session.useQuery()` to fetch current user session
- [ ] **Task 9.6**: Add query error handling
  - Add error handling for failed queries with error messages or fallback UI
- [ ] **Task 9.7**: Add query loading states
  - Add loading states from queries to show loading indicators during data fetching
- [ ] **Task 9.8**: Add query refetch configuration
  - Configure query refetch intervals, on focus, on reconnect for better UX

### Cart State (External)
- [x] **Task 9.9**: Ensure CheckoutButton uses cart store ✅
  - Verify CheckoutButton uses Zustand cart store internally for cart state
- [ ] **Task 9.10**: Add cart state synchronization
  - Ensure cart state syncs across navbar and other components using cart

**Technical Details:**
- Local state: useState for component-specific state (sidebar visibility)
- tRPC queries: React Query for server state (categories, session)
- Cart state: Zustand store with localStorage persistence (managed by CheckoutButton)

---

## Styling & Theming

### Color Scheme
- [x] **Task 10.1**: Add navbar black background ✅
  - Add `bg-black` class to navbar container for brand consistency
- [x] **Task 10.2**: Add navbar border styling ✅
  - Add `border-b border-gray-700` for bottom border separation
- [x] **Task 10.3**: Add white text color ✅
  - Add `text-white` class for text contrast on black background
- [x] **Task 10.4**: Add link hover states ✅
  - Add `hover:text-orange-600` for link hover color changes
- [ ] **Task 10.5**: Add navbar theme customization
  - Add theme configuration for easy color scheme changes
- [ ] **Task 10.6**: Add dark/light mode support
  - Add dark/light mode toggle with appropriate color schemes

### Typography
- [x] **Task 10.7**: Add Poppins font for navbar ✅
  - Add Poppins font (weight 700) for brand consistency in navbar
- [x] **Task 10.8**: Add font size classes ✅
  - Add `text-lg` for buttons and `text-base` for links
- [ ] **Task 10.9**: Add font weight variations
  - Add different font weights for different navbar elements (bold for active, normal for links)

### Spacing & Layout
- [x] **Task 10.10**: Add navbar fixed height ✅
  - Add `h-20` class for fixed 80px navbar height
- [x] **Task 10.11**: Add navbar padding ✅
  - Add `px-4` padding for horizontal spacing
- [x] **Task 10.12**: Add element gap spacing ✅
  - Add `gap-2` for spacing between navbar elements
- [ ] **Task 10.13**: Add navbar shadow on scroll
  - Add shadow effect when navbar becomes sticky on scroll
- [ ] **Task 10.14**: Add navbar backdrop blur
  - Add backdrop blur effect for modern glassmorphism look

**Technical Details:**
- Colors: Black background, white text, gray borders, orange hover states
- Typography: Poppins font (weight 700) for brand, system default for body
- Spacing: Fixed 80px height, 16px horizontal padding, 8px element gaps

---

## Responsive Design

### Desktop Layout (≥ 1024px)
- [x] **Task 11.1**: Add desktop layout classes ✅
  - Add `hidden lg:flex` classes to show desktop layout on large screens
- [x] **Task 11.2**: Add desktop element arrangement ✅
  - Arrange Logo, SearchInput, CheckoutButton, Auth buttons in single row
- [x] **Task 11.3**: Hide sidebar on desktop ✅
  - Hide hamburger menu button and sidebar on desktop with `lg:hidden`
- [ ] **Task 11.4**: Add desktop search bar full width
  - Make search bar take full available width on desktop
- [ ] **Task 11.5**: Add desktop category navigation
  - Ensure category navigation displays properly below navbar on desktop

### Mobile Layout (< 1024px)
- [x] **Task 11.6**: Add mobile layout classes ✅
  - Add `flex lg:hidden` classes to show mobile layout on small screens
- [x] **Task 11.7**: Add hamburger menu button ✅
  - Add Menu icon button that opens sidebar on mobile
- [x] **Task 11.8**: Add mobile element arrangement ✅
  - Arrange Logo, Search, CheckoutButton, Menu button in compact row
- [x] **Task 11.9**: Show sidebar on mobile ✅
  - Show sidebar drawer when hamburger menu clicked on mobile
- [ ] **Task 11.10**: Add mobile search bar optimization
  - Optimize search bar size and layout for mobile screens
- [ ] **Task 11.11**: Add mobile category scroll
  - Make categories section horizontally scrollable on mobile

### Breakpoint Configuration
- [x] **Task 11.12**: Use lg breakpoint (1024px) ✅
  - Use `lg:` prefix (1024px) as breakpoint for desktop/mobile switching
- [ ] **Task 11.13**: Add responsive font sizes
  - Add responsive font sizes (smaller on mobile, larger on desktop)
- [ ] **Task 11.14**: Add responsive spacing
  - Add responsive padding and gaps (smaller on mobile, larger on desktop)
- [ ] **Task 11.15**: Add tablet layout optimization
  - Add specific layout optimizations for tablet screens (768px - 1024px)

**Technical Details:**
- Breakpoint: `lg:` prefix (1024px) used for desktop/mobile switching
- Desktop: All elements visible in single row, sidebar hidden
- Mobile: Compact layout with hamburger menu, sidebar slides in from left

---

## Layout Integration

### App Layout Integration
- [x] **Task 12.1**: Import Navbar in layout.tsx ✅
  - Import Navbar component in `src/app/(app)/layout.tsx`
- [x] **Task 12.2**: Render Navbar in layout ✅
  - Render Navbar component in layout to appear on all pages
- [x] **Task 12.3**: Ensure TRPCReactProvider in layout ✅
  - Verify TRPCReactProvider wraps Navbar for tRPC queries to work
- [x] **Task 12.4**: Ensure NuqsAdapter in layout ✅
  - Verify NuqsAdapter wraps Navbar for SearchInput URL state management
- [ ] **Task 12.5**: Add layout error boundary
  - Add error boundary around Navbar to prevent layout crashes
- [ ] **Task 12.6**: Add layout loading state
  - Add loading state for layout while Navbar queries are loading

### Route Group Integration
- [x] **Task 12.7**: Ensure Navbar in (app) route group ✅
  - Verify Navbar is in `(app)` route group to appear on all app routes
- [ ] **Task 12.8**: Add Navbar exclusion for specific routes
  - Add logic to hide Navbar on specific routes (e.g., admin panel, auth pages)
- [ ] **Task 12.9**: Add Navbar conditional rendering
  - Add conditional rendering based on route or user role

**Technical Details:**
- Layout: Navbar rendered in `src/app/(app)/layout.tsx` to appear on all pages
- Providers: TRPCReactProvider and NuqsAdapter must wrap Navbar for functionality
- Route group: Navbar in `(app)` route group ensures it appears on all app routes

---

## Testing & Quality Assurance

### Component Testing
- [ ] **Task 13.1**: Test Navbar component rendering
  - Write test to verify Navbar renders correctly with all child components
- [ ] **Task 13.2**: Test Logo component navigation
  - Write test to verify Logo navigates to home page on click
- [ ] **Task 13.3**: Test NavbarSidebar open/close
  - Write test to verify sidebar opens and closes correctly
- [ ] **Task 13.4**: Test logout functionality
  - Write test to verify logout mutation is called and redirects correctly
- [ ] **Task 13.5**: Test authentication UI rendering
  - Write test to verify login/logout buttons render based on auth state

### Integration Testing
- [ ] **Task 13.6**: Test search integration
  - Write test to verify SearchInput receives categories and navigates correctly
- [ ] **Task 13.7**: Test category integration
  - Write test to verify Categories component receives and displays categories
- [ ] **Task 13.8**: Test checkout button integration
  - Write test to verify CheckoutButton displays cart count and links correctly
- [ ] **Task 13.9**: Test responsive layout switching
  - Write test to verify desktop/mobile layouts switch at correct breakpoint
- [ ] **Task 13.10**: Test tRPC query integration
  - Write test to verify categories and session queries are called correctly

### E2E Testing
- [ ] **Task 13.11**: Test navbar navigation flow
  - Write E2E test for complete navbar navigation (logo, search, checkout, auth)
- [ ] **Task 13.12**: Test mobile sidebar flow
  - Write E2E test for mobile sidebar open, navigation, close flow
- [ ] **Task 13.13**: Test authentication flow
  - Write E2E test for login/logout flow through navbar

**Technical Details:**
- Unit tests: Test individual components and their functionality
- Integration tests: Test component interactions and data flow
- E2E tests: Test complete user flows through navbar

---

## Troubleshooting

### Common Issues
- [ ] **Task 14.1**: Fix navbar not appearing on pages
  - Verify Navbar is in layout.tsx, check route is in (app) route group, ensure no conflicting layouts
- [ ] **Task 14.2**: Fix search not working
  - Check nuqs provider is in layout, verify SearchInput receives categories prop, check console errors
- [ ] **Task 14.3**: Fix cart count not updating
  - Verify Zustand store is working, check localStorage for cart data, ensure useCart hook is used correctly
- [ ] **Task 14.4**: Fix sidebar not opening
  - Check isSidebarOpen state, verify setIsSidebarOpen is passed correctly, check Sheet component is imported
- [ ] **Task 14.5**: Fix logout not working
  - Check tRPC mutation is called, verify query invalidation, check for error messages in console
- [ ] **Task 14.6**: Fix categories not loading
  - Check tRPC categories query, verify categories data structure, check network tab for errors
- [ ] **Task 14.7**: Fix session not updating
  - Check tRPC session query, verify query invalidation on logout, check authentication state
- [ ] **Task 14.8**: Fix responsive layout issues
  - Check breakpoint classes (lg:), verify Tailwind config, test on different screen sizes

### Debug Checklist
- [ ] **Task 14.9**: Create debug checklist
  - Create checklist: Navbar in layout, tRPC provider present, categories loading, session working, cart initialized, no console errors, responsive breakpoints working
- [ ] **Task 14.10**: Add error logging
  - Add error logging for navbar component errors, query failures, navigation errors

**Technical Details:**
- Common issues: Navbar visibility, search functionality, cart count, sidebar, logout, categories, session, responsive layout
- Debug: Check layout integration, providers, queries, state management, console errors

---

## Best Practices & Enhancements

### Performance
- [ ] **Task 15.1**: Add query result caching
  - Configure tRPC query caching for categories and session to reduce refetches
- [ ] **Task 15.2**: Add image optimization
  - Ensure Logo uses Next.js Image component with proper optimization settings
- [ ] **Task 15.3**: Add code splitting
  - Lazy load NavbarSidebar component to reduce initial bundle size
- [ ] **Task 15.4**: Add memoization
  - Use React.memo for Navbar child components to prevent unnecessary re-renders
- [ ] **Task 15.5**: Add debouncing for search
  - Add debouncing to search input to reduce unnecessary API calls

### Accessibility
- [x] **Task 15.6**: Add logo alt text ✅
  - Add descriptive alt text ("Evega Logo") to Logo Image component
- [ ] **Task 15.7**: Add keyboard navigation
  - Ensure all interactive elements (buttons, links) are keyboard accessible
- [ ] **Task 15.8**: Add ARIA labels
  - Add ARIA labels to buttons, links, and interactive elements for screen readers
- [ ] **Task 15.9**: Add focus indicators
  - Add visible focus indicators for keyboard navigation
- [ ] **Task 15.10**: Add semantic HTML
  - Use semantic HTML elements (nav, button, link) for proper structure

### Code Organization
- [x] **Task 15.11**: Separate components into files ✅
  - Each component (Navbar, NavbarSidebar, Logo) in separate file
- [ ] **Task 15.12**: Add TypeScript interfaces
  - Create shared TypeScript interfaces file for NavbarItem, Props, etc.
- [ ] **Task 15.13**: Add JSDoc comments
  - Add JSDoc comments to components, functions, and props for documentation
- [ ] **Task 15.14**: Add constants file
  - Create constants file for navbar configuration (breakpoints, colors, routes)
- [ ] **Task 15.15**: Add custom hooks
  - Extract reusable logic into custom hooks (useNavbarState, useNavbarAuth)

### Enhancements
- [ ] **Task 15.16**: Add navbar notifications
  - Add notification badge or dropdown for user notifications
- [ ] **Task 15.17**: Add navbar user menu
  - Add user profile dropdown menu with profile, orders, settings, logout
- [ ] **Task 15.18**: Add navbar search suggestions
  - Add search suggestions dropdown based on popular searches or history
- [ ] **Task 15.19**: Add navbar breadcrumbs
  - Add breadcrumb navigation below navbar for better navigation context
- [ ] **Task 15.20**: Add navbar language selector
  - Add language selector dropdown for multi-language support

**Technical Details:**
- Performance: Query caching, image optimization, code splitting, memoization, debouncing
- Accessibility: Alt text, keyboard navigation, ARIA labels, focus indicators, semantic HTML
- Code organization: Component separation, TypeScript interfaces, JSDoc comments, constants, custom hooks
- Enhancements: Notifications, user menu, search suggestions, breadcrumbs, language selector

---

## Summary

### ✅ Completed Tasks (Foundation)
1. **Setup** - Directory structure, component files, logo asset
2. **Navbar Component** - Main navbar with layout, state, authentication UI
3. **Logo Component** - Clickable logo with navigation
4. **NavbarSidebar Component** - Mobile sidebar with navigation and auth
5. **Integration** - Search, Categories, Checkout, Authentication
6. **Styling** - Color scheme, typography, spacing
7. **Responsive Design** - Desktop and mobile layouts
8. **Layout Integration** - Navbar in app layout

### ⏳ Remaining Tasks (Enhancements)
1. **Performance** - Query caching, code splitting, memoization
2. **Accessibility** - Keyboard navigation, ARIA labels, focus indicators
3. **Testing** - Unit tests, integration tests, E2E tests
4. **Enhancements** - User menu, notifications, search suggestions
5. **Code Organization** - TypeScript interfaces, constants, custom hooks

---

**Last Updated**: 2024-01-30
**Status**: Foundation Complete, Enhancements In Progress
**Total Tasks**: 100+
