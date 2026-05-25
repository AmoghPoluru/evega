import type { PayloadRequest } from "payload";
import type { User } from "@/payload-types";

/**
 * Build a minimal Payload `req` so Local API calls run with the logged-in user
 * (collection access rules apply correctly in production).
 */
export function payloadReqFromUser(user: User): Partial<PayloadRequest> {
  return {
    user: {
      ...user,
      collection: "users",
    },
  };
}
