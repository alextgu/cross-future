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

  const slots = Array.from({ length: partners.length });

  return (
    <section className="asm-sponsorwall" aria-label="Sponsors">
      <h3 className="asm-sponsorwall-title">Our Partners</h3>
      <div className="asm-logowall is-placeholder">
        {slots.map((_, i) => (
          <div key={`placeholder-${i}`} className="asm-logo is-placeholder">
            <span>Logo {String(i + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
