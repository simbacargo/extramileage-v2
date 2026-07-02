"use client";

import Link from "next/link";
import { useState } from "react";
import { apiSend } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { SavedSearch } from "@/lib/types";

/** Save the current car-filter query so the user can re-run it and get alerts. */
export default function SaveSearchButton({ query }: { query: string }) {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  if (!user) {
    return (
      <Link href="/login" className="text-xs text-accent hover:underline">
        Sign in to save this search
      </Link>
    );
  }

  const save = async () => {
    setState("saving");
    setError("");
    try {
      await apiSend<SavedSearch>(
        "/saved-searches/",
        "POST",
        { name: name.trim() || "My search", query },
        token
      );
      setState("saved");
      setOpen(false);
      setName("");
      setTimeout(() => setState("idle"), 2500);
    } catch (e) {
      setState("idle");
      setError(e instanceof Error ? e.message : "Could not save search");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-brand hover:text-accent inline-flex items-center gap-1"
      >
        {state === "saved" ? (
          <>✓ Search saved</>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
            </svg>
            Save this search
          </>
        )}
      </button>
    );
  }

  return (
    <div className="w-full space-y-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="Name this search"
        className="w-full bg-paper rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="flex-1 bg-brand text-white text-xs font-semibold rounded-lg py-2 disabled:opacity-60"
        >
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        <button onClick={() => setOpen(false)} className="px-3 text-xs text-muted hover:text-ink">
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
