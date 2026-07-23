import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Seed every vendor with a starter WhatsApp business number and enable
 * notifications.
 *
 * Usage: npx tsx src/scripts/set-whatsapp-all-vendors.ts
 *
 * Confirm the target database (via DATABASE_URL) before running.
 */

const SEED_BUSINESS_NUMBER = "+13098253354";

async function setWhatsAppForAllVendors() {
  try {
    console.log("🌱 Starting WhatsApp business number seed...");
    const payload = await getPayload({ config });

    const vendorsResult = await payload.find({
      collection: "vendors",
      limit: 1000,
    });

    const vendors = vendorsResult.docs;
    console.log(`\n📦 Found ${vendors.length} vendor(s)`);

    if (vendors.length === 0) {
      console.log("⏭️  No vendors to update");
      process.exit(0);
    }

    let updated = 0;
    let failed = 0;

    for (const vendor of vendors) {
      try {
        await payload.update({
          collection: "vendors",
          id: vendor.id,
          data: {
            whatsappConfig: {
              ...(vendor.whatsappConfig ?? {}),
              businessNumber: SEED_BUSINESS_NUMBER,
              notificationsEnabled: true,
            },
          },
          overrideAccess: true,
        });

        console.log(`✓ Updated vendor: "${vendor.name}" (ID: ${vendor.id})`);
        updated++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to update vendor "${vendor.name}":`, message);
        failed++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ WhatsApp business number seed completed!");
    console.log(`   Business number: ${SEED_BUSINESS_NUMBER}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Failed: ${failed}`);
    console.log("=".repeat(50));

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

setWhatsAppForAllVendors();
