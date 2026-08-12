import type { FeatureItem, StatItem } from "@/lib/content";
import AsmGlyph from "./AsmGlyph";

/**
 * The reference layout's "essentials" block: one tinted section card holding
 * a features strip and a row of oversized statistics. Nesting them inside a
 * single card is what makes it read as one statement rather than five.
 *
 * Stats are passed in rather than hardcoded — the home page derives them from
 * the content (faculty count, tracks, interviews, partners) so they cannot go
 * stale when the roster changes.
 */
export default function AsmEssentials({
  eyebrow,
  title,
  features,
  stats,
}: {
  eyebrow: string;
  title: string;
  features: FeatureItem[];
  stats: StatItem[];
}) {
  return (
    <section className="asm-card is-padded t-tint">
      <div className="asm-head" style={{ marginBottom: "var(--asm-pad)" }}>
        <div className="asm-head-title">
          <p className="asm-eyebrow">{eyebrow}</p>
          <h2 className="asm-d1">{title}</h2>
        </div>
      </div>

      <div
        className="asm-card is-padded t-mist"
        style={{ marginBottom: "var(--asm-gap)" }}
      >
        <h3 className="asm-eyebrow" style={{ marginBottom: 24 }}>
          Key features
        </h3>
        <div className="asm-row" style={{ ["--cols" as string]: features.length }}>
          {features.map((feature) => (
            <div key={feature.title} style={{ display: "grid", gap: 12 }}>
              <AsmGlyph glyph={feature.glyph} className="is-small" />
              <h4 className="asm-d3" style={{ fontSize: "1.05rem" }}>
                {feature.title}
              </h4>
              <p className="asm-body" style={{ fontSize: "0.92rem" }}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="asm-row" style={{ ["--cols" as string]: stats.length, ["--cols-md" as string]: 2 }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="asm-card is-padded t-mist asm-stat"
          >
            <span className="asm-stat-value">{stat.value}</span>
            <span />
            <span className="asm-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
