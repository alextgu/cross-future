import type { Partner } from "@/lib/content";

export default function Partners({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  return (
    <section className="section" id="partners" aria-labelledby="partners-h">
      <div className="container">
        <div className="section-mark">
          <span className="num" aria-hidden="true">
            ··
          </span>
          <h2 id="partners-h">Partners</h2>
        </div>
        <ul className="partner-grid">
          {partners.map((partner) => (
            <li key={partner.slug}>
              <a className="partner-cell" href={partner.url} rel="noopener noreferrer">
                <img src={partner.logo.sourceUrl} alt={partner.logo.alt} width={160} height={40} loading="lazy" />
                <span className="partner-name">{partner.name ?? partner.type}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
