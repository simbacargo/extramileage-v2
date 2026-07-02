"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Car, Product } from "@/lib/types";
import CarCard from "@/components/CarCard";
import ProductCard from "@/components/ProductCard";

interface WishlistItem {
  id: number;
  kind: "car" | "product";
  car: Car | null;
  product: Product | null;
  created: string;
}

export default function WishlistPage() {
  const { user, ready, token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[] | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => {
    if (!token) return;
    apiGet<WishlistItem[]>("/wishlist/", { token }).then(setItems).catch(() => setItems([]));
  }, [token]);

  if (!ready || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display font-bold text-3xl text-ink">Saved items</h1>
      <p className="text-muted mt-1">Your shortlisted vehicles and parts.</p>

      {items === null ? (
        <div className="py-24 text-center font-mono text-sm text-muted animate-pulse">Loading…</div>
      ) : items.length > 0 ? (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) =>
            item.car ? <CarCard key={`c${item.id}`} car={item.car} /> :
            item.product ? <ProductCard key={`p${item.id}`} product={item.product} /> : null
          )}
        </div>
      ) : (
        <div className="mt-8 sheet rounded-xl2 bg-surface p-16 text-center">
          <p className="font-display font-semibold text-xl text-ink">Nothing saved yet</p>
          <p className="text-muted mt-2">Tap the heart on any vehicle or part to save it here.</p>
          <Link href="/cars" className="inline-block mt-5 bg-brand text-white font-semibold px-5 py-2.5 rounded-lg">Browse inventory</Link>
        </div>
      )}
    </div>
  );
}
