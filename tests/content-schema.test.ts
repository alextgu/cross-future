import { expect, it } from "vitest";
import seedAssembly from "../content/seed-assembly.json";
import { summitContentSchema } from "../lib/content-schema";

it("validates the complete Assembly presentation document", () => {
  expect(summitContentSchema.safeParse(seedAssembly).success).toBe(true);
});

it("rejects a document with a missing nested presentation field", () => {
  const malformed = structuredClone(seedAssembly) as Record<string, unknown>;
  const assembly = malformed.assembly as Record<string, unknown>;
  const footerBand = assembly.footerBand as Record<string, unknown>;
  delete footerBand.alt;

  const result = summitContentSchema.safeParse(malformed);
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues.some((issue) => issue.path.join(".") === "assembly.footerBand.alt")).toBe(true);
  }
});

it("rejects duplicate interview slugs", () => {
  const malformed = structuredClone(seedAssembly);
  malformed.interviews[1].slug = malformed.interviews[0].slug;

  const result = summitContentSchema.safeParse(malformed);
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(
      result.error.issues.some(
        (issue) => issue.path.join(".") === "interviews.1.slug"
      )
    ).toBe(true);
  }
});

it("rejects a non-string festival highlight", () => {
  const malformed = structuredClone(seedAssembly) as Record<string, unknown>;
  const assembly = malformed.assembly as Record<string, unknown>;
  const pastEditions = assembly.pastEditions as Record<string, unknown>[];
  pastEditions[0].highlights = [42];

  const result = summitContentSchema.safeParse(malformed);
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(
      result.error.issues.some(
        (issue) => issue.path.join(".") === "assembly.pastEditions.0.highlights.0"
      )
    ).toBe(true);
  }
});
