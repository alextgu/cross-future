import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCurrentEdition,
  getFaculty,
  getInterviewCardBySlug,
  getSummitContent,
} from "@/lib/content";
import AsmButton from "@/components/assembly/AsmButton";
import AsmMedia from "@/components/assembly/AsmMedia";
import AsmShell from "@/components/assembly/AsmShell";

type InterviewPageProps = { params: Promise<{ slug: string }> };

// Newly published interviews are rendered on demand and can be evicted by the
// Sanity publish webhook without requiring a rebuild.
export const dynamicParams = true;
export const revalidate = 3600;

async function getCard(slug: string, draft = false) {
  const content = await getSummitContent("assembly", { draft });
  const edition = getCurrentEdition(content);
  const faculty = getFaculty(content, edition.slug);
  return getInterviewCardBySlug(content, faculty, slug);
}

export async function generateStaticParams() {
  const content = await getSummitContent("assembly");
  return (content.interviews ?? []).map((interview) => ({ slug: interview.slug }));
}

export async function generateMetadata({ params }: InterviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCard(slug);
  if (!card) return { title: "Interview not found" };

  const name = card.person
    ? `${card.person.firstName} ${card.person.lastName}`
    : card.interview.title;
  return {
    title: `${name} — Recorded Interview`,
    description: card.interview.pullQuote ?? `A recorded Cross Future conversation with ${name}.`,
    alternates: { canonical: `/interviews/${slug}` },
  };
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { slug } = await params;
  const card = await getCard(slug, (await draftMode()).isEnabled);
  if (!card) notFound();

  const { interview, person, orgLine } = card;
  const name = person ? `${person.firstName} ${person.lastName}` : interview.person;

  return (
    <AsmShell>
      <Link className="asm-interview-back asm-meta" href="/interviews">
        ← All interviews
      </Link>
      <article className="asm-interview-detail">
        <div className="asm-card t-deep asm-interview-detail-media">
          {interview.image ? (
            <AsmMedia
              media={{
                kind: "image",
                src: interview.image.sourceUrl,
                alt: interview.image.alt,
                placeholder: interview.image.placeholder,
              }}
              aspect="16 / 10"
              scrim
            />
          ) : (
            <div className="asm-interview-recording-status">
              <p className="asm-meta">Recording still</p>
              <p className="asm-d3">Image coming soon</p>
            </div>
          )}
        </div>

        <div className="asm-card is-padded t-mist asm-interview-detail-copy">
          <p className="asm-meta">
            {interview.code} · {interview.durationMin} min
            {interview.editionYear ? ` · ${interview.editionYear} edition` : ""}
          </p>
          <h1 className="asm-d1">{interview.title}</h1>
          <div>
            <p className="asm-display asm-interview-person">{name}</p>
            {orgLine ? <p className="asm-meta">{orgLine}</p> : null}
          </div>
          {interview.pullQuote ? (
            <blockquote className="asm-interview-quote">“{interview.pullQuote}”</blockquote>
          ) : null}
          {interview.topics && interview.topics.length > 0 ? (
            <ul className="asm-interview-topics" aria-label="Topics">
              {interview.topics.map((topic) => (
                <li className="asm-meta" key={topic}>{topic}</li>
              ))}
            </ul>
          ) : null}
          {interview.url ? (
            <AsmButton href={interview.url}>Watch recording</AsmButton>
          ) : (
            <div className="asm-interview-recording-status t-plain">
              <p className="asm-meta">Recording coming</p>
              <p className="asm-body">
                This conversation has a permanent home. The recording link will appear here when it is ready.
              </p>
            </div>
          )}
        </div>
      </article>
    </AsmShell>
  );
}
