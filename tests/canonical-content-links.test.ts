import { expect, it } from "vitest";
import seed from "../content/seed-assembly.json";

it("uses canonical page links in primary homepage calls to action", () => {
  expect(seed.assembly.rail.feature.ctaHref).toBe("/agenda");
  expect(seed.assembly.rail.ticket.ctaHref).toBe("/register");
});

it("uses the canonical summit asset namespace", () => {
  expect(JSON.stringify(seed).includes('"/assembly/')).toBe(false);
  expect(JSON.stringify(seed).includes('"/summit/')).toBe(true);
});
