import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { toRepositoryCharacterFromSource } from "@/domain/repository-characters";
import type { RepositoryCharacter } from "@/domain/repository-characters";
import {
  ARENA_USERS_CACHE_TAG,
  CACHE_REVALIDATE_SECONDS,
  LANDING_TOP_ARMY_CACHE_TAG,
  armyCacheTag,
  profileCacheTag,
} from "@/server/cache-tags";
import { getDb } from "@/server/db";
import { githubAccounts, repositorySnapshots, syncRuns, users } from "@/server/db/schema";
import {
  getGitHubExternalAccount,
  getGitHubOauthAccessToken,
  getGitHubUsername,
} from "@/server/github/clerk";
import { fetchPublicRepositories, fetchRepositoryCommitCounts } from "@/server/github/client";

const DAILY_SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type RepositorySnapshotMetrics = {
  description: string | null;
  fork: boolean;
  htmlUrl: string;
  commits: number;
  forks: number;
  issues: number;
  stars: number;
  updatedAt: string;
  pushedAt: string | null;
};

type RepositorySnapshotRow = typeof repositorySnapshots.$inferSelect;
type UserRow = typeof users.$inferSelect;

export type RepositoryArmyData = {
  user: UserRow | null;
  githubUsername: string | null;
  characters: RepositoryCharacter[];
  lastSyncAt: Date | null;
  nextSyncAt: Date | null;
  canSync: boolean;
  syncStatus: string | null;
  syncError: string | null;
};

type RepositoryArmySnapshot = Omit<RepositoryArmyData, "user" | "githubUsername">;

function isRepositorySnapshotMetrics(value: unknown): value is RepositorySnapshotMetrics {
  if (!value || typeof value !== "object") return false;
  const metrics = value as Partial<RepositorySnapshotMetrics>;

  return (
    typeof metrics.fork === "boolean" &&
    typeof metrics.htmlUrl === "string" &&
    typeof metrics.commits === "number" &&
    typeof metrics.forks === "number" &&
    typeof metrics.issues === "number" &&
    typeof metrics.stars === "number" &&
    typeof metrics.updatedAt === "string"
  );
}

function getNextSyncAt(lastSyncAt: Date | null) {
  if (!lastSyncAt) return null;
  return new Date(lastSyncAt.getTime() + DAILY_SYNC_INTERVAL_MS);
}

function canRunDailySync(lastSyncAt: Date | null) {
  if (!lastSyncAt) return true;
  return Date.now() - lastSyncAt.getTime() >= DAILY_SYNC_INTERVAL_MS;
}

export function snapshotToCharacter(snapshot: RepositorySnapshotRow) {
  const metrics = isRepositorySnapshotMetrics(snapshot.metrics)
    ? snapshot.metrics
    : {
        description: null,
        fork: false,
        htmlUrl: "#",
        commits: 0,
        forks: 0,
        issues: 0,
        stars: 0,
        updatedAt: snapshot.capturedAt.toISOString(),
        pushedAt: null,
      };

  return toRepositoryCharacterFromSource(
    {
      id: Number(snapshot.githubRepoId),
      name: snapshot.name,
      language: snapshot.primaryLanguage === "N/A" ? null : snapshot.primaryLanguage,
      fork: metrics.fork,
      forksCount: metrics.forks,
      openIssuesCount: metrics.issues,
      url: metrics.htmlUrl,
    },
    metrics.commits,
  );
}

export async function upsertCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return { clerkUser: null, dbUser: null, githubUsername: null };

  const db = getDb();
  const github = getGitHubExternalAccount(clerkUser);
  const githubUsername = getGitHubUsername(clerkUser);
  const username =
    githubUsername ??
    clerkUser.username ??
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.id;

  const [dbUser] = await db
    .insert(users)
    .values({
      clerkUserId: clerkUser.id,
      githubId: github?.providerUserId ?? null,
      username,
      displayName: clerkUser.fullName,
      avatarUrl: clerkUser.imageUrl,
    })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        githubId: github?.providerUserId ?? null,
        username,
        displayName: clerkUser.fullName,
        avatarUrl: clerkUser.imageUrl,
      },
    })
    .returning();

  if (github) {
    const [existingGithubAccount] = await db
      .select({ id: githubAccounts.id })
      .from(githubAccounts)
      .where(eq(githubAccounts.userId, dbUser.id))
      .limit(1);

    if (existingGithubAccount) {
      await db
        .update(githubAccounts)
        .set({
          scopes: github.approvedScopes || "public_repo",
        })
        .where(eq(githubAccounts.id, existingGithubAccount.id));
    } else {
      await db.insert(githubAccounts).values({
        userId: dbUser.id,
        scopes: github.approvedScopes || "public_repo",
      });
    }
  }

  return { clerkUser, dbUser, githubUsername };
}

