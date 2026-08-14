import Link from "next/link";
import type { FactCard } from "@/lib/content";

/**
 * When / Where / For who — the three questions a conference page has to
 * answer above the fold, each in its own card so they survive the collapse
 * to one column without becoming a paragraph.
 *
 * The optional fourth cell is the ticket call to action, sitting in the same
 * row on the accent surface: the reference puts the answer to "how do I get
 * in?" alongside the facts rather than in a band of its own.
 */
export default function AsmFacts({
  facts,
  action,
}: {
  facts: FactCard[];
  action?: { label: string; href: string };
}) {
  const columns = facts.length + (action ? 1 : 0);

  return (
    <div className="asm-row" style={{ ["--cols" as string]: columns }}>
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

      {action ? (
        <Link
          className="asm-card is-padded t-accent asm-factcta"
          href={action.href}
        >
          <span>{action.label}</span>
          <span className="asm-factcta-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      ) : null}
    </div>
  );
}
