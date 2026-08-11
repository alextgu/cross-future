import type { FacultyMember } from "@/lib/content";

/**
 * Faculty pillars. The original design shows only a monogram; the
 * innovation here is a real portrait slot — hovering (or keyboard focus)
 * reveals the photo and the speaker's thesis line. Data comes from
 * appearances, so a returning speaker keeps that year's thesis and title.
 */
export default function NexusFaculty({
  faculty,
  theses,
}: {
  faculty: FacultyMember[];
  theses: Record<string, string | undefined>;
}) {
  return (
    <section className="nx-section" id="faculty" aria-labelledby="nx-faculty-h">
      <div className="nx-container">
        <div className="nx-section-head">
          <div>
            <p className="nx-seclabel">§ 03 / FACULTY OF FUTURE</p>
            <h2 className="nx-h2" id="nx-faculty-h">
              The Faculty
            </h2>
          </div>
          <p className="nx-section-hint">
            Hover a pillar to reveal the speaker&apos;s portrait and core AI
            thesis.
          </p>
        </div>

        <ul className="nx-faculty-grid">
          {faculty.map((member, index) => {
            const fullName = `${member.person.firstName} ${member.person.lastName}`;
            const monogram =
              `${member.person.firstName[0] ?? ""}${member.person.lastName[0] ?? ""}`.toUpperCase();
            const orgLine =
              member.organizations.length > 0
                ? member.organizations.map((o) => o.shortName).join(" / ")
                : member.roleTitle;
            const thesis = theses[member.person.slug];
            return (
              <li key={member.person.slug} className="nx-pillar-card" tabIndex={0}>
                <div className="portrait" aria-hidden="true">
                  <img
                    src={member.person.headshot.sourceUrl}
                    alt=""
                    width={400}
                    height={520}
                    loading="lazy"
                  />
                </div>
                <div className="meta">
                  <span className="idx">F.{String(index + 1).padStart(2, "0")}</span>
                  <span className="tag">Portrait</span>
                </div>
                <span className="monogram" aria-hidden="true">
                  {monogram}
                </span>
                {thesis ? <p className="thesis">“{thesis}”</p> : null}
                <div className="who">
                  <span className="name">
                    {member.safeLink ? (
                      <a href={member.safeLink.url} rel="noopener noreferrer">
                        {fullName}
                      </a>
                    ) : (
                      fullName
                    )}
                  </span>
                  <span className="org">{orgLine}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
