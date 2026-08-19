import type { Metadata } from "next";
import { getSummitContent, getAssembly } from "@/lib/content";
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
  const assembly = getAssembly(content);

  return (
    <AsmShell>
      <AsmSectionHead
        eyebrow="Archive"
        title="Past Events"
        lede="Previous editions of the Cross Future AI Summit."
        tone="plain"
      />
      <AsmPastEventsMockup editions={assembly.pastEditions} />
    </AsmShell>
  );
}
