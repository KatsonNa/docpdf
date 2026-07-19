"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, FileDown, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DropZone } from "@/components/DropZone";
import { ImageList } from "@/components/ImageList";
import { PdfSettingsPanel } from "@/components/PdfSettingsPanel";
import { HowItWorks } from "@/components/HowItWorks";
import { ToolGrid } from "@/components/ToolGrid";
import { useImageFiles } from "@/hooks/useImageFiles";
import { buildPdf, type PdfSettings } from "@/lib/pdf";

const DEFAULT_SETTINGS: PdfSettings = {
  pageSize: "A4",
  orientation: "portrait",
  marginMm: 10,
  fitToPage: true,
};

export default function Home() {
  const { files, loading, addFiles, removeFile, reorder, clear } = useImageFiles();
  const [settings, setSettings] = useState<PdfSettings>(DEFAULT_SETTINGS);
  const [converting, setConverting] = useState(false);

  const validFiles = files.filter((f) => !f.error);
  const hasFiles = files.length > 0;

  const handleConvert = useCallback(async () => {
    if (!validFiles.length) { toast.error("No valid images to convert."); return; }
    setConverting(true);
    const tid = toast.loading(`Building PDF from ${validFiles.length} image${validFiles.length !== 1 ? "s" : ""}…`);
    try {
      const blob = await buildPdf(validFiles, settings);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "converted.pdf"; a.click();
      URL.revokeObjectURL(url);
      toast.success(`PDF ready — ${validFiles.length} page${validFiles.length !== 1 ? "s" : ""}, ${(blob.size / 1024).toFixed(0)} KB`, { id: tid });
    } catch (err) {
      toast.error(`Conversion failed: ${err instanceof Error ? err.message : "Unknown error"}`, { id: tid });
    } finally { setConverting(false); }
  }, [validFiles, settings]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3" style={{ color: "var(--text-1)" }}>
            Images to PDF, <span style={{ color: "var(--accent)" }}>instantly</span>
          </h1>
          <p className="text-base sm:text-lg" style={{ color: "var(--text-2)" }}>
            JPEG, PNG & WEBP to polished PDF in seconds. No account. No upload. Runs in your browser.
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm"
            style={{ background: "var(--success-dim)", color: "var(--success)" }}>
            <ShieldCheck size={15} />
            Files never leave your device
          </div>
        </div>

        {/* Converter */}
        {!hasFiles ? (
          <DropZone onFiles={addFiles} disabled={loading} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left: image list */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  {files.length} image{files.length !== 1 ? "s" : ""}
                  <span style={{ color: "var(--success)" }}> · {validFiles.length} valid</span>
                  {files.length !== validFiles.length && (
                    <span style={{ color: "var(--danger)" }}> · {files.length - validFiles.length} skipped</span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                    <Plus size={14} /> Add more
                    <input type="file" className="sr-only" multiple accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => { if (e.target.files) addFiles([...e.target.files]); e.target.value = ""; }} />
                  </label>
                  <button onClick={clear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                    style={{ background: "var(--danger-dim)", border: "1px solid var(--danger)", color: "var(--danger)" }}>
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
              </div>
              <div onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const dropped = [...e.dataTransfer.files].filter((f) => ["image/jpeg","image/png","image/webp"].includes(f.type)); if (dropped.length) addFiles(dropped); }}>
                <ImageList files={files} onRemove={removeFile} onReorder={reorder} />
              </div>
            </div>

            {/* Right: settings + convert */}
            <div className="w-full lg:w-72 flex flex-col gap-4 lg:sticky lg:top-20">
              <PdfSettingsPanel settings={settings} onChange={setSettings} />
              <button onClick={handleConvert} disabled={converting || !validFiles.length}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-semibold transition-all"
                style={{
                  background: validFiles.length ? "var(--accent)" : "var(--bg-2)",
                  color: validFiles.length ? "#fff" : "var(--text-3)",
                  cursor: validFiles.length && !converting ? "pointer" : "not-allowed",
                  boxShadow: validFiles.length ? "0 4px 14px 0 rgb(232 160 32 / .35)" : "none",
                }}>
                {converting
                  ? <><Loader2 size={18} className="animate-spin" /> Building PDF…</>
                  : <><FileDown size={18} /> Convert to PDF</>}
              </button>
              <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
                {validFiles.length} page{validFiles.length !== 1 ? "s" : ""} · {settings.pageSize} {settings.orientation}
              </p>
            </div>
          </div>
        )}

        <ToolGrid />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}