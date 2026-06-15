import { BattleExperience } from "@/components/battle-scene/battle-experience";
import { PlayerCard } from "@/components/player-card";
import { PixelButton } from "@/components/ui/pixel-button";
import { mockBattle, mockProfiles } from "@/mocks/battle-git";

export default function DemoBattlePage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-7xl gap-5 px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase text-[#ff4f68]">Training battle</p>
          <h1 className="font-mono text-3xl font-black uppercase">Dev_Pixel vs CodeKnight</h1>
        </div>
        <PixelButton href="/demo" variant="secondary">Dashboard</PixelButton>
      </header>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr_320px]">
        <PlayerCard player={mockProfiles[0]} />
        <BattleExperience battle={mockBattle} />
        <PlayerCard player={mockProfiles[1]} />
      </div>
    </main>
  );
}
