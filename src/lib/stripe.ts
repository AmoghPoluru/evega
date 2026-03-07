import Stripe from "stripe";

/**
 * Stripe instance with lazy initialization
 * Only creates the instance when actually needed, not at module load time
 * This prevents build errors when STRIPE_SECRET_KEY is not available during build
 */

// Check if we have the API key available
const hasApiKey = !!process.env.STRIPE_SECRET_KEY;

// Only initialize if we have the key, otherwise create a placeholder
export const stripe = hasApiKey
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    })
  : (() => {
      // Create a proxy that will throw a helpful error when accessed
      return new Proxy({} as Stripe, {
        get(_target, prop) {
          throw new Error(
            `STRIPE_SECRET_KEY is not set. Cannot access stripe.${String(prop)}. ` +
            `Please add STRIPE_SECRET_KEY to your environment variables. ` +
            `For Vercel deployment, add it in Project Settings → Environment Variables.`
          );
        },
      });
    })();
