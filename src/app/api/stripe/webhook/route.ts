import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getPayload } from "payload";
import config from "@payload-config";
import { stripe } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/order-number";

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
        variantPrice?: number;
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

          // Calculate final price
          const finalPrice = (variant && cartItem.color && (variant as any)?.price !== undefined && (variant as any).price !== null)
            ? (variant as any).price
            : (cartItem.variantPrice ?? product.price);

          const total = finalPrice * (cartItem.quantity || 1);

          // Update variant stock if variant exists
          if (variant) {
            const newStock = Math.max(0, variant.stock - cartItem.quantity);
            
            // Update the variant in the product's variants array
            const updatedVariants = (product.variants || []).map((v: any) => {
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

          // Generate order number
          const orderNumber = await generateOrderNumber();

          // Create order name
          const orderName = cartItem.size || cartItem.color
            ? `Order for ${product.name}${cartItem.size ? ` (${cartItem.size})` : ''}${cartItem.color ? ` - ${cartItem.color}` : ''}`
            : `Order for ${product.name}`;

          // Create order with status "payment_done" (payment successful)
          await payload.db.create({
            collection: "orders",
            data: {
              orderNumber,
              name: orderName,
              user: userId,
              product: cartItem.productId,
              status: "payment_done", // Payment successful, admin will move to processing then complete
              total: total,
              quantity: cartItem.quantity || 1,
              size: cartItem.size || undefined,
              color: cartItem.color || undefined,
              stripeCheckoutSessionId: session.id,
              stripeAccountId: (session as any).account || null,
              stripePaymentIntentId: session.payment_intent as string || null,
              statusHistory: [
                {
                  status: "pending",
                  timestamp: new Date().toISOString(),
                  note: "Order created",
                },
                {
                  status: "payment_done",
                  timestamp: new Date().toISOString(),
                  note: "Payment successful",
                },
              ],
            },
          });

          console.log(`Created order ${orderNumber} for ${product.name}`);
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

    case "payment_intent.processing": {
      // Payment processing started
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Find order by payment intent ID and update status
      const orders = await payload.find({
        collection: "orders",
        where: {
          stripePaymentIntentId: {
            equals: paymentIntent.id,
          },
        },
        limit: 100,
      });

      for (const order of orders.docs) {
        if (order.status === "pending") {
          await payload.update({
            collection: "orders",
            id: order.id,
            data: {
              status: "processing",
            },
          });
          console.log(`Updated order ${order.orderNumber} to processing`);
        }
      }
      break;
    }

    case "payment_intent.payment_failed":
    case "checkout.session.async_payment_failed": {
      // Payment failed
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Find order by payment intent ID or session ID
      const paymentIntentId = paymentIntent?.id || session?.payment_intent;
      
      if (paymentIntentId) {
        const orders = await payload.find({
          collection: "orders",
          where: {
            or: [
              {
                stripePaymentIntentId: {
                  equals: paymentIntentId as string,
                },
              },
              {
                stripeCheckoutSessionId: {
                  equals: session?.id || "",
                },
              },
            ],
          },
          limit: 100,
        });

        for (const order of orders.docs) {
          if (order.status !== "canceled" && order.status !== "refunded") {
            await payload.update({
              collection: "orders",
              id: order.id,
              data: {
                status: "canceled",
              },
            });
            console.log(`Updated order ${order.orderNumber} to canceled (payment failed)`);
          }
        }
      }
      break;
    }

    case "charge.refunded":
    case "refund.created": {
      // Refund processed
      const charge = event.data.object as Stripe.Charge;
      const refund = event.data.object as Stripe.Refund;
      
      const paymentIntentId = charge?.payment_intent || refund?.payment_intent;
      
      if (paymentIntentId) {
        const orders = await payload.find({
          collection: "orders",
          where: {
            stripePaymentIntentId: {
              equals: paymentIntentId as string,
            },
          },
          limit: 100,
        });

        for (const order of orders.docs) {
          if (order.status !== "refunded") {
            await payload.update({
              collection: "orders",
              id: order.id,
              data: {
                status: "refunded",
              },
            });
            console.log(`Updated order ${order.orderNumber} to refunded`);
          }
        }
      }
      break;
    }

    case "payment_intent.succeeded": {
      // Handle successful payment (already handled by checkout.session.completed)
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment succeeded:", paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
