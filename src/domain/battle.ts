import type { BattleSimulation, BattleTurnView, PlayerProfileView } from "./types";

function seededRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function actionForTurn(turn: number, actor: PlayerProfileView) {
  if (turn % 5 === 0) return `${actor.visualPreset.className} casts CI Shield`;
  if (turn % 3 === 0) return `${actor.username} triggers Merge Conflict`;
  return `${actor.username} pushes a clean commit`;
}

export function simulateBattle(
  playerA: PlayerProfileView,
  playerB: PlayerProfileView,
  options: { seed?: number; mode?: "training" | "arena" } = {},
): BattleSimulation {
  const random = seededRandom(options.seed ?? 42);
  let hpA = playerA.stats.hp;
  let hpB = playerB.stats.hp;
  const turns: BattleTurnView[] = [];

  for (let turn = 1; turn <= 12 && hpA > 0 && hpB > 0; turn += 1) {
    const actor = turn % 2 === 1 ? playerA : playerB;
    const target = turn % 2 === 1 ? playerB : playerA;
    const variance = 0.85 + random() * 0.3;
    const rawDamage = Math.round((actor.stats.attack * variance + actor.stats.special * 0.18) / 3);
    const blocked = Math.round(target.stats.guard / (turn % 5 === 0 ? 5 : 7));
    const damage = Math.max(4, rawDamage - blocked);

    if (target.id === playerA.id) hpA -= damage;
    else hpB -= damage;

    const cue = turn % 5 === 0 ? "special" : blocked > rawDamage * 0.35 ? "block" : "attack";

    turns.push({
      turn,
      actorId: actor.id,
      targetId: target.id,
      action: actionForTurn(turn, actor),
      damage,
      blocked,
      message: `${actor.username} dealt ${damage} damage. ${target.username} blocked ${blocked}.`,
      animationCue: hpA <= 0 || hpB <= 0 ? "defeat" : cue,
    });
  }

  const winnerId = hpA === hpB ? null : hpA > hpB ? playerA.id : playerB.id;

  return {
    battleId: `battle-${playerA.id}-${playerB.id}-${options.seed ?? 42}`,
    mode: options.mode ?? "training",
    participants: [
      {
        id: playerA.id,
        username: playerA.username,
        displayName: playerA.displayName,
        stats: playerA.stats,
        visualPreset: playerA.visualPreset,
      },
      {
        id: playerB.id,
        username: playerB.username,
        displayName: playerB.displayName,
        stats: playerB.stats,
        visualPreset: playerB.visualPreset,
      },
    ],
    turns,
    winnerId,
    rewards: winnerId
      ? [
          { label: "Rating", value: "+18" },
          { label: "Cosmetic shard", value: "Server Glow" },
        ]
      : [{ label: "Draw", value: "Both devs survived" }],
  };
}
