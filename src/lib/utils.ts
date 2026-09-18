import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RawKind, SampleType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFormDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(d)}/${Number(m)}/${y}`;
}

export function formatFileDate(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const n = new Date();
  const d = String(n.getDate()).padStart(2, "0");
  const m = String(n.getMonth() + 1).padStart(2, "0");
  return `${d}-${m}-${n.getFullYear()}`;
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

const RAW_KIND_ORDER: RawKind[] = ["beef", "chicken", "other"];
const RAW_KIND_EN: Record<RawKind, string> = { beef: "Beef", chicken: "Chicken", other: "Other" };
const RAW_KIND_ZH: Record<RawKind, string> = { beef: "牛肉", chicken: "雞肉", other: "其他" };

export function sampleRawKind(
  sample: { rawKind?: RawKind },
  job: { sampleType: SampleType; rawKind?: RawKind },
): RawKind | undefined {
  if (job.sampleType !== "raw") return undefined;
  return sample.rawKind ?? job.rawKind ?? "beef";
}

export function jobRawKinds(job: {
  sampleType: SampleType;
  rawKind?: RawKind;
  samples: Array<{ rawKind?: RawKind }>;
}): RawKind[] {
  if (job.sampleType !== "raw") return [];
  const present = new Set(job.samples.map((s) => sampleRawKind(s, job)));
  return RAW_KIND_ORDER.filter((k) => present.has(k));
}

export function rawKindsEn(job: {
  sampleType: SampleType;
  rawKind?: RawKind;
  samples: Array<{ rawKind?: RawKind }>;
}): string {
  const kinds = jobRawKinds(job);
  if (!kinds.length) return "Beef";
  return kinds.map((k) => RAW_KIND_EN[k]).join(" & ");
}

export function rawKindsZh(job: {
  sampleType: SampleType;
  rawKind?: RawKind;
  samples: Array<{ rawKind?: RawKind }>;
}): string {
  const kinds = jobRawKinds(job);
  if (!kinds.length) return "牛肉";
  return kinds.map((k) => RAW_KIND_ZH[k]).join(" & ");
}

const COUNTRY_SUFFIX =
  "US|USA|UK|HK|China|Australia|Brazil|Canada|Japan|Thailand|NZ|New Zealand";
const KIND_SUFFIX = "Beef|Chicken|Other|牛肉|雞肉|其他";

export function shortenProductName(desc: string): string {
  let s = desc.replace(/\s+/g, " ").trim();
  if (!s) return "";
  s = s.replace(new RegExp(`\\s+(?:${KIND_SUFFIX})\\s*$`, "i"), "").trim();
  s = s.replace(new RegExp(`\\s+(?:${COUNTRY_SUFFIX})\\s*$`, "i"), "").trim();
  const ship = s.match(/^(.*?)\(\s*shipment\s+([^)]+?)\s*\)(.*)$/i);
  if (ship) {
    const id = ship[2].trim();
    let head = `${ship[1]} ${ship[3]}`.replace(/\s+/g, " ").trim();
    head = head.replace(/\s+[A-Za-z0-9._/-]+$/, "").trim();
    return fileSafe(head ? `${head} ${id}` : id);
  }
  return fileSafe(s);
}

export function compressBrandIds(names: string[]): string {
  const groups: Array<{ brand: string; ids: string[] }> = [];
  for (const name of names) {
    const m = name.match(/^(\S+)\s+(.+)$/);
    if (!m) {
      groups.push({ brand: name, ids: [] });
      continue;
    }
    const brand = m[1];
    const rest = m[2];
    const last = groups[groups.length - 1];
    if (last && last.brand === brand && last.ids.length) {
      last.ids.push(rest);
    } else {
      groups.push({ brand, ids: [rest] });
    }
  }
  return groups
    .map((g) => (g.ids.length ? `${g.brand} ${g.ids.join(", ")}` : g.brand))
    .join(", ");
}

export function rawFileMid(job: {
  sampleType: SampleType;
  rawKind?: RawKind;
  samples: Array<{ rawKind?: RawKind; productDescription?: string }>;
}): string {
  const parts: string[] = [];
  for (const kind of jobRawKinds(job)) {
    const seen = new Set<string>();
    const shorts: string[] = [];
    for (const sample of job.samples) {
      if (sampleRawKind(sample, job) !== kind) continue;
      const name = shortenProductName(sample.productDescription ?? "");
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      shorts.push(name);
    }
    const grouped = compressBrandIds(shorts);
    const label = RAW_KIND_EN[kind];
    parts.push(grouped ? `Raw ${label} (${grouped})` : `Raw ${label}`);
  }
  return parts.join(", ");
}
