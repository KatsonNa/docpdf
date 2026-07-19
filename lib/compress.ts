import { PDFDocument } from "pdf-lib";

export type CompressLevel = "low" | "medium" | "high";

const QUALITY: Record<CompressLevel, { scale: number; jpegQ: number }> = {
  low:    { scale: 1.5, jpegQ: 0.85 },
  medium: { scale: 1.2, jpegQ: 0.72 },
  high:   { scale: 0.9, jpegQ: 0.55 },
};

export async function compressPdf(
  file: File,
  level: CompressLevel = "medium",
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const { scale, jpegQ } = QUALITY[level];

  // Lazy import pdfjs to avoid SSR issues (DOMMatrix not defined in Node)
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuf = await file.arrayBuffer();
  const pdfJs = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf) }).promise;
  const totalPages = pdfJs.numPages;
  const output = await PDFDocument.create();

  for (let p = 1; p <= totalPages; p++) {
    const page     = await pdfJs.getPage(p);
    const viewport = page.getViewport({ scale });

    const canvas    = document.createElement("canvas");
    canvas.width    = Math.round(viewport.width);
    canvas.height   = Math.round(viewport.height);
    const ctx       = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise;

    const dataUrl  = canvas.toDataURL("image/jpeg", jpegQ);
    const base64   = dataUrl.split(",")[1];
    const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

    const jpgImage = await output.embedJpg(imgBytes);
    const pdfPage  = output.addPage([viewport.width, viewport.height]);
    pdfPage.drawImage(jpgImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });

    onProgress?.(Math.round((p / totalPages) * 100));
  }

  const bytes = await output.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export function estimateSavings(level: CompressLevel): string {
  return { low: "10–30%", medium: "30–60%", high: "50–80%" }[level];
}
