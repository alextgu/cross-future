import type { ManifestoBlock } from "@/lib/content";
import Reveal from "./Reveal";

export default function NexusManifesto({ manifesto }: { manifesto: ManifestoBlock }) {
  return (
    <section className="nx-section" id="manifesto" aria-labelledby="nx-manifesto-h">
      <div className="nx-container nx-manifesto-grid">
        <div className="nx-manifesto-rail">
          <p className="nx-seclabel">{manifesto.sectionLabel}</p>
          <p className="nx-seclabel" style={{ color: "var(--nx-text-faint)" }}>
            {manifesto.sublabel}
          </p>
        </div>
        <div>
          <Reveal>
            <h2 className="nx-thesis" id="nx-manifesto-h">
              {manifesto.thesisPrefix}
              <span className="accent">{manifesto.thesisAccent}</span>
              {manifesto.thesisSuffix}
            </h2>
          </Reveal>
          <div className="nx-manifesto-cols">
            {manifesto.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <ul className="nx-pillar-grid">
            {manifesto.pillars.map((pillar) => (
              <li key={pillar.num} className="nx-pillar">
                <span className="num">{pillar.num}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
