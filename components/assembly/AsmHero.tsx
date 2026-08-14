import type { AssemblyContent, Edition } from "@/lib/content";
import AsmButton from "./AsmButton";
import AsmMedia from "./AsmMedia";

/**
 * The home hero, laid out as the reference mosaic: one oversized type card
 * carrying the name and the date, and a stacked pair of media tiles beside it
 * pointing at the two things the site wants — read the agenda, register.
 *
 * The type card is flat sky tint with the headline in accent blue. That pair
 * is 3.48:1, which is below the 4.5:1 body threshold and above the 3:1 large
 * text one — so the blue is reserved for the display line and nothing else on
 * this card. The kicker and the lede run in petrol ink, which `t-tint` already
 * steps down for them.
 *
 * The tiles are the video slots. The signature clip sits in the upper tile and
 * loads with priority; the lower tile carries the ticket clip. Both are
 * duotoned and scrimmed by AsmMedia, so the headline weight of the card next
 * to them never has to compete with raw footage.
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
      <div className="asm-card is-padded t-tint asm-heromain">
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
          <AsmMedia media={assembly.heroMedia} bleed scrim priority />
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
