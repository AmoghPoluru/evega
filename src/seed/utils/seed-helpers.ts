import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Get Payload instance for use in seed files
 */
export const getPayloadInstance = async () => {
  return await getPayload({ config });
};

/**
 * Check if entity exists by slug
 */
export const entityExistsBySlug = async (
  payload: any,
  collection: string,
  slug: string
): Promise<boolean> => {
  try {
    const result = await payload.find({
      collection,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    });
    return result.docs.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Check if entity exists by name
 */
export const entityExistsByName = async (
  payload: any,
  collection: string,
  name: string
): Promise<boolean> => {
  try {
    const result = await payload.find({
      collection,
      where: {
        name: {
          equals: name,
        },
      },
      limit: 1,
    });
    return result.docs.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Check if entity exists by value and variantType (for variant options)
 */
export const variantOptionExists = async (
  payload: any,
  value: string,
  variantTypeId: string
): Promise<boolean> => {
  try {
    const result = await payload.find({
      collection: "variant-options",
      where: {
        and: [
          {
            value: {
              equals: value,
            },
          },
          {
            variantType: {
              equals: variantTypeId,
            },
          },
        ],
      },
      limit: 1,
    });
    return result.docs.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Logging helpers
 */
export const logSuccess = (message: string) => {
  console.log(`✅ ${message}`);
};

export const logError = (message: string, error?: any) => {
  console.error(`❌ ${message}`, error ? error : "");
};

export const logSkip = (message: string) => {
  console.log(`⏭️  ${message}`);
};

export const logProgress = (current: number, total: number, message: string) => {
  console.log(`[${current}/${total}] ${message}`);
};

export const logSection = (title: string) => {
  console.log("\n" + "=".repeat(50));
  console.log(title);
  console.log("=".repeat(50));
};

/**
 * Progress tracker
 */
export class ProgressTracker {
  private current: number = 0;
  private total: number;
  private label: string;

  constructor(total: number, label: string) {
    this.total = total;
    this.label = label;
  }

  increment(message?: string) {
    this.current++;
    if (message) {
      logProgress(this.current, this.total, `${this.label}: ${message}`);
    }
  }

  getCurrent(): number {
    return this.current;
  }

  getTotal(): number {
    return this.total;
  }

  getSummary(): string {
    return `${this.current}/${this.total} ${this.label}`;
  }
}

/**
 * Error handler wrapper
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    logError(errorMessage, error);
    return null;
  }
};
