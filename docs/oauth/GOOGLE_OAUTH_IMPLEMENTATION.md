# Google OAuth Implementation - Step-by-Step Guide

## Overview

This document provides a complete step-by-step guide on how "Continue with Google" authentication is implemented in this project. It covers the entire flow from user clicking the button to user account creation/login.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [User Flow Flow](#user-flow)
5. [Technical Details](#technical-details)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The Google OAuth implementation uses:
- **NextAuth.js v5** - OAuth library for Next.js
- **Payload CMS** - Backend database and user management
- **Next.js App Router** - API routes and server components
- **React Client Components** - UI and user interactions

### Components Involved:

1. **UI Component**: `SocialLoginButtons` - The "Continue with Google" button
2. **Session Provider**: `SessionProvider` - Makes NextAuth available to components
3. **API Route**: `/api/auth/[...nextauth]/route.ts` - Handles OAuth callbacks
4. **Auth Config**: `auth.config.ts` - NextAuth configuration
5. **Users Collection**: `Users.ts` - Database schema for users

---

## Prerequisites

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials (REQUIRED for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/evega
PAYLOAD_SECRET=your-payload-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** (or **Google Identity Services API**)
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External (for testing) or Internal (for organization)
   - App name, support email, developer contact
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: Your app name
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy **Client ID** and **Client Secret** to `.env.local`

---

## Step-by-Step Implementation

### Step 1: Install Dependencies

**File**: `package.json`

```bash
npm install next-auth@beta
```

**What it does**: Installs NextAuth.js v5 (beta) which includes built-in Google OAuth provider support.

---

### Step 2: Update Users Collection Schema

**File**: `src/collections/Users.ts`

**Changes**:
1. Made `username` optional (OAuth users may not have username initially)
2. Added `name` field for storing full name from Google
3. Added `oauthProviders` group field with nested Google fields
4. Added `profilePicture` field for Google profile image

**Code**:
```typescript
{
  name: "username",
  type: "text",
  required: false, // OAuth users may not have username initially
  unique: true,
},
{
  name: "name",
  type: "text",
  label: "Full Name",
  required: false,
},
{
  name: "oauthProviders",
  type: "group",
  fields: [
    {
      name: "google",
      type: "group",
      fields: [
        {
          name: "id",
          type: "text",
          label: "Google ID",
        },
        {
          name: "email",
          type: "email",
          label: "Google Email",
        },
      ],
    },
  ],
},
{
  name: "profilePicture",
  type: "text",
  label: "Profile Picture URL",
},
```

**Why**: This allows storing Google account information linked to user records.

---

### Step 3: Create NextAuth Configuration

**File**: `src/lib/auth.config.ts`

**Purpose**: Configures NextAuth with Google provider and custom pages.

**Code**:
```typescript
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authConfig = {
  providers: providers.length > 0 ? providers : [],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
```

**Key Points**:
- Only adds Google provider if credentials are available
- Custom sign-in page: `/sign-in`
- Error page: `/sign-in` (redirects errors back to sign-in)

---

### Step 4: Create NextAuth API Route Handler

**File**: `src/app/api/auth/[...nextauth]/route.ts`

**Purpose**: Handles all NextAuth API routes:
- `/api/auth/signin/google` - Initiates Google OAuth
- `/api/auth/callback/google` - Receives Google callback
- `/api/auth/session` - Gets current session
- `/api/auth/providers` - Lists available providers

**Key Components**:

#### 4.1: Handler Setup
```typescript
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { getPayload } from "payload";
import config from "@payload-config";
import { generateAuthCookie } from "@/modules/auth/utils";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is required");
}

const { handlers } = NextAuth({
  ...authConfig,
  callbacks: {
    // OAuth sign-in callback
    async signIn({ user, account, profile }) {
      // ... implementation
    },
    // Redirect callback
    async redirect({ url, baseUrl }) {
      // ... implementation
    },
  },
});

export const { GET, POST } = handlers;
```

#### 4.2: Sign-In Callback Logic

**For New Users** (first-time Google login):
1. Extract user data from Google (`user.email`, `user.name`, `user.image`)
2. Generate unique username from name or email
3. Create user record in Payload CMS with:
   - Email
   - Name (full name from Google)
   - Username (auto-generated, unique)
   - Google ID and email in `oauthProviders.google`
   - Profile picture URL
   - Random password (for Payload auth compatibility)
   - Default role: `["user"]`
4. Generate Payload auth token
5. Set authentication cookie
6. Return `true` to allow sign-in

**For Existing Users** (linking Google to existing account):
1. Find user by email
2. Update user record with:
   - Google ID and email in `oauthProviders.google`
   - Profile picture (if available)
   - Name (if not already set)
3. Generate random password if needed
4. Login with Payload
5. Set authentication cookie
6. Return `true` to allow sign-in

**Code Flow**:
```typescript
async signIn({ user, account, profile }) {
  if (!account || !user.email) return false;

  const payload = await getPayload({ config });
  
  // Check if user exists
  const existingUsers = await payload.find({
    collection: "users",
    where: { email: { equals: user.email } },
    limit: 1,
  });

  const existingUser = existingUsers.docs[0];

  if (existingUser) {
    // Link Google account to existing user
    // Update oauthProviders, profilePicture, name
    // Generate password and login
  } else {
    // Create new user
    // Generate unique username
    // Create user with Google data
    // Generate password and login
  }

  return true;
}
```

#### 4.3: Redirect Callback
```typescript
async redirect({ url, baseUrl }) {
  // Redirect to homepage after successful login
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  if (new URL(url).origin === baseUrl) return url;
  return baseUrl;
}
```

---

### Step 5: Add SessionProvider to Root Layout

**File**: `src/components/providers/session-provider.tsx`

**Purpose**: Wraps NextAuth's SessionProvider to make `signIn()` available in components.

**Code**:
```typescript
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

**File**: `src/app/layout.tsx`

**Changes**:
```typescript
import { SessionProvider } from "@/components/providers/session-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
```

**Why**: This makes NextAuth's `signIn()` function available to all client components.

---

### Step 6: Create Social Login Buttons Component

**File**: `src/modules/auth/ui/components/social-login-buttons.tsx`

**Purpose**: Renders "Continue with Google" button with loading states.

**Key Features**:
- Loading state with spinner
- Error handling with toast notifications
- Disabled state during loading
- Google logo SVG

**Code**:
```typescript
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const SocialLoginButtons = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });
      
      if (result?.error) {
        setIsGoogleLoading(false);
        if (result.error.includes("pattern") || result.error.includes("secret")) {
          toast.error("OAuth not configured. Please add credentials to .env.local");
        } else {
          toast.error(`Failed to sign in: ${result.error}`);
        }
      } else if (result?.ok) {
        window.location.href = result.url || "/";
      }
    } catch (error) {
      setIsGoogleLoading(false);
      toast.error("Failed to sign in with Google");
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isGoogleLoading}
    >
      {isGoogleLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <GoogleIcon />
          Continue with Google
        </>
      )}
    </Button>
  );
};
```

**What happens when clicked**:
1. Sets loading state
2. Calls `signIn("google")` from NextAuth
3. NextAuth redirects to Google OAuth consent page
4. User authorizes the app
5. Google redirects back to `/api/auth/callback/google`
6. NextAuth processes the callback
7. Our `signIn` callback creates/updates user
8. User is redirected to homepage

---

### Step 7: Add Social Buttons to Sign-In Page

**File**: `src/modules/auth/ui/views/sign-in-view.tsx`

**Changes**:
```typescript
import { SocialLoginButtons } from "@/modules/auth/ui/components/social-login-buttons";

