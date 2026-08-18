import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const routes = [
  ["app/page.tsx", "/"],
  ["app/about/page.tsx", "/about"],
  ["app/speakers/page.tsx", "/speakers"],
  ["app/agenda/page.tsx", "/agenda"],
  ["app/media/page.tsx", "/media"],
  ["app/partners/page.tsx", "/partners"],
  ["app/register/page.tsx", "/register"],
  ["app/contact/page.tsx", "/contact"],
] as const;

it("publishes an absolute base and a route-specific canonical URL", () => {
  expect(readFileSync("app/layout.tsx", "utf8")).toContain("metadataBase:");
  for (const [file, route] of routes) {
    expect(readFileSync(file, "utf8"), file).toContain(
      `alternates: { canonical: "${route}" }`
    );
  }
});
