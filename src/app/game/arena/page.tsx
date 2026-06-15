import Link from "next/link";
import { Crown, Swords, Trophy, UserRound } from "lucide-react";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { getArenaUsers } from "@/server/game/profiles";

export const dynamic = "force-dynamic";

export default async function ArenaPage() {
  const players = await getArenaUsers();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-58px)] max-w-6xl gap-5 px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase text-[#59f19a]">Registered players</p>
          <h1 className="font-mono text-3xl font-black uppercase">Arena</h1>
        </div>
        <PixelButton href="/game/dashboard" variant="secondary">Dashboard</PixelButton>
      </header>

      <PixelPanel
        title={`Combatientes (${players.length})`}
        action={
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase text-[#59f19a]">
            <Swords size={14} /> Bots starter + usuarios
          </span>
        }
      >
        {players.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <Link
                key={player.id}
                href={player.href}
                className="grid gap-4 border border-[#40558f] bg-[#0e1629] p-4 transition hover:border-[#59f19a] hover:bg-[#121d36]"
              >
                <div className="flex items-center gap-3">
                  {player.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={player.avatarUrl}
                      alt=""
                      className="size-14 border-2 border-[#8fa5ff] bg-[#09101d] object-cover"
                    />
                  ) : (
                    <div className="grid size-14 place-items-center border-2 border-[#8fa5ff] bg-[#09101d]">
                      <UserRound size={18} className="text-[#59f19a]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-mono font-black text-[#eef3ff]">
                        {player.displayName}
                      </p>
                      {player.isBot ? (
                        <span className="border border-[#59f19a] px-2 py-0.5 font-mono text-[10px] uppercase text-[#59f19a]">
                          BOT
                        </span>
                      ) : null}
                      {player.isCurrentUser ? (
                        <span className="border border-[#ffe66d] px-2 py-0.5 font-mono text-[10px] uppercase text-[#ffe66d]">
                          Tu
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate font-mono text-xs text-[#b9c8ef]">@{player.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="border border-[#40558f] bg-[#09101d] p-2">
                    <p className="flex items-center gap-1 font-mono text-[10px] uppercase text-[#b9c8ef]">
                      <Crown size={12} /> Poder
                    </p>
                    <p className="mt-1 font-mono text-lg font-black text-[#eef3ff]">{player.totalPower}</p>
                  </div>
                  <div className="border border-[#40558f] bg-[#09101d] p-2">
                    <p className="flex items-center gap-1 font-mono text-[10px] uppercase text-[#b9c8ef]">
                      <Swords size={12} /> Army
                    </p>
                    <p className="mt-1 font-mono text-lg font-black text-[#eef3ff]">{player.armyLength}</p>
                  </div>
                  <div className="border border-[#40558f] bg-[#09101d] p-2">
                    <p className="flex items-center gap-1 font-mono text-[10px] uppercase text-[#b9c8ef]">
                      <Trophy size={12} /> W/L
                    </p>
                    <p className="mt-1 font-mono text-lg font-black text-[#eef3ff]">
                      {player.wins}/{player.losses}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {player.languages.slice(0, 3).map((language) => (
                    <span
                      key={language.name}
                      className="border border-[#40558f] bg-[#09101d] px-2 py-1 font-mono text-xs text-[#59f19a]"
                    >
                      {language.name}
                    </span>
                  ))}
                  {player.languages.length === 0 ? (
                    <span className="border border-[#40558f] bg-[#09101d] px-2 py-1 font-mono text-xs text-[#8f9fca]">
                      sin sync
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-[#40558f] bg-[#0e1629] p-4 text-sm text-[#b9c8ef]">
            Todavia no hay combatientes disponibles.
          </div>
        )}
      </PixelPanel>
    </main>
  );
}
