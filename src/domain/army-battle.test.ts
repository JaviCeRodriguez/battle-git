import { describe, expect, it } from "vitest";
import { simulateArmyBattle } from "./army-battle";
import type { ArmyBattleFighterInput } from "./army-battle";

const fighters: ArmyBattleFighterInput[] = [
  { id: "left-mage", name: "api-core", kind: "Mago", color: "#4de3ff", power: 120, team: "left" },
  { id: "left-archer", name: "web-ui", kind: "Arquero", color: "#ffe66d", power: 80, team: "left" },
  { id: "right-minion", name: "legacy-fork", kind: "Esbirro", color: "#9aa8c7", power: 35, team: "right" },
  { id: "right-knight", name: "worker", kind: "Caballero", color: "#4b8bbe", power: 90, team: "right" },
];

describe("army battle simulation", () => {
  it("generates deterministic random target turns with visual cues", () => {
    const first = simulateArmyBattle(fighters, { seed: 77 });
    const second = simulateArmyBattle(fighters, { seed: 77 });

    expect(first.turns).toEqual(second.turns);
    expect(first.turns[0].actionCue).toBe("spell");
    expect(first.turns.some((turn) => turn.actionCue === "arrow")).toBe(true);
  });

  it("tracks hp and defeated fighters", () => {
    const battle = simulateArmyBattle(fighters, { seed: 4 });

    expect(battle.turns.some((turn) => turn.targetHp < 1 || turn.targetDefeated)).toBe(true);
    expect(battle.winnerTeam === "left" || battle.winnerTeam === "right" || battle.winnerTeam === null).toBe(true);
  });
});
