"use client";

import { useMemo, useState } from "react";
import type { PastEdition } from "@/lib/content";
import AsmMedia from "./AsmMedia";

export default function AsmPastEventsMockup({
  editions,
}: {
  editions: PastEdition[];
}) {
  const sorted = useMemo(
    () => [...editions].sort((a, b) => b.year - a.year),
    [editions]
  );
  const [activeYear, setActiveYear] = useState<number>(sorted[0]?.year ?? 0);
  const active =
    sorted.find((edition) => edition.year === activeYear) ?? sorted[0] ?? null;

  if (!active) return null;

  return (
    <section className="asm-past-mockup" aria-label="Past events archive">
      <div className="asm-past-tabs" role="tablist" aria-label="Past event years">
        {sorted.map((edition) => {
          const isActive = edition.year === active.year;
          return (
            <button
              key={edition.year}
              type="button"
              className="asm-past-tab"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveYear(edition.year)}
            >
              {edition.year}
            </button>
          );
        })}
      </div>

      <div className="asm-past-panel">
        <div className="asm-card is-padded t-mist">
          <div className="asm-head is-solo">
            <div className="asm-head-title">
              <p className="asm-meta">
                {active.label} · {active.city}
              </p>
              <h2 className="asm-d2">{active.headline}</h2>
            </div>
          </div>

          <dl className="asm-past-stats">
            {active.stats.map((stat) => (
              <div key={stat.label}>
                <dd className="asm-display">{stat.value}</dd>
                <dt className="asm-meta">{stat.label}</dt>
              </div>
            ))}
          </dl>

          {active.highlights.length > 0 ? (
            <div className="asm-past-highlights">
              <p className="asm-meta">What moved forward</p>
              <ul>
                {active.highlights.map((highlight) => (
                  <li className="asm-body" key={highlight}>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="asm-card t-plain">
          <AsmMedia media={active.media} aspect="21 / 9" />
        </div>

      </div>
    </section>
  );
}
