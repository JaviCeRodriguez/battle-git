import { PlayerCard } from "@/components/player-card";
import { PixelButton } from "@/components/ui/pixel-button";
import { mockProfiles } from "@/mocks/battle-git";

export default function DemoRevealPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-3xl place-items-center px-5 py-8">
      <div className="grid w-full gap-5">
        <div className="text-center">
          <p className="font-mono text-sm uppercase text-[#59f19a]">Character generated</p>
          <h1 className="font-mono text-4xl font-black uppercase">Dev_Pixel awakened</h1>
        </div>
        <PlayerCard player={mockProfiles[0]} />
        <div className="flex justify-center">
          <PixelButton href="/demo/battle">Primera batalla</PixelButton>
        </div>
      </div>
    </main>
  );
}
