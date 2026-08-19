import type { AssemblyContent, Edition, Organization } from "@/lib/content";
import { formatEditionDate } from "@/lib/content";
import {
  ASSEMBLY_REGISTER,
  ASSEMBLY_REGISTER_LABEL,
} from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import AsmSocialIcon from "./AsmSocialIcon";
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
          <div className="asm-footer-invite">
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

          <div className="asm-footer-clock">
            <h3>Doors open in</h3>
            <AsmCountdown targetIso={edition.startsAt} />
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

          <div className="asm-footer-host">
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

          <div className="asm-footer-contact">
            <h3>Contact</h3>
            <ul>
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              {contact.social.map((link) => (
                <li key={link.label}>
                  <a
                    className="asm-social-link"
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <AsmSocialIcon label={link.label} url={link.url} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="asm-colophon">
          <span>Built for one focused day of exchange.</span>
          <span>
            {edition.venue.city}, {edition.venue.region}
          </span>
        </div>

        <p className="asm-footer-copyright">
          Copyright 2026 Cross Future Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
