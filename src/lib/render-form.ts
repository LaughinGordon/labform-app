import { formatFormDate } from "./utils";
import { BOX, FONT_STACK, FORM_PX, INK, METHOD_BOX, TEXT, type TextField } from "./form-layout";
import type { Job, Sample, TestItem } from "./types";

const FORM_SRC = "https://raw.githubusercontent.com/LaughinGordon/labform-assets/main/sgs-l56-page1.png";

let cachedImage: HTMLImageElement | null = null;
let cachedPromise: Promise<HTMLImageElement> | null = null;

export function loadFormImage(): Promise<HTMLImageElement> {
  if (cachedImage) return Promise.resolve(cachedImage);
  if (cachedPromise) return cachedPromise;
  cachedPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      cachedImage = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error("Failed to load SGS form template"));
    img.src = FORM_SRC;
  });
  return cachedPromise;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const raw = text.replace(/\s+/g, " ").trim();
  if (!raw) return [];
  const words = raw.split(" ");
  const lines: string[] = [];
  let current = "";
  const pushChars = (chunk: string) => {
    for (const ch of chunk) {
      const next = current + ch;
      if (ctx.measureText(next).width > maxWidth && current) {
        lines.push(current);
        current = ch;
      } else {
        current = next;
      }
    }
  };
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      current = trial;
      continue;
    }
    if (current) {
      lines.push(current);
      current = "";
    }
    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
    } else {
      pushChars(word);
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fitAndDraw(ctx: CanvasRenderingContext2D, text: string, field: TextField) {
  const value = text.trim();
  if (!value) return;
  const maxW = field.w;
  const maxH = field.h ?? field.size * 1.35;
  const minSize = field.shrink ? Math.max(8, field.size * 0.45) : field.size;
  let size = field.size;
  let lines: string[] = [value];

  while (size >= minSize) {
    ctx.font = `600 ${size}px ${FONT_STACK}`;
    lines = wrapLines(ctx, value, maxW);
    const lineH = size * 1.18;
    const height = lines.length * lineH;
    const widest = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
    if (widest <= maxW + 0.5 && height <= maxH + 0.5) break;
    if (!field.shrink) break;
    size -= 0.5;
  }

  ctx.font = `600 ${size}px ${FONT_STACK}`;
  ctx.fillStyle = INK;
  ctx.textAlign = field.align ?? "left";
  ctx.textBaseline = "middle";
  const lineH = size * 1.18;
  const startY = field.y - ((lines.length - 1) * lineH) / 2;
  const x = field.align === "center" ? field.x : field.x;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * lineH);
  });
}

function tick(ctx: CanvasRenderingContext2D, x: number, y: number, size = 19) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x + 3.2, y + size * 0.52);
  ctx.lineTo(x + size * 0.4, y + size * 0.78);
  ctx.lineTo(x + size * 0.88, y + size * 0.2);
  ctx.stroke();
  ctx.restore();
}

function maybeTick(ctx: CanvasRenderingContext2D, on: boolean, pos: { x: number; y: number }) {
  if (on) tick(ctx, pos.x, pos.y);
}

function methodsOf(item: TestItem, key: string, ctx: CanvasRenderingContext2D) {
  if (!item.on) return;
  const map = METHOD_BOX[key];
  if (!map) return;
  for (const m of item.methods) {
    const pos = map[m];
    if (pos) tick(ctx, pos.x, pos.y);
  }
}

