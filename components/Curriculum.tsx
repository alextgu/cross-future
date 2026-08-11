import type { Track } from "@/lib/content";
import { sectionNum } from "@/lib/sections";

export default function Curriculum({ tracks }: { tracks: Track[] }) {
  return (
    <section className="section" id="curriculum" aria-labelledby="curriculum-h">
      <div className="container">
        <div className="section-mark">
          <span className="num">{sectionNum("curriculum")}</span>
          <h2 id="curriculum-h">Curriculum</h2>
        </div>
        <ul className="track-list">
          {tracks.map((track) => (
            <li key={track.code} className="track-row">
              <span className="track-code">{track.code}</span>
              <h3 className="track-name">{track.name}</h3>
              <p className="track-desc">{track.description}</p>
              <span className="track-stage">{track.chainStage.replace("-", " ")}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
