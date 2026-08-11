import {
  getSummitContent,
  getCurrentEdition,
  getFaculty,
  getConfirmedSessions,
  getHostOrganization,
} from "@/lib/content";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Curriculum from "@/components/Curriculum";
import Faculty from "@/components/Faculty";
import Agenda from "@/components/Agenda";
import Recognition from "@/components/Recognition";
import Partners from "@/components/Partners";
import Registration from "@/components/Registration";
import Footer from "@/components/Footer";

export default async function Page() {
  const content = await getSummitContent();
  const edition = getCurrentEdition(content);
  const host = getHostOrganization(content);
  const faculty = getFaculty(content, edition.slug);
  const confirmedSessions = getConfirmedSessions(content, edition.slug);

  return (
    <>
      <Nav />
      <main id="main">
        <Hero
          edition={edition}
          host={host}
          facultyCount={faculty.length}
          tracks={content.tracks}
        />
        <Manifesto edition={edition} />
        <Curriculum tracks={content.tracks} />
        <Faculty faculty={faculty} />
        <Agenda
          edition={edition}
          confirmedSessions={confirmedSessions}
          tracks={content.tracks}
        />
        <Recognition documents={content.documents} />
        <Partners partners={content.partners} />
        <Registration edition={edition} />
      </main>
      <Footer edition={edition} host={host} />
    </>
  );
}
