import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const routes = [
  ["app/page.tsx", "/"],
  ["app/past-events/page.tsx", "/past-events"],
] as const;

it("publishes an absolute base and a route-specific canonical URL", () => {
  expect(readFileSync("app/layout.tsx", "utf8")).toContain("metadataBase:");
  for (const [file, route] of routes) {
    expect(readFileSync(file, "utf8"), file).toContain(
      `alternates: { canonical: "${route}" }`
    );
  }
});
