# Stripe Connect Setup Guide

## Prerequisites

Before you can use Stripe Connect features, you need to enable Stripe Connect in your Stripe Dashboard.

## Step 1: Enable Stripe Connect

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to Connect**: Click on "Connect" in the left sidebar
3. **Get Started**: Click "Get started" or "Activate Connect"
4. **Choose Account Type**: Select "Express accounts" (recommended for marketplace)
5. **Complete Setup**: Follow the prompts to complete Connect setup

## Step 2: Configure Connect Settings

After enabling Connect, configure these settings:

### 2.1 Branding
- Go to **Connect > Settings > Branding**
- Upload your platform logo
- Set brand colors
- This appears in the vendor onboarding flow

### 2.2 Terms of Service & Privacy Policy
- Go to **Connect > Settings > Legal**
- Add your Terms of Service URL
- Add your Privacy Policy URL
- Required for vendor onboarding

### 2.3 Payout Schedule
- Go to **Connect > Settings > Payouts**
- Configure default payout schedule (e.g., daily, weekly)
- Set minimum payout amount

## Step 3: Get Connect Client ID (Optional)

If you want to use OAuth flow (optional):

1. Go to **Connect > Settings > Integration**
2. Copy the **Client ID** (starts with `ca_`)
3. Add to `.env.local`:
   ```env
   STRIPE_CONNECT_CLIENT_ID=ca_...
   ```

**Note**: OAuth is optional. The current implementation uses Express accounts with account links, which doesn't require the Client ID.

## Step 4: Test Mode Setup

For testing, make sure you're using **test mode**:

1. Toggle to **Test mode** in Stripe Dashboard (top right)
2. Use test API keys in `.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

## Step 5: Verify Setup

After enabling Connect, try creating a Stripe account again:

1. Go to `http://localhost:3000/vendor/stripe-onboarding`
2. Click "Connect Stripe Account"
3. You should be redirected to Stripe's onboarding page (not see an error)

## Common Issues

### Error: "You can only create new accounts if you've signed up for Connect"

**Solution**: You need to enable Stripe Connect first (see Step 1 above).

### Error: "Stripe Connect is not enabled"

**Solution**: 
1. Make sure you're logged into the correct Stripe account
2. Enable Connect in Stripe Dashboard
3. Wait a few minutes for changes to propagate
4. Try again

### Test Mode vs Live Mode

- **Test Mode**: Use for development and testing
- **Live Mode**: Use for production (requires Connect to be enabled in live mode)

Make sure your `.env.local` uses test keys when testing:
```env
STRIPE_SECRET_KEY=sk_test_...  # Not sk_live_...
```

## Next Steps

After enabling Connect:
1. ✅ Test vendor account creation
2. ✅ Test onboarding flow
3. ✅ Test payment processing
4. ✅ Set up production webhooks

## Production Setup

When deploying to production:

1. **Enable Connect in Live Mode**: 
   - Switch to Live mode in Stripe Dashboard
   - Enable Connect (same steps as test mode)

2. **Update Environment Variables**:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

3. **Configure Production Webhooks**:
   - Go to **Developers > Webhooks**
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events (see `STRIPE_CONNECT_TESTING.md`)

4. **Update Return URLs**:
   - Make sure `NEXT_PUBLIC_APP_URL` is set to your production domain
   - Update onboarding return URLs in code if needed

## Resources

- **Stripe Connect Docs**: https://stripe.com/docs/connect
- **Express Accounts Guide**: https://stripe.com/docs/connect/express-accounts
- **Testing Connect**: https://stripe.com/docs/connect/testing
