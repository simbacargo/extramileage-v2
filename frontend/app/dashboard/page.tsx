"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Car, Product } from "@/lib/types";
import CarCard from "@/components/CarCard";
import SavedSearches from "@/components/SavedSearches";

interface WishlistItem {
  id: number;
  kind: "car" | "product";
  car: Car | null;
  product: Product | null;
  created: string;
}

export default function DashboardPage() {
  const { user, ready, token, savedCars, savedProducts } = useAuth();
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

  const savedCarItems = (items || []).filter((i) => i.car).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4">
        <span className="w-14 h-14 rounded-full bg-brand text-white grid place-items-center font-mono text-lg">{user.initials}</span>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Hi, {user.display_name}</h1>
          <p className="text-muted text-sm">{user.email}{user.country ? ` · ${user.country}` : ""}</p>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <div className="bg-surface sheet rounded-xl2 p-5"><p className="font-mono font-bold text-3xl text-ink">{savedCars.size}</p><p className="text-sm text-muted">Saved vehicles</p></div>
        <div className="bg-surface sheet rounded-xl2 p-5"><p className="font-mono font-bold text-3xl text-ink">{savedProducts.size}</p><p className="text-sm text-muted">Saved parts</p></div>
        <div className="bg-surface sheet rounded-xl2 p-5"><p className="font-mono font-bold text-3xl text-ink">{savedCars.size + savedProducts.size}</p><p className="text-sm text-muted">Total saved</p></div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-ink">Saved vehicles</h2>
          <Link href="/wishlist" className="text-sm font-semibold text-brand hover:text-accent">View all →</Link>
        </div>
        {savedCarItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {savedCarItems.map((item) => item.car && <CarCard key={item.id} car={item.car} />)}
          </div>
        ) : (
          <div className="sheet rounded-xl2 bg-surface p-10 text-center">
            <p className="text-muted">No saved vehicles yet.</p>
            <Link href="/cars" className="inline-block mt-4 bg-brand text-white font-semibold px-5 py-2.5 rounded-lg">Browse cars</Link>
          </div>
        )}
      </div>

      <SavedSearches />
    </div>
  );
}
