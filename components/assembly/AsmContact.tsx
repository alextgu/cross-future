import type { AssemblyContent, Edition } from "@/lib/content";
import { sectionNumber } from "@/lib/assembly-nav";
import AsmForm, { type AsmFieldSpec } from "./AsmForm";
import AsmSocialIcon from "./AsmSocialIcon";

/**
 * Contact block. Shared by the home page and /contact so there is one form,
 * one set of inquiry types, one email address.
 */
export default function AsmContact({
  contact,
  edition,
}: {
  contact: AssemblyContent["contact"];
  edition: Edition;
}) {
  const fields: AsmFieldSpec[] = [
    {
      name: "firstName",
      label: "First name",
      type: "text",
      required: true,
      autoComplete: "given-name",
      half: true,
    },
    {
      name: "lastName",
      label: "Last name",
      type: "text",
      required: true,
      autoComplete: "family-name",
      half: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      autoComplete: "email",
    },
    {
      name: "inquiry",
      label: "Inquiry type",
      type: "select",
      options: contact.inquiryTypes,
    },
    { name: "message", label: "Message", type: "textarea", required: true },
  ];

  return (
    <section className="asm-card is-padded t-deep" id="contact">
      <div className="asm-split" style={{ ["--split" as string]: "1fr 1.15fr" }}>
        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          <span className="asm-sechead-num">{sectionNumber("contact")}</span>
          <h2 className="asm-d1">Connect with us</h2>
          <p className="asm-lede">
            Reach the Cross Future team for speaking, partnerships, and
            attendance.
          </p>
          <p className="asm-meta">Contact owner: Partnerships & Programs Team</p>
          <p>
            <a
              className="asm-d3"
              href={`mailto:${contact.email}`}
              style={{ fontSize: "1.35rem" }}
            >
              {contact.email}
            </a>
          </p>
          <ul className="asm-social-list">
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
            <li>
              <a
                className="asm-meta"
                href="mailto:partnerships@cross-future.com?subject=Partnership%20Deck%20Request"
              >
                Partner deck ↗
              </a>
            </li>
          </ul>
        </div>

        <AsmForm
          fields={fields}
          endpoint="/api/contact"
          edition={edition.slug}
          submitLabel="Send"
          successNote={
            <>
              Thanks — we received your message. The {edition.year} team will
              reply within two business days.
            </>
          }
        />
      </div>
    </section>
  );
}
