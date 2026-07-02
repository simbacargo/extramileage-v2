"use client";

import { useEffect, useState } from "react";

export default function ForSaleModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("emForSale")) {
      const t = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("emForSale", "1");
      }, 5000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="This website is for sale"
          className="fixed bottom-4 left-4 z-[80] group flex items-center gap-2.5 bg-surface sheet shadow-lift rounded-full pl-3 pr-4 py-2 hover-lift"
        >
          <span className="sun-dot" />
          <span className="text-left leading-tight">
            <span className="block font-semibold text-xs text-ink">This site is for sale</span>
            <span className="block font-mono text-[.66rem] text-muted group-hover:text-accent">Tap to enquire →</span>
          </span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-surface rounded-xl2 shadow-lift overflow-hidden sheet animate-[fadeup_.3s_ease-out]">
            <div className="bg-brand text-white px-6 pt-6 pb-8 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(228,0,43,.35), transparent 60%)" }} />
              <button onClick={() => setOpen(false)} aria-label="Close" className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white">&times;</button>
              <p className="flex items-center gap-2.5 font-mono text-[.7rem] tracking-[.2em] uppercase text-white/70"><span className="sun-dot" /> Exclusive opportunity</p>
              <h2 className="mt-3 font-display font-bold text-2xl leading-tight">This website is for sale</h2>
              <p className="mt-2 text-white/80 text-sm">A complete, production-ready Japanese car-export marketplace — cars, parts, live auctions &amp; accounts. Yours to acquire.</p>
            </div>

            <div className="px-6 py-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">Contact the owner</p>
              <a href="tel:0745829410" className="mt-1 block font-mono font-bold text-3xl text-ink hover:text-accent transition">0745 829 410</a>

              <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
                <a href="tel:0745829410" className="flex-1 flex items-center justify-center gap-2 bg-brand hover:bg-brand-600 text-white font-semibold py-3 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" /></svg>
                  Call now
                </a>
                <a href="https://wa.me/254745829410?text=Hi, I'm interested in buying the Extra Mileage website." target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 border border-line hover:border-accent hover:text-accent text-ink font-semibold py-3 rounded-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.5-4-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.7 1.8c.1.2 0 .4 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 .1.7 2.1.9 2.4 1 .3.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.7.8c.3.1.5.2.5.3.1.1.1.6-.1 1.2Z" /></svg>
                  WhatsApp
                </a>
              </div>

              <button onClick={() => setOpen(false)} className="mt-3 w-full text-center text-xs text-muted hover:text-ink">Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
