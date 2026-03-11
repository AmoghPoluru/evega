# How to Get Vercel Blob Storage Token

## Step-by-Step Guide

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Sign in to your account

### 2. Select Your Project
- Click on your **evega** project

### 3. Navigate to Storage
- In the project dashboard, look for **Storage** in the left sidebar
- Click on **Storage**

### 4. Access Blob Storage
- You should see **Blob** in the storage options
- Click on **Blob**

### 5. Create/Get Token
- Look for a button or link that says:
  - **"Create Token"** or
  - **"Generate Token"** or
  - **"Tokens"** tab
- Click on it

### 6. Create New Token
- Click **"Create Token"** or **"New Token"**
- Give it a name (e.g., "Media Migration" or "Production")
- Select permissions: **Read & Write** (or **Full Access**)
- Click **"Create"** or **"Generate"**

### 7. Copy the Token
- ⚠️ **IMPORTANT**: Copy the token immediately
- The token will look like: `vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- You won't be able to see it again after closing the dialog
- If you lose it, you'll need to create a new one

### 8. Add to Environment Variables

**For Local Development (.env.local):**
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**For Vercel Production:**
- Go to: Project Settings → Environment Variables
- Add: `BLOB_READ_WRITE_TOKEN` = `vercel_blob_rw_...`
- Select environments: Production, Preview, Development
- Click **Save**

## Alternative: Via Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Get token (if available via CLI)
vercel env pull .env.local
```

## Token Format

Your token should look like:
```
vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Starts with: `vercel_blob_rw_`
- Followed by: Long alphanumeric string
- Length: ~50-60 characters total

## Troubleshooting

**Can't find Storage tab?**
- Make sure you're on a project page (not the main dashboard)
- Check if Blob Storage is enabled for your project
- You may need to upgrade your Vercel plan if on Hobby plan

**Token not working?**
- Verify you copied the entire token (no spaces)
- Check if token has expired (create a new one)
- Ensure token has **Read & Write** permissions

**Where to find it in Dashboard?**
- Path: `Dashboard → [Your Project] → Storage → Blob → Tokens → Create Token`

## Quick Visual Guide

```
Vercel Dashboard
  └── Your Project (evega)
      └── Storage (left sidebar)
          └── Blob
              └── Tokens / Create Token
                  └── Create New Token
                      └── Copy Token
```

---

**Once you have the token, add it to `.env.local` and run:**
```bash
npm run migrate:media:blob
```