// In the component JSX:
<div className="space-y-4">
  {/* Email/Password form */}
  
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground">
        Or continue with
      </span>
    </div>
  </div>

  <SocialLoginButtons />
</div>
```

---

## User Flow

### Complete Flow Diagram

```
User clicks "Continue with Google"
         ↓
Button shows loading state
         ↓
signIn("google") called
         ↓
NextAuth redirects to Google OAuth
         ↓
User sees Google consent screen
         ↓
User clicks "Allow"
         ↓
Google redirects to: /api/auth/callback/google?code=...
         ↓
NextAuth exchanges code for user info
         ↓
signIn callback triggered
         ↓
Check if user exists by email
         ↓
    ┌────┴────┐
    │         │
  Yes        No
    │         │
    ↓         ↓
Link Google  Create new user
to existing  with Google data
user         ↓
    │    Generate unique
    │    username
    ↓         ↓
Update      Save to database
oauthProviders
    │         │
    └────┬────┘
         ↓
Generate Payload auth token
         ↓
Set authentication cookie
         ↓
Redirect to homepage (/)
         ↓
User is logged in
```

### Detailed Step-by-Step User Experience

1. **User visits sign-in page** (`/sign-in`)
   - Sees email/password form
   - Sees "Or continue with" divider
   - Sees "Continue with Google" button

2. **User clicks "Continue with Google"**
   - Button shows spinner and "Connecting..." text
   - Button is disabled

3. **Redirect to Google**
   - Browser navigates to Google OAuth consent screen
   - URL: `https://accounts.google.com/o/oauth2/v2/auth?...`

4. **User authorizes on Google**
   - User sees app name, requested permissions
   - User clicks "Allow" or "Continue"

5. **Google redirects back**
   - URL: `http://localhost:3000/api/auth/callback/google?code=...&state=...`
   - NextAuth validates the callback

6. **NextAuth processes callback**
   - Exchanges authorization code for access token
   - Fetches user profile from Google API
   - Calls our `signIn` callback

7. **Our callback executes**
   - Checks if user exists by email
   - Creates new user OR links to existing user
   - Generates Payload auth token
   - Sets cookie

