"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, money } from "@/lib/api";
import type { Brand, Category, Car, Paginated } from "@/lib/types";
import { CAR_SORTS, FUELS, TRANSMISSIONS } from "@/lib/constants";
import CarCard from "@/components/CarCard";
import SaveSearchButton from "@/components/SaveSearchButton";

type Taxo = { brands: Brand[]; categories: Category[] };

export default function CarsBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const qs = params.toString();

  const [taxo, setTaxo] = useState<Taxo>({ brands: [], categories: [] });
  const [data, setData] = useState<Paginated<Car> | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const get = useCallback((k: string) => params.get(k) || "", [params]);

  useEffect(() => {
    Promise.all([
      apiGet<Brand[]>("/brands/", { revalidate: 600 }),
      apiGet<Category[]>("/categories/", { revalidate: 600 }),
    ])
      .then(([brands, categories]) => setTaxo({ brands, categories }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet<Paginated<Car>>(`/cars/${qs ? `?${qs}` : ""}`)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData({ count: 0, next: null, previous: null, results: [] }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [qs]);

  // Push a changed filter into the URL (resets page to 1).
  const setParam = useCallback((key: string, value: string, keepPage = false) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    if (!keepPage) next.delete("page");
    router.replace(`/cars${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
  }, [params, router]);

  // Query to persist for a saved search — everything except pagination.
  const savedQuery = useMemo(() => {
    const p = new URLSearchParams(params.toString());
    p.delete("page");
    return p.toString();
  }, [params]);

  const currentPage = Number(get("page")) || 1;
  const pageSize = 12;
  const totalPages = data ? Math.max(1, Math.ceil(data.count / pageSize)) : 1;

  const pageWindow = useMemo(() => {
    const arr: number[] = [];
    for (let n = 1; n <= totalPages; n++) {
      if (n >= currentPage - 2 && n <= currentPage + 2) arr.push(n);
    }
    return arr;
  }, [totalPages, currentPage]);

  return (
    <>
      <div className="bg-brand-50 border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-mono text-xs tracking-eyebrow uppercase text-muted"><Link href="/" className="hover:text-brand">Home</Link> / Cars</p>
          <h1 className="font-display font-bold text-3xl text-ink mt-2">Japanese used cars for export</h1>
          <p className="text-muted mt-1">Graded, photographed and priced FOB · CIF. Filter the live inventory below.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <button onClick={() => setMobileOpen((v) => !v)} className="lg:hidden w-full mb-4 flex items-center justify-between bg-surface sheet rounded-lg px-4 py-3 font-semibold">
            Filters <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 6h18M6 12h12M10 18h4" /></svg>
          </button>
          <div className={`${mobileOpen ? "block" : "hidden lg:block"} lg:sticky lg:top-20 bg-surface sheet rounded-xl2 p-5 space-y-5`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-ink">Refine</h2>
              <Link href="/cars" className="text-xs text-accent hover:underline">Clear all</Link>
            </div>

            <div className="pb-1 border-b border-line">
              <SaveSearchButton query={savedQuery} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Keyword</label>
              <input defaultValue={get("q")} onChange={(e) => setParam("q", e.target.value)} placeholder="Make, model, stock #" className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Brand</label>
              <select value={get("brand")} onChange={(e) => setParam("brand", e.target.value)} className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none">
                <option value="">Any brand</option>
                {taxo.brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Category</label>
              <select value={get("category")} onChange={(e) => setParam("category", e.target.value)} className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none">
                <option value="">Any type</option>
                {taxo.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Fuel</label>
                <select value={get("fuel")} onChange={(e) => setParam("fuel", e.target.value)} className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none">
                  <option value="">Any</option>
                  {FUELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Trans.</label>
                <select value={get("transmission")} onChange={(e) => setParam("transmission", e.target.value)} className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm outline-none">
                  <option value="">Any</option>
                  {TRANSMISSIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Year range</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={get("year_min")} onChange={(e) => setParam("year_min", e.target.value)} placeholder="From" className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm font-mono outline-none" />
                <span className="text-muted">–</span>
                <input type="number" defaultValue={get("year_max")} onChange={(e) => setParam("year_max", e.target.value)} placeholder="To" className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm font-mono outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Price range (USD)</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={get("price_min")} onChange={(e) => setParam("price_min", e.target.value)} placeholder="Min" className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm font-mono outline-none" />
                <span className="text-muted">–</span>
                <input type="number" defaultValue={get("price_max")} onChange={(e) => setParam("price_max", e.target.value)} placeholder="Max" className="w-full bg-paper rounded-lg px-3 py-2.5 text-sm font-mono outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">Steering</label>
              <div className="flex gap-2">
                {[["", "Any"], ["Right", "RHD"], ["Left", "LHD"]].map(([v, l]) => (
                  <button key={l} onClick={() => setParam("steering", v)} className={`flex-1 text-center text-sm py-2 rounded-lg ${get("steering") === v ? "bg-brand text-white" : "bg-paper"}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9 relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted"><span className="font-mono font-semibold text-ink">{money(data?.count ?? 0)}</span> vehicle{data?.count === 1 ? "" : "s"} found</p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted hidden sm:inline">Sort</span>
              <select value={get("sort") || "newest"} onChange={(e) => setParam("sort", e.target.value)} className="bg-surface sheet rounded-lg px-3 py-2 text-sm outline-none">
                {CAR_SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>

          {loading && <div className="absolute inset-0 z-10 bg-paper/60 backdrop-blur-sm grid place-items-center rounded-xl2"><span className="font-mono text-sm text-brand animate-pulse">Loading stock…</span></div>}

          {data && data.results.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {data.results.map((car) => <CarCard key={car.id} car={car} />)}
              </div>
              {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-1.5 font-mono text-sm">
                  {currentPage > 1 && <button onClick={() => setParam("page", String(currentPage - 1), true)} className="px-3 py-2 rounded-lg sheet bg-surface hover:border-brand">‹</button>}
                  {pageWindow.map((n) => (
                    n === currentPage
                      ? <span key={n} className="px-3.5 py-2 rounded-lg bg-brand text-white">{n}</span>
                      : <button key={n} onClick={() => setParam("page", String(n), true)} className="px-3.5 py-2 rounded-lg sheet bg-surface hover:border-brand">{n}</button>
                  ))}
                  {currentPage < totalPages && <button onClick={() => setParam("page", String(currentPage + 1), true)} className="px-3 py-2 rounded-lg sheet bg-surface hover:border-brand">›</button>}
                </nav>
              )}
            </>
          ) : (
            !loading && (
              <div className="text-center py-24 sheet rounded-xl2 bg-surface">
                <p className="font-display font-semibold text-xl text-ink">No vehicles match your filters</p>
                <p className="text-muted mt-2">Try widening your search or clearing some filters.</p>
                <Link href="/cars" className="inline-block mt-5 bg-brand text-white font-semibold px-5 py-2.5 rounded-lg">Reset filters</Link>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
