import type { Metadata } from "next";
import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  getHostOrganization,
  formatEditionDate,
  formatEditionHours,
} from "@/lib/content";
import { ASSEMBLY_BASE, ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmContact from "@/components/assembly/AsmContact";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmFaq from "@/components/assembly/AsmFaq";
import AsmMedia from "@/components/assembly/AsmMedia";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
  description:
    "Reach the Cross Future AI Summit organizing team — programme, partnership, press and accessibility.",
};

export default async function ContactPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const host = getHostOrganization(content);
  const assembly = getAssembly(content);

  const details = [
    { label: "Email", lines: [assembly.contact.email] },
    {
      label: "Venue",
      lines: [edition.venue.name, `${edition.venue.city}, ${edition.venue.region}`],
    },
    {
      label: "Date",
      lines: [formatEditionDate(edition), formatEditionHours(edition)],
    },
    {
      label: "Host",
      lines: [host?.name ?? "Cross Future Hub", "Non-profit"],
    },
  ];

  return (
    <AsmShell rail={assembly.rail}>
      <AsmPageHero intro={assembly.pageIntros.contact} />

      <div className="asm-row" style={{ ["--cols" as string]: 4, ["--cols-md" as string]: 2 }}>
        {details.map((item) => (
          <dl className="asm-card is-padded t-plain asm-fact" key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              {item.lines.map((line) => (
                <span key={line} style={{ display: "block" }}>
                  {line}
                </span>
              ))}
            </dd>
          </dl>
        ))}
      </div>

      <AsmContact contact={assembly.contact} edition={edition} />

      <section className="asm-split" style={{ ["--split" as string]: "1fr 1fr" }}>
        <div className="asm-card t-plain">
          <AsmMedia media={assembly.gallery[7]} aspect="4 / 3" />
        </div>
        <div className="asm-card is-padded t-tint">
          <p className="asm-eyebrow">Getting there</p>
          <h2 className="asm-d2" style={{ margin: "18px 0 18px" }}>
            {edition.venue.name}
          </h2>
          <p className="asm-body">
            1041 Rue de Bleury, {edition.venue.city}, {edition.venue.region}.
            A short walk from Place-des-Arts métro and roughly 25 minutes from
            Montréal–Trudeau. The venue is step-free; tell us in advance what
            you need and we will confirm before the day.
          </p>
          <p className="asm-meta" style={{ marginTop: 22 }}>
            {edition.coordinates
              ? `${edition.coordinates.lat.toFixed(4)}, ${edition.coordinates.lng.toFixed(4)}`
              : null}
          </p>
        </div>
      </section>

      <AsmSectionHead
        eyebrow="Questions"
        title="Possibly already answered"
        lede="The eight things we get asked most."
        tone="deep"
        size="d2"
        action={{ label: "Register", href: ASSEMBLY_REGISTER }}
      />
      <AsmFaq items={assembly.faq} />

      <section className="asm-card is-padded t-mist">
        <p className="asm-eyebrow">Elsewhere</p>
        <div
          className="asm-row"
          style={{ ["--cols" as string]: 3, marginTop: 22 }}
        >
          <a className="asm-d3" href={`${ASSEMBLY_BASE}/partners`}>
            Partner with us ↗
          </a>
          <a className="asm-d3" href={`${ASSEMBLY_BASE}/speakers`}>
            Speak at the summit ↗
          </a>
          <a className="asm-d3" href={`${ASSEMBLY_BASE}/media`}>
            Press and media ↗
          </a>
        </div>
      </section>
    </AsmShell>
  );
}
