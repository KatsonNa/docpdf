import { Upload, Settings, Download } from "lucide-react";

const STEPS = [
  { icon: Upload, title: "Add your images", desc: "Drop JPEG, PNG or WEBP files onto the page, or click to browse. Drag to reorder." },
  { icon: Settings, title: "Set your options", desc: "Choose page size, orientation, and margins. Everything runs in your browser." },
  { icon: Download, title: "Download the PDF", desc: "One click. Your PDF is built locally — nothing is uploaded to any server." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-semibold text-center mb-12" style={{ color: "var(--text-1)" }}>How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={i} className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-dim)" }}>
                  <step.icon size={18} style={{ color: "var(--accent)" }} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Step {i + 1}</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-1)" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}