import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { mockRanking } from "@/mocks/battle-git";

export default function DemoRankingsPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-5 px-5 py-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase text-[#59f19a]">Weekly ladder</p>
          <h1 className="font-mono text-3xl font-black uppercase">Ranking</h1>
        </div>
        <PixelButton href="/demo" variant="secondary">Dashboard</PixelButton>
      </header>
      <PixelPanel title="Global mock">
        <div className="grid gap-3">
          {mockRanking.map((entry, index) => (
            <div key={entry.playerId} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border border-[#40558f] bg-[#0e1629] p-3">
              <span className="font-mono text-xl font-black text-[#ffe66d]">#{index + 1}</span>
              <div>
                <p className="font-mono font-bold">{entry.username}</p>
                <p className="text-sm text-[#b9c8ef]">{entry.className}</p>
              </div>
              <div className="text-right font-mono text-sm text-[#59f19a]">
                <p>{entry.rating} ELO</p>
                <p>{entry.powerScore} PWR</p>
              </div>
            </div>
          ))}
        </div>
      </PixelPanel>
    </main>
  );
}
