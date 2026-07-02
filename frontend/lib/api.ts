export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.extramileage.co.tz/api";

type GetOpts = { revalidate?: number; token?: string | null };

export async function apiGet<T>(path: string, opts: GetOpts = {}): Promise<T> {
  const { revalidate, token } = opts;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Token ${token}` } : {},
    ...(revalidate !== undefined ? { next: { revalidate } } : { cache: "no-store" }),
  });
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return res.json();
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
  token?: string | null
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.detail || Object.values(data)[0])) || `Request failed (${res.status})`;
    throw new Error(Array.isArray(msg) ? msg[0] : String(msg));
  }
  return data as T;
}

export function money(v: string | number | null | undefined): string {
  const n = Number(v ?? 0);
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
