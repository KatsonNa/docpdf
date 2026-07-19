"use client";

import type { PdfSettings, PageSize, Orientation } from "@/lib/pdf";

export function PdfSettingsPanel({ settings, onChange }: { settings: PdfSettings; onChange: (s: PdfSettings) => void }) {
  const s = settings;
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>PDF settings</p>

      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-3)" }}>Page size</p>
        <div className="flex gap-2">
          {(["A4", "Letter"] as PageSize[]).map(sz => (
            <button key={sz} onClick={() => onChange({ ...s, pageSize: sz })} className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
              style={{ background: s.pageSize === sz ? "var(--accent)" : "var(--bg-2)", color: s.pageSize === sz ? "#fff" : "var(--text-2)", border: `1px solid ${s.pageSize === sz ? "var(--accent)" : "var(--border)"}` }}>
              {sz}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-3)" }}>Orientation</p>
        <div className="flex gap-2">
          {(["portrait", "landscape"] as Orientation[]).map(o => (
            <button key={o} onClick={() => onChange({ ...s, orientation: o })} className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize"
              style={{ background: s.orientation === o ? "var(--accent)" : "var(--bg-2)", color: s.orientation === o ? "#fff" : "var(--text-2)", border: `1px solid ${s.orientation === o ? "var(--accent)" : "var(--border)"}` }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-3)" }}>Margin</p>
          <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>{s.marginMm} mm</span>
        </div>
        <input type="range" min={0} max={40} step={1} value={s.marginMm}
          onChange={(e) => onChange({ ...s, marginMm: +e.target.value })}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, var(--accent) ${(s.marginMm / 40) * 100}%, var(--bg-2) 0%)` }} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>Fit to page</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Scale image to fill available area</p>
        </div>
        <button role="switch" aria-checked={s.fitToPage} onClick={() => onChange({ ...s, fitToPage: !s.fitToPage })}
          className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
          style={{ background: s.fitToPage ? "var(--accent)" : "var(--bg-2)", border: "1px solid var(--border)" }}>
          <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: `translateX(${s.fitToPage ? "21px" : "2px"})` }} />
        </button>
      </div>
    </div>
  );
}