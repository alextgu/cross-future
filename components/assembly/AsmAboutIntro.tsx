const AUDIENCES = [
  {
    title: "Professors",
    description: "New research, explained by the people behind it.",
  },
  {
    title: "Researchers",
    description: "Open questions, methods and discoveries worth sharing.",
  },
  {
    title: "Industry builders",
    description: "Real applications, lessons and paths to impact.",
  },
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
          <p className="asm-future-kicker">Why Cross Future</p>
          <h2 className="asm-about-title">About Cross Future</h2>

          <p className="asm-about-lead">
            Cross Future is a recurring forum for the people expanding what AI
            can do. We create the room for rigorous ideas, useful friction and
            the collaborations that continue after the stage goes dark.
          </p>

          <section
            className="asm-about-systems"
            aria-label="Who meets here"
          >
            <ul className="asm-about-systems-list">
              {AUDIENCES.map((audience) => (
                <li key={audience.title}>
                  <strong>{audience.title}</strong>
                  <span>{audience.description}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <figure className="asm-about-figure">
          <div className="asm-about-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/summit/media/hero-poster.jpg"
              alt="Cross Future speakers and attendees sharing ideas at the summit"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption className="asm-about-caption">
            One room. New perspectives. Conversations that keep moving.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
