import Link from "next/link";

export const metadata = { title: "Privacy Policy — DocPDF" };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16" style={{ color: "var(--text-1)" }}>
      <Link href="/" style={{ color: "var(--accent)" }} className="text-sm">← Back</Link>
      <h1 className="text-3xl font-bold mt-6 mb-8">Privacy Policy</h1>
      <div className="flex flex-col gap-6 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
        <p><strong style={{ color: "var(--text-1)" }}>No data leaves your device.</strong> DocPDF processes all images entirely within your browser. We do not upload, store, or transmit your files to any server.</p>
        <p><strong style={{ color: "var(--text-1)" }}>Analytics.</strong> We use Google Analytics to collect anonymised usage statistics. No personally identifiable information is collected.</p>
        <p><strong style={{ color: "var(--text-1)" }}>Cookies.</strong> A single cookie is used to remember your cookie consent choice.</p>
        <p><strong style={{ color: "var(--text-1)" }}>Contact.</strong> <a href="mailto:hello@docpdf.app" style={{ color: "var(--accent)" }}>hello@docpdf.app</a></p>
      </div>
    </div>
  );
}