import { and, desc, eq, gte, inArray, ne } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { simulateBattle } from "@/domain/battle";
import { simulateArmyBattle } from "@/domain/army-battle";
import type { ArmyBattleFighterInput, ArmyBattleTeam } from "@/domain/army-battle";
import type { CharacterVisualPreset, PlayerProfileView, PlayerStats, RepositorySignal } from "@/domain/types";
import {
  snapshotToCharacter,
  upsertCurrentUser,
} from "@/server/army/repository-army";
import { getDb } from "@/server/db";
import {
  ARENA_USERS_CACHE_TAG,
  CACHE_REVALIDATE_SECONDS,
  profileCacheTag,
} from "@/server/cache-tags";
import {
  battleParticipants,
  battleLogs,
  battles,
  playerProfiles,
  repositorySnapshots,
  users,
} from "@/server/db/schema";
import type { RepositoryCharacter } from "@/domain/repository-characters";
import { botToArmyFighters, botToPlayerProfileView, getStarterBots } from "./bots";

type UserRow = typeof users.$inferSelect;
type PlayerProfileRow = typeof playerProfiles.$inferSelect;
type BattleRow = typeof battles.$inferSelect;
type BattleLogRow = typeof battleLogs.$inferSelect;
const BATTLE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export type LanguageSummary = {
  name: string;
  count: number;
  power: number;
};

export type BattleListItem = {
  id: string;
  mode: string;
  result: "won" | "lost";
  opponentName: string;
  opponentUserId: string;
  opponentIsBot?: boolean;
  createdAt: Date;
};

export type PublicProfileView = {
  user: UserRow;
  profile: PlayerProfileRow;
  army: RepositoryCharacter[];
  languages: LanguageSummary[];
  totalPower: number;
  wins: number;
  losses: number;
  latestBattles: BattleListItem[];
};

export type ArenaUserView = PublicProfileView & {
  isCurrentUser: boolean;
};

export type ArenaCombatantView = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  className: string;
  level: number;
  rating: number;
  totalPower: number;
  armyLength: number;
  languages: LanguageSummary[];
  wins: number;
  losses: number;
  isCurrentUser: boolean;
  isBot: boolean;
  href: string;
};

export function buildLanguageSummary(army: RepositoryCharacter[]) {
  const summaries = new Map<string, LanguageSummary>();

  for (const character of army) {
    const language = character.language || "N/A";
    const current = summaries.get(language) ?? { name: language, count: 0, power: 0 };
    current.count += 1;
    current.power += character.power;
    summaries.set(language, current);
  }

  return [...summaries.values()].sort((a, b) => b.power - a.power);
}

export function getTotalPower(army: RepositoryCharacter[]) {
  return army.reduce((total, character) => total + character.power, 0);
}

function getMainLanguage(languages: LanguageSummary[]) {
  return languages[0]?.name ?? "N/A";
}

function getVisualPreset(language: string, totalPower: number) {
  const primaryColorByLanguage: Record<string, string> = {
    TypeScript: "#4de3ff",
    JavaScript: "#f7df1e",
    Python: "#4b8bbe",
    Go: "#00add8",
    Rust: "#ff7043",
    Java: "#f89820",
  };

  return {
    primaryColor: primaryColorByLanguage[language] ?? "#b9f2ff",
    secondaryColor: totalPower > 500 ? "#ffe66d" : "#59f19a",
    placeholderShape: totalPower > 500 ? "prism" : "cube",
    futureAssetKey: `profile-${language.toLowerCase()}`,
  };
}

