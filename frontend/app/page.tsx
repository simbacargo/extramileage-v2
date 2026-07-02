import Link from "next/link";
import { apiGet, money } from "@/lib/api";
import type { HomeData } from "@/lib/types";
import HeroSlider from "@/components/HeroSlider";
import CarCard from "@/components/CarCard";
import ProductCard from "@/components/ProductCard";
import AuctionCard from "@/components/AuctionCard";

const EMPTY: HomeData = {
  slides: [], featured_cars: [], new_arrivals: [], popular_cars: [],
  categories: [], brands: [], featured_products: [], live_auctions: [], testimonials: [],
  stats: { total_cars: 0, total_brands: 0, total_products: 0, countries_served: 120 },
};

const FALLBACK_SITE = {
  site_name: "Extra Mileage Logistics",
  tagline: "Premium Japanese Used Cars Export",
};

async function getData(): Promise<HomeData> {
  try {
    return await apiGet<HomeData>("/home/", { revalidate: 120 });
  } catch {
    return EMPTY;
  }
}

const CategoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5h14l2 5v3a2 2 0 0 1-2 2M7 17v2M17 17v2" /></svg>
);

export default async function HomePage() {
  const data = await getData();
  const hero = data.featured_cars[0] || data.new_arrivals[0];
  const { stats } = data;

  return (
    <>
      {data.slides.length > 0 && <HeroSlider slides={data.slides} siteName={FALLBACK_SITE.site_name} />}

      {/* Search + featured stock */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-paper" />
        <div className="absolute -z-10 right-[-10%] top-[-20%] w-[55vw] h-[55vw] rounded-full" style={{ background: "radial-gradient(circle, rgba(228,0,43,.07), transparent 60%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-2.5 text-xs font-mono tracking-[.2em] uppercase text-muted"><span className="sun-dot" /> Direct from Japan · Worldwide export</p>
            <h2 className="mt-4 font-display font-bold text-ink leading-[1.05] text-3xl sm:text-4xl">Find your next vehicle</h2>
            <p className="mt-4 text-muted text-lg max-w-md">{FALLBACK_SITE.tagline}. Every unit graded, every price transparent — FOB to your nearest port.</p>

            <form action="/cars" method="get" className="mt-8 bg-surface sheet rounded-xl2 shadow-card p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 rounded-lg bg-paper">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                  <input name="q" placeholder="Search make, model or stock #" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted" />
                </div>
                <select name="brand" className="bg-paper rounded-lg px-3 py-3 text-sm text-ink outline-none">
                  <option value="">Any brand</option>
                  {data.brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                </select>
                <button className="bg-brand hover:bg-brand-600 text-white font-semibold text-sm px-6 py-3 rounded-lg">Search</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.categories.slice(0, 6).map((c) => (
                  <Link key={c.slug} href={`/cars?category=${c.slug}`} className="text-xs px-3 py-1.5 rounded-full bg-paper hover:bg-brand-50 hover:text-brand text-muted transition">{c.name}</Link>
                ))}
              </div>
            </form>

            <div className="mt-8 flex items-center gap-8">
              <div><p className="font-mono font-semibold text-2xl text-ink">{money(stats.total_cars)}+</p><p className="text-xs text-muted uppercase tracking-wide">In stock</p></div>
              <div className="w-px h-10 bg-line" />
              <div><p className="font-mono font-semibold text-2xl text-ink">{stats.total_brands}</p><p className="text-xs text-muted uppercase tracking-wide">Brands</p></div>
              <div className="w-px h-10 bg-line" />
              <div><p className="font-mono font-semibold text-2xl text-ink">{stats.countries_served}</p><p className="text-xs text-muted uppercase tracking-wide">Countries</p></div>
            </div>
          </div>

          {hero && (
            <div className="lg:col-span-6">
              <div className="relative max-w-md mx-auto lg:ml-auto">
                <div className="absolute -top-3 -left-3 font-mono text-[.7rem] tracking-wide bg-accent text-white px-3 py-1.5 rounded-lg shadow-lift z-10">FEATURED STOCK</div>
                <div className="bg-surface sheet rounded-xl2 shadow-lift overflow-hidden hover-lift">
                  <div className="relative aspect-[16/11] bg-paper">
                    {hero.thumbnail && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={hero.thumbnail} alt={hero.title} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute top-3 right-3 font-mono text-[11px] bg-ink/85 text-white px-2 py-1 rounded-md">#{hero.stock_id}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[.68rem] tracking-[.12em] uppercase text-brand-400">{hero.brand?.name || hero.make} · {hero.year}</span>
                      <span className="flex items-center gap-1 text-[.66rem] font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />AVAILABLE</span>
                    </div>
                    <h3 className="mt-1 font-display font-bold text-xl text-ink">{hero.title}</h3>
                    <div className="mt-4 sheet rounded-lg overflow-hidden font-mono text-[.78rem]">
                      <div className="grid grid-cols-2"><div className="px-3 py-2 text-muted">Mileage</div><div className="px-3 py-2 text-right text-ink">{money(hero.mileage)} km</div></div>
                      <div className="grid grid-cols-2 sheet-row"><div className="px-3 py-2 text-muted">Trans</div><div className="px-3 py-2 text-right text-ink">{hero.transmission}</div></div>
                      <div className="grid grid-cols-2 sheet-row"><div className="px-3 py-2 text-muted">Fuel</div><div className="px-3 py-2 text-right text-ink">{hero.fuel_type}</div></div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div><p className="text-[.62rem] text-muted uppercase tracking-eyebrow">CIF Price</p><p className="font-mono font-bold text-2xl text-ink">${money(hero.cif_price || hero.price)}</p></div>
                      <Link href={`/cars/${hero.slug}`} className="bg-brand hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">View unit</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {data.categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[.7rem] tracking-[.2em] uppercase text-muted">Browse by type</p>
              <h2 className="font-display font-bold text-2xl text-ink mt-1">Find your category</h2>
            </div>
            <Link href="/cars" className="text-sm font-semibold text-brand hover:text-accent">All stock →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {data.categories.slice(0, 12).map((c) => (
              <Link key={c.slug} href={`/cars?category=${c.slug}`} className="group bg-surface sheet rounded-xl p-4 text-center hover:border-brand hover-lift">
                <div className="w-11 h-11 mx-auto rounded-lg bg-brand-50 grid place-items-center text-brand group-hover:bg-brand group-hover:text-white transition"><CategoryIcon /></div>
                <p className="mt-2.5 text-sm font-semibold text-ink leading-tight">{c.name}</p>
                <p className="text-xs text-muted font-mono">{c.car_count} unit{c.car_count === 1 ? "" : "s"}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {data.featured_cars.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[.7rem] tracking-[.2em] uppercase text-accent">Hand-picked</p>
              <h2 className="font-display font-bold text-2xl text-ink mt-1">Featured vehicles</h2>
            </div>
            <Link href="/cars" className="text-sm font-semibold text-brand hover:text-accent">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.featured_cars.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </section>
      )}

      {/* Live auctions */}
      {data.live_auctions.length > 0 && (
        <section className="bg-brand text-white py-16 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="flex items-center gap-2 font-mono text-[.7rem] tracking-[.2em] uppercase text-white/60"><span className="live-dot w-1.5 h-1.5 rounded-full bg-accent" /> Bidding now</p>
                <h2 className="font-display font-bold text-2xl mt-1">Live auctions</h2>
              </div>
              <Link href="/auctions" className="text-sm font-semibold text-white/80 hover:text-white">Enter auction house →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.live_auctions.map((a) => <AuctionCard key={a.id} auction={a} variant="dark" />)}
            </div>
          </div>
        </section>
      )}

      {/* New arrivals */}
      {data.new_arrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[.7rem] tracking-[.2em] uppercase text-muted">Fresh off the boat</p>
              <h2 className="font-display font-bold text-2xl text-ink mt-1">New arrivals</h2>
            </div>
            <Link href="/cars?sort=newest" className="text-sm font-semibold text-brand hover:text-accent">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.new_arrivals.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </section>
      )}

      {/* Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <p className="font-mono text-[.7rem] tracking-[.2em] uppercase text-muted">How it works</p>
          <h2 className="font-display font-bold text-3xl text-ink mt-1">From Tokyo to your port in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { t: "Select & reserve", d: "Browse graded stock and reserve your unit with a deposit. Our team confirms condition and availability." },
            { t: "Pay & document", d: "Settle the FOB/CIF invoice. We handle export inspection, de-registration and all paperwork." },
            { t: "Ship & receive", d: "Your vehicle is loaded RoRo or container and shipped to your nearest port with full tracking." },
          ].map((s, idx) => (
            <div key={idx} className="relative bg-surface sheet rounded-xl2 p-6 hover-lift">
              <span className="font-mono font-bold text-5xl text-brand-50">0{idx + 1}</span>
              <h3 className="font-display font-semibold text-lg text-ink mt-2">{s.t}</h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parts */}
      {data.featured_products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[.7rem] tracking-[.2em] uppercase text-muted">Beyond cars</p>
              <h2 className="font-display font-bold text-2xl text-ink mt-1">Parts, bikes & machines</h2>
            </div>
            <Link href="/parts" className="text-sm font-semibold text-brand hover:text-accent">Shop all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.featured_products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {data.testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-10">
            <p className="font-mono text-[.7rem] tracking-[.2em] uppercase text-muted">Trusted worldwide</p>
            <h2 className="font-display font-bold text-3xl text-ink mt-1">What importers say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {data.testimonials.slice(0, 3).map((t, idx) => (
              <figure key={idx} className="bg-surface sheet rounded-xl2 p-6 hover-lift">
                <div className="flex gap-0.5 text-accent">
                  {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= t.rating ? "" : "text-line"}>★</span>)}
                </div>
                <blockquote className="mt-3 text-ink leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-brand text-white grid place-items-center font-mono text-xs">{t.name.slice(0, 1)}</span>
                  <span><span className="block font-semibold text-sm text-ink">{t.name}</span><span className="block text-xs text-muted">{t.role}{t.country ? ` · ${t.country}` : ""}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-4">
        <div className="relative overflow-hidden rounded-xl2 bg-brand text-white px-8 py-14 sm:px-14">
          <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(228,0,43,.25), transparent 60%)" }} />
          <div className="relative max-w-2xl">
            <h2 className="font-display font-bold text-3xl sm:text-4xl">Can&apos;t find the unit you need?</h2>
            <p className="mt-3 text-white/80">Tell us the make, model and budget. We source directly from Japanese auctions and dealer stock daily.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="bg-accent hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg">Request a vehicle</Link>
              <Link href="/cars" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg">Browse inventory</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
