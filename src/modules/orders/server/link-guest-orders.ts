import type { Payload } from "payload";

/**
 * Attach past guest-checkout orders to a newly registered (or OAuth-created) user
 * when `guestEmail` matches the account email (case-insensitive).
 *
 * Does not modify orders that already have a `user` set.
 */
export async function linkGuestOrdersToUser(
  db: Payload,
  userId: string,
  email: string
): Promise<number> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !userId) {
    return 0;
  }

  const guestOrders = await db.find({
    collection: "orders",
    depth: 0,
    limit: 200,
    pagination: false,
    where: {
      and: [
        {
          guestEmail: {
            exists: true,
          },
        },
        {
          user: {
            exists: false,
          },
        },
      ],
    },
  });

  let linked = 0;

  for (const order of guestOrders.docs) {
    const orderGuestEmail =
      typeof order.guestEmail === "string"
        ? order.guestEmail.trim().toLowerCase()
        : null;

    if (!orderGuestEmail || orderGuestEmail !== normalizedEmail) {
      continue;
    }

    await db.update({
      collection: "orders",
      id: order.id,
      data: {
        user: userId,
      },
      overrideAccess: true,
    });
    linked += 1;
  }

  return linked;
}
