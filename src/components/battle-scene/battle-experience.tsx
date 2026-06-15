"use client";

import { Swords } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BattleSimulation } from "@/domain/types";
import { PixelPanel } from "../ui/pixel-panel";
import { ThreeBattleScene } from "./three-battle-scene";

export function BattleExperience({ battle }: { battle: BattleSimulation }) {
  const [activeTurn, setActiveTurn] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const finalTurn = Math.max(0, battle.turns.length - 1);
  const visibleTurn = skipped ? finalTurn : activeTurn;
  const turn = battle.turns[visibleTurn];

  useEffect(() => {
    if (skipped || activeTurn >= finalTurn) return;
    const timer = window.setTimeout(() => setActiveTurn((value) => value + 1), 1100);
    return () => window.clearTimeout(timer);
  }, [activeTurn, finalTurn, skipped]);

  const winner = useMemo(
    () => battle.participants.find((participant) => participant.id === battle.winnerId),
    [battle.participants, battle.winnerId],
  );

  return (
    <div className="grid gap-5">
      <PixelPanel
        title="Battle Playback"
        action={
          <button
            type="button"
            onClick={() => setSkipped(true)}
            className="border border-[#ffe66d] bg-[#2d2540] px-3 py-1 font-mono text-xs font-bold uppercase text-[#ffe66d]"
          >
            Skip
          </button>
        }
      >
        <ThreeBattleScene battle={battle} activeTurn={visibleTurn} />
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="font-mono text-sm text-[#eaf0ff]">
            <span className="text-[#59f19a]">-&gt;</span> {turn?.message ?? "Battle ready."}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase text-[#ffe66d]">
            <Swords size={16} /> Turn {visibleTurn + 1}/{battle.turns.length}
          </div>
        </div>
      </PixelPanel>

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
    </div>
  );
}
