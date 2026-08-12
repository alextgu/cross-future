import type { AssemblyContent, Edition } from "@/lib/content";
import { formatEditionDate, formatEditionHours } from "@/lib/content";
import { ASSEMBLY_BASE, ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import AsmMedia from "./AsmMedia";

/**
 * The reference layout puts a flat pale card behind an oversized headline;
 * the live Cross Future site puts a video behind it. This does both: the clip
 * fills the card, the duotone and scrim flatten it to the palette, and the
 * headline sits on top at display scale. Reserve the clip and the headline
 * still reads — the media is never load-bearing for the message.
 */
export default function AsmHero({
  edition,
  assembly,
}: {
  edition: Edition;
  assembly: AssemblyContent;
}) {
  return (
    <header className="asm-card t-deep asm-hero" id="top">
      <AsmMedia media={assembly.heroMedia} bleed scrim priority />

      <div className="asm-hero-inner">
        <p className="asm-eyebrow">{assembly.heroKicker}</p>

        <h1 className="asm-d0 asm-hero-title">
          {assembly.heroLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>

        <p className="asm-lede" style={{ maxWidth: "52ch", textAlign: "center" }}>
          {edition.heroStatement ?? edition.tagline}
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <AsmButton href={ASSEMBLY_REGISTER} tone="inverse">
            Register — {formatEditionDate(edition, { month: "short", day: "numeric" })}
          </AsmButton>
          <AsmButton href={`${ASSEMBLY_BASE}/agenda`} tone="ghost" arrow={false}>
            {formatEditionHours(edition)}
          </AsmButton>
        </div>
      </div>
    </header>
  );
}