export function paintForm(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  job: Job,
  sample: Sample,
) {
  canvas.width = FORM_PX.w;
  canvas.height = FORM_PX.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, FORM_PX.w, FORM_PX.h);
  ctx.drawImage(image, 0, 0, FORM_PX.w, FORM_PX.h);
  ctx.fillStyle = INK;

  fitAndDraw(ctx, job.companyName, TEXT.applicant);
  fitAndDraw(ctx, job.address, TEXT.address);
  fitAndDraw(ctx, job.tel, TEXT.tel);
  fitAndDraw(ctx, job.email, TEXT.email);
  fitAndDraw(ctx, job.contactPerson, TEXT.contact);
  fitAndDraw(ctx, job.fax, TEXT.fax);
  fitAndDraw(ctx, job.billTo, TEXT.billTo);
  fitAndDraw(ctx, job.billingAddress, TEXT.billing);

  fitAndDraw(ctx, sample.productDescription, TEXT.product);
  fitAndDraw(ctx, sample.sampleQuantity, TEXT.qty);
  fitAndDraw(ctx, sample.additionalInfo, TEXT.additional);
  fitAndDraw(ctx, sample.manufacturer, TEXT.manufacturer);
  fitAndDraw(ctx, sample.styleItemNo, TEXT.style);
  fitAndDraw(ctx, sample.countryOfOrigin, TEXT.origin);
  fitAndDraw(ctx, sample.poLotNo, TEXT.po);
  fitAndDraw(ctx, sample.countryOfDestination, TEXT.dest);
  fitAndDraw(ctx, sample.buyerAgent, TEXT.buyer);
  fitAndDraw(ctx, sample.othersReference, TEXT.others);
  fitAndDraw(ctx, formatFormDate(sample.productionDate), TEXT.prodDate);

  const t = sample.tests;
  maybeTick(ctx, t.shelfLife, BOX.shelfLife);
  if (t.shelfLife) fitAndDraw(ctx, formatFormDate(t.shelfLifeDate), TEXT.shelfLifeDate);

  maybeTick(ctx, t.tpc.on, BOX.tpc);
  methodsOf(t.tpc, "tpc", ctx);
  maybeTick(ctx, t.ecoli.on, BOX.ecoli);
  methodsOf(t.ecoli, "ecoli", ctx);
  maybeTick(ctx, t.coliform.on, BOX.coliform);
  methodsOf(t.coliform, "coliform", ctx);
  maybeTick(ctx, t.salmonella.on, BOX.salmonella);
  methodsOf(t.salmonella, "salmonella", ctx);
  maybeTick(ctx, t.staph.on, BOX.staph);
  methodsOf(t.staph, "staph", ctx);
  maybeTick(ctx, t.yeast.on, BOX.yeast);
  methodsOf(t.yeast, "yeast", ctx);
  maybeTick(ctx, t.clostridium.on, BOX.clostridium);
  methodsOf(t.clostridium, "clostridium", ctx);
  maybeTick(ctx, t.bacillus.on, BOX.bacillus);
  methodsOf(t.bacillus, "bacillus", ctx);
  maybeTick(ctx, t.vibrio.on, BOX.vibrio);
  methodsOf(t.vibrio, "vibrio", ctx);
  maybeTick(ctx, t.listeria.on, BOX.listeria);
  methodsOf(t.listeria, "listeria", ctx);
  maybeTick(ctx, t.otherMicro.on, BOX.otherMicro);
  if (t.otherMicro.on) fitAndDraw(ctx, t.otherMicro.specify, TEXT.otherMicroSpecify);

  maybeTick(ctx, t.nutritionLabeling, BOX.nutritionLabeling);
  maybeTick(ctx, t.panelRequested, BOX.panelRequested);
  maybeTick(ctx, t.nutritionRegion.includes("hk"), BOX.regionHk);
  maybeTick(ctx, t.nutritionRegion.includes("us"), BOX.regionUs);
  maybeTick(ctx, t.nutritionRegion.includes("china"), BOX.regionChina);
  maybeTick(ctx, t.nutritionRegion.includes("other"), BOX.regionOther);
  maybeTick(ctx, t.individualNutrition, BOX.individualNutrition);
  maybeTick(ctx, t.heavyMetal, BOX.heavyMetal);
  maybeTick(ctx, t.preservative, BOX.preservative);
  maybeTick(ctx, t.colour, BOX.colour);
  maybeTick(ctx, t.pesticide, BOX.pesticide);
  maybeTick(ctx, t.melamine, BOX.melamine);
  maybeTick(ctx, t.aflatoxin, BOX.aflatoxin);
  fitAndDraw(ctx, t.otherChemical, TEXT.otherChemical);

  maybeTick(ctx, sample.storage === "frozen", BOX.frozen);
  maybeTick(ctx, sample.storage === "refrigerated", BOX.refrigerated);
  maybeTick(ctx, sample.storage === "ambient", BOX.ambient);
  maybeTick(ctx, sample.storage === "other", BOX.storageOther);
  if (sample.storage === "other") fitAndDraw(ctx, sample.storageOther, TEXT.storageOther);

  fitAndDraw(ctx, formatFormDate(sample.clientSamplingDate), TEXT.clientDate);
  fitAndDraw(ctx, formatFormDate(sample.collectionDate), TEXT.sgsDate);
  if (sample.collectionAmpm) {
    fitAndDraw(ctx, sample.collectionAmpm, TEXT.ampm);
  }

  maybeTick(ctx, sample.samplingCondition === "original", BOX.original);
  maybeTick(ctx, sample.samplingCondition === "sterile", BOX.sterile);
  maybeTick(ctx, sample.samplingCondition === "other", BOX.samplingOther);
  if (sample.samplingCondition === "other") {
    fitAndDraw(ctx, sample.samplingOther, TEXT.samplingOther);
  }

  maybeTick(ctx, true, BOX.quotation);
  maybeTick(ctx, true, BOX.regular);
  maybeTick(ctx, true, BOX.separateSample);
}

export async function renderSampleCanvas(job: Job, sample: Sample): Promise<HTMLCanvasElement> {
  await document.fonts.ready.catch(() => undefined);
  const image = await loadFormImage();
  const canvas = document.createElement("canvas");
  paintForm(canvas, image, job, sample);
  return canvas;
}
