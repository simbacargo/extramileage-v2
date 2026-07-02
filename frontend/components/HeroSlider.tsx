"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/types";

export default function HeroSlider({ slides, siteName }: { slides: Slide[]; siteName: string }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setI((v) => (v + 1) % n), [n]);
  const prev = () => setI((v) => (v - 1 + n) % n);

  const start = useCallback(() => {
    stop();
    timer.current = setInterval(next, 6500);
  }, [next]);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
  };

  useEffect(() => {
    start();
    return stop;
  }, [start]);

  if (n === 0) return null;

  return (
    <section className="relative bg-ink" onMouseEnter={stop} onMouseLeave={start}>
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
        {slides.map((s, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/10" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                <div className="max-w-xl text-white">
                  <p className="flex items-center gap-2.5 font-mono text-xs tracking-[.2em] uppercase text-white/70"><span className="sun-dot" /> {siteName}</p>
                  <h1 className="mt-4 font-display font-bold text-4xl sm:text-6xl leading-[1.03]">{s.title}</h1>
                  <p className="mt-4 text-white/80 text-lg">{s.subtitle}</p>
                  <Link href={s.link || "/cars"} className="mt-7 inline-flex items-center gap-2 bg-accent hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg">
                    {s.button_text} <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} className={`h-2.5 rounded-full transition-all ${idx === i ? "w-8 bg-accent" : "w-2.5 bg-white/60 hover:bg-white"}`} />
        ))}
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white/15 hover:bg-white/30 text-white text-xl backdrop-blur z-10" aria-label="Previous">‹</button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full bg-white/15 hover:bg-white/30 text-white text-xl backdrop-blur z-10" aria-label="Next">›</button>
    </section>
  );
}
