import type { Metadata } from "next";
import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  getFaculty,
  getInterviewCards,
} from "@/lib/content";
import { ASSEMBLY_BASE, ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmInterviews from "@/components/assembly/AsmInterviews";
import AsmGallery from "@/components/assembly/AsmGallery";
import AsmPastEditions from "@/components/assembly/AsmPastEditions";
import AsmJournal from "@/components/assembly/AsmJournal";
import AsmCta from "@/components/assembly/AsmCta";

export const metadata: Metadata = {
  title: "Media",
  description:
    "Recorded interviews with the Cross Future AI Summit faculty, plus the photographic archive of every edition.",
};

export default async function MediaPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);
  const faculty = getFaculty(content, edition.slug);
  const cards = getInterviewCards(content, faculty);

  const featured = cards.filter((c) => c.interview.featured);
  const rest = cards.filter((c) => !c.interview.featured);

  const totalMinutes = cards.reduce(
    (sum, c) => sum + c.interview.durationMin,
    0
  );

  return (
    <AsmShell rail={assembly.rail}>
      <AsmPageHero
        intro={assembly.pageIntros.media}
        aside={
          <ul style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <li className="asm-chip is-solid">{cards.length} interviews</li>
            <li className="asm-chip">
              {Math.round(totalMinutes / 60)} h {totalMinutes % 60} m
            </li>
            <li className="asm-chip">{assembly.gallery.length} photographs</li>
          </ul>
        }
      />

      <AsmSectionHead
        eyebrow="Featured"
        title="Start here"
        lede="Five conversations that frame the whole programme."
      />
      <AsmInterviews cards={featured} columns={3} />

      <AsmSectionHead
        eyebrow="Full archive"
        title="Every interview"
        lede="Filmed on site at each edition. New conversations publish between summits, not only on the day."
        tone="plain"
      />
      <AsmInterviews cards={rest} columns={4} />

      <AsmSectionHead
        eyebrow="Photographs"
        title="On the floor"
        lede="The photographic record — plenaries, breakouts, the foyer, the reception."
        tone="tint"
      />
      <AsmGallery items={assembly.gallery} />

      <AsmSectionHead
        eyebrow="Archive"
        title="By edition"
        tone="deep"
      />
      <AsmPastEditions
        editions={assembly.pastEditions}
        currentYear={edition.year}
      />

      <AsmSectionHead
        eyebrow="Field notes"
        title="Written record"
      />
      <AsmJournal posts={assembly.journal} />

      <AsmCta
        title="Be in the next set"
        text="We film the faculty at every edition. If you are speaking, we will find you on the day."
        primary={{ label: "Register", href: ASSEMBLY_REGISTER }}
        secondary={{ label: "Meet the faculty", href: `${ASSEMBLY_BASE}/speakers` }}
        media={assembly.gallery[7]}
      />
    </AsmShell>
  );
}
