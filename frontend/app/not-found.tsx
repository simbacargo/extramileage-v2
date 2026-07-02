import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <span className="sun-dot inline-block" />
      <h1 className="font-display font-bold text-5xl text-ink mt-4">404</h1>
      <p className="text-muted mt-2 text-lg">We couldn&apos;t find that page.</p>
      <Link href="/" className="inline-block mt-6 bg-brand hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg">Back home</Link>
    </div>
  );
}
