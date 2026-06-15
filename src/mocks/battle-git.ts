import { simulateBattle } from "@/domain/battle";
import { getCharacterVisualPreset } from "@/domain/character";
import { buildWeeklyRanking } from "@/domain/ranking";
import { calculatePlayerStats } from "@/domain/stats";
import type { MockPlayer, PlayerProfileView } from "@/domain/types";

export const mockPlayers: MockPlayer[] = [
  {
    id: "dev-pixel",
    username: "Dev_Pixel",
    displayName: "Dev Pixel",
    title: "Merge Conflict Caster",
    level: 12,
    rating: 1240,
    repositories: [
      {
        id: "repo-battle-ui",
        name: "battle-ui",
        primaryLanguage: "TypeScript",
        commits30d: 48,
        prsMerged30d: 9,
        reviews30d: 6,
        issuesClosed30d: 11,
        activeDays30d: 18,
        streakDays: 7,
        hasCi: true,
        includedInStats: true,
      },
      {
        id: "repo-pixel-tools",
        name: "pixel-tools",
        primaryLanguage: "JavaScript",
        commits30d: 28,
        prsMerged30d: 4,
        reviews30d: 2,
        issuesClosed30d: 5,
        activeDays30d: 10,
        streakDays: 4,
        hasCi: false,
        includedInStats: true,
      },
    ],
  },
  {
    id: "code-knight",
    username: "CodeKnight",
    displayName: "Code Knight",
    title: "Guardian of Green Builds",
    level: 14,
    rating: 1295,
    repositories: [
      {
        id: "repo-ci-fortress",
        name: "ci-fortress",
        primaryLanguage: "Python",
        commits30d: 34,
        prsMerged30d: 12,
        reviews30d: 16,
        issuesClosed30d: 8,
        activeDays30d: 15,
        streakDays: 5,
        hasCi: true,
        includedInStats: true,
      },
      {
        id: "repo-concurrent-guard",
        name: "concurrent-guard",
        primaryLanguage: "Go",
        commits30d: 22,
        prsMerged30d: 7,
        reviews30d: 11,
        issuesClosed30d: 4,
        activeDays30d: 9,
        streakDays: 3,
        hasCi: true,
        includedInStats: true,
      },
    ],
  },
];

export const betaInvites = [
  { code: "BATTLE-GIT-FOUNDERS", maxUses: 25, usedBy: [] },
  { code: "DEV-PIXEL-ACCESS", maxUses: 5, usedBy: ["dev-pixel"] },
];

export function toPlayerProfileView(player: MockPlayer): PlayerProfileView {
  const stats = calculatePlayerStats(player.repositories);
  const visualPreset = getCharacterVisualPreset(player.repositories);

  return {
    id: player.id,
    username: player.username,
    displayName: player.displayName,
    title: player.title,
    level: player.level,
    rating: player.rating,
    stats,
    visualPreset,
    repositories: player.repositories,
  };
}

export const mockProfiles = mockPlayers.map(toPlayerProfileView);
export const mockBattle = simulateBattle(mockProfiles[0], mockProfiles[1], {
  seed: 847,
  mode: "training",
});
export const mockRanking = buildWeeklyRanking(mockProfiles);

export function getMockProfile(id = "dev-pixel") {
  return mockProfiles.find((profile) => profile.id === id) ?? mockProfiles[0];
}
