import { PDFDocument } from "pdf-lib";
import { SAMPLE_TYPE_META } from "./presets";
import { renderSampleCanvas } from "./render-form";
import { formatFormDate } from "./utils";
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

export function jobFileStem(job: Job): string {
  const type = SAMPLE_TYPE_META[job.sampleType].en.replace(/\s+/g, "-");
  const date = job.samples[0]?.collectionDate
    ? formatFormDate(job.samples[0].collectionDate).replace(/\//g, "-")
    : "undated";
  return `SGS-Application-${type}-${date}`;
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
