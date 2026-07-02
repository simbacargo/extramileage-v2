"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiSend } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const { user, ready, token, refreshUser } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  const cls = "w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const updated = await apiSend<User>("/auth/me/", "PATCH", payload, token);
      refreshUser(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display font-bold text-3xl text-ink mb-6">Your profile</h1>
      <form onSubmit={onSubmit} className="bg-surface sheet rounded-xl2 p-6 shadow-card grid sm:grid-cols-2 gap-4">
        {error && <div className="sm:col-span-2 bg-accent-50 border border-accent/30 text-accent-600 text-sm rounded-lg px-4 py-3">{error}</div>}
        {saved && <div className="sm:col-span-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">Profile updated.</div>}
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Username</label><input defaultValue={user.username} disabled className={`${cls} opacity-60`} /></div>
        <div className="sm:col-span-2"><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Email</label><input name="email" type="email" defaultValue={user.email} className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">First name</label><input name="first_name" defaultValue={user.first_name} className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Last name</label><input name="last_name" defaultValue={user.last_name} className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Phone</label><input name="phone" defaultValue={user.phone} className={cls} /></div>
        <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Country</label><input name="country" defaultValue={user.country} className={cls} /></div>
        <button disabled={busy} className="sm:col-span-2 bg-brand hover:bg-brand-600 text-white font-semibold py-3 rounded-lg disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
      </form>
    </div>
  );
}
