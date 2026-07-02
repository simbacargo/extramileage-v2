import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsBrowser from "@/components/ProductsBrowser";

export const metadata: Metadata = {
  title: "Parts, Bikes & Machines — Extra Mileage Logistics",
};

export default function PartsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono text-sm text-muted">Loading…</div>}>
      <ProductsBrowser />
    </Suspense>
  );
}
