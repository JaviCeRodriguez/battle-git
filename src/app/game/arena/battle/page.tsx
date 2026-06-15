import { notFound } from "next/navigation";
import { BattleExperience } from "@/components/battle-scene/battle-experience";
import { CompactPlayerCard } from "@/components/player-card";
import { PixelButton } from "@/components/ui/pixel-button";
import { getArenaBattle, recordArenaBattle } from "@/server/game/profiles";

export const dynamic = "force-dynamic";

export default async function ArenaBattlePage({
  searchParams,
}: {
  searchParams: Promise<{ opponentId?: string }>;
}) {
  const { opponentId } = await searchParams;
  const arenaBattle = await getArenaBattle(opponentId ?? null);

  if (!arenaBattle) notFound();

  async function resolveBattleAction() {
    "use server";

    if (opponentId) await recordArenaBattle(opponentId);
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-58px)] max-w-7xl gap-5 px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase text-[#ff4f68]">Arena battle</p>
          <h1 className="font-mono text-3xl font-black uppercase">
            {arenaBattle.player.username} vs {arenaBattle.opponent.username}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <PixelButton href="/game/arena" variant="secondary">Arena</PixelButton>
          <PixelButton href="/game/dashboard" variant="secondary">Dashboard</PixelButton>
        </div>
      </header>
      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="grid content-start gap-5">
          <CompactPlayerCard player={arenaBattle.player} />
          <CompactPlayerCard player={arenaBattle.opponent} />
        </aside>
        <BattleExperience
          battle={arenaBattle.battle}
          armyBattle={arenaBattle.armyBattle}
          onResolveBattle={resolveBattleAction}
        />
      </div>
    </main>
  );
}
