import type { InterviewCard } from "@/lib/content";
import AsmEmpty from "./AsmEmpty";

/**
 * Recorded-interview cards. Every entry is a video slot: the thumbnail is the
 * still, the duration chip sets the expectation, and the whole card becomes a
 * link the moment an interview carries a url. Until then it is a static card
 * rather than a dead link.
 */
export default function AsmInterviews({
  cards,
  columns = 4,
}: {
  cards: InterviewCard[];
  columns?: number;
}) {
  if (cards.length === 0) {
    return (
      <AsmEmpty
        label="No interviews yet"
        note="We film the faculty on site at every edition. The first conversations from this one publish after the day."
      />
    );
  }

  return (
    <div
      className="asm-row"
      style={{ ["--cols" as string]: columns, ["--cols-md" as string]: 2 }}
    >
      {cards.map(({ interview, person, orgLine }, i) => {
        const name = person
          ? `${person.firstName} ${person.lastName}`
          : interview.person;
        /* The live video wall publishes a person, a duration and a still —
           no episode titles. Where the title is just the name again, the card
           says it once. */
        const hasDistinctTitle =
          interview.title.trim().toLowerCase() !== name.trim().toLowerCase();

        const inner = (
          <>
            <figure
              className="asm-media is-duo is-scrim"
              style={{ ["--asm-aspect" as string]: "16 / 10" }}
              data-placeholder={interview.image?.placeholder ? "true" : undefined}
            >
              {interview.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={interview.image.sourceUrl}
                  alt={interview.image.alt}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              <figcaption>
                {interview.code} · {interview.durationMin} min
              </figcaption>
            </figure>

            <div
              style={{ padding: "var(--asm-pad-tight)", display: "grid", gap: 8 }}
            >
              <h3 className="asm-d3" style={{ fontSize: "1.1rem" }}>
                {hasDistinctTitle ? interview.title : name}
              </h3>
              {hasDistinctTitle ? (
                <p
                  className="asm-display"
                  style={{ fontSize: "0.95rem", lineHeight: 1 }}
                >
                  {name}
                </p>
              ) : null}
              {orgLine ? <p className="asm-meta">{orgLine}</p> : null}
              {interview.pullQuote ? (
                <p className="asm-body" style={{ fontSize: "0.9rem" }}>
                  “{interview.pullQuote}”
                </p>
              ) : null}
            </div>
          </>
        );

        return (
          <article key={interview.code} className="asm-card t-deep">
            {interview.url ? (
              <a href={interview.url} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              inner
            )}
          </article>
        );
      })}
    </div>
  );
}
