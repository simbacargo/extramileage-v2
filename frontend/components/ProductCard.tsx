import Link from "next/link";
import type { Product } from "@/lib/types";
import { money } from "@/lib/api";
import WishlistButton from "./WishlistButton";

export default function ProductCard({ product }: { product: Product }) {
  const href = `/parts/${product.slug}`;
  return (
    <article className="group bg-surface sheet rounded-xl2 overflow-hidden shadow-card hover-lift flex flex-col">
      <div className="relative aspect-[4/3] bg-paper overflow-hidden">
        <Link href={href} className="block w-full h-full">
          {product.thumbnail ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={product.thumbnail} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full grid place-items-center text-muted font-mono text-xs">NO IMAGE</div>
          )}
        </Link>
        <span className="absolute top-3 left-3 font-mono text-[11px] font-semibold bg-ink/85 text-white px-2 py-1 rounded-md">#{product.stock_id}</span>
        <div className="absolute top-3 right-3">
          <WishlistButton kind="product" id={product.id} />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="font-mono text-[.68rem] tracking-[.12em] uppercase text-brand-400">{product.category?.name || "Part"}</span>
        <h3 className="mt-1 font-display font-semibold text-ink leading-snug">
          <Link href={href} className="hover:text-brand">{product.name} {product.model}</Link>
        </h3>
        <div className="mt-auto pt-4 flex items-end justify-between border-t border-line mt-3">
          <div>
            <p className="text-[.62rem] text-muted uppercase tracking-eyebrow">Price</p>
            <p className="font-mono font-semibold text-lg text-ink">${money(product.price)}</p>
          </div>
          <span className="text-[.66rem] text-muted uppercase tracking-wide">{product.condition_display}</span>
        </div>
      </div>
    </article>
  );
}
