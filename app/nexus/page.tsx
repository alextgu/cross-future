import {
  getSummitContent,
  getCurrentEdition,
  getFaculty,
  getConfirmedSessions,
  getHostOrganization,
  type Person,
} from "@/lib/content";
import NexusNav from "@/components/nexus/NexusNav";
import NexusHero from "@/components/nexus/NexusHero";
import NexusManifesto from "@/components/nexus/NexusManifesto";
import NexusAgenda from "@/components/nexus/NexusAgenda";
import NexusFaculty from "@/components/nexus/NexusFaculty";
import NexusInterviews from "@/components/nexus/NexusInterviews";
import NexusArchives from "@/components/nexus/NexusArchives";
import NexusRegister from "@/components/nexus/NexusRegister";
import NexusFooter from "@/components/nexus/NexusFooter";

export default async function NexusPage() {
  const content = await getSummitContent("nexus");
  const edition = getCurrentEdition(content);
  const host = getHostOrganization(content);
  const faculty = getFaculty(content, edition.slug);
  const sessions = getConfirmedSessions(content, edition.slug);

  const theses = Object.fromEntries(
    content.appearances
      .filter((a) => a.edition === edition.slug)
      .map((a) => [a.person, a.thesis])
  );

  const peopleBySlug: Record<string, Person | undefined> = Object.fromEntries(
    content.people.map((p) => [p.slug, p])
  );
  const orgLineBySlug = Object.fromEntries(
    faculty.map((member) => [
      member.person.slug,
      member.organizations.length > 0
        ? member.organizations.map((o) => o.shortName).join(" / ")
        : member.roleTitle,
    ])
  );

  return (
    <>
      <NexusNav year={edition.year} />
      <main id="main">
        <NexusHero edition={edition} host={host} />
        {content.manifesto ? <NexusManifesto manifesto={content.manifesto} /> : null}
        <NexusAgenda edition={edition} sessions={sessions} />
        <NexusFaculty faculty={faculty} theses={theses} />
        {content.interviews && content.interviews.length > 0 ? (
          <NexusInterviews
            interviews={content.interviews}
            peopleBySlug={peopleBySlug}
            orgLineBySlug={orgLineBySlug}
          />
        ) : null}
        <NexusRegister edition={edition} benefits={content.registerBenefits ?? []} />
        <NexusArchives items={content.archives ?? []} />
      </main>
      <NexusFooter
        edition={edition}
        hostName={host?.name ?? "Cross Future Hub"}
        bandImage={content.footerImage ?? null}
      />
    </>
  );
}
