import { expect, it } from "vitest";
import { legacyRedirects } from "../next.config";

it("redirects every legacy design entry point to the canonical site", () => {
  expect(legacyRedirects).toEqual([
    { source: "/assembly", destination: "/", permanent: true },
    { source: "/assembly/:path*", destination: "/:path*", permanent: true },
    { source: "/nexus", destination: "/", permanent: true },
    { source: "/nexus/:path*", destination: "/", permanent: true },
  ]);
});
