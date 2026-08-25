import type { Metadata } from "next";
import {
  getCurrentEdition,
  getFaculty,
  getInterviewCards,
  getSummitContent,
} from "@/lib/content";
import AsmFacultyGrid from "@/components/assembly/AsmFacultyGrid";
import AsmInterviews from "@/components/assembly/AsmInterviews";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmSection from "@/components/assembly/AsmSection";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmShell from "@/components/assembly/AsmShell";

export const metadata: Metadata = {
  title: "Speakers & Interviews",
  description:
    "Meet previous Cross Future speakers and watch recorded conversations from past events.",
  alternates: { canonical: "/speakers" },
};

export default async function SpeakersAndInterviewsPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const faculty = getFaculty(content, edition.slug);
  const interviews = getInterviewCards(content, faculty);

  return (
    <AsmShell>
      <AsmPageHero
        intro={{
          eyebrow: "The Cross Future archive",
          title: "Speakers & Interviews",
          lede:
            "Researchers, professors and industry leaders who have shared their ideas on the Cross Future stage — and the conversations recorded with them.",
        }}
      />

      <AsmSection id="speakers" label="Previous Speakers">
        <AsmSectionHead
          id="speaker-library-heading"
          eyebrow={`${faculty.length} voices`}
          title="Previous Speakers"
          tone="plain"
        />
        <AsmFacultyGrid members={faculty} columns={4} aspect="4 / 5" />
      </AsmSection>

      <AsmSection id="interviews" label="Recorded Interviews">
        <AsmSectionHead
          id="interview-library-heading"
          eyebrow="On the record"
          title="Recorded Interviews"
          tone="plain"
        />
        <AsmInterviews cards={interviews} columns={3} />
      </AsmSection>
    </AsmShell>
  );
}
