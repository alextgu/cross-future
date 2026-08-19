"use client";

import { useRef, useState } from "react";

export interface AsmAgendaItem {
  id: string;
  code: string;
  category: string;
  time: string;
  title: string;
  speaker?: string;
  description?: string;
  outcomes: string[];
  duration: string;
  room: string | null;
}

export default function AsmAgendaStrip({
  items,
  provisional,
}: {
  items: AsmAgendaItem[];
  provisional: boolean;
}) {
  const stripRef = useRef<HTMLUListElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  function page(direction: -1 | 1) {
    const strip = stripRef.current;
    const firstCard = strip?.querySelector<HTMLElement>(".asm-agenda-card");
    if (!strip) return;
    strip.scrollBy({
      left: direction * ((firstCard?.offsetWidth ?? 340) + 10),
      behavior: "smooth",
    });
  }

  return (
    <section className="asm-card t-plain asm-agenda" aria-label="Schedule">
      <div className="asm-agenda-toolbar">
        <div>
          <span className={`asm-chip${provisional ? "" : " is-solid"}`}>
            {provisional ? "Upcoming" : "Confirmed"}
          </span>
          <p className="asm-meta">
            {items.length} {items.length === 1 ? "session" : "sessions"} · swipe or use controls
          </p>
        </div>
        <div className="asm-agenda-controls" aria-label="Agenda scroll controls">
          <button type="button" aria-label="Previous session" onClick={() => page(-1)}>
            ←
          </button>
          <button type="button" aria-label="Next session" onClick={() => page(1)}>
            →
          </button>
        </div>
      </div>

      <ul className="asm-agenda-strip" ref={stripRef}>
        {items.map((item, index) => {
          const isOpen = openId === item.id;
          return (
            <li className={`asm-agenda-card${isOpen ? " is-open" : ""}`} key={item.id}>
              <div className="asm-agenda-card-top">
                <span className="asm-meta">{item.code}</span>
                <span className="asm-meta">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p className="asm-agenda-time">{item.time}</p>
              <p className="asm-eyebrow is-bare">{item.category}</p>
              <h3 className="asm-d3">{item.title}</h3>
              {item.speaker ? <p className="asm-body">— {item.speaker}</p> : null}

              {isOpen ? (
                <div className="asm-agenda-detail">
                  {item.description ? <p className="asm-body">{item.description}</p> : null}
                  {item.outcomes.length > 0 ? (
                    <ul>
                      {item.outcomes.map((outcome) => (
                        <li key={outcome}>{outcome}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="asm-meta">
                    {item.duration}
                    {item.room ? ` · ${item.room}` : ""}
                  </p>
                </div>
              ) : null}

              <button
                className="asm-agenda-toggle"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                {isOpen ? "Collapse —" : "View details +"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
