import type { Edition, Session, Track } from "@/lib/content";

function formatTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date(iso));
}

/**
 * Derived behaviour: with zero confirmed sessions this renders a designed
 * empty state. The moment one confirmed session exists in the content
 * source, the real schedule renders instead. Nothing here is hardcoded
 * to the current state of seed.json.
 */
export default function Agenda({
  edition,
  confirmedSessions,
  tracks,
}: {
  edition: Edition;
  confirmedSessions: Session[];
  tracks: Track[];
}) {
  return (
    <section className="section" id="agenda" aria-labelledby="agenda-h">
      <div className="container">
        <div className="section-mark">
          <span className="num" aria-hidden="true">
            ··
          </span>
          <h2 id="agenda-h">Agenda</h2>
        </div>

        {confirmedSessions.length === 0 ? (
          <div className="agenda-empty">
            <span className="chip">Schedule not yet published</span>
            <p>
              Sessions are being confirmed across all {tracks.length} tracks. The
              full schedule goes to registrants first — leave your details below
              and it lands in your inbox before it lands here.
            </p>
            <ul className="track-codes" aria-label="Confirmed tracks">
              {tracks.map((track) => (
                <li key={track.code}>
                  <span className="code">{track.code}</span>
                  {track.name}
                </li>
              ))}
            </ul>
            <a className="btn btn-primary" href="#register">
              Get the schedule first
            </a>
          </div>
        ) : (
          <ul className="schedule">
            {confirmedSessions.map((session) => (
              <li key={`${session.startsAt}-${session.title}`} className="schedule-row">
                <span className="schedule-time">
                  {formatTime(session.startsAt, edition.timezone)}–
                  {formatTime(session.endsAt, edition.timezone)}
                </span>
                <span className="schedule-track">{session.track}</span>
                <span className="schedule-title">{session.title}</span>
                <span className="schedule-room">{session.room ?? "Room TBA"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
