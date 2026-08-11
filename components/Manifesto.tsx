import type { Edition } from "@/lib/content";
import { sectionNum } from "@/lib/sections";

export default function Manifesto({ edition }: { edition: Edition }) {
  return (
    <section className="section" id="manifesto" aria-labelledby="manifesto-h">
      <div className="container">
        <div className="section-mark">
          <span className="num">{sectionNum("manifesto")}</span>
          <h2 id="manifesto-h">Manifesto</h2>
        </div>
        <p className="manifesto-body">{edition.thesis}</p>
        <p className="manifesto-theme mono-label">Theme — {edition.theme}</p>
      </div>
    </section>
  );
}
