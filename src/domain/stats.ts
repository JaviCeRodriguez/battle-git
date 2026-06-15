import type { PlayerStats, RepositorySignal, StatExplanation } from "./types";

function diminishing(value: number, cap: number, factor: number) {
  return Math.round(cap * (1 - Math.exp(-value / factor)));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getIncludedRepositories(repositories: RepositorySignal[]) {
  return repositories.filter((repo) => repo.includedInStats);
}

export function calculatePlayerStats(repositories: RepositorySignal[]): PlayerStats {
  const included = getIncludedRepositories(repositories);
  const totals = included.reduce(
    (acc, repo) => ({
      commits: acc.commits + repo.commits30d,
      prs: acc.prs + repo.prsMerged30d,
      reviews: acc.reviews + repo.reviews30d,
      issues: acc.issues + repo.issuesClosed30d,
      activeDays: acc.activeDays + Math.min(repo.activeDays30d, 30),
      streak: Math.max(acc.streak, repo.streakDays),
      ciRepos: acc.ciRepos + (repo.hasCi ? 1 : 0),
    }),
    { commits: 0, prs: 0, reviews: 0, issues: 0, activeDays: 0, streak: 0, ciRepos: 0 },
  );

  const hp = clamp(80 + diminishing(totals.activeDays + totals.streak * 2, 90, 35), 80, 180);
  const attack = clamp(25 + diminishing(totals.commits + totals.prs * 8 + totals.issues * 3, 85, 80), 25, 125);
  const guard = clamp(20 + diminishing(totals.reviews * 6 + totals.prs * 4 + totals.ciRepos * 14, 95, 60), 20, 130);
  const speed = clamp(15 + diminishing(totals.prs * 5 + totals.issues * 3 + totals.activeDays, 80, 55), 15, 105);
  const special = clamp(10 + diminishing(totals.reviews * 4 + totals.ciRepos * 12 + totals.streak, 70, 45), 10, 95);
  const powerScore = Math.round(hp * 0.25 + attack * 0.28 + guard * 0.24 + speed * 0.13 + special * 0.1);

  const explanations: StatExplanation[] = [
    { stat: "hp", label: "Consistencia de los ultimos 30 dias", value: hp, source: "streak" },
    { stat: "attack", label: "Commits, PRs e issues cerradas", value: attack, source: "commits" },
    { stat: "guard", label: "Reviews, PRs mergeadas y CI detectable", value: guard, source: "reviews" },
    { stat: "speed", label: "Ritmo de entrega reciente", value: speed, source: "prs" },
    { stat: "special", label: "Disciplina tecnica y automatizacion", value: special, source: "ci" },
  ];

  return { hp, attack, guard, speed, special, powerScore, explanations };
}
