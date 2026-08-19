"use client";

import { useEffect, useState } from "react";
import { partsUntil, type CountdownParts } from "@/lib/countdown";

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

/**
 * Time until the doors open.
 *
 * The value cannot be computed on the server — it depends on the reader's
 * clock, and a server-rendered figure would be wrong for anyone in another
 * timezone and stale by the time it arrived. So the first paint is a
 * skeleton, not a number: four tiles at the exact size of the real ones,
 * with a bar standing in for the figure and the real unit label already in
 * place. Printing 00 : 00 : 00 : 00 for a frame — which is what this used to
 * do — states a falsehood ("the summit is starting now") rather than
 * admitting it does not know yet.
 */
export default function AsmCountdown({ targetIso }: { targetIso: string }) {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    const targetMs = new Date(targetIso).getTime();
    const update = () => setParts(partsUntil(targetMs));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [targetIso]);

  const values = parts
    ? [parts.d, parts.h, parts.m, parts.s]
    : [null, null, null, null];

  return (
    <div
      className="asm-countdown"
      aria-label="Time until the summit"
      aria-busy={parts === null}
    >
      {UNITS.map((label, i) => {
        const value = values[i];
        return (
          <span className="asm-countdown-part" key={label}>
            {value === null ? (
              <span className="asm-skel asm-skel-num" aria-hidden="true" />
            ) : (
              <strong>{String(value).padStart(2, "0")}</strong>
            )}
            <small>{label}</small>
          </span>
        );
      })}
    </div>
  );
}
