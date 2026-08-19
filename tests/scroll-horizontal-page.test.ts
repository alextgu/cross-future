import { describe, expect, it } from "vitest";
import { getHorizontalScrollTarget } from "../lib/scroll-horizontal-page";

describe("getHorizontalScrollTarget", () => {
  const page = 800;
  const scrollWidth = 3200;

  it("stays at start when paging left from the first page", () => {
    expect(getHorizontalScrollTarget(0, scrollWidth, page, -1)).toBe(0);
  });

  it("advances one page to the right from the start", () => {
    expect(getHorizontalScrollTarget(0, scrollWidth, page, 1)).toBe(800);
  });

  it("returns to the first page from a snapped position past the boundary", () => {
    expect(getHorizontalScrollTarget(801, scrollWidth, page, -1)).toBe(0);
  });

  it("steps back one page from the third page", () => {
    expect(getHorizontalScrollTarget(1600, scrollWidth, page, -1)).toBe(800);
  });

  it("does not scroll past the end", () => {
    const maxScroll = scrollWidth - page;
    expect(getHorizontalScrollTarget(maxScroll, scrollWidth, page, 1)).toBe(
      maxScroll
    );
  });
});
