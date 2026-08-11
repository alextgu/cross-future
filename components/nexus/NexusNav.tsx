"use client";

import { useEffect, useState } from "react";

export const NEXUS_SECTIONS = [
  { num: "01", label: "Manifesto", id: "manifesto" },
  { num: "02", label: "Curriculum", id: "curriculum" },
  { num: "03", label: "Faculty", id: "faculty" },
  { num: "04", label: "Interviews", id: "interviews" },
  { num: "05", label: "Register", id: "register" },
  { num: "06", label: "Archives", id: "archives" },
] as const;

export default function NexusNav({ year }: { year: number }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = NEXUS_SECTIONS.map((s) =>
      document.getElementById(s.id)
    ).filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="nx-nav" aria-label="Primary">
      <div className="nx-container nx-nav-inner">
        <a className="nx-wordmark" href="#top">
          CROSS—FUTURE / {year}
        </a>
        <div className="nx-nav-links">
          {NEXUS_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
            >
              {s.num} — {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
