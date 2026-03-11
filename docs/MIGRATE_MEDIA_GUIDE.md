# Migrate Local Media to Vercel Blob Storage

## Prerequisites

1. **Get Vercel Blob Token:**
   - Go to: https://vercel.com/dashboard
   - Select your project (`evega`)
   - Go to: **Storage** → **Blob** → **Create Token**
   - Copy the token (starts with `vercel_blob_rw_...`)

2. **Add Token to Environment:**
   ```bash
   # Add to .env.local
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

## Run Migration

```bash
npm run migrate:media:blob
```

## What the Script Does

1. ✅ Fetches all media records from MongoDB
2. ✅ Skips files already in Blob Storage (checks URL)
3. ✅ Reads local files from `media/` directory
4. ✅ Uploads each file to Vercel Blob Storage
5. ✅ Updates MongoDB records with new Blob URLs
6. ✅ Shows progress and summary

## After Migration

- ✅ Media files are now in Vercel Blob Storage
- ✅ URLs point to `blob.vercel-storage.com`
- ✅ You can verify in Vercel Dashboard → Storage → Blob
- ⚠️ **Keep local files** until you verify everything works
- 🗑️ **Delete local files** only after confirming all media loads correctly

## Troubleshooting

**Error: BLOB_READ_WRITE_TOKEN is not set**
- Add the token to `.env.local` and restart

**Error: Local file not found**
- Some files may have been deleted or moved
- The script will skip them and continue

**Error: Upload failed**
- Check your internet connection
- Verify the token is valid in Vercel Dashboard
- Check Vercel Blob storage limits/quota
