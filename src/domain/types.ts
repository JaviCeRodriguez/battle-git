export type StatKey = "hp" | "attack" | "guard" | "speed" | "special";

export type StatSource =
  | "commits"
  | "prs"
  | "reviews"
  | "issues"
  | "ci"
  | "streak"
  | "language";

export type StatExplanation = {
  stat: StatKey;
  label: string;
  value: number;
  source: StatSource;
};

export type PlayerStats = {
  hp: number;
  attack: number;
  guard: number;
  speed: number;
  special: number;
  powerScore: number;
  explanations: StatExplanation[];
};

export type PlaceholderShape = "cube" | "capsule" | "prism" | "orb";

export type CharacterVisualPreset = {
  className: string;
  primaryColor: string;
  secondaryColor: string;
  placeholderShape: PlaceholderShape;
  futureAssetKey?: string;
};

export type RepositorySignal = {
  id: string;
  name: string;
  primaryLanguage: string;
  commits30d: number;
  prsMerged30d: number;
  reviews30d: number;
  issuesClosed30d: number;
  activeDays30d: number;
  streakDays: number;
  hasCi: boolean;
  includedInStats: boolean;
};

export type MockPlayer = {
  id: string;
  username: string;
  displayName: string;
  title: string;
  level: number;
  rating: number;
  avatarUrl?: string;
  repositories: RepositorySignal[];
};

export type PlayerProfileView = {
  id: string;
  username: string;
  displayName: string;
  title: string;
  level: number;
  rating: number;
  avatarUrl?: string | null;
  stats: PlayerStats;
  visualPreset: CharacterVisualPreset;
  repositories: RepositorySignal[];
};

export type BattleMode = "training" | "arena" | "raid";

export type AnimationCue = "attack" | "block" | "special" | "hit" | "defeat";

export type BattleParticipantView = {
  id: string;
  username: string;
  displayName: string;
  stats: PlayerStats;
  visualPreset: CharacterVisualPreset;
};

export type BattleTurnView = {
  turn: number;
  actorId: string;
  targetId: string;
  action: string;
  damage: number;
  blocked: number;
  message: string;
  animationCue: AnimationCue;
};

export type BattleReward = {
  label: string;
  value: string;
};

export type BattleSimulation = {
  battleId: string;
  mode: BattleMode;
  participants: BattleParticipantView[];
  turns: BattleTurnView[];
  winnerId: string | null;
  rewards: BattleReward[];
};

export type RankingEntry = {
  playerId: string;
  username: string;
  displayName: string;
  className: string;
  rating: number;
  powerScore: number;
  wins: number;
};
