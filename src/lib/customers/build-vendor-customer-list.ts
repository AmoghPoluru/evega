import type { BasePayload } from "payload";

import {
  classifyCustomerSegments,
  computeTopCustomerIds,
  getCustomerSegmentLabel,
  getPrimaryCustomerSegment,
  type CustomerSegmentId,
} from "@/lib/customers/customer-segments";
import { computeVendorCustomerMetrics } from "@/lib/customers/upsert-vendor-customer";
import {
  getVendorSegmentOverride,
  resolveDisplaySegment,
  type VendorSegmentOverrideDoc,
} from "@/lib/customers/vendor-segment-override";

type VendorOrderDoc = Parameters<typeof computeVendorCustomerMetrics>[0][number];

export type VendorCustomerListRow = {
  user: unknown;
  orders: VendorOrderDoc[];
  totalSpent: number;
  totalAmountPaid: number;
  orderCount: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
  firstOrderDate: Date | null;
  lastViewedAt: Date | null;
  productViewCount: number;
  customerId: string;
  customerRecordId: string | null;
  name: string;
  email: string;
  phone: string;
  segments: CustomerSegmentId[];
  segmentLabels: string[];
  primarySegment: CustomerSegmentId | null;
  systemSegment: CustomerSegmentId | null;
  displaySegment: CustomerSegmentId | null;
  isManualSegment: boolean;
  segmentOverrideReason: string | null;
  segmentOverrideSetAt: string | null;
  isTopCustomer: boolean;
};

export type VendorCustomerSegmentCounts = {
  all: number;
  visitor: number;
  completed: number;
  pending: number;
  top: number;
};

