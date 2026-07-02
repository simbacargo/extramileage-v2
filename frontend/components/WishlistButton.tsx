"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function WishlistButton({ kind, id }: { kind: "car" | "product"; id: number }) {
  const { user, savedCars, savedProducts, toggleWishlist } = useAuth();
  const [busy, setBusy] = useState(false);
  const active = kind === "car" ? savedCars.has(id) : savedProducts.has(id);

  const heart = (fill: boolean) => (
    <svg className="w-[18px] h-[18px]" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M19 14c1.49-1.46 3-3.2 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );

  if (!user) {
    return (
      <Link
        href="/login"
        title="Sign in to save"
        className="grid place-items-center w-9 h-9 rounded-full border border-line bg-white/90 text-ink hover:text-accent hover:border-accent backdrop-blur transition"
      >
        {heart(false)}
      </Link>
    );
  }

  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        try {
          await toggleWishlist(kind, id);
        } catch {
          /* ignore */
        } finally {
          setBusy(false);
        }
      }}
      aria-pressed={active}
      title={active ? "Remove from saved" : "Save"}
      className={`grid place-items-center w-9 h-9 rounded-full border backdrop-blur transition disabled:opacity-60 ${
        active ? "bg-accent border-accent text-white" : "bg-white/90 border-line text-ink hover:border-accent hover:text-accent"
      }`}
      disabled={busy}
    >
      {heart(active)}
    </button>
  );
}
