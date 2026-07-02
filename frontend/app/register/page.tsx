"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { user, ready, register } = useAuth();
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
    const payload = Object.fromEntries(fd.entries()) as Record<string, string>;
    try {
      await register(payload);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  };

  const cls = "w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400";

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <span className="sun-dot inline-block" />
        <h1 className="font-display font-bold text-3xl text-ink mt-4">Create your account</h1>
        <p className="text-muted mt-1">Save vehicles, track inquiries and bid in live auctions.</p>
      </div>
      <form onSubmit={onSubmit} className="bg-surface sheet rounded-xl2 p-6 shadow-card grid sm:grid-cols-2 gap-4">
        {error && <div className="sm:col-span-2 bg-accent-50 border border-accent/30 text-accent-600 text-sm rounded-lg px-4 py-3">{error}</div>}
        <div className="sm:col-span-2"><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Username</label><input name="username" required className={cls} /></div>
        <div className="sm:col-span-2"><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Email</label><input type="email" name="email" required className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">First name</label><input name="first_name" className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Last name</label><input name="last_name" className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Phone</label><input name="phone" className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Country</label><input name="country" className={cls} /></div>
        <div className="sm:col-span-2"><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Password</label><input type="password" name="password" required minLength={8} className={cls} /><p className="text-[.7rem] text-muted mt-1">At least 8 characters.</p></div>
        <button disabled={busy} className="sm:col-span-2 bg-brand hover:bg-brand-600 text-white font-semibold py-3 rounded-lg disabled:opacity-60">{busy ? "Creating…" : "Create account"}</button>
        <p className="sm:col-span-2 text-center text-sm text-muted">Already registered? <Link href="/login" className="text-brand font-semibold hover:text-accent">Sign in</Link></p>
      </form>
    </div>
  );
}
