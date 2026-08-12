import type { Edition } from "@/lib/content";
import NexusCountdown from "./NexusCountdown";

export default function NexusFooter({
  edition,
  hostName,
  bandImage,
}: {
  edition: Edition;
  hostName: string;
  bandImage: { sourceUrl: string; alt: string } | null;
}) {
  const editionNo = String(edition.editionNumber ?? 1).padStart(2, "0");
  const lat = edition.coordinates ? `${edition.coordinates.lat.toFixed(4)}° N` : null;
  const lng = edition.coordinates
    ? `${Math.abs(edition.coordinates.lng).toFixed(4)}° ${edition.coordinates.lng < 0 ? "W" : "E"}`
    : null;

  return (
    <footer>
      <div className="nx-footer-band">
        {bandImage ? (
          <img src={bandImage.sourceUrl} alt={bandImage.alt} width={2880} height={512} loading="lazy" />
        ) : null}
        <div className="inner">
          <span className="label">Data summary / Footer</span>
          <h2>Cross Future {edition.year}</h2>
        </div>
      </div>

      <div className="nx-container">
        <div className="nx-footer-cols">
          <div className="nx-footer-col">
            <span className="head">Countdown</span>
            <NexusCountdown targetIso={edition.startsAt} />
          </div>
          <div className="nx-footer-col">
            <span className="head">Venue</span>
            <div className="rows">
              <span>
                {edition.venue.city}, {edition.venue.region}
              </span>
              <span>{edition.venue.country}</span>
              {lat ? <span>{lat}</span> : null}
              {lng ? <span>{lng}</span> : null}
            </div>
          </div>
          <div className="nx-footer-col">
            <span className="head">Edition</span>
            <div className="rows">
              <span>Cross Future</span>
              <span>AI Summit</span>
              <span>Edition {editionNo}</span>
              <span>{edition.year}</span>
            </div>
          </div>
          <div className="nx-footer-col">
            <span className="head">Connect</span>
            <div className="rows">
              {edition.contactEmail ? <span>{edition.contactEmail}</span> : null}
              {(edition.socialLinks ?? []).map((link) => (
                <a key={link.label} href={link.url} rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="nx-footer-bar">
        <div className="nx-container inner">
          <span>
            © {edition.year} {hostName} — A non-profit initiative
          </span>
          <a className="nx-variant-link" href="/">
            View design A — Technical Broadsheet
          </a>
          <a className="nx-variant-link" href="/assembly">
            View design C — Assembly
          </a>
          <span>Shaping the future of AI, innovating for tomorrow</span>
        </div>
      </div>
    </footer>
  );
}
