import "dotenv/config";
import {
  getPayloadInstance,
  logSuccess,
  logError,
  logSection,
} from "../seed/utils/seed-helpers";

const clearTags = async () => {
  try {
    logSection("🧹 Clearing All Tags");
    const payload = await getPayloadInstance();

    // Get all tags
    const result = await payload.find({
      collection: "tags",
      limit: 10000,
      pagination: false,
    });

    const tags = result.docs;
    const count = tags.length;

    if (count === 0) {
      logSuccess("No tags to delete");
      return;
    }

    console.log(`Found ${count} tag(s) to delete...\n`);

    // Delete all tags
    let deletedCount = 0;
    for (const tag of tags) {
      try {
        await payload.delete({
          collection: "tags",
          id: tag.id,
        });
        deletedCount++;
        if (deletedCount % 10 === 0) {
          process.stdout.write(`Deleted ${deletedCount}/${count} tags...\r`);
        }
      } catch (error) {
        logError(`Failed to delete tag: ${tag.name || tag.id}`, error);
      }
    }

    console.log(); // New line after progress
    logSection("✅ Tags Cleared");
    console.log(`📊 Summary:`);
    console.log(`   - Deleted: ${deletedCount} tags`);
    console.log(`   - Total: ${count} tags`);
  } catch (error) {
    logError("Tags cleanup failed", error);
    process.exit(1);
  }
};

clearTags();
