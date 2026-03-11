# Quick Guide: Get Blob Token After Creating Public Store

## ✅ Good News!
When you created the public Blob store, Vercel **automatically created** the `BLOB_READ_WRITE_TOKEN` for you!

## Method 1: Pull from Vercel (Easiest) ⭐

### Step 1: Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Your Project
```bash
cd /Users/anu/Desktop/Projects/evega
vercel link
```
- Select your existing project: `evega`
- Confirm settings

### Step 4: Pull Environment Variables
```bash
vercel env pull .env.local
```

This will:
- ✅ Download all environment variables from Vercel
- ✅ Add `BLOB_READ_WRITE_TOKEN` to your `.env.local`
- ✅ Include other vars like `DATABASE_URL`, `PAYLOAD_SECRET`, etc.

### Step 5: Verify Token
```bash
grep BLOB_READ_WRITE_TOKEN .env.local
```

You should see:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Method 2: Copy from Vercel Dashboard

### Step 1: Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your **evega** project

### Step 2: Go to Settings → Environment Variables
- Click **Settings** (top menu)
- Click **Environment Variables** (left sidebar)

### Step 3: Find BLOB_READ_WRITE_TOKEN
- Look for `BLOB_READ_WRITE_TOKEN` in the list
- Click on it to reveal the value
- Click **Copy** or manually copy the token

### Step 4: Add to .env.local
```bash
# Open .env.local and add:
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## After Getting Token

Run the migration:
```bash
npm run migrate:media:blob
```

## Troubleshooting

**Token not visible in Dashboard?**
- Make sure you're in the correct project
- Check if Blob store was created successfully
- Try refreshing the page

**vercel env pull not working?**
- Make sure you're logged in: `vercel login`
- Make sure project is linked: `vercel link`
- Check you're in the project directory

**Token format:**
- Should start with: `vercel_blob_rw_`
- Length: ~50-60 characters
- No spaces or line breaks
