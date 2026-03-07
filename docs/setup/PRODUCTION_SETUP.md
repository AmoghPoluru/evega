# Production Environment Setup Guide

This guide covers setting up the Evega application for production deployment.

## Prerequisites

- Production MongoDB database (MongoDB Atlas recommended)
- Stripe production account
- Domain name configured
- Email service account (SendGrid or AWS SES)
- Error tracking service (Sentry recommended)

## Step 1: Environment Variables

### 1.1 Copy Environment Template

```bash
cp .env.production.example .env.production
```

### 1.2 Fill in Production Values

Edit `.env.production` and set all required variables:

#### Required Variables

1. **DATABASE_URL**: MongoDB connection string
   ```bash
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/evega-prod
   ```

2. **PAYLOAD_SECRET**: Generate with:
   ```bash
   openssl rand -base64 32
   ```

3. **NEXT_PUBLIC_APP_URL**: Your production domain
   ```bash
   NEXT_PUBLIC_APP_URL=https://evega.com
   ```

4. **NEXTAUTH_SECRET**: Generate with:
   ```bash
   openssl rand -base64 32
   ```

5. **NEXTAUTH_URL**: Should match NEXT_PUBLIC_APP_URL
   ```bash
   NEXTAUTH_URL=https://evega.com
   ```

6. **STRIPE_SECRET_KEY**: From Stripe Dashboard > API Keys
   ```bash
   STRIPE_SECRET_KEY=sk_live_...
   ```

7. **STRIPE_WEBHOOK_SECRET**: From Stripe Dashboard > Webhooks
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 1.3 Validate Environment Variables

```bash
NODE_ENV=production tsx scripts/validate-env.ts
```

## Step 2: Database Setup

### 2.1 Create Production Database

1. Create MongoDB Atlas cluster (or use existing production database)
2. Create database user with read/write permissions
3. Whitelist your deployment server IP addresses
4. Get connection string and set `DATABASE_URL`

### 2.2 Run Migrations

```bash
NODE_ENV=production npm run db:fresh
```

### 2.3 Seed Initial Data (Optional)

```bash
NODE_ENV=production npm run db:seed:core
```

## Step 3: Stripe Configuration

### 3.1 Production Stripe Keys

1. Go to Stripe Dashboard > Developers > API Keys
2. Copy your **Live** secret key (starts with `sk_live_`)
3. Copy your **Live** publishable key (starts with `pk_live_`)

### 3.2 Webhook Configuration

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret (starts with `whsec_`)

## Step 4: Email Service Setup

### Option A: SendGrid

1. Create SendGrid account
2. Verify sender email address
3. Create API key with "Mail Send" permissions
4. Set environment variables:
   ```bash
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_FROM_EMAIL=noreply@your-domain.com
   ```

### Option B: AWS SES

1. Create AWS account
2. Verify sender email in SES
3. Create IAM user with SES permissions
4. Set environment variables:
   ```bash
   AWS_ACCESS_KEY_ID=xxx
   AWS_SECRET_ACCESS_KEY=xxx
   AWS_REGION=us-east-1
   AWS_SES_FROM_EMAIL=noreply@your-domain.com
   ```

## Step 5: Error Tracking (Sentry)

1. Create Sentry account
2. Create new project (Next.js)
3. Copy DSN from project settings
4. Set environment variables:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
   SENTRY_ENVIRONMENT=production
   ```

## Step 6: Build and Test Production Build

### 6.1 Build Locally

```bash
npm run build
```

### 6.2 Test Production Build Locally

```bash
NODE_ENV=production npm start
```

Visit `http://localhost:3000` and verify:
- ✅ Application loads
- ✅ Database connection works
- ✅ Authentication works
- ✅ Stripe integration works (test mode)

## Step 7: Deployment

### 7.1 Vercel Deployment

1. Connect GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy

### 7.2 Railway Deployment

1. Connect GitHub repository to Railway
2. Add all environment variables in Railway dashboard
3. Railway auto-detects Next.js and deploys

### 7.3 Other Platforms

Follow platform-specific Next.js deployment guides.

## Step 8: Post-Deployment Verification

### 8.1 Health Checks

- [ ] Application loads at production URL
- [ ] Database connection successful
- [ ] Authentication works
- [ ] Stripe webhook receives events
- [ ] Email sending works
- [ ] Error tracking receives errors

### 8.2 Security Checks

- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] Database credentials secure
- [ ] API keys not in client-side code
- [ ] CORS configured correctly

## Troubleshooting

### Database Connection Issues

- Verify MongoDB connection string format
- Check IP whitelist in MongoDB Atlas
- Verify database user permissions

### Stripe Webhook Issues

- Verify webhook endpoint URL
- Check webhook secret matches
- Verify webhook events are selected

### Email Not Sending

- Verify email service API keys
- Check sender email is verified
- Review email service logs

### Build Failures

- Check all environment variables are set
- Verify Node.js version matches (18+)
- Check for TypeScript errors

## Security Best Practices

1. **Never commit `.env.production`** to version control
2. **Use strong secrets** (minimum 32 characters)
3. **Rotate secrets regularly** (every 90 days)
4. **Use environment-specific keys** (production vs staging)
5. **Enable 2FA** on all service accounts
6. **Monitor access logs** regularly

## Support

For issues or questions:
- Check logs in deployment platform
- Review error tracking dashboard
- Consult deployment platform documentation
