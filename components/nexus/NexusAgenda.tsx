"use client";

import { useRef, useState } from "react";
import type { Edition, Session } from "@/lib/content";

function formatTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(new Date(iso));
}

/**
 * Full-bleed horizontal snap strip of sessions. EXPAND widens a card and
 * reveals its description and learning outcomes; − / + page the strip.
 */
export default function NexusAgenda({
  edition,
  sessions,
}: {
  edition: Edition;
  sessions: Session[];
}) {
  const stripRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<string | null>(null);

  function page(direction: 1 | -1) {
    const strip = stripRef.current;
    if (!strip) return;
    const card = strip.querySelector<HTMLElement>(".nx-session");
    const step = card ? card.offsetWidth + 1 : 360;
    strip.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  }

  return (
    <section className="nx-section" id="curriculum" aria-labelledby="nx-agenda-h">
      <div className="nx-container">
        <div className="nx-section-head">
          <div>
            <p className="nx-seclabel">§ 02 / CURRICULUM</p>
            <h2 className="nx-h2" id="nx-agenda-h">
              The Agenda
            </h2>
          </div>
          <div className="nx-agenda-controls">
            <button type="button" aria-label="Scroll agenda backward" onClick={() => page(-1)}>
              −
            </button>
            <button type="button" aria-label="Scroll agenda forward" onClick={() => page(1)}>
              +
            </button>
          </div>
        </div>
      </div>

      <div className="nx-container">
        <ul className="nx-agenda-strip" ref={stripRef} aria-label="Summit schedule">
          {sessions.map((session) => {
            const id = session.code ?? session.title;
            const isOpen = open === id;
            return (
              <li key={id} className={`nx-session${isOpen ? " is-open" : ""}`}>
                <div className="nx-session-head">
                  <span className="code">{session.code}</span>
                  <span className="cat">{session.categoryLabel}</span>
                </div>
                <div className="nx-session-body">
                  <span className="time">
                    {formatTime(session.startsAt, edition.timezone)} · MTL
                  </span>
                  <h3>{session.title}</h3>
                  <span className="speaker">— {session.speakerLabel}</span>
                  {isOpen ? (
                    <div className="nx-session-detail">
                      {session.description ? <p>{session.description}</p> : null}
                      {session.outcomes && session.outcomes.length > 0 ? (
                        <>
                          <span className="outcomes-label">Learning outcomes</span>
                          <ul>
                            {session.outcomes.map((outcome) => (
                              <li key={outcome}>{outcome}</li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="nx-session-toggle"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : id)}
                  >
                    {isOpen ? "— Collapse" : "+ Expand"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
