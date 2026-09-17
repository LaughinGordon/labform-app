import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-fg"
          : "border-border bg-surface text-fg hover:border-border-strong",
      )}
    >
      {children}
    </button>
  );
}
