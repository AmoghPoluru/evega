import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Generate unique order number in format: ORD-YYYY-NNNN
 * Example: ORD-2024-0001
 */
export async function generateOrderNumber(): Promise<string> {
  const payload = await getPayload({ config });
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}`;

  // Find the highest order number for this year
  const orders = await payload.find({
    collection: "orders",
    where: {
      orderNumber: {
        contains: prefix,
      },
    },
    limit: 1,
    sort: "-orderNumber",
  });

  let sequence = 1;

  if (orders.docs.length > 0) {
    const lastOrder = orders.docs[0];
    if (lastOrder.orderNumber) {
      // Extract sequence number from last order
      const match = lastOrder.orderNumber.match(/-(\d+)$/);
      if (match) {
        sequence = parseInt(match[1], 10) + 1;
      }
    }
  }

  // Format: ORD-2024-0001 (4-digit sequence)
  const sequenceStr = sequence.toString().padStart(4, "0");
  return `${prefix}-${sequenceStr}`;
}