async function getLatestSync(userId: string) {
  const db = getDb();
  const [latestSync] = await db
    .select()
    .from(syncRuns)
    .where(eq(syncRuns.userId, userId))
    .orderBy(desc(syncRuns.startedAt))
    .limit(1);

  return latestSync ?? null;
}

async function getRepositoryArmySnapshot(userId: string): Promise<RepositoryArmySnapshot> {
  const db = getDb();
  const snapshots = await db
    .select()
    .from(repositorySnapshots)
    .where(eq(repositorySnapshots.userId, userId))
    .orderBy(desc(repositorySnapshots.capturedAt));
  const latestSync = await getLatestSync(userId);
  const lastCompletedSyncAt = latestSync?.status === "completed" ? latestSync.finishedAt : null;

  return {
    characters: snapshots.map(snapshotToCharacter),
    lastSyncAt: lastCompletedSyncAt,
    nextSyncAt: getNextSyncAt(lastCompletedSyncAt),
    canSync: canRunDailySync(lastCompletedSyncAt),
    syncStatus: latestSync?.status ?? null,
    syncError: latestSync?.error ?? null,
  };
}

async function getCachedRepositoryArmySnapshot(userId: string) {
  return unstable_cache(
    () => getRepositoryArmySnapshot(userId),
    ["repository-army", userId],
    {
      revalidate: CACHE_REVALIDATE_SECONDS,
      tags: [armyCacheTag(userId)],
    },
  )();
}

export async function getRepositoryArmyData(): Promise<RepositoryArmyData> {
  const { dbUser, githubUsername } = await upsertCurrentUser();
  if (!dbUser) {
    return {
      user: null,
      githubUsername: null,
      characters: [],
      lastSyncAt: null,
      nextSyncAt: null,
      canSync: false,
      syncStatus: null,
      syncError: null,
    };
  }

  const snapshot = await getCachedRepositoryArmySnapshot(dbUser.id);

  return {
    user: dbUser,
    githubUsername,
    ...snapshot,
  };
}

export async function syncRepositoryArmy() {
  "use server";

  const { clerkUser, dbUser, githubUsername } = await upsertCurrentUser();
  if (!clerkUser || !dbUser || !githubUsername) {
    return { ok: false, message: "No hay usuario de GitHub conectado en Clerk." };
  }

  const latestSync = await getLatestSync(dbUser.id);
  const lastCompletedSyncAt = latestSync?.status === "completed" ? latestSync.finishedAt : null;
  if (!canRunDailySync(lastCompletedSyncAt)) {
    return { ok: false, message: "El army ya fue sincronizado hoy." };
  }

  const db = getDb();
  const [syncRun] = await db
    .insert(syncRuns)
    .values({ userId: dbUser.id, status: "running" })
    .returning();

  try {
    const githubToken = await getGitHubOauthAccessToken(clerkUser.id);
    const repositories = await fetchPublicRepositories(githubUsername, githubToken ?? undefined, { fresh: true });
    const commitCounts = await fetchRepositoryCommitCounts(githubUsername, repositories, githubToken ?? undefined);
    const capturedAt = new Date();

    await db.delete(repositorySnapshots).where(eq(repositorySnapshots.userId, dbUser.id));

    if (repositories.length > 0) {
      await db.insert(repositorySnapshots).values(
        repositories.map((repo) => ({
          userId: dbUser.id,
          githubRepoId: String(repo.id),
          name: repo.name,
          primaryLanguage: repo.language ?? "N/A",
          includedInStats: true,
          capturedAt,
          metrics: {
            description: repo.description,
            fork: repo.fork,
            htmlUrl: repo.html_url,
            commits: commitCounts.get(repo.id) ?? 0,
            forks: repo.forks_count,
            issues: repo.open_issues_count,
            stars: repo.stargazers_count,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
          } satisfies RepositorySnapshotMetrics,
        })),
      );
    }

    await db
      .update(syncRuns)
      .set({
        status: "completed",
        reposProcessed: repositories.length,
        finishedAt: capturedAt,
      })
      .where(eq(syncRuns.id, syncRun.id));

    revalidateTag(armyCacheTag(dbUser.id), "max");
    revalidateTag(profileCacheTag(dbUser.id), "max");
    revalidateTag(ARENA_USERS_CACHE_TAG, "max");
    revalidateTag(LANDING_TOP_ARMY_CACHE_TAG, "max");
    revalidatePath("/game/army");
    revalidatePath("/game/dashboard");
    revalidatePath("/game/arena");
    revalidatePath(`/game/profile/${dbUser.id}`);
    return { ok: true, message: "Army sincronizado desde GitHub." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al sincronizar GitHub.";
    await db
      .update(syncRuns)
      .set({
        status: "failed",
        error: message,
        finishedAt: new Date(),
      })
      .where(eq(syncRuns.id, syncRun.id));
    revalidateTag(armyCacheTag(dbUser.id), "max");
    revalidatePath("/game/army");

    return { ok: false, message };
  }
}
