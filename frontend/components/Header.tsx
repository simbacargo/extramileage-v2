"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { Site } from "@/lib/types";

export default function Header({ site }: { site: Site }) {
  const { user, ready, logout, savedCars, savedProducts } = useAuth();
  const [open, setOpen] = useState(false);
  const [acct, setAcct] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const acctRef = useRef<HTMLDivElement>(null);
  const wishlistCount = savedCars.size + savedProducts.size;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcct(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const nav = [
    { href: "/cars", label: "Cars" },
    { href: "/parts", label: "Parts" },
    { href: "/auctions", label: "Auctions", live: true },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 border-b border-line transition-shadow ${scrolled ? "shadow-[0_1px_0_#E6E9EE,0_8px_30px_rgba(12,20,34,.06)]" : ""}`}
      style={{ background: "rgba(255,255,255,.82)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4 relative">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="sun-dot" />
            <span className="leading-none">
              <span className="font-display font-bold text-[1.05rem] tracking-tight text-ink block">EXTRA MILEAGE</span>
              <span className="font-mono text-[.6rem] tracking-[.34em] text-muted uppercase">Logistics · Japan</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-ink/80">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="py-1 hover:text-brand flex items-center gap-1.5">
                {n.label}
                {n.live && <span className="live-dot w-1.5 h-1.5 rounded-full bg-accent" />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/cars" className="hidden sm:flex items-center gap-2 text-sm text-muted hover:text-ink px-3 py-2 rounded-lg border border-line bg-surface">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <span className="hidden md:inline">Search stock</span>
            </Link>

            {ready && user ? (
              <>
                <Link href="/wishlist" className="relative p-2 rounded-lg hover:bg-paper" title="Saved">
                  <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.2 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z" /></svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">{wishlistCount}</span>
                  )}
                </Link>
                <div className="relative" ref={acctRef}>
                  <button onClick={() => setAcct((v) => !v)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-line bg-surface hover:shadow-card">
                    <span className="w-7 h-7 rounded-full bg-brand text-white text-xs font-semibold flex items-center justify-center font-mono">{user.initials}</span>
                    <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  {acct && (
                    <div className="absolute right-0 mt-2 w-52 bg-surface sheet rounded-xl shadow-lift py-1.5 text-sm">
                      <div className="px-4 py-2 border-b border-line">
                        <p className="font-semibold text-ink truncate">{user.display_name}</p>
                        <p className="text-xs text-muted truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setAcct(false)} className="block px-4 py-2 hover:bg-paper">Dashboard</Link>
                      <Link href="/wishlist" onClick={() => setAcct(false)} className="block px-4 py-2 hover:bg-paper">Saved vehicles</Link>
                      <Link href="/profile" onClick={() => setAcct(false)} className="block px-4 py-2 hover:bg-paper">Profile</Link>
                      <button onClick={() => { setAcct(false); logout(); }} className="w-full text-left px-4 py-2 hover:bg-paper text-accent border-t border-line mt-1 pt-2">Sign out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline text-sm font-medium text-ink px-3 py-2 hover:text-brand">Sign in</Link>
                <Link href="/register" className="text-sm font-semibold text-white bg-brand hover:bg-brand-600 px-4 py-2 rounded-lg">Register</Link>
              </>
            )}

            <button onClick={() => setOpen((v) => !v)} className="lg:hidden p-2 rounded-lg hover:bg-paper" aria-label="Menu">
              <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          {open && (
            <div className="absolute top-16 inset-x-0 bg-surface border-b border-line shadow-lift lg:hidden px-6 py-4 space-y-1">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-2.5 font-medium">{n.label}</Link>
              ))}
              {!user && <Link href="/login" onClick={() => setOpen(false)} className="block py-2.5 font-medium text-brand">Sign in</Link>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
