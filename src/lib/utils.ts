import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFormDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(d)}/${Number(m)}/${y}`;
}

export function formatMonthYear(iso: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const match = iso.match(/^(\d{4})-(\d{2})/);
  if (match) {
    const month = months[Number(match[2]) - 1];
    if (month) return `${month} ${match[1]}`;
  }
  const n = new Date();
  return `${months[n.getMonth()]} ${n.getFullYear()}`;
}

export function todayIso(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function fileSafe(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}

export function uniqueJoin(values: string[], maxLen = 80, sep = " & "): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const s = fileSafe(raw);
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  const joined = out.join(sep);
  if (joined.length <= maxLen) return joined;
  return `${joined.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

export function jobSampleNames(
  samples: Array<{ productDescription?: string; label?: string }>,
  sep = " · ",
  maxLen = 80,
): string {
  return uniqueJoin(
    samples.map((s) => (s.productDescription || "").trim()),
    maxLen,
    sep,
  );
}
