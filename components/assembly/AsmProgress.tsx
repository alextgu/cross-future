import type { PastEdition } from "@/lib/content";
import AsmButton from "./AsmButton";
import AsmProgressCarousel from "./AsmProgressCarousel";
import AsmSection from "./AsmSection";

export default function AsmProgress({ editions }: { editions: PastEdition[] }) {
  if (editions.length === 0) return null;

  return (
    <AsmSection id="progress" label="Festival progress" space="major">
      <div className="asm-progress-surface">
        <div className="asm-progress-intro">
          <div>
            <p className="asm-eyebrow is-bare">Cross Future so far</p>
            <h2 className="asm-d2">What Cross Future could show</h2>
          </div>
          <p className="asm-body">
            Cross Future is designed as a long-term platform, not a one-off
            event. This interactive space can eventually bring its verified
            accomplishments, photography, and year-over-year momentum together.
          </p>
        </div>

        <p className="asm-progress-disclaimer">
          <strong>Mockup notice:</strong> All accomplishments, figures, and
          captions in this slideshow are fictional examples for layout review.
          Replace them with verified information before launch.
        </p>

        <AsmProgressCarousel />

        <div className="asm-progress-action">
          <p className="asm-meta">Verified edition records live separately.</p>
          <AsmButton href="/past-events" tone="ghost">
            Explore past events
          </AsmButton>
        </div>
      </div>
    </AsmSection>
  );
}
