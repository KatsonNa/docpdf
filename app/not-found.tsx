import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      style={{ background: "var(--bg)" }}>
      <p className="text-8xl font-bold" style={{ color: "var(--accent)" }}>404</p>
      <h1 className="text-2xl font-semibold" style={{ color: "var(--text-1)" }}>Page not found</h1>
      <p style={{ color: "var(--text-2)" }}>The page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-2.5 rounded-xl font-medium text-white"
        style={{ background: "var(--accent)" }}>
        Back to home
      </Link>
    </div>
  );
}