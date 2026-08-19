import type { Metadata } from "next";
import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  getFaculty,
  getFacultyByCategory,
} from "@/lib/content";
import { ASSEMBLY_BASE, ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmFacultyGrid from "@/components/assembly/AsmFacultyGrid";
import AsmCta from "@/components/assembly/AsmCta";

export const metadata: Metadata = {
  title: "Speakers",
  alternates: { canonical: "/speakers" },
  description:
    "The full Edition 03 faculty — researchers, industry engineers and ecosystem organizations convening on AI data-centre power and energy resilience.",
};

const GROUP_COPY: Record<string, string> = {
  research:
    "University and institute researchers working on the models, the systems and the physics underneath them.",
  industry:
    "Engineers and leads from the companies building and operating the infrastructure.",
  ecosystem:
    "The organizations that connect the two — accelerators, educators and policy.",
};

export default async function SpeakersPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);
  const faculty = getFaculty(content, edition.slug);
  const groups = getFacultyByCategory(faculty);

  return (
    <AsmShell rail={assembly.rail}>
      <AsmPageHero
        intro={assembly.pageIntros.speakers}
        aside={
          <ul style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <li className="asm-chip is-solid">{faculty.length} confirmed</li>
            {groups.map((group) => (
              <li key={group.category} className="asm-chip">
                {group.members.length} {group.label}
              </li>
            ))}
          </ul>
        }
      />

      {groups.map((group, i) => (
        <section key={group.category} className="asm-stack" id={group.category}>
          <AsmSectionHead
            eyebrow={group.label}
            title={
              group.category === "research"
                ? "From the lab"
                : group.category === "industry"
                  ? "From the floor"
                  : "From the ecosystem"
            }
            lede={GROUP_COPY[group.category]}
            tone={i % 2 === 0 ? "mist" : "plain"}
          />
          <AsmFacultyGrid members={group.members} columns={4} />
        </section>
      ))}

      <section className="asm-card is-padded t-deep">
        <p className="asm-eyebrow">A note on links</p>
        <h2 className="asm-d3" style={{ margin: "18px 0 14px", maxWidth: "26ch" }}>
          Names link out only when we hold a canonical URL
        </h2>
        <p className="asm-lede" style={{ maxWidth: "62ch" }}>
          Every person here is listed with the affiliation published by the
          summit. Until we have confirmed a personal page directly with them,
          their name renders as plain text rather than pointing somewhere that
          might be the wrong Jane Smith. If you are on this list and want your
          link added, write to us.
        </p>
      </section>

      <AsmCta
        title="Speak at the next edition"
        text="The programme is assembled from proposals as much as invitations. Tell us what you are working on."
        primary={{ label: "Get in touch", href: `${ASSEMBLY_BASE}/contact` }}
        secondary={{ label: "Register to attend", href: ASSEMBLY_REGISTER }}
        media={assembly.gallery[3]}
      />
    </AsmShell>
  );
}
