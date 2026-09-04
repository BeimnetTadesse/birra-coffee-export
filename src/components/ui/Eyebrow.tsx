import type { ReactNode } from "react";

export default function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase text-gold-400 ${className}`}
    >
      <span className="h-px w-8 bg-gold-500/70" />
      {children}
    </span>
  );
}
