import type { Edition, Session, Track } from "@/lib/content";
import {
  formatEditionDate,
  formatEditionHours,
  formatSessionTime,
  sessionDurationMin,
} from "@/lib/content";
import { ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";

/**
 * The agenda has two states and the data decides which one renders.
 *
 * Zero confirmed sessions → the designed "not yet published" state, because
 * that is the truth today. Add one session with status "confirmed" and the
 * real schedule takes over with no code change. Proposed sessions render
 * underneath as the provisional shape of the day, always chipped as such —
 * never dressed up as a published programme.
 */
export default function AsmAgenda({
  edition,
  confirmed,
  proposed,
  tracks,
}: {
  edition: Edition;
  confirmed: Session[];
  proposed: Session[];
  tracks: Track[];
}) {
  const published = confirmed.length > 0;
  const rows = published ? confirmed : proposed;
  const trackByCode = new Map(tracks.map((t) => [t.code, t]));

  return (
    <div className="asm-stack">
      <div className="asm-card is-padded t-deep">
        <div className="asm-head">
          <div className="asm-head-title">
            <p className="asm-eyebrow">
              {published ? "Programme" : "Agenda · not yet published"}
            </p>
            <h2 className="asm-d1">
              {formatEditionDate(edition)}
              <br />
              {formatEditionHours(edition)}
            </h2>
          </div>
          <div className="asm-head-aside">
            <p className="asm-lede">
              {published
                ? `One day at ${edition.venue.name}, ${edition.venue.city}. Rooms are confirmed on arrival.`
                : `The structure of the day is fixed. Named sessions and speakers go to registrants first as they are confirmed, then here.`}
            </p>
            <AsmButton href={ASSEMBLY_REGISTER} tone="inverse">
              {published ? "Register" : "Get it first — register"}
            </AsmButton>
          </div>
        </div>
      </div>

      <section className="asm-card t-plain" aria-label="Schedule">
        <div
          style={{
            padding: "var(--asm-pad-tight) var(--asm-pad)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
            borderBottom: "1px solid var(--asm-hair)",
          }}
        >
          <span className={`asm-chip${published ? " is-solid" : ""}`}>
            {published ? "Confirmed" : "Provisional"}
          </span>
          <span className="asm-meta">
            {published
              ? `${rows.length} sessions`
              : "Shape of the day — times and blocks, not final titles"}
          </span>
        </div>

        {rows.map((session) => {
          const track = trackByCode.get(session.track);
          return (
            <article className="asm-slot" key={session.code ?? session.title}>
              <span className="asm-slot-time">
                {formatSessionTime(session, edition.timezone)}
              </span>
              <span className="asm-meta">{session.categoryLabel ?? track?.code}</span>
              <div>
                <h3 className="asm-slot-title">{session.title}</h3>
                {track ? (
                  <p className="asm-meta" style={{ marginTop: 6 }}>
                    {track.code} · {track.name}
                  </p>
                ) : null}
                {session.description ? (
                  <p className="asm-body" style={{ marginTop: 8, fontSize: "0.92rem" }}>
                    {session.description}
                  </p>
                ) : null}
              </div>
              <span className="asm-slot-meta">
                {sessionDurationMin(session)} min
                {session.room ? (
                  <>
                    <br />
                    {session.room}
                  </>
                ) : null}
                {session.speakerLabel ? (
                  <>
                    <br />
                    {session.speakerLabel}
                  </>
                ) : null}
              </span>
            </article>
          );
        })}
      </section>

      <section
        className="asm-card is-padded t-mist"
        aria-label="Tracks"
        id="tracks"
      >
        <p className="asm-eyebrow" style={{ marginBottom: 22 }}>
          Tracks
        </p>
        <div
          className="asm-row"
          style={{ ["--cols" as string]: tracks.length, ["--cols-md" as string]: 2 }}
        >
          {tracks.map((track) => (
            <div key={track.code} style={{ display: "grid", gap: 10 }}>
              <span className="asm-chip">{track.code}</span>
              <h3 className="asm-d3" style={{ fontSize: "1.12rem" }}>
                {track.name}
              </h3>
              <p className="asm-body" style={{ fontSize: "0.9rem" }}>
                {track.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
