import { clsx } from "clsx";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type PixelPanelProps = ComponentPropsWithoutRef<"section"> & {
  title?: string;
  action?: ReactNode;
};

export function PixelPanel({ title, action, className, children, ...props }: PixelPanelProps) {
  return (
    <section
      className={clsx(
        "pixel-border bg-[var(--panel)] text-foreground",
        "border border-[#41558f] p-4 md:p-5",
        className,
      )}
      {...props}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#41558f] pb-3">
          {title ? <h2 className="font-mono text-sm font-bold uppercase text-[#e9f0ff]">{title}</h2> : <span />}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
