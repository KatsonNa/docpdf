"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/utils";
import type { ImageFile } from "@/lib/pdf";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

async function readFileMeta(file: File) {
  if (!ALLOWED.has(file.type)) return { url: "", width: 0, height: 0, error: "Only JPEG, PNG and WEBP are supported." };
  if (file.size > MAX_BYTES) return { url: "", width: 0, height: 0, error: "Exceeds 20 MB limit." };

  const url = URL.createObjectURL(file);
  const { width, height } = await new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });

  if (!width || !height) {
    URL.revokeObjectURL(url);
    return { url: "", width: 0, height: 0, error: "File appears to be corrupted." };
  }
  return { url, width, height };
}

export function useImageFiles() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);

  const addFiles = useCallback(async (incoming: File[]) => {
    setLoading(true);
    for (const file of incoming) {
      const meta = await readFileMeta(file);
      const entry: ImageFile = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        sizeBytes: file.size,
        url: meta.url,
        width: meta.width,
        height: meta.height,
        error: meta.error,
      };
      if (meta.error) toast.error(`${file.name}: ${meta.error}`);
      else toast.success(`Added ${file.name} (${formatBytes(file.size)})`);
      setFiles((prev) => [...prev, entry]);
    }
    setLoading(false);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const reorder = useCallback((activeId: string, overId: string) => {
    setFiles((prev) => {
      const from = prev.findIndex((f) => f.id === activeId);
      const to = prev.findIndex((f) => f.id === overId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setFiles((prev) => { prev.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); }); return []; });
  }, []);

  return { files, loading, addFiles, removeFile, reorder, clear };
}