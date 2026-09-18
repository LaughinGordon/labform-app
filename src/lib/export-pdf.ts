import { PDFDocument } from "pdf-lib";
import { renderSampleCanvas } from "./render-form";
import { formatFileDate, rawFileMid, todayIso, uniqueJoin } from "./utils";
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

export function jobFileStem(job: Job): string {
  const dateIso = job.samples[0]?.collectionDate || job.createdAt || todayIso();
  const when = formatFileDate(dateIso);
  let mid: string;
  if (job.sampleType === "air") {
    const mans = airManufacturerLabel(job);
    mid = mans ? `(${mans}) Air Samples` : "Air Samples";
  } else if (job.sampleType === "raw") {
    mid = rawFileMid(job) || "Raw Beef";
  } else {
    const names = uniqueJoin(
      job.samples.map((s) => s.productDescription),
      160,
      ", ",
    );
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
