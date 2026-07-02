"use client";

import { useState } from "react";
import type { CarImage } from "@/lib/types";

export default function Gallery({ images, alt, stockId }: { images: CarImage[]; alt: string; stockId: string }) {
  const [active, setActive] = useState(0);
  const count = images.length;

  return (
    <div>
      <div className="relative bg-paper sheet rounded-xl2 overflow-hidden aspect-[16/11]">
        {count > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={images[active].url} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted font-mono">NO IMAGE</div>
        )}
        <span className="absolute top-4 left-4 font-mono text-xs bg-ink/85 text-white px-2.5 py-1.5 rounded-md">#{stockId}</span>
        {count > 1 && (
          <>
            <button onClick={() => setActive((a) => (a - 1 + count) % count)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-white/90 sheet hover:bg-white">‹</button>
            <button onClick={() => setActive((a) => (a + 1) % count)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full bg-white/90 sheet hover:bg-white">›</button>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
          {images.map((img, idx) => (
            <button key={idx} onClick={() => setActive(idx)} className={`aspect-square rounded-lg overflow-hidden bg-paper sheet ${active === idx ? "ring-2 ring-brand" : "opacity-70 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
