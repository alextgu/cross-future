import type { MediaAsset } from "@/lib/content";
import AsmButton from "./AsmButton";
import AsmMedia from "./AsmMedia";

/** Closing call to action. One card, one decision. */
export default function AsmCta({
  title,
  text,
  primary,
  secondary,
  media,
}: {
  title: string;
  text: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  media?: MediaAsset;
}) {
  return (
    <section
      className="asm-card t-accent"
      style={{ display: "grid", gridTemplateColumns: media ? undefined : "1fr" }}
    >
      <div className="asm-split" style={{ ["--split" as string]: "1.1fr 1fr" }}>
        <div
          style={{
            padding: "var(--asm-pad)",
            display: "grid",
            gap: 20,
            alignContent: "center",
          }}
        >
          <h2 className="asm-d1">{title}</h2>
          <p className="asm-lede">{text}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <AsmButton href={primary.href} tone="inverse">
              {primary.label}
            </AsmButton>
            {secondary ? (
              <AsmButton href={secondary.href} tone="ghost" arrow={false}>
                {secondary.label}
              </AsmButton>
            ) : null}
          </div>
        </div>
        {media ? <AsmMedia media={media} bleed /> : null}
      </div>
    </section>
  );
}
