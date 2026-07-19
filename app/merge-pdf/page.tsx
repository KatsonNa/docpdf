"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { FileText, Plus, Trash2, GripVertical, X, Loader2, FileDown } from "lucide-react";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { mergePdfs, getPdfPageCount, type MergeFile } from "@/lib/merge";
import { triggerDownload } from "@/lib/zip";
import { formatBytes } from "@/lib/utils";

function SortableRow({ item, onRemove }: { item: MergeFile; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}>
      <div className="flex items-center gap-3 w-full rounded-xl p-3"
        style={{ background: "var(--surface)", border: `1px solid ${item.error ? "var(--danger)" : "var(--border)"}`, boxShadow: "var(--shadow-sm)" }}>
        <button className="cursor-grab p-1 touch-none" style={{ color: "var(--text-3)" }} {...attributes} {...listeners}>
          <GripVertical size={18} />
        </button>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: item.error ? "var(--danger-dim)" : "var(--accent-dim)" }}>
          <FileText size={18} style={{ color: item.error ? "var(--danger)" : "var(--accent)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>{item.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            {formatBytes(item.sizeBytes)}{item.pageCount ? ` · ${item.pageCount} page${item.pageCount !== 1 ? "s" : ""}` : ""}
          </p>
          {item.error && <p className="text-xs mt-0.5" style={{ color: "var(--danger)" }}>{item.error}</p>}
        </div>
        <button onClick={() => onRemove(item.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--danger-dim)"; e.currentTarget.style.color = "var(--danger)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
}

export default function MergePdfPage() {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [merging, setMerging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addFiles = useCallback(async (incoming: File[]) => {
    const pdfs = incoming.filter(f => f.type === "application/pdf");
    if (pdfs.length !== incoming.length) toast.error("Only PDF files are accepted.");
    for (const f of pdfs) {
      let pageCount: number | undefined;
      let error: string | undefined;
      try { pageCount = await getPdfPageCount(f); }
      catch { error = "Could not read this PDF (may be encrypted)."; }
      setFiles(prev => [...prev, {
        id: crypto.randomUUID(), file: f, name: f.name,
        sizeBytes: f.size, pageCount, error,
      }]);
    }
  }, []);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setFiles(prev => {
      const from = prev.findIndex(f => f.id === active.id);
      const to = prev.findIndex(f => f.id === over.id);
      const next = [...prev];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  };

  const handleMerge = async () => {
    setMerging(true);
    const tid = toast.loading("Merging PDFs…");
    try {
      const blob = await mergePdfs(files);
      triggerDownload(blob, "merged.pdf");
      toast.success(`Done — ${files.filter(f => !f.error).length} PDFs merged`, { id: tid });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Merge failed", { id: tid });
    } finally { setMerging(false); }
  };

  const valid = files.filter(f => !f.error);
  const totalPages = files.reduce((s, f) => s + (f.pageCount ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{ background: "var(--accent-dim)" }}>
            <FileText size={28} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-1)" }}>Merge PDF</h1>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>Combine multiple PDFs into one. Drag to reorder.</p>
        </div>

        <div className="rounded-2xl p-10 text-center cursor-pointer mb-6"
          style={{ border: "2px dashed var(--border-2)", background: "var(--surface)" }}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); addFiles([...e.dataTransfer.files]); }}>
          <FileText size={32} className="mx-auto mb-3" style={{ color: "var(--text-3)" }} />
          <p className="font-medium" style={{ color: "var(--text-1)" }}>Drop PDF files here</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>or click to browse</p>
          <input ref={inputRef} type="file" className="sr-only" multiple accept="application/pdf"
            onChange={e => { if (e.target.files) addFiles([...e.target.files]); e.target.value = ""; }} />
        </div>

        {files.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                {files.length} file{files.length !== 1 ? "s" : ""} · {totalPages} pages total
              </p>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm cursor-pointer"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
                  <Plus size={14} /> Add more
                  <input type="file" className="sr-only" multiple accept="application/pdf"
                    onChange={e => { if (e.target.files) addFiles([...e.target.files]); e.target.value = ""; }} />
                </label>
                <button onClick={() => setFiles([])}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: "var(--danger-dim)", border: "1px solid var(--danger)", color: "var(--danger)" }}>
                  <Trash2 size={14} /> Clear
                </button>
              </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2 mb-6">
                  {files.map(f => (
                    <SortableRow key={f.id} item={f} onRemove={id => setFiles(p => p.filter(x => x.id !== id))} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button onClick={handleMerge} disabled={merging || valid.length < 2}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-semibold"
              style={{
                background: valid.length >= 2 ? "var(--accent)" : "var(--bg-2)",
                color: valid.length >= 2 ? "#fff" : "var(--text-3)",
                boxShadow: valid.length >= 2 ? "0 4px 14px 0 rgb(232 160 32 / .35)" : "none",
                cursor: valid.length >= 2 && !merging ? "pointer" : "not-allowed",
              }}>
              {merging
                ? <><Loader2 size={18} className="animate-spin" /> Merging…</>
                : <><FileDown size={18} /> Merge & Download</>}
            </button>
            {valid.length < 2 && (
              <p className="text-xs text-center mt-2" style={{ color: "var(--text-3)" }}>Add at least 2 valid PDFs</p>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}