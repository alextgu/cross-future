import type { FocusArea, MediaAsset } from "@/lib/content";
import AsmMedia from "./AsmMedia";
import AsmReveal from "./AsmReveal";

/**
 * The four key areas. Each carries a track code, so the curriculum and this
 * block cannot drift — both render from tracks[] via the seed builder.
 */
export default function AsmFocus({
  areas,
  hero,
}: {
  areas: FocusArea[];
  hero?: MediaAsset;
}) {
  return (
    <div className="asm-stack">
      {hero ? (
        <div className="asm-split" style={{ ["--split" as string]: "1fr 1fr" }}>
          <div className="asm-card t-plain">
            <AsmMedia media={hero} bleed />
          </div>
          <div className="asm-card is-padded t-deep">
            <p className="asm-eyebrow">Focus</p>
            <h2 className="asm-d1" style={{ margin: "18px 0 20px" }}>
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
          <AsmReveal
            key={area.code}
            as="article"
            delay={i * 60}
            className="asm-card t-plain"
          >
            {area.media ? <AsmMedia media={area.media} aspect="3 / 2" /> : null}
            <div style={{ padding: "var(--asm-pad-tight)", display: "grid", gap: 12 }}>
              <span className="asm-chip">{area.code}</span>
              <h3 className="asm-d3">{area.title}</h3>
              <p className="asm-body" style={{ fontSize: "0.92rem" }}>
                {area.text}
              </p>
            </div>
          </AsmReveal>
        ))}
      </div>
    </div>
  );
}
