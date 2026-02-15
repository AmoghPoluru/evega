# Navbar System Documentation

## Overview

The Navbar system is the primary navigation component for the Evega e-commerce application. It provides global navigation, search functionality, shopping cart access, and user authentication controls across all pages of the application.

**Location**: `src/app/(app)/(home)/navbar/`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Component Details](#component-details)
4. [State Management](#state-management)
5. [Integration Points](#integration-points)
6. [Styling Guide](#styling-guide)
7. [Responsive Design](#responsive-design)
8. [API Reference](#api-reference)
9. [Development Guide](#development-guide)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    App Layout (layout.tsx)                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    Navbar Component                    │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │  Logo    │  │ SearchInput  │  │ CheckoutButton │ │ │
│  │  └──────────┘  └──────────────┘  └─────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │         Auth Buttons / NavbarSidebar            │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Categories Component                      │ │
│  │  (Category navigation with dropdown menus)             │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
Navbar (Main Container)
├── Logo (Home navigation)
├── SearchInput (Search functionality)
│   └── Category dropdown
├── CheckoutButton (Cart access)
├── NavbarSidebar (Mobile menu)
│   ├── Navigation items
│   └── Auth controls
└── Categories (Category navigation)
    └── Subcategory menus
```

### Data Flow

```
tRPC Queries
    │
    ├── categories.useQuery() → Categories data
    ├── auth.session.useQuery() → User session
    └── checkout.getCartCount() → Cart item count
         │
         └── CheckoutButton (displays count)

User Actions
    │
    ├── Search → SearchInput → URL params → Search page
    ├── Category click → Category page
    ├── Logo click → Home page
    ├── Checkout click → Checkout page
    └── Auth actions → Auth mutations → Session update
```

---

## Component Structure

### File Organization

```
src/app/(app)/(home)/navbar/
├── Navbar.tsx              # Main navbar component
├── navbar-sidebar.tsx      # Mobile sidebar component
├── Logo.tsx                # Logo component
├── Logo.png                # Logo image asset
└── README.md               # Local documentation (legacy)
```

### Component Dependencies

**External Components:**
- `SearchInput` - `../search-filter/search-input`
- `Categories` - `../search-filter/categories`
- `CheckoutButton` - `@/modules/checkout/ui/components/checkout-button`

**UI Components:**
- `Button` - `@/components/ui/button`
- `Sheet` - `@/components/ui/sheet` (for sidebar)
- `ScrollArea` - `@/components/ui/scroll-area` (for sidebar)

**Utilities:**
- `trpc` - `@/trpc/client` (API client)
- `useRouter` - `next/navigation` (navigation)
- `toast` - `sonner` (notifications)

---

## Component Details

### 1. Navbar.tsx

**Location**: `src/app/(app)/(home)/navbar/Navbar.tsx`

**Type**: Client Component (`"use client"`)

**Purpose**: Main navigation bar that appears on all application pages.

#### Features

- **Global Navigation**: Rendered in `src/app/(app)/layout.tsx` to appear on all pages
- **Search Integration**: Integrated search bar with category filtering
- **Shopping Cart**: Checkout button with real-time item count
- **Authentication**: Login/logout functionality with session management
- **Category Navigation**: Category dropdown menus displayed below navbar
- **Responsive Design**: Adapts layout for mobile and desktop

#### Props

None (self-contained component)

#### State Management

```typescript
const [isSidebarOpen, setIsSidebarOpen] = useState(false)
const { data: session } = trpc.auth.session.useQuery()
const { data: categoriesData } = trpc.categories.useQuery()
const isLoggedIn = !!session?.user
```

#### Key Methods

```typescript
// Logout handler
const handleLogout = () => {
  logout.mutate();
};

// Logout mutation
const logout = trpc.auth.logout.useMutation({
  onError: (error) => {
    toast.error(error.message);
  },
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: [['auth', 'session']] });
    router.push("/");
    toast.success("Logged out successfully");
  },
});
```

#### Layout Structure

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [    Search Bar    ] [Checkout] [Log in/Log out]    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ [Category 1] [Category 2] [Category 3] ...                  │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Layout:**
```
┌─────────────────────────────────────────────┐
│ [Logo] [Search] [Checkout] [☰ Menu]        │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ [Categories - Scrollable]                    │
└─────────────────────────────────────────────┘
```

#### Usage Example

```tsx
// In layout.tsx
import { Navbar } from "./(home)/navbar/Navbar";

export default function AppLayout({ children }: Props) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <Navbar />
        {children}
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
```

#### Styling

- **Background**: Black (`bg-black`)
- **Height**: Fixed 80px (`h-20`)
- **Font**: Poppins (weight 700) for brand consistency
- **Borders**: Gray-700 (`border-gray-700`)
- **Text Color**: White (for contrast on black background)

---

### 2. NavbarSidebar.tsx

**Location**: `src/app/(app)/(home)/navbar/navbar-sidebar.tsx`

**Type**: Client Component (`"use client"`)

**Purpose**: Mobile sidebar drawer that slides in from the left on mobile devices.

#### Features

- **Slide-in Drawer**: Uses Sheet component from shadcn/ui
- **Navigation Items**: Displays navigation links (currently empty array)
- **Authentication Links**: Login/logout/signup based on auth state
- **Admin Dashboard**: Link to admin panel for logged-in users
- **Auto-close**: Closes on navigation or logout
- **Scrollable**: Uses ScrollArea for long content

#### Props

```typescript
interface Props {
  items: NavbarItem[];           // Navigation items array
  open: boolean;                 // Controls sidebar visibility
  onOpenChange: (open: boolean) => void;  // Toggle callback
}

interface NavbarItem {
  href: string;
  children: React.ReactNode;
}
```

#### State Management

```typescript
const { data: session } = trpc.auth.session.useQuery()
const isLoggedIn = !!session?.user
const logout = trpc.auth.logout.useMutation({...})
```

#### Usage Example

```tsx
<NavbarSidebar
  items={[]}  // Currently empty, but can be populated
  open={isSidebarOpen}
  onOpenChange={setIsSidebarOpen}
/>
```

#### Behavior

- **Opening**: Triggered by hamburger menu button click
- **Closing**: 
  - Click outside the sidebar
  - Click on any navigation link
  - Logout action
  - Manual close via `onOpenChange(false)`

#### Styling

- **Position**: Left side (`side="left"`)
- **Width**: Default Sheet width (typically 320px)
- **Background**: White
- **Hover States**: Black background with white text

---

### 3. Logo.tsx

**Location**: `src/app/(app)/(home)/navbar/Logo.tsx`

**Type**: Client Component (`'use client'`)

**Purpose**: Clickable logo that navigates to the home page.

#### Features

- **Image Optimization**: Uses Next.js Image component
- **Navigation**: Routes to home page (`/`) on click
- **Responsive Sizing**: 80x80px with max size constraints
- **Accessibility**: Proper alt text for screen readers

#### Implementation

```typescript
export default function Logo() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      onClick={() => router.push('/')}
      className="p-0 h-auto hover:bg-transparent flex items-center"
    >
      <Image
        className="cursor-pointer object-contain"
        src={logoImage}
        height={80}
        width={80}
        alt="Evega Logo"
        style={{ maxHeight: '80px', maxWidth: '80px' }}
      />
    </Button>
  );
}
```

#### Image Asset

- **File**: `Logo.png`
- **Location**: `src/app/(app)/(home)/navbar/Logo.png`
- **Format**: PNG
- **Dimensions**: 80x80px (display size)
- **Creator**: Venkata Poluru
- **Import**: Direct import from same directory

#### Usage Example

```tsx
import Logo from "./Logo";

<Logo />
```

---

## State Management

### Session State

The navbar uses tRPC to manage user session state:

```typescript
// Fetch user session
const { data: session } = trpc.auth.session.useQuery()
const isLoggedIn = !!session?.user

// Logout mutation
const logout = trpc.auth.logout.useMutation({
  onSuccess: async () => {
    await queryClient.invalidateQueries({ 
      queryKey: [['auth', 'session']] 
    });
    router.push("/");
    toast.success("Logged out successfully");
  },
})
```

### Sidebar State

Local state manages sidebar visibility:

```typescript
const [isSidebarOpen, setIsSidebarOpen] = useState(false)
```

### Category Data

Categories are fetched via tRPC:

```typescript
const { data: categoriesData } = trpc.categories.useQuery()
```

### Cart State

Cart state is managed by the CheckoutButton component internally via Zustand store.

---

## Integration Points

### 1. Layout Integration

**File**: `src/app/(app)/layout.tsx`

The Navbar is rendered at the layout level to ensure it appears on all pages:

```tsx
import { Navbar } from "./(home)/navbar/Navbar";

export default function AppLayout({ children }: Props) {
  return (
    <TRPCReactProvider>
      <NuqsAdapter>
        <Navbar />
        {children}
      </NuqsAdapter>
    </TRPCReactProvider>
  );
}
```

**Why at layout level?**
- Ensures navbar appears on all routes
- Provides consistent navigation experience
- Allows shared state management

### 2. Search Integration

**Component**: `SearchInput` from `../search-filter/search-input`

**Integration**:
- Receives categories data as props
- Uses `nuqs` for URL state management
- Navigates to `/search` page with query parameters

**Flow**:
```
User types search → SearchInput → URL params → Search page
```

### 3. Category Integration

**Component**: `Categories` from `../search-filter/categories`

**Integration**:
- Displays below main navbar
- Shows category navigation with dropdowns
- Handles subcategory navigation

### 4. Checkout Integration

**Component**: `CheckoutButton` from `@/modules/checkout/ui/components/checkout-button`

**Integration**:
- Displays cart item count
- Links to checkout page
- Uses Zustand cart store internally

### 5. Authentication Integration

**tRPC Procedures**:
- `trpc.auth.session.useQuery()` - Get current session
- `trpc.auth.logout.useMutation()` - Logout user

**Flow**:
```
User clicks logout → Mutation → Invalidate queries → Redirect → Toast notification
```

---

## Styling Guide

### Color Scheme

**Navbar Background:**
- Primary: Black (`bg-black`)
- Hover: Gray-800 (`hover:bg-gray-800`)
- Border: Gray-700 (`border-gray-700`)

**Text Colors:**
- Primary: White (`text-white`)
- Links: Blue-600 (`text-blue-600`)
- Hover Links: Orange-600 (`hover:text-orange-600`)

**Search Bar:**
- Container: White (`bg-white`)
- Border: Rounded XL (`rounded-xl`)
- Shadow: XL shadow (`shadow-xl`)

**Categories Section:**
- Background: Light gray (`bg-[#F5F5F5]`)
- Border: Bottom border (`border-b`)

### Typography

**Font Family:**
- Navbar: Poppins (weight 700)
- Body: System default

**Font Sizes:**
- Logo: 80px (image size)
- Buttons: `text-lg`
- Links: `text-base`

### Spacing

- Navbar height: 80px (`h-20`)
- Padding: 16px (`px-4`)
- Gap between elements: 8px (`gap-2`)

### Responsive Breakpoints

- Mobile: Default (< 1024px)
- Desktop: `lg:` prefix (≥ 1024px)

---

## Responsive Design

### Desktop (≥ 1024px)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [    Search Bar    ] [Checkout] [Log in/Log out]    │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- All elements visible in single row
- Checkout button in navbar
- Auth buttons in navbar
- Categories displayed below navbar
- Sidebar hidden

### Mobile (< 1024px)

**Layout:**
```
┌─────────────────────────────────────────────┐
│ [Logo] [Search] [Checkout] [☰ Menu]        │
└─────────────────────────────────────────────┘
```

**Features:**
- Hamburger menu button visible
- Checkout button next to menu
- Sidebar slides in from left
- Search bar remains visible
- Categories scrollable below navbar

### Breakpoint Logic

```tsx
// Desktop elements
<div className="hidden lg:flex items-center gap-2">
  <CheckoutButton />
  {/* Auth buttons */}
</div>

// Mobile elements
<div className="flex lg:hidden items-center gap-2">
  <CheckoutButton />
  <Button onClick={() => setIsSidebarOpen(true)}>
    <Menu />
  </Button>
</div>
```

---

## API Reference

### tRPC Queries

#### `trpc.categories.useQuery()`

**Purpose**: Fetch category data for navigation

**Returns**:
```typescript
{
  id: string;
  name: string;
  slug: string;
  subcategories: Array<{
    id: string;
    name: string;
    slug: string;
    color?: string;
  }>;
}[]
```

**Usage**:
```typescript
const { data: categoriesData } = trpc.categories.useQuery()
```

#### `trpc.auth.session.useQuery()`

**Purpose**: Get current user session

**Returns**:
```typescript
{
  user: {
    id: string;
    email: string;
    // ... other user fields
  } | null
}
```

**Usage**:
```typescript
const { data: session } = trpc.auth.session.useQuery()
const isLoggedIn = !!session?.user
```

### tRPC Mutations

#### `trpc.auth.logout.useMutation()`

**Purpose**: Logout current user

**Returns**: Promise<void>

**Usage**:
```typescript
const logout = trpc.auth.logout.useMutation({
  onSuccess: async () => {
    await queryClient.invalidateQueries({ 
      queryKey: [['auth', 'session']] 
    });
    router.push("/");
    toast.success("Logged out successfully");
  },
});

logout.mutate();
```

---

## Development Guide

### Adding New Navigation Items

1. **Update NavbarSidebar props**:
```tsx
<NavbarSidebar
  items={[
    { href: "/about", children: "About" },
    { href: "/contact", children: "Contact" },
  ]}
  open={isSidebarOpen}
  onOpenChange={setIsSidebarOpen}
/>
```

2. **Add desktop navigation** (if needed):
```tsx
<Link href="/about">About</Link>
```

### Modifying Search Behavior

Edit `SearchInput` component at:
`src/app/(app)/(home)/search-filter/search-input.tsx`

### Changing Logo

1. Replace `Logo.png` file
2. Ensure dimensions are 80x80px or update size in `Logo.tsx`

### Customizing Colors

Update Tailwind classes in `Navbar.tsx`:
```tsx
// Change background
className="bg-black" → className="bg-gray-900"

// Change text color
className="text-white" → className="text-gray-100"
```

### Adding New Features

1. **Create new component** in navbar folder
2. **Import and use** in `Navbar.tsx`
3. **Add state management** if needed
4. **Update this documentation**

---

## Troubleshooting

### Common Issues

#### 1. Navbar Not Appearing on Pages

**Problem**: Navbar missing on certain routes

**Solution**: 
- Verify Navbar is in `src/app/(app)/layout.tsx`
- Check route is within `(app)` route group
- Ensure no conflicting layouts

#### 2. Search Not Working

**Problem**: Search input doesn't navigate

**Solution**:
- Check `nuqs` provider is in layout
- Verify `SearchInput` receives categories prop
- Check browser console for errors

#### 3. Cart Count Not Updating

**Problem**: CheckoutButton shows wrong count

**Solution**:
- Verify Zustand store is working
- Check localStorage for cart data
- Ensure `useCart` hook is used correctly

#### 4. Sidebar Not Opening

**Problem**: Hamburger menu doesn't open sidebar

**Solution**:
- Check `isSidebarOpen` state
- Verify `setIsSidebarOpen` is passed correctly
- Check Sheet component is imported

#### 5. Logout Not Working

**Problem**: Logout button doesn't log user out

**Solution**:
- Check tRPC mutation is called
- Verify query invalidation
- Check for error messages in console

### Debug Checklist

- [ ] Navbar rendered in layout
- [ ] tRPC provider is present
- [ ] Categories data is loading
- [ ] Session query is working
- [ ] Cart store is initialized
- [ ] No console errors
- [ ] Responsive breakpoints working

---

## Best Practices

### Performance

1. **Lazy Loading**: Categories are fetched once and cached
2. **Image Optimization**: Logo uses Next.js Image component
3. **State Management**: Minimal re-renders with proper state management

### Accessibility

1. **Alt Text**: Logo has descriptive alt text
2. **Keyboard Navigation**: All interactive elements are keyboard accessible
3. **Screen Readers**: Proper semantic HTML structure

### Code Organization

1. **Component Separation**: Each component in its own file
2. **Type Safety**: TypeScript interfaces for all props
3. **Documentation**: JSDoc comments in components

---

## Related Documentation

- [Checkout Procedure](../checkout/CHECKOUT_PROCEDURE.md) - Checkout flow documentation
- [Search Filter README](../../src/app/(app)/(home)/search-filter/README.md) - Search functionality
- [tRPC Documentation](https://trpc.io) - API client documentation

---

## Version History

- **v1.0** - Initial navbar implementation
- **v1.1** - Added search integration
- **v1.2** - Added checkout button
- **v1.3** - Mobile sidebar implementation
- **v1.4** - Category navigation below navbar

---

## Contributors

- Venkata Poluru - Logo design
- Development Team - Component implementation

---

## License

This documentation is part of the Evega e-commerce application.
