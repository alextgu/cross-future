import type { ArchiveItem } from "@/lib/content";
import Reveal from "./Reveal";

/**
 * Innovation section: the source design's nav promises "06 — Archives"
 * but never delivers a section — and gives photography almost no room.
 * This is that missing section, built as a photo wall: mixed-ratio frames,
 * edition tags, mono captions. Swap the placeholder art for real event
 * photography by editing archives[] in the content source.
 */
export default function NexusArchives({ items }: { items: ArchiveItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="nx-section" id="archives" aria-labelledby="nx-archives-h">
      <div className="nx-container">
        <div className="nx-section-head">
          <div>
            <p className="nx-seclabel">§ 06 / ARCHIVES</p>
            <h2 className="nx-h2" id="nx-archives-h">
              Field Notes
            </h2>
          </div>
          <p className="nx-section-hint">
            Photographic record of past editions — the classroom, documented.
          </p>
        </div>

        <div className="nx-archive-grid">
          {items.map((item, index) => (
            <Reveal
              as="figure"
              key={item.image.sourceUrl}
              className={`nx-photo${index % 3 === 0 ? " tall" : ""}`}
            >
              <span className="frame">
                <img
                  src={item.image.sourceUrl}
                  alt={item.image.alt}
                  width={640}
                  height={480}
                  loading="lazy"
                />
              </span>
              <figcaption>
                <span className="ed">{item.edition}</span>
                <span>{item.caption}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
