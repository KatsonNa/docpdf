"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }} className="sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-semibold text-base" style={{ color: "var(--text-1)" }}>
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <FileText size={15} color="#fff" strokeWidth={2.2} />
          </span>
          Doc<span style={{ color: "var(--accent)" }}>PDF</span>
        </a>
        <div className="flex items-center gap-2">
          <a href="#how" className="hidden sm:block text-sm px-3 py-1.5 rounded-lg" style={{ color: "var(--text-2)" }}>How it works</a>
          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}
              aria-label="Toggle dark mode">
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}