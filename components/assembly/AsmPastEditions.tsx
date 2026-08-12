import type { PastEdition } from "@/lib/content";
import AsmMedia from "./AsmMedia";
import AsmReveal from "./AsmReveal";

/** Past editions and key resources. The current year is marked, not hidden. */
export default function AsmPastEditions({
  editions,
  currentYear,
}: {
  editions: PastEdition[];
  currentYear: number;
}) {
  return (
    <div className="asm-row" style={{ ["--cols" as string]: editions.length }}>
      {editions.map((past, i) => {
        const isCurrent = past.year === currentYear;
        return (
          <AsmReveal
            key={past.label}
            as="article"
            delay={i * 70}
            className={`asm-card ${isCurrent ? "t-deep" : "t-plain"}`}
          >
            <AsmMedia media={past.media} aspect="16 / 10" />
            <div
              style={{
                padding: "var(--asm-pad-tight)",
                display: "grid",
                gap: 14,
              }}
            >
              <div
                style={{ display: "flex", gap: 8, alignItems: "center" }}
              >
                <span className="asm-chip">{past.label}</span>
                {isCurrent ? (
                  <span className="asm-chip is-solid">This year</span>
                ) : null}
              </div>
              <h3 className="asm-d3">
                {past.year} · {past.city}
              </h3>
              <p className="asm-body" style={{ fontSize: "0.92rem" }}>
                {past.headline}
              </p>
              <dl style={{ display: "flex", gap: 24, marginTop: 4 }}>
                {past.stats.map((stat) => (
                  <div key={stat.label}>
                    <dd
                      className="asm-display"
                      style={{ fontSize: "1.5rem", lineHeight: 1 }}
                    >
                      {stat.value}
                    </dd>
                    <dt className="asm-meta" style={{ marginTop: 4 }}>
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
          </AsmReveal>
        );
      })}
    </div>
  );
}
