import { expect, it } from "vitest";
import seed from "../content/seed-assembly.json";

it("uses canonical page links in primary homepage calls to action", () => {
  /* The feature tile points at the interview rail on the home page, and the
     ticket tile leaves for the ticketing host directly, since the register
     route it used to hop through no longer exists. */
  expect(seed.assembly.rail.feature.ctaHref).toBe("/#interviews");
  expect(seed.assembly.rail.ticket.ctaHref).toBe(
    "https://www.eventgo.ai/event/1000909471805"
  );
});

it("backs the hero slot with a real clip, not a placeholder", () => {
  expect(seed.assembly.heroMedia.kind).toBe("video");
  expect(seed.assembly.heroMedia.src).toBe("/summit/video/hero-loop.mp4");
  /* A poster is what stands in while the clip loads or when autoplay is
     refused, so the hero cannot render as an empty dark card. */
  expect(seed.assembly.heroMedia.poster).toBe("/summit/media/hero-poster.jpg");
  expect("placeholder" in seed.assembly.heroMedia).toBe(false);
});

it("uses the canonical summit asset namespace", () => {
  expect(JSON.stringify(seed).includes('"/assembly/')).toBe(false);
  expect(JSON.stringify(seed).includes('"/summit/')).toBe(true);
});
