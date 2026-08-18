import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const activeCss = readFileSync("app/assembly/assembly.css", "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

describe("the active design system", () => {
  it("uses only grayscale six-digit hex literals", () => {
    const literals = [...activeCss.matchAll(/#[0-9a-f]{6}\b/gi)].map(
      ([value]) => value.toLowerCase(),
    );
    const nonGray = literals.filter((value) => {
      const red = value.slice(1, 3);
      const green = value.slice(3, 5);
      const blue = value.slice(5, 7);
      return red !== green || green !== blue;
    });

    expect(nonGray).toEqual([]);
  });
});
