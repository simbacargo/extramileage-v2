"use client";

import { useEffect, useState } from "react";

function format(target: number): string {
  const diff = target - Date.now();
  if (diff <= 0) return "Ended";
  const s = Math.floor(diff / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

export default function Countdown({ end, className }: { end: string; className?: string }) {
  const target = new Date(end).getTime();
  const [label, setLabel] = useState("—");

  useEffect(() => {
    const tick = () => setLabel(format(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return <span className={className}>{label}</span>;
}
