import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { BasePayload } from "payload";
import type { User, Vendor } from "@/payload-types";
import { getCachedPayload } from "@/lib/payload-client";
import { getCachedSession } from "@/lib/auth-server";

function isPayloadNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number }).status === 404
  );
}

/**
 * Resolve the vendor linked on a user. Returns null when the relationship
 * is missing or points at a deleted/non-existent vendor record.
 */
export async function resolveUserVendor(
  payload: BasePayload,
  user: Pick<User, "vendor">,
  depth = 0
): Promise<Vendor | null> {
  if (!user.vendor) return null;

  const vendorId =
    typeof user.vendor === "string" ? user.vendor : user.vendor.id;

  try {
    return await payload.findByID({
      collection: "vendors",
      id: vendorId,
      depth,
    });
  } catch (error) {
    if (isPayloadNotFound(error)) return null;
    throw error;
  }
}

/**
 * Require vendor authentication and approval
 * Use this in Next.js server components or route handlers
 * Redirects to sign-in if not authenticated
 * Redirects to pending-approval if vendor not approved
 * Returns user and vendor if approved
 */
export async function requireVendor() {
  const headersList = await headers();
  const payload = await getCachedPayload();
  const session = await getCachedSession();

  if (!session.user) {
    const returnTo =
      headersList.get("x-pathname")?.trim() || "/vendor/dashboard";
    redirect(`/sign-in?redirect=${encodeURIComponent(returnTo)}`);
  }

  if (!session.user.vendor) {
    redirect("/become-vendor");
  }

  const vendor = await resolveUserVendor(payload, session.user, 1);
  if (!vendor) {
    redirect("/become-vendor");
  }

  if (vendor.status === "pending" || vendor.status === "rejected") {
    redirect("/vendor/pending-approval");
  }

  if (vendor.status === "suspended") {
    redirect("/vendor/suspended");
  }

  if (vendor.status !== "approved" || !vendor.isActive) {
    redirect("/vendor/pending-approval");
  }

  return {
    user: session.user,
    vendor,
  };
}

/**
 * Check vendor status without redirecting
 * Returns status information for conditional rendering
 */
export async function getVendorStatus() {
  const payload = await getCachedPayload();
  const session = await getCachedSession();

  if (!session.user || !session.user.vendor) {
    return {
      hasVendor: false,
      status: "none" as const,
      isActive: false,
      vendor: null,
    };
  }

  const vendor = await resolveUserVendor(payload, session.user, 0);
  if (!vendor) {
    return {
      hasVendor: false,
      status: "none" as const,
      isActive: false,
      vendor: null,
    };
  }

  return {
    hasVendor: true,
    status: vendor.status || "pending",
    isActive: vendor.isActive ?? false,
    vendor,
  };
}
