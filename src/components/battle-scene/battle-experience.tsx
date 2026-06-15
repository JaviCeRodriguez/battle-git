"use client";

import { Swords } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ArmyBattleSimulation } from "@/domain/army-battle";
import type { BattleSimulation } from "@/domain/types";
import { PixelPanel } from "../ui/pixel-panel";
import { ThreeArmyBattleScene } from "./three-army-battle-scene";
import { ThreeBattleScene } from "./three-battle-scene";

function getArmyHp(armyBattle: ArmyBattleSimulation, activeTurn: number) {
  const hp = new Map(armyBattle.fighters.map((fighter) => [fighter.id, fighter.maxHp]));

  for (const turn of armyBattle.turns.slice(0, activeTurn + 1)) {
    hp.set(turn.targetId, turn.targetHp);
  }

  return hp;
}

export function BattleExperience({
  battle,
  armyBattle,
  onResolveBattle,
}: {
  battle: BattleSimulation;
  armyBattle?: ArmyBattleSimulation;
  onResolveBattle?: () => Promise<void>;
}) {
  const [activeTurn, setActiveTurn] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const recorded = useRef(false);
  const turnsLength = armyBattle?.turns.length ?? battle.turns.length;
  const finalTurn = Math.max(0, turnsLength - 1);
  const visibleTurn = skipped ? finalTurn : activeTurn;
  const turn = battle.turns[visibleTurn];
  const armyTurn = armyBattle?.turns[visibleTurn];
  const armyHp = useMemo(
    () => (armyBattle ? getArmyHp(armyBattle, visibleTurn) : null),
    [armyBattle, visibleTurn],
  );

  useEffect(() => {
    if (skipped || activeTurn >= finalTurn) return;
    const timer = window.setTimeout(() => setActiveTurn((value) => value + 1), 1100 / playbackSpeed);
    return () => window.clearTimeout(timer);
  }, [activeTurn, finalTurn, playbackSpeed, skipped]);

  const battleResolved = skipped || activeTurn >= finalTurn;
  const userWon = armyBattle ? armyBattle.winnerTeam === "left" : battle.winnerId === battle.participants[0]?.id;

  useEffect(() => {
    if (!battleResolved || recorded.current || !onResolveBattle) return;
    recorded.current = true;
    void onResolveBattle();
  }, [battleResolved, onResolveBattle]);

  const winner = useMemo(
    () => battle.participants.find((participant) => participant.id === battle.winnerId),
    [battle.participants, battle.winnerId],
  );

  return (
    <div className="grid gap-5">
      <PixelPanel
        title="Battle Playback"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackSpeed(speed)}
                className={
                  playbackSpeed === speed
                    ? "border border-[#59f19a] bg-[#163522] px-3 py-1 font-mono text-xs font-bold uppercase text-[#59f19a]"
                    : "border border-[#40558f] bg-[#0e1629] px-3 py-1 font-mono text-xs font-bold uppercase text-[#b9c8ef]"
                }
              >
                x{speed}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSkipped(true)}
              className="border border-[#ffe66d] bg-[#2d2540] px-3 py-1 font-mono text-xs font-bold uppercase text-[#ffe66d]"
            >
              Skip simulacion
            </button>
          </div>
        }
      >
        {armyBattle ? (
          <ThreeArmyBattleScene armyBattle={armyBattle} activeTurn={visibleTurn} />
        ) : (
          <ThreeBattleScene battle={battle} activeTurn={visibleTurn} />
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className={armyTurn?.critical ? "font-mono text-sm font-bold text-[#ff4f68]" : "font-mono text-sm text-[#eaf0ff]"}>
            <span className="text-[#59f19a]">-&gt;</span> {armyTurn?.message ?? turn?.message ?? "Battle ready."}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-[#ffe66d]">
            <Swords size={16} /> Turno {visibleTurn + 1}
          </div>
        </div>
        {armyBattle && armyHp ? (
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {(["left", "right"] as const).map((team) => (
              <div key={team} className="min-w-0 border border-[#40558f] bg-[#0e1629] p-3">
                <p className="mb-2 font-mono text-xs font-bold uppercase text-[#b9c8ef]">
                  {team === "left" ? "Tu army" : "Army enemigo"}
                </p>
                <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
                  {armyBattle.fighters
                    .filter((fighter) => fighter.team === team)
                    .map((fighter) => {
                      const hp = armyHp.get(fighter.id) ?? fighter.maxHp;
                      const hpRatio = hp / fighter.maxHp;

                      return (
                        <div key={fighter.id} className={hp === 0 ? "opacity-35" : undefined}>
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 font-mono text-xs">
                            <span className="min-w-0 truncate text-[#eef3ff]" title={fighter.name}>{fighter.name}</span>
                            <span className={hp === 0 ? "shrink-0 text-[#ff4f68]" : "shrink-0 text-[#59f19a]"}>
                              {hp}/{fighter.maxHp}
                            </span>
                          </div>
                          <div className="mt-1 h-2 border border-[#40558f] bg-[#09101d]">
                            <div
                              className={hpRatio < 0.35 ? "h-full bg-[#ff4f68]" : "h-full bg-[#59f19a]"}
                              style={{ width: `${Math.max(0, Math.round(hpRatio * 100))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </PixelPanel>

      {battleResolved ? (
        <PixelPanel title="Resultado">
          <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p data-testid="battle-result" className="text-2xl font-black">
                {winner ? `${winner.username} wins` : "Draw"}
              </p>
              <p className="text-sm text-[#b9c8ef]">
                {winner
                  ? `${winner.visualPreset.className} converted public repos into battlefield pressure.`
                  : "Both developers survived the merge storm."}
              </p>
            </div>
            <div className="flex gap-2">
              {battle.rewards.map((reward) => (
                <span key={reward.label} className="border border-[#59f19a] px-3 py-2 font-mono text-xs text-[#59f19a]">
                  {reward.label}: {reward.value}
                </span>
              ))}
            </div>
          </div>
        </PixelPanel>
      ) : null}

      {battleResolved ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#050914]/80 px-4">
          <div className="w-full max-w-md border-4 border-[#8fa5ff] bg-[#0e1629] p-5 shadow-[8px_8px_0_#09101d]">
            <p className="font-mono text-sm uppercase text-[#59f19a]">Resultado registrado</p>
            <h2 className={userWon ? "mt-2 font-mono text-3xl font-black uppercase text-[#59f19a]" : "mt-2 font-mono text-3xl font-black uppercase text-[#ff4f68]"}>
              {userWon ? "Ganaste" : "Perdiste"}
            </h2>
            <p className="mt-3 text-sm text-[#c6d2ff]">
              {userWon
                ? "El rival vencido queda fuera de tu arena durante una semana."
                : "Tu army necesita mas poder. Sincroniza nuevos repos o vuelve a intentar contra un starter."}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/game/army"
                className="inline-flex min-h-11 items-center justify-center border-2 border-[#8fa5ff] bg-[#1e2b52] px-4 py-2 font-mono text-sm font-bold uppercase text-[#eff4ff] transition hover:bg-[#2d4078]"
              >
                Ver mi army
              </Link>
              <Link
                href="/game/arena"
                className="inline-flex min-h-11 items-center justify-center border-2 border-[#a7ffc6] bg-[#59f19a] px-4 py-2 font-mono text-sm font-bold uppercase text-[#071016] transition hover:bg-[#99ffc2]"
              >
                Ir a arena
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
