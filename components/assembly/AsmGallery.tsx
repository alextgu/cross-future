import type { MediaAsset } from "@/lib/content";
import AsmMedia from "./AsmMedia";
import AsmReveal from "./AsmReveal";

/**
 * Photo wall. A CSS-columns masonry rather than a grid, so images of mixed
 * aspect ratios sit together without being cropped to a common shape — the
 * archive is the one place the original framing matters.
 */
export default function AsmGallery({ items }: { items: MediaAsset[] }) {
  return (
    <div className="asm-gallery">
      {items.map((item, i) => (
        <AsmReveal
          key={item.src}
          as="figure"
          delay={(i % 3) * 60}
          className="asm-gallery-item"
        >
          <AsmMedia media={item} />
        </AsmReveal>
      ))}
    </div>
  );
}
