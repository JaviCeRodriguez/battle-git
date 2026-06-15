import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Crown, Languages, Swords, UserRound } from "lucide-react";
import { PixelButton } from "@/components/ui/pixel-button";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { getPublicProfile } from "@/server/game/profiles";
import { getGitHubUsername } from "@/server/github/clerk";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [profile, clerkUser] = await Promise.all([getPublicProfile(userId), currentUser()]);

  if (!profile) notFound();

  const currentGitHubUsername = getGitHubUsername(clerkUser);
  const isOwnProfile = currentGitHubUsername === profile.user.username || clerkUser?.id === profile.user.clerkUserId;

  return (
    <main className="mx-auto grid min-h-[calc(100vh-58px)] max-w-6xl gap-5 px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase text-[#59f19a]">Public profile</p>
          <h1 className="font-mono text-3xl font-black uppercase">{profile.user.username}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <PixelButton href="/game/arena" variant="secondary">Volver a arena</PixelButton>
          {isOwnProfile ? (
            <PixelButton href="/game/dashboard">Dashboard</PixelButton>
          ) : (
            <PixelButton href={`/game/arena/battle?opponentId=${profile.user.id}`}>
              <Swords size={16} /> Iniciar batalla
            </PixelButton>
          )}
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <PixelPanel title="Jugador">
          <div className="flex items-center gap-4">
            {profile.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.avatarUrl}
                alt=""
                className="size-24 border-2 border-[#8fa5ff] bg-[#0e1629] object-cover"
              />
            ) : (
              <div className="grid size-24 place-items-center border-2 border-[#8fa5ff] bg-[#0e1629]">
                <UserRound className="text-[#59f19a]" />
              </div>
            )}
            <div>
              <p className="font-mono text-xl font-black text-[#eef3ff]">
                {profile.user.displayName ?? profile.user.username}
              </p>
              <p className="font-mono text-sm text-[#b9c8ef]">@{profile.user.username}</p>
              <p className="mt-2 font-mono text-xs uppercase text-[#ffe66d]">
                {profile.profile.className} · Lv {profile.profile.level}
              </p>
            </div>
          </div>
        </PixelPanel>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#40558f] bg-[#0e1629] p-4">
            <p className="font-mono text-xs uppercase text-[#b9c8ef]">Poder total</p>
            <p className="mt-3 font-mono text-3xl font-black text-[#eef3ff]">{profile.totalPower}</p>
          </div>
          <div className="border border-[#40558f] bg-[#0e1629] p-4">
            <p className="font-mono text-xs uppercase text-[#b9c8ef]">Army</p>
            <p className="mt-3 font-mono text-3xl font-black text-[#eef3ff]">{profile.army.length}</p>
          </div>
          <div className="border border-[#40558f] bg-[#0e1629] p-4">
            <p className="font-mono text-xs uppercase text-[#b9c8ef]">Ganadas</p>
            <p className="mt-3 font-mono text-3xl font-black text-[#59f19a]">{profile.wins}</p>
          </div>
          <div className="border border-[#40558f] bg-[#0e1629] p-4">
            <p className="font-mono text-xs uppercase text-[#b9c8ef]">Perdidas</p>
            <p className="mt-3 font-mono text-3xl font-black text-[#ff7b8d]">{profile.losses}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <PixelPanel title="Lenguajes">
          {profile.languages.length > 0 ? (
            <div className="grid gap-3">
              {profile.languages.map((language) => (
                <div key={language.name} className="flex items-center justify-between gap-3 border border-[#40558f] bg-[#0e1629] p-3">
                  <div className="flex items-center gap-3">
                    <Languages size={16} className="text-[#59f19a]" />
                    <p className="font-mono font-bold text-[#eef3ff]">{language.name}</p>
                  </div>
                  <p className="font-mono text-sm text-[#ffe66d]">{language.power} power</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[#40558f] bg-[#0e1629] p-4 text-sm text-[#b9c8ef]">Sin datos de lenguajes.</div>
          )}
        </PixelPanel>

        <PixelPanel title="Ultimas batallas">
          {profile.latestBattles.length > 0 ? (
            <div className="grid gap-3">
              {profile.latestBattles.map((battle) => (
                <Link
                  key={battle.id}
                  href={battle.opponentUserId ? `/game/profile/${battle.opponentUserId}` : "/game/arena"}
                  className="grid gap-2 border border-[#40558f] bg-[#0e1629] p-3 transition hover:border-[#59f19a] sm:grid-cols-[auto_1fr_auto]"
                >
                  <span className={battle.result === "won" ? "font-mono text-sm font-black uppercase text-[#59f19a]" : "font-mono text-sm font-black uppercase text-[#ff7b8d]"}>
                    {battle.result === "won" ? "Win" : "Loss"}
                  </span>
                  <span className="text-sm text-[#c6d2ff]">vs {battle.opponentName}</span>
                  <span className="font-mono text-xs text-[#8f9fca]">{formatDate(battle.createdAt)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-[#40558f] bg-[#0e1629] p-4 text-sm text-[#b9c8ef]">Sin batallas registradas.</div>
          )}
        </PixelPanel>
      </div>

      <PixelPanel
        title="Army publico"
        action={
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase text-[#59f19a]">
            <Crown size={14} /> {profile.totalPower} power
          </span>
        }
      >
        {profile.army.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {profile.army.map((character) => (
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
          <div className="border border-[#40558f] bg-[#0e1629] p-4 text-sm text-[#b9c8ef]">Este usuario todavia no sincronizo repositorios.</div>
        )}
      </PixelPanel>
    </main>
  );
}