export async function buildVendorCustomerList(
  db: BasePayload,
  vendorId: string,
): Promise<{
  customers: VendorCustomerListRow[];
  segmentCounts: VendorCustomerSegmentCounts;
}> {
  const [customerRecords, allOrders, productViewsResult] = await Promise.all([
    db.find({
      collection: "customers",
      where: {
        vendors: { contains: vendorId },
      },
      limit: 10000,
      depth: 1,
      sort: "-updatedAt",
    }),
    db.find({
      collection: "orders",
      where: {
        vendor: { equals: vendorId },
      },
      limit: 10000,
      depth: 2,
      sort: "-createdAt",
    }),
    db.find({
      collection: "product-views",
      where: {
        vendor: { equals: vendorId },
      },
      limit: 10000,
      depth: 1,
      sort: "-lastViewedAt",
    }),
  ]);

  const vendorOrders = allOrders.docs as VendorOrderDoc[];

  const overrideByCustomerRecordId = new Map<
    string,
    ReturnType<typeof getVendorSegmentOverride>
  >();

  customerRecords.docs.forEach((customerDoc) => {
    const doc = customerDoc as {
      id: string;
      vendorSegmentOverrides?: VendorSegmentOverrideDoc[] | null;
    };
    const override = getVendorSegmentOverride(doc, vendorId);
    if (override) {
      overrideByCustomerRecordId.set(doc.id, override);
    }
  });

  const viewsByUserId = new Map<
    string,
    { lastViewedAt: Date; viewCount: number; user: unknown }
  >();

  productViewsResult.docs.forEach((viewDoc) => {
    const view = viewDoc as {
      user?: string | { id?: string; name?: string | null; email?: string | null };
      lastViewedAt?: string | null;
      updatedAt?: string | null;
      createdAt?: string | null;
    };
    const userId = typeof viewDoc.user === "string" ? viewDoc.user : viewDoc.user?.id;
    if (!userId) return;

    const viewedAt = new Date(
      viewDoc.lastViewedAt ?? viewDoc.updatedAt ?? viewDoc.createdAt ?? Date.now(),
    );
    const existing = viewsByUserId.get(userId);

    if (!existing) {
      viewsByUserId.set(userId, {
        lastViewedAt: viewedAt,
        viewCount: 1,
        user: viewDoc.user,
      });
      return;
    }

    viewsByUserId.set(userId, {
      lastViewedAt: viewedAt > existing.lastViewedAt ? viewedAt : existing.lastViewedAt,
      viewCount: existing.viewCount + 1,
      user: existing.user ?? viewDoc.user,
    });
  });

  const enrichCustomerRow = (
    row: Omit<
      VendorCustomerListRow,
      | "segments"
      | "segmentLabels"
      | "primarySegment"
      | "lastViewedAt"
      | "productViewCount"
      | "systemSegment"
      | "displaySegment"
      | "isManualSegment"
      | "segmentOverrideReason"
      | "segmentOverrideSetAt"
      | "isTopCustomer"
    >,
  ): Omit<
    VendorCustomerListRow,
    | "isTopCustomer"
    | "systemSegment"
    | "displaySegment"
    | "isManualSegment"
    | "segmentOverrideReason"
    | "segmentOverrideSetAt"
  > => {
    const viewInfo = viewsByUserId.get(row.customerId);
    const segments = classifyCustomerSegments(row.orders, Boolean(viewInfo));

    return {
      ...row,
      segments,
      segmentLabels: segments.map(getCustomerSegmentLabel),
      primarySegment: getPrimaryCustomerSegment(segments),
      lastViewedAt: viewInfo?.lastViewedAt ?? null,
      productViewCount: viewInfo?.viewCount ?? 0,
    };
  };

  const customers: Omit<
    VendorCustomerListRow,
    | "isTopCustomer"
    | "systemSegment"
    | "displaySegment"
    | "isManualSegment"
    | "segmentOverrideReason"
    | "segmentOverrideSetAt"
  >[] = customerRecords.docs.map((customerDoc) => {
    const customer = customerDoc as {
      id: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      user?: string | { id?: string; name?: string | null; email?: string | null } | null;
    };
    const user =
      typeof customer.user === "object" && customer.user ? customer.user : customer.user;
    const metrics = computeVendorCustomerMetrics(vendorOrders, customer);

    return enrichCustomerRow({
      user: user || customer.user,
      orders: metrics.orders,
      totalSpent: metrics.totalSpent,
      totalAmountPaid: metrics.totalSpent,
      orderCount: metrics.orderCount,
      averageOrderValue: metrics.orderCount > 0 ? metrics.totalSpent / metrics.orderCount : 0,
      lastOrderDate: metrics.lastOrderDate,
      firstOrderDate: metrics.firstOrderDate,
      customerId:
        (typeof user === "object" && user?.id
          ? user.id
          : typeof customer.user === "string"
            ? customer.user
            : customer.user?.id) ?? customer.id,
      customerRecordId: customer.id,
      name: customer.name ?? (typeof user === "object" ? user?.name : undefined) ?? "Unknown",
      email: customer.email ?? (typeof user === "object" ? user?.email : undefined) ?? "",
      phone: customer.phone ?? "",
    });
  });

  const customersMap: Record<string, {
    user: unknown;
    orders: VendorOrderDoc[];
    userId: string;
  }> = {};

  vendorOrders.forEach((order) => {
    const userId = typeof order.user === "string" ? order.user : order.user?.id;
    if (!userId) return;

    if (!customersMap[userId]) {
      const user = typeof order.user === "string" ? null : order.user;
      customersMap[userId] = {
        user: user || order.user,
        orders: [],
        userId,
      };
    }
    customersMap[userId].orders.push(order);
  });

  for (const customerData of Object.values(customersMap)) {
    const alreadyListed = customers.some((entry) => entry.customerId === customerData.userId);
    if (alreadyListed) continue;

    const user = customerData.user as { name?: string; email?: string } | null;
    const orders = customerData.orders.filter((order) => order.status !== "canceled");
    const totalAmountPaid = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
    const orderDates = orders
      .map((order) => new Date(order.createdAt ?? Date.now()))
      .sort((a, b) => b.getTime() - a.getTime());

    customers.push(
      enrichCustomerRow({
        user: customerData.user || customerData.userId,
        orders,
        totalSpent: totalAmountPaid,
        totalAmountPaid,
        orderCount: orders.length,
        averageOrderValue: orders.length > 0 ? totalAmountPaid / orders.length : 0,
        lastOrderDate: orderDates.length > 0 ? orderDates[0]! : null,
        firstOrderDate: orderDates.length > 0 ? orderDates[orderDates.length - 1]! : null,
        customerId: customerData.userId,
        customerRecordId: null,
        name: user?.name || user?.email || "Unknown",
        email: user?.email || "",
        phone: "",
      }),
    );
  }

  for (const [userId, viewInfo] of viewsByUserId.entries()) {
    const alreadyListed = customers.some((entry) => entry.customerId === userId);
    if (alreadyListed) continue;

    const user = viewInfo.user as { id?: string; name?: string; email?: string } | null;

    customers.push(
      enrichCustomerRow({
        user: viewInfo.user || userId,
        orders: [],
        totalSpent: 0,
        totalAmountPaid: 0,
        orderCount: 0,
        averageOrderValue: 0,
        lastOrderDate: null,
        firstOrderDate: null,
        customerId: userId,
        customerRecordId: null,
        name: user?.name || user?.email || "Unknown",
        email: user?.email || "",
        phone: "",
      }),
    );
  }

  const topCustomerIds = computeTopCustomerIds(
    customers.map((customer) => {
      const override = customer.customerRecordId
        ? overrideByCustomerRecordId.get(customer.customerRecordId)
        : null;
      const systemSegment = getPrimaryCustomerSegment(customer.segments);
      const displaySegment = resolveDisplaySegment(systemSegment, override ?? null);

      return {
        customerId: customer.customerId,
        segments: displaySegment ? [displaySegment] : customer.segments,
        totalSpent: customer.totalSpent,
      };
    }),
  );

  const customersWithSegments: VendorCustomerListRow[] = customers.map((customer) => {
    const override = customer.customerRecordId
      ? overrideByCustomerRecordId.get(customer.customerRecordId) ?? null
      : null;
    const systemSegment = getPrimaryCustomerSegment(customer.segments);
    const displaySegment = resolveDisplaySegment(systemSegment, override);

    return {
      ...customer,
      systemSegment,
      displaySegment,
      isManualSegment: Boolean(override),
      segmentOverrideReason: override?.reason ?? null,
      segmentOverrideSetAt: override?.setAt ?? null,
      isTopCustomer: topCustomerIds.has(customer.customerId),
    };
  });

  const segmentCounts: VendorCustomerSegmentCounts = {
    all: customersWithSegments.length,
    visitor: customersWithSegments.filter((customer) => customer.displaySegment === "visitor").length,
    completed: customersWithSegments.filter((customer) => customer.displaySegment === "completed").length,
    pending: customersWithSegments.filter((customer) => customer.displaySegment === "pending").length,
    top: topCustomerIds.size,
  };

  return { customers: customersWithSegments, segmentCounts };
}
