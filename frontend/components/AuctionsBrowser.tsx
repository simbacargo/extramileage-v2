"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { Auction } from "@/lib/types";
import AuctionCard from "@/components/AuctionCard";

const TABS = [
  { key: "live", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ended", label: "Ended" },
];

export default function AuctionsBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") || "live";
  const [auctions, setAuctions] = useState<Auction[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet<Auction[]>(`/auctions/?tab=${tab}`)
      .then((d) => { if (!cancelled) setAuctions(d); })
      .catch(() => { if (!cancelled) setAuctions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab]);

  return (
    <>
      <div className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <p className="flex items-center gap-2 font-mono text-xs tracking-eyebrow uppercase text-white/60"><span className="live-dot w-1.5 h-1.5 rounded-full bg-accent" /> Auction house</p>
          <h1 className="font-display font-bold text-4xl mt-2">Bid on vehicles, live</h1>
          <p className="text-white/70 mt-2 max-w-xl">Real-time bidding on hand-selected stock straight from Japanese auctions. Place your bid and watch the feed update.</p>
          <div className="mt-7 inline-flex bg-white/10 rounded-lg p-1 font-semibold text-sm">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => router.replace(`/auctions?tab=${t.key}`, { scroll: false })}
                className={`px-4 py-2 rounded-md ${tab === t.key ? "bg-white text-brand" : "text-white/80 hover:text-white"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="py-24 text-center font-mono text-sm text-muted animate-pulse">Loading auctions…</div>
        ) : auctions && auctions.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {auctions.map((a) => <AuctionCard key={a.id} auction={a} />)}
          </div>
        ) : (
          <div className="text-center py-24 sheet rounded-xl2 bg-surface">
            <p className="font-display font-semibold text-xl text-ink">No {tab} auctions right now</p>
            <p className="text-muted mt-2">Check back soon or browse our standard inventory.</p>
            <Link href="/cars" className="inline-block mt-5 bg-brand text-white font-semibold px-5 py-2.5 rounded-lg">Browse cars</Link>
          </div>
        )}
      </div>
    </>
  );
}
