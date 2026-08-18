import { describe, expect, it } from "vitest";
import {
  ASSEMBLY_BAR_ROUTES,
  ASSEMBLY_BASE,
  ASSEMBLY_HOME,
  ASSEMBLY_MORE_ROUTES,
  ASSEMBLY_REGISTER,
  ASSEMBLY_ROUTES,
  ASSEMBLY_RSVP_URL,
  isCurrentRoute,
} from "../lib/assembly-nav";

describe("canonical navigation", () => {
  it("keeps every public destination at the site root", () => {
    expect(ASSEMBLY_BASE).toBe("");
    expect(ASSEMBLY_HOME).toBe("/");
    expect(ASSEMBLY_REGISTER).toBe("/register");
    expect(ASSEMBLY_ROUTES.map((route) => route.href)).toEqual([
      "/",
      "/speakers",
      "/agenda",
      "/partners",
      "/contact",
      "/about",
      "/media",
    ]);
  });

  it("puts the live site's five labels in the bar and the rest under More", () => {
    expect(ASSEMBLY_BAR_ROUTES.map((route) => route.label)).toEqual([
      "Home",
      "Speakers",
      "Agenda",
      "Partners",
      "Contact",
    ]);
    expect(ASSEMBLY_MORE_ROUTES.map((route) => route.label)).toEqual([
      "About",
      "Media",
    ]);
    /* Every route is reachable from exactly one of the two groups. */
    expect(ASSEMBLY_BAR_ROUTES.length + ASSEMBLY_MORE_ROUTES.length).toBe(
      ASSEMBLY_ROUTES.length,
    );
  });

  it("sends the chrome call-to-action to the external ticketing page", () => {
    expect(ASSEMBLY_RSVP_URL).toBe(
      "https://www.eventgo.ai/event/1000909471805",
    );
  });

  it("matches home exactly and inner routes by prefix", () => {
    expect(isCurrentRoute("/", "/")).toBe(true);
    expect(isCurrentRoute("/", "/agenda")).toBe(false);
    expect(isCurrentRoute("/speakers", "/speakers/person")).toBe(true);
  });
});
