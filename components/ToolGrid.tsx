import Link from "next/link";
import { FileImage, Merge, FileArchive, Images } from "lucide-react";

const TOOLS = [
  {
    href: "/",
    icon: FileImage,
    label: "Images → PDF",
    desc: "JPG, PNG, WEBP to PDF",
    color: "#e8a020",
  },
  {
    href: "/merge-pdf",
    icon: Merge,
    label: "Merge PDF",
    desc: "Combine PDFs into one",
    color: "#7c3aed",
  },
  {
    href: "/compress-pdf",
    icon: FileArchive,
    label: "Compress PDF",
    desc: "Reduce PDF file size",
    color: "#0891b2",
  },
  {
    href: "/pdf-to-jpg",
    icon: Images,
    label: "PDF → Images",
    desc: "Export pages as JPG/PNG",
    color: "#16a34a",
  },
];

export function ToolGrid() {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--text-1)" }}>
          All tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-col gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: t.color + "22" }}
              >
                <t.icon size={20} style={{ color: t.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                  {t.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                  {t.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
