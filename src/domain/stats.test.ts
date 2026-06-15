import { describe, expect, it } from "vitest";
import { mockPlayers } from "@/mocks/battle-git";
import { getCharacterVisualPreset } from "./character";
import { calculatePlayerStats } from "./stats";

describe("calculatePlayerStats", () => {
  it("calculates balanced stats for Dev_Pixel", () => {
    const stats = calculatePlayerStats(mockPlayers[0].repositories);

    expect(stats.hp).toBeGreaterThan(100);
    expect(stats.attack).toBeGreaterThan(70);
    expect(stats.guard).toBeGreaterThan(50);
    expect(stats.explanations).toHaveLength(5);
  });

  it("rewards CodeKnight guard because of reviews and CI", () => {
    const stats = calculatePlayerStats(mockPlayers[1].repositories);

    expect(stats.guard).toBeGreaterThan(stats.speed);
    expect(stats.guard).toBeGreaterThan(80);
  });

  it("assigns a visual preset from primary language", () => {
    const preset = getCharacterVisualPreset(mockPlayers[0].repositories);

    expect(preset.className).toBe("Event Sorcerer");
    expect(preset.placeholderShape).toBe("orb");
  });
});
