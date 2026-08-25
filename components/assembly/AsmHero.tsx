import type { AssemblyContent, Edition } from "@/lib/content";
import AsmButton from "./AsmButton";
import { AsmMark } from "./AsmLogo";
import AsmMedia from "./AsmMedia";

export default function AsmHero({ assembly }: {
  edition: Edition;
  assembly: AssemblyContent;
}) {
  const { ticket } = assembly.rail;

  return (
    <header className="asm-future-hero" id="top" data-tone="neutral">
      <AsmMedia
        media={assembly.heroMedia}
        bleed
        duotone={false}
        scrim={false}
        priority
      />

      <div className="asm-future-copy is-minimal">
        <div className="asm-future-brand">
          <AsmMark />
          <h1>Cross Future</h1>
        </div>
        <h2 aria-label="Shaping the future of AI, innovating for tomorrow.">
          Shaping the future of <mark className="asm-future-highlight">AI</mark>,
          {" "}innovating for <u className="asm-future-underline">tomorrow</u>.
        </h2>
        <div
          className="asm-future-actions"
          role="group"
          aria-label="Event registration"
          data-cta-size="compact"
          data-layout="headline"
        >
          <span className="asm-future-event-details">
            <strong>Montréal, Canada</strong>
            <span>October 8, 2026 · 9 AM–5 PM</span>
          </span>
          <AsmButton href={ticket.ctaHref} arrow={false}>
            Register Now
          </AsmButton>
        </div>
      </div>
    </header>
  );
}
