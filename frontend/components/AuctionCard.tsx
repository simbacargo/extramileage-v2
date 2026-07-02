import Link from "next/link";
import type { Auction } from "@/lib/types";
import { money } from "@/lib/api";
import Countdown from "./Countdown";

export default function AuctionCard({ auction, variant = "light" }: { auction: Auction; variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  const badge =
    auction.status === "live" ? (
      <span className="absolute top-3 left-3 font-mono text-[10px] bg-accent text-white px-2 py-1 rounded-md flex items-center gap-1.5"><span className="live-dot w-1.5 h-1.5 rounded-full bg-white" />LIVE</span>
    ) : auction.status === "ended" ? (
      <span className="absolute top-3 left-3 font-mono text-[10px] bg-ink/80 text-white px-2 py-1 rounded-md">ENDED</span>
    ) : (
      <span className="absolute top-3 left-3 font-mono text-[10px] bg-brand text-white px-2 py-1 rounded-md">SOON</span>
    );

  return (
    <Link
      href={`/auctions/${auction.slug}`}
      className={`group rounded-xl2 overflow-hidden hover-lift ${dark ? "bg-white/5 hover:bg-white/10 border border-white/10" : "bg-surface sheet shadow-card"}`}
    >
      <div className={`relative aspect-[16/10] ${dark ? "bg-white/10" : "bg-paper"}`}>
        {auction.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={auction.image} alt={auction.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        {badge}
      </div>
      <div className={dark ? "p-4" : "p-5"}>
        <h3 className={`font-display font-semibold truncate ${dark ? "" : "text-ink"}`}>{auction.title}</h3>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className={`text-[.6rem] uppercase tracking-wide ${dark ? "text-white/50" : "text-muted"}`}>Current bid</p>
            <p className={`font-mono font-bold text-xl ${dark ? "" : "text-ink"}`}>${money(auction.current_bid)}</p>
          </div>
          <div className="text-right">
            <p className={`text-[.6rem] uppercase tracking-wide ${dark ? "text-white/50" : "text-muted"}`}>Bids</p>
            <p className={`font-mono ${dark ? "" : "text-ink"}`}>{auction.total_bids}</p>
          </div>
        </div>
        <Countdown end={auction.end_date} className="mt-3 block font-mono text-xs text-accent" />
      </div>
    </Link>
  );
}
