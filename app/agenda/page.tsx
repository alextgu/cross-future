import type { Metadata } from "next";
import {
  getSummitContent,
  getCurrentEdition,
  getAssembly,
  getConfirmedSessions,
  getProposedSessions,
  formatEditionDate,
} from "@/lib/content";
import { ASSEMBLY_BASE, ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmShell from "@/components/assembly/AsmShell";
import AsmPageHero from "@/components/assembly/AsmPageHero";
import AsmAgenda from "@/components/assembly/AsmAgenda";
import AsmFacts from "@/components/assembly/AsmFacts";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";
import AsmFaq from "@/components/assembly/AsmFaq";
import AsmCta from "@/components/assembly/AsmCta";

export const metadata: Metadata = {
  title: "Agenda",
  description:
    "The shape of the day for Cross Future AI Summit 2026 — 24 July, 08:30 to 17:30, Hotel Monville, Montréal.",
};

export default async function AgendaPage() {
  const content = await getSummitContent("assembly");
  const edition = getCurrentEdition(content);
  const assembly = getAssembly(content);
  const confirmed = getConfirmedSessions(content, edition.slug);
  const proposed = getProposedSessions(content, edition.slug);

  /* Only the agenda-specific questions belong here. */
  const agendaFaq = assembly.faq.filter((item) =>
    /agenda|recorded|language|accessible|there/i.test(item.question)
  );

  return (
    <AsmShell rail={assembly.rail}>
      <AsmPageHero intro={assembly.pageIntros.agenda} />

      <AsmFacts facts={assembly.facts} />

      <AsmAgenda
        edition={edition}
        confirmed={confirmed}
        proposed={proposed}
        tracks={content.tracks}
      />

      <AsmSectionHead
        eyebrow="Questions"
        title="Before the day"
        tone="plain"
        size="d2"
      />
      <AsmFaq items={agendaFaq} />

      <AsmCta
        title="Registrants get the agenda first"
        text={`Named sessions and speakers go out to the list before they are published here. ${formatEditionDate(edition)}.`}
        primary={{ label: "Register", href: ASSEMBLY_REGISTER }}
        secondary={{ label: "Meet the faculty", href: `${ASSEMBLY_BASE}/speakers` }}
        media={assembly.gallery[1]}
      />
    </AsmShell>
  );
}
