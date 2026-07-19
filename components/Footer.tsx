import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 py-10 border-t text-sm" style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText size={16} style={{ color: "var(--accent)" }} />
          <span style={{ color: "var(--text-2)" }}>Doc<strong style={{ color: "var(--accent)" }}>PDF</strong></span>
          <span>· Files never leave your browser</span>
        </div>
        <div className="flex gap-5">
          <a href="/privacy" style={{ color: "var(--text-3)" }} className="hover:underline">Privacy</a>
          <a href="/terms" style={{ color: "var(--text-3)" }} className="hover:underline">Terms</a>
          <a href="/about" style={{ color: "var(--text-3)" }} className="hover:underline">About</a>
        </div>
      </div>
    </footer>
  );
}