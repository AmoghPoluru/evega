import Stripe from "stripe";
import { stripe } from "./stripe";

/**
 * Stripe Connect Utility Functions
 * Handles vendor Stripe Connect account creation and management
 */

export interface StripeAccountInfo {
  accountId: string;
  status: "not_connected" | "pending" | "active" | "restricted" | "rejected";
  onboardingLink?: string;
  onboardingCompleted: boolean;
}

/**
 * Create a Stripe Connect Express account for a vendor
 * @param email Vendor email address
 * @param businessName Vendor business name
 * @returns Stripe account ID
 */
export async function createStripeConnectAccount(
  email: string,
  businessName: string
): Promise<string> {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US", // Default to US, can be made configurable
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "company",
      business_profile: {
        name: businessName,
        support_email: email,
      },
    });

    return account.id;
  } catch (error: any) {
    console.error("Error creating Stripe Connect account:", error);
    
    // Provide more specific error messages
    if (error?.type === "StripeInvalidRequestError") {
      if (error.message?.includes("signed up for Connect")) {
        throw new Error(
          "Stripe Connect is not enabled for your account. " +
          "Please enable Stripe Connect in your Stripe Dashboard: https://dashboard.stripe.com/connect"
        );
      }
      throw new Error(error.message || "Stripe API error: " + error.type);
    }
    
    throw new Error(error.message || "Failed to create Stripe Connect account");
  }
}

/**
 * Generate Stripe onboarding link for vendor
 * @param accountId Stripe Connect account ID
 * @param returnUrl URL to redirect after onboarding completion
 * @param refreshUrl URL to redirect if onboarding needs refresh
 * @returns Onboarding link URL
 */
export async function createStripeOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    return accountLink.url;
  } catch (error) {
    console.error("Error creating Stripe onboarding link:", error);
    throw new Error("Failed to create Stripe onboarding link");
  }
}

/**
 * Get Stripe account status
 * @param accountId Stripe Connect account ID
 * @returns Account status information
 */
export async function getStripeAccountStatus(
  accountId: string
): Promise<{
  status: "pending" | "active" | "restricted" | "rejected";
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}> {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return {
      status: account.details_submitted
        ? account.charges_enabled && account.payouts_enabled
          ? "active"
          : "restricted"
        : "pending",
      detailsSubmitted: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
    };
  } catch (error) {
    console.error("Error retrieving Stripe account status:", error);
    throw new Error("Failed to retrieve Stripe account status");
  }
}

/**
 * Get comprehensive Stripe account details
 * @param accountId Stripe Connect account ID
 * @returns Full account details including business info, capabilities, etc.
 */
export async function getStripeAccountDetails(accountId: string): Promise<{
  accountId: string;
  status: "pending" | "active" | "restricted" | "rejected";
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  country: string | null;
  email: string | null;
  businessType: string | null;
  businessProfile: {
    name: string | null;
    supportEmail: string | null;
    supportPhone: string | null;
    url: string | null;
  } | null;
  capabilities: {
    cardPayments: "active" | "inactive" | "pending";
    transfers: "active" | "inactive" | "pending";
  };
  payoutsEnabled: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  } | null;
  createdAt: number;
}> {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    // Determine status
    let status: "pending" | "active" | "restricted" | "rejected" = "pending";
    if (account.details_submitted) {
      if (account.charges_enabled && account.payouts_enabled) {
        status = "active";
      } else if (account.requirements?.currently_due?.length > 0) {
        status = "restricted";
      } else {
        status = "restricted";
      }
    }

    return {
      accountId: account.id,
      status,
      detailsSubmitted: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
      country: account.country || null,
      email: account.email || null,
      businessType: account.business_type || null,
      businessProfile: account.business_profile
        ? {
            name: account.business_profile.name || null,
            supportEmail: account.business_profile.support_email || null,
            supportPhone: account.business_profile.support_phone || null,
            url: account.business_profile.url || null,
          }
        : null,
      capabilities: {
        cardPayments:
          (account.capabilities?.card_payments as "active" | "inactive" | "pending") || "inactive",
        transfers:
          (account.capabilities?.transfers as "active" | "inactive" | "pending") || "inactive",
      },
      payoutsEnabled: account.payouts_enabled || false,
      requirements: account.requirements
        ? {
            currentlyDue: account.requirements.currently_due || [],
            eventuallyDue: account.requirements.eventually_due || [],
            pastDue: account.requirements.past_due || [],
          }
        : null,
      createdAt: account.created,
    };
  } catch (error) {
    console.error("Error retrieving Stripe account details:", error);
    throw new Error("Failed to retrieve Stripe account details");
  }
}

