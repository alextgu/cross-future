import type { MediaAsset } from "@/lib/content";
import AsmVideo from "./AsmVideo";

/**
 * The single door for every image and every clip in Design C.
 *
 * Why one component: the design carries a lot of media and it arrives from
 * different sources at different times. Routing all of it through here means
 * the aspect box, focal point, duotone flattening, lazy loading and the
 * placeholder marker are decided once, not per call site — so dropping real
 * photography in later cannot shift the layout.
 */
export default function AsmMedia({
  media,
  className = "",
  /** Flatten to the palette. On by default; off for logos and documents. */
  duotone = true,
  /** Dark gradient for text sitting on top of the media. */
  scrim = false,
  /** Fill the parent instead of holding its own aspect box. */
  bleed = false,
  /** Square off the corners (used inside already-rounded cards). */
  square = false,
  aspect,
  priority = false,
  sizes,
}: {
  media: MediaAsset;
  className?: string;
  duotone?: boolean;
  scrim?: boolean;
  bleed?: boolean;
  square?: boolean;
  aspect?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const ratio = aspect ?? media.aspect ?? "16 / 9";
  const fp = media.focalPoint
    ? `${media.focalPoint.x}% ${media.focalPoint.y}%`
    : undefined;

  const classes = [
    "asm-media",
    duotone ? "is-duo" : "",
    scrim ? "is-scrim" : "",
    bleed ? "is-bleed" : "",
    square ? "is-square" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    "--asm-aspect": ratio,
    ...(fp ? { "--asm-fp": fp } : {}),
  } as React.CSSProperties;

  const caption = media.caption ? (
    <figcaption>
      {media.caption}
      {media.credit ? <span className="asm-sr"> — {media.credit}</span> : null}
    </figcaption>
  ) : null;

  if (media.kind === "video") {
    return (
      <AsmVideo
        media={media}
        className={classes}
        style={style}
        caption={caption}
      />
    );
  }

  return (
    <figure
      className={classes}
      style={style}
      data-placeholder={media.placeholder ? "true" : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.src}
        alt={media.alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        sizes={sizes}
      />
      {caption}
    </figure>
  );
}
