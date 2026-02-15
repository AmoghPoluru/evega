import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getPayload } from "payload";
import config from "@payload-config";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  const payload = await getPayload({ config });

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract metadata
      const userId = session.metadata?.userId;
      const productIds = session.metadata?.productIds?.split(",") || [];

      if (!userId || productIds.length === 0) {
        console.error("Missing userId or productIds in session metadata");
        return NextResponse.json(
          { error: "Invalid session metadata" },
          { status: 400 }
        );
      }

      // Create orders for each product
      try {
        for (const productId of productIds) {
          // Get product to create order name
          const product = await payload.findByID({
            collection: "products",
            id: productId,
            depth: 0,
          });

          // Create order using db.create to bypass access control (for webhooks)
          await payload.db.create({
            collection: "orders",
            data: {
              name: `Order for ${product.name}`,
              user: userId,
              product: productId,
              stripeCheckoutSessionId: session.id,
              stripeAccountId: session.account || null,
            },
          });
        }

        console.log(`Created ${productIds.length} order(s) for session ${session.id}`);
      } catch (error) {
        console.error("Error creating orders:", error);
        return NextResponse.json(
          { error: "Failed to create orders" },
          { status: 500 }
        );
      }

      break;
    }

    case "payment_intent.succeeded": {
      // Handle successful payment
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment succeeded:", paymentIntent.id);
      break;
    }

    case "payment_intent.payment_failed": {
      // Handle failed payment
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment failed:", paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
