import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  getFaculty,
  getInterviewCards,
  getPartnersByType,
  formatEditionDate,
} from "@/lib/content";
import { ASSEMBLY_BASE, ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmHero from "@/components/assembly/AsmHero";
import AsmFacts from "@/components/assembly/AsmFacts";
import AsmMarquee from "@/components/assembly/AsmMarquee";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmFacultyGrid from "@/components/assembly/AsmFacultyGrid";
import AsmStory from "@/components/assembly/AsmStory";
import AsmPartners from "@/components/assembly/AsmPartners";
import AsmEssentials from "@/components/assembly/AsmEssentials";
import AsmFocus from "@/components/assembly/AsmFocus";
import AsmInterviews from "@/components/assembly/AsmInterviews";
import AsmVoices from "@/components/assembly/AsmVoices";
import AsmLetters from "@/components/assembly/AsmLetters";
import AsmJournal from "@/components/assembly/AsmJournal";
import AsmPastEditions from "@/components/assembly/AsmPastEditions";
import AsmFaq from "@/components/assembly/AsmFaq";
import AsmCta from "@/components/assembly/AsmCta";
import AsmContact from "@/components/assembly/AsmContact";

export default async function AssemblyHome() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);
  const faculty = getFaculty(content, edition.slug);
  const interviews = getInterviewCards(content, faculty);
  const partnerGroups = getPartnersByType(content);

  /* Derived, not typed in: these numbers cannot go stale when the roster does. */
  const derivedStats = [
    { value: String(faculty.length), label: "Faculty confirmed" },
    { value: `0${content.tracks.length}`, label: "Tracks on one chain" },
    { value: String(interviews.length), label: "Recorded interviews" },
    { value: `${content.partners.length}+`, label: "Partner organizations" },
  ];

  return (
    /* No rail on home: the hero mosaic already carries the agenda and the
       ticket cards, so the rail would repeat both above the fold. */
    <AsmShell>
      <AsmHero edition={edition} assembly={assembly} />

      <AsmFacts
        facts={assembly.facts}
        action={{ label: "Get a ticket", href: ASSEMBLY_REGISTER }}
      />

      <AsmMarquee items={assembly.marquee} />

      <AsmSectionHead
        id="interviews"
        eyebrow="Interviews"
        title="Voices from the floor"
        lede="We film the faculty at every edition — every conversation on record, in full, below."
        action={{ label: "Media archive", href: `${ASSEMBLY_BASE}/media` }}
      />
      <AsmInterviews cards={interviews} />

      <AsmSectionHead
        id="faculty"
        eyebrow="Faculty"
        title="Meet the faculty"
        lede="Researchers, industry engineers and the ecosystem organizations that connect them. The full roster runs to dozens of names."
        action={{ label: "All speakers", href: `${ASSEMBLY_BASE}/speakers` }}
      />
      <AsmFacultyGrid members={faculty.slice(0, 6)} columns={3} />

      <AsmSectionHead
        id="story"
        eyebrow="The work"
        title="The making of the summit"
        lede="Three editions in, run by a non-profit, built around one argument rather than a parade of talks."
        tone="plain"
        size="d2"
      />
      <AsmStory chapters={assembly.story} />

      <AsmSectionHead
        id="partners"
        eyebrow="Partners"
        title="Partners in innovation"
        lede="Universities, industry and community organizations. The summit is a non-profit event and runs on their support."
        action={{ label: "All partners", href: `${ASSEMBLY_BASE}/partners` }}
        tone="deep"
      />
      <AsmPartners groups={partnerGroups.slice(0, 2)} />

      <AsmEssentials
        eyebrow="Moments"
        title="Our summit essentials"
        features={assembly.features}
        stats={derivedStats}
      />

      <AsmFocus areas={assembly.focusAreas} hero={assembly.focusMedia} />

      <AsmSectionHead
        eyebrow="On the record"
        title="What is actually being said"
        tone="plain"
        size="d2"
      />
      <AsmVoices voices={assembly.voices} />

      <AsmSectionHead
        id="recognition"
        eyebrow="Recognition"
        title="Letters of support"
        lede="Editions 01 and 02 were recognized by the Province of Ontario and the City of Toronto."
        tone="tint"
        size="d2"
      />
      <AsmLetters letters={assembly.letters} />

      <AsmSectionHead
        eyebrow="Field notes"
        title="Why this summit exists"
        lede="Three short briefings on the problem the programme is built around."
        tone="plain"
        size="d2"
      />
      <AsmJournal posts={assembly.journal} />

      <AsmSectionHead
        eyebrow="Archive"
        title="Past editions and key resources"
        action={{ label: "Media archive", href: `${ASSEMBLY_BASE}/media` }}
        tone="deep"
        size="d2"
      />
      <AsmPastEditions
        editions={assembly.pastEditions}
        currentYear={edition.year}
      />

      <AsmSectionHead
        id="faq"
        eyebrow="Questions"
        title="Questions answered"
        lede="Everything we get asked most often. If it is not here, the contact form reaches the organizing team."
        size="d2"
      />
      <AsmFaq items={assembly.faq} />

      <AsmCta
        title="Ready to be part of it?"
        text={`${formatEditionDate(edition)} at ${edition.venue.name}, ${edition.venue.city}. One room, one day, the people building the power layer under AI.`}
        primary={{ label: "Register", href: ASSEMBLY_REGISTER }}
        secondary={{ label: "See the agenda", href: `${ASSEMBLY_BASE}/agenda` }}
        media={assembly.gallery[1]}
      />

      <AsmContact contact={assembly.contact} edition={edition} />
    </AsmShell>
  );
}
