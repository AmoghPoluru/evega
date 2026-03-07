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
        console.log(`Processing checkout session ${session.id} with ${cartItems.length} item(s)`);
        
        // Get user with shipping addresses (once, outside the loop)
        const user = await payload.findByID({
          collection: "users",
          id: userId,
          depth: 0,
        });

        if (!user) {
          console.error(`User ${userId} not found`);
          throw new Error(`User ${userId} not found`);
        }

        // Get default address or first address
        const userAddresses = user.shippingAddresses || [];
        const defaultAddress = userAddresses.find((addr: any) => addr.isDefault) || userAddresses[0];

        if (!defaultAddress) {
          console.error(`❌ No shipping address found for user ${userId}`);
          throw new Error(
            `Shipping address is required but user ${userId} has no saved addresses. ` +
            `Please ensure user adds a shipping address before checkout.`
          );
        }

        // Map user's saved address to order format (reused for all orders)
        const shippingAddress: any = {
          fullName: defaultAddress.fullName,
          phone: defaultAddress.phone || undefined,
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipcode: defaultAddress.zipcode,
          country: "United States", // Default since addresses are US-focused
        };

        // Validate that all required shipping address fields are present
        if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.zipcode) {
          console.error(`❌ Incomplete shipping address for user ${userId}:`, shippingAddress);
          throw new Error(
            `Shipping address is incomplete. Missing required fields: ` +
            `${!shippingAddress.fullName ? 'fullName, ' : ''}` +
            `${!shippingAddress.street ? 'street, ' : ''}` +
            `${!shippingAddress.city ? 'city, ' : ''}` +
            `${!shippingAddress.state ? 'state, ' : ''}` +
            `${!shippingAddress.zipcode ? 'zipcode' : ''}`
          );
        }

        // Track unique vendors for customer update (optimize to update customer once per checkout)
        const uniqueVendorIds = new Set<string>();

        for (const cartItem of cartItems) {
          console.log(`Processing cart item: productId=${cartItem.productId}, quantity=${cartItem.quantity}`);
          
          // Get product with variants
          const product = await payload.findByID({
            collection: "products",
            id: cartItem.productId,
            depth: 0,
          });

          if (!product) {
            console.error(`Product ${cartItem.productId} not found`);
            throw new Error(`Product ${cartItem.productId} not found`);
          }

          console.log(`Found product: ${product.name}, vendor: ${product.vendor}`);

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

          // Track vendor for customer update
          const productVendorId = typeof product.vendor === "string" 
            ? product.vendor 
            : product.vendor?.id;
          if (productVendorId) {
            uniqueVendorIds.add(productVendorId);
          }

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
          // Explicitly set vendor field (required) - get from product
          const orderVendorId = typeof product.vendor === "string" 
            ? product.vendor 
            : product.vendor?.id;

          if (!orderVendorId) {
            console.error(`Product ${product.id} (${product.name}) has no vendor, cannot create order`);
            throw new Error(`Product ${product.id} has no vendor assigned`);
          }

          // Fetch vendor to get commission rate and Stripe account
          const vendor = await payload.findByID({
            collection: "vendors",
            id: orderVendorId,
            depth: 0,
          });

          // Get commission rate (default to 10% if not set)
          const commissionRate = vendor.commissionRate ?? parseFloat(process.env.PLATFORM_COMMISSION_RATE || "10");
          
          // Calculate commission and vendor payout
          const commission = (total * commissionRate) / 100;
          const vendorPayout = total - commission;

          // Get payment intent to extract transfer information (if using Stripe Connect)
          let transferId: string | null = null;
          let transferStatus: "pending" | "paid" | "failed" | "canceled" = "pending";
          
          if (session.payment_intent) {
            try {
              const paymentIntent = await stripe.paymentIntents.retrieve(
                session.payment_intent as string,
                { expand: ["charges.data.balance_transaction"] }
              );
              
              // Check if this payment has a transfer (Stripe Connect)
              if (paymentIntent.transfer_data?.destination) {
                // For Direct Charges, the transfer is created automatically
                // We'll update it when we receive the transfer webhook event
                transferStatus = "pending";
              }
            } catch (error) {
              console.error("Error retrieving payment intent:", error);
            }
          }

          console.log(`Creating order for product ${product.name}, vendor: ${orderVendorId}, commission: ${commissionRate}% (${commission.toFixed(2)}), vendor payout: ${vendorPayout.toFixed(2)}`);
          // Shipping address is already fetched above and reused for all orders

          const orderData: any = {
            orderNumber,
            name: orderName,
            user: userId,
            vendor: orderVendorId, // Explicitly set vendor (required field)
            product: cartItem.productId,
            status: "payment_done", // Payment successful, admin will move to processing then complete
            total: total,
            commission: commission,
            commissionRate: commissionRate,
            vendorPayout: {
              amount: vendorPayout,
              commissionAmount: commission,
              status: "pending",
            },
            quantity: cartItem.quantity || 1,
            size: cartItem.size || undefined,
            color: cartItem.color || undefined,
            stripeCheckoutSessionId: session.id,
            stripeAccountId: vendor.stripeAccountId || (session as any).account || null,
            stripePaymentIntentId: session.payment_intent as string || null,
            stripeTransferId: transferId || null,
            transferStatus: transferStatus,
            shippingAddress: shippingAddress, // Required field
            // statusHistory will be automatically created by the Orders collection hook
          };

          console.log(`Order data:`, JSON.stringify(orderData, null, 2));

          let createdOrder;
          try {
            createdOrder = await payload.create({
              collection: "orders",
              data: orderData,
            });
            console.log(`✅ Created order ${orderNumber} (ID: ${createdOrder.id}) for ${product.name}`);
            
            // Send order confirmation email (async, don't block)
            if (user?.email) {
              try {
                const { sendOrderConfirmationEmail } = await import("@/lib/email");
                await sendOrderConfirmationEmail(
                  user.email,
                  orderNumber,
                  lineItem.amount_total / 100, // Convert from cents
                  [
                    {
                      name: product.title || product.name || "Product",
                      quantity: lineItem.quantity || 1,
                      price: lineItem.amount_total / 100,
                    },
                  ]
                );
                console.log(`📧 Sent order confirmation email to ${user.email}`);
              } catch (emailError) {
                // Log but don't fail order creation
                console.error(`⚠️  Failed to send order confirmation email:`, emailError);
              }
            }
          } catch (orderError) {
            console.error(`❌ Failed to create order for product ${product.name}:`, orderError);
            if (orderError instanceof Error) {
              console.error("Error message:", orderError.message);
              console.error("Error stack:", orderError.stack);
            }
            throw orderError; // Re-throw to be caught by outer try-catch
          }

          // Note: statusHistory is automatically created by the Orders collection hook
          // The hook creates an entry with the current status ("payment_done") and note "Order created"
          // If we need both "pending" and "payment_done" entries, we can add it here, but it's optional
        }

        // Create or update customer record once after all orders are created
        console.log(`Processing customer creation/update for user ${userId} with ${uniqueVendorIds.size} vendor(s)`);
        
        if (uniqueVendorIds.size > 0) {
          try {
            // User is already fetched above, reuse it
            console.log(`Found user: ${user.email || user.name || userId}`);

            // Check if customer already exists
            const existingCustomers = await payload.find({
              collection: "customers",
              where: {
                user: { equals: userId },
              },
              limit: 1,
            });

            const orderDate = new Date();

            if (existingCustomers.docs.length > 0) {
              // Update existing customer
              const customer = existingCustomers.docs[0];
              const vendors = customer.vendors || [];
              const vendorIds = Array.isArray(vendors) 
                ? vendors.map((v: any) => typeof v === "string" ? v : v.id)
                : [];

              // Add all unique vendors from this checkout if not already in list
              uniqueVendorIds.forEach((vendorId) => {
                if (!vendorIds.includes(vendorId)) {
                  vendorIds.push(vendorId);
                }
              });

              // Calculate updated totals from all orders
              const allOrders = await payload.find({
                collection: "orders",
                where: {
                  user: { equals: userId },
                  status: { not_equals: "canceled" },
                },
                limit: 10000,
              });

              const totalOrders = allOrders.docs.length;
              const totalSpent = allOrders.docs.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
              const orderDates = allOrders.docs.map((o: any) => new Date(o.createdAt));
              const lastOrderDate = orderDates.length > 0 
                ? orderDates.sort((a, b) => b.getTime() - a.getTime())[0]
                : orderDate;
              const firstOrderDate = orderDates.length > 0
                ? orderDates.sort((a, b) => a.getTime() - b.getTime())[0]
                : orderDate;

              await payload.update({
                collection: "customers",
                id: customer.id,
                data: {
                  name: user.name || user.email || "Unknown",
                  email: user.email || "",
                  phone: (user as any).phone || undefined,
                  vendors: vendorIds,
                  totalOrders: totalOrders,
                  totalSpent: totalSpent,
                  lastOrderDate: lastOrderDate.toISOString(),
                  firstOrderDate: firstOrderDate ? firstOrderDate.toISOString() : orderDate.toISOString(),
                },
              });

              console.log(`✅ Updated customer record (ID: ${customer.id}) for user ${userId} with ${uniqueVendorIds.size} vendor(s)`);
            } else {
              // Create new customer
              console.log(`Creating new customer record for user ${userId}`);
              
              // Calculate totals from all orders (should be at least the orders just created)
              const allOrders = await payload.find({
                collection: "orders",
                where: {
                  user: { equals: userId },
                  status: { not_equals: "canceled" },
                },
                limit: 10000,
              });

              console.log(`Found ${allOrders.docs.length} order(s) for user ${userId}`);

              const totalOrders = allOrders.docs.length;
              const totalSpent = allOrders.docs.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
              const orderDates = allOrders.docs.map((o: any) => new Date(o.createdAt));
              const lastOrderDate = orderDates.length > 0 
                ? orderDates.sort((a, b) => b.getTime() - a.getTime())[0]
                : orderDate;
              const firstOrderDate = orderDates.length > 0
                ? orderDates.sort((a, b) => a.getTime() - b.getTime())[0]
                : orderDate;

              const customerData = {
                user: userId,
                name: user.name || user.email || "Unknown",
                email: user.email || "",
                phone: (user as any).phone || undefined,
                vendors: Array.from(uniqueVendorIds),
                totalOrders: totalOrders,
                totalSpent: totalSpent,
                lastOrderDate: lastOrderDate.toISOString(),
                firstOrderDate: firstOrderDate.toISOString(),
              };

              console.log(`Customer data:`, JSON.stringify(customerData, null, 2));

              const createdCustomer = await payload.create({
                collection: "customers",
                data: customerData,
              });

              console.log(`✅ Created new customer record (ID: ${createdCustomer.id}) for user ${userId} with ${uniqueVendorIds.size} vendor(s)`);
            }
          } catch (customerError) {
            console.error("❌ Error creating/updating customer:", customerError);
            if (customerError instanceof Error) {
              console.error("Error message:", customerError.message);
              console.error("Error stack:", customerError.stack);
            }
            // Don't fail the webhook if customer creation fails
          }
        } else {
          console.warn(`⚠️ No vendors found in checkout, skipping customer creation`);
        }

        console.log(`✅ Successfully processed ${cartItems.length} order(s) and updated inventory for session ${session.id}`);
      } catch (error) {
        console.error("❌ Error creating orders or updating inventory:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        return NextResponse.json(
          { error: "Failed to process order", details: error instanceof Error ? error.message : String(error) },
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
      // Handle payment intent success - extract transfer information for Stripe Connect
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        // If this payment has a transfer (Stripe Connect), update orders
        if (paymentIntent.transfer_data?.destination) {
          // Find orders with this payment intent
          const orders = await payload.find({
            collection: "orders",
            where: {
              stripePaymentIntentId: { equals: paymentIntent.id },
            },
            limit: 100,
          });

          // Get the transfer ID from the charge
          let transferId: string | null = null;
          if (paymentIntent.latest_charge) {
            const charge = await stripe.charges.retrieve(
              typeof paymentIntent.latest_charge === "string" 
                ? paymentIntent.latest_charge 
                : paymentIntent.latest_charge.id,
              { expand: ["balance_transaction"] }
            );
            
            // Find the transfer associated with this charge
            const transfers = await stripe.transfers.list({
              limit: 10,
            });
            
            const transfer = transfers.data.find(
              (t) => t.destination === paymentIntent.transfer_data.destination
            );
            
            if (transfer) {
              transferId = transfer.id;
            }
          }

          // Update orders with transfer information
          for (const order of orders.docs) {
            if (transferId && !order.stripeTransferId) {
              await payload.update({
                collection: "orders",
                id: order.id,
                data: {
                  stripeTransferId: transferId,
                  transferStatus: "pending", // Will be updated by transfer webhook
                },
              });
            }
          }

          console.log(`Updated ${orders.docs.length} order(s) with transfer ${transferId} for payment intent ${paymentIntent.id}`);
        }
      } catch (error) {
        console.error("Error handling payment_intent.succeeded webhook:", error);
      }

      return NextResponse.json({ received: true });
    }

    case "account.updated": {
      // Stripe Connect account was updated (onboarding completed, status changed, etc.)
      const account = event.data.object as Stripe.Account;
      
      console.log(`📝 Stripe account updated: ${account.id}`);

      try {
        // Find vendor by Stripe account ID
        const vendors = await payload.find({
          collection: "vendors",
          where: {
            stripeAccountId: {
              equals: account.id,
            },
          },
          limit: 1,
        });

        if (vendors.docs.length > 0) {
          const vendor = vendors.docs[0];
          
          // Import sync function
          const { syncVendorStripeDetails } = await import("@/lib/stripe-connect");
          
          // Sync full vendor Stripe details
          const stripeDetails = await syncVendorStripeDetails(account.id);

          // Update vendor with synced details
          await payload.update({
            collection: "vendors",
            id: vendor.id,
            data: stripeDetails,
          });

          console.log(`✅ Updated vendor ${vendor.id} with Stripe account details for account ${account.id}`);
        } else {
          console.warn(`⚠️ No vendor found for Stripe account ${account.id}`);
        }
      } catch (error) {
        console.error(`❌ Error handling account.updated webhook:`, error);
        // Don't fail the webhook - log and continue
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
