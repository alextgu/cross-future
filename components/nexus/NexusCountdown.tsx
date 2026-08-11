"use client";

import { useEffect, useState } from "react";

interface Parts {
  d: number;
  h: number;
  m: number;
  s: number;
}

function partsUntil(target: number): Parts {
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1_000) % 60,
  };
}

/** Renders zeros on the server, starts ticking after mount. */
export default function NexusCountdown({ targetIso }: { targetIso: string }) {
  const [parts, setParts] = useState<Parts>({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    setParts(partsUntil(target));
    const timer = setInterval(() => setParts(partsUntil(target)), 1000);
    return () => clearInterval(timer);
  }, [targetIso]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="nx-countdown">
      <div className="days">{parts.d} D</div>
      <div className="rows" aria-live="off">
        <span>{pad(parts.h)}H</span>
        <span>{pad(parts.m)}M</span>
        <span>{pad(parts.s)}S</span>
      </div>
    </div>
  );
}
