import type { BasePayload } from "payload";

type CustomerDoc = {
  id: string;
  user?: string | { id: string } | null;
  vendors?: (string | { id: string })[] | null;
  phone?: string | null;
  email?: string | null;
};

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function getRelationshipId(value: string | { id?: string } | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

function mergeVendorIds(
  existing: (string | { id: string })[] | null | undefined,
  vendorId: string,
): string[] {
  const ids = (existing ?? [])
    .map((vendor) => getRelationshipId(vendor))
    .filter((id): id is string => Boolean(id));

  if (!ids.includes(vendorId)) {
    ids.push(vendorId);
  }

  return ids;
}

async function findCustomerByPhone(
  db: BasePayload,
  phone: string,
  overrideAccess: boolean,
): Promise<CustomerDoc | null> {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;

  const result = await db.find({
    collection: "customers",
    where: { phone: { equals: normalizedPhone } },
    limit: 1,
    depth: 0,
    overrideAccess,
  });

  return (result.docs[0] as CustomerDoc | undefined) ?? null;
}

async function findCustomerByUserId(
  db: BasePayload,
  userId: string,
  overrideAccess: boolean,
): Promise<CustomerDoc | null> {
  const result = await db.find({
    collection: "customers",
    where: { user: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess,
  });

  return (result.docs[0] as CustomerDoc | undefined) ?? null;
}

async function findUserByEmail(
  db: BasePayload,
  email: string,
  overrideAccess: boolean,
): Promise<{ id: string } | null> {
  const result = await db.find({
    collection: "users",
    where: { email: { equals: email.toLowerCase() } },
    limit: 1,
    depth: 0,
    overrideAccess,
  });

  return (result.docs[0] as { id: string } | undefined) ?? null;
}

export type UpsertVendorCustomerInput = {
  vendorId: string;
  name: string;
  email?: string;
  phone?: string;
};

export type UpsertVendorCustomerResult = {
  userId?: string;
  customerId: string;
};

export async function upsertVendorCustomer(
  db: BasePayload,
  input: UpsertVendorCustomerInput,
  options: { overrideAccess?: boolean } = {},
): Promise<UpsertVendorCustomerResult> {
  const overrideAccess = options.overrideAccess ?? true;
  const name = input.name.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const normalizedPhone = phone ? normalizePhoneNumber(phone) : "";

  let existingCustomer: CustomerDoc | null = null;

  if (email) {
    const existingUser = await findUserByEmail(db, email, overrideAccess);
    if (existingUser) {
      existingCustomer = await findCustomerByUserId(db, existingUser.id, overrideAccess);
    }
  }

  if (!existingCustomer && normalizedPhone) {
    existingCustomer = await findCustomerByPhone(db, normalizedPhone, overrideAccess);
  }

  const linkedUserFromEmail = email
    ? (await findUserByEmail(db, email, overrideAccess))?.id
    : undefined;

  if (existingCustomer) {
    const existingUserId = getRelationshipId(existingCustomer.user);
    const linkedUserId = existingUserId ?? linkedUserFromEmail;

    await db.update({
      collection: "customers",
      id: existingCustomer.id,
      data: {
        name,
        email: email || existingCustomer.email || undefined,
        phone: normalizedPhone || undefined,
        vendors: mergeVendorIds(existingCustomer.vendors, input.vendorId),
        ...(linkedUserId && !existingUserId ? { user: linkedUserId } : {}),
      },
      overrideAccess,
    } as never);

    if (linkedUserId && (email || name)) {
      await db.update({
        collection: "users",
        id: linkedUserId,
        data: {
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
        },
        overrideAccess,
      } as never);
    }

    return {
      userId: linkedUserId,
      customerId: existingCustomer.id,
    };
  }

  if (!email && !normalizedPhone) {
    throw new Error("Customer email or phone is required");
  }

  const createdCustomer = await db.create({
    collection: "customers",
    data: {
      ...(linkedUserFromEmail ? { user: linkedUserFromEmail } : {}),
      name,
      email: email || undefined,
      phone: normalizedPhone || undefined,
      vendors: [input.vendorId],
      totalOrders: 0,
      totalSpent: 0,
    },
    overrideAccess,
  } as never);

  return {
    userId: linkedUserFromEmail,
    customerId: createdCustomer.id,
  };
}

export async function resolveCustomerRecordForVendor(
  db: BasePayload,
  input: {
    vendorId: string;
    customerRecordId?: string;
    listCustomerId: string;
    name: string;
    email?: string;
    phone?: string;
  },
  options: { overrideAccess?: boolean } = {},
): Promise<string> {
  const overrideAccess = options.overrideAccess ?? true;

  if (input.customerRecordId) {
    return input.customerRecordId;
  }

  const byUser = await findCustomerByUserId(db, input.listCustomerId, overrideAccess);
  if (byUser) {
    return byUser.id;
  }

  try {
    const byId = await db.findByID({
      collection: "customers",
      id: input.listCustomerId,
      depth: 0,
      overrideAccess,
    });
    if (byId) {
      return byId.id;
    }
  } catch {
    // Not a customer record id — continue resolving.
  }

  if (input.phone) {
    const byPhone = await findCustomerByPhone(db, input.phone, overrideAccess);
    if (byPhone) {
      return byPhone.id;
    }
  }

  let email = input.email?.trim().toLowerCase();
  if (!email) {
    try {
      const user = (await db.findByID({
        collection: "users",
        id: input.listCustomerId,
        depth: 0,
        overrideAccess,
      })) as { email?: string | null };
      email = user.email?.trim().toLowerCase() || undefined;
    } catch {
      // listCustomerId is not a user id.
    }
  }

  const { customerId } = await upsertVendorCustomer(
    db,
    {
      vendorId: input.vendorId,
      name: input.name,
      email,
      phone: input.phone,
    },
    { overrideAccess },
  );

  return customerId;
}

type OrderDoc = {
  id: string;
  total?: number | null;
  createdAt?: string;
  status?: string | null;
  user?: string | { id?: string } | null;
  vendor?: string | { id?: string } | null;
  isManualRevenueEntry?: boolean | null;
  shippingAddress?: { phone?: string | null } | null;
  saleCustomers?:
    | {
        customer?: string | { id?: string } | null;
        phone?: string | null;
        name?: string | null;
      }[]
    | null;
};

export type VendorCustomerMetrics = {
  orders: OrderDoc[];
  totalSpent: number;
  orderCount: number;
  lastOrderDate: Date | null;
  firstOrderDate: Date | null;
};

export function computeVendorCustomerMetrics(
  vendorOrders: OrderDoc[],
  customer: {
    id: string;
    user?: string | { id?: string } | null;
    phone?: string | null;
  },
): VendorCustomerMetrics {
  const userId = getRelationshipId(customer.user ?? null);
  const normalizedCustomerPhone = customer.phone ? normalizePhoneNumber(customer.phone) : "";
  const matchedOrders: OrderDoc[] = [];

  for (const order of vendorOrders) {
    if (order.status === "canceled") continue;

    if (order.isManualRevenueEntry && order.saleCustomers?.length) {
      const isLinked = order.saleCustomers.some(
        (saleCustomer) => getCustomerIdFromSaleCustomer(saleCustomer) === customer.id,
      );
      if (isLinked) {
        matchedOrders.push(order);
      }
      continue;
    }

    if (userId && getRelationshipId(order.user) === userId) {
      matchedOrders.push(order);
      continue;
    }

    if (!userId && normalizedCustomerPhone) {
      const shippingPhone = normalizePhoneNumber(order.shippingAddress?.phone ?? "");
      if (shippingPhone === normalizedCustomerPhone) {
        matchedOrders.push(order);
      }
    }
  }

  const totalSpent = matchedOrders.reduce((sum, order) => {
    if (order.isManualRevenueEntry && order.saleCustomers?.length) {
      return sum + (order.total ?? 0) / order.saleCustomers.length;
    }
    return sum + (order.total ?? 0);
  }, 0);

  const orderDates = matchedOrders
    .map((order) => new Date(order.createdAt ?? Date.now()))
    .sort((a, b) => b.getTime() - a.getTime());

  return {
    orders: matchedOrders,
    totalSpent,
    orderCount: matchedOrders.length,
    lastOrderDate: orderDates.length > 0 ? orderDates[0]! : null,
    firstOrderDate: orderDates.length > 0 ? orderDates[orderDates.length - 1]! : null,
  };
}

function getCustomerIdFromSaleCustomer(
  saleCustomer: NonNullable<OrderDoc["saleCustomers"]>[number],
): string | null {
  return getRelationshipId(saleCustomer.customer ?? null);
}

export async function refreshCustomerStats(
  db: BasePayload,
  customerId: string,
  options: { overrideAccess?: boolean } = {},
): Promise<void> {
  const overrideAccess = options.overrideAccess ?? true;

  const customer = (await db.findByID({
    collection: "customers",
    id: customerId,
    depth: 0,
    overrideAccess,
  })) as CustomerDoc;

  const userId = getRelationshipId(customer.user);
  const normalizedCustomerPhone = customer.phone ? normalizePhoneNumber(customer.phone) : "";

  const ordersResult = await db.find({
    collection: "orders",
    where: {
      status: { not_equals: "canceled" },
    },
    limit: 10000,
    depth: 0,
    overrideAccess,
  });

  const orders = ordersResult.docs as OrderDoc[];
  const matchedOrders = new Map<string, { total: number; createdAt: string; vendorId: string | null }>();

  for (const order of orders) {
    let contribution = 0;
    let isMatch = false;

    if (order.isManualRevenueEntry && order.saleCustomers?.length) {
      const linkedCustomers = order.saleCustomers.filter(
        (saleCustomer) => getCustomerIdFromSaleCustomer(saleCustomer) === customerId,
      );

      if (linkedCustomers.length > 0) {
        isMatch = true;
        contribution = (order.total ?? 0) / order.saleCustomers.length;
      }
    } else if (userId && getRelationshipId(order.user) === userId) {
      isMatch = true;
      contribution = order.total ?? 0;
    } else if (!userId && normalizedCustomerPhone) {
      const shippingPhone = normalizePhoneNumber(order.shippingAddress?.phone ?? "");
      if (shippingPhone === normalizedCustomerPhone) {
        isMatch = true;
        contribution = order.total ?? 0;
      }
    }

    if (isMatch) {
      matchedOrders.set(order.id, {
        total: contribution,
        createdAt: order.createdAt ?? new Date().toISOString(),
        vendorId: getRelationshipId(order.vendor ?? null),
      });
    }
  }

  const orderEntries = [...matchedOrders.values()];
  const totalOrders = orderEntries.length;
  const totalSpent = orderEntries.reduce((sum, entry) => sum + entry.total, 0);
  const sortedDates = orderEntries
    .map((entry) => new Date(entry.createdAt))
    .sort((a, b) => a.getTime() - b.getTime());

  const vendorIds = [
    ...new Set(
      orderEntries
        .map((entry) => entry.vendorId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const existingVendorIds = (customer.vendors ?? [])
    .map((vendor) => getRelationshipId(vendor))
    .filter((id): id is string => Boolean(id));

  const mergedVendorIds = [...new Set([...existingVendorIds, ...vendorIds])];

  await db.update({
    collection: "customers",
    id: customerId,
    data: {
      vendors: mergedVendorIds,
      totalOrders,
      totalSpent,
      lastOrderDate:
        sortedDates.length > 0
          ? sortedDates[sortedDates.length - 1]!.toISOString()
          : undefined,
      firstOrderDate: sortedDates.length > 0 ? sortedDates[0]!.toISOString() : undefined,
    },
    overrideAccess,
  } as never);
}

/** @deprecated Use refreshCustomerStats */
export async function refreshCustomerVendorStats(
  db: BasePayload,
  customerId: string,
  _vendorId: string,
  options: { overrideAccess?: boolean } = {},
): Promise<void> {
  return refreshCustomerStats(db, customerId, options);
}
