# Quick Start: Testing Stripe Connect

## 🚀 Quick Setup (5 minutes)

### 1. Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Start Webhook Listener (Terminal 1)
```bash
npm run stripe:listen
# Or manually:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Copy the webhook secret** (starts with `whsec_`) from the output!

### 4. Add Webhook Secret to .env.local
```env
STRIPE_WEBHOOK_SECRET=whsec_... (paste from step 3)
```

### 5. Start Dev Server (Terminal 2)
```bash
npm run dev
```

### 6. Test the Flow

1. **As Vendor**: 
   - Go to `http://localhost:3000/vendor/stripe-onboarding`
   - Click "Connect Stripe Account"
   - Complete Stripe test onboarding (use test bank: `000123456789`)

2. **As Customer**:
   - Add product to cart
   - Checkout with test card: `4242 4242 4242 4242`
   - Verify order is created with commission

3. **Check Results**:
   - Vendor dashboard shows "Active" Stripe status
   - Order has `stripeTransferId` and commission calculated
   - Stripe CLI shows webhook events

---

## 📋 Testing Checklist

Run the setup script:
```bash
npm run stripe:test:setup
```

Then follow the steps above.

---

## 🐛 Troubleshooting

**Webhooks not working?**
- Make sure `stripe listen` is running
- Check webhook secret in `.env.local` matches CLI output
- Restart Next.js server after adding webhook secret

**Vendor can't connect?**
- Check vendor is approved and active
- Verify Stripe test mode keys are in `.env.local`

**Payment fails?**
- Use Stripe test card: `4242 4242 4242 4242`
- Check vendor has completed Stripe onboarding
- Verify vendor's Stripe account status is "active"

---

## 📚 Full Documentation

See `docs/STRIPE_CONNECT_TESTING.md` for detailed testing guide.
