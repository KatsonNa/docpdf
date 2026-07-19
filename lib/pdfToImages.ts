export type ImageOutputFormat = "jpeg" | "png";

export interface RenderedPage {
  pageNumber: number;
  blob: Blob;
  width: number;
  height: number;
}

export async function pdfToImages(
  file: File,
  format: ImageOutputFormat = "jpeg",
  scale = 2,
  quality = 0.92,
  onProgress?: (pct: number) => void
): Promise<RenderedPage[]> {
  // Lazy import to avoid SSR DOMMatrix error
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const buf  = await file.arrayBuffer();
  const pdf  = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const total = pdf.numPages;
  const results: RenderedPage[] = [];

  for (let p = 1; p <= total; p++) {
    const page     = await pdf.getPage(p);
    const viewport = page.getViewport({ scale });

    const canvas    = document.createElement("canvas");
    canvas.width    = Math.round(viewport.width);
    canvas.height   = Math.round(viewport.height);
    const ctx       = canvas.getContext("2d")!;

    await page.render({ canvasContext: ctx, viewport, canvas } as Parameters<typeof page.render>[0]).promise;

    const mime = format === "png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), mime, quality)
    );

    results.push({ pageNumber: p, blob, width: canvas.width, height: canvas.height });
    onProgress?.(Math.round((p / total) * 100));
  }

  return results;
}
