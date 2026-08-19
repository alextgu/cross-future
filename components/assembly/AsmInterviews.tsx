 "use client";

import type { InterviewCard } from "@/lib/content";
import { useHorizontalRailScroll } from "@/lib/use-horizontal-rail-scroll";
import AsmEmpty from "./AsmEmpty";

/**
 * Recorded-interview cards. Every entry is a video slot: the thumbnail is the
 * still, the duration chip sets the expectation, and the whole card becomes a
 * link the moment an interview carries a url. Until then it is a static card
 * rather than a dead link.
 *
 * Two layouts. `grid` wraps into rows and is what the media archive wants,
 * where the interviews are the page. `rail` is the home page: two rows deep,
 * the rest reached by scrolling sideways, so the whole archive is on offer
 * without a wall of cards burying every section under it. The rail is a
 * focusable region with an accessible name, so it scrolls from the keyboard.
 */
export default function AsmInterviews({
  cards,
  columns = 4,
  layout = "grid",
}: {
  cards: InterviewCard[];
  columns?: number;
  layout?: "grid" | "rail";
}) {
  const { ref: railRef, scroll: scrollRail, canScrollBack, canScrollForward } =
    useHorizontalRailScroll();

  if (cards.length === 0) {
    return (
      <AsmEmpty
        label="No interviews yet"
        note="We film the faculty on site at every edition. The first conversations from this one publish after the day."
      />
    );
  }

  const items = cards.map(({ interview, person, orgLine }) => {
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

        <div style={{ padding: "var(--asm-pad-tight)", display: "grid", gap: 8 }}>
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
  });

  if (layout === "rail") {
    return (
      <div className="asm-railwrap">
        <button
          type="button"
          className="asm-railcue is-start"
          onClick={() => scrollRail(-1)}
          disabled={!canScrollBack}
          aria-label="Scroll interviews to the left"
        >
          ‹
        </button>
        <div
          className="asm-rail is-interviews"
          ref={railRef}
          tabIndex={0}
          role="group"
          aria-label={`${cards.length} recorded interviews — scroll sideways for more`}
        >
          {items}
        </div>
        <button
          type="button"
          className="asm-railcue is-end"
          onClick={() => scrollRail(1)}
          disabled={!canScrollForward}
          aria-label="Scroll interviews to the right"
        >
          ›
        </button>
      </div>
    );
  }

  return (
    <div
      className="asm-row"
      style={{ ["--cols" as string]: columns, ["--cols-md" as string]: 2 }}
    >
      {items}
    </div>
  );
}
