"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiGet, money } from "@/lib/api";
import type { Brand, Category, Product, Paginated } from "@/lib/types";
import { PRODUCT_SORTS, CONDITIONS } from "@/lib/constants";
import ProductCard from "@/components/ProductCard";

export default function ProductsBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const qs = params.toString();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<Paginated<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  const get = useCallback((k: string) => params.get(k) || "", [params]);

  useEffect(() => {
    Promise.all([
      apiGet<Brand[]>("/brands/", { revalidate: 600 }),
      apiGet<Category[]>("/categories/", { revalidate: 600 }),
    ]).then(([b, c]) => { setBrands(b); setCategories(c); }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet<Paginated<Product>>(`/products/${qs ? `?${qs}` : ""}`)
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData({ count: 0, next: null, previous: null, results: [] }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [qs]);

  const setParam = useCallback((key: string, value: string, keepPage = false) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    if (!keepPage) next.delete("page");
    router.replace(`/parts${next.toString() ? `?${next.toString()}` : ""}`, { scroll: false });
  }, [params, router]);

  const currentPage = Number(get("page")) || 1;
  const totalPages = data ? Math.max(1, Math.ceil(data.count / 12)) : 1;

  return (
    <>
      <div className="bg-brand-50 border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-mono text-xs tracking-eyebrow uppercase text-muted"><Link href="/" className="hover:text-brand">Home</Link> / Parts</p>
          <h1 className="font-display font-bold text-3xl text-ink mt-2">Parts, bikes &amp; machines</h1>
          <p className="text-muted mt-1">Genuine Japanese parts, motorcycles and machinery — ready to export.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-surface sheet rounded-xl2 p-4 mb-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input defaultValue={get("q")} onChange={(e) => setParam("q", e.target.value)} placeholder="Search name, model, stock #" className="bg-paper rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400" />
          <select value={get("brand")} onChange={(e) => setParam("brand", e.target.value)} className="bg-paper rounded-lg px-3 py-2.5 text-sm outline-none">
            <option value="">Any brand</option>
            {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
          <select value={get("category")} onChange={(e) => setParam("category", e.target.value)} className="bg-paper rounded-lg px-3 py-2.5 text-sm outline-none">
            <option value="">Any category</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={get("condition")} onChange={(e) => setParam("condition", e.target.value)} className="bg-paper rounded-lg px-3 py-2.5 text-sm outline-none">
            <option value="">Any condition</option>
            {CONDITIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted"><span className="font-mono font-semibold text-ink">{money(data?.count ?? 0)}</span> item{data?.count === 1 ? "" : "s"} found</p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted hidden sm:inline">Sort</span>
            <select value={get("sort") || "newest"} onChange={(e) => setParam("sort", e.target.value)} className="bg-surface sheet rounded-lg px-3 py-2 text-sm outline-none">
              {PRODUCT_SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>

        <div className="relative">
          {loading && <div className="absolute inset-0 z-10 bg-paper/60 backdrop-blur-sm grid place-items-center rounded-xl2"><span className="font-mono text-sm text-brand animate-pulse">Loading…</span></div>}
          {data && data.results.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {data.results.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {totalPages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-1.5 font-mono text-sm">
                  {currentPage > 1 && <button onClick={() => setParam("page", String(currentPage - 1), true)} className="px-3 py-2 rounded-lg sheet bg-surface hover:border-brand">‹</button>}
                  <span className="px-3.5 py-2 rounded-lg bg-brand text-white">{currentPage}</span>
                  <span className="text-muted px-1">/ {totalPages}</span>
                  {currentPage < totalPages && <button onClick={() => setParam("page", String(currentPage + 1), true)} className="px-3 py-2 rounded-lg sheet bg-surface hover:border-brand">›</button>}
                </nav>
              )}
            </>
          ) : (
            !loading && (
              <div className="text-center py-24 sheet rounded-xl2 bg-surface">
                <p className="font-display font-semibold text-xl text-ink">No items match your search</p>
                <Link href="/parts" className="inline-block mt-5 bg-brand text-white font-semibold px-5 py-2.5 rounded-lg">Reset</Link>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
