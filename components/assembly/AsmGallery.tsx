import type { MediaAsset } from "@/lib/content";
import AsmMedia from "./AsmMedia";
import AsmEmpty from "./AsmEmpty";

/**
 * Photo wall. A CSS-columns masonry rather than a grid, so images of mixed
 * aspect ratios sit together without being cropped to a common shape — the
 * archive is the one place the original framing matters.
 */
export default function AsmGallery({ items }: { items: MediaAsset[] }) {
  if (items.length === 0) {
    return (
      <AsmEmpty
        label="Photographs pending"
        note="The photographic record of an edition is made on the day. Past editions are in the archive."
      />
    );
  }

  return (
    <div className="asm-gallery">
      {items.map((item, i) => (
        <figure key={item.src} className="asm-gallery-item">
          <AsmMedia media={item} />
        </figure>
      ))}
    </div>
  );
}
