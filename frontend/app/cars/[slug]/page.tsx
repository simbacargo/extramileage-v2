import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiGet, money } from "@/lib/api";
import type { CarDetail } from "@/lib/types";
import Gallery from "@/components/Gallery";
import CarCard from "@/components/CarCard";
import WishlistButton from "@/components/WishlistButton";
import InquiryForm from "@/components/InquiryForm";

async function getCar(slug: string): Promise<CarDetail | null> {
  try {
    return await apiGet<CarDetail>(`/cars/${slug}/`, { revalidate: 60 });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const car = await getCar(params.slug);
  if (!car) return { title: "Vehicle not found" };
  return { title: `${car.title} — Stock #${car.stock_id} | Extra Mileage Logistics` };
}

const WHATSAPP = "+81-80-7050-3366";

export default async function CarDetailPage({ params }: { params: { slug: string } }) {
  const car = await getCar(params.slug);
  if (!car) notFound();

  const specRows: [string, string][] = [
    ["Stock ID", `#${car.stock_id}`],
    ["Year", String(car.year)],
    ["Mileage", `${money(car.mileage)} km`],
    ["Engine", car.engine_cc ? `${car.engine_cc} cc` : "—"],
    ["Transmission", car.transmission],
    ["Fuel", car.fuel_type],
    ["Drivetrain", car.drivetrain],
    ["Steering", car.steering_display],
    ["Color", car.color || "—"],
    ["Doors / Seats", `${car.doors} / ${car.seats}`],
    ["Condition", car.condition_display],
    ["Location", car.location || "—"],
  ];

  const waNumber = WHATSAPP.replace(/[\s+()-]/g, "");
  const waText = encodeURIComponent(`Hi, I'm interested in stock #${car.stock_id} (${car.title})`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <p className="font-mono text-xs tracking-eyebrow uppercase text-muted mb-5">
        <Link href="/" className="hover:text-brand">Home</Link> /{" "}
        <Link href="/cars" className="hover:text-brand">Cars</Link> /{" "}
        <span className="text-ink">{car.make} {car.model}</span>
      </p>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Gallery images={car.images} alt={car.title} stockId={car.stock_id} />

          {car.description && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-xl text-ink">Description</h2>
              <p className="mt-3 text-muted leading-relaxed whitespace-pre-line">{car.description}</p>
            </div>
          )}

          {car.features.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-xl text-ink mb-3">Equipment &amp; features</h2>
              <div className="grid sm:grid-cols-2 gap-2">
                {car.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm text-ink"><span className="w-1.5 h-1.5 rounded-full bg-accent" />{f}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20 space-y-5">
            <div className="bg-surface sheet rounded-xl2 p-6 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[.7rem] tracking-[.12em] uppercase text-brand-400">{car.brand?.name || car.make} · {car.year}</p>
                  <h1 className="font-display font-bold text-2xl text-ink mt-1">{car.title}</h1>
                </div>
                <WishlistButton kind="car" id={car.id} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-px bg-line sheet rounded-xl overflow-hidden">
                <div className="bg-surface p-4">
                  <p className="text-[.62rem] text-muted uppercase tracking-eyebrow">FOB Price</p>
                  <p className="font-mono font-semibold text-xl text-ink">${money(car.fob_price || car.price)}</p>
                </div>
                <div className="bg-brand p-4 text-white">
                  <p className="text-[.62rem] text-white/70 uppercase tracking-eyebrow">CIF Price</p>
                  <p className="font-mono font-bold text-xl">${money(car.cif_price || car.price)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <a href="#inquire" className="bg-accent hover:bg-accent-600 text-white text-center font-semibold py-3 rounded-lg">Request quote / inquire</a>
                <a href={`https://wa.me/${waNumber}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="border border-line hover:border-brand text-center font-semibold py-3 rounded-lg text-ink">Chat on WhatsApp</a>
              </div>
            </div>

            <div className="bg-surface sheet rounded-xl2 overflow-hidden">
              <div className="px-5 py-3 border-b border-line flex items-center justify-between">
                <h3 className="font-display font-semibold text-ink">Inspection sheet</h3>
                <span className="font-mono text-[.66rem] text-muted">REF #{car.stock_id}</span>
              </div>
              <dl className="font-mono text-sm">
                {specRows.map(([label, value], idx) => (
                  <div key={label} className={`grid grid-cols-2 ${idx > 0 ? "sheet-row" : ""}`}>
                    <dt className="px-5 py-2.5 text-muted">{label}</dt>
                    <dd className="px-5 py-2.5 text-right text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div id="inquire" className="mt-14 grid lg:grid-cols-12 gap-8 scroll-mt-20">
        <div className="lg:col-span-5">
          <p className="font-mono text-[.7rem] tracking-[.2em] uppercase text-accent">Interested?</p>
          <h2 className="font-display font-bold text-3xl text-ink mt-1">Inquire about this unit</h2>
          <p className="text-muted mt-3 leading-relaxed">Send us your details and we&apos;ll confirm availability, total CIF cost to your port, and shipping schedule — usually within one business day.</p>
          <div className="mt-6 sheet rounded-xl p-5 bg-paper font-mono text-sm space-y-2">
            <p><span className="text-muted">Stock</span> <span className="text-ink float-right">#{car.stock_id}</span></p>
            <p><span className="text-muted">Unit</span> <span className="text-ink float-right">{car.title}</span></p>
            <p><span className="text-muted">CIF</span> <span className="text-ink float-right">${money(car.cif_price || car.price)}</span></p>
          </div>
        </div>
        <div className="lg:col-span-7">
          <InquiryForm
            carId={car.id}
            subject={`Inquiry: #${car.stock_id} ${car.title}`}
            defaultMessage={`I'm interested in stock #${car.stock_id} (${car.title}). Please send total CIF cost and shipping details.`}
          />
        </div>
      </div>

      {car.related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl text-ink mb-6">Similar vehicles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {car.related.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
