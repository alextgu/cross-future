/**
 * A top-level region of a page — the thing the nav links to, the thing that
 * has (or could have) its own heading: About, Interviews, Speakers, Focus,
 * Agenda, Partners, Contact.
 *
 * Vertical rhythm lives here and nowhere else. Everything inside a section is
 * a component and carries no outer margin of its own: a card, a rail, a row
 * of facts and a section head are all just parts of one region, spaced by the
 * section's own internal gap. Section distance is for the seam between two
 * regions, which is why the fact cards under the hero belong inside the hero
 * section rather than floating at section distance beneath it.
 *
 * `space` is the relationship to the region above: `tight` continues the same
 * subject, `major` is the break the page is built around.
 */
export default function AsmSection({
  children,
  id,
  space,
  flow,
  label,
  labelledBy,
}: {
  children: React.ReactNode;
  /** Anchor target and nav destination. Sections own their id — a section
      head is a label inside the region, not the region itself. */
  id?: string;
  space?: "tight" | "major";
  /** Internal rhythm. `head` is the default — a section head over its
      content. `tile` is a region whose parts are one mosaic and sit at the
      tile gap, like the hero and the fact cards beneath it. */
  flow?: "head" | "tile";
  label?: string;
  labelledBy?: string;
}) {
  return (
    <section
      className="asm-section"
      id={id}
      data-space={space}
      data-flow={flow}
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}
