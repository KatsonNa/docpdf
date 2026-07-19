"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud, ImagePlus } from "lucide-react";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFiles, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = [...e.dataTransfer.files].filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (files.length) onFiles(files);
  }, [onFiles, disabled]);

  return (
    <div
      role="button" tabIndex={0} aria-label="Drop images here or click to choose files"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="relative rounded-2xl transition-all duration-200 cursor-pointer select-none flex flex-col items-center justify-center gap-4 py-16 px-8 text-center"
      style={{
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-2)"}`,
        background: dragging ? "var(--accent-dim)" : "var(--surface)",
      }}
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: dragging ? "var(--accent)" : "var(--bg-2)", color: dragging ? "#fff" : "var(--text-3)" }}>
        <UploadCloud size={28} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-lg font-medium" style={{ color: "var(--text-1)" }}>
          {dragging ? "Release to add images" : "Drop images here"}
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>JPEG, PNG and WEBP · up to 20 MB each</p>
      </div>
      <button type="button" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
        style={{ background: "var(--accent)", color: "#fff" }} tabIndex={-1}>
        <ImagePlus size={15} /> Choose files
      </button>
      <input ref={inputRef} type="file" className="sr-only" multiple accept="image/jpeg,image/png,image/webp"
        onChange={(e) => { if (e.target.files) onFiles([...e.target.files]); e.target.value = ""; }} />
    </div>
  );
}