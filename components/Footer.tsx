import type { Edition, Organization } from "@/lib/content";
import { SECTIONS } from "@/lib/sections";

export default function Footer({
  edition,
  host,
}: {
  edition: Edition;
  host: Organization | null;
}) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-wordmark">
            Cross Future <em>AI Summit</em>
          </p>
          <p className="footer-meta">
            {edition.name} is hosted by {host ? host.name : "Cross Future Hub"}, a
            non-profit. {edition.venue.city}, {edition.venue.region},{" "}
            {edition.venue.country}.
          </p>
          <p className="footer-meta">
            © {edition.year} {host ? host.name : "Cross Future Hub"}
          </p>
          <p className="footer-meta">
            <a href="/nexus">View design B — Nexus</a>
          </p>
          <p className="footer-meta">
            <a href="/assembly">View design C — Assembly</a>
          </p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              <span className="num" aria-hidden="true">
                {s.num}
              </span>
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
