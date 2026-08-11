import type { Payload } from "payload";
import { revalidatePath } from "next/cache";

export async function revalidateVendorStorefrontPath(
  db: Payload,
  vendorId: string,
): Promise<void> {
  const vendor = await db.findByID({
    collection: "vendors",
    id: vendorId,
    depth: 0,
  });

  if (vendor.slug) {
    revalidatePath(`/vendors/${vendor.slug}`);
  }
}
