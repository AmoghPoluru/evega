import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { isSuperAdmin } from "@/lib/access";

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

    // Only super admins can approve vendors
    if (!isSuperAdmin(session.user)) {
      return NextResponse.json(
        { message: "Only administrators can approve vendors" },
        { status: 403 }
      );
    }

    // Await params (Next.js 15 requirement)
    const { id: vendorId } = await params;

    // Update vendor to approved and active
    // Pass user context to respect access control
    const vendor = await payload.update({
      collection: "vendors",
      id: vendorId,
      data: {
        status: "approved",
        isActive: true,
      },
      req: {
        user: session.user,
      } as any,
    });

    return NextResponse.json({
      success: true,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        status: vendor.status,
        isActive: vendor.isActive,
      },
    });
  } catch (error: any) {
    console.error("Error approving vendor:", error);
    return NextResponse.json(
      { message: error.message || "Failed to approve vendor" },
      { status: 500 }
    );
  }
}
