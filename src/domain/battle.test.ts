import { describe, expect, it } from "vitest";
import { simulateBattle } from "./battle";
import { mockProfiles } from "@/mocks/battle-git";

describe("simulateBattle", () => {
  it("creates a deterministic timeline", () => {
    const first = simulateBattle(mockProfiles[0], mockProfiles[1], { seed: 123 });
    const second = simulateBattle(mockProfiles[0], mockProfiles[1], { seed: 123 });

    expect(first.turns).toEqual(second.turns);
    expect(first.participants).toHaveLength(2);
    expect(first.turns[0]).toMatchObject({
      actorId: "dev-pixel",
      targetId: "code-knight",
    });
  });

  it("returns rewards and a winner", () => {
    const battle = simulateBattle(mockProfiles[0], mockProfiles[1], { seed: 847 });

    expect(battle.winnerId).toBeTruthy();
    expect(battle.rewards.length).toBeGreaterThan(0);
  });
});
