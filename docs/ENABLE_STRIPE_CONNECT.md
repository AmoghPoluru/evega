# How to Enable Stripe Connect - Quick Guide

## Step-by-Step Instructions

### Step 1: Login to Stripe Dashboard

1. Go to: **https://dashboard.stripe.com**
2. Login with your Stripe account credentials
3. Make sure you're in **Test mode** (toggle in top right) for testing

### Step 2: Navigate to Connect

1. In the left sidebar, click on **"Connect"**
   - If you don't see "Connect" in the sidebar, it means Connect isn't available yet
   - You may need to complete your Stripe account setup first

### Step 3: Activate Connect

1. You'll see a page that says **"Get started with Connect"** or **"Activate Connect"**
2. Click the **"Get started"** or **"Activate"** button
3. You may be asked to:
   - Verify your business information
   - Complete account verification
   - Accept terms and conditions

### Step 4: Choose Account Type

1. Select **"Express accounts"** (recommended for marketplaces)
   - This is the easiest option for vendors
   - Vendors complete onboarding in minutes
   - You handle all the complexity

2. Click **"Continue"** or **"Set up Express accounts"**

### Step 5: Complete Setup

1. Follow the setup wizard:
   - **Branding**: Upload your logo (optional for testing)
   - **Legal**: Add Terms of Service and Privacy Policy URLs (can use placeholder URLs for testing)
   - **Settings**: Configure payout schedule (default is fine)

2. Click **"Complete setup"** or **"Finish"**

### Step 6: Verify It's Enabled

1. After setup, you should see the **Connect Dashboard**
2. You'll see options like:
   - **Accounts** (list of connected accounts)
   - **Settings** (Connect configuration)
   - **Transfers** (money transfers)

3. If you see these options, **Connect is enabled!** ✅

## Testing After Enablement

1. **Wait 1-2 minutes** for changes to propagate
2. Go to: `http://localhost:3000/vendor/stripe-onboarding`
3. Click **"Connect Stripe Account"**
4. You should be redirected to Stripe's onboarding page (not see an error)

## Troubleshooting

### "Connect" not in sidebar?

**Possible reasons:**
- Account not fully verified
- Business information incomplete
- Account restrictions

**Solution:**
1. Go to **Settings > Account**
2. Complete any pending verification steps
3. Try again

### Still getting errors after enabling?

1. **Check you're in the right mode**:
   - For testing: Make sure you're in **Test mode** (toggle top right)
   - Your `.env.local` should have `STRIPE_SECRET_KEY=sk_test_...`

2. **Wait a few minutes**: Changes can take 1-2 minutes to propagate

3. **Clear browser cache**: Sometimes helps

4. **Check API keys**: Make sure you're using the correct Stripe account's API keys

### Need help?

- **Stripe Support**: https://support.stripe.com
- **Connect Documentation**: https://stripe.com/docs/connect
- **Stripe Dashboard**: https://dashboard.stripe.com/connect

## Visual Guide

1. **Dashboard Home** → Click **"Connect"** in left sidebar
2. **Connect Page** → Click **"Get started"** button
3. **Setup Wizard** → Choose **"Express accounts"**
4. **Complete Setup** → Fill in required information
5. **Done!** → You'll see the Connect dashboard

## Quick Checklist

- [ ] Logged into Stripe Dashboard
- [ ] In Test mode (for testing)
- [ ] Clicked "Connect" in sidebar
- [ ] Clicked "Get started" or "Activate"
- [ ] Selected "Express accounts"
- [ ] Completed setup wizard
- [ ] See Connect dashboard (Accounts, Settings, etc.)
- [ ] Wait 1-2 minutes
- [ ] Try creating vendor account again

## Next Steps

After enabling Connect:
1. ✅ Test vendor account creation
2. ✅ Test onboarding flow
3. ✅ Test payment processing
4. ✅ Set up webhooks (see `STRIPE_CONNECT_TESTING.md`)
