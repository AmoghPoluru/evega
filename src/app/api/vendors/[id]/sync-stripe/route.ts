import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { isSuperAdmin } from "@/lib/access";
import { syncVendorStripeDetails } from "@/lib/stripe-connect";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config });
    const headers = request.headers;
    
    // Get current user from session
    const session = await payload.auth({ headers });
    
    if (!session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only super admins can sync Stripe details
    if (!isSuperAdmin(session.user)) {
      return NextResponse.json(
        { message: "Only administrators can sync Stripe details" },
        { status: 403 }
      );
    }

    // Await params (Next.js 15 requirement)
    const { id: vendorId } = await params;

    // Get vendor
    const vendor = await payload.findByID({
      collection: "vendors",
      id: vendorId,
      req: {
        user: session.user,
      } as any,
    });

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    if (!vendor.stripeAccountId) {
      return NextResponse.json(
        { 
          error: "Vendor does not have a Stripe account",
          message: "Please create a Stripe account first via the vendor onboarding page."
        },
        { status: 400 }
      );
    }

    // Sync Stripe details
    const stripeDetails = await syncVendorStripeDetails(vendor.stripeAccountId);

    // Update vendor with synced details
    await payload.update({
      collection: "vendors",
      id: vendorId,
      data: stripeDetails,
      req: {
        user: session.user,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: "Stripe account details synced successfully",
      details: stripeDetails,
    });
  } catch (error: any) {
    console.error("Error syncing Stripe details:", error);
    return NextResponse.json(
      { 
        error: "Failed to sync Stripe details",
        message: error.message || "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}
