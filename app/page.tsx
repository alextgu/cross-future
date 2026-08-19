import type { Metadata } from "next";
import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  getFaculty,
  getInterviewCards,
  getPartnersByType,
  getConfirmedSessions,
  getProposedSessions,
} from "@/lib/content";
import { ASSEMBLY_BASE } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmHero from "@/components/assembly/AsmHero";
import AsmFacts from "@/components/assembly/AsmFacts";
import AsmMarquee from "@/components/assembly/AsmMarquee";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmFacultyGrid from "@/components/assembly/AsmFacultyGrid";
import AsmPartners from "@/components/assembly/AsmPartners";
import AsmFocus from "@/components/assembly/AsmFocus";
import AsmInterviews from "@/components/assembly/AsmInterviews";
import AsmAgenda from "@/components/assembly/AsmAgenda";
import AsmLetters from "@/components/assembly/AsmLetters";
import AsmContact from "@/components/assembly/AsmContact";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function AssemblyHome() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);
  const faculty = getFaculty(content, edition.slug);
  const interviews = getInterviewCards(content, faculty);
  const partnerGroups = getPartnersByType(content);
  const confirmed = getConfirmedSessions(content, edition.slug);
  const proposed = getProposedSessions(content, edition.slug);

  return (
    /* The page follows the live site's own running order — intro, interviews,
       speakers, focus areas, agenda, letters, partners, contact — rather than
       the longer editorial sequence this design started with. Sections that
       had no real material behind them (the field notes, the past-edition
       cards, the stats row) are not invented here; they live on /about and
       /media, where they are what the page is for.

       One register call, not four. The hero ticket tile carries it above the
       fold, the nav carries it everywhere, and the footer closes with it —
       the facts row's "Get a ticket" and the closing CTA were the same
       action under two more names, one of them word-for-word the hero's.

       No rail: the hero mosaic already carries the agenda and ticket cards. */
    <AsmShell>
      <AsmHero edition={edition} assembly={assembly} />

      <AsmFacts facts={assembly.facts} />

      <AsmMarquee items={assembly.marquee} />

      {/* The non-profit's own statement of purpose — the paragraph the live
          site opens with, in its own words. */}
      <AsmSectionHead
        id="about"
        eyebrow="Cross Future Hub"
        title="Why this summit exists"
        tone="plain"
        action={{ label: "About the host", href: `${ASSEMBLY_BASE}/about` }}
      />
      {/* The paragraph itself, not a chapter card: the section head above
          already carries the title, and the chapter frame repeated it over a
          screen of empty card and a stand-in photograph. */}
      <div className="asm-card is-padded t-plain">
        <p className="asm-lede" style={{ maxWidth: "68ch" }}>
          {assembly.story[0]?.text}
        </p>
      </div>

      <AsmSectionHead
        id="interviews"
        eyebrow="Interviews"
        title="Voices from the floor"
        action={{ label: "Media archive", href: `${ASSEMBLY_BASE}/media` }}
      />
      <AsmInterviews cards={interviews.slice(0, 4)} />

      <AsmSectionHead
        id="faculty"
        eyebrow="Main stage"
        title="Meet the faculty"
        action={{ label: "All speakers", href: `${ASSEMBLY_BASE}/speakers` }}
      />
      <AsmFacultyGrid members={faculty} layout="strip" />

      <AsmFocus
        id="focus"
        areas={assembly.focusAreas}
        hero={assembly.focusMedia}
      />

      <AsmSectionHead
        id="agenda"
        eyebrow="Agenda"
        title="The shape of the day"
        action={{ label: "Full agenda", href: `${ASSEMBLY_BASE}/agenda` }}
        tone="plain"
      />
      <AsmAgenda
        edition={edition}
        confirmed={confirmed}
        proposed={proposed}
        tracks={content.tracks}
        variant="strip"
      />

      <AsmSectionHead
        id="recognition"
        eyebrow="Recognition"
        title="Letters of support"
        lede="Editions 01 and 02 were recognized by the Province of Ontario and the City of Toronto."
        tone="tint"
      />
      <AsmLetters letters={assembly.letters} />

      <AsmSectionHead
        id="partners"
        eyebrow="Partners"
        title="Our partners"
        action={{ label: "Become a partner", href: `${ASSEMBLY_BASE}/partners` }}
        tone="deep"
      />
      <AsmPartners groups={partnerGroups} />

      <AsmContact contact={assembly.contact} edition={edition} />
    </AsmShell>
  );
}
