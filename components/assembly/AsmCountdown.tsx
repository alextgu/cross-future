"use client";

import { useEffect, useState } from "react";
import { partsUntil, type CountdownParts } from "@/lib/countdown";

const ZERO: CountdownParts = { d: 0, h: 0, m: 0, s: 0 };

export default function AsmCountdown({ targetIso }: { targetIso: string }) {
  const [parts, setParts] = useState<CountdownParts>(ZERO);

  useEffect(() => {
    const targetMs = new Date(targetIso).getTime();
    const update = () => setParts(partsUntil(targetMs));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [targetIso]);

  const values = [
    { label: "Days", value: parts.d },
    { label: "Hours", value: parts.h },
    { label: "Minutes", value: parts.m },
    { label: "Seconds", value: parts.s },
  ];

  return (
    <div className="asm-countdown" aria-label="Time until the summit">
      {values.map(({ label, value }) => (
        <span className="asm-countdown-part" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}
