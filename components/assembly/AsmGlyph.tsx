import type { FeatureGlyph } from "@/lib/content";

/**
 * Flat geometric marks used the way the reference layout uses them: one per
 * numbered chapter or feature, sitting alone in the top-left of a card as
 * punctuation. Pure shape, currentColor, no strokes to scale badly.
 */
const PATHS: Record<FeatureGlyph, React.ReactNode> = {
  // Two half-discs facing away — the chapter opener.
  chip: (
    <>
      <path d="M0 0h14a18 18 0 0 1 0 36H0z" />
      <path d="M64 0H50a18 18 0 0 0 0 36h14z" />
    </>
  ),
  // Four squares with one corner rounded — the grid.
  grid: (
    <>
      <path d="M0 0h28v28H0z" />
      <path d="M36 0h28v28H36a0 0 0 0 1 0 0z" opacity="0.55" />
      <path d="M0 36h28v28H0z" opacity="0.55" />
      <path d="M50 36a14 14 0 0 1 14 14v14H36V50a14 14 0 0 1 14-14z" />
    </>
  ),
  // A bolt reduced to two triangles.
  bolt: (
    <>
      <path d="M34 0 6 36h20L30 64 58 26H36z" />
    </>
  ),
  // Four petals — the node.
  node: (
    <>
      <circle cx="17" cy="17" r="17" />
      <circle cx="47" cy="17" r="17" />
      <circle cx="17" cy="47" r="17" />
      <circle cx="47" cy="47" r="17" />
    </>
  ),
  // Three stacked arcs — the wave.
  wave: (
    <>
      <path d="M0 12a16 16 0 0 1 32 0 16 16 0 0 0 32 0v10a16 16 0 0 1-32 0 16 16 0 0 0-32 0z" />
      <path
        d="M0 42a16 16 0 0 1 32 0 16 16 0 0 0 32 0v10a16 16 0 0 1-32 0 16 16 0 0 0-32 0z"
        opacity="0.55"
      />
    </>
  ),
  // A four-point star — the cross.
  cross: (
    <>
      <path d="M32 0c0 17.7 14.3 32 32 32-17.7 0-32 14.3-32 32 0-17.7-14.3-32-32-32C17.7 32 32 17.7 32 0z" />
    </>
  ),
};

export default function AsmGlyph({
  glyph,
  className = "",
}: {
  glyph: FeatureGlyph;
  className?: string;
}) {
  return (
    <svg
      className={`asm-glyph ${className}`.trim()}
      viewBox="0 0 64 64"
      fill="currentColor"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[glyph]}
    </svg>
  );
}
