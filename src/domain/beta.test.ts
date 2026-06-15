import { describe, expect, it } from "vitest";
import { redeemInvite } from "./beta";

describe("redeemInvite", () => {
  it("accepts an available beta invite", () => {
    expect(redeemInvite({ code: "A", maxUses: 1, usedBy: [] }, "user-1").ok).toBe(true);
  });

  it("rejects exhausted invites", () => {
    expect(redeemInvite({ code: "A", maxUses: 1, usedBy: ["user-1"] }, "user-2").ok).toBe(false);
  });
});
