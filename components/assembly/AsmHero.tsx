import type { AssemblyContent, Edition } from "@/lib/content";
import AsmButton from "./AsmButton";
import AsmMedia from "./AsmMedia";

/**
 * The home hero, laid out as the reference mosaic: one oversized type card
 * carrying the name and the date, and a stacked pair of media tiles beside it
 * pointing at the two things the site wants — watch the interviews, register.
 *
 * The type card carries the summit's own venue footage, bled to the card edge
 * and scrimmed. Display type sits straight on top, so the card runs on the
 * inverse ink ramp rather than the sky tint it used while the slot was empty.
 *
 * The side tiles are the secondary slots. Both are duotoned and scrimmed by
 * AsmMedia, so the headline weight of the card next to them never has to
 * compete with raw footage.
 */
export default function AsmHero({
  edition,
  assembly,
}: {
  edition: Edition;
  assembly: AssemblyContent;
}) {
  const { feature, ticket } = assembly.rail;

  return (
    <header className="asm-heromosaic" id="top">
      <div className="asm-card is-padded asm-heromain">
        <AsmMedia media={assembly.heroMedia} bleed scrim priority />

        <p className="asm-eyebrow">{assembly.heroKicker}</p>

        <h1 className="asm-d0 asm-heromain-title">
          {assembly.heroLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        <p className="asm-lede asm-heromain-lede">
          {edition.heroStatement ?? edition.tagline}
        </p>
      </div>

      <div className="asm-heroside">
        <article className="asm-card asm-herotile">
          <AsmMedia media={feature.media} bleed scrim />
          <div className="asm-herotile-inner">
            <h2 className="asm-herotile-title">{feature.title}</h2>
            <AsmButton href={feature.ctaHref} tone="ghost" arrow={false}>
              {feature.ctaLabel}
            </AsmButton>
          </div>
        </article>

        <article className="asm-card asm-herotile is-tall">
          <AsmMedia media={ticket.media} bleed scrim />
          <div className="asm-herotile-inner">
            <h2 className="asm-herotile-title">{ticket.title}</h2>
            <p className="asm-herotile-text">{ticket.text}</p>
            <AsmButton href={ticket.ctaHref} tone="inverse">
              {ticket.ctaLabel}
            </AsmButton>
          </div>
        </article>
      </div>
    </header>
  );
}
