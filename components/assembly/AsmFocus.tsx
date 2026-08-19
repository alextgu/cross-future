"use client";

import type { FocusArea, MediaAsset } from "@/lib/content";
import AsmMedia from "./AsmMedia";

/**
 * Four program tracks in one row. Each cell is a photograph over a title
 * and a line of text — the photos are placeholders until real pictures from
 * the day land in the seed, and the layout does not move when they do.
 *
 * Rows are only links when `href` is given; a cell that leads nowhere stays
 * plain. The track list on this same page is an empty string, not a missing
 * prop: that still makes each cell a link to its own agenda anchor.
 */
export default function AsmFocus({
  areas,
  hero,
  id,
  href,
}: {
  areas: FocusArea[];
  hero?: MediaAsset;
  /** Anchor target — the block carries its own heading, so the id goes here
      rather than on a section head that would repeat it. */
  id?: string;
  /** Where a cell points, minus the track anchor. */
  href?: string;
}) {
  const shortText = (text: string) =>
    text.match(/^[^.?!]+[.?!]/)?.[0] ?? text;

  return (
    <div className="asm-stack" id={id}>
      {hero ? (
        <div
          className="asm-split asm-focushero"
          style={{ ["--split" as string]: "1fr 1fr" }}
        >
          <div className="asm-focusintro-media">
            <AsmMedia media={hero} bleed />
          </div>
          <div className="asm-focusintro-copy">
            <p className="asm-eyebrow">Focus</p>
            <h2 className="asm-d2">Key areas of focus and topics</h2>
            <p className="asm-lede">
              Four tracks pinned to one electrical chain, from the
              interconnection queue to the rack. Every session on the day sits
              on one of these nodes.
            </p>
          </div>
        </div>
      ) : null}

      <ol
        className="asm-focusgrid"
        style={{ ["--cols" as string]: Math.max(areas.length, 1) }}
      >
        {areas.map((area) => {
          const viewHref = href !== undefined ? `${href}#track-${area.code}` : null;
          return (
            <li key={area.code} className="asm-focuscell">
              <p className="asm-track-kicker">{area.code}</p>
              <h3 className="asm-focus-bigtitle">{area.title}</h3>
              <p className="asm-track-text">{shortText(area.text)}</p>
              {viewHref ? (
                <p className="asm-meta">
                  <a href={viewHref}>View sessions ↗</a>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
