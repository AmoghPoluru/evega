import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Sort } from "payload";

import {
  potentialVendorsToTextarea,
  textareaToPotentialVendors,
} from "@/lib/potential-vendors-utils";

export const potentialVendorRegionInputSchema = z.object({
  region: z.string().min(1, "Region is required"),
  potentialVendorsText: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export function formatPotentialVendorRegion(doc: {
  id: string;
  region: string;
  potentialVendors?: { name: string; id?: string | null }[] | null;
  order?: number | null;
  isActive?: boolean | null;
  updatedAt?: string;
}) {
  return {
    id: doc.id,
    region: doc.region,
    potentialVendorsText: potentialVendorsToTextarea(doc.potentialVendors),
    order: doc.order ?? 0,
    isActive: doc.isActive ?? true,
    updatedAt: doc.updatedAt ?? null,
  };
}

export async function listPotentialVendorRegions(db: {
  find: (args: {
    collection: "potential-vendor-regions";
    sort?: Sort;
    limit?: number;
    depth?: number;
    overrideAccess?: boolean;
  }) => Promise<{ docs: unknown[] }>;
}) {
  const result = await db.find({
    collection: "potential-vendor-regions",
    sort: "order",
    limit: 500,
    depth: 0,
    overrideAccess: true,
  });

  return (result.docs as Parameters<typeof formatPotentialVendorRegion>[0][]).map(
    formatPotentialVendorRegion
  );
}

export function buildPotentialVendorRegionData(
  input: z.infer<typeof potentialVendorRegionInputSchema>
) {
  return {
    region: input.region.trim(),
    potentialVendors: textareaToPotentialVendors(input.potentialVendorsText ?? ""),
    order: input.order ?? 0,
    isActive: input.isActive ?? true,
  };
}

export async function assertRegionUnique(
  db: {
    find: (args: {
      collection: "potential-vendor-regions";
      where: { region: { equals: string } };
      limit: number;
      overrideAccess?: boolean;
    }) => Promise<{ docs: { id: string }[] }>;
  },
  region: string,
  excludeId?: string
) {
  const existing = await db.find({
    collection: "potential-vendor-regions",
    where: { region: { equals: region.trim() } },
    limit: 1,
    overrideAccess: true,
  });

  const match = existing.docs[0];
  if (match && match.id !== excludeId) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `A record for region "${region.trim()}" already exists`,
    });
  }
}
