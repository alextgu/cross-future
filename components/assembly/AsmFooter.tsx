import type { AssemblyContent, Edition, Organization } from "@/lib/content";
import { formatEditionDate } from "@/lib/content";
import {
  ASSEMBLY_REGISTER,
  ASSEMBLY_REGISTER_LABEL,
} from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import AsmCountdown from "./AsmCountdown";
import { AsmLockup } from "./AsmLogo";

export default function AsmFooter({
  edition,
  host,
  assembly,
}: {
  edition: Edition;
  host: Organization | null;
  assembly: AssemblyContent;
}) {
  const { contact } = assembly;

  return (
    <footer className="asm-footer">
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
            {/* One button. The EventGo handoff lives on /register, where it
                is the next step rather than a second competing choice. */}
            <div className="asm-footer-actions">
              <AsmButton href={ASSEMBLY_REGISTER} tone="inverse">
                {ASSEMBLY_REGISTER_LABEL}
              </AsmButton>
            </div>
          </div>

          {/* The clock is the reason to read the footer at all, so it takes
              the middle column rather than trailing the address block. The
              page list is gone: the nav is a table of contents for the same
              page, and the sections are one scroll away. */}
          <div className="asm-footer-clock">
            <h3>Doors open in</h3>
            <AsmCountdown targetIso={edition.startsAt} />
          </div>

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
            <AsmLockup
              className="asm-footer-lockup"
              label={host ? host.name : "Cross Future Hub"}
            />
            <p className="asm-lede">
              {host ? host.name : "Cross Future Hub"} is a non-profit guiding
              tech enthusiasts through key trends.
            </p>
          </div>

          <div className="asm-footer-newsletter">
            <h3>Newsletter</h3>
            <p className="asm-lede">
              Get summit updates and the agenda release in your inbox.
            </p>
            <form action="" method="get">
              <label className="asm-sr" htmlFor="footer-newsletter-email">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
              />
              <button type="button">Subscribe</button>
            </form>
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
