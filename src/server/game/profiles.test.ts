import { describe, expect, it } from "vitest";
import type { RepositoryCharacter } from "@/domain/repository-characters";
import { buildLanguageSummary, getTotalPower } from "./profiles";

const army: RepositoryCharacter[] = [
  {
    id: 1,
    name: "battle-ui",
    language: "TypeScript",
    kind: "Mago",
    power: 120,
    commits: 100,
    forks: 4,
    issues: 3,
    isFork: false,
    color: "#4de3ff",
    url: "#",
  },
  {
    id: 2,
    name: "data-worker",
    language: "Python",
    kind: "Caballero",
    power: 80,
    commits: 40,
    forks: 2,
    issues: 1,
    isFork: false,
    color: "#4b8bbe",
    url: "#",
  },
  {
    id: 3,
    name: "battle-ui-fork",
    language: "TypeScript",
    kind: "Esbirro",
    power: 20,
    commits: 20,
    forks: 1,
    issues: 0,
    isFork: true,
    color: "#9aa8c7",
    url: "#",
  },
];

describe("profile summaries", () => {
  it("sums total power from repository characters", () => {
    expect(getTotalPower(army)).toBe(220);
  });

  it("groups languages by repository count and power", () => {
    expect(buildLanguageSummary(army)).toEqual([
      { name: "TypeScript", count: 2, power: 140 },
      { name: "Python", count: 1, power: 80 },
    ]);
  });
});
