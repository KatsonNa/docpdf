"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { FileArchive, Upload, Loader2, FileDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { compressPdf, estimateSavings, type CompressLevel } from "@/lib/compress";
import { triggerDownload } from "@/lib/zip";
import { formatBytes } from "@/lib/utils";

const LEVELS: { value: CompressLevel; label: string; desc: string }[] = [
  { value: "low",    label: "Low",    desc: "Best quality, smaller savings" },
  { value: "medium", label: "Medium", desc: "Balanced — recommended" },
  { value: "high",   label: "High",   desc: "Smallest file, lower quality" },
];

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>("medium");
  const [progress, setProgress] = useState(0);
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; originalSize: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { toast.error("Only PDF files are accepted."); return; }
    setFile(f); setResult(null); setProgress(0);
  };

  const handleCompress = async () => {
    if (!file) return;
    setCompressing(true); setProgress(0);
    const tid = toast.loading("Compressing PDF…");
    try {
      const blob = await compressPdf(file, level, setProgress);
      setResult({ blob, originalSize: file.size });
      toast.success(`Compressed! ${formatBytes(file.size)} → ${formatBytes(blob.size)}`, { id: tid });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compression failed", { id: tid });
    } finally { setCompressing(false); }
  };

  const saving = result
    ? Math.max(0, Math.round((1 - result.blob.size / result.originalSize) * 100))
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{ background: "var(--accent-dim)" }}>
            <FileArchive size={28} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-1)" }}>Compress PDF</h1>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Reduce PDF file size. Runs entirely in your browser — no upload needed.
          </p>
        </div>

        {/* Drop zone */}
        {!file ? (
          <div className="rounded-2xl p-10 text-center cursor-pointer mb-6 transition-colors"
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
            <FileArchive size={24} style={{ color: "var(--accent)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>{file.name}</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>{formatBytes(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setResult(null); }}
              className="text-sm px-3 py-1.5 rounded-lg" style={{ color: "var(--text-3)", background: "var(--bg-2)" }}>
              Change
            </button>
          </div>
        )}

        {/* Level selector */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-1)" }}>Compression level</p>
          <div className="flex flex-col gap-2">
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setLevel(l.value)}
                className="flex items-center justify-between p-3 rounded-xl text-left transition-all"
                style={{
                  background: level === l.value ? "var(--accent-dim)" : "var(--bg-2)",
                  border: `1px solid ${level === l.value ? "var(--accent)" : "var(--border)"}`,
                }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: level === l.value ? "var(--accent-text)" : "var(--text-1)" }}>
                    {l.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{l.desc}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ background: "var(--accent)", color: "#fff" }}>
                  ~{estimateSavings(l.value)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        {compressing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "var(--text-2)" }}>Compressing…</span>
              <span style={{ color: "var(--text-3)" }}>{progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--accent)" }} />
            </div>
          </div>
        )}

        {/* Result */}
        {result && !compressing && (
          <div className="rounded-2xl p-5 mb-6 text-center"
            style={{ background: "var(--success-dim)", border: "1px solid var(--success)" }}>
            <p className="text-lg font-bold" style={{ color: "var(--success)" }}>
              {saving !== null && saving > 0 ? `${saving}% smaller` : "File compressed"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
              {formatBytes(result.originalSize)} → {formatBytes(result.blob.size)}
            </p>
            <button onClick={() => triggerDownload(result.blob, "compressed.pdf")}
              className="flex items-center gap-2 mx-auto mt-4 px-6 py-2.5 rounded-xl font-semibold text-white"
              style={{ background: "var(--success)" }}>
              <FileDown size={16} /> Download compressed PDF
            </button>
          </div>
        )}

        {/* Compress button */}
        {!result && (
          <button onClick={handleCompress} disabled={!file || compressing}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-semibold"
            style={{
              background: file ? "var(--accent)" : "var(--bg-2)",
              color: file ? "#fff" : "var(--text-3)",
              boxShadow: file ? "0 4px 14px 0 rgb(232 160 32 / .35)" : "none",
              cursor: file && !compressing ? "pointer" : "not-allowed",
            }}>
            {compressing ? <><Loader2 size={18} className="animate-spin" /> Compressing…</> : <><FileArchive size={18} /> Compress PDF</>}
          </button>
        )}
      </main>
      <Footer />
    </div>
  );
}
