import type { StoryChapter } from "@/lib/content";
import AsmGlyph from "./AsmGlyph";
import AsmMedia from "./AsmMedia";

/**
 * "The making of" — numbered chapters alternating text card / media card so
 * the eye zig-zags down the page. The alternation is index-driven rather than
 * hand-placed, so adding a fourth chapter keeps the rhythm.
 */
export default function AsmStory({ chapters }: { chapters: StoryChapter[] }) {
  return (
    <div className="asm-stack">
      {chapters.map((chapter, i) => {
        const mediaFirst = i % 2 === 1;

        const text = (
          <div className="asm-card is-padded t-mist asm-chapter">
            <div className="asm-chapter-top">
              <AsmGlyph glyph={chapter.glyph} />
              <span className="asm-chapter-num">{chapter.num}</span>
            </div>
            <div />
            <div style={{ display: "grid", gap: 16 }}>
              <h3 className="asm-d2">{chapter.title}</h3>
              <p className="asm-body">{chapter.text}</p>
            </div>
          </div>
        );

        const media = (
          <div className="asm-card t-plain">
            <AsmMedia media={chapter.media} bleed />
          </div>
        );

        return (
          <div key={chapter.num} className="asm-split">
            {mediaFirst ? media : text}
            {mediaFirst ? text : media}
          </div>
        );
      })}
    </div>
  );
}
