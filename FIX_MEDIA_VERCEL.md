# Fix: Media Not Visible in Vercel

## Problem
Images/media files are not displaying on https://evega.vercel.app

## Root Cause
Payload CMS needs to know your server URL to generate absolute URLs for media files. Without this, media URLs are relative and don't work in Vercel's serverless environment.

## Solution

### Step 1: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **evega** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://evega.vercel.app`
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### Step 2: Redeploy

After adding the environment variable:
1. Vercel will automatically trigger a redeploy, OR
2. Go to **Deployments** → Click **⋯** → **Redeploy**

### Step 3: Verify

After deployment:
1. Visit https://evega.vercel.app
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Look for image requests
5. Check if URLs are absolute (start with `https://evega.vercel.app/`)

## How It Works

The code changes I made:

1. **`payload.config.ts`**: Added `serverURL` configuration
   - Uses `NEXT_PUBLIC_APP_URL` to generate absolute URLs
   - Falls back to `NEXTAUTH_URL` or localhost for development

2. **`next.config.ts`**: Updated image configuration
   - Allows images from any domain (for Payload media)
   - Ensures Next.js Image component can load Payload media

## Testing

After redeploy, check:

1. **Product images** display correctly
2. **Hero banner images** display (if you have any)
3. **Vendor logos** display
4. **Category images** display (if any)

## If Still Not Working

### Check 1: Verify Environment Variable
```bash
# In browser console on your site
console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);
```

### Check 2: Check Media URLs
Open browser DevTools → Network tab → Look for image requests:
- ✅ Should be: `https://evega.vercel.app/media/filename.jpg`
- ❌ Wrong: `/media/filename.jpg` (relative URL)

### Check 3: Check Vercel Logs
1. Vercel Dashboard → Your Project
2. **Deployments** → Latest → **Functions**
3. Look for errors in media-related functions

### Check 4: Verify Media Files Exist
1. Go to https://evega.vercel.app/admin
2. Navigate to **Media** collection
3. Verify media files are uploaded
4. Check if URLs are absolute

## Alternative: Use Cloud Storage

For better performance and reliability, consider using cloud storage:

### Option 1: Vercel Blob Storage
```bash
npm install @vercel/blob
```

### Option 2: AWS S3
```bash
npm install @payloadcms/plugin-cloud-storage @payloadcms/plugin-cloud-storage/s3
```

### Option 3: Cloudinary
```bash
npm install @payloadcms/plugin-cloud-storage @payloadcms/plugin-cloud-storage/cloudinary
```

---

**After setting `NEXT_PUBLIC_APP_URL` and redeploying, media should display correctly.**
