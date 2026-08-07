import "dotenv/config";

import type { Db } from "mongodb";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Removes legacy MongoDB data for retired features:
 * - Categories / subcategories
 * - Vendor support tasks & task messages (BDO chat)
 * - Product category / subcategory fields
 * - Variant option category scoping
 * - BDO user role (downgraded to "user")
 *
 * Run preview:  npm run db:cleanup:legacy -- --dry-run
 * Run cleanup:  npm run db:cleanup:legacy -- --confirm
 */

const REMOVED_COLLECTIONS = [
  "vendor-task-messages",
  "vendor-tasks",
  "categories",
] as const;

const PRODUCT_INDEXES_TO_DROP = ["category_filter_index"] as const;

const skipConfirmation = process.argv.includes("--confirm");
const dryRun = process.argv.includes("--dry-run");

async function getMongoDb(): Promise<Db> {
  const payload = await getPayload({ config });
  const mongoose = payload.db as {
    connection?: {
      readyState: number;
      db?: Db;
      once: (event: string, cb: () => void) => void;
    };
  };

  if (!mongoose?.connection) {
    throw new Error("MongoDB connection not available. Check DATABASE_URL.");
  }

  if (mongoose.connection.readyState !== 1) {
    await new Promise<void>((resolve) => {
      if (mongoose.connection?.readyState === 1) {
        resolve();
        return;
      }
      mongoose.connection?.once("connected", resolve);
    });
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB database handle not available.");
  }

  return db;
}

async function countCollection(db: Db, name: string): Promise<number> {
  try {
    return await db.collection(name).countDocuments();
  } catch {
    return 0;
  }
}

async function deleteCollection(db: Db, name: string): Promise<number> {
  const count = await countCollection(db, name);
  if (count === 0) {
    console.log(`   ⏭️  ${name}: empty (skipped)`);
    return 0;
  }

  if (dryRun) {
    console.log(`   🔍 ${name}: would delete ${count} document(s)`);
    return count;
  }

  const result = await db.collection(name).deleteMany({});
  console.log(`   ✅ ${name}: deleted ${result.deletedCount} document(s)`);
  return result.deletedCount;
}

async function unsetProductCategoryFields(db: Db): Promise<number> {
  const filter = {
    $or: [{ category: { $exists: true } }, { subcategory: { $exists: true } }],
  };
  const count = await db.collection("products").countDocuments(filter);

  if (count === 0) {
    console.log("   ⏭️  products: no category/subcategory fields to remove");
    return 0;
  }

  if (dryRun) {
    console.log(`   🔍 products: would unset category/subcategory on ${count} document(s)`);
    return count;
  }

  const result = await db.collection("products").updateMany(filter, {
    $unset: { category: "", subcategory: "" },
  });
  console.log(`   ✅ products: unset category/subcategory on ${result.modifiedCount} document(s)`);
  return result.modifiedCount;
}

async function unsetVariantOptionCategoryFields(db: Db): Promise<number> {
  const filter = { category: { $exists: true } };
  const count = await db.collection("variant-options").countDocuments(filter);

  if (count === 0) {
    console.log("   ⏭️  variant-options: no category field to remove");
    return 0;
  }

  if (dryRun) {
    console.log(`   🔍 variant-options: would unset category on ${count} document(s)`);
    return count;
  }

  const result = await db.collection("variant-options").updateMany(filter, {
    $unset: { category: "" },
  });
  console.log(`   ✅ variant-options: unset category on ${result.modifiedCount} document(s)`);
  return result.modifiedCount;
}

async function migrateBdoUsers(db: Db): Promise<number> {
  const filter = { role: "bdo" };
  const count = await db.collection("users").countDocuments(filter);

  if (count === 0) {
    console.log("   ⏭️  users: no BDO accounts to migrate");
    return 0;
  }

  if (dryRun) {
    console.log(`   🔍 users: would change role bdo → user for ${count} account(s)`);
    return count;
  }

  const result = await db.collection("users").updateMany(filter, {
    $set: { role: "user" },
  });
  console.log(`   ✅ users: changed role bdo → user for ${result.modifiedCount} account(s)`);
  return result.modifiedCount;
}

async function dropLegacyProductIndexes(db: Db): Promise<number> {
  const collection = db.collection("products");
  const existing = await collection.indexes();
  const existingNames = new Set(existing.map((idx) => idx.name));

  let dropped = 0;
  for (const indexName of PRODUCT_INDEXES_TO_DROP) {
    if (!existingNames.has(indexName)) {
      console.log(`   ⏭️  index ${indexName}: not present`);
      continue;
    }

    if (dryRun) {
      console.log(`   🔍 index ${indexName}: would drop`);
      dropped++;
      continue;
    }

    await collection.dropIndex(indexName);
    console.log(`   ✅ index ${indexName}: dropped`);
    dropped++;
  }

  return dropped;
}

async function main(): Promise<void> {
  console.log("\n" + "=".repeat(56));
  console.log("Legacy feature MongoDB cleanup");
  console.log("=".repeat(56));

  console.log("\nThis removes retired data:");
  console.log("  • vendor-task-messages, vendor-tasks, categories collections");
  console.log("  • products.category / products.subcategory fields");
  console.log("  • variant-options.category fields");
  console.log("  • users with role \"bdo\" → role \"user\"");
  console.log("  • category_filter_index on products (if present)");

  if (dryRun) {
    console.log("\n🔍 DRY RUN — no changes will be made.\n");
  } else if (!skipConfirmation) {
    console.log("\n⚠️  Destructive operation. Re-run with --confirm to apply.");
    console.log("   Preview first: npm run db:cleanup:legacy -- --dry-run\n");
    process.exit(1);
  } else {
    console.log("\n⚠️  Applying changes...\n");
  }

  const db = await getMongoDb();

  console.log("📦 Step 1/5: Delete removed collections");
  let deletedDocs = 0;
  for (const collection of REMOVED_COLLECTIONS) {
    deletedDocs += await deleteCollection(db, collection);
  }

  console.log("\n📦 Step 2/5: Strip category fields from products");
  const productsUpdated = await unsetProductCategoryFields(db);

  console.log("\n📦 Step 3/5: Strip category fields from variant options");
  const variantOptionsUpdated = await unsetVariantOptionCategoryFields(db);

  console.log("\n📦 Step 4/5: Migrate BDO user roles");
  const usersMigrated = await migrateBdoUsers(db);

  console.log("\n📦 Step 5/5: Drop legacy product indexes");
  const indexesDropped = await dropLegacyProductIndexes(db);

  console.log("\n" + "=".repeat(56));
  console.log(dryRun ? "Dry run complete" : "Cleanup complete");
  console.log("=".repeat(56));
  console.log(`   Collections cleared:     ${deletedDocs} document(s)`);
  console.log(`   Products updated:        ${productsUpdated}`);
  console.log(`   Variant options updated: ${variantOptionsUpdated}`);
  console.log(`   BDO users migrated:      ${usersMigrated}`);
  console.log(`   Indexes dropped:         ${indexesDropped}`);

  if (dryRun) {
    console.log("\nRun for real: npm run db:cleanup:legacy -- --confirm\n");
  } else {
    console.log("\nDone. Restart the app if it is running.\n");
  }

  process.exit(0);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("\n❌ Cleanup failed:", message);
  process.exit(1);
});
