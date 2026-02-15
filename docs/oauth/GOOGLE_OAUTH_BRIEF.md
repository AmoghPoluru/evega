# Google OAuth Implementation - Brief Overview

## How It Works

When a user clicks "Continue with Google":
1. Button calls NextAuth's `signIn("google")` function
2. User is redirected to Google's OAuth consent page
3. After authorization, Google redirects back to our app
4. NextAuth processes the callback and calls our custom `signIn` callback
5. We create/update the user in Payload CMS database with Google account info
6. User is logged in and redirected to homepage

---

## Files Involved

### 1. `src/lib/auth.config.ts`
**Purpose**: Configures NextAuth with Google OAuth provider
- Defines Google provider with client ID and secret from environment variables
- Sets custom sign-in and error pages
- Only adds providers if credentials are available

### 2. `src/app/api/auth/[...nextauth]/route.ts`
**Purpose**: Handles all NextAuth API routes (signin, callback, session)
- Catches all `/api/auth/*` routes
- Processes OAuth callbacks from Google
- Custom `signIn` callback: Creates new users or links Google to existing users in Payload CMS
- Generates Payload auth token and sets cookie after successful OAuth

### 3. `src/components/providers/session-provider.tsx`
**Purpose**: Wraps NextAuth's SessionProvider to make `signIn()` available in components
- Client component that provides NextAuth context to the entire app
- Makes `signIn()` function accessible in all client components

### 4. `src/app/layout.tsx`
**Purpose**: Root layout that wraps the app with SessionProvider
- Adds SessionProvider wrapper so NextAuth is available app-wide
- Required for social login buttons to work

### 5. `src/modules/auth/ui/components/social-login-buttons.tsx`
**Purpose**: Renders the "Continue with Google" button with loading states
- Client component with button that calls `signIn("google")`
- Shows loading spinner during OAuth flow
- Handles errors and displays toast notifications

### 6. `src/modules/auth/ui/views/sign-in-view.tsx`
**Purpose**: Sign-in page that displays the social login buttons
- Imports and renders `SocialLoginButtons` component
- Shows "Or continue with" divider above social buttons

### 7. `src/collections/Users.ts`
**Purpose**: Payload CMS collection schema for users
- Defines user fields including OAuth provider data
- Added fields: `name`, `oauthProviders.google.id`, `oauthProviders.google.email`, `profilePicture`
- Made `username` optional for OAuth users

### 8. `package.json`
**Purpose**: Project dependencies
- Added `next-auth@beta` package for OAuth functionality

### 9. `.env.local`
**Purpose**: Environment variables configuration
- `NEXTAUTH_SECRET`: Required secret for NextAuth session encryption
- `NEXTAUTH_URL`: Base URL of the application
- `GOOGLE_CLIENT_ID`: Google OAuth client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret from Google Cloud Console

---

## Data Flow

```
User clicks button
  → signIn("google") called
    → Redirect to Google
      → User authorizes
        → Google redirects to /api/auth/callback/google
          → NextAuth processes callback
            → Our signIn callback executes
              → Create/update user in Payload CMS
                → Generate auth token
                  → Set cookie
                    → Redirect to homepage
```

---

## Key Points

- **NextAuth.js v5** handles the OAuth flow (redirects, token exchange)
- **Payload CMS** stores user data and manages authentication
- **Custom callback** links Google account to Payload user records
- **Random password** generated for OAuth users (required by Payload, user never sees it)
- **Username** auto-generated from Google name or email if unique

---

**For detailed implementation steps, see**: [GOOGLE_OAUTH_IMPLEMENTATION.md](./GOOGLE_OAUTH_IMPLEMENTATION.md)
