import type { Metadata } from "next";
import { getCompletedPastEditions, getSummitContent } from "@/lib/content";
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

  return (
    <AsmShell>
      <AsmSectionHead
        eyebrow="Progress archive"
        title="Past Events"
        lede="The completed Cross Future editions, and the concrete progress each gathering carried forward."
        tone="plain"
      />
      <AsmPastEventsMockup editions={editions} />
    </AsmShell>
  );
}
