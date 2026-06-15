import type { CharacterVisualPreset, RepositorySignal } from "./types";

const languagePresets: Record<string, CharacterVisualPreset> = {
  TypeScript: {
    className: "Event Sorcerer",
    primaryColor: "#4de3ff",
    secondaryColor: "#56f39a",
    placeholderShape: "orb",
    futureAssetKey: "typescript-sorcerer",
  },
  JavaScript: {
    className: "Event Sorcerer",
    primaryColor: "#f7df1e",
    secondaryColor: "#39ff88",
    placeholderShape: "orb",
    futureAssetKey: "javascript-sorcerer",
  },
  Python: {
    className: "Code Knight",
    primaryColor: "#4b8bbe",
    secondaryColor: "#ffd43b",
    placeholderShape: "capsule",
    futureAssetKey: "python-knight",
  },
  Go: {
    className: "Concurrent Guardian",
    primaryColor: "#00add8",
    secondaryColor: "#8df6ff",
    placeholderShape: "prism",
    futureAssetKey: "go-guardian",
  },
  Rust: {
    className: "Memory Paladin",
    primaryColor: "#ff7043",
    secondaryColor: "#f8d27a",
    placeholderShape: "cube",
    futureAssetKey: "rust-paladin",
  },
};

export function getPrimaryLanguage(repositories: RepositorySignal[]) {
  const weights = new Map<string, number>();

  for (const repo of repositories.filter((item) => item.includedInStats)) {
    const current = weights.get(repo.primaryLanguage) ?? 0;
    weights.set(
      repo.primaryLanguage,
      current + repo.commits30d + repo.prsMerged30d * 4 + repo.reviews30d * 2,
    );
  }

  return [...weights.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "TypeScript";
}

export function getCharacterVisualPreset(repositories: RepositorySignal[]): CharacterVisualPreset {
  const primaryLanguage = getPrimaryLanguage(repositories);

  return (
    languagePresets[primaryLanguage] ?? {
      className: "Open Source Adventurer",
      primaryColor: "#b9f2ff",
      secondaryColor: "#d9ff6a",
      placeholderShape: "cube",
      futureAssetKey: "generic-adventurer",
    }
  );
}
