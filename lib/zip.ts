import JSZip from "jszip";

export interface ZipEntry {
  filename: string;
  blob: Blob;
}

export async function downloadAsZip(entries: ZipEntry[], zipName = "docpdf-export.zip"): Promise<void> {
  const zip = new JSZip();
  for (const e of entries) {
    zip.file(e.filename, e.blob);
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  triggerDownload(blob, zipName);
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
