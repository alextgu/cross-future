import type { PastEdition } from "@/lib/content";
import AsmButton from "./AsmButton";
import AsmMedia from "./AsmMedia";
import AsmSection from "./AsmSection";

export default function AsmProgress({ editions }: { editions: PastEdition[] }) {
  if (editions.length === 0) return null;

  return (
    <AsmSection id="progress" label="Festival progress" space="major">
      <div className="asm-progress-intro">
        <div>
          <p className="asm-eyebrow is-bare">Cross Future so far</p>
          <h2 className="asm-d2">Built edition by edition</h2>
        </div>
        <p className="asm-body">
          Cross Future is designed as a long-term platform, not a one-off event.
          Each edition builds community, institutional support, and a visible
          record of progress. Together, these milestones form the completed
          foundation behind what comes next.
        </p>
      </div>

      <div className="asm-progress-grid">
        {editions.map((edition) => (
          <article className="asm-card t-mist asm-progress-card" key={edition.year}>
            <AsmMedia media={edition.media} aspect="16 / 10" />
            <div className="asm-progress-card-copy">
              <div className="asm-progress-card-head">
                <p className="asm-meta">
                  {edition.label} · {edition.city}
                </p>
                <p className="asm-display">{edition.year}</p>
              </div>
              <h3 className="asm-d3">{edition.headline}</h3>
              {edition.highlights.length > 0 ? (
                <ul className="asm-progress-highlights">
                  {edition.highlights.map((highlight) => (
                    <li className="asm-body" key={highlight}>
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
              <dl className="asm-progress-stats">
                {edition.stats.map((stat) => (
                  <div key={stat.label}>
                    <dd className="asm-d3">{stat.value}</dd>
                    <dt className="asm-meta">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>

      <div className="asm-progress-action">
        <AsmButton href="/past-events" tone="ghost">
          Explore past events
        </AsmButton>
      </div>
    </AsmSection>
  );
}
