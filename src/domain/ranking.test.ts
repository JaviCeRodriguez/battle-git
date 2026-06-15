import { describe, expect, it } from "vitest";
import { mockProfiles } from "@/mocks/battle-git";
import { buildWeeklyRanking } from "./ranking";

describe("buildWeeklyRanking", () => {
  it("orders players by rating and power", () => {
    const ranking = buildWeeklyRanking(mockProfiles);

    expect(ranking[0].username).toBe("CodeKnight");
    expect(ranking[0].powerScore).toBeGreaterThan(0);
  });
});
