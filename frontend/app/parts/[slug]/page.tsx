import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiGet, money } from "@/lib/api";
import type { ProductDetail } from "@/lib/types";
import Gallery from "@/components/Gallery";
import ProductCard from "@/components/ProductCard";
import WishlistButton from "@/components/WishlistButton";

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await apiGet<ProductDetail>(`/products/${slug}/`, { revalidate: 60 });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  if (!p) return { title: "Item not found" };
  return { title: `${p.name} ${p.model} — Extra Mileage Logistics` };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <p className="font-mono text-xs tracking-eyebrow uppercase text-muted mb-5">
        <Link href="/" className="hover:text-brand">Home</Link> /{" "}
        <Link href="/parts" className="hover:text-brand">Parts</Link> /{" "}
        <span className="text-ink">{product.name}</span>
      </p>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Gallery images={product.images} alt={product.name} stockId={product.stock_id} />
          {product.description && (
            <div className="mt-8">
              <h2 className="font-display font-bold text-xl text-ink">Description</h2>
              <p className="mt-3 text-muted leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-20 space-y-5">
            <div className="bg-surface sheet rounded-xl2 p-6 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[.7rem] tracking-[.12em] uppercase text-brand-400">{product.category?.name || "Part"}</p>
                  <h1 className="font-display font-bold text-2xl text-ink mt-1">{product.name} {product.model}</h1>
                </div>
                <WishlistButton kind="product" id={product.id} />
              </div>
              <p className="mt-4 font-mono font-bold text-3xl text-ink">${money(product.price)}</p>
              <p className="text-sm text-muted mt-1">{product.condition_display} · {product.location}</p>
              <div className="mt-5 flex flex-col gap-2.5">
                <Link href="/contact" className="bg-accent hover:bg-accent-600 text-white text-center font-semibold py-3 rounded-lg">Inquire about this item</Link>
              </div>
            </div>

            {product.specifications.length > 0 && (
              <div className="bg-surface sheet rounded-xl2 overflow-hidden">
                <div className="px-5 py-3 border-b border-line"><h3 className="font-display font-semibold text-ink">Specifications</h3></div>
                <dl className="font-mono text-sm">
                  {product.specifications.map(([k, v], idx) => (
                    <div key={k} className={`grid grid-cols-2 ${idx > 0 ? "sheet-row" : ""}`}>
                      <dt className="px-5 py-2.5 text-muted">{k}</dt>
                      <dd className="px-5 py-2.5 text-right text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {product.related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display font-bold text-2xl text-ink mb-6">Related items</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {product.related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
