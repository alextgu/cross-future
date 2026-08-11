import type { Edition, Organization } from "@/lib/content";

function formatDate(edition: Edition): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: edition.timezone,
  }).format(new Date(edition.startsAt));
}

function shortDate(edition: Edition): string {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    day: "numeric",
    timeZone: edition.timezone,
  })
    .format(new Date(edition.startsAt))
    .toUpperCase();
}

export default function NexusHero({
  edition,
  host,
}: {
  edition: Edition;
  host: Organization | null;
}) {
  const editionNo = String(edition.editionNumber ?? 1).padStart(2, "0");

  return (
    <header className="nx-hero" id="top">
      <div className="nx-container">
        <div className="nx-hero-grid">
          <div>
            <p className="nx-kicker nx-mono">
              SUMMIT / EDITION {editionNo} / {edition.year}
            </p>
            <h1 className="nx-hero-title">
              <span className="line">
                <span>Cross</span>
              </span>
              <span className="line">
                <span>Future</span>
              </span>
              <span className="line accent">
                <span className="accent">AI Summit</span>
              </span>
            </h1>
            <dl className="nx-facts">
              <div className="nx-fact">
                <dt>Date</dt>
                <dd>{formatDate(edition)}</dd>
              </div>
              <div className="nx-fact">
                <dt>Location</dt>
                <dd>
                  {edition.venue.city}, {edition.venue.region}
                </dd>
              </div>
              <div className="nx-fact">
                <dt>Host</dt>
                <dd>{host ? host.name : "TBA"}</dd>
              </div>
              <div className="nx-fact">
                <dt>Format</dt>
                <dd>{edition.format ?? "In-Person"}</dd>
              </div>
            </dl>
          </div>

          {edition.heroFigure ? (
            <figure className="nx-fig">
              <span className="tag">{edition.heroFigure.label}</span>
              <img
                src={edition.heroFigure.imageUrl}
                alt={edition.heroFigure.alt}
                width={896}
                height={1120}
              />
            </figure>
          ) : null}
        </div>

        <div className="nx-statement">
          <p>{edition.heroStatement ?? edition.tagline}</p>
          <div className="side">
            <a className="nx-btn" href="#register">
              JOIN US — {shortDate(edition)}
              <span className="dash" aria-hidden="true" />
            </a>
            <a className="nx-scrollhint" href="#manifesto">
              <span className="arrow" aria-hidden="true">
                ↓
              </span>
              Scroll to manifesto
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
