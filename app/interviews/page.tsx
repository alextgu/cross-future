import type { Metadata } from "next";
import {
  getCurrentEdition,
  getFaculty,
  getInterviewCards,
  getInterviewYears,
  getSummitContent,
} from "@/lib/content";
import AsmInterviewLibrary from "@/components/assembly/AsmInterviewLibrary";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmShell from "@/components/assembly/AsmShell";

export const metadata: Metadata = {
  title: "Recorded Interviews",
  description: "Recorded conversations from across Cross Future festival editions.",
  alternates: { canonical: "/interviews" },
};

export default async function InterviewsPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const faculty = getFaculty(content, edition.slug);
  const cards = getInterviewCards(content, faculty);
  const years = getInterviewYears(content);

  return (
    <AsmShell>
      <AsmSectionHead
        eyebrow="On the record"
        title="Recorded Interviews"
        lede="One permanent library for conversations from every Cross Future edition. Edition filters appear as recordings are explicitly mapped."
        tone="plain"
      />
      <AsmInterviewLibrary cards={cards} years={years} />
    </AsmShell>
  );
}
