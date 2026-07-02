"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { SavedSearch } from "@/lib/types";

const LABELS: Record<string, string> = {
  q: "Keyword", brand: "Brand", category: "Type", fuel: "Fuel",
  transmission: "Transmission", condition: "Condition", steering: "Steering",
  year_min: "Year from", year_max: "Year to", price_min: "Price from",
  price_max: "Price to", sort: "Sort",
};

/** Human-readable chips describing a saved query's filters. */
function chips(query: string): string[] {
  const p = new URLSearchParams(query);
  const out: string[] = [];
  p.forEach((value, key) => {
    if (key === "page" || !value) return;
    out.push(`${LABELS[key] || key}: ${value}`);
  });
  return out.length ? out : ["All vehicles"];
}

export default function SavedSearches() {
  const { token } = useAuth();
  const [items, setItems] = useState<SavedSearch[] | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    apiGet<SavedSearch[]>("/saved-searches/", { token }).then(setItems).catch(() => setItems([]));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: number) => {
    setItems((prev) => prev?.filter((s) => s.id !== id) ?? prev);
    try { await apiSend("/saved-searches/" + id + "/", "DELETE", undefined, token); } catch { load(); }
  };

  const toggleAlerts = async (s: SavedSearch) => {
    setItems((prev) => prev?.map((x) => (x.id === s.id ? { ...x, alerts: !x.alerts } : x)) ?? prev);
    try { await apiSend("/saved-searches/" + s.id + "/", "PATCH", { alerts: !s.alerts }, token); } catch { load(); }
  };

  const markSeen = async (s: SavedSearch) => {
    if (s.new_matches === 0) return;
    setItems((prev) => prev?.map((x) => (x.id === s.id ? { ...x, new_matches: 0 } : x)) ?? prev);
    try { await apiSend("/saved-searches/" + s.id + "/seen/", "POST", undefined, token); } catch { load(); }
  };

  if (items === null) return null; // not loaded yet

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-ink">Saved searches</h2>
        <Link href="/cars" className="text-sm font-semibold text-brand hover:text-accent">New search →</Link>
      </div>

      {items.length === 0 ? (
        <div className="sheet rounded-xl2 bg-surface p-10 text-center">
          <p className="text-muted">No saved searches yet.</p>
          <p className="text-sm text-muted mt-1">Filter the inventory, then hit “Save this search” to track new arrivals.</p>
          <Link href="/cars" className="inline-block mt-4 bg-brand text-white font-semibold px-5 py-2.5 rounded-lg">Browse cars</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((s) => (
            <div key={s.id} className="bg-surface sheet rounded-xl2 p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display font-semibold text-ink truncate">{s.name}</p>
                  <p className="text-xs text-muted mt-0.5">{s.matches} matching {s.matches === 1 ? "car" : "cars"}</p>
                </div>
                {s.new_matches > 0 && (
                  <span className="shrink-0 text-xs font-semibold bg-accent/10 text-accent rounded-full px-2.5 py-1">
                    {s.new_matches} new
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {chips(s.query).map((c) => (
                  <span key={c} className="text-xs bg-paper text-muted rounded-md px-2 py-1">{c}</span>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line text-sm">
                <Link
                  href={`/cars${s.query ? `?${s.query}` : ""}`}
                  onClick={() => markSeen(s)}
                  className="font-semibold text-brand hover:text-accent"
                >
                  View results →
                </Link>
                <button
                  onClick={() => toggleAlerts(s)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${s.alerts ? "text-brand" : "text-muted"}`}
                  title={s.alerts ? "Alerts on — click to mute" : "Alerts off — click to enable"}
                >
                  <svg className="w-3.5 h-3.5" fill={s.alerts ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0" />
                  </svg>
                  {s.alerts ? "Alerts on" : "Alerts off"}
                </button>
                <button onClick={() => remove(s.id)} className="ml-auto text-xs text-muted hover:text-red-600">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
