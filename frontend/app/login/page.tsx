"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await login(String(fd.get("username")), String(fd.get("password")));
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect username or password.");
    } finally {
      setBusy(false);
    }
  };

  const cls = "w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400";

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <span className="sun-dot inline-block" />
        <h1 className="font-display font-bold text-3xl text-ink mt-4">Welcome back</h1>
        <p className="text-muted mt-1">Sign in to manage saved vehicles and bids.</p>
      </div>
      <form onSubmit={onSubmit} className="bg-surface sheet rounded-xl2 p-6 shadow-card space-y-4">
        {error && <div className="bg-accent-50 border border-accent/30 text-accent-600 text-sm rounded-lg px-4 py-3">{error}</div>}
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Username</label><input name="username" required className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Password</label><input name="password" type="password" required className={cls} /></div>
        <button disabled={busy} className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-3 rounded-lg disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-center text-sm text-muted">No account? <Link href="/register" className="text-brand font-semibold hover:text-accent">Create one</Link></p>
      </form>
    </div>
  );
}
