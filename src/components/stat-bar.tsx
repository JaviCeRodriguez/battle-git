import type { StatKey } from "@/domain/types";

const labels: Record<StatKey, string> = {
  hp: "HP",
  attack: "ATK",
  guard: "GRD",
  speed: "SPD",
  special: "SPC",
};

export function StatBar({ stat, value, max = 180 }: { stat: StatKey; value: number; max?: number }) {
  const width = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-xs text-[#dce6ff]">
        <span>{labels[stat]}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 border border-[#6e83c8] bg-[#090e19]">
        <div
          className="h-full bg-gradient-to-r from-[#ff4f68] via-[#ffe66d] to-[#59f19a]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
