import Link from "next/link";
import type { Site } from "@/lib/types";

export default function Footer({ site }: { site: Site }) {
  const socials = Object.entries(site.social_links || {});
  return (
    <footer className="mt-24 bg-brand text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <span className="sun-dot" style={{ boxShadow: "0 0 0 4px rgba(228,0,43,.18)" }} />
              <span className="font-display font-bold text-white text-lg">EXTRA MILEAGE</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">{site.site_description}</p>
            {socials.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socials.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-accent flex items-center justify-center transition-colors capitalize text-[11px] font-mono"
                  >
                    {name.slice(0, 2)}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-mono text-[.7rem] tracking-[.2em] uppercase text-white/50 mb-4">Inventory</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/cars" className="hover:text-white">All Cars</Link></li>
              <li><Link href="/cars?sort=newest" className="hover:text-white">New Arrivals</Link></li>
              <li><Link href="/parts" className="hover:text-white">Parts &amp; Machines</Link></li>
              <li><Link href="/auctions" className="hover:text-white">Live Auctions</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-mono text-[.7rem] tracking-[.2em] uppercase text-white/50 mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/register" className="hover:text-white">Create Account</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-mono text-[.7rem] tracking-[.2em] uppercase text-white/50 mb-4">Head Office</h4>
            <p className="text-sm leading-relaxed">{site.company_address}</p>
            <p className="mt-3 text-sm">
              <span className="text-white/50">Tel</span>{" "}
              <a href={`tel:${site.contact_phone}`} className="font-mono hover:text-white">{site.contact_phone}</a>
            </p>
            <p className="text-sm">
              <span className="text-white/50">Email</span>{" "}
              <a href={`mailto:${site.contact_email}`} className="font-mono hover:text-white">{site.contact_email}</a>
            </p>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {site.site_name}. All rights reserved.</p>
          <p className="font-mono">SHIBUYA · TOKYO · 150-0002 · JP</p>
        </div>
      </div>
    </footer>
  );
}