function buildStatsFromPower(totalPower: number): PlayerStats {
  const hp = Math.max(80, Math.min(180, 80 + Math.round(totalPower * 0.16)));
  const attack = Math.max(25, Math.min(125, 25 + Math.round(totalPower * 0.12)));
  const guard = Math.max(20, Math.min(130, 20 + Math.round(totalPower * 0.1)));
  const speed = Math.max(15, Math.min(105, 15 + Math.round(totalPower * 0.08)));
  const special = Math.max(10, Math.min(95, 10 + Math.round(totalPower * 0.07)));
  const powerScore = Math.round(hp * 0.25 + attack * 0.28 + guard * 0.24 + speed * 0.13 + special * 0.1);

  return {
    hp,
    attack,
    guard,
    speed,
    special,
    powerScore,
    explanations: [
      { stat: "hp", label: "Poder total del army", value: hp, source: "commits" },
      { stat: "attack", label: "Repositorios y commits", value: attack, source: "commits" },
      { stat: "guard", label: "Forks e issues como presion publica", value: guard, source: "reviews" },
      { stat: "speed", label: "Lenguajes activos", value: speed, source: "language" },
      { stat: "special", label: "Poder agregado", value: special, source: "ci" },
    ],
  };
}

function armyToRepositorySignals(army: RepositoryCharacter[]): RepositorySignal[] {
  return army.map((character) => ({
    id: String(character.id),
    name: character.name,
    primaryLanguage: character.language,
    commits30d: character.commits,
    prsMerged30d: Math.max(0, Math.round(character.forks / 2)),
    reviews30d: Math.max(0, Math.round(character.issues / 2)),
    issuesClosed30d: character.issues,
    activeDays30d: Math.min(30, Math.max(1, Math.round(character.commits / 10))),
    streakDays: Math.min(30, Math.max(0, Math.round(character.power / 25))),
    hasCi: !character.isFork,
    includedInStats: true,
  }));
}

function profileToPlayerProfileView(profile: PublicProfileView): PlayerProfileView {
  const mainLanguage = profile.languages[0]?.name ?? "N/A";
  const visualPreset = profile.profile.visualPreset as CharacterVisualPreset;

  return {
    id: profile.user.id,
    username: profile.user.username,
    displayName: profile.user.displayName ?? profile.user.username,
    title: `${profile.profile.className} · ${profile.totalPower} power`,
    level: profile.profile.level,
    rating: profile.profile.rating,
    avatarUrl: profile.user.avatarUrl,
    stats: buildStatsFromPower(profile.totalPower),
    visualPreset: {
      ...visualPreset,
      className: profile.profile.className || `${mainLanguage} main`,
    },
    repositories: armyToRepositorySignals(profile.army),
  };
}

function profileToArmyFighters(profile: PublicProfileView, team: ArmyBattleTeam): ArmyBattleFighterInput[] {
  if (profile.army.length === 0) {
    return [
      {
        id: `${profile.user.id}-fallback`,
        name: profile.user.username,
        kind: "Explorador",
        color: "#b9f2ff",
        power: Math.max(1, profile.totalPower),
        team,
      },
    ];
  }

  return profile.army.map((character) => ({
    id: `${profile.user.id}-${character.id}`,
    name: character.name,
    kind: character.kind,
    color: character.color,
    power: character.power,
    team,
  }));
}

function publicProfileToArenaCombatant(profile: PublicProfileView, currentUserId: string | null): ArenaCombatantView {
  return {
    id: profile.user.id,
    username: profile.user.username,
    displayName: profile.user.displayName ?? profile.user.username,
    avatarUrl: profile.user.avatarUrl,
    className: profile.profile.className,
    level: profile.profile.level,
    rating: profile.profile.rating,
    totalPower: profile.totalPower,
    armyLength: profile.army.length,
    languages: profile.languages,
    wins: profile.wins,
    losses: profile.losses,
    isCurrentUser: profile.user.id === currentUserId,
    isBot: false,
    href: `/game/profile/${profile.user.id}`,
  };
}

async function getArmyForUser(userId: string) {
  const db = getDb();
  const snapshots = await db
    .select()
    .from(repositorySnapshots)
    .where(and(eq(repositorySnapshots.userId, userId), eq(repositorySnapshots.includedInStats, true)))
    .orderBy(desc(repositorySnapshots.capturedAt));

  return snapshots.map(snapshotToCharacter);
}

