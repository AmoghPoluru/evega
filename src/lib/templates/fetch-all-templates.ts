import type { Payload, Where } from "payload";
import type { VendorTemplate } from "@/payload-types";

/** Fetch every matching vendor-template doc (Payload default limit is 10). */
export async function fetchAllVendorTemplates(
  payload: Payload,
  options: {
    where?: Where;
    sort?: string;
    depth?: number;
    overrideAccess?: boolean;
  } = {},
): Promise<VendorTemplate[]> {
  const pageSize = 100;
  const docs: VendorTemplate[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await payload.find({
      collection: "vendor-templates",
      where: options.where,
      sort: options.sort ?? "name",
      limit: pageSize,
      page,
      depth: options.depth ?? 0,
      overrideAccess: options.overrideAccess,
    });

    docs.push(...(result.docs as VendorTemplate[]));
    hasNextPage = result.hasNextPage ?? false;
    page += 1;
  }

  return docs;
}
