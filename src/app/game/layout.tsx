import Link from "next/link";
import type { ReactNode } from "react";

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-[#40558f] bg-[#0b111d] px-5 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="font-mono font-black uppercase text-[#59f19a]">Battle Git</Link>
          <div className="flex gap-3 font-mono text-sm">
            <Link href="/game/dashboard">Dashboard</Link>
            <Link href="/game/army">Army</Link>
            <Link href="/game/arena">Arena</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
