import type { Interview, Person } from "@/lib/content";
import Reveal from "./Reveal";

export default function NexusInterviews({
  interviews,
  peopleBySlug,
  orgLineBySlug,
}: {
  interviews: Interview[];
  peopleBySlug: Record<string, Person | undefined>;
  orgLineBySlug: Record<string, string | undefined>;
}) {
  const featured = interviews.find((i) => i.featured);
  const rest = interviews.filter((i) => !i.featured);

  return (
    <section className="nx-section" id="interviews" aria-labelledby="nx-interviews-h">
      <div className="nx-container">
        <div className="nx-section-head">
          <div>
            <p className="nx-seclabel">§ 04 / INTERVIEWS</p>
            <h2 className="nx-h2" id="nx-interviews-h">
              In Conversation
            </h2>
          </div>
          <p className="nx-section-hint">
            Depth interviews with the faculty — unedited, one take.
          </p>
        </div>

        {featured ? (
          <Reveal>
            <div className="nx-featured">
              <div className="nx-featured-media">
                {featured.image ? (
                  <img
                    src={featured.image.sourceUrl}
                    alt={featured.image.alt}
                    width={1379}
                    height={720}
                    loading="lazy"
                  />
                ) : null}
                <span className="nx-play" aria-hidden="true" />
                <div className="overlay">
                  <span className="kicker">
                    Featured · {featured.durationMin} min
                  </span>
                  <h3>{featured.title}</h3>
                  <span className="byline">
                    — {personName(peopleBySlug[featured.person])} ·{" "}
                    {orgLineBySlug[featured.person] ?? ""}
                  </span>
                </div>
              </div>
              <div className="nx-featured-quote">
                <span className="label">Pull quote</span>
                {featured.pullQuote ? (
                  <blockquote>“{featured.pullQuote}”</blockquote>
                ) : null}
                <a className="nx-underline-link" href={featured.url ?? "#"}>
                  Watch the interview <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </Reveal>
        ) : null}

        <ul className="nx-interview-grid">
          {rest.map((interview) => {
            const person = peopleBySlug[interview.person];
            return (
              <li key={interview.code}>
                <a className="nx-interview" href={interview.url ?? "#"}>
                  <span className="code">{interview.code}</span>
                  {person ? (
                    <span className="thumb" aria-hidden="true">
                      <img
                        src={person.headshot.sourceUrl}
                        alt=""
                        width={80}
                        height={80}
                        loading="lazy"
                      />
                    </span>
                  ) : null}
                  <h3>{interview.title}</h3>
                  <span className="foot">
                    <span>— {personName(person)}</span>
                    <span>{interview.durationMin} min</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function personName(person: Person | undefined): string {
  return person ? `${person.firstName} ${person.lastName}` : "Faculty";
}
