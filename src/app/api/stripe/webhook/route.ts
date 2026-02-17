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
      const cartItemsJson = session.metadata?.cartItems;

      if (!userId) {
        console.error("Missing userId in session metadata");
        return NextResponse.json(
          { error: "Invalid session metadata" },
          { status: 400 }
        );
      }

      // Parse cartItems from metadata (new format) or fallback to productIds (legacy)
      let cartItems: Array<{
        productId: string;
        size?: string;
        color?: string;
        quantity: number;
      }> = [];

      if (cartItemsJson) {
        try {
          cartItems = JSON.parse(cartItemsJson);
        } catch (error) {
          console.error("Failed to parse cartItems from metadata:", error);
          // Fallback to legacy productIds format
          const productIds = session.metadata?.productIds?.split(",") || [];
          cartItems = productIds.map((id) => ({ productId: id, quantity: 1 }));
        }
      } else {
        // Legacy format: productIds
        const productIds = session.metadata?.productIds?.split(",") || [];
        cartItems = productIds.map((id) => ({ productId: id, quantity: 1 }));
      }

      if (cartItems.length === 0) {
        console.error("No cart items found in session metadata");
        return NextResponse.json(
          { error: "Invalid session metadata" },
          { status: 400 }
        );
      }

      // Create orders and update inventory
      try {
        for (const cartItem of cartItems) {
          // Get product with variants
          const product = await payload.findByID({
            collection: "products",
            id: cartItem.productId,
            depth: 0,
          });

          // Find matching variant if size/color specified
          let variant = null;
          if (product.variants && Array.isArray(product.variants)) {
            variant = product.variants.find((v: any) => {
              const sizeMatch = !cartItem.size || v.size === cartItem.size;
              const colorMatch = !cartItem.color || v.color === cartItem.color;
              return sizeMatch && colorMatch;
            });
          }

          // Update variant stock if variant exists
          if (variant) {
            const newStock = Math.max(0, variant.stock - cartItem.quantity);
            
            // Update the variant in the product's variants array
            const updatedVariants = product.variants.map((v: any) => {
              if (
                (!cartItem.size || v.size === cartItem.size) &&
                (!cartItem.color || v.color === cartItem.color)
              ) {
                return {
                  ...v,
                  stock: newStock,
                };
              }
              return v;
            });

            // Update product with new variant stock
            await payload.update({
              collection: "products",
              id: cartItem.productId,
              data: {
                variants: updatedVariants,
              },
            });

            console.log(
              `Updated stock for ${product.name}${cartItem.size ? ` (${cartItem.size})` : ''}${cartItem.color ? ` - ${cartItem.color}` : ''}: ${variant.stock} → ${newStock}`
            );
          } else if (product.variants && product.variants.length > 0) {
            console.warn(
              `Variant not found for ${product.name}${cartItem.size ? ` (${cartItem.size})` : ''}${cartItem.color ? ` - ${cartItem.color}` : ''}, skipping stock update`
            );
          }

          // Create order
          const orderName = cartItem.size || cartItem.color
            ? `Order for ${product.name}${cartItem.size ? ` (${cartItem.size})` : ''}${cartItem.color ? ` - ${cartItem.color}` : ''}`
            : `Order for ${product.name}`;

          await payload.db.create({
            collection: "orders",
            data: {
              name: orderName,
              user: userId,
              product: cartItem.productId,
              stripeCheckoutSessionId: session.id,
              stripeAccountId: session.account || null,
            },
          });
        }

        console.log(`Created ${cartItems.length} order(s) and updated inventory for session ${session.id}`);
      } catch (error) {
        console.error("Error creating orders or updating inventory:", error);
        return NextResponse.json(
          { error: "Failed to process order" },
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
