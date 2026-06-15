import type { PlayerProfileView, RankingEntry } from "./types";

export function buildWeeklyRanking(players: PlayerProfileView[]): RankingEntry[] {
  return players
    .map((player, index) => ({
      playerId: player.id,
      username: player.username,
      displayName: player.displayName,
      className: player.visualPreset.className,
      rating: player.rating,
      powerScore: player.stats.powerScore,
      wins: Math.max(1, Math.round((player.rating - 900) / 35) + index),
    }))
    .sort((a, b) => b.rating + b.powerScore - (a.rating + a.powerScore));
}