export async function ensurePlayerProfileForUser(userId: string, army: RepositoryCharacter[]) {
  const db = getDb();
  const languages = buildLanguageSummary(army);
  const totalPower = getTotalPower(army);
  const mainLanguage = getMainLanguage(languages);
  const className = mainLanguage === "N/A" ? "Explorador" : `${mainLanguage} main`;
  const visualPreset = getVisualPreset(mainLanguage, totalPower);

  const [existingProfile] = await db
    .select()
    .from(playerProfiles)
    .where(eq(playerProfiles.userId, userId))
    .limit(1);

  if (existingProfile) {
    const [updatedProfile] = await db
      .update(playerProfiles)
      .set({
        className,
        visualPreset,
        level: Math.max(1, Math.floor(totalPower / 150) + 1),
        rating: 1000 + Math.floor(totalPower / 10),
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.id, existingProfile.id))
      .returning();

    return updatedProfile;
  }

  const [createdProfile] = await db
    .insert(playerProfiles)
    .values({
      userId,
      className,
      visualPreset,
      level: Math.max(1, Math.floor(totalPower / 150) + 1),
      rating: 1000 + Math.floor(totalPower / 10),
    })
    .returning();

  return createdProfile;
}

async function getBattleHistory(profile: PlayerProfileRow) {
  const db = getDb();
  const logRows = await db
    .select()
    .from(battleLogs)
    .where(eq(battleLogs.userId, profile.userId))
    .orderBy(desc(battleLogs.createdAt));

  if (logRows.length > 0) {
    return {
      wins: logRows.filter((log) => log.result === "won").length,
      losses: logRows.filter((log) => log.result === "lost").length,
      latestBattles: logRows.slice(0, 5).map((log) => battleLogToListItem(log)),
    };
  }

  const participantRows = await db
    .select()
    .from(battleParticipants)
    .where(eq(battleParticipants.playerProfileId, profile.id));
  const battleIds = participantRows.map((row) => row.battleId);

  if (battleIds.length === 0) {
    return { wins: 0, losses: 0, latestBattles: [] as BattleListItem[] };
  }

  const battleRows = await db
    .select()
    .from(battles)
    .where(inArray(battles.id, battleIds))
    .orderBy(desc(battles.createdAt));
  const wins = battleRows.filter((battle) => battle.winnerId === profile.id).length;
  const losses = battleRows.filter((battle) => battle.winnerId && battle.winnerId !== profile.id).length;
  const latestBattles = await Promise.all(
    battleRows.slice(0, 5).map(async (battle) => {
      const [opponent] = await db
        .select({
          profileId: playerProfiles.id,
          userId: users.id,
          username: users.username,
          displayName: users.displayName,
        })
        .from(battleParticipants)
        .innerJoin(playerProfiles, eq(battleParticipants.playerProfileId, playerProfiles.id))
        .innerJoin(users, eq(playerProfiles.userId, users.id))
        .where(and(eq(battleParticipants.battleId, battle.id), ne(playerProfiles.id, profile.id)))
        .limit(1);

      return {
        id: battle.id,
        mode: battle.mode,
        result: battle.winnerId === profile.id ? "won" : "lost",
        opponentName: opponent?.displayName ?? opponent?.username ?? "Oponente desconocido",
        opponentUserId: opponent?.userId ?? "",
        createdAt: battle.createdAt,
      } satisfies BattleListItem;
    }),
  );

  return { wins, losses, latestBattles };
}

function battleLogToListItem(log: BattleLogRow): BattleListItem {
  return {
    id: log.id,
    mode: "arena",
    result: log.result === "won" ? "won" : "lost",
    opponentName: log.opponentName,
    opponentUserId: log.opponentId,
    opponentIsBot: log.opponentIsBot,
    createdAt: log.createdAt,
  };
}

