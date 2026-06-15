import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  githubId: text("github_id"),
  username: text("username").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  betaAccess: boolean("beta_access").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const githubAccounts = pgTable("github_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  accessTokenEncrypted: text("access_token_encrypted"),
  scopes: text("scopes").notNull().default("public_repo"),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const betaInvites = pgTable("beta_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  maxUses: integer("max_uses").notNull().default(1),
  usedCount: integer("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const betaRedemptions = pgTable("beta_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  inviteId: uuid("invite_id").notNull().references(() => betaInvites.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
});

export const repositorySnapshots = pgTable("repository_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  githubRepoId: text("github_repo_id").notNull(),
  name: text("name").notNull(),
  primaryLanguage: text("primary_language").notNull(),
  includedInStats: boolean("included_in_stats").notNull().default(true),
  metrics: jsonb("metrics").notNull(),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

export const playerProfiles = pgTable("player_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  className: text("class_name").notNull(),
  visualPreset: jsonb("visual_preset").notNull(),
  level: integer("level").notNull().default(1),
  rating: integer("rating").notNull().default(1000),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const playerStats = pgTable("player_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerProfileId: uuid("player_profile_id").notNull().references(() => playerProfiles.id),
  hp: integer("hp").notNull(),
  attack: integer("attack").notNull(),
  guard: integer("guard").notNull(),
  speed: integer("speed").notNull(),
  special: integer("special").notNull(),
  powerScore: integer("power_score").notNull(),
  explanations: jsonb("explanations").notNull(),
});

export const battles = pgTable("battles", {
  id: uuid("id").primaryKey().defaultRandom(),
  mode: text("mode").notNull(),
  status: text("status").notNull().default("completed"),
  winnerId: uuid("winner_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const battleParticipants = pgTable("battle_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  battleId: uuid("battle_id").notNull().references(() => battles.id),
  playerProfileId: uuid("player_profile_id").notNull().references(() => playerProfiles.id),
  team: text("team").notNull().default("solo"),
});

export const battleTurns = pgTable("battle_turns", {
  id: uuid("id").primaryKey().defaultRandom(),
  battleId: uuid("battle_id").notNull().references(() => battles.id),
  turnNumber: integer("turn_number").notNull(),
  actorId: text("actor_id").notNull(),
  targetId: text("target_id").notNull(),
  action: text("action").notNull(),
  damage: integer("damage").notNull(),
  blocked: integer("blocked").notNull(),
  message: text("message").notNull(),
  animationCue: text("animation_cue").notNull(),
});

export const battleLogs = pgTable("battle_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  opponentId: text("opponent_id").notNull(),
  opponentName: text("opponent_name").notNull(),
  opponentIsBot: boolean("opponent_is_bot").notNull().default(false),
  result: text("result").notNull(),
  playerPower: integer("player_power").notNull(),
  opponentPower: integer("opponent_power").notNull(),
  battleData: jsonb("battle_data").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rankingEntries = pgTable("ranking_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerProfileId: uuid("player_profile_id").notNull().references(() => playerProfiles.id),
  period: text("period").notNull(),
  rating: integer("rating").notNull(),
  powerScore: integer("power_score").notNull(),
  wins: integer("wins").notNull().default(0),
});

export const syncRuns = pgTable("sync_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  status: text("status").notNull(),
  error: text("error"),
  rateLimitRemaining: integer("rate_limit_remaining"),
  reposProcessed: integer("repos_processed").notNull().default(0),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
});
