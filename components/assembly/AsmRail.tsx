import type { RailContent } from "@/lib/content";
import AsmButton from "./AsmButton";
import AsmMedia from "./AsmMedia";

/**
 * The sticky right-hand rail: a media card that points at the agenda, then a
 * ticket stub. It follows the reader down every page, so the two things the
 * site actually wants — read the agenda, register — are never more than a
 * glance away and never interrupt the main column to say so.
 *
 * Below 1180px the rail unsticks and lays out as two cards side by side; below
 * 720px it stacks. Content comes from the seed so a page can pass its own.
 */
export default function AsmRail({ rail }: { rail: RailContent }) {
  const { feature, ticket } = rail;

  return (
    <aside className="asm-railcol" aria-label="Agenda and registration">
      <div className="asm-railfeature">
        <AsmMedia media={feature.media} bleed scrim />
        <div className="asm-railfeature-inner">
          <h2 className="asm-d3">{feature.title}</h2>
          <AsmButton href={feature.ctaHref} tone="ghost" arrow={false}>
            {feature.ctaLabel}
          </AsmButton>
        </div>
      </div>

      <div className="asm-ticket t-deep">
        <div className="asm-ticket-body">
          <AsmMedia media={ticket.media} aspect="16 / 10" />
          <h2 className="asm-d3">{ticket.title}</h2>
          <p className="asm-lede">{ticket.text}</p>
        </div>

        <div className="asm-ticket-perf" aria-hidden="true" />

        <dl className="asm-ticket-stub">
          {ticket.stub.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="asm-ticket-foot">
          <AsmButton href={ticket.ctaHref} tone="inverse" block>
            {ticket.ctaLabel}
          </AsmButton>
        </div>
      </div>
    </aside>
  );
}
