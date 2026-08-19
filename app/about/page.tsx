import type { Metadata } from "next";
import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  getFaculty,
  getHostOrganization,
  getInterviewCards,
  formatEditionDate,
} from "@/lib/content";
import { ASSEMBLY_BASE, ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmStory from "@/components/assembly/AsmStory";
import AsmEssentials from "@/components/assembly/AsmEssentials";
import AsmFocus from "@/components/assembly/AsmFocus";
import AsmVoices from "@/components/assembly/AsmVoices";
import AsmLetters from "@/components/assembly/AsmLetters";
import AsmPastEditions from "@/components/assembly/AsmPastEditions";
import AsmMarquee from "@/components/assembly/AsmMarquee";
import AsmCta from "@/components/assembly/AsmCta";
import AsmGlyph from "@/components/assembly/AsmGlyph";
import AsmInfrastructure from "@/components/assembly/AsmInfrastructure";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  description:
    "Cross Future Hub is a non-profit guiding tech enthusiasts through key trends. What the summit is for, how it is built, and where it has been.",
};

export default async function AboutPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const host = getHostOrganization(content);
  const assembly = getAssembly(content);
  const faculty = getFaculty(content, edition.slug);
  const interviews = getInterviewCards(content, faculty);

  const pillars = assembly.features;

  const derivedStats = [
    { value: String(faculty.length), label: "Faculty confirmed" },
    { value: `0${content.tracks.length}`, label: "Tracks on one chain" },
    { value: String(interviews.length), label: "Recorded interviews" },
    { value: `${content.partners.length}+`, label: "Partner organizations" },
  ];

  return (
    <AsmShell rail={assembly.rail}>
      <AsmPageHero intro={assembly.pageIntros.about} />

      <div className="asm-row" style={{ ["--cols" as string]: pillars.length }}>
        {pillars.map((pillar) => (
          <div key={pillar.title} className="asm-card is-padded t-deep">
            <AsmGlyph glyph={pillar.glyph} />
            <h2 className="asm-d3" style={{ margin: "22px 0 12px" }}>
              {pillar.title}
            </h2>
            <p className="asm-lede">{pillar.text}</p>
          </div>
        ))}
      </div>

      <AsmSectionHead
        eyebrow="The work"
        title="The making of the summit"
        lede={`Hosted by ${host?.name ?? "Cross Future Hub"}, a non-profit. Three editions, one argument, built in public.`}
        tone="plain"
      />
      <AsmStory chapters={assembly.story} />

      <AsmMarquee items={assembly.marquee} tone="tint" />

      <AsmSectionHead
        eyebrow="Thesis"
        title="The future is already a power problem"
        tone="deep"
        lede={edition.thesis}
      />
      <AsmVoices voices={assembly.voices} />

      <AsmEssentials
        eyebrow="Essentials"
        title="Our summit essentials"
        features={assembly.features}
        stats={derivedStats}
      />

      <AsmSectionHead
        eyebrow="Programme"
        title="What the day is about"
        lede="Four tracks, each pinned to a node on the same electrical chain."
        tone="plain"
      />
      <AsmInfrastructure tracks={content.tracks} />
      <AsmFocus areas={assembly.focusAreas} />

      <AsmSectionHead
        eyebrow="Recognition"
        title="Letters of support"
        tone="tint"
      />
      <AsmLetters letters={assembly.letters} />

      <AsmSectionHead
        eyebrow="Archive"
        title="Where it has been"
        action={{ label: "Media archive", href: `${ASSEMBLY_BASE}/media` }}
      />
      <AsmPastEditions
        editions={assembly.pastEditions}
        currentYear={edition.year}
      />

      <AsmCta
        title="Come and argue with us"
        text={`${formatEditionDate(edition)} at ${edition.venue.name}, ${edition.venue.city}.`}
        primary={{ label: "Register", href: ASSEMBLY_REGISTER }}
        secondary={{ label: "Meet the faculty", href: `${ASSEMBLY_BASE}/speakers` }}
        media={assembly.gallery[5]}
      />
    </AsmShell>
  );
}
