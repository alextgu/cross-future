import { describe, expect, it } from "vitest";
import seedAssembly from "../content/seed-assembly.json";
import {
  getCompletedPastEditions,
  getCurrentEdition,
  getFaculty,
  getInterviewCardBySlug,
  getInterviewCardsForEditionYear,
  getInterviewYears,
  type SummitContent,
} from "../lib/content";

const content = seedAssembly as unknown as SummitContent;
const current = getCurrentEdition(content);
const faculty = getFaculty(content, current.slug);

describe("progress content", () => {
  it("excludes the current edition from completed festivals", () => {
    expect(getCompletedPastEditions(content).map((item) => item.year)).toEqual([
      2025,
      2024,
    ]);
  });

  it("resolves interviews by a stable unique slug", () => {
    const first = content.interviews?.[0];
    expect(first).toBeDefined();
    expect(
      getInterviewCardBySlug(content, faculty, first!.slug)?.interview.code
    ).toBe(first!.code);
  });

  it("does not invent edition groupings for unmapped interviews", () => {
    expect(getInterviewYears(content)).toEqual([]);
    expect(getInterviewCardsForEditionYear(content, faculty, 2025)).toEqual([]);
  });
});
