import type { GitHubRepository } from "@/server/github/client";

export type RepositoryCharacterKind =
  | "Mago"
  | "Caballero"
  | "Arquero"
  | "Guardian"
  | "Paladin"
  | "Berserker"
  | "Explorador"
  | "Esbirro";

export type RepositoryCharacter = {
  id: number;
  name: string;
  language: string;
  kind: RepositoryCharacterKind;
  power: number;
  commits: number;
  forks: number;
  issues: number;
  isFork: boolean;
  color: string;
  url: string;
};

export type RepositoryCharacterSource = {
  id: number;
  name: string;
  language: string | null;
  fork: boolean;
  forksCount: number;
  openIssuesCount: number;
  url: string;
};

const languageKindMap: Record<string, { kind: RepositoryCharacterKind; color: string }> = {
  TypeScript: { kind: "Mago", color: "#4de3ff" },
  JavaScript: { kind: "Mago", color: "#f7df1e" },
  Python: { kind: "Caballero", color: "#4b8bbe" },
  Go: { kind: "Guardian", color: "#00add8" },
  Rust: { kind: "Berserker", color: "#ff7043" },
  Java: { kind: "Paladin", color: "#f89820" },
  CSS: { kind: "Arquero", color: "#7d7cff" },
  HTML: { kind: "Arquero", color: "#ff7f50" },
};

export function getRepositoryCharacterKind(language: string | null, isFork: boolean) {
  if (isFork) return { kind: "Esbirro" as const, color: "#9aa8c7" };
  return languageKindMap[language ?? ""] ?? { kind: "Explorador" as const, color: "#b9f2ff" };
}

export function calculateRepositoryPower(input: {
  commits: number;
  forks: number;
  issues: number;
  isFork: boolean;
}) {
  const basePower =
    12 +
    Math.sqrt(Math.max(0, input.commits)) * 8 +
    Math.sqrt(Math.max(0, input.forks)) * 6 +
    Math.sqrt(Math.max(0, input.issues)) * 5;
  const forkMultiplier = input.isFork ? 0.45 : 1;

  return Math.max(3, Math.round(basePower * forkMultiplier));
}

export function toRepositoryCharacter(
  repo: GitHubRepository,
  commits: number,
): RepositoryCharacter {
  return toRepositoryCharacterFromSource(
    {
      id: repo.id,
      name: repo.name,
      language: repo.language,
      fork: repo.fork,
      forksCount: repo.forks_count,
      openIssuesCount: repo.open_issues_count,
      url: repo.html_url,
    },
    commits,
  );
}

export function toRepositoryCharacterFromSource(
  repo: RepositoryCharacterSource,
  commits: number,
): RepositoryCharacter {
  const language = repo.language ?? "N/A";
  const visual = getRepositoryCharacterKind(repo.language, repo.fork);

  return {
    id: repo.id,
    name: repo.name,
    language,
    kind: visual.kind,
    power: calculateRepositoryPower({
      commits,
      forks: repo.forksCount,
      issues: repo.openIssuesCount,
      isFork: repo.fork,
    }),
    commits,
    forks: repo.forksCount,
    issues: repo.openIssuesCount,
    isFork: repo.fork,
    color: visual.color,
    url: repo.url,
  };
}
