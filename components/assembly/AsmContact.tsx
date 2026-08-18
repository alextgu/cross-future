import type { AssemblyContent, Edition } from "@/lib/content";
import AsmForm, { type AsmFieldSpec } from "./AsmForm";

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
          <p className="asm-eyebrow">Contact</p>
          <h2 className="asm-d1">Connect with us</h2>
          <p className="asm-lede">{contact.note}</p>
          <p>
            <a
              className="asm-d3"
              href={`mailto:${contact.email}`}
              style={{ fontSize: "1.35rem" }}
            >
              {contact.email}
            </a>
          </p>
          <ul style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {contact.social.map((link) => (
              <li key={link.label}>
                <a
                  className="asm-meta"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>

        <AsmForm
          fields={fields}
          endpoint="/api/contact"
          edition={edition.slug}
          submitLabel="Send"
          successNote={
            <>
              Your inquiry was stored in the local mock database. No email was
              sent yet; the {edition.year} team can transfer it when production
              services are connected.
            </>
          }
        />
      </div>
    </section>
  );
}
