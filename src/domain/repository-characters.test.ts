import { describe, expect, it } from "vitest";
import {
  calculateRepositoryPower,
  getRepositoryCharacterKind,
  toRepositoryCharacter,
} from "./repository-characters";
import type { GitHubRepository } from "@/server/github/client";

const baseRepo: GitHubRepository = {
  id: 1,
  name: "battle-ui",
  language: "TypeScript",
  private: false,
  html_url: "https://github.com/example/battle-ui",
  description: null,
  fork: false,
  stargazers_count: 0,
  forks_count: 4,
  open_issues_count: 9,
  updated_at: "2026-06-14T00:00:00Z",
  pushed_at: "2026-06-14T00:00:00Z",
};

describe("repository characters", () => {
  it("turns forks into minions regardless of language", () => {
    expect(getRepositoryCharacterKind("TypeScript", true).kind).toBe("Esbirro");
  });

  it("maps source repositories to a class by language", () => {
    expect(getRepositoryCharacterKind("TypeScript", false).kind).toBe("Mago");
    expect(getRepositoryCharacterKind("Python", false).kind).toBe("Caballero");
  });

  it("calculates more power for more commits, forks and issues", () => {
    const low = calculateRepositoryPower({ commits: 1, forks: 0, issues: 0, isFork: false });
    const high = calculateRepositoryPower({ commits: 100, forks: 10, issues: 10, isFork: false });

    expect(high).toBeGreaterThan(low);
  });

  it("creates a character named after the repository", () => {
    const character = toRepositoryCharacter(baseRepo, 64);

    expect(character.name).toBe("battle-ui");
    expect(character.kind).toBe("Mago");
    expect(character.power).toBeGreaterThan(50);
  });
});
