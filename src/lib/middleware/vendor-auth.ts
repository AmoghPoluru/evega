import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Require vendor authentication and approval
 * Use this in Next.js server components or route handlers
 * Redirects to sign-in if not authenticated
 * Redirects to pending-approval if vendor not approved
 * Returns user and vendor if approved
 */
export async function requireVendor() {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const session = await payload.auth({ headers: headersList });

  if (!session.user) {
    redirect("/sign-in?redirect=/vendor/dashboard");
  }

  // Check if user has a vendor
  if (!session.user.vendor) {
    redirect("/become-vendor");
  }

  // Fetch vendor to check status
  const vendorId = typeof session.user.vendor === "string"
    ? session.user.vendor
    : session.user.vendor.id;

  const vendor = await payload.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 0,
  });

  // Redirect based on vendor status
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
    vendor: vendor,
  };
}

/**
 * Check vendor status without redirecting
 * Returns status information for conditional rendering
 */
export async function getVendorStatus() {
  const headersList = await headers();
  const payload = await getPayload({ config });
  const session = await payload.auth({ headers: headersList });

  if (!session.user || !session.user.vendor) {
    return {
      hasVendor: false,
      status: "none" as const,
      isActive: false,
      vendor: null,
    };
  }

  const vendorId = typeof session.user.vendor === "string"
    ? session.user.vendor
    : session.user.vendor.id;

  const vendor = await payload.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 0,
  });

  return {
    hasVendor: true,
    status: vendor.status || "pending",
    isActive: vendor.isActive ?? false,
    vendor: vendor,
  };
}
