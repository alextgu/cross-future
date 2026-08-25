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
import AsmSection from "@/components/assembly/AsmSection";
import AsmAboutIntro from "@/components/assembly/AsmAboutIntro";
import AsmStatsBridge from "@/components/assembly/AsmStatsBridge";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmFacultyGrid from "@/components/assembly/AsmFacultyGrid";
import AsmPartners from "@/components/assembly/AsmPartners";
import AsmPartnerCta from "@/components/assembly/AsmPartnerCta";
import AsmInterviews from "@/components/assembly/AsmInterviews";
import AsmAgenda from "@/components/assembly/AsmAgenda";
import AsmLetters from "@/components/assembly/AsmLetters";
import AsmContact from "@/components/assembly/AsmContact";
import AsmButton from "@/components/assembly/AsmButton";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const PLACEHOLDER_STATS = [
  { value: "XX", label: "Events" },
  { value: "XX", label: "Speakers" },
  { value: "YY", label: "Interviews" },
  { value: "YY", label: "Partners" },
] as const;

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
       the longer editorial sequence this design started with. Detailed
       editions and recordings have durable homes on /past-events and
       /speakers rather than becoming duplicate homepage sections.

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
      </AsmSection>

      <AsmStatsBridge items={PLACEHOLDER_STATS} />

      <AsmSection id="about" flow="tile">
        <AsmAboutIntro />
      </AsmSection>

      <AsmSection id="faculty" labelledBy="faculty-heading">
        <header className="asm-section-rail">
          <div className="asm-section-rail-copy">
            <p className="asm-section-rail-label">Speakers</p>
            <h2 id="faculty-heading">Previous Speakers</h2>
          </div>
          <span className="asm-section-rail-line" aria-hidden="true" />
        </header>
        <AsmFacultyGrid
          members={faculty}
          layout="strip"
          rows={2}
          aspect="4 / 5"
        />
        <div className="asm-speaker-interview-preview">
          <span className="asm-anchor" id="interviews" aria-hidden="true" />
          <header className="asm-section-rail">
            <div className="asm-section-rail-copy">
              <p className="asm-section-rail-label">Media</p>
              <h2>Interviews</h2>
            </div>
            <span className="asm-section-rail-line" aria-hidden="true" />
          </header>
          <AsmInterviews cards={interviews.slice(0, 3)} columns={3} />
        </div>
        <div className="asm-speaker-archive-cta">
          <AsmButton href="/speakers">
            View all speakers &amp; interviews
          </AsmButton>
        </div>
      </AsmSection>

      {/* Program placeholder until schedule publication. */}
      <AsmSection id="focus" labelledBy="program-heading">
        <header className="asm-section-rail">
          <div className="asm-section-rail-copy">
            <p className="asm-section-rail-label">Agenda</p>
            <h2 id="program-heading">Program</h2>
          </div>
          <span className="asm-section-rail-line" aria-hidden="true" />
          <AsmButton href="/program" tone="ghost">
            View full program
          </AsmButton>
        </header>
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
      <AsmSection id="recognition">
        <AsmSectionHead
          section="recognition"
          title="Backed by institutions that build this city"
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
