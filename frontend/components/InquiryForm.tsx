"use client";

import { useState } from "react";
import { apiSend } from "@/lib/api";

interface Props {
  carId?: number;
  subject?: string;
  defaultMessage?: string;
  columns?: boolean;
}

export default function InquiryForm({ carId, subject = "", defaultMessage = "", columns = true }: Props) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (sent) {
    return (
      <div className="bg-surface sheet rounded-xl2 p-8 text-center">
        <p className="font-display font-semibold text-xl text-ink">Thank you — message sent.</p>
        <p className="text-muted mt-2">Our team will get back to you within one business day.</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(fd.entries());
    if (carId) payload.car = carId;
    try {
      await apiSend("/inquiries/", "POST", payload);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const cls = "w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400";
  const grid = columns ? "grid sm:grid-cols-2 gap-4" : "space-y-4";

  return (
    <form onSubmit={onSubmit} className={`bg-surface sheet rounded-xl2 p-6 ${grid}`}>
      {error && <div className="sm:col-span-2 bg-accent-50 border border-accent/30 text-accent-600 text-sm rounded-lg px-4 py-3">{error}</div>}
      {subject && <input type="hidden" name="subject" value={subject} />}
      <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Name</label><input name="name" required className={cls} /></div>
      <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Email</label><input type="email" name="email" required className={cls} /></div>
      <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Phone</label><input name="phone" className={cls} /></div>
      <div><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Destination country</label><input name="country" className={cls} /></div>
      {!subject && <div className="sm:col-span-2"><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Subject</label><input name="subject" className={cls} /></div>}
      <div className="sm:col-span-2"><label className="block text-xs font-semibold text-muted uppercase mb-1.5">Message</label><textarea name="message" rows={4} required defaultValue={defaultMessage} className={cls} /></div>
      <button disabled={busy} className="sm:col-span-2 bg-brand hover:bg-brand-600 text-white font-semibold py-3 rounded-lg disabled:opacity-60">{busy ? "Sending…" : "Send inquiry"}</button>
    </form>
  );
}
