import { GitBranch, RefreshCcw, Shield } from "lucide-react";
import { RepositoryArmyScene } from "@/components/repository-army-scene";
import { PixelPanel } from "@/components/ui/pixel-panel";
import { getRepositoryArmyData, syncRepositoryArmy } from "@/server/army/repository-army";

export const dynamic = "force-dynamic";

async function syncArmyAction() {
  "use server";

  await syncRepositoryArmy();
}

function formatDate(date: Date | null) {
  if (!date) return "Nunca";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ArmyPage() {
  const army = await getRepositoryArmyData();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-58px)] max-w-6xl gap-5 px-5 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm uppercase text-[#59f19a]">Neon snapshot army</p>
          <h1 className="font-mono text-3xl font-black uppercase">Army de repositorios</h1>
        </div>
        <form action={syncArmyAction}>
          <button
            type="submit"
            disabled={!army.canSync || !army.githubUsername}
            className="inline-flex min-h-11 items-center justify-center gap-2 border-2 border-[#a7ffc6] bg-[#59f19a] px-4 py-2 font-mono text-sm font-bold uppercase text-[#071016] transition hover:bg-[#99ffc2] disabled:cursor-not-allowed disabled:border-[#40558f] disabled:bg-[#1e2b52] disabled:text-[#8f9fca]"
          >
            <RefreshCcw size={16} /> Sync GitHub
          </button>
        </form>
      </header>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <PixelPanel title="Cuenta y sync">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GitBranch className="text-[#59f19a]" />
              <div>
                <p className="font-mono text-sm text-[#b9c8ef]">GitHub username</p>
                <p className="font-bold">{army.githubUsername ?? "No conectado"}</p>
              </div>
            </div>

            <div className="grid gap-3 border border-[#40558f] bg-[#0e1629] p-3 font-mono text-sm">
              <p>
                <span className="text-[#ffe66d]">Fuente:</span> Neon PostgreSQL
              </p>
              <p>
                <span className="text-[#ffe66d]">Ultimo sync:</span> {formatDate(army.lastSyncAt)}
              </p>
              <p>
                <span className="text-[#ffe66d]">Proximo sync:</span>{" "}
                {army.canSync ? "Disponible ahora" : formatDate(army.nextSyncAt)}
              </p>
              <p>
                <span className="text-[#ffe66d]">Estado:</span> {army.syncStatus ?? "sin registros"}
              </p>
            </div>

            {army.syncError ? (
              <div className="border border-[#ff4f68] bg-[#2a1220] p-3 text-sm text-[#ffd7dd]">
                Ultimo error de sync: {army.syncError}
              </div>
            ) : null}

            <div className="border border-[#40558f] bg-[#0e1629] p-3 text-sm text-[#b9c8ef]">
              El army siempre se renderiza desde snapshots guardados en Neon. GitHub solo se consulta cuando haces un nuevo sync diario.
            </div>
          </div>
        </PixelPanel>

        <PixelPanel title={`Campo de batalla (${army.characters.length} personajes)`}>
          {army.characters.length > 0 ? (
            <RepositoryArmyScene characters={army.characters} />
          ) : (
            <div className="border border-[#40558f] bg-[#0e1629] p-4 text-sm text-[#b9c8ef]">
              Todavia no hay repositorios guardados en Neon. Ejecuta el primer sync para convertir tus repos publicos en personajes.
            </div>
          )}
        </PixelPanel>
      </div>

      <PixelPanel
        title={`Personajes del army (${army.characters.length})`}
        action={
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase text-[#59f19a]">
            <Shield size={14} /> DB snapshot
          </span>
        }
      >
        {army.characters.length > 0 ? (
          <div className="grid gap-3">
            {army.characters.map((character) => (
              <a
                key={character.id}
                href={character.url}
                target="_blank"
                rel="noreferrer"
                className="grid gap-2 border border-[#40558f] bg-[#0e1629] p-3 transition hover:border-[#59f19a] md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-mono font-bold text-[#eef3ff]">{character.name}</p>
                  <p className="text-sm text-[#b9c8ef]">
                    {character.isFork
                      ? "Fork detectado: convertido en esbirro."
                      : `Repo source: ${character.kind} segun lenguaje principal.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 font-mono text-xs text-[#59f19a] md:justify-end">
                  <span>{character.isFork ? "Fork" : "Source"}</span>
                  <span>{character.kind}</span>
                  <span>{character.language}</span>
                  <span>{character.power} power</span>
                  <span>{character.commits} commits</span>
                  <span>{character.forks} forks</span>
                  <span>{character.issues} issues</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="border border-[#40558f] bg-[#0e1629] p-4 text-sm text-[#b9c8ef]">
            {army.githubUsername
              ? "Sin snapshots todavia. El primer sync guardara repositorios, commits, forks e issues en Neon."
              : "Falta una cuenta GitHub conectada desde Clerk."}
          </div>
        )}
      </PixelPanel>
    </main>
  );
}
