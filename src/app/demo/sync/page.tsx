import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";

export default function DemoSyncPage() {
  const lines = [
    "git clone github.com/Dev_Pixel/public-army",
    "Fetching commits... 76 objects",
    "Resolving pull requests... 13 merged",
    "Detecting CI shields... 1 workflow online",
    "Calculating RPG stats... done",
  ];

  return (
    <main className="mx-auto grid min-h-screen max-w-4xl place-items-center px-5 py-8">
      <PixelPanel title="git clone de habilidades" className="w-full">
        <div className="space-y-3 font-mono text-sm">
          {lines.map((line) => (
            <p key={line}>
              <span className="text-[#59f19a]">-&gt;</span> {line}
            </p>
          ))}
        </div>
        <div className="mt-6">
          <PixelButton href="/demo/reveal">Ver personaje</PixelButton>
        </div>
      </PixelPanel>
    </main>
  );
}
