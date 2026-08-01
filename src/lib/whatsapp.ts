/**
 * WhatsApp Business Cloud API Service
 *
 * Mirrors the provider pattern in `src/lib/email.ts`: env is read on module load
 * as a platform-wide default, per-vendor credentials can be passed per call, and
 * callers are expected to swallow errors ("async, don't block, log on failure").
 */

import type { BasePayload } from "payload";
import type { Product, Vendor } from "@/payload-types";

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";
const DEFAULT_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const DEFAULT_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

if (
  process.env.NODE_ENV === "development" &&
  (!DEFAULT_PHONE_NUMBER_ID || !DEFAULT_ACCESS_TOKEN)
) {
  console.warn(
    "⚠️  WhatsApp not configured (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN). Messages will only send when a vendor has its own credentials."
  );
}

function graphUrl(phoneNumberId: string): string {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
}

interface WhatsAppCreds {
  phoneNumberId?: string | null;
  accessToken?: string | null;
}

function resolveCreds(creds: WhatsAppCreds): {
  phoneNumberId: string;
  accessToken: string;
} | null {
  const phoneNumberId = creds.phoneNumberId || DEFAULT_PHONE_NUMBER_ID;
  const accessToken = creds.accessToken || DEFAULT_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.warn("📱 WhatsApp message not sent (no phone number id / access token).");
    }
    return null;
  }
  return { phoneNumberId, accessToken };
}

async function postToGraph(
  phoneNumberId: string,
  accessToken: string,
  payload: Record<string, unknown>
): Promise<{ id?: string }> {
  const res = await fetch(graphUrl(phoneNumberId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(
      `WhatsApp API error (${res.status}): ${data?.error?.message || "unknown error"}`
    );
  }

  return { id: data?.messages?.[0]?.id };
}

export interface SendWhatsAppTemplateArgs extends WhatsAppCreds {
  to: string;
  template: string;
  /** Body text parameters, in order. */
  params?: string[];
  languageCode?: string;
  /** Publicly hosted image URL for an IMAGE header component. */
  headerImageUrl?: string;
}

/**
 * Send a WhatsApp template (business-initiated) message. Templates must be
 * pre-approved in the Meta WhatsApp Manager.
 */
export async function sendWhatsAppTemplate(
  args: SendWhatsAppTemplateArgs
): Promise<{ id?: string } | null> {
  const creds = resolveCreds(args);
  if (!creds) return null;

  const components: Record<string, unknown>[] = [];

  if (args.headerImageUrl) {
    components.push({
      type: "header",
      parameters: [{ type: "image", image: { link: args.headerImageUrl } }],
    });
  }

  if (args.params && args.params.length > 0) {
    components.push({
      type: "body",
      parameters: args.params.map((text) => ({ type: "text", text })),
    });
  }

  return postToGraph(creds.phoneNumberId, creds.accessToken, {
    to: args.to,
    type: "template",
    template: {
      name: args.template,
      language: { code: args.languageCode || "en_US" },
      ...(components.length > 0 ? { components } : {}),
    },
  });
}

export interface SendWhatsAppTextArgs extends WhatsAppCreds {
  to: string;
  body: string;
  previewUrl?: boolean;
}

/**
 * Send a plain-text WhatsApp message. Used for the product "post to Business
 * WhatsApp" broadcast case (requires an active session or opted-in recipient).
 */
export async function sendWhatsAppText(
  args: SendWhatsAppTextArgs
): Promise<{ id?: string } | null> {
  const creds = resolveCreds(args);
  if (!creds) return null;

  return postToGraph(creds.phoneNumberId, creds.accessToken, {
    to: args.to,
    type: "text",
    text: { preview_url: args.previewUrl ?? true, body: args.body },
  });
}

export type ResolvedVendorWhatsApp = {
  vendorId: string;
  businessNumber?: string | null;
  phoneNumberId?: string | null;
  accessToken?: string | null;
  notificationsEnabled: boolean;
};

/**
 * Load a product's owning vendor and return its `whatsappConfig`. Used by the
 * order / like / favorite notification hooks.
 */
export async function resolveVendorWhatsApp(
  payload: BasePayload,
  product: Product | string
): Promise<ResolvedVendorWhatsApp | null> {
  try {
    let productDoc: Product;
    if (typeof product === "string") {
      productDoc = await payload.findByID({
        collection: "products",
        id: product,
        depth: 0,
        overrideAccess: true,
      });
    } else {
      productDoc = product;
    }

    const vendorRef = productDoc.vendor;
    const vendorId =
      typeof vendorRef === "string" ? vendorRef : vendorRef?.id;
    if (!vendorId) return null;

    const vendor: Vendor =
      typeof vendorRef === "object" && vendorRef !== null && "whatsappConfig" in vendorRef
        ? (vendorRef as Vendor)
        : await payload.findByID({
            collection: "vendors",
            id: vendorId,
            depth: 0,
            overrideAccess: true,
          });

    const config = vendor.whatsappConfig;
    return {
      vendorId,
      businessNumber: config?.businessNumber ?? null,
      phoneNumberId: config?.phoneNumberId ?? null,
      accessToken: config?.accessToken ?? null,
      notificationsEnabled: config?.notificationsEnabled ?? false,
    };
  } catch (error) {
    console.error("Failed to resolve vendor WhatsApp config:", error);
    return null;
  }
}

/**
 * Extract a product's primary image URL from a media-populated product,
 * returning an absolute URL (Meta requires a publicly hosted image URL).
 */
export function extractProductImageUrl(product: Product): string | undefined {
  const candidates: unknown[] = [product.image];
  if (Array.isArray(product.cover)) {
    candidates.push(...product.cover);
  }
  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      "url" in candidate &&
      typeof (candidate as { url?: unknown }).url === "string"
    ) {
      const url = (candidate as { url: string }).url;
      if (url.startsWith("http")) return url;
      const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
      return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
    }
  }
  return undefined;
}

