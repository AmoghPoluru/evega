import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { Products } from "./collections/Products";
import { Tags } from "./collections/Tags";
import { HeroBanners } from "./collections/HeroBanners";
import { Orders } from "./collections/Orders";
import { Vendors } from "./collections/Vendors";
import { Roles } from "./collections/Roles";
import { Customers } from "./collections/Customers";
import { VariantTypes } from "./collections/VariantTypes";
import { VariantOptions } from "./collections/VariantOptions";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Validate PAYLOAD_SECRET at config time (but allow build to complete)
const payloadSecret = process.env.PAYLOAD_SECRET;
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                   process.env.NEXT_PHASE === 'phase-development-build';

if (!payloadSecret && !isBuildTime) {
  console.error(
    "⚠️  PAYLOAD_SECRET is not set. " +
    "Please add it to your environment variables. " +
    "Generate one with: openssl rand -base64 32"
  );
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Products, Tags, HeroBanners, Orders, Vendors, Roles, Customers, VariantTypes, VariantOptions],
  editor: lexicalEditor(),
  // Use placeholder during build (must be at least 32 chars), actual secret at runtime
  secret: payloadSecret || (isBuildTime ? 'build-placeholder-secret-replace-at-runtime-minimum-32-characters-long' : ''),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || "",
  }),
  sharp,
  plugins: [],
});
