"use client";

import { useMemo, useState } from "react";
import type { InterviewCard } from "@/lib/content";
import AsmInterviews from "./AsmInterviews";

type InterviewYear = "all" | number;

export default function AsmInterviewLibrary({
  cards,
  years,
}: {
  cards: InterviewCard[];
  years: number[];
}) {
  const [year, setYear] = useState<InterviewYear>("all");
  const visibleCards = useMemo(
    () =>
      year === "all"
        ? cards
        : cards.filter((card) => card.interview.editionYear === year),
    [cards, year]
  );

  return (
    <div className="asm-interview-library">
      {years.length > 0 ? (
        <div className="asm-interview-filters" aria-label="Filter interviews by edition">
          <button
            className="asm-interview-filter"
            type="button"
            aria-pressed={year === "all"}
            onClick={() => setYear("all")}
          >
            All recordings
          </button>
          {years.map((filterYear) => (
            <button
              className="asm-interview-filter"
              type="button"
              aria-pressed={year === filterYear}
              onClick={() => setYear(filterYear)}
              key={filterYear}
            >
              {filterYear}
            </button>
          ))}
        </div>
      ) : null}
      <AsmInterviews cards={visibleCards} layout="grid" columns={3} />
    </div>
  );
}
