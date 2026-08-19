import type { Edition, Session, Track } from "@/lib/content";
import {
  formatEditionDate,
  formatEditionHours,
  formatSessionTime,
  sessionDurationMin,
} from "@/lib/content";
import { ASSEMBLY_REGISTER } from "@/lib/assembly-nav";
import AsmButton from "./AsmButton";
import AsmAgendaStrip, { type AsmAgendaItem } from "./AsmAgendaStrip";

export default function AsmAgenda({
  edition,
  confirmed,
  proposed,
  tracks,
  variant = "full",
}: {
  edition: Edition;
  confirmed: Session[];
  proposed: Session[];
  tracks: Track[];
  /**
   * "full" is the agenda page: the date card, the strip and the track list.
   * "strip" is everywhere else — just the sessions. On the home page the date
   * is already in the facts row above and the tracks are the focus areas, so
   * the full block said each of them twice.
   */
  variant?: "full" | "strip";
}) {
  const published = confirmed.length > 0;
  const rows = published ? confirmed : proposed;
  const trackByCode = new Map(tracks.map((track) => [track.code, track]));
  const items: AsmAgendaItem[] = rows.map((session) => {
    const track = trackByCode.get(session.track);
    return {
      id: session.code ?? session.title,
      code: session.code ?? track?.code ?? "Session",
      category: session.categoryLabel ?? track?.name ?? "Programme",
      time: formatSessionTime(session, edition.timezone),
      title: session.title,
      speaker: session.speakerLabel,
      description: session.description,
      outcomes: session.outcomes ?? [],
      duration: `${sessionDurationMin(session)} min`,
      room: session.room,
    };
  });

  if (variant === "strip") {
    return <AsmAgendaStrip items={items} provisional={!published} />;
  }

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
                : "The structure of the day is fixed. Named sessions and speakers go to registrants first as they are confirmed, then here."}
            </p>
            <AsmButton href={ASSEMBLY_REGISTER} tone="inverse">
              {published ? "Register" : "Get it first — register"}
            </AsmButton>
          </div>
        </div>
      </div>

      <AsmAgendaStrip items={items} provisional={!published} />

      <section className="asm-card is-padded t-mist" aria-label="Tracks" id="tracks">
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
