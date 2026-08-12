import type { FactCard } from "@/lib/content";

/**
 * When / Where / For who — the three questions a conference page has to
 * answer above the fold, each in its own card so they survive the collapse
 * to one column without becoming a paragraph.
 */
export default function AsmFacts({ facts }: { facts: FactCard[] }) {
  return (
    <div className="asm-row" style={{ ["--cols" as string]: facts.length }}>
      {facts.map((fact) => (
        <dl className="asm-card is-padded t-plain asm-fact" key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>
            {fact.lines.map((line) => (
              <span key={line} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </dd>
        </dl>
      ))}
    </div>
  );
}
