import { PlayerCard } from "@/components/player-card";
import { RepoArmy } from "@/components/repo-army";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { mockProfiles } from "@/mocks/battle-git";

export default function DemoDashboardPage() {
  const player = mockProfiles[0];

  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-5 px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase text-[#59f19a]">Demo mode</p>
          <h1 className="font-mono text-3xl font-black uppercase">Command Center</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <PixelButton href="/demo/sync" variant="secondary">Sync mock</PixelButton>
          <PixelButton href="/demo/battle">Entrenar</PixelButton>
          <PixelButton href="/demo/rankings" variant="secondary">Ranking</PixelButton>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <PlayerCard player={player} />
        <div className="grid gap-5">
          <RepoArmy repositories={player.repositories} />
          <PixelPanel title="Como mejorar tus stats">
            <div className="grid gap-3 md:grid-cols-3">
              {player.stats.explanations.slice(0, 3).map((item) => (
                <div key={item.stat} className="border border-[#40558f] bg-[#0e1629] p-3">
                  <p className="font-mono text-xs uppercase text-[#ffe66d]">{item.stat}</p>
                  <p className="mt-2 text-sm text-[#dce6ff]">{item.label}</p>
                </div>
              ))}
            </div>
          </PixelPanel>
        </div>
      </div>
    </main>
  );
}
