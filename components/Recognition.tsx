import type { SummitDocument } from "@/lib/content";

export default function Recognition({ documents }: { documents: SummitDocument[] }) {
  if (documents.length === 0) return null;

  return (
    <section className="section" id="recognition" aria-labelledby="recognition-h">
      <div className="container">
        <div className="section-mark">
          <span className="num" aria-hidden="true">
            ··
          </span>
          <h2 id="recognition-h">Recognition</h2>
        </div>
        <ul className="doc-grid">
          {documents.map((doc) => (
            <li key={doc.title} className="doc-card">
              <img src={doc.image.sourceUrl} alt={doc.image.alt} width={480} height={340} loading="lazy" />
              <p className="doc-title">{doc.title}</p>
              <p className="doc-issuer">
                {doc.type} — {doc.issuer}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
