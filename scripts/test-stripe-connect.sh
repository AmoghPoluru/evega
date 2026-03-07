#!/bin/bash

# Stripe Connect Testing Script
# This script helps set up and test Stripe Connect integration

set -e

echo "🔧 Stripe Connect Testing Setup"
echo "================================"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed"
    echo ""
    echo "Install it with:"
    echo "  macOS: brew install stripe/stripe-cli/stripe"
    echo "  Linux/Windows: https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "✅ Stripe CLI found: $(stripe --version)"
echo ""

# Check if user is logged in
if ! stripe config --list &> /dev/null; then
    echo "⚠️  Not logged in to Stripe CLI"
    echo "Run: stripe login"
    exit 1
fi

echo "✅ Logged in to Stripe CLI"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found"
    echo "Creating .env.local from .env.example (if exists)..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local"
    else
        echo "❌ Please create .env.local manually"
        exit 1
    fi
fi

echo "✅ .env.local exists"
echo ""

# Check for required environment variables
echo "Checking environment variables..."
source .env.local 2>/dev/null || true

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "⚠️  STRIPE_SECRET_KEY not set in .env.local"
    echo "   Get it from: https://dashboard.stripe.com/test/apikeys"
fi

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "⚠️  STRIPE_WEBHOOK_SECRET not set"
    echo "   This will be generated when you run: stripe listen"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Run: stripe listen --forward-to localhost:3000/api/stripe/webhook"
    echo "   2. Copy the webhook secret (whsec_...)"
    echo "   3. Add it to .env.local as STRIPE_WEBHOOK_SECRET"
    echo "   4. Restart your Next.js dev server"
else
    echo "✅ STRIPE_WEBHOOK_SECRET is set"
fi

echo ""
echo "🚀 Ready to test!"
echo ""
echo "To start testing:"
echo "  1. Terminal 1: npm run dev"
echo "  2. Terminal 2: stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo "  3. Terminal 3: Open http://localhost:3000"
echo ""
echo "See docs/STRIPE_CONNECT_TESTING.md for detailed testing steps"