8. **User redirected to homepage**
   - URL: `http://localhost:3000/`
   - User is authenticated
   - Can access protected routes

---

## Technical Details

### Data Saved to Database

**For New Google Users**:
```json
{
  "email": "user@gmail.com",
  "name": "John Doe",
  "username": "john-doe",
  "roles": ["user"],
  "oauthProviders": {
    "google": {
      "id": "12345678901234567890",
      "email": "user@gmail.com"
    }
  },
  "profilePicture": "https://lh3.googleusercontent.com/...",
  "password": "1734567890-abc123-def456" // Random, for Payload auth
}
```

**For Existing Users (Linking Google)**:
- Updates `oauthProviders.google.id`
- Updates `oauthProviders.google.email`
- Updates `profilePicture` (if available)
- Updates `name` (if not already set)

### Username Generation

1. Extract base username from `user.name` or `user.email`
2. Convert to lowercase
3. Replace spaces with hyphens
4. Remove special characters
5. Check if unique
6. If not unique, append counter: `username1`, `username2`, etc.

**Example**:
- Name: "John Doe" → username: "john-doe"
- Email: "user@gmail.com" → username: "user"
- If "john-doe" exists → username: "john-doe1"

### Password Handling

OAuth users don't need passwords, but Payload CMS requires them for authentication. Solution:
- Generate random password on user creation
- Store it in database
- Use it for Payload login after OAuth
- User never sees or uses this password

**Format**: `${Date.now()}-${random1}-${random2}`

### Cookie Management

After successful OAuth:
1. Payload generates JWT token
2. Token stored in cookie via `generateAuthCookie()`
3. Cookie name: `${cookiePrefix}_token` (default: `payload-token`)
4. Cookie used for subsequent Payload API calls

---

## Troubleshooting

### Error: "NEXTAUTH_SECRET is required"

**Solution**: Add `NEXTAUTH_SECRET` to `.env.local`
```bash
openssl rand -base64 32
# Copy output to .env.local
```

### Error: "The string did not match the expected pattern"

**Solution**: 
1. Check `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` is set
3. Restart dev server after adding env vars

### Error: "OAuth not configured"

**Solution**: Add Google OAuth credentials to `.env.local`:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Error: "redirect_uri_mismatch"

**Solution**: 
1. Go to Google Cloud Console
2. Edit OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Save changes

### User not created in database

**Check**:
1. Check server logs for errors in `signIn` callback
2. Verify database connection (`DATABASE_URL`)
3. Check Payload CMS is running
4. Verify user email is valid

### Session not persisting

**Check**:
1. Cookie is being set (check browser DevTools → Application → Cookies)
2. `NEXTAUTH_SECRET` is same across restarts
3. Domain matches in cookie settings

### Button shows error but no redirect

**Check**:
1. Google OAuth credentials are correct
2. Redirect URI matches in Google Console
3. Check browser console for errors
4. Check server logs for NextAuth errors

---

## Testing Checklist

- [ ] Button appears on sign-in page
- [ ] Button shows loading state when clicked
- [ ] Redirects to Google OAuth page
- [ ] Can authorize app on Google
- [ ] Redirects back to app after authorization
- [ ] New user created in database
- [ ] User data saved correctly (email, name, Google ID, profile picture)
- [ ] Username is unique
- [ ] User is logged in after OAuth
- [ ] Session persists on page refresh
- [ ] Existing user can link Google account
- [ ] Error messages show correctly if OAuth fails

---

## Files Summary

### Created Files:
1. `src/lib/auth.config.ts` - NextAuth configuration
2. `src/app/api/auth/[...nextauth]/route.ts` - OAuth API handler
3. `src/components/providers/session-provider.tsx` - Session provider wrapper
4. `src/modules/auth/ui/components/social-login-buttons.tsx` - Social buttons UI

### Modified Files:
1. `src/collections/Users.ts` - Added OAuth fields
2. `src/app/layout.tsx` - Added SessionProvider
3. `src/modules/auth/ui/views/sign-in-view.tsx` - Added social buttons
4. `package.json` - Added next-auth dependency
5. `.env.local` - Added OAuth environment variables

---

## Next Steps

1. **Get Google OAuth Credentials** (if not done)
   - Follow prerequisites section
   - Add credentials to `.env.local`

2. **Test the Flow**
   - Click "Continue with Google"
   - Complete OAuth flow
   - Verify user created in database

3. **Add Facebook OAuth** (optional)
   - Similar process, add Facebook provider
   - Update social buttons component

4. **Production Setup**
   - Update `NEXTAUTH_URL` to production domain
   - Add production redirect URI in Google Console
   - Use secure `NEXTAUTH_SECRET` in production

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Payload CMS Documentation](https://payloadcms.com/docs)

---

**Last Updated**: [Current Date]
**Version**: 1.0
