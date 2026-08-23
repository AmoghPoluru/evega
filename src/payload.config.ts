import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Products } from "./collections/Products";
import { Tags } from "./collections/Tags";
import { HeroBanners } from "./collections/HeroBanners";
import { Orders } from "./collections/Orders";
import { Vendors } from "./collections/Vendors";
import { VendorHeroBanners } from "./collections/VendorHeroBanners";
import { VendorTemplates } from "./collections/VendorTemplates";
import { PotentialVendorRegions } from "./collections/PotentialVendorRegions";
import { Roles } from "./collections/Roles";
import { Customers } from "./collections/Customers";
import { VariantTypes } from "./collections/VariantTypes";
import { VariantOptions } from "./collections/VariantOptions";
import { Favorites } from "./collections/Favorites";
import { ProductLikes } from "./collections/ProductLikes";
import { ProductViews } from "./collections/ProductViews";
import { ProductComments } from "./collections/ProductComments";
import { SocialPosts } from "./collections/SocialPosts";
import { VendorSocialConnections } from "./collections/VendorSocialConnections";
import { WhatsAppChannelSessions } from "./collections/WhatsAppChannelSessions";
import { HeroBannerConfig } from "./collections/HeroBannerConfig";
import { HappyBanners } from "./collections/HappyBanners";
import { VendorLogoTemplates } from "./collections/VendorLogoTemplates";
import { VendorExpenses } from "./collections/VendorExpenses";
import { getPayloadCsrfOrigins } from "./lib/payload-csrf-origins";
import { getPayloadCorsOrigins } from "./lib/payload-cors-origins";

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
  collections: [Users, Media, Products, Tags, HeroBanners, Orders, Vendors, Roles, Customers, VariantTypes, VariantOptions, VendorHeroBanners, VendorTemplates, HappyBanners, VendorLogoTemplates, VendorExpenses, PotentialVendorRegions, Favorites, ProductLikes, ProductViews, ProductComments, SocialPosts, VendorSocialConnections, WhatsAppChannelSessions],
  globals: [HeroBannerConfig],
  editor: lexicalEditor(),
  // Use placeholder during build (must be at least 32 chars), actual secret at runtime
  secret: payloadSecret || (isBuildTime ? 'build-placeholder-secret-replace-at-runtime-minimum-32-characters-long' : ''),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || "",
  }),
  // Configure server URL for media file serving in production
  // This ensures Payload generates absolute URLs for media files
  serverURL: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  csrf: getPayloadCsrfOrigins(),
  cors: getPayloadCorsOrigins(),
  sharp,
  plugins: [],
});
