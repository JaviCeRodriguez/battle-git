import type { PlayerProfileView } from "@/domain/types";
import { StatBar } from "./stat-bar";
import { PixelPanel } from "./ui/pixel-panel";

export function PlayerCard({ player }: { player: PlayerProfileView }) {
  return (
    <PixelPanel title={player.username} className="min-h-full">
      <div className="mb-4 flex items-center gap-4">
        <div
          className="grid size-20 place-items-center border-2 border-[#c6d2ff] font-mono text-xl font-black text-[#071016]"
          style={{ backgroundColor: player.visualPreset.primaryColor }}
        >
          {player.visualPreset.placeholderShape.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-mono text-sm text-[#59f19a]">{player.visualPreset.className}</p>
          <h3 className="text-xl font-black">{player.displayName}</h3>
          <p className="text-sm text-[#b9c8ef]">{player.title}</p>
          <p className="mt-1 font-mono text-xs text-[#ffe66d]">LVL {player.level} / ELO {player.rating}</p>
        </div>
      </div>
      <div className="grid gap-3">
        <StatBar stat="hp" value={player.stats.hp} />
        <StatBar stat="attack" value={player.stats.attack} max={130} />
        <StatBar stat="guard" value={player.stats.guard} max={130} />
        <StatBar stat="speed" value={player.stats.speed} max={110} />
        <StatBar stat="special" value={player.stats.special} max={100} />
      </div>
    </PixelPanel>
  );
}

export function CompactPlayerCard({ player }: { player: PlayerProfileView }) {
  return (
    <PixelPanel title={player.username}>
      <div className="flex items-center gap-3">
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.avatarUrl}
            alt=""
            className="size-14 shrink-0 border-2 border-[#c6d2ff] bg-[#0e1629] object-cover"
          />
        ) : (
          <div
            className="grid size-14 shrink-0 place-items-center border-2 border-[#c6d2ff] font-mono text-sm font-black text-[#071016]"
            style={{ backgroundColor: player.visualPreset.primaryColor }}
          >
            {player.visualPreset.placeholderShape.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-bold text-[#59f19a]">{player.visualPreset.className}</p>
          <p className="truncate text-base font-black text-[#eef3ff]">{player.displayName}</p>
          <p className="font-mono text-xs text-[#c6d2ff]">{player.stats.powerScore} power</p>
          <p className="mt-1 font-mono text-xs text-[#ffe66d]">LVL {player.level} / ELO {player.rating}</p>
        </div>
      </div>
    </PixelPanel>
  );
}
