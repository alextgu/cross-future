import Link from "next/link";
import type { AssemblyContent, Edition, Organization } from "@/lib/content";
import { formatEditionDate } from "@/lib/content";
import {
  ASSEMBLY_REGISTER,
  ASSEMBLY_ROUTES,
} from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import AsmCountdown from "./AsmCountdown";
import AsmMedia from "./AsmMedia";

export default function AsmFooter({
  edition,
  host,
  assembly,
}: {
  edition: Edition;
  host: Organization | null;
  assembly: AssemblyContent;
}) {
  const { contact, footerBand } = assembly;

  return (
    <footer className="asm-footer">
      <div className="asm-footer-band">
        <AsmMedia media={footerBand} aspect="32 / 9" scrim />
      </div>

      <div className="asm-card is-padded t-deep">
        <div className="asm-footer-cols">
          <div>
            <h3>Come join us</h3>
            <p className="asm-d3" style={{ marginBottom: 18 }}>
              {edition.name}
            </p>
            <p className="asm-lede">
              {formatEditionDate(edition)} · {edition.venue.name},{" "}
              {edition.venue.city}
            </p>
            <AsmCountdown targetIso={edition.startsAt} />
            <div style={{ marginTop: 22 }}>
              <AsmButton href={ASSEMBLY_REGISTER} tone="inverse">
                Register
              </AsmButton>
            </div>
          </div>

          <nav aria-label="Footer">
            <h3>Pages</h3>
            <ul>
              {ASSEMBLY_ROUTES.map((route) => (
                <li key={route.href}>
                  <Link href={route.href}>{route.label}</Link>
                </li>
              ))}
              <li>
                <Link href={ASSEMBLY_REGISTER}>Register</Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3>Contact</h3>
            <ul>
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              {contact.social.map((link) => (
                <li key={link.label}>
                  <a href={link.url} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Host</h3>
            <p className="asm-lede">
              {host ? host.name : "Cross Future Hub"} is a non-profit guiding
              tech enthusiasts through key trends.
            </p>
          </div>
        </div>

        <div className="asm-colophon">
          <span>
            © {edition.year} {host ? host.name : "Cross Future Hub"}. All rights
            reserved.
          </span>
          <span>Built for one focused day of exchange.</span>
          <span>
            {edition.venue.city}, {edition.venue.region}
          </span>
        </div>
      </div>
    </footer>
  );
}
