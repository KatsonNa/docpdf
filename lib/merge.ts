import { PDFDocument } from "pdf-lib";

export interface MergeFile {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount?: number;
  error?: string;
}

/** Read page count from a PDF file */
export async function getPdfPageCount(file: File): Promise<number> {
  const buf = await file.arrayBuffer();
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
  return doc.getPageCount();
}

/** Merge multiple PDF files into one Blob */
export async function mergePdfs(files: MergeFile[]): Promise<Blob> {
  const valid = files.filter((f) => !f.error);
  if (valid.length === 0) throw new Error("No valid PDF files to merge.");
  if (valid.length === 1) {
    // Nothing to merge — just return the single file
    return valid[0].file;
  }

  const merged = await PDFDocument.create();

  for (const mf of valid) {
    const buf = await mf.file.arrayBuffer();
    let src: PDFDocument;
    try {
      src = await PDFDocument.load(buf, { ignoreEncryption: true });
    } catch {
      throw new Error(`Could not read "${mf.name}". It may be password-protected or corrupt.`);
    }
    const indices = src.getPageIndices();
    const pages = await merged.copyPages(src, indices);
    pages.forEach((p) => merged.addPage(p));
  }

  const bytes = await merged.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
