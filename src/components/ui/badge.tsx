import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  children,
}: {
  className?: string;
  tone?: "default" | "air" | "raw" | "cooked";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "default" && "bg-bg-elevated text-muted",
        tone === "air" && "bg-air/10 text-air",
        tone === "raw" && "bg-raw/10 text-raw",
        tone === "cooked" && "bg-cooked/10 text-cooked",
        className,
      )}
    >
      {children}
    </span>
  );
}
