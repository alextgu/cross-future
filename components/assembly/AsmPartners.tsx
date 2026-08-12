import type { Partner } from "@/lib/content";

const TYPE_LABEL: Record<string, string> = {
  academic: "Academic",
  industry: "Industry",
  community: "Community",
  ecosystem: "Ecosystem",
};

/**
 * Logo wall. Logos are the one place duotone is wrong — a flattened logo is a
 * damaged logo — so these bypass AsmMedia and render on a plain card.
 * A partner without a URL renders as a card, not a link to nowhere.
 */
export default function AsmPartners({
  groups,
  columns = 5,
}: {
  groups: { type: string; partners: Partner[] }[];
  columns?: number;
}) {
  return (
    <div className="asm-stack">
      {groups.map((group) => (
        <section key={group.type} className="asm-stack">
          <p className="asm-eyebrow" style={{ paddingLeft: 4 }}>
            {TYPE_LABEL[group.type] ?? group.type}
          </p>
          <div
            className="asm-row"
            style={{ ["--cols" as string]: columns, ["--cols-md" as string]: 3 }}
          >
            {group.partners.map((partner) => {
              const logo = (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={partner.logo.sourceUrl}
                  alt={partner.logo.alt}
                  loading="lazy"
                  decoding="async"
                />
              );
              return partner.url ? (
                <a
                  key={partner.slug}
                  className="asm-logo"
                  href={partner.url}
                  target="_blank"
                  rel="noreferrer"
                  title={partner.name ?? undefined}
                >
                  {logo}
                </a>
              ) : (
                <div
                  key={partner.slug}
                  className="asm-logo"
                  title={partner.name ?? undefined}
                >
                  {logo}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
