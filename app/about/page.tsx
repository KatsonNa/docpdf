import Link from "next/link";

export const metadata = { title: "About — DocPDF" };

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16" style={{ color: "var(--text-1)" }}>
      <Link href="/" style={{ color: "var(--accent)" }} className="text-sm">← Back</Link>
      <h1 className="text-3xl font-bold mt-6 mb-8">About DocPDF</h1>
      <div className="flex flex-col gap-6 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
        <p>DocPDF is a fast, private image-to-PDF converter that runs entirely in your browser. No accounts. No servers. No limits.</p>
        <p>Built with Next.js, jsPDF, and dnd-kit. Deployed on Vercel.</p>
        <p>Questions? <a href="mailto:hello@docpdf.app" style={{ color: "var(--accent)" }}>hello@docpdf.app</a></p>
      </div>
    </div>
  );
}