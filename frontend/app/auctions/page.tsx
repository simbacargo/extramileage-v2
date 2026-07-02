import { Suspense } from "react";
import type { Metadata } from "next";
import AuctionsBrowser from "@/components/AuctionsBrowser";

export const metadata: Metadata = {
  title: "Live Vehicle Auctions — Extra Mileage Logistics",
};

export default function AuctionsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono text-sm text-muted">Loading…</div>}>
      <AuctionsBrowser />
    </Suspense>
  );
}
