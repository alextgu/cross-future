import AsmButton from "./AsmButton";

export type AsmTone = "plain" | "mist" | "tint" | "deep" | "accent";

/**
 * The header card that opens every section: bracketed mono eyebrow, oversized
 * display heading, and an optional lede plus action sitting bottom-right.
 * Sections never write their own header markup — the rhythm of the page comes
 * from this being identical everywhere.
 */
export default function AsmSectionHead({
  eyebrow,
  title,
  lede,
  action,
  tone = "mist",
  size = "d1",
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  action?: { label: string; href: string };
  tone?: AsmTone;
  size?: "d1" | "d2";
  id?: string;
}) {
  const solo = !lede && !action;
  return (
    <div className={`asm-card is-padded t-${tone}`} id={id}>
      <div className={`asm-head${solo ? " is-solo" : ""}`}>
        <div className="asm-head-title">
          <p className="asm-eyebrow">{eyebrow}</p>
          <h2 className={`asm-${size}`}>{title}</h2>
        </div>
        {solo ? null : (
          <div className="asm-head-aside">
            {lede ? <p className="asm-lede">{lede}</p> : null}
            {action ? (
              <AsmButton
                href={action.href}
                tone={tone === "deep" || tone === "accent" ? "inverse" : "accent"}
              >
                {action.label}
              </AsmButton>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
