import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Crown, Flame, Swords, Trophy } from "lucide-react";
import { LandingArmyBackdrop } from "@/components/landing-army-backdrop";
import { PixelButton } from "@/components/ui/pixel-button";
import { getLandingArmyShowcase } from "@/server/game/landing";

export default async function Home() {
  const showcase = await getLandingArmyShowcase();

  return (
    <main className="min-h-screen overflow-hidden bg-[#08101a] text-[#eef3ff]">
      <section className="scanline relative min-h-[92vh] overflow-hidden border-b border-[#263b72]">
        <LandingArmyBackdrop characters={showcase.characters} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#08101a_0%,rgba(8,16,26,0.96)_30%,rgba(8,16,26,0.7)_58%,rgba(8,16,26,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(77,227,255,0.18),transparent_36%),radial-gradient(circle_at_80%_74%,rgba(89,241,154,0.12),transparent_32%)]" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 py-12 md:px-8">
          <div className="max-w-3xl space-y-7">
            <div className="inline-flex border border-[#59f19a] bg-[#0b141e]/85 px-3 py-2 font-mono text-xs uppercase text-[#59f19a]">
              Repositorios + contribuciones = poder
            </div>

            <div className="space-y-4">
              <h1 className="font-mono text-5xl font-black uppercase leading-none text-[#f6fbff] md:text-7xl lg:text-8xl">
                Battle Git
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[#c6d2ff] md:text-xl">
                Convierte tu trabajo diario en un army RPG. Cada repositorio suma una unidad,
                cada contribución aumenta su fuerza, y cada victoria te empuja hacia rivales
                más grandes.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Show when="signed-in">
                <PixelButton href="/game/arena" data-testid="demo-cta" className="gap-2">
                  <Swords size={18} /> Entrar a la arena
                </PixelButton>
                <PixelButton href="/game/dashboard" variant="secondary" className="gap-2">
                  <Trophy size={18} /> Ver dashboard
                </PixelButton>
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="inline-flex min-h-11 items-center justify-center border-2 border-[#8fa5ff] bg-[#1e2b52] px-4 py-2 font-mono text-sm font-bold uppercase text-[#eff4ff] transition hover:bg-[#2d4078]">
                    Iniciar sesión
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="inline-flex min-h-11 items-center justify-center border-2 border-[#a7ffc6] bg-[#59f19a] px-4 py-2 font-mono text-sm font-bold uppercase text-[#071016] transition hover:bg-[#99ffc2]">
                    Crear jugador
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <div className="inline-flex min-h-11 items-center gap-3 border-2 border-[#40558f] bg-[#0f1930]/90 px-4 py-2">
                  <span className="font-mono text-xs font-bold uppercase text-[#eff4ff]">
                    Perfil
                  </span>
                  <UserButton />
                </div>
              </Show>
            </div>

            <div className="grid max-w-3xl gap-3 sm:grid-cols-4">
              <div className="border border-[#40558f] bg-[#111b32]/88 p-3">
                <p className="font-mono text-[11px] uppercase text-[#ff6680]">
                  {showcase.hasRealLeader ? "Army top actual" : "Vista de army"}
                </p>
                <p className="mt-2 truncate font-mono text-sm font-black uppercase text-[#eef3ff]">
                  {showcase.leaderName}
                </p>
              </div>
              <div className="border border-[#40558f] bg-[#111b32]/88 p-3">
                <p className="font-mono text-[11px] uppercase text-[#ffe66d]">Poder</p>
                <p className="mt-2 font-mono text-2xl font-black text-[#59f19a]">
                  {showcase.totalPower}
                </p>
              </div>
              <div className="border border-[#40558f] bg-[#111b32]/88 p-3">
                <p className="font-mono text-[11px] uppercase text-[#ffe66d]">Repos</p>
                <p className="mt-2 font-mono text-2xl font-black text-[#4de3ff]">
                  {showcase.repositoryCount}
                </p>
              </div>
              <div className="border border-[#40558f] bg-[#111b32]/88 p-3">
                <p className="font-mono text-[11px] uppercase text-[#ffe66d]">Main</p>
                <p className="mt-2 truncate font-mono text-sm font-black text-[#eef3ff]">
                  {showcase.mainLanguage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-3 md:px-8">
        {[
          {
            icon: <Crown size={22} />,
            title: "Tus repos son unidades",
            text: "Cada proyecto aparece como parte de tu army, con clase, poder y rol dentro del campo de batalla.",
          },
          {
            icon: <Flame size={22} />,
            title: "Contribuir te hace escalar",
            text: "Más actividad, más mantenimiento y más señales de vida en tus repos aumentan tu presión ofensiva.",
          },
          {
            icon: <Swords size={22} />,
            title: "Gana para subir de rango",
            text: "Derrota rivales, desbloquea oponentes más fuertes y vuelve cuando tu army esté listo para otro salto.",
          },
        ].map((item) => (
          <article key={item.title} className="border border-[#40558f] bg-[#111b32] p-5">
            <div className="mb-4 inline-grid size-11 place-items-center border border-[#59f19a] bg-[#0b141e] text-[#59f19a]">
              {item.icon}
            </div>
            <h2 className="font-mono text-lg font-black uppercase text-[#eef3ff]">
              {item.title}
            </h2>
            <p className="mt-3 leading-7 text-[#b9c8ef]">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
