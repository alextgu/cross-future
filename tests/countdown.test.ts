import { expect, it } from "vitest";
import { partsUntil } from "../lib/countdown";

it("splits the remaining duration into bounded countdown parts", () => {
  expect(partsUntil(90_061_000, 0)).toEqual({ d: 1, h: 1, m: 1, s: 1 });
});

it("never returns negative parts after the event begins", () => {
  expect(partsUntil(0, 1)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
});
