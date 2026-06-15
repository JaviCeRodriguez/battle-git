import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { GitBranch, ShieldCheck, Swords } from "lucide-react";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#101721]">
      <section className="scanline mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-8 md:grid-cols-[1fr_420px] md:items-center md:px-8">
        <div className="space-y-7">
          <div className="inline-flex border border-[#59f19a] bg-[#0b141e] px-3 py-2 font-mono text-xs uppercase text-[#59f19a]">
            Public repos become your army
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl font-mono text-5xl font-black uppercase leading-none text-[#eaf0ff] md:text-7xl">
              Battle Git
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#c6d2ff]">
              Conecta GitHub, transforma commits y PRs publicos en stats RPG, y mira a tu personaje pelear en una arena retro-cyberpunk.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Show when="signed-in">
              <PixelButton href="/game/arena" data-testid="demo-cta" className="gap-2">
                <Swords size={18} /> Ir a la arena
              </PixelButton>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="inline-flex min-h-11 items-center justify-center border-2 border-[#8fa5ff] bg-[#1e2b52] px-4 py-2 font-mono text-sm font-bold uppercase text-[#eff4ff] transition hover:bg-[#2d4078]">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="inline-flex min-h-11 items-center justify-center border-2 border-[#a7ffc6] bg-[#59f19a] px-4 py-2 font-mono text-sm font-bold uppercase text-[#071016] transition hover:bg-[#99ffc2]">
                  Sign up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <PixelButton href="/game/dashboard" variant="secondary" className="gap-2">
                <span className="font-mono text-xs font-bold uppercase text-[#eff4ff]">Dashboard</span>
                <UserButton />
              </PixelButton>
            </Show>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Mock-first", "Juga antes de conectar servicios reales."],
              ["Three.js", "Escenas y personajes placeholder en 3D."],
              ["Skip", "Batallas simuladas, resultado instantaneo."],
            ].map(([title, text]) => (
              <div key={title} className="border border-[#40558f] bg-[#121b31] p-4">
                <p className="font-mono text-sm font-bold text-[#ffe66d]">{title}</p>
                <p className="mt-2 text-sm text-[#b9c8ef]">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <PixelPanel title="Beta terminal" className="self-center">
          <div className="space-y-4 font-mono text-sm">
            <p className="text-[#59f19a]">$ git clone battle-git://skills</p>
            <p className="text-[#c6d2ff]">Resolving public repos... done</p>
            <p className="text-[#c6d2ff]">Generating class: Event Sorcerer</p>
            <p className="text-[#ffe66d]">Arena opponent found: CodeKnight</p>
          </div>
          <div className="mt-6 grid gap-3">
            <div className="flex items-center gap-3 border border-[#40558f] bg-[#0e1629] p-3">
              <GitBranch className="text-[#59f19a]" />
              <span>GitHub OAuth via Clerk</span>
            </div>
            <div className="flex items-center gap-3 border border-[#40558f] bg-[#0e1629] p-3">
              <Swords className="text-[#ff4f68]" />
              <span>Simulated RPG battles</span>
            </div>
            <div className="flex items-center gap-3 border border-[#40558f] bg-[#0e1629] p-3">
              <ShieldCheck className="text-[#4de3ff]" />
              <span>Public repos only for MVP</span>
            </div>
          </div>
        </PixelPanel>
      </section>
    </main>
  );
}
