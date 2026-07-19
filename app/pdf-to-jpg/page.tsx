"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Images, Upload, Loader2, Download, Archive } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { pdfToImages, type RenderedPage, type ImageOutputFormat } from "@/lib/pdfToImages";
import { downloadAsZip, triggerDownload } from "@/lib/zip";
import { formatBytes } from "@/lib/utils";

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageOutputFormat>("jpeg");
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [progress, setProgress] = useState(0);
  const [converting, setConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Only PDF files are accepted."); return; }
    setFile(f); setPages([]);
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true); setProgress(0); setPages([]);
    const tid = toast.loading("Converting PDF to images…");
    try {
      const result = await pdfToImages(file, format, 2, 0.92, setProgress);
      setPages(result);
      toast.success(`${result.length} page${result.length !== 1 ? "s" : ""} converted`, { id: tid });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed", { id: tid });
    } finally { setConverting(false); }
  };

  const downloadAll = async () => {
    const ext = format === "png" ? "png" : "jpg";
    const entries = pages.map((p, i) => ({
      filename: `page-${String(i + 1).padStart(3, "0")}.${ext}`,
      blob: p.blob,
    }));
    await downloadAsZip(entries, `${file?.name.replace(/\.pdf$/i, "") ?? "pages"}.zip`);
  };

  const downloadSingle = (p: RenderedPage) => {
    const ext = format === "png" ? "png" : "jpg";
    triggerDownload(p.blob, `page-${p.pageNumber}.${ext}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{ background: "var(--accent-dim)" }}>
            <Images size={28} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-1)" }}>PDF to JPG</h1>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Convert each PDF page to an image. Runs in your browser.
          </p>
        </div>

        {/* Drop zone */}
        {!file ? (
          <div className="rounded-2xl p-10 text-center cursor-pointer mb-6"
            style={{ border: "2px dashed var(--border-2)", background: "var(--surface)" }}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
            <Upload size={32} className="mx-auto mb-3" style={{ color: "var(--text-3)" }} />
            <p className="font-medium" style={{ color: "var(--text-1)" }}>Drop a PDF here</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>or click to browse</p>
            <input ref={inputRef} type="file" className="sr-only" accept="application/pdf"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          </div>
        ) : (
          <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Images size={24} style={{ color: "var(--accent)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>{formatBytes(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setPages([]); }}
              className="text-sm px-3 py-1.5 rounded-lg" style={{ color: "var(--text-3)", background: "var(--bg-2)" }}>
              Change
            </button>
          </div>
        )}

        {/* Format selector */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-1)" }}>Output format</p>
          <div className="flex gap-3">
            {(["jpeg", "png"] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: format === f ? "var(--accent)" : "var(--bg-2)",
                  color: format === f ? "#fff" : "var(--text-2)",
                  border: `1px solid ${format === f ? "var(--accent)" : "var(--border)"}`,
                }}>
                {f.toUpperCase()}
                <span className="block text-xs font-normal mt-0.5 opacity-75">
                  {f === "jpeg" ? "Smaller file" : "Transparent bg"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        {converting && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--text-2)" }}>Converting pages…</span>
              <span style={{ color: "var(--text-3)" }}>{progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--accent)" }} />
            </div>
          </div>
        )}

        {/* Results grid */}
        {pages.length > 0 && !converting && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                {pages.length} page{pages.length !== 1 ? "s" : ""} converted
              </p>
              <button onClick={downloadAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--accent)", boxShadow: "0 4px 14px 0 rgb(232 160 32 / .35)" }}>
                <Archive size={15} /> Download all as ZIP
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {pages.map(p => (
                <div key={p.pageNumber} className="rounded-xl overflow-hidden group relative"
                  style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                  <img src={URL.createObjectURL(p.blob)} alt={`Page ${p.pageNumber}`}
                    className="w-full object-contain" style={{ maxHeight: 200 }} />
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--text-3)" }}>
                      Page {p.pageNumber} · {formatBytes(p.blob.size)}
                    </span>
                    <button onClick={() => downloadSingle(p)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: "var(--text-3)", background: "var(--bg-2)" }}>
                      <Download size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Convert button */}
        {pages.length === 0 && (
          <button onClick={handleConvert} disabled={!file || converting}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-semibold"
            style={{
              background: file ? "var(--accent)" : "var(--bg-2)",
              color: file ? "#fff" : "var(--text-3)",
              boxShadow: file ? "0 4px 14px 0 rgb(232 160 32 / .35)" : "none",
              cursor: file && !converting ? "pointer" : "not-allowed",
            }}>
            {converting ? <><Loader2 size={18} className="animate-spin" /> Converting…</> : <><Images size={18} /> Convert to Images</>}
          </button>
        )}
      </main>
      <Footer />
    </div>
  );
}
