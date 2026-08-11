"use client";

import { useState } from "react";
import type { AppearanceCategory, FacultyMember } from "@/lib/content";
import { sectionNum } from "@/lib/sections";

const CATEGORIES: { key: AppearanceCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "research", label: "Research" },
  { key: "industry", label: "Industry" },
  { key: "ecosystem", label: "Ecosystem" },
];

export default function Faculty({ faculty }: { faculty: FacultyMember[] }) {
  const [filter, setFilter] = useState<AppearanceCategory | "all">("all");

  const counts = new Map<string, number>([["all", faculty.length]]);
  for (const member of faculty) {
    counts.set(member.category, (counts.get(member.category) ?? 0) + 1);
  }

  const visible =
    filter === "all" ? faculty : faculty.filter((m) => m.category === filter);

  return (
    <section className="section" id="faculty" aria-labelledby="faculty-h">
      <div className="container">
        <div className="section-mark">
          <span className="num">{sectionNum("faculty")}</span>
          <h2 id="faculty-h">Faculty</h2>
        </div>

        <div className="faculty-filters" role="group" aria-label="Filter faculty by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className="filter-chip"
              aria-pressed={filter === cat.key}
              onClick={() => setFilter(cat.key)}
            >
              {cat.label}
              <span className="count">{counts.get(cat.key) ?? 0}</span>
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="faculty-empty">No faculty in this category yet.</p>
        ) : (
          <ul className="faculty-grid">
            {visible.map((member) => {
              const fullName = `${member.person.firstName} ${member.person.lastName}`;
              return (
                <li key={member.person.slug} className="faculty-card">
                  <img
                    className="headshot"
                    src={member.person.headshot.sourceUrl}
                    alt={member.person.headshot.alt}
                    width={400}
                    height={400}
                    loading="lazy"
                    style={{
                      objectPosition: `${member.person.headshot.focalPoint.x * 100}% ${member.person.headshot.focalPoint.y * 100}%`,
                    }}
                  />
                  <div>
                    <h3 className="faculty-name">
                      {member.safeLink ? (
                        <a href={member.safeLink.url} rel="noopener noreferrer">
                          {fullName}
                        </a>
                      ) : (
                        fullName
                      )}
                    </h3>
                    <p className="faculty-role">{member.roleTitle}</p>
                    <p className="faculty-org">
                      {member.organizations.map((o) => o.name).join(" · ")}
                    </p>
                  </div>
                  <span className="faculty-cat">{member.category}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
