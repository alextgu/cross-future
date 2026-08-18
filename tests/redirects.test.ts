import { expect, it } from "vitest";
import { legacyRedirects } from "../next.config";

it("redirects every legacy design entry point to the canonical site", () => {
  expect(legacyRedirects).toEqual([
    { source: "/assembly", destination: "/", permanent: true },
    { source: "/assembly/about", destination: "/about", permanent: true },
    { source: "/assembly/speakers", destination: "/speakers", permanent: true },
    { source: "/assembly/agenda", destination: "/agenda", permanent: true },
    { source: "/assembly/media", destination: "/media", permanent: true },
    { source: "/assembly/partners", destination: "/partners", permanent: true },
    { source: "/assembly/register", destination: "/register", permanent: true },
    { source: "/assembly/contact", destination: "/contact", permanent: true },
    { source: "/nexus", destination: "/", permanent: true },
  ]);
});

it("does not redirect legacy design asset paths", () => {
  expect(legacyRedirects.some(({ source }) => source.includes(":path"))).toBe(false);
});
