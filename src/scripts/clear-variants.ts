import "dotenv/config";
import {
  getPayloadInstance,
  logSuccess,
  logError,
  logSection,
} from "../seed/utils/seed-helpers";

const clearVariants = async () => {
  try {
    logSection("🧹 Clearing All Variants");
    const payload = await getPayloadInstance();

    // Clear Variant Options first (they depend on Variant Types)
    logSection("Clearing Variant Options");
    const optionsResult = await payload.find({
      collection: "variant-options",
      limit: 10000,
      pagination: false,
    });

    const options = optionsResult.docs;
    const optionsCount = options.length;

    if (optionsCount === 0) {
      logSuccess("No variant options to delete");
    } else {
      console.log(`Found ${optionsCount} variant option(s) to delete...\n`);

      let deletedOptionsCount = 0;
      for (const option of options) {
        try {
          await payload.delete({
            collection: "variant-options",
            id: option.id,
          });
          deletedOptionsCount++;
          if (deletedOptionsCount % 10 === 0) {
            process.stdout.write(`Deleted ${deletedOptionsCount}/${optionsCount} variant options...\r`);
          }
        } catch (error) {
          logError(`Failed to delete variant option: ${option.name || option.id}`, error);
        }
      }

      console.log(); // New line after progress
      logSuccess(`Deleted ${deletedOptionsCount} variant options`);
    }

    // Clear Variant Types
    logSection("Clearing Variant Types");
    const typesResult = await payload.find({
      collection: "variant-types",
      limit: 10000,
      pagination: false,
    });

    const types = typesResult.docs;
    const typesCount = types.length;

    if (typesCount === 0) {
      logSuccess("No variant types to delete");
    } else {
      console.log(`Found ${typesCount} variant type(s) to delete...\n`);

      let deletedTypesCount = 0;
      for (const type of types) {
        try {
          await payload.delete({
            collection: "variant-types",
            id: type.id,
          });
          deletedTypesCount++;
          if (deletedTypesCount % 10 === 0) {
            process.stdout.write(`Deleted ${deletedTypesCount}/${typesCount} variant types...\r`);
          }
        } catch (error) {
          logError(`Failed to delete variant type: ${type.name || type.id}`, error);
        }
      }

      console.log(); // New line after progress
      logSuccess(`Deleted ${deletedTypesCount} variant types`);
    }

    logSection("✅ Variants Cleared");
    console.log(`📊 Summary:`);
    console.log(`   - Deleted: ${optionsCount} variant options`);
    console.log(`   - Deleted: ${typesCount} variant types`);
  } catch (error) {
    logError("Variants cleanup failed", error);
    process.exit(1);
  }
};

clearVariants();
