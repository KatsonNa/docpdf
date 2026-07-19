import { jsPDF } from "jspdf";

export type PageSize = "A4" | "Letter";
export type Orientation = "portrait" | "landscape";

// Supported input types — extended for WEBP
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPT_ATTR = "image/jpeg,image/png,image/webp";

export interface ImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  error?: string;
}

export interface PdfSettings {
  pageSize: PageSize;
  orientation: Orientation;
  marginMm: number;
  fitToPage: boolean;
}

const PAGE_DIMS: Record<PageSize, [number, number]> = {
  A4:     [210, 297],
  Letter: [215.9, 279.4],
};

export async function buildPdf(
  images: ImageFile[],
  settings: PdfSettings
): Promise<Blob> {
  const valid = images.filter((i) => !i.error);
  if (valid.length === 0) throw new Error("No valid images to convert.");

  const [pw, ph] = PAGE_DIMS[settings.pageSize];
  const [pageW, pageH] =
    settings.orientation === "landscape" ? [ph, pw] : [pw, ph];

  const doc = new jsPDF({
    orientation: settings.orientation,
    unit: "mm",
    format: settings.pageSize === "Letter" ? [pageW, pageH] : settings.pageSize,
  });

  const m = settings.marginMm;
  const availW = pageW - m * 2;
  const availH = pageH - m * 2;

  for (let i = 0; i < valid.length; i++) {
    if (i > 0) doc.addPage();

    const img = valid[i];
    const imgEl = await loadImage(img.url);

    let drawW = availW;
    let drawH = availH;

    if (settings.fitToPage) {
      const ratio = imgEl.naturalWidth / imgEl.naturalHeight;
      const fitByWidth = availW / ratio <= availH;
      drawW = fitByWidth ? availW : availH * ratio;
      drawH = fitByWidth ? availW / ratio : availH;
    } else {
      const pxToMm = 0.264583;
      drawW = Math.min(imgEl.naturalWidth * pxToMm, availW);
      drawH = Math.min(imgEl.naturalHeight * pxToMm, availH);
    }

    const x = m + (availW - drawW) / 2;
    const y = m + (availH - drawH) / 2;

    // WEBP → convert to JPEG via canvas before adding
    const { dataUrl, fmt } = await toJpegIfNeeded(imgEl, img.file.type);
    doc.addImage(dataUrl, fmt, x, y, drawW, drawH, undefined, "FAST");
  }

  return doc.output("blob");
}

/** jsPDF doesn't support WEBP natively — bounce through canvas */
async function toJpegIfNeeded(
  imgEl: HTMLImageElement,
  mimeType: string
): Promise<{ dataUrl: string; fmt: string }> {
  if (mimeType === "image/png") return { dataUrl: imgEl.src, fmt: "PNG" };
  if (mimeType === "image/jpeg") return { dataUrl: imgEl.src, fmt: "JPEG" };

  // WEBP (or anything else) → JPEG via canvas
  const canvas = document.createElement("canvas");
  canvas.width = imgEl.naturalWidth;
  canvas.height = imgEl.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imgEl, 0, 0);
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.92), fmt: "JPEG" };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
