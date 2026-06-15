import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type PixelButtonProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "danger";
};

export function PixelButton({ className, variant = "primary", ...props }: PixelButtonProps) {
  return (
    <Link
      className={clsx(
        "inline-flex min-h-11 items-center justify-center border-2 px-4 py-2 font-mono text-sm font-bold uppercase transition",
        variant === "primary" && "border-[#a7ffc6] bg-[#59f19a] text-[#071016] hover:bg-[#99ffc2]",
        variant === "secondary" && "border-[#8fa5ff] bg-[#1e2b52] text-[#eff4ff] hover:bg-[#2d4078]",
        variant === "danger" && "border-[#ffc1ca] bg-[#ff4f68] text-[#17060a] hover:bg-[#ff7b8d]",
        className,
      )}
      {...props}
    />
  );
}