async function getDefeatedOpponentIds(userId: string) {
  const db = getDb();
  const since = new Date(Date.now() - BATTLE_COOLDOWN_MS);
  const logs = await db
    .select({ opponentId: battleLogs.opponentId })
    .from(battleLogs)
    .where(and(eq(battleLogs.userId, userId), eq(battleLogs.result, "won"), gte(battleLogs.createdAt, since)));

  return new Set(logs.map((log) => log.opponentId));
}

async function getPublicProfileForUserRow(user: UserRow): Promise<PublicProfileView> {
  const army = await getArmyForUser(user.id);
  const profile = await ensurePlayerProfileForUser(user.id, army);
  const languages = buildLanguageSummary(army);
  const totalPower = getTotalPower(army);
  const history = await getBattleHistory(profile);

  return {
    user,
    profile,
    army,
    languages,
    totalPower,
    ...history,
  };
}

export async function getCurrentDashboard() {
  const { dbUser } = await upsertCurrentUser();
  if (!dbUser) return null;

  return getCachedPublicProfile(dbUser.id);
}

async function getPublicProfileSnapshot(userId: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;

  return getPublicProfileForUserRow(user);
}

async function getCachedPublicProfile(userId: string) {
  return unstable_cache(
    () => getPublicProfileSnapshot(userId),
    ["public-profile", userId],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [profileCacheTag(userId)],
    },
  )();
}

export async function getPublicProfile(userId: string) {
  return getCachedPublicProfile(userId);
}

async function getArenaUsersSnapshot() {
  const db = getDb();
  const registeredUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  const profiles = await Promise.all(registeredUsers.map((user) => getCachedPublicProfile(user.id)));

  return profiles.filter((profile): profile is PublicProfileView => profile !== null);
}

async function getCachedArenaUsersSnapshot() {
  return unstable_cache(
    getArenaUsersSnapshot,
    ["arena-users"],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [ARENA_USERS_CACHE_TAG],
    },
  )();
}

export async function getArenaUsers() {
  const { dbUser } = await upsertCurrentUser();
  const profiles = await getCachedArenaUsersSnapshot();
  const currentProfile = dbUser ? profiles.find((profile) => profile.user.id === dbUser.id) : null;
  const currentPower = currentProfile?.totalPower ?? 0;
  const defeatedOpponentIds = dbUser ? await getDefeatedOpponentIds(dbUser.id) : new Set<string>();
  const bots = getStarterBots(currentPower).map((bot) => ({
    id: bot.id,
    username: bot.username,
    displayName: bot.displayName,
    avatarUrl: null,
    className: bot.className,
    level: bot.level,
    rating: bot.rating,
    totalPower: bot.totalPower,
    armyLength: bot.armyLength,
    languages: bot.languages,
    wins: 0,
    losses: 0,
    isCurrentUser: false,
    isBot: true,
    href: `/game/arena/battle?opponentId=${bot.id}`,
  } satisfies ArenaCombatantView));

  return [
    ...bots,
    ...profiles.map((profile) => publicProfileToArenaCombatant(profile, dbUser?.id ?? null)),
  ]
    .filter((combatant) => !defeatedOpponentIds.has(combatant.id))
    .sort((a, b) => a.totalPower - b.totalPower);
}

export async function getArenaBattle(opponentId: string | null) {
  const currentProfile = await getCurrentDashboard();
  if (!currentProfile) return null;
  const defeatedOpponentIds = await getDefeatedOpponentIds(currentProfile.user.id);
  if (opponentId && defeatedOpponentIds.has(opponentId)) return null;

  const player = profileToPlayerProfileView(currentProfile);
  const bot = getStarterBots(currentProfile.totalPower).find((item) => item.id === opponentId);
  const opponent = bot
    ? botToPlayerProfileView(bot)
    : opponentId
      ? await getPublicProfile(opponentId).then((profile) => (profile ? profileToPlayerProfileView(profile) : null))
      : null;
  const opponentProfile = !bot && opponentId ? await getPublicProfile(opponentId) : null;

  if (!opponent || opponent.id === player.id) return null;

  const armyFighters = [
    ...profileToArmyFighters(currentProfile, "left"),
    ...(bot ? botToArmyFighters(bot, "right") : opponentProfile ? profileToArmyFighters(opponentProfile, "right") : []),
  ];
  const seed = Math.max(1, [...`${player.id}-${opponent.id}`].reduce((total, char) => total + char.charCodeAt(0), 0));
  const armyBattle = simulateArmyBattle(armyFighters, { seed });

  return {
    player,
    opponent,
    battle: simulateBattle(player, opponent, {
      seed,
      mode: "arena",
    }),
    armyBattle,
    opponentId: opponent.id,
    opponentName: opponent.displayName,
    opponentIsBot: Boolean(bot),
    result: armyBattle.winnerTeam === "left" ? "won" as const : "lost" as const,
  };
}

