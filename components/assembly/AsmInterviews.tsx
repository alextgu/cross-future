 "use client";

import type { InterviewCard } from "@/lib/content";
import Link from "next/link";
import { useHorizontalRailScroll } from "@/lib/use-horizontal-rail-scroll";
import AsmEmpty from "./AsmEmpty";

/* These stills come from source videos whose filenames explicitly name the
   interviewee. Earlier generic source files are not identity evidence, so a
   placeholder portrait is safer than attaching the wrong face to a name. */
const VERIFIED_INTERVIEW_STILL_CODES = new Set([
  "IV.10",
  "IV.11",
  "IV.12",
  "IV.13",
  "IV.14",
  "IV.15",
  "IV.16",
  "IV.17",
  "IV.18",
]);

/**
 * Recorded-interview cards. Every entry is a video slot: the thumbnail is the
 * still, the duration chip sets the expectation, and the whole card becomes a
 * link to its permanent detail page. The detail page owns any external video
 * handoff, so each recording keeps one stable home as the archive grows.
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
  mediaVariant = "interview",
}: {
  cards: InterviewCard[];
  columns?: number;
  layout?: "grid" | "rail";
  mediaVariant?: "interview" | "portrait";
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
    const portrait = mediaVariant === "portrait" ? person?.headshot : undefined;
    const canUseInterviewStill =
      portrait?.placeholder &&
      interview.image &&
      VERIFIED_INTERVIEW_STILL_CODES.has(interview.code);
    const image =
      canUseInterviewStill
        ? interview.image
        : portrait ?? interview.image;
    const focalPoint = image === portrait ? portrait?.focalPoint : undefined;

    const inner = (
      <>
        <figure
          className={`asm-media is-duo${
            mediaVariant === "interview" ? " is-scrim" : ""
          }`}
          style={
            {
              "--asm-aspect": mediaVariant === "portrait" ? "4 / 5" : "16 / 10",
              ...(focalPoint
                ? { "--asm-fp": `${focalPoint.x}% ${focalPoint.y}%` }
                : {}),
            } as React.CSSProperties
          }
          data-placeholder={image?.placeholder ? "true" : undefined}
        >
          {image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image.sourceUrl}
              alt={image.alt}
              loading="lazy"
              decoding="async"
            />
          ) : null}
          {mediaVariant === "interview" ? (
            <figcaption>
              {interview.code} · {interview.durationMin} min
            </figcaption>
          ) : null}
        </figure>

        <div className="asm-interview-copy">
          <h3 className="asm-d3 asm-interview-name">
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
      <Link
        key={interview.code}
        className="asm-interview-link"
        href={`/interviews/${interview.slug}`}
      >
        <article className="asm-card t-deep">{inner}</article>
      </Link>
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
