import type { Metadata } from "next";
import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  formatEditionDate,
  formatEditionHours,
} from "@/lib/content";
import { ASSEMBLY_BASE } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmForm, { type AsmFieldSpec } from "@/components/assembly/AsmForm";
import AsmFaq from "@/components/assembly/AsmFaq";
import AsmButton from "@/components/assembly/AsmButton";
import AsmMedia from "@/components/assembly/AsmMedia";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register for the Cross Future AI Summit 2026 — 24 July, Hotel Monville, Montréal.",
};

const STATUS_COPY: Record<string, string> = {
  draft: "This edition is still in draft.",
  announced: "Registration has not opened yet — interest list only.",
  "registration-open": "Registration is open.",
  "registration-closed": "Registration has closed.",
  archived: "This edition is archived.",
};

export default async function RegisterPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);

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
      half: true,
    },
    {
      name: "organization",
      label: "Organization",
      type: "text",
      autoComplete: "organization",
      half: true,
    },
    {
      name: "closest",
      label: "I work closest to",
      type: "select",
      options: [
        "The grid — utility, interconnection, planning",
        "The facility — electrical, mechanical, controls",
        "The compute — platform, workloads, silicon",
        "Research",
        "Policy, finance or ecosystem",
      ],
    },
    {
      name: "access",
      label: "Anything we should arrange (dietary, mobility, captioning)",
      type: "textarea",
    },
  ];

  return (
    <AsmShell rail={assembly.rail}>
      <AsmPageHero
        intro={assembly.pageIntros.register}
        aside={
          <ul style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <li className="asm-chip is-solid">
              {STATUS_COPY[edition.status] ?? edition.status}
            </li>
            <li className="asm-chip">{formatEditionDate(edition)}</li>
            <li className="asm-chip">{formatEditionHours(edition)}</li>
          </ul>
        }
      />

      <section className="asm-split" style={{ ["--split" as string]: "1fr 1.1fr" }}>
        <div className="asm-card is-padded t-mist">
          <p className="asm-eyebrow">What is included</p>
          <h2 className="asm-d2" style={{ margin: "18px 0 26px" }}>
            One ticket, the whole day
          </h2>
          <ul>
            {assembly.registerBenefits.map((benefit) => (
              <li
                key={benefit}
                style={{
                  display: "grid",
                  gridTemplateColumns: "26px 1fr",
                  gap: 10,
                  padding: "14px 0",
                  borderTop: "1px solid var(--asm-hair)",
                }}
              >
                <span className="asm-meta" aria-hidden="true">
                  ◆
                </span>
                <span className="asm-body">{benefit}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 28 }}>
            <AsmButton href={edition.registrationUrl}>
              Official registration page
            </AsmButton>
          </div>
        </div>

        <div className="asm-card is-padded t-deep">
          <p className="asm-eyebrow">Register</p>
          <h2 className="asm-d2" style={{ margin: "18px 0 8px" }}>
            Hold me a place
          </h2>
          <p className="asm-lede" style={{ marginBottom: 26 }}>
            {edition.venue.name}, {edition.venue.city}. Tell us what you need
            and we will confirm arrangements before the day.
          </p>
          <AsmForm
            fields={fields}
            submitLabel="Hold my place"
            successNote={
              <>
                Your details look valid — but this form is not connected to a
                backend, so nothing was sent or stored. Registration runs
                through{" "}
                <a href={edition.registrationUrl} target="_blank" rel="noreferrer">
                  the official registration page
                </a>
                , or email{" "}
                <a href={`mailto:${assembly.contact.email}`}>
                  {assembly.contact.email}
                </a>
                .
              </>
            }
          />
        </div>
      </section>

      <section className="asm-card t-plain">
        <AsmMedia media={assembly.gallery[0]} aspect="21 / 9" />
      </section>

      <AsmSectionHead
        eyebrow="Questions"
        title="Before you register"
        lede="If it is not answered here, the contact form reaches the organizing team directly."
        tone="tint"
        size="d2"
        action={{ label: "Contact us", href: `${ASSEMBLY_BASE}/contact` }}
      />
      <AsmFaq items={assembly.faq} />
    </AsmShell>
  );
}
