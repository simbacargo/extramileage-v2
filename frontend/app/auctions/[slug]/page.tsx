import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import type { AuctionDetail } from "@/lib/types";
import BidPanel from "@/components/BidPanel";

async function getAuction(slug: string): Promise<AuctionDetail | null> {
  try {
    return await apiGet<AuctionDetail>(`/auctions/${slug}/`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await getAuction(params.slug);
  if (!a) return { title: "Auction not found" };
  return { title: `${a.title} — Live Auction | Extra Mileage Logistics` };
}

export default async function AuctionDetailPage({ params }: { params: { slug: string } }) {
  const auction = await getAuction(params.slug);
  if (!auction) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <p className="font-mono text-xs tracking-eyebrow uppercase text-muted mb-5">
        <Link href="/" className="hover:text-brand">Home</Link> /{" "}
        <Link href="/auctions" className="hover:text-brand">Auctions</Link> /{" "}
        <span className="text-ink">{auction.title}</span>
      </p>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="relative bg-paper sheet rounded-xl2 overflow-hidden aspect-[16/10]">
            {auction.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-muted font-mono">NO IMAGE</div>
            )}
          </div>
          <h1 className="font-display font-bold text-3xl text-ink mt-6">{auction.title}</h1>
          {auction.description && <p className="mt-3 text-muted leading-relaxed whitespace-pre-line">{auction.description}</p>}
          {auction.car && (
            <Link href={`/cars/${auction.car.slug}`} className="mt-5 inline-flex items-center gap-3 sheet rounded-xl p-3 bg-surface hover:border-brand">
              <span>
                <span className="block text-xs text-muted font-mono">VIEW FULL LISTING</span>
                <span className="block font-semibold text-ink">{auction.car.title}</span>
              </span>
            </Link>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20 space-y-5">
            <BidPanel initial={auction} />
          </div>
        </div>
      </div>
    </div>
  );
}