/**
 * Check if vendor Stripe account is ready for payments
 * @param accountId Stripe Connect account ID
 * @returns true if account is active and ready
 */
export async function isStripeAccountReady(accountId: string): Promise<boolean> {
  try {
    const status = await getStripeAccountStatus(accountId);
    return status.status === "active" && status.chargesEnabled && status.payoutsEnabled;
  } catch (error) {
    console.error("Error checking Stripe account readiness:", error);
    return false;
  }
}

/**
 * Sync vendor Stripe account details to database
 * This function fetches full account details from Stripe and returns data to update vendor
 * @param accountId Stripe Connect account ID
 * @returns Data object to update vendor with Stripe account details
 */
export async function syncVendorStripeDetails(accountId: string): Promise<{
  stripeAccountStatus: "pending" | "active" | "restricted" | "rejected";
  stripeOnboardingCompleted: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeAccountCountry: string | null;
  stripeAccountEmail: string | null;
  stripeAccountDetails: any;
}> {
  try {
    const details = await getStripeAccountDetails(accountId);

    return {
      stripeAccountStatus: details.status,
      stripeOnboardingCompleted: details.detailsSubmitted,
      stripeChargesEnabled: details.chargesEnabled,
      stripePayoutsEnabled: details.payoutsEnabled,
      stripeAccountCountry: details.country,
      stripeAccountEmail: details.email,
      stripeAccountDetails: {
        businessType: details.businessType,
        businessProfile: details.businessProfile,
        capabilities: details.capabilities,
        requirements: details.requirements,
        createdAt: details.createdAt,
      },
    };
  } catch (error) {
    console.error("Error syncing vendor Stripe details:", error);
    throw new Error("Failed to sync vendor Stripe details");
  }
}

/**
 * Create payment intent with transfer to vendor account
 * @param amount Amount in dollars (will be converted to cents)
 * @param vendorAccountId Vendor's Stripe Connect account ID
 * @param applicationFeeAmount Platform commission in dollars (will be converted to cents)
 * @param metadata Additional metadata for the payment
 * @returns Payment intent ID
 */
export async function createPaymentIntentWithTransfer(
  amount: number,
  vendorAccountId: string,
  applicationFeeAmount: number,
  metadata: Record<string, string> = {}
): Promise<string> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      application_fee_amount: Math.round(applicationFeeAmount * 100), // Platform commission
      transfer_data: {
        destination: vendorAccountId, // Vendor receives the rest
      },
      metadata,
    });

    return paymentIntent.id;
  } catch (error) {
    console.error("Error creating payment intent with transfer:", error);
    throw new Error("Failed to create payment intent with transfer");
  }
}

/**
 * Create checkout session with Stripe Connect
 * @param lineItems Array of line items for the checkout
 * @param vendorAccountId Vendor's Stripe Connect account ID
 * @param applicationFeeAmount Platform commission in dollars
 * @param successUrl URL to redirect after successful payment
 * @param cancelUrl URL to redirect if payment is cancelled
 * @param metadata Additional metadata
 * @returns Checkout session URL
 */
export async function createCheckoutSessionWithConnect(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  vendorAccountId: string,
  applicationFeeAmount: number,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
): Promise<string> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      payment_intent_data: {
        application_fee_amount: Math.round(applicationFeeAmount * 100),
        transfer_data: {
          destination: vendorAccountId,
        },
        metadata,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      invoice_creation: {
        enabled: true,
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return session.url;
  } catch (error) {
    console.error("Error creating checkout session with Connect:", error);
    throw new Error("Failed to create checkout session");
  }
}