/**
 * Load a product (media populated) and return its primary image URL. Refetches
 * with depth when the passed product's media is not populated.
 */
export async function resolveProductImageUrl(
  payload: BasePayload,
  product: Product | string
): Promise<string | undefined> {
  try {
    let productDoc: Product;
    if (
      typeof product === "object" &&
      product.image &&
      typeof product.image === "object"
    ) {
      productDoc = product;
    } else {
      const id = typeof product === "string" ? product : product.id;
      productDoc = await payload.findByID({
        collection: "products",
        id,
        depth: 1,
        overrideAccess: true,
      });
    }
    return extractProductImageUrl(productDoc);
  } catch (error) {
    console.error("Failed to resolve product image URL:", error);
    return undefined;
  }
}

const TEMPLATE_ORDER = process.env.WHATSAPP_TEMPLATE_ORDER || "order_notification";
const TEMPLATE_LIKE = process.env.WHATSAPP_TEMPLATE_LIKE || "product_liked";
const TEMPLATE_FAVORITE = process.env.WHATSAPP_TEMPLATE_FAVORITE || "product_favorited";

/**
 * Send a vendor WhatsApp notification for a template if the vendor has
 * notifications enabled and a business number configured. Returns null (no-op)
 * otherwise. Never throws — callers may still wrap in try/catch to be safe.
 */
export async function notifyVendorWhatsApp(
  vendor: ResolvedVendorWhatsApp | null,
  template: string,
  params: string[],
  headerImageUrl?: string
): Promise<{ id?: string } | null> {
  if (!vendor) return null;
  if (!vendor.notificationsEnabled || !vendor.businessNumber) return null;

  return sendWhatsAppTemplate({
    to: vendor.businessNumber,
    template,
    params,
    headerImageUrl,
    phoneNumberId: vendor.phoneNumberId,
    accessToken: vendor.accessToken,
  });
}

export function notifyVendorNewOrder(
  vendor: ResolvedVendorWhatsApp | null,
  args: {
    orderNumber: string;
    productName: string;
    quantity: number;
    total: number;
    customerName: string;
    orderUrl?: string;
    imageUrl?: string;
  }
): Promise<{ id?: string } | null> {
  return notifyVendorWhatsApp(
    vendor,
    TEMPLATE_ORDER,
    [
      args.orderNumber,
      args.productName,
      String(args.quantity),
      `$${args.total.toFixed(2)}`,
      args.customerName,
      args.orderUrl || "",
    ],
    args.imageUrl
  );
}

export function notifyVendorProductLiked(
  vendor: ResolvedVendorWhatsApp | null,
  args: { productName: string }
): Promise<{ id?: string } | null> {
  return notifyVendorWhatsApp(vendor, TEMPLATE_LIKE, [args.productName]);
}

export function notifyVendorProductFavorited(
  vendor: ResolvedVendorWhatsApp | null,
  args: { productName: string }
): Promise<{ id?: string } | null> {
  return notifyVendorWhatsApp(vendor, TEMPLATE_FAVORITE, [args.productName]);
}
