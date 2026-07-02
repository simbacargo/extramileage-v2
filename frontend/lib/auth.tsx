"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiSend } from "./api";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
  savedCars: Set<number>;
  savedProducts: Set<number>;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
  logout: () => void;
  refreshUser: (u: User) => void;
  toggleWishlist: (kind: "car" | "product", id: number) => Promise<boolean>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [savedCars, setSavedCars] = useState<Set<number>>(new Set());
  const [savedProducts, setSavedProducts] = useState<Set<number>>(new Set());

  const loadWishlist = useCallback(async (tk: string) => {
    try {
      const ids = await apiGet<{ cars: number[]; products: number[] }>("/wishlist/ids/", { token: tk });
      setSavedCars(new Set(ids.cars));
      setSavedProducts(new Set(ids.products));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const tk = localStorage.getItem("em_token");
    if (tk) {
      setToken(tk);
      apiGet<User>("/auth/me/", { token: tk })
        .then((u) => { setUser(u); loadWishlist(tk); })
        .catch(() => { localStorage.removeItem("em_token"); })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [loadWishlist]);

  const persist = (tk: string, u: User) => {
    localStorage.setItem("em_token", tk);
    setToken(tk); setUser(u); loadWishlist(tk);
  };

  const login = async (username: string, password: string) => {
    const data = await apiSend<{ token: string; user: User }>("/auth/login/", "POST", { username, password });
    persist(data.token, data.user);
  };

  const register = async (payload: Record<string, string>) => {
    const data = await apiSend<{ token: string; user: User }>("/auth/register/", "POST", payload);
    persist(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem("em_token");
    setToken(null); setUser(null);
    setSavedCars(new Set()); setSavedProducts(new Set());
  };

  const refreshUser = (u: User) => setUser(u);

  const toggleWishlist = async (kind: "car" | "product", id: number) => {
    const res = await apiSend<{ active: boolean; count: number }>("/wishlist/toggle/", "POST", { kind, id }, token);
    const setter = kind === "car" ? setSavedCars : setSavedProducts;
    setter((prev) => {
      const next = new Set(prev);
      if (res.active) next.add(id); else next.delete(id);
      return next;
    });
    return res.active;
  };

  return (
    <Ctx.Provider value={{ user, token, ready, savedCars, savedProducts, login, register, logout, refreshUser, toggleWishlist }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
