import { describe, it, expect, vi, beforeEach } from "vitest";
import { linkGuestOrdersToUser } from "../../../src/modules/orders/server/link-guest-orders";
import type { Payload } from "payload";

describe("linkGuestOrdersToUser", () => {
  const mockFind = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links guest orders whose guestEmail matches (case-insensitive)", async () => {
    mockFind.mockResolvedValue({
      docs: [
        { id: "ord-1", guestEmail: "Guest@Example.com" },
        { id: "ord-2", guestEmail: "other@example.com" },
      ],
    });
    mockUpdate.mockResolvedValue({});

    const db = {
      find: mockFind,
      update: mockUpdate,
    } as unknown as Payload;

    const linked = await linkGuestOrdersToUser(db, "user-1", "guest@example.com");

    expect(linked).toBe(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "orders",
        id: "ord-1",
        data: { user: "user-1" },
        overrideAccess: true,
      })
    );
  });

  it("returns 0 when email is empty", async () => {
    const db = {
      find: mockFind,
      update: mockUpdate,
    } as unknown as Payload;

    const linked = await linkGuestOrdersToUser(db, "user-1", "  ");
    expect(linked).toBe(0);
    expect(mockFind).not.toHaveBeenCalled();
  });
});
