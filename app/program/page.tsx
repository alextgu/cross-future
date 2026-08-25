import type { Metadata } from "next";
import {
  getAssembly,
  getConfirmedSessions,
  getCurrentEdition,
  getProposedSessions,
  getSummitContent,
} from "@/lib/content";
import AsmAgenda from "@/components/assembly/AsmAgenda";
import AsmFocus from "@/components/assembly/AsmFocus";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmSection from "@/components/assembly/AsmSection";
import AsmShell from "@/components/assembly/AsmShell";

export const metadata: Metadata = {
  title: "Program",
  description:
    "Themes, sessions and schedule for the upcoming Cross Future AI event.",
  alternates: { canonical: "/program" },
};

export default async function ProgramPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);
  const confirmed = getConfirmedSessions(content, edition.slug);
  const proposed = getProposedSessions(content, edition.slug);

  return (
    <AsmShell>
      <AsmPageHero
        intro={{
          eyebrow: "Upcoming event",
          title: "Program",
          lede:
            "The research questions, industry challenges and conversations shaping the next Cross Future gathering.",
        }}
      />
      <AsmSection label="Program focus areas">
        <AsmFocus areas={assembly.focusAreas} hero={assembly.focusMedia} />
      </AsmSection>
      <AsmSection label="Event schedule">
        <AsmAgenda
          edition={edition}
          confirmed={confirmed}
          proposed={proposed}
          tracks={content.tracks}
          variant="status"
        />
      </AsmSection>
    </AsmShell>
  );
}
