import { expect, it } from "vitest";
import { legacyRedirects } from "../next.config";

it("redirects every legacy design entry point to the canonical site", () => {
  expect(legacyRedirects).toEqual([
    { source: "/assembly", destination: "/", permanent: true },
    { source: "/about", destination: "/#about", permanent: true },
    { source: "/speakers", destination: "/#faculty", permanent: true },
    { source: "/agenda", destination: "/#agenda", permanent: true },
    { source: "/partners", destination: "/#partners", permanent: true },
    { source: "/contact", destination: "/#contact", permanent: true },
    { source: "/register", destination: "/#contact", permanent: true },
    { source: "/archive", destination: "/past-events", permanent: true },
    { source: "/media", destination: "/past-events", permanent: true },
    { source: "/assembly/about", destination: "/#about", permanent: true },
    { source: "/assembly/speakers", destination: "/#faculty", permanent: true },
    { source: "/assembly/agenda", destination: "/#agenda", permanent: true },
    { source: "/assembly/media", destination: "/past-events", permanent: true },
    { source: "/assembly/partners", destination: "/#partners", permanent: true },
    { source: "/assembly/register", destination: "/#contact", permanent: true },
    { source: "/assembly/contact", destination: "/#contact", permanent: true },
    { source: "/nexus", destination: "/", permanent: true },
  ]);
});

it("does not redirect legacy design asset paths", () => {
  expect(legacyRedirects.some(({ source }) => source.includes(":path"))).toBe(false);
});
