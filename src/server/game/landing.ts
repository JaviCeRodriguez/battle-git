import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { RepositoryCharacter } from "@/domain/repository-characters";
import { snapshotToCharacter } from "@/server/army/repository-army";
import {
  LANDING_ARMY_REVALIDATE_SECONDS,
  LANDING_TOP_ARMY_CACHE_TAG,
} from "@/server/cache-tags";
import { getDb } from "@/server/db";
import { repositorySnapshots, users } from "@/server/db/schema";

export type LandingArmyShowcase = {
  leaderName: string;
  leaderUsername: string;
  totalPower: number;
  repositoryCount: number;
  mainLanguage: string;
  characters: RepositoryCharacter[];
  hasRealLeader: boolean;
};

const fallbackCharacters: RepositoryCharacter[] = [
  {
    id: 9001,
    name: "core-engine",
    language: "TypeScript",
    kind: "Mago",
    power: 118,
    commits: 145,
    forks: 4,
    issues: 8,
    isFork: false,
    color: "#4de3ff",
    url: "#",
  },
  {
    id: 9002,
    name: "battle-api",
    language: "Go",
    kind: "Guardian",
    power: 96,
    commits: 92,
    forks: 2,
    issues: 5,
    isFork: false,
    color: "#00add8",
    url: "#",
  },
  {
    id: 9003,
    name: "pixel-ui",
    language: "CSS",
    kind: "Arquero",
    power: 82,
    commits: 64,
    forks: 3,
    issues: 3,
    isFork: false,
    color: "#7d7cff",
    url: "#",
  },
  {
    id: 9004,
    name: "legacy-helper",
    language: "Python",
    kind: "Esbirro",
    power: 34,
    commits: 47,
    forks: 1,
    issues: 2,
    isFork: true,
    color: "#9aa8c7",
    url: "#",
  },
];

function getFallbackShowcase(): LandingArmyShowcase {
  const totalPower = fallbackCharacters.reduce((sum, character) => sum + character.power, 0);

  return {
    leaderName: "Army destacado",
    leaderUsername: "battle-git",
    totalPower,
    repositoryCount: fallbackCharacters.length,
    mainLanguage: "TypeScript",
    characters: fallbackCharacters,
    hasRealLeader: false,
  };
}

function getMainLanguage(characters: RepositoryCharacter[]) {
  const languageCounts = new Map<string, number>();

  for (const character of characters) {
    if (character.language === "N/A") continue;
    languageCounts.set(character.language, (languageCounts.get(character.language) ?? 0) + 1);
  }

  return (
    [...languageCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "N/A"
  );
}

async function getLandingArmyShowcaseUncached(): Promise<LandingArmyShowcase> {
  let userRows: (typeof users.$inferSelect)[];
  let snapshotRows: (typeof repositorySnapshots.$inferSelect)[];

  try {
    const db = getDb();
    [userRows, snapshotRows] = await Promise.all([
      db.select().from(users),
      db
        .select()
        .from(repositorySnapshots)
        .where(eq(repositorySnapshots.includedInStats, true)),
    ]);
  } catch {
    return getFallbackShowcase();
  }

  if (userRows.length === 0 || snapshotRows.length === 0) {
    return getFallbackShowcase();
  }

  const snapshotsByUser = new Map<string, typeof snapshotRows>();

  for (const snapshot of snapshotRows) {
    const snapshots = snapshotsByUser.get(snapshot.userId) ?? [];
    snapshots.push(snapshot);
    snapshotsByUser.set(snapshot.userId, snapshots);
  }

  let topShowcase: LandingArmyShowcase | null = null;

  for (const user of userRows) {
    const characters = (snapshotsByUser.get(user.id) ?? []).map(snapshotToCharacter);
    if (characters.length === 0) continue;

    const totalPower = characters.reduce((sum, character) => sum + character.power, 0);
    if (topShowcase && totalPower <= topShowcase.totalPower) continue;

    topShowcase = {
      leaderName: user.displayName ?? user.username,
      leaderUsername: user.username,
      totalPower,
      repositoryCount: characters.length,
      mainLanguage: getMainLanguage(characters),
      characters: characters
        .sort((left, right) => right.power - left.power)
        .slice(0, 18),
      hasRealLeader: true,
    };
  }

  return topShowcase ?? getFallbackShowcase();
}

export async function getLandingArmyShowcase() {
  return unstable_cache(
    getLandingArmyShowcaseUncached,
    ["landing-top-army"],
    {
      revalidate: LANDING_ARMY_REVALIDATE_SECONDS,
      tags: [LANDING_TOP_ARMY_CACHE_TAG],
    },
  )();
}
