import type { Metadata } from "next";
import {
  getCompletedPastEditions,
  getCurrentEdition,
  getFaculty,
  getInterviewCards,
  getInterviewCardsForEditionYear,
  getSummitContent,
  type InterviewCard,
} from "@/lib/content";
import AsmShell from "@/components/assembly/AsmShell";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmPastEventsMockup from "@/components/assembly/AsmPastEventsMockup";

export const metadata: Metadata = {
  title: "Past Events",
  alternates: { canonical: "/past-events" },
  description: "Past editions of the Cross Future AI Summit.",
};

export default async function PastEventsPage() {
  const content = await getSummitContent("assembly");
  const editions = getCompletedPastEditions(content);
  const current = getCurrentEdition(content);
  const faculty = getFaculty(content, current.slug);
  const interviewCandidates = getInterviewCards(content, faculty);
  const interviewsByYear = Object.fromEntries(
    editions.map((edition) => [
      edition.year,
      getInterviewCardsForEditionYear(content, faculty, edition.year),
    ])
  ) as Record<number, InterviewCard[]>;

  return (
    <AsmShell>
      <AsmSectionHead
        eyebrow="Progress archive"
        title="Past Events"
        tone="plain"
      />
      <AsmPastEventsMockup
        editions={editions}
        interviewsByYear={interviewsByYear}
        interviewCandidates={interviewCandidates}
      />
    </AsmShell>
  );
}
