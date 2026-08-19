import type { FocusArea, MediaAsset } from "@/lib/content";
import AsmMedia from "./AsmMedia";

/**
 * The four key areas. Each carries a track code, so the curriculum and this
 * block cannot drift — both render from tracks[] via the seed builder.
 */
export default function AsmFocus({
  areas,
  hero,
  id,
}: {
  areas: FocusArea[];
  hero?: MediaAsset;
  /** Anchor target — the block carries its own heading, so the id goes here
      rather than on a section head that would repeat it. */
  id?: string;
}) {
  return (
    <div className="asm-stack" id={id}>
      {hero ? (
        <div
          className="asm-split asm-focushero"
          style={{ ["--split" as string]: "1fr 1fr" }}
        >
          <div className="asm-card t-plain">
            <AsmMedia media={hero} bleed />
          </div>
          <div className="asm-card is-padded t-deep">
            <p className="asm-eyebrow">Focus</p>
            <h2 className="asm-d2" style={{ margin: "16px 0 18px" }}>
              Key areas of focus and topics
            </h2>
            <p className="asm-lede">
              Four tracks pinned to one electrical chain, from the
              interconnection queue to the rack. Every session on the day sits
              on one of these nodes.
            </p>
          </div>
        </div>
      ) : null}

      <div className="asm-row" style={{ ["--cols" as string]: 4, ["--cols-md" as string]: 2 }}>
        {areas.map((area, i) => (
          /* No image per card. The four stand-ins were four grey rectangles
             in a row under an opener that already carries a picture, and the
             text is the content here. */
          <article key={area.code} className="asm-card is-padded t-plain">
            <div style={{ display: "grid", gap: 12 }}>
              <span className="asm-chip">{area.code}</span>
              <h3 className="asm-d3">{area.title}</h3>
              <p className="asm-body" style={{ fontSize: "0.92rem" }}>
                {area.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
