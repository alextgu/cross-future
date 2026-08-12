import type { LetterItem } from "@/lib/content";
import AsmMedia from "./AsmMedia";
import AsmReveal from "./AsmReveal";

/**
 * Letters of support. Documents are shown as documents — full page, no
 * duotone, no crop — because the point of them is that they are real.
 */
export default function AsmLetters({ letters }: { letters: LetterItem[] }) {
  return (
    <div
      className="asm-row"
      style={{ ["--cols" as string]: Math.min(letters.length, 2) }}
    >
      {letters.map((letter, i) => (
        <AsmReveal
          key={letter.title + letter.issuer}
          as="article"
          delay={i * 80}
          className="asm-card is-padded t-plain"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {letter.crest ? (
              <div style={{ width: 46, flex: "none" }}>
                <AsmMedia media={letter.crest} aspect="1 / 1" duotone={false} />
              </div>
            ) : null}
            <div>
              <h3 className="asm-d3" style={{ fontSize: "1.15rem" }}>
                {letter.title}
              </h3>
              <p className="asm-meta">{letter.issuer}</p>
            </div>
          </div>

          <p className="asm-body" style={{ marginBottom: 20 }}>
            “{letter.excerpt}”
          </p>

          <AsmMedia media={letter.document} duotone={false} aspect="17 / 22" />

          <p className="asm-meta" style={{ marginTop: 14 }}>
            <time dateTime={letter.date}>
              {new Intl.DateTimeFormat("en-CA", { dateStyle: "long" }).format(
                new Date(letter.date)
              )}
            </time>
          </p>
        </AsmReveal>
      ))}
    </div>
  );
}
