import type { Metadata } from "next";
import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  getPartnersByType,
} from "@/lib/content";
import { ASSEMBLY_BASE } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmPartners from "@/components/assembly/AsmPartners";
import AsmLetters from "@/components/assembly/AsmLetters";
import AsmCta from "@/components/assembly/AsmCta";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Universities, industry and community organizations supporting the Cross Future AI Summit, plus the letters of support from Ontario and the City of Toronto.",
};

const TIERS = [
  {
    title: "What partners get",
    items: [
      "Named presence on the site and in the room",
      "Places for your team, held before public registration",
      "A voice in shaping the track your work sits on",
      "The recorded interview archive to share internally",
    ],
  },
  {
    title: "What we ask",
    items: [
      "Support in kind or in cash — the summit is a non-profit event",
      "One person who can answer questions in the run-up",
      "Permission to use your mark on this page",
    ],
  },
];

export default async function PartnersPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);
  const groups = getPartnersByType(content);

  return (
    <AsmShell rail={assembly.rail}>
      <AsmPageHero
        intro={assembly.pageIntros.partners}
        aside={
          <ul style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <li className="asm-chip is-solid">
              {content.partners.length} organizations
            </li>
            {groups.map((group) => (
              <li key={group.type} className="asm-chip">
                {group.partners.length} {group.type}
              </li>
            ))}
          </ul>
        }
      />

      <AsmSectionHead
        eyebrow="Partners"
        title="Partners in innovation"
        lede="Meet the organizations fuelling the summit. Edition 03 runs on their support."
        tone="deep"
      />
      <AsmPartners groups={groups} />

      <AsmSectionHead
        eyebrow="Recognition"
        title="Letters of support"
        lede="Editions 01 and 02 were recognized by the Province of Ontario and the Office of the Mayor of Toronto."
        tone="tint"
      />
      <AsmLetters letters={assembly.letters} />

      <AsmSectionHead
        eyebrow="Become a partner"
        title="What partnership looks like"
        tone="plain"
      />
      <div className="asm-row" style={{ ["--cols" as string]: 2 }}>
        {TIERS.map((tier) => (
          <div key={tier.title} className="asm-card is-padded t-mist">
            <h3 className="asm-d3" style={{ marginBottom: 20 }}>
              {tier.title}
            </h3>
            <ul>
              {tier.items.map((item) => (
                <li
                  key={item}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "22px 1fr",
                    gap: 10,
                    padding: "12px 0",
                    borderTop: "1px solid var(--asm-hair)",
                  }}
                >
                  <span className="asm-meta" aria-hidden="true">
                    ◆
                  </span>
                  <span className="asm-body">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <AsmCta
        title="Become our partner"
        text={`Write to ${assembly.contact.email} and we will send the current partnership outline for ${edition.year}.`}
        primary={{ label: "Get in touch", href: `${ASSEMBLY_BASE}/contact` }}
        secondary={{ label: `Email ${assembly.contact.email}`, href: `mailto:${assembly.contact.email}` }}
        media={assembly.gallery[4]}
      />
    </AsmShell>
  );
}
