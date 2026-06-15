import type { RepositoryCharacterKind } from "./repository-characters";

export type ArmyBattleTeam = "left" | "right";
export type ArmyBattleActionCue = "spell" | "arrow" | "charge";

export type ArmyBattleFighterInput = {
  id: string;
  name: string;
  kind: RepositoryCharacterKind;
  color: string;
  power: number;
  team: ArmyBattleTeam;
};

export type ArmyBattleFighter = ArmyBattleFighterInput & {
  maxHp: number;
};

export type ArmyBattleTurn = {
  turn: number;
  actorId: string;
  targetId: string;
  actorTeam: ArmyBattleTeam;
  actionCue: ArmyBattleActionCue;
  hit: boolean;
  defended: boolean;
  critical: boolean;
  damage: number;
  targetHp: number;
  targetDefeated: boolean;
  message: string;
};

export type ArmyBattleSimulation = {
  fighters: ArmyBattleFighter[];
  turns: ArmyBattleTurn[];
  winnerTeam: ArmyBattleTeam | null;
};

function seededRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function maxHpForPower(power: number) {
  return Math.max(24, Math.round(36 + Math.sqrt(Math.max(0, power)) * 8));
}

function actionCueForKind(kind: RepositoryCharacterKind): ArmyBattleActionCue {
  if (kind === "Mago") return "spell";
  if (kind === "Arquero") return "arrow";
  return "charge";
}

function actionLabel(cue: ArmyBattleActionCue) {
  if (cue === "spell") return "lanza un hechizo";
  if (cue === "arrow") return "dispara una flecha";
  return "se lanza contra el enemigo";
}

export function simulateArmyBattle(
  inputs: ArmyBattleFighterInput[],
  options: { seed?: number } = {},
): ArmyBattleSimulation {
  const random = seededRandom(options.seed ?? 42);
  const fighters = inputs.map((fighter) => ({
    ...fighter,
    maxHp: maxHpForPower(fighter.power),
  }));
  const hp = new Map(fighters.map((fighter) => [fighter.id, fighter.maxHp]));
  const turns: ArmyBattleTurn[] = [];

  for (let turn = 1; ; turn += 1) {
    const aliveLeft = fighters.filter((fighter) => fighter.team === "left" && (hp.get(fighter.id) ?? 0) > 0);
    const aliveRight = fighters.filter((fighter) => fighter.team === "right" && (hp.get(fighter.id) ?? 0) > 0);

    if (aliveLeft.length === 0 || aliveRight.length === 0) break;
    if (turn > 5000) break;

    const actorPool = turn % 2 === 1 ? aliveLeft : aliveRight;
    const targetPool = turn % 2 === 1 ? aliveRight : aliveLeft;
    const actor = actorPool[Math.floor(random() * actorPool.length)];
    const target = targetPool[Math.floor(random() * targetPool.length)];
    const powerDelta = actor.power - target.power;
    const hitChance = clamp(0.62 + powerDelta / 420, 0.28, 0.92);
    const defenseChance = clamp(0.12 + target.power / Math.max(1, actor.power + target.power) * 0.34, 0.08, 0.46);
    const criticalChance = clamp(0.08 + Math.max(0, powerDelta) / 800, 0.06, 0.24);
    const hit = random() <= hitChance;
    const defended = hit && random() <= defenseChance;
    const critical = hit && !defended && random() <= criticalChance;
    const baseDamage = Math.max(4, Math.round(5 + Math.sqrt(Math.max(1, actor.power)) * 2.4));
    const defenseReduction = defended ? Math.round(baseDamage * 0.55) : 0;
    const damage = hit ? Math.max(0, Math.round((baseDamage - defenseReduction) * (critical ? 1.75 : 1))) : 0;
    const currentTargetHp = hp.get(target.id) ?? target.maxHp;
    const targetHp = Math.max(0, currentTargetHp - damage);

    hp.set(target.id, targetHp);

    const actionCue = actionCueForKind(actor.kind);
    const message = hit
      ? `${actor.name} ${actionLabel(actionCue)} contra ${target.name}: ${damage} daño${critical ? " crítico" : ""}${defended ? " tras defensa" : ""}.`
      : `${actor.name} falla el ataque contra ${target.name}.`;

    turns.push({
      turn,
      actorId: actor.id,
      targetId: target.id,
      actorTeam: actor.team,
      actionCue,
      hit,
      defended,
      critical,
      damage,
      targetHp,
      targetDefeated: targetHp === 0,
      message,
    });
  }

  const leftAlive = fighters.some((fighter) => fighter.team === "left" && (hp.get(fighter.id) ?? 0) > 0);
  const rightAlive = fighters.some((fighter) => fighter.team === "right" && (hp.get(fighter.id) ?? 0) > 0);

  return {
    fighters,
    turns,
    winnerTeam: leftAlive === rightAlive ? null : leftAlive ? "left" : "right",
  };
}
