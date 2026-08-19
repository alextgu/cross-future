import AsmButton from "./AsmButton";

export type AsmTone = "plain" | "mist" | "tint" | "deep" | "accent";

/**
 * The band that opens every section: a hairline rule, a mono eyebrow, the
 * title, and an optional lede and action on the same line.
 *
 * It used to be a padded card with display type up to 6rem — seven of them on
 * the home page came to a third of its height, and every section arrived
 * behind a slab instead of starting. A section head is a label, not a
 * landmark; the cards below it are the content.
 *
 * Sections never write their own header markup, so the rhythm of the page
 * comes from this being identical everywhere.
 */
export default function AsmSectionHead({
  eyebrow,
  title,
  lede,
  action,
  tone = "plain",
  id,
  space,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  action?: { label: string; href: string };
  /** Only decides which button treatment reads on the surrounding ground. */
  tone?: AsmTone;
  id?: string;
  /** How far this section stands off the one above it. Default is the plain
      section break; `tight` is a section that continues the previous one,
      `major` is the break the page is built around. */
  space?: "tight" | "major";
}) {
  return (
    <header className="asm-sechead" id={id} data-space={space}>
      <p className="asm-eyebrow">{eyebrow}</p>
      <h2 className="asm-sechead-title">{title}</h2>
      {lede ? <p className="asm-sechead-lede">{lede}</p> : null}
      {action ? (
        <div className="asm-sechead-action">
          <AsmButton
            href={action.href}
            tone={tone === "deep" || tone === "accent" ? "inverse" : "ghost"}
          >
            {action.label}
          </AsmButton>
        </div>
      ) : null}
    </header>
  );
}
