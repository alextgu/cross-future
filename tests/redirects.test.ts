import { expect, it } from "vitest";
import { legacyRedirects } from "../next.config";

it("redirects every legacy design entry point to the canonical site", () => {
  expect(legacyRedirects).toEqual([
    { source: "/assembly", destination: "/", permanent: true },
    { source: "/about", destination: "/#about", permanent: true },
    { source: "/agenda", destination: "/program", permanent: true },
    { source: "/partners", destination: "/#partners", permanent: true },
    { source: "/contact", destination: "/#contact", permanent: true },
    { source: "/register", destination: "/#contact", permanent: true },
    {
      source: "/interviews",
      destination: "/speakers#interviews",
      permanent: true,
    },
    {
      source: "/archive",
      destination: "/speakers#interviews",
      permanent: true,
    },
    {
      source: "/media",
      destination: "/speakers#interviews",
      permanent: true,
    },
    { source: "/assembly/about", destination: "/#about", permanent: true },
    { source: "/assembly/speakers", destination: "/speakers", permanent: true },
    { source: "/assembly/agenda", destination: "/program", permanent: true },
    {
      source: "/assembly/media",
      destination: "/speakers#interviews",
      permanent: true,
    },
    { source: "/assembly/partners", destination: "/#partners", permanent: true },
    { source: "/assembly/register", destination: "/#contact", permanent: true },
    { source: "/assembly/contact", destination: "/#contact", permanent: true },
    { source: "/nexus", destination: "/", permanent: true },
  ]);
});

it("leaves canonical event pages available as real routes", () => {
  expect(
    legacyRedirects.some(({ source }) =>
      ["/", "/speakers", "/program", "/past-events"].includes(source)
    )
  ).toBe(false);
});

it("does not redirect legacy design asset paths", () => {
  expect(legacyRedirects.some(({ source }) => source.includes(":path"))).toBe(false);
});
