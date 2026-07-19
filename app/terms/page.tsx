import Link from "next/link";

export const metadata = { title: "Terms of Service — DocPDF" };

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16" style={{ color: "var(--text-1)" }}>
      <Link href="/" style={{ color: "var(--accent)" }} className="text-sm">← Back</Link>
      <h1 className="text-3xl font-bold mt-6 mb-8">Terms of Service</h1>
      <div className="flex flex-col gap-6 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
        <p>By using DocPDF you agree to use it only for lawful purposes. You are responsible for the content of the files you process.</p>
        <p>DocPDF is provided "as is" without warranty of any kind.</p>
        <p>We reserve the right to modify or discontinue the service at any time without notice.</p>
      </div>
    </div>
  );
}