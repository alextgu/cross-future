import type { Metadata } from "next";
import { getSummitContent } from "@/lib/content";
import AsmShell from "@/components/assembly/AsmShell";
import AsmSectionHead from "@/components/assembly/AsmSectionHead";

export const metadata: Metadata = {
  title: "Past Events",
  alternates: { canonical: "/past-events" },
  description: "Past editions of the Cross Future AI Summit.",
};

export default async function PastEventsPage() {
  await getSummitContent("assembly");

  return (
    <AsmShell>
      <AsmSectionHead
        eyebrow="Archive"
        title="Past Events"
        lede="Previous editions of the Cross Future AI Summit."
        tone="plain"
      />
    </AsmShell>
  );
}
