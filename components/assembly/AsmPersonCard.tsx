import type { FacultyMember } from "@/lib/content";

/**
 * Portrait card: media on top, solid name plate beneath.
 *
 * The name is a link ONLY when the adapter handed us a safeLink — that is,
 * the person is verified and we hold a canonical URL. Everyone else renders
 * as plain text. Never guess where a person's name should point.
 */
export default function AsmPersonCard({
  member,
  aspect = "3 / 4",
}: {
  member: FacultyMember;
  aspect?: string;
}) {
  const { person, organizations, roleTitle, safeLink } = member;
  const name = `${person.firstName} ${person.lastName}`;
  const orgLine = organizations.map((o) => o.shortName).join(" / ");
  const fp = person.headshot.focalPoint;

  return (
    <article className="asm-person">
      <figure
        className="asm-media is-duo"
        style={
          {
            "--asm-aspect": aspect,
            ...(fp ? { "--asm-fp": `${fp.x}% ${fp.y}%` } : {}),
          } as React.CSSProperties
        }
        data-placeholder={person.headshot.placeholder ? "true" : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={person.headshot.sourceUrl}
          alt={person.headshot.alt}
          loading="lazy"
          decoding="async"
        />
      </figure>

      <div className="asm-person-plate">
        <h3 className="asm-person-name">
          {safeLink ? (
            <a href={safeLink.url} target="_blank" rel="noreferrer">
              {name}
            </a>
          ) : (
            name
          )}
        </h3>
        {orgLine ? <p className="asm-person-org">{orgLine}</p> : null}
        <p className="asm-person-role">{roleTitle}</p>
      </div>
    </article>
  );
}
