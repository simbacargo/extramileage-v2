import Link from "next/link";
import type { Car } from "@/lib/types";
import { money } from "@/lib/api";
import WishlistButton from "./WishlistButton";

export default function CarCard({ car }: { car: Car }) {
  const href = `/cars/${car.slug}`;
  return (
    <article className="group bg-surface sheet rounded-xl2 overflow-hidden shadow-card hover-lift flex flex-col">
      <div className="relative aspect-[4/3] bg-paper overflow-hidden">
        <Link href={href} className="block w-full h-full">
          {car.thumbnail ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={car.thumbnail} alt={car.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full grid place-items-center text-muted font-mono text-xs">NO IMAGE</div>
          )}
        </Link>
        <span className="absolute top-3 left-3 font-mono text-[11px] font-semibold tracking-wide bg-ink/85 text-white px-2 py-1 rounded-md backdrop-blur">#{car.stock_id}</span>
        <div className="absolute top-3 right-3">
          <WishlistButton kind="car" id={car.id} />
        </div>
        {car.featured && (
          <span className="absolute bottom-3 left-3 text-[10px] font-semibold tracking-eyebrow uppercase bg-accent text-white px-2 py-1 rounded-md">Featured</span>
        )}
        {car.origin_country?.flag_emoji && (
          <span className="absolute bottom-3 right-3 text-lg drop-shadow" title={car.origin_country.name}>{car.origin_country.flag_emoji}</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[.68rem] tracking-[.12em] uppercase text-brand-400">{car.brand?.name || car.make}</span>
          <span className="text-[.68rem] text-muted uppercase tracking-wide">{car.condition_display}</span>
        </div>
        <h3 className="mt-1 font-display font-semibold text-ink leading-snug">
          <Link href={href} className="hover:text-brand">{car.title}</Link>
        </h3>

        <div className="mt-3 grid grid-cols-3 gap-px bg-line sheet rounded-lg overflow-hidden text-center">
          <div className="bg-surface py-2">
            <p className="font-mono text-[.8rem] text-ink">{money(car.mileage)}</p>
            <p className="text-[.6rem] text-muted uppercase tracking-wide">km</p>
          </div>
          <div className="bg-surface py-2">
            <p className="font-mono text-[.8rem] text-ink">{car.transmission.slice(0, 4).toUpperCase()}</p>
            <p className="text-[.6rem] text-muted uppercase tracking-wide">trans</p>
          </div>
          <div className="bg-surface py-2">
            <p className="font-mono text-[.8rem] text-ink">{car.fuel_type.slice(0, 4).toUpperCase()}</p>
            <p className="text-[.6rem] text-muted uppercase tracking-wide">fuel</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-line flex items-end justify-between">
          <div>
            <p className="text-[.62rem] text-muted uppercase tracking-eyebrow">CIF Price</p>
            <p className="font-mono font-semibold text-lg text-ink">${money(car.cif_price || car.price)}</p>
          </div>
          <Link href={href} className="text-xs font-semibold text-brand hover:text-accent flex items-center gap-1">
            Details <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
