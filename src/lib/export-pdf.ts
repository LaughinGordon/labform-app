import { PDFDocument } from "pdf-lib";
import { renderSampleCanvas } from "./render-form";
import { formatMonthYear, todayIso } from "./utils";
import type { Job } from "./types";

function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Could not export form image"));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png");
  });
}

function fileSafe(value: string): string {
  return value.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueJoin(values: string[], maxLen = 60): string {
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
  const joined = out.join(" & ");
  if (joined.length <= maxLen) return joined;
  return `${joined.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

function airManufacturerLabel(job: Job): string {
  const names = job.samples.map((s) => s.manufacturer.trim()).filter(Boolean);
  const preferred = ["YLPC", "MIHK"];
  const ordered: string[] = [];
  for (const id of preferred) {
    if (names.some((n) => n.toUpperCase() === id)) ordered.push(id);
  }
  for (const name of names) {
    if (!preferred.includes(name.toUpperCase())) ordered.push(name);
  }
  return uniqueJoin(ordered);
}

function cookedNames(job: Job): string {
  return uniqueJoin(job.samples.map((s) => s.productDescription));
}

export function jobFileStem(job: Job): string {
  const dateIso = job.samples[0]?.collectionDate || job.createdAt || todayIso();
  const when = formatMonthYear(dateIso);
  let mid: string;
  if (job.sampleType === "air") {
    const mans = airManufacturerLabel(job);
    mid = mans ? `(${mans}) Air Samples` : "Air Samples";
  } else if (job.sampleType === "raw") {
    if (job.rawKind === "chicken") mid = "Raw Chicken";
    else if (job.rawKind === "other") {
      const names = cookedNames(job);
      mid = names ? `Raw Other (${names})` : "Raw Other";
    } else mid = "Raw Beef";
  } else {
    const names = cookedNames(job);
    mid = names ? `Cooked Foods (${names})` : "Cooked Foods";
  }
  return `SGS - Application Form - ${mid} - ${when}`;
}

export async function exportJobPdf(job: Job): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const pageW = 595.44;
  const pageH = 841.68;
  for (const sample of job.samples) {
    const canvas = await renderSampleCanvas(job, sample);
    const bytes = await canvasToPng(canvas);
    const png = await pdf.embedPng(bytes);
    const page = pdf.addPage([pageW, pageH]);
    page.drawImage(png, { x: 0, y: 0, width: pageW, height: pageH });
  }
  const bytes = await pdf.save();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
