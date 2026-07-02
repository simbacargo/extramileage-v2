"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend, money } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AuctionDetail } from "@/lib/types";
import Countdown from "@/components/Countdown";

export default function BidPanel({ initial }: { initial: AuctionDetail }) {
  const { user, token, ready } = useAuth();
  const [auction, setAuction] = useState<AuctionDetail>(initial);
  const [amount, setAmount] = useState<string>(String(Math.ceil(Number(initial.next_min_bid))));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const fresh = await apiGet<AuctionDetail>(`/auctions/${initial.slug}/`);
      setAuction(fresh);
    } catch { /* ignore */ }
  }, [initial.slug]);

  // Poll for live updates while the auction is running.
  useEffect(() => {
    if (auction.status !== "live") return;
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, [auction.status, refresh]);

  const placeBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const updated = await apiSend<AuctionDetail>(`/auctions/${initial.slug}/bid/`, "POST", { amount }, token);
      setAuction(updated);
      setAmount(String(Math.ceil(Number(updated.next_min_bid))));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bid failed.");
    } finally {
      setBusy(false);
    }
  };

  const minBid = Math.ceil(Number(auction.next_min_bid));

  return (
    <>
      <div className="bg-surface sheet rounded-xl2 p-6 shadow-card">
        <div className="flex items-center justify-between">
          {auction.status === "live" ? (
            <span className="flex items-center gap-2 font-mono text-[.66rem] uppercase tracking-wide text-emerald-600"><span className="live-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />Live now</span>
          ) : auction.status === "scheduled" ? (
            <span className="font-mono text-[.66rem] uppercase tracking-wide text-brand-400">Starts soon</span>
          ) : (
            <span className="font-mono text-[.66rem] uppercase tracking-wide text-muted">Auction ended</span>
          )}
          <Countdown end={auction.end_date} className="font-mono text-xs text-accent" />
        </div>

        <p className="mt-4 text-[.62rem] text-muted uppercase tracking-eyebrow">Current bid</p>
        <p className="font-mono font-bold text-4xl text-ink">${money(auction.current_bid)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted font-mono">
          <span>{auction.total_bids} bid{auction.total_bids === 1 ? "" : "s"}</span>
          <span>· min next ${money(auction.next_min_bid)}</span>
        </div>

        <div className="mt-5 sheet rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-line font-mono text-[.66rem] uppercase tracking-wide text-muted">Bid history</div>
          <ul className="divide-y divide-line max-h-56 overflow-auto no-scrollbar font-mono text-sm">
            {auction.bids.length > 0 ? (
              auction.bids.map((bid, idx) => (
                <li key={bid.id} className={`px-4 py-2.5 flex items-center justify-between ${idx === 0 ? "bg-brand-50" : ""}`}>
                  <span className="flex items-center gap-2 text-ink">
                    <span className="w-6 h-6 rounded-full bg-brand text-white text-[10px] grid place-items-center">{bid.initials}</span>
                    {bid.username}
                  </span>
                  <span className="text-ink font-semibold">${money(bid.amount)}</span>
                </li>
              ))
            ) : (
              <li className="px-4 py-6 text-center text-muted text-sm font-sans">No bids yet — be the first.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-surface sheet rounded-xl2 p-6">
        {ready && user ? (
          auction.status === "live" ? (
            <form onSubmit={placeBid}>
              {error && <div className="mb-3 bg-accent-50 border border-accent/30 text-accent-600 text-sm rounded-lg px-4 py-3">{error}</div>}
              <label className="block text-xs font-semibold text-muted uppercase mb-1.5">Your bid (USD)</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center bg-paper rounded-lg px-3">
                  <span className="text-muted font-mono">$</span>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="1" min={minBid} className="w-full bg-transparent py-3 font-mono outline-none" />
                </div>
                <button disabled={busy} className="bg-accent hover:bg-accent-600 text-white font-semibold px-6 rounded-lg disabled:opacity-60">{busy ? "…" : "Bid"}</button>
              </div>
              <p className="mt-2 text-xs text-muted">Enter at least <span className="font-mono">${money(auction.next_min_bid)}</span>. Bids are binding.</p>
            </form>
          ) : (
            <p className="text-center text-muted text-sm">{auction.status === "ended" ? "This auction has ended." : "Bidding hasn't opened yet."}</p>
          )
        ) : (
          <>
            <p className="text-sm text-muted mb-3">Sign in to place a bid.</p>
            <Link href="/login" className="block text-center bg-brand hover:bg-brand-600 text-white font-semibold py-3 rounded-lg">Sign in to bid</Link>
          </>
        )}
      </div>
    </>
  );
}
