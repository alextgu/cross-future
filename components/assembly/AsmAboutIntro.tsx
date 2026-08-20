import { sectionNumber } from "@/lib/assembly-nav";

const ABOUT_SYSTEMS = [
  { number: "01", label: "GRID RESILIENCE" },
  { number: "02", label: "HIGH-DENSITY COMPUTE" },
  { number: "03", label: "LOW-CARBON DISPATCH" },
] as const;

/**
 * About opener — two-column editorial band: mission copy and a framed figure
 * placeholder for infrastructure photography.
 */
export default function AsmAboutIntro() {
  return (
    <div className="asm-about-intro">
      <div className="asm-about-intro-grid">
        <div className="asm-about-copy">
          <header className="asm-about-head">
            <span className="asm-sechead-num">{sectionNumber("about")}</span>
            <h2 className="asm-about-title">Why this summit exists</h2>
          </header>

          <p className="asm-about-lead">
            Cross Future Hub is a non-profit guiding tech leaders through
            systemic architectural shifts. The summit exists to put the
            engineers planning power grids in the same room as the researchers
            training frontier models — bridging the physical constraints of
            energy with the exponential demands of compute before both
            industries collide under pressure.
          </p>

          <p className="asm-about-body">
            As ultra-high-density AI clusters reshape digital infrastructure,
            energy resilience, backup generation, and grid dispatch have become
            critical bottlenecks. We convene academia, cloud providers, and
            utility operators to establish actionable technical pathways.
          </p>

          <section
            className="asm-about-systems"
            aria-labelledby="asm-about-systems-title"
          >
            <header className="asm-about-systems-head">
              <h3 id="asm-about-systems-title">Systems in scope</h3>
              <p>
                <span>03</span> priorities
              </p>
            </header>
            <ol className="asm-about-systems-list">
              {ABOUT_SYSTEMS.map((system) => (
                <li key={system.number}>
                  <span className="asm-about-system-code">
                    {system.number} //{" "}
                  </span>
                  <span className="asm-about-system-label">{system.label}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <figure className="asm-about-figure">
          <p className="asm-about-figlabel">FIG 01 // INFRASTRUCTURE & DISPATCH</p>
          <div className="asm-about-media">
            <img
              src="/summit/media/focus-hero.svg"
              alt="Placeholder: data center server racks in a high-density compute hall"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption className="asm-about-caption">
            CAPTION: AI data center power architecture &amp; grid integration /
            Montreal Session
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
