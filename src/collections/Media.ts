import type { CollectionConfig } from "payload";
import { isAppAdmin } from "@/lib/access";
import { extractPaletteFromBuffer } from "@/lib/media/extract-palette";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => isAppAdmin(req.user),
  },
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation !== "create" && operation !== "update") return doc;
        if (!doc.mimeType?.startsWith("image/")) return doc;
        if (doc.dominantColor) return doc;

        try {
          const payload = req.payload;
          const file = await fetch(doc.url as string);
          if (!file.ok) return doc;
          const buffer = Buffer.from(await file.arrayBuffer());
          const { dominantColor, palette } = await extractPaletteFromBuffer(buffer);
          await payload.update({
            collection: "media",
            id: doc.id,
            data: { dominantColor, palette } as Record<string, unknown>,
            overrideAccess: true,
          });
        } catch {
          /* palette extraction is best-effort */
        }
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "dominantColor",
      type: "text",
      admin: { readOnly: true, description: "Auto-extracted dominant color" },
    },
    {
      name: "palette",
      type: "json",
      admin: { readOnly: true, description: "Auto-extracted color palette" },
    },
  ],
  upload: true,
};
