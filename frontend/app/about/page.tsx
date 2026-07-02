import Link from "next/link";
import type { Metadata } from "next";
import { apiGet, money } from "@/lib/api";
import type { HomeData } from "@/lib/types";

export const metadata: Metadata = {
  title: "About — Extra Mileage Logistics",
};

const YEARS_EXPORTING = 12;

async function getStats() {
  try {
    const data = await apiGet<HomeData>("/home/", { revalidate: 300 });
    return data.stats;
  } catch {
    return { total_cars: 0, total_brands: 0, total_products: 0, countries_served: 120 };
  }
}

export default async function AboutPage() {
  const stats = await getStats();
  const perks = [
    "Direct auction & dealer access across Japan",
    "Independent inspection grade on every unit",
    "Transparent FOB and CIF pricing — no surprises",
    "RoRo & container shipping to any major port",
    "Full export documentation handled in-house",
    "English-speaking support, one-day response",
  ];

  return (
    <>
      <section className="bg-brand-50 border-b border-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="flex items-center justify-center gap-2 font-mono text-xs tracking-eyebrow uppercase text-muted"><span className="sun-dot" /> Established in Tokyo</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink mt-4">Cars from Japan,<br />trusted worldwide.</h1>
          <p className="mt-5 text-muted text-lg max-w-2xl mx-auto">Extra Mileage Logistics sources, inspects and exports quality Japanese vehicles to importers across {stats.countries_served}+ countries — with transparent pricing and end-to-end logistics.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface sheet rounded-xl2 p-6 text-center"><p className="font-mono font-bold text-4xl text-brand">{money(stats.total_cars)}+</p><p className="text-sm text-muted mt-1">Vehicles in stock</p></div>
        <div className="bg-surface sheet rounded-xl2 p-6 text-center"><p className="font-mono font-bold text-4xl text-brand">{stats.total_brands}</p><p className="text-sm text-muted mt-1">Brands represented</p></div>
        <div className="bg-surface sheet rounded-xl2 p-6 text-center"><p className="font-mono font-bold text-4xl text-brand">{YEARS_EXPORTING}+</p><p className="text-sm text-muted mt-1">Years exporting</p></div>
        <div className="bg-surface sheet rounded-xl2 p-6 text-center"><p className="font-mono font-bold text-4xl text-brand">{stats.countries_served}+</p><p className="text-sm text-muted mt-1">Countries served</p></div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="font-display font-bold text-2xl text-ink">Why importers choose us</h2>
          <p className="mt-3 text-muted leading-relaxed">We&apos;re a Tokyo-based exporter with direct access to Japan&apos;s largest used-vehicle auctions and dealer networks. Every unit is inspected and graded before it ships, so what you see is what arrives at your port.</p>
        </div>
        <ul className="space-y-3">
          {perks.map((p) => (
            <li key={p} className="flex gap-3"><span className="w-2 h-2 rounded-full bg-accent mt-2" /><span className="text-ink">{p}</span></li>
          ))}
        </ul>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-brand text-white rounded-xl2 p-10 text-center">
          <h2 className="font-display font-bold text-3xl">Ready to import from Japan?</h2>
          <p className="mt-2 text-white/80">Browse live stock or tell us exactly what you&apos;re after.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link href="/cars" className="bg-white text-brand font-semibold px-6 py-3 rounded-lg">Browse inventory</Link>
            <Link href="/contact" className="bg-accent hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
