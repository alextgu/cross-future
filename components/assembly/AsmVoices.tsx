import type { VoiceItem } from "@/lib/content";

/**
 * Pull quotes. Sourced, not invented — each one attributes to the document or
 * body it came from, so the block carries evidence rather than testimonial
 * filler.
 */
export default function AsmVoices({ voices }: { voices: VoiceItem[] }) {
  return (
    <div className="asm-row" style={{ ["--cols" as string]: voices.length }}>
      {voices.map((voice, i) => (
        <figure
          key={voice.quote.slice(0, 40)}
          className="asm-card is-padded t-plain"
        >
          <blockquote
            className="asm-d3"
            style={{ fontSize: "1.18rem", lineHeight: 1.25, marginBottom: 22 }}
          >
            “{voice.quote}”
          </blockquote>
          <figcaption style={{ display: "grid", gap: 3 }}>
            <span
              className="asm-display"
              style={{ fontSize: "1rem", lineHeight: 1 }}
            >
              {voice.name}
            </span>
            <span className="asm-meta">{voice.role}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