export async function recordArenaBattle(opponentId: string) {
  "use server";

  const battle = await getArenaBattle(opponentId);
  const { dbUser } = await upsertCurrentUser();
  if (!battle || !dbUser) return;

  const db = getDb();
  const existingCutoff = new Date(Date.now() - 10 * 60 * 1000);
  const [existing] = await db
    .select({ id: battleLogs.id })
    .from(battleLogs)
    .where(and(
      eq(battleLogs.userId, dbUser.id),
      eq(battleLogs.opponentId, opponentId),
      gte(battleLogs.createdAt, existingCutoff),
    ))
    .limit(1);

  if (existing) return;

  await db.insert(battleLogs).values({
    userId: dbUser.id,
    opponentId,
    opponentName: battle.opponentName,
    opponentIsBot: battle.opponentIsBot,
    result: battle.result,
    playerPower: battle.armyBattle.fighters
      .filter((fighter) => fighter.team === "left")
      .reduce((total, fighter) => total + fighter.power, 0),
    opponentPower: battle.armyBattle.fighters
      .filter((fighter) => fighter.team === "right")
      .reduce((total, fighter) => total + fighter.power, 0),
    battleData: battle.armyBattle,
  });

  revalidateTag(profileCacheTag(dbUser.id), "max");
  revalidateTag(ARENA_USERS_CACHE_TAG, "max");
  revalidatePath("/game/dashboard");
  revalidatePath("/game/arena");
  revalidatePath(`/game/profile/${dbUser.id}`);
}

async function createBattleBetweenProfiles(currentProfile: PlayerProfileRow, targetProfile: PlayerProfileRow) {
  const db = getDb();
  const currentArmy = await getArmyForUser(currentProfile.userId);
  const targetArmy = await getArmyForUser(targetProfile.userId);
  const currentPower = getTotalPower(currentArmy);
  const targetPower = getTotalPower(targetArmy);
  const winnerId = currentPower >= targetPower ? currentProfile.id : targetProfile.id;
  const [battle] = await db.insert(battles).values({ mode: "arena", winnerId }).returning();

  await db.insert(battleParticipants).values([
    { battleId: battle.id, playerProfileId: currentProfile.id, team: "challenger" },
    { battleId: battle.id, playerProfileId: targetProfile.id, team: "defender" },
  ]);

  return battle as BattleRow;
}

export async function startBattleAgainstUser(targetUserId: string) {
  "use server";

  const { dbUser } = await upsertCurrentUser();
  if (!dbUser || dbUser.id === targetUserId) return;

  const currentArmy = await getArmyForUser(dbUser.id);
  const currentProfile = await ensurePlayerProfileForUser(dbUser.id, currentArmy);
  const targetProfileView = await getPublicProfile(targetUserId);
  if (!targetProfileView) return;

  await createBattleBetweenProfiles(currentProfile, targetProfileView.profile);

  revalidateTag(profileCacheTag(dbUser.id), "max");
  revalidateTag(profileCacheTag(targetUserId), "max");
  revalidateTag(ARENA_USERS_CACHE_TAG, "max");
  revalidatePath("/game/dashboard");
  revalidatePath("/game/arena");
  revalidatePath(`/game/profile/${dbUser.id}`);
  revalidatePath(`/game/profile/${targetUserId}`);
}
