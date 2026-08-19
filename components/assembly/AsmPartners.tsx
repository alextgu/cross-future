import type { Partner } from "@/lib/content";
import AsmEmpty from "./AsmEmpty";

/**
 * The logo wall, as the live site runs it: every partner in one wall, no tier
 * headings, no card around each mark.
 *
 * The tiered version this replaced split thirteen logos into four labelled
 * groups of three or four, which read as an org chart rather than a thank-you
 * and took several times the height. The grouping still exists in the data —
 * it is just not something this page needs to say.
 *
 * Logos are the one place duotone is wrong: a flattened logo is a damaged
 * logo. They sit at a common optical size, and a partner without a URL
 * renders as a plain mark rather than a link to nowhere.
 */
export default function AsmPartners({
  groups,
}: {
  groups: { type: string; partners: Partner[] }[];
}) {
  const partners = groups.flatMap((group) => group.partners);

  if (partners.length === 0) {
    return (
      <AsmEmpty
        label="Partners being confirmed"
        note="Supporting organizations are listed once their agreement is signed and they have supplied a logo."
      />
    );
  }

  return (
    <div className="asm-logowall">
      {partners.map((partner) => {
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
  );
}
