import Link from "next/link";
import type { ReactNode } from "react";
import { Crown, Languages, Swords, Trophy, UserRound } from "lucide-react";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { getCurrentDashboard } from "@/server/game/profiles";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="border border-[#40558f] bg-[#0e1629] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase text-[#b9c8ef]">{label}</p>
        <span className="text-[#59f19a]">{icon}</span>
      </div>
      <p className="mt-3 font-mono text-3xl font-black text-[#eef3ff]">{value}</p>
    </div>
  );
}

export default async function GameDashboardPage() {
  const dashboard = await getCurrentDashboard();

  if (!dashboard) {
    return (
      <main className="mx-auto grid min-h-[calc(100vh-58px)] max-w-3xl place-items-center px-5 py-8">
        <PixelPanel title="Dashboard">
          <p className="text-[#c6d2ff]">No pude encontrar el usuario autenticado.</p>
        </PixelPanel>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-58px)] max-w-6xl gap-5 px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase text-[#59f19a]">Player dashboard</p>
          <h1 className="font-mono text-3xl font-black uppercase">Command center</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <PixelButton href={`/game/profile/${dashboard.user.id}`} variant="secondary">Perfil publico</PixelButton>
          <PixelButton href="/game/arena">Arena</PixelButton>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <PixelPanel title="Usuario">
          <div className="flex items-center gap-4">
            {dashboard.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dashboard.user.avatarUrl}
                alt=""
                className="size-20 border-2 border-[#8fa5ff] bg-[#0e1629] object-cover"
              />
            ) : (
              <div className="grid size-20 place-items-center border-2 border-[#8fa5ff] bg-[#0e1629]">
                <UserRound className="text-[#59f19a]" />
              </div>
            )}
            <div>
              <p className="font-mono text-xl font-black text-[#eef3ff]">
                {dashboard.user.displayName ?? dashboard.user.username}
              </p>
              <p className="font-mono text-sm text-[#b9c8ef]">@{dashboard.user.username}</p>
              <p className="mt-2 font-mono text-xs uppercase text-[#ffe66d]">
                {dashboard.profile.className} · Lv {dashboard.profile.level}
              </p>
            </div>
          </div>
        </PixelPanel>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Army" value={dashboard.army.length} icon={<Swords size={18} />} />
          <Metric label="Poder total" value={dashboard.totalPower} icon={<Crown size={18} />} />
          <Metric label="Ganadas" value={dashboard.wins} icon={<Trophy size={18} />} />
          <Metric label="Perdidas" value={dashboard.losses} icon={<Swords size={18} />} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <PixelPanel title="Lenguajes">
          {dashboard.languages.length > 0 ? (
            <div className="grid gap-3">
              {dashboard.languages.map((language) => (
                <div
                  key={language.name}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 border border-[#40558f] bg-[#0e1629] p-3"
                >
                  <div className="flex items-center gap-3">
                    <Languages size={16} className="text-[#59f19a]" />
                    <div>
                      <p className="font-mono font-bold text-[#eef3ff]">{language.name}</p>
                      <p className="text-sm text-[#b9c8ef]">{language.count} repos</p>
                    </div>
                  </div>
                  <p className="font-mono text-sm font-bold text-[#ffe66d]">{language.power} power</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[#40558f] bg-[#0e1629] p-4 text-sm text-[#b9c8ef]">
              Sin army sincronizado todavia. Ejecuta un sync para calcular lenguajes.
            </div>
          )}
        </PixelPanel>

        <PixelPanel title="Ultimas 5 batallas">
          {dashboard.latestBattles.length > 0 ? (
            <div className="grid gap-3">
              {dashboard.latestBattles.map((battle) => (
                <Link
                  key={battle.id}
                  href={battle.opponentUserId ? `/game/profile/${battle.opponentUserId}` : "/game/arena"}
                  className="grid gap-2 border border-[#40558f] bg-[#0e1629] p-3 transition hover:border-[#59f19a] sm:grid-cols-[auto_1fr_auto]"
                >
                  <span
                    className={
                      battle.result === "won"
                        ? "font-mono text-sm font-black uppercase text-[#59f19a]"
                        : "font-mono text-sm font-black uppercase text-[#ff7b8d]"
                    }
                  >
                    {battle.result === "won" ? "Win" : "Loss"}
                  </span>
                  <span className="text-sm text-[#c6d2ff]">vs {battle.opponentName}</span>
                  <span className="font-mono text-xs text-[#8f9fca]">{formatDate(battle.createdAt)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-[#40558f] bg-[#0e1629] p-4 text-sm text-[#b9c8ef]">
              Todavia no hay batallas registradas. Entra a la arena y desafia a otro usuario.
            </div>
          )}
        </PixelPanel>
      </div>

      <PixelPanel title="Army">
        {dashboard.army.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {dashboard.army.slice(0, 8).map((character) => (
              <div key={character.id} className="border border-[#40558f] bg-[#0e1629] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono font-bold text-[#eef3ff]">{character.name}</p>
                  <p className="font-mono text-sm text-[#ffe66d]">{character.power}</p>
                </div>
                <p className="mt-1 text-sm text-[#b9c8ef]">
                  {character.isFork ? "Esbirro fork" : character.kind} · {character.language}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[#40558f] bg-[#0e1629] p-4">
            <p className="text-sm text-[#b9c8ef]">No hay repos en Neon para formar tu army.</p>
            <PixelButton href="/game/army" variant="secondary">Sincronizar army</PixelButton>
          </div>
        )}
      </PixelPanel>
    </main>
  );
}
