# Vercel Deployment - Next Steps

This guide covers the immediate next steps to deploy the Evega application to Vercel.

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] GitHub repository with your code pushed
- [ ] MongoDB Atlas database (or production MongoDB instance)
- [ ] Stripe account with production keys
- [ ] Domain name (optional, Vercel provides free subdomain)

---

## Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git if not already done
git init

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/evega.git

# Commit and push
git add .
git commit -m "Initial commit - ready for Vercel deployment"
git push -u origin main
```

---

## Step 2: Connect Project to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in or create an account

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

---

## Step 3: Add Environment Variables

Add all required environment variables in Vercel Dashboard:

### Required Variables

1. **Database**
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/evega-prod
   ```

2. **Payload CMS**
   ```
   PAYLOAD_SECRET=<generate with: openssl rand -base64 32>
   ```

3. **Application URLs**
   ```
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

4. **NextAuth**
   ```
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   ```

5. **Stripe**
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

### Optional Variables (Recommended)

6. **Stripe Connect** (if using vendor payouts)
   ```
   STRIPE_CONNECT_CLIENT_ID=ca_...
   STRIPE_PLATFORM_ACCOUNT_ID=acct_...
   ```

7. **OAuth** (if using social login)
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   FACEBOOK_CLIENT_ID=...
   FACEBOOK_CLIENT_SECRET=...
   ```

8. **Email Service** (SendGrid or AWS SES)
   ```
   SENDGRID_API_KEY=...
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

9. **Error Tracking** (Sentry)
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...
   SENTRY_ENVIRONMENT=production
   ```

10. **Platform Commission** (optional, defaults to 10%)
    ```
    PLATFORM_COMMISSION_RATE=10
    ```

### How to Add in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select `Production`, `Preview`, and/or `Development`
4. Click **Save**

---

## Step 4: Configure Stripe Webhook

After deployment, configure Stripe webhook:

1. **Get Your Webhook URL**
   - After first deployment, Vercel will provide a URL like: `https://your-app.vercel.app/api/stripe/webhook`
   - Copy this URL

2. **Add Webhook in Stripe Dashboard**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Paste your webhook URL
   - Select events to listen to:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `account.updated` (if using Stripe Connect)
     - `transfer.created` (if using Stripe Connect)
     - `transfer.paid` (if using Stripe Connect)
     - `transfer.failed` (if using Stripe Connect)
   - Click **Add endpoint**

3. **Copy Webhook Signing Secret**
   - After creating webhook, click on it
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add it to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

4. **Redeploy**
   - After adding webhook secret, trigger a redeploy in Vercel

---

## Step 5: Update URLs After Deployment

After first deployment:

1. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
   - Update `NEXTAUTH_URL` to match
   - Redeploy after updating

2. **Update Stripe Webhook URL**
   - Update webhook URL in Stripe Dashboard if it changed

3. **Update OAuth Redirect URLs** (if using OAuth)
   - Update redirect URLs in Google/Facebook OAuth apps
   - Add: `https://your-app.vercel.app/api/auth/callback/google`
   - Add: `https://your-app.vercel.app/api/auth/callback/facebook`

---

## Step 6: Deploy

1. **Initial Deployment**
   - Vercel will automatically deploy when you connect the repository
   - Or click **Deploy** button in Vercel Dashboard

2. **Monitor Deployment**
   - Watch the deployment logs in Vercel Dashboard
   - Check for any build errors

3. **Verify Deployment**
   - Visit your Vercel URL
   - Test key functionality:
     - Homepage loads
     - Admin panel accessible at `/admin`
     - Sign up/Sign in works
     - Products display correctly

---

## Step 7: Post-Deployment Tasks

### Database Setup

1. **Run Migrations** (if needed)
   ```bash
   # Connect to your production database
   DATABASE_URL=your-prod-url npm run db:fresh
   ```

2. **Seed Initial Data** (optional)
   ```bash
   DATABASE_URL=your-prod-url npm run db:seed:core
   ```

### Domain Configuration (Optional)

1. **Add Custom Domain**
   - Go to Vercel project → **Settings** → **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` with custom domain
   - Update `NEXTAUTH_URL` to match
   - Redeploy

### SSL Certificate

- Vercel automatically provides SSL certificates
- No additional configuration needed

---

## Step 8: Verify Everything Works

### Checklist

- [ ] Homepage loads correctly
- [ ] Admin panel accessible at `/admin`
- [ ] User sign up/sign in works
- [ ] Products display correctly
- [ ] Search functionality works
- [ ] Add to cart works
- [ ] Checkout flow works
- [ ] Stripe payment processing works
- [ ] Webhook receives events (check Stripe Dashboard)
- [ ] Orders are created in database
- [ ] Email notifications work (if configured)
- [ ] Error tracking works (if Sentry configured)

---

## Troubleshooting

### Build Fails

1. **Check Build Logs**
   - View detailed logs in Vercel Dashboard
   - Look for TypeScript errors, missing dependencies, etc.

2. **Common Issues**
   - Missing environment variables
   - TypeScript errors (run `npm run build` locally first)
   - Missing dependencies (check `package.json`)

### Runtime Errors

1. **Check Function Logs**
   - Go to Vercel Dashboard → **Functions** tab
   - View logs for API routes and server components

2. **Check Environment Variables**
   - Verify all required variables are set
   - Use `scripts/validate-env.ts` locally with production values

### Database Connection Issues

1. **Verify MongoDB Atlas Whitelist**
   - Add Vercel IP addresses to MongoDB Atlas whitelist
   - Or allow all IPs (0.0.0.0/0) for testing

2. **Check Connection String**
   - Verify `DATABASE_URL` is correct
   - Test connection string locally

### Stripe Webhook Not Working

1. **Verify Webhook URL**
   - Check webhook URL in Stripe Dashboard matches Vercel URL
   - Ensure `/api/stripe/webhook` route exists

2. **Check Webhook Secret**
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
   - Test webhook signature verification

3. **Check Function Logs**
   - View webhook handler logs in Vercel Dashboard
   - Check for errors in webhook processing

---

## Next Steps After Deployment

1. **Set up monitoring**
   - Configure Sentry for error tracking
   - Set up uptime monitoring

2. **Configure CI/CD**
   - Set up GitHub Actions for automated deployments
   - Configure staging and production environments

3. **Performance optimization**
   - Enable Vercel Analytics
   - Optimize images and assets
   - Configure caching

4. **Security hardening**
   - Review security headers
   - Enable rate limiting
   - Configure CORS properly

---

## Quick Reference

### Vercel CLI (Alternative to Dashboard)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
```

### Useful Vercel Commands

```bash
# View deployments
vercel ls

# View logs
vercel logs

# Open project in browser
vercel open
```

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

---

**Last Updated**: March 2024
**Status**: Ready for deployment
