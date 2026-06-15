import type { RepositorySignal } from "@/domain/types";
import { PixelPanel } from "./ui/pixel-panel";

export function RepoArmy({ repositories }: { repositories: RepositorySignal[] }) {
  return (
    <PixelPanel title="Repositorio / Ejercito">
      <div className="grid gap-3">
        {repositories.map((repo) => (
          <div key={repo.id} className="grid gap-2 border border-[#3e528f] bg-[#0e1629] p-3 md:grid-cols-[1fr_auto]">
            <div>
              <p className="font-mono text-sm font-bold text-[#eef3ff]">{repo.name}</p>
              <p className="text-sm text-[#b9c8ef]">{repo.primaryLanguage} / CI {repo.hasCi ? "online" : "pending"}</p>
            </div>
            <div className="flex gap-3 font-mono text-xs text-[#59f19a]">
              <span>{repo.commits30d} commits</span>
              <span>{repo.prsMerged30d} PRs</span>
              <span>{repo.reviews30d} reviews</span>
            </div>
          </div>
        ))}
      </div>
    </PixelPanel>
  );
}
