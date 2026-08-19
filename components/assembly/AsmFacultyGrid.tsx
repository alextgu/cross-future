 "use client";

import type { FacultyMember } from "@/lib/content";
import { useHorizontalRailScroll } from "@/lib/use-horizontal-rail-scroll";
import AsmPersonCard from "./AsmPersonCard";
import AsmEmpty from "./AsmEmpty";

/**
 * The faculty in two shapes.
 *
 * `grid` is the roster page: portraits at reading size, wrapped in rows.
 * `strip` is every other page: one or two rows deep, the rest reached by
 * scrolling sideways. The roster is dozens of people — as a wrapped grid it
 * buried everything below it, and a section nobody can see past is worse
 * than a section that admits it is a sample. Two rows is the home page,
 * where the roster is the draw and one band undersold it.
 *
 * The strip is a focusable region with an accessible name, so it can be
 * reached and scrolled from the keyboard, not only by dragging.
 */
export default function AsmFacultyGrid({
  members,
  columns = 3,
  aspect,
  layout = "grid",
  rows = 1,
}: {
  members: FacultyMember[];
  columns?: number;
  aspect?: string;
  layout?: "grid" | "strip";
  rows?: 1 | 2;
}) {
  const { ref: stripRef, scroll: scrollStrip, canScrollBack, canScrollForward } =
    useHorizontalRailScroll();

  if (members.length === 0) {
    return (
      <AsmEmpty
        label="Roster in progress"
        note="Speakers appear here as each one confirms. Nobody is listed before they have agreed to the date."
      />
    );
  }

  if (layout === "strip") {
    const strip = (
      <div
        className="asm-facultystrip"
        ref={stripRef}
        data-rows={rows}
        tabIndex={0}
        role="group"
        aria-label={`${members.length} confirmed speakers — scroll sideways for more`}
      >
        {members.map((member) => (
          <AsmPersonCard
            key={member.person.slug}
            member={member}
            /* Two rows of 3/4 portraits is a screen and a half; the shallower
               crop keeps both bands in view and pays for the role line. */
            aspect={aspect ?? (rows === 2 ? "4 / 5" : "3 / 4")}
          />
        ))}
      </div>
    );

    return (
      <div className="asm-railwrap">
        <button
          type="button"
          className="asm-railcue is-start"
          onClick={() => scrollStrip(-1)}
          disabled={!canScrollBack}
          aria-label="Scroll faculty to the left"
        >
          ‹
        </button>
        {strip}
        <button
          type="button"
          className="asm-railcue is-end"
          onClick={() => scrollStrip(1)}
          disabled={!canScrollForward}
          aria-label="Scroll faculty to the right"
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
      {members.map((member) => (
        <AsmPersonCard key={member.person.slug} member={member} aspect={aspect} />
      ))}
    </div>
  );
}
