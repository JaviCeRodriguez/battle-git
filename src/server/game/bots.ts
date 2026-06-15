import type { CharacterVisualPreset, PlayerProfileView, PlayerStats } from "@/domain/types";
import type { LanguageSummary } from "./profiles";

export type StarterBot = {
  id: string;
  username: string;
  displayName: string;
  title: string;
  className: string;
  level: number;
  rating: number;
  totalPower: number;
  armyLength: number;
  languages: LanguageSummary[];
  visualPreset: CharacterVisualPreset;
  stats: PlayerStats;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildStats(power: number): PlayerStats {
  const hp = clamp(80 + Math.round(power * 0.16), 80, 180);
  const attack = clamp(25 + Math.round(power * 0.12), 25, 125);
  const guard = clamp(20 + Math.round(power * 0.1), 20, 130);
  const speed = clamp(15 + Math.round(power * 0.08), 15, 105);
  const special = clamp(10 + Math.round(power * 0.07), 10, 95);
  const powerScore = Math.round(hp * 0.25 + attack * 0.28 + guard * 0.24 + speed * 0.13 + special * 0.1);

  return {
    hp,
    attack,
    guard,
    speed,
    special,
    powerScore,
    explanations: [
      { stat: "hp", label: "Bot starter balance", value: hp, source: "streak" },
      { stat: "attack", label: "Bot starter pressure", value: attack, source: "commits" },
      { stat: "guard", label: "Bot starter guard", value: guard, source: "reviews" },
      { stat: "speed", label: "Bot starter tempo", value: speed, source: "prs" },
      { stat: "special", label: "Bot starter special", value: special, source: "ci" },
    ],
  };
}

function makeBot(input: {
  id: string;
  username: string;
  displayName: string;
  title: string;
  className: string;
  language: string;
  totalPower: number;
  primaryColor: string;
  secondaryColor: string;
}): StarterBot {
  const armyLength = Math.max(1, Math.round(input.totalPower / 90));

  return {
    id: input.id,
    username: input.username,
    displayName: input.displayName,
    title: input.title,
    className: input.className,
    level: Math.max(1, Math.floor(input.totalPower / 150) + 1),
    rating: 1000 + Math.round(input.totalPower / 12),
    totalPower: input.totalPower,
    armyLength,
    languages: [{ name: input.language, count: armyLength, power: input.totalPower }],
    visualPreset: {
      className: input.className,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      placeholderShape: input.totalPower > 350 ? "prism" : "cube",
      futureAssetKey: `bot-${input.id}`,
    },
    stats: buildStats(input.totalPower),
  };
}

export function getStarterBots(currentPower: number) {
  const targets =
    currentPower > 0
      ? [
          Math.max(0, Math.round(currentPower * 0.62)),
          Math.max(0, Math.round(currentPower * 0.95)),
          Math.max(1, Math.round(currentPower * 1.08)),
          Math.max(1, Math.round(currentPower * 1.18)),
          Math.max(1, Math.round(currentPower * 1.3)),
        ]
      : [0, 0, 60, 85, 110];

  return [
    makeBot({
      id: "bot-null-squire",
      username: "NullSquire_bot",
      displayName: "Null Squire",
      title: "BOT · Starter I",
      className: "HTML Escudero",
      language: "HTML",
      totalPower: targets[0],
      primaryColor: "#ff7f50",
      secondaryColor: "#ffe66d",
    }),
    makeBot({
      id: "bot-lint-apprentice",
      username: "LintApprentice_bot",
      displayName: "Lint Apprentice",
      title: "BOT · Starter II",
      className: "TypeScript Mago",
      language: "TypeScript",
      totalPower: targets[1],
      primaryColor: "#4de3ff",
      secondaryColor: "#59f19a",
    }),
    makeBot({
      id: "bot-ci-warden",
      username: "CIWarden_bot",
      displayName: "CI Warden",
      title: "BOT · Challenger I",
      className: "Go Guardian",
      language: "Go",
      totalPower: targets[2],
      primaryColor: "#00add8",
      secondaryColor: "#ffe66d",
    }),
    makeBot({
      id: "bot-merge-knight",
      username: "MergeKnight_bot",
      displayName: "Merge Knight",
      title: "BOT · Challenger II",
      className: "Python Caballero",
      language: "Python",
      totalPower: targets[3],
      primaryColor: "#4b8bbe",
      secondaryColor: "#c6d2ff",
    }),
    makeBot({
      id: "bot-release-archon",
      username: "ReleaseArchon_bot",
      displayName: "Release Archon",
      title: "BOT · Stretch Goal",
      className: "Rust Berserker",
      language: "Rust",
      totalPower: targets[4],
      primaryColor: "#ff7043",
      secondaryColor: "#ff4f68",
    }),
  ];
}

export function botToPlayerProfileView(bot: StarterBot): PlayerProfileView {
  return {
    id: bot.id,
    username: bot.username,
    displayName: bot.displayName,
    title: bot.title,
    level: bot.level,
    rating: bot.rating,
    stats: bot.stats,
    visualPreset: bot.visualPreset,
    repositories: [],
  };
}
