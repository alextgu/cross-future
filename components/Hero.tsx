import type { Edition, Organization, Track } from "@/lib/content";
import FigureOne from "./FigureOne";

function formatEventDate(edition: Edition): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "long",
    timeZone: edition.timezone,
  }).format(new Date(edition.startsAt));
}

export default function Hero({
  edition,
  host,
  facultyCount,
  tracks,
}: {
  edition: Edition;
  host: Organization | null;
  facultyCount: number;
  tracks: Track[];
}) {
  const registrationOpen = edition.status === "registration-open";

  return (
    <header className="hero" id="top">
      <div className="container">
        <div className="hero-kicker">
          <span className="mono-label">{edition.name}</span>
          <span className="mono-label">One day · {edition.venue.city}</span>
        </div>

        <h1 className="hero-title">
          Cross / Future
          <br />
          <span className="accent">AI Summit</span>
        </h1>

        <p className="hero-tagline">
          {edition.tagline} A one-day summit on {edition.theme} — {tracks.length}{" "}
          tracks along one electrical chain, from grid to rack.
        </p>

        <div className="hero-grid">
          <div>
            <dl className="fact-grid">
              <div className="fact">
                <dt>Date</dt>
                <dd>
                  {formatEventDate(edition)}
                  <span className="sub">{edition.timezone}</span>
                </dd>
              </div>
              <div className="fact">
                <dt>Location</dt>
                <dd>
                  {edition.venue.name}
                  <span className="sub">
                    {edition.venue.city}, {edition.venue.region}, {edition.venue.country}
                  </span>
                </dd>
              </div>
              <div className="fact">
                <dt>Host</dt>
                <dd>
                  {host ? host.name : "TBA"}
                  <span className="sub">Non-profit</span>
                </dd>
              </div>
              <div className="fact">
                <dt>Faculty</dt>
                <dd>
                  {facultyCount} confirmed
                  <span className="sub">Research · Industry · Ecosystem</span>
                </dd>
              </div>
            </dl>
            <div className="hero-cta">
              <a className="btn btn-primary" href="#register">
                {registrationOpen ? "Register" : "Register interest"}
              </a>
              <a className="btn" href="#curriculum">
                View curriculum
              </a>
            </div>
          </div>

          <FigureOne tracks={tracks} />
        </div>
      </div>
    </header>
  );
}
