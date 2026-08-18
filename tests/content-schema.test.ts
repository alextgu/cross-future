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
