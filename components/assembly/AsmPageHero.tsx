import type { AssemblyPageIntro } from "@/lib/content";
import AsmMedia from "./AsmMedia";

/**
 * Inner-page hero. Shorter than the home hero and always the same shape, so
 * every route below the home page opens identically and the reader always
 * knows where they landed.
 */
export default function AsmPageHero({
  intro,
  aside,
}: {
  intro: AssemblyPageIntro;
  aside?: React.ReactNode;
}) {
  return (
    <header className="asm-stack">
      <div className="asm-card is-padded t-mist">
        <div className="asm-head">
          <div className="asm-head-title">
            <p className="asm-eyebrow">{intro.eyebrow}</p>
            <h1 className="asm-d1">{intro.title}</h1>
          </div>
          <div className="asm-head-aside">
            <p className="asm-lede">{intro.lede}</p>
            {aside}
          </div>
        </div>
      </div>

      {intro.media ? (
        <div className="asm-card t-plain">
          <AsmMedia media={intro.media} aspect="21 / 9" />
        </div>
      ) : null}
    </header>
  );
}
