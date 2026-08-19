import type { LetterItem } from "@/lib/content";
import AsmMedia from "./AsmMedia";

/**
 * Letters of support. Documents are shown as documents — full page, no
 * duotone, no crop — because the point of them is that they are real.
 */
export default function AsmLetters({ letters }: { letters: LetterItem[] }) {
  return (
    <div className="asm-letters">
      {letters.map((letter) => (
        <article key={letter.title + letter.issuer} className="asm-card asm-certificate">
          <h3 className="asm-sr">
            {letter.title} — {letter.issuer}
          </h3>
          <AsmMedia media={letter.document} duotone={false} aspect="17 / 22" />
        </article>
      ))}
    </div>
  );
}
