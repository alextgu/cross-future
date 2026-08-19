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
import AsmShell from "@/components/assembly/AsmShell";
import AsmHero from "@/components/assembly/AsmHero";
import AsmFacts from "@/components/assembly/AsmFacts";
import AsmMarquee from "@/components/assembly/AsmMarquee";
import AsmSection from "@/components/assembly/AsmSection";
import AsmAboutIntro from "@/components/assembly/AsmAboutIntro";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmFacultyGrid from "@/components/assembly/AsmFacultyGrid";
import AsmPartners from "@/components/assembly/AsmPartners";
import AsmPartnerCta from "@/components/assembly/AsmPartnerCta";
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

       No rail: the hero mosaic already carries the agenda and ticket cards.

       The body is a flat list of sections and nothing else. A section is a
       top-level region — what the nav points at, what has or could have its
       own heading — and it is the only thing that takes section distance.
       The hero, the three fact cards and the ticker are one region, not
       three: the facts are the hero's own metadata, so they tile directly
       under it at the same gap the hero's own tiles use. */
    <AsmShell>
      <AsmSection flow="tile" label="Cross Future AI Summit 2026">
        <AsmHero edition={edition} assembly={assembly} />
        <AsmFacts facts={assembly.facts} />
        <AsmMarquee items={assembly.marquee} />
      </AsmSection>

      {/* The non-profit's own statement of purpose — the paragraph the live
          site opens with, in its own words. */}
      <AsmSection id="about" flow="tile">
        <AsmAboutIntro />
      </AsmSection>

      {/* Speakers, with the interviews under them. The interview wall is an
          archive of people who have already spoken here — it belongs to the
          faculty rather than standing beside them as a peer subject. */}
      <AsmSection id="faculty">
        <AsmSectionHead section="faculty" title="Meet the faculty" />
        <AsmFacultyGrid members={faculty} layout="strip" rows={2} />
        <span className="asm-anchor" id="interviews" aria-hidden="true" />
        <AsmSectionHead
          section="interviews"
          title="Recorded interviews"
          tone="plain"
          space="tight"
        />
        <AsmInterviews cards={interviews} layout="rail" />
      </AsmSection>

      {/* Program placeholder until schedule publication. */}
      <AsmSection id="focus" flow="tile">
        <AsmSectionHead section="focus" title="Program" tone="plain" />
        <span className="asm-anchor" id="agenda" aria-hidden="true" />
        <AsmAgenda
          edition={edition}
          confirmed={confirmed}
          proposed={proposed}
          tracks={content.tracks}
          variant="status"
        />
      </AsmSection>

      {/* Supporters: everyone vouching for the summit, in order of weight.
          The letters are a government and a city on paper; the logos are the
          companies in the room. Same kind of claim, one section. */}
      <AsmSection id="recognition" space="major">
        <AsmSectionHead
          section="recognition"
          title="Backed by institutions that build this city"
          lede="Our first two editions received formal recognition from the Province of Ontario and the City of Toronto."
          tone="tint"
        />
        <AsmLetters letters={assembly.letters} />
        <span className="asm-anchor" id="partners" aria-hidden="true" />
        <AsmPartners groups={partnerGroups} />
        <AsmPartnerCta />
      </AsmSection>

      {/* AsmContact carries the #contact anchor itself, so the wrapper is
          here for rhythm only. */}
      <AsmSection>
        <AsmContact contact={assembly.contact} edition={edition} />
      </AsmSection>
    </AsmShell>
  );
}
