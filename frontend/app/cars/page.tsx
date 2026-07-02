import { Suspense } from "react";
import type { Metadata } from "next";
import CarsBrowser from "@/components/CarsBrowser";

export const metadata: Metadata = {
  title: "Used Cars for Export — Extra Mileage Logistics",
};

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono text-sm text-muted">Loading…</div>}>
      <CarsBrowser />
    </Suspense>
  );
}
